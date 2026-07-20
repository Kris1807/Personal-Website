export class AssistantApiError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = "AssistantApiError";
    this.code = code;
    this.status = status;
  }
}

function validateResponseShape(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AssistantApiError("INVALID_RESPONSE", "Invalid assistant response.", 502);
  }

  if (typeof payload.answer !== "string" || typeof payload.supported !== "boolean") {
    throw new AssistantApiError("INVALID_RESPONSE", "Invalid assistant response.", 502);
  }

  return {
    answer: payload.answer,
    supported: payload.supported,
    language: payload.language === "he" ? "he" : "en",
    sources: Array.isArray(payload.sources) ? payload.sources : [],
    suggestedFollowUps: Array.isArray(payload.suggestedFollowUps) ? payload.suggestedFollowUps : []
  };
}

export class AssistantApiClient {
  constructor({ apiUrl = "" } = {}) {
    this.apiUrl = String(apiUrl || "").trim();
  }

  hasEndpoint() {
    return Boolean(this.apiUrl);
  }

  async ask(payload) {
    if (!this.hasEndpoint()) {
      throw new AssistantApiError("UNCONFIGURED", "Assistant endpoint not configured.", 503);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 18000);

    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      let body = {};
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (_error) {
          throw new AssistantApiError("INVALID_RESPONSE", "Assistant returned invalid JSON.", 502);
        }
      }

      if (!response.ok) {
        throw new AssistantApiError(
          response.status === 429 ? "RATE_LIMITED" : response.status === 504 ? "TIMEOUT" : "REQUEST_FAILED",
          String(body.error || "Assistant request failed."),
          response.status
        );
      }

      return validateResponseShape(body);
    } catch (error) {
      if (error instanceof AssistantApiError) throw error;
      if (error?.name === "AbortError") {
        throw new AssistantApiError("TIMEOUT", "Assistant request timed out.", 504);
      }
      throw new AssistantApiError("NETWORK", "Assistant request failed.", 503);
    } finally {
      window.clearTimeout(timeout);
    }
  }
}
