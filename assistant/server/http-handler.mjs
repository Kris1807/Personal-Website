import { getServerConfig, isAllowedOrigin } from "./config.mjs";
import { answerPortfolioQuestion } from "./engine.mjs";
import { unavailableReply, rateLimitReply, timeoutReply, validationReply } from "./messages.mjs";
import { checkRateLimit } from "./rate-limit.mjs";
import { AssistantValidationError, parseAssistantRequest } from "./validation.mjs";

function getHeader(headers, key) {
  if (!headers) return "";
  if (typeof headers.get === "function") return headers.get(key) || "";
  return headers[key] || headers[key.toLowerCase()] || "";
}

function getClientIp(headers, remoteAddress = "anonymous") {
  const forwarded = String(getHeader(headers, "x-forwarded-for") || "").split(",")[0].trim();
  return forwarded || remoteAddress || "anonymous";
}

function buildCorsHeaders(origin, config) {
  const allowOrigin = origin && isAllowedOrigin(origin, config) ? origin : config.allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function jsonResponse(status, body, origin, config, extraHeaders = {}) {
  return {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...buildCorsHeaders(origin, config),
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

export async function handleAssistantHttpRequest({ method, headers, bodyText = "", remoteAddress = "anonymous" }) {
  const config = getServerConfig();
  const origin = getHeader(headers, "origin");

  if (method === "OPTIONS") {
    return {
      status: 204,
      headers: buildCorsHeaders(origin, config),
      body: ""
    };
  }

  if (method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" }, origin, config);
  }

  if (origin && !isAllowedOrigin(origin, config)) {
    return jsonResponse(403, { error: "Origin not allowed" }, origin, config);
  }

  if (Buffer.byteLength(String(bodyText ?? ""), "utf8") > config.maxBodyBytes) {
    return jsonResponse(413, { error: validationReply("MESSAGE_TOO_LONG", "en") }, origin, config);
  }

  let payload;
  try {
    payload = JSON.parse(String(bodyText || "{}"));
  } catch (_error) {
    return jsonResponse(400, { error: validationReply("INVALID_BODY", "en") }, origin, config);
  }

  const languageHint = payload?.language === "he" ? "he" : "en";
  const limitState = checkRateLimit({
    key: getClientIp(headers, remoteAddress),
    limit: config.rateLimitMax,
    windowMs: config.rateLimitWindowMs
  });

  if (!limitState.allowed) {
    return jsonResponse(
      429,
      { error: rateLimitReply(languageHint) },
      origin,
      config,
      { "Retry-After": String(Math.ceil(limitState.retryAfterMs / 1000)) }
    );
  }

  let request;
  try {
    request = parseAssistantRequest(payload, config);
  } catch (error) {
    if (error instanceof AssistantValidationError) {
      return jsonResponse(error.status, { error: validationReply(error.code, languageHint) }, origin, config);
    }
    return jsonResponse(400, { error: validationReply("INVALID_BODY", languageHint) }, origin, config);
  }

  try {
    const response = await answerPortfolioQuestion(request);
    return jsonResponse(200, response, origin, config);
  } catch (error) {
    const isTimeout = error?.name === "AbortError" || error?.code === "ETIMEDOUT";
    return jsonResponse(
      isTimeout ? 504 : 503,
      { error: isTimeout ? timeoutReply(request.language) : unavailableReply(request.language) },
      origin,
      config
    );
  }
}

async function readBody(request, limit) {
  return await new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request body exceeded allowed size."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

export function createNodeRequestHandler() {
  const config = getServerConfig();

  return async function nodeRequestHandler(request, response) {
    try {
      const bodyText = await readBody(request, config.maxBodyBytes);
      const result = await handleAssistantHttpRequest({
        method: request.method,
        headers: request.headers,
        bodyText,
        remoteAddress: request.socket?.remoteAddress || "anonymous"
      });

      response.writeHead(result.status, result.headers);
      response.end(result.body);
    } catch (_error) {
      const origin = request.headers.origin || "";
      const payload = jsonResponse(500, { error: unavailableReply("en") }, origin, config);
      response.writeHead(payload.status, payload.headers);
      response.end(payload.body);
    }
  };
}
