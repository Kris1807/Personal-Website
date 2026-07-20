import { getSuggestedFollowUps, unsupportedReply } from "./messages.mjs";
import { resolveSources } from "./knowledge-base.mjs";

function pickCategory(entries) {
  return entries[0]?.category || "general";
}

function uniqueTexts(entries, language) {
  const seen = new Set();
  const key = language === "he" ? "content_he" : "content_en";
  return entries
    .map((entry) => String(entry[key] || entry.content_en || "").trim())
    .filter((entry) => {
      if (!entry || seen.has(entry)) return false;
      seen.add(entry);
      return true;
    });
}

export function createMockReply({ language = "en", entries = [], supported = false }) {
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
  const snippets = uniqueTexts(entries.slice(0, 3), language);
  const intro = language === "he"
    ? "לפי המידע המאומת בתיק העבודות של כריס ובמקורות הציבוריים המאושרים, "
    : "Based on Kris’s verified portfolio and approved public sources, ";

  const answer = `${intro}${snippets.join(" ")}`;
  const sourceIds = entries.map((entry) => entry.source_id).filter(Boolean);

  return {
    answer,
    supported: true,
    language,
    sources: resolveSources(sourceIds, language),
    suggestedFollowUps: getSuggestedFollowUps(language, category)
  };
}
