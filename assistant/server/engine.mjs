import { getServerConfig } from "./config.mjs";
import { resolveSources } from "./knowledge-base.mjs";
import { createMockReply } from "./mock-mode.mjs";
import { injectionReply, getSuggestedFollowUps, unsupportedReply } from "./messages.mjs";
import { requestModelReply } from "./openai-client.mjs";
import { detectInjectionAttempt, retrieveRelevantEntries } from "./retrieve.mjs";
import { parseModelPayload } from "./validation.mjs";

export async function answerPortfolioQuestion({ language, message, history, pageContext, previousSourceIds }) {
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
      supported: retrieval.supported
    });
  }

  const allowedSourceIds = new Set(retrieval.entries.map((entry) => entry.source_id));

  try {
    const raw = await requestModelReply({
      language,
      message,
      history,
      entries: retrieval.entries,
      pageContext
    });

    const parsed = parseModelPayload(raw, allowedSourceIds, language);
    return {
      ...parsed,
      sources: resolveSources(parsed.sourceIds, language),
      suggestedFollowUps:
        parsed.suggestedFollowUps.length > 0
          ? parsed.suggestedFollowUps
          : getSuggestedFollowUps(language, retrieval.entries[0]?.category)
    };
  } catch (_error) {
    return createMockReply({
      language,
      entries: retrieval.entries,
      supported: retrieval.supported
    });
  }
}
