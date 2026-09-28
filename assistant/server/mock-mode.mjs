import { getSuggestedFollowUps, unsupportedReply } from "./messages.mjs";
import { resolveSources } from "./knowledge-base.mjs";

function pickCategory(entries) {
  return entries[0]?.category || "general";
}

function content(entry, language) {
  return String(language === "he" ? entry.content_he || entry.content_en : entry.content_en || entry.content_he).trim();
}

function buildMockAnswer(entry, language, intent) {
  if (intent === "technologies" && entry.technologies?.length) {
    return language === "he"
      ? `${entry.title} נבנה עם ${entry.technologies.join(", ")}.`
      : `${entry.title} uses ${entry.technologies.join(", ")}.`;
  }
  if (intent === "date" && entry.dates?.length) {
    return language === "he"
      ? `השנה הרלוונטית היא ${entry.dates[0]}.`
      : `The relevant year is ${entry.dates[0]}.`;
  }
  return content(entry, language);
}

export function createMockReply({ language = "en", entries = [], supported = false, intent = "general" }) {
  if (!supported || entries.length === 0) {
    return {
      answer: unsupportedReply(language),
      supported: false,
      language,
      sources: [],
      suggestedFollowUps: getSuggestedFollowUps(language)
    };
  }

  const category = pickCategory(entries);
  const answer = buildMockAnswer(entries[0], language, intent);
  const sourceIds = [entries[0].source_id].filter(Boolean);

  return {
    answer,
    supported: true,
    language,
    sources: resolveSources(sourceIds, language),
    suggestedFollowUps: getSuggestedFollowUps(language, category).slice(0, 2)
  };
}
