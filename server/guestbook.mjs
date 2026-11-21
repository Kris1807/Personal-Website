import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";

export const NOTE_TTL_MS = 14 * 24 * 60 * 60 * 1000;
export const BOARD_CAPACITY = 96;
const POST_INTERVAL_SECONDS = 120;
const INDEX = "museum:guestbook:v1:index";
const NOTE_PREFIX = "museum:guestbook:v1:note:";
const RATE_PREFIX = "museum:guestbook:v1:post:";

// Check capacity and the posting cooldown in the same atomic write as the note.
const POST_NOTE = `
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', ARGV[1])
if redis.call('ZCARD', KEYS[1]) >= tonumber(ARGV[2]) then return 'full' end
if not redis.call('SET', KEYS[3], '1', 'NX', 'EX', ARGV[3]) then return 'limited' end
redis.call('SET', KEYS[2], ARGV[4], 'PX', ARGV[5])
redis.call('ZADD', KEYS[1], ARGV[6], KEYS[2])
redis.call('PEXPIRE', KEYS[1], ARGV[5])
return 'created'
`;

class RedisGuestbookError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function normalizeCredential(value) {
  const trimmed = value?.trim() || "";
  if (trimmed.length >= 2 && ['"', "'"].includes(trimmed[0]) && trimmed[0] === trimmed.at(-1)) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function createRedisGuestbook({ url, token, fetchImpl = fetch, now = Date.now }) {
  url = normalizeCredential(url);
  token = normalizeCredential(token);
  if (!url || !token) return null;
  let endpoint;
  try { endpoint = new URL(url); }
  catch { throw new RedisGuestbookError("invalid_rest_url"); }
  if (endpoint.protocol !== "https:" || endpoint.pathname !== "/" || endpoint.search ||
      endpoint.hash || endpoint.username || endpoint.password || endpoint.port) {
    throw new RedisGuestbookError("invalid_rest_url");
  }
  if (!/^[!-~]+$/.test(token)) throw new RedisGuestbookError("invalid_rest_token_format");

  async function command(args) {
    let response;
    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: AbortSignal.timeout(5000),
        redirect: "error",
      });
    } catch (error) {
      throw new RedisGuestbookError(error?.name === "TimeoutError" ? "rest_timeout" : "rest_connection_failed");
    }
    if (!response.ok) throw new RedisGuestbookError(`rest_http_${response.status}`);
    const data = await response.json().catch(() => null);
    if (!data || typeof data !== "object") throw new RedisGuestbookError("invalid_rest_response");
    if (data.error || !Object.hasOwn(data, "result")) {
      const code = /^(WRONGPASS|NOAUTH|NOPERM)\b/i.test(data.error) ? "rest_auth_rejected" : "rest_command_rejected";
      throw new RedisGuestbookError(code);
    }
    return data.result;
  }

  return {
    async list() {
      const keys = await command(["ZREVRANGEBYSCORE", INDEX, "+inf", `(${now()}`, "LIMIT", 0, BOARD_CAPACITY]);
      if (!keys.length) return [];
      const values = await command(["MGET", ...keys]);
      const cutoff = now();
      return values.flatMap(value => {
        if (!value) return [];
        const note = JSON.parse(value);
        return note.expiresAt > cutoff ? [note] : [];
      });
    },
    async publish(note, client) {
      // Store neither the IP address nor a long-lived visitor identifier.
      const fingerprint = createHmac("sha256", token).update("museum guestbook\0").update(client).digest("hex");
      return command(["EVAL", POST_NOTE, 3, INDEX, NOTE_PREFIX + note.id, RATE_PREFIX + fingerprint,
        note.createdAt, BOARD_CAPACITY, POST_INTERVAL_SECONDS, JSON.stringify(note), NOTE_TTL_MS, note.expiresAt]);
    },
  };
}

function cleanInput(body) {
  if (!body || typeof body !== "object" || typeof body.message !== "string" ||
      (body.name !== undefined && typeof body.name !== "string")) return null;
  const message = body.message.trim().replace(/\r\n?/g, "\n");
  const name = (body.name ?? "").trim().replace(/\s+/g, " ");
  if (!message || message.length > 400 || name.length > 32) return null;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(message + name)) return null;
  if (/(?:https?:\/\/|www\.)/i.test(message + " " + name)) return null;
  return { name: name || "Anonymous visitor", message };
}

function requestClient(request) {
  const forwarded = process.env.VERCEL === "1"
    ? request.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim()
    : null;
  if (isIP(forwarded ?? "")) return forwarded;
  return request.socket?.remoteAddress || "unknown";
}

function fromAnotherSite(request) {
  const { origin, host } = request.headers;
  if (request.headers["sec-fetch-site"] === "cross-site") return true;
  if (!origin) return false;
  try { return new URL(origin).host !== host; }
  catch { return true; }
}

export function createGuestbookHandler({ getStore, now = Date.now } = {}) {
  return async (request, response) => {
    const send = (status, payload) => {
      response.statusCode = status;
      response.setHeader("Content-Type", "application/json; charset=utf-8");
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.end(JSON.stringify(payload));
    };

    if (!["GET", "POST"].includes(request.method)) {
      response.setHeader("Allow", "GET, POST");
      return send(405, { error: "This method is not supported." });
    }

    let input;
    if (request.method === "POST") {
      if (fromAnotherSite(request)) return send(403, { error: "Open the museum to leave a note." });
      if (!/^application\/json(?:\s*;|$)/i.test(request.headers["content-type"] ?? "")) {
        return send(415, { error: "Please submit your note from the board." });
      }
      if (Number(request.headers["content-length"]) > 4096) return send(413, { error: "That note is too large." });
      try {
        const body = request.body;
        input = cleanInput(typeof body === "string" || Buffer.isBuffer(body) ? JSON.parse(String(body)) : body);
      } catch { /* Report invalid input below. */ }
      if (!input) return send(400, { error: "Write a note of 1–400 characters, use a name of at most 32 characters, and leave out links." });
    }

    try {
      const store = getStore();
      if (!store) return send(503, { error: "The guestbook is not available right now." });
      if (request.method === "GET") {
        const notes = await store.list();
        const cutoff = now();
        return send(200, { notes: notes.filter(note => note.expiresAt > cutoff) });
      }
      const createdAt = now();
      const note = { id: randomUUID(), ...input, createdAt, expiresAt: createdAt + NOTE_TTL_MS };
      const result = await store.publish(note, requestClient(request));
      if (result === "limited") {
        response.setHeader("Retry-After", String(POST_INTERVAL_SECONDS));
        return send(429, { error: "Please wait a couple of minutes before leaving another note." });
      }
      if (result === "full") return send(409, { error: "The board is full. Try again after some notes expire." });
      if (result !== "created") throw new Error("Unexpected guestbook write result.");
      return send(201, { note });
    } catch (error) {
      // Never log messages, IPs, tokens or provider error payloads.
      const code = error instanceof RedisGuestbookError ? error.code : "storage_error";
      console.error("Museum guestbook storage unavailable:", code);
      return send(503, { error: "The guestbook is not available right now. Please try again later." });
    }
  };
}
