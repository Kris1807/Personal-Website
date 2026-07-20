import { getServerConfig } from "./config.mjs";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.mjs";

function extractTextFromResponse(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const fragments = [];
  for (const item of payload?.output || []) {
    for (const part of item?.content || []) {
      if (part?.type === "output_text" && part.text) fragments.push(part.text);
    }
  }

  return fragments.join("\n").trim();
}

export async function requestModelReply({ language, message, history, entries, pageContext }) {
  const config = getServerConfig();
  if (!config.openAiKey) {
    throw Object.assign(new Error("Missing OPENAI_API_KEY"), { code: "MISSING_OPENAI_KEY" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openAiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.15,
        max_output_tokens: config.maxOutputTokens,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: buildSystemPrompt(language) }]
          },
          {
            role: "user",
            content: [{
              type: "input_text",
              text: buildUserPrompt({ language, message, history, entries, pageContext })
            }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const error = new Error(`OpenAI request failed with ${response.status}`);
      error.code = response.status === 429 ? "OPENAI_RATE_LIMIT" : "OPENAI_UPSTREAM_ERROR";
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    const payload = await response.json();
    const text = extractTextFromResponse(payload);
    if (!text) {
      const error = new Error("Model response did not include text.");
      error.code = "EMPTY_OPENAI_RESPONSE";
      throw error;
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}
