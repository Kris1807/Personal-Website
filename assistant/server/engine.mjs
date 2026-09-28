import { getServerConfig } from "./config.mjs";
import { resolveSources } from "./knowledge-base.mjs";
import { createMockReply } from "./mock-mode.mjs";
import { injectionReply, getSuggestedFollowUps, unsupportedReply } from "./messages.mjs";
import { requestModelReply } from "./openai-client.mjs";
import { detectInjectionAttempt, retrieveRelevantEntries } from "./retrieve.mjs";
import { parseModelPayload } from "./validation.mjs";
import { shapeAnswer } from "./response-shape.mjs";

export async function answerPortfolioQuestion({ language, message, history, pageContext, previousSourceIds }, modelRequester = requestModelReply) {
  const config = getServerConfig();

  if (detectInjectionAttempt(message)) {
    return {
      answer: injectionReply(language),
      supported: false,
      language,
      sources: [],
      suggestedFollowUps: getSuggestedFollowUps(language)
    };
  }

  const retrieval = retrieveRelevantEntries({
    query: message,
    language,
    history,
    pageContext,
    previousSourceIds
  });

  if (!retrieval.supported || retrieval.entries.length === 0) {
    return {
      answer: unsupportedReply(language),
      supported: false,
      language,
      sources: [],
      suggestedFollowUps: getSuggestedFollowUps(language)
    };
  }

  if (config.mockMode) {
    return createMockReply({
      language,
      entries: retrieval.entries,
      supported: retrieval.supported,
      intent: retrieval.intent
    });
  }

  const allowedSourceIds = new Set(retrieval.entries.map((entry) => entry.source_id));

  const raw = await modelRequester({
    language,
    message,
    history,
    entries: retrieval.entries,
    pageContext
  });

  const parsed = parseModelPayload(raw, allowedSourceIds, language);
  return {
    ...parsed,
    answer: shapeAnswer(parsed.answer, message, language),
    sources: resolveSources(parsed.sourceIds, language),
    suggestedFollowUps:
      parsed.suggestedFollowUps.length > 0
        ? parsed.suggestedFollowUps.slice(0, 2)
        : getSuggestedFollowUps(language, retrieval.entries[0]?.category).slice(0, 2)
  };
}
