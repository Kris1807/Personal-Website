const DEFAULT_ALLOWED_ORIGINS = [
  "https://kris1807.github.io",
  "https://krispitshugin.com",
  "https://www.krispitshugin.com",
  "http://localhost:8124",
  "http://127.0.0.1:8124",
  "http://localhost:8788",
  "http://127.0.0.1:8788"
];

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

let cachedConfig = null;

function parseNumber(value, fallback) {
  const next = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(next) && next > 0 ? next : fallback;
}

function parseBoolean(value, fallback = false) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function parseOrigins(input) {
  return String(input ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getServerConfig() {
  if (cachedConfig) return cachedConfig;

  const openAiKey = String(process.env.OPENAI_API_KEY ?? "").trim();
  const mockMode = parseBoolean(process.env.KRIS_ASSISTANT_MOCK_MODE, !openAiKey) || !openAiKey;

  cachedConfig = {
    openAiKey,
    mockMode,
    model: String(process.env.OPENAI_MODEL ?? "gpt-5").trim() || "gpt-5",
    timeoutMs: parseNumber(process.env.KRIS_ASSISTANT_TIMEOUT_MS, 15000),
    maxInputChars: parseNumber(process.env.KRIS_ASSISTANT_MAX_INPUT_CHARS, 700),
    maxTurns: parseNumber(process.env.KRIS_ASSISTANT_MAX_TURNS, 8),
    maxOutputTokens: parseNumber(process.env.KRIS_ASSISTANT_MAX_OUTPUT_TOKENS, 520),
    rateLimitWindowMs: parseNumber(process.env.KRIS_ASSISTANT_RATE_LIMIT_WINDOW_MS, 60000),
    rateLimitMax: parseNumber(process.env.KRIS_ASSISTANT_RATE_LIMIT_MAX, 12),
    maxBodyBytes: parseNumber(process.env.KRIS_ASSISTANT_MAX_BODY_BYTES, 12000),
    allowedOrigins: Array.from(
      new Set([...DEFAULT_ALLOWED_ORIGINS, ...parseOrigins(process.env.KRIS_ASSISTANT_ALLOWED_ORIGINS)])
    )
  };

  return cachedConfig;
}

export function resetServerConfig() {
  cachedConfig = null;
}

export function isAllowedOrigin(origin, config = getServerConfig()) {
  if (!origin) return true;
  if (LOCAL_ORIGIN_PATTERN.test(origin)) return true;
  return config.allowedOrigins.includes(origin);
}
