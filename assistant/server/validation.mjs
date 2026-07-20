export class AssistantValidationError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "AssistantValidationError";
    this.status = status;
    this.code = code;
  }
}

const SUPPORTED_LANGUAGES = new Set(["en", "he"]);

function trimString(value) {
  return String(value ?? "").trim();
}

export function parseAssistantRequest(payload, config) {
  if (!payload || typeof payload !== "object") {
    throw new AssistantValidationError(400, "INVALID_BODY", "Invalid request body");
  }

  const language = SUPPORTED_LANGUAGES.has(payload.language) ? payload.language : "en";
  const message = trimString(payload.message);

  if (!message) {
    throw new AssistantValidationError(400, "EMPTY_MESSAGE", "Message is required");
  }

  if (message.length > config.maxInputChars) {
    throw new AssistantValidationError(400, "MESSAGE_TOO_LONG", "Message too long");
  }

  const history = Array.isArray(payload.history)
    ? payload.history
        .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant"))
        .slice(-config.maxTurns)
        .map((entry) => ({
          role: entry.role,
          content: trimString(entry.content).slice(0, config.maxInputChars),
          sourceIds: Array.isArray(entry.sourceIds) ? entry.sourceIds.filter(Boolean).slice(0, 5) : []
        }))
        .filter((entry) => entry.content)
    : [];

  if (Array.isArray(payload.history) && payload.history.length > config.maxTurns) {
    throw new AssistantValidationError(400, "TOO_MANY_TURNS", "Too many turns");
  }

  const pageContext = payload.pageContext && typeof payload.pageContext === "object"
    ? {
        page: trimString(payload.pageContext.page || "").slice(0, 40),
        section: trimString(payload.pageContext.section || payload.pageContext.page || "").slice(0, 40),
        href: trimString(payload.pageContext.href || "").slice(0, 200),
        title: trimString(payload.pageContext.title || "").slice(0, 120)
      }
    : null;

  const previousSourceIds = Array.isArray(payload.previousSourceIds)
    ? payload.previousSourceIds.filter(Boolean).slice(0, 6)
    : [];

  return {
    language,
    message,
    history,
    pageContext,
    previousSourceIds
  };
}

function extractJsonBlock(rawText) {
  const trimmed = String(rawText ?? "").trim();
  if (!trimmed) {
    throw new AssistantValidationError(502, "EMPTY_MODEL_RESPONSE", "Empty model response");
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export function parseModelPayload(rawText, allowedSourceIds, language = "en") {
  let parsed;
  try {
    parsed = JSON.parse(extractJsonBlock(rawText));
  } catch (_error) {
    throw new AssistantValidationError(502, "INVALID_MODEL_JSON", "Model response was not valid JSON");
  }

  const answer = trimString(parsed.answer).slice(0, 2400);
  if (!answer) {
    throw new AssistantValidationError(502, "INVALID_MODEL_ANSWER", "Model response did not include an answer");
  }

  const supported = Boolean(parsed.supported);
  const suggestedFollowUps = Array.isArray(parsed.suggested_follow_ups)
    ? parsed.suggested_follow_ups.map(trimString).filter(Boolean).slice(0, 3)
    : [];

  const sourceIds = Array.isArray(parsed.source_ids)
    ? Array.from(new Set(parsed.source_ids.map(trimString).filter((id) => allowedSourceIds.has(id)))).slice(0, 4)
    : [];

  return {
    answer,
    supported,
    language,
    sourceIds,
    suggestedFollowUps
  };
}
