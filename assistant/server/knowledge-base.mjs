import { readFileSync } from "node:fs";
import { normalizeSearchText, searchTokens } from "./text-normalize.mjs";

const compiledKnowledgeUrl = new URL("../knowledge/compiled-knowledge.json", import.meta.url);
const sourceCatalogUrl = new URL("../knowledge/source-catalog.json", import.meta.url);

let cachedKnowledge = null;

function hydrateEntry(entry) {
  const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
  const topics = Array.isArray(entry.topics) ? entry.topics : [];
  const technologies = Array.isArray(entry.technologies) ? entry.technologies : [];
  const dates = Array.isArray(entry.dates) ? entry.dates : [];
  const keywords = [...(entry.keywords_en || []), ...(entry.keywords_he || [])];
  const searchEn = [entry.title, entry.content_en, ...aliases, ...topics, ...technologies, ...dates, ...(entry.keywords_en || [])].join(" ");
  const searchHe = [entry.title, entry.content_he, ...aliases, ...topics, ...technologies, ...dates, ...(entry.keywords_he || [])].join(" ");

  return {
    ...entry,
    normalized_title: normalizeSearchText(entry.title),
    normalized_aliases: aliases.map(normalizeSearchText).filter(Boolean),
    search_text: normalizeSearchText(`${searchEn} ${searchHe}`),
    search_en: normalizeSearchText(searchEn),
    search_he: normalizeSearchText(searchHe),
    tokens_en: searchTokens(searchEn),
    tokens_he: searchTokens(searchHe),
    tokens_all: searchTokens(`${searchEn} ${searchHe}`),
    tokens_title: searchTokens(entry.title),
    tokens_keywords: searchTokens(keywords.join(" "))
  };
}

export function loadKnowledgeBase() {
  if (cachedKnowledge) return cachedKnowledge;

  const entries = JSON.parse(readFileSync(compiledKnowledgeUrl, "utf8"));
  const sourceCatalog = JSON.parse(readFileSync(sourceCatalogUrl, "utf8"));
  const sourceMap = new Map(sourceCatalog.map((entry) => [entry.id, entry]));

  cachedKnowledge = {
    entries: entries.map(hydrateEntry),
    sourceCatalog,
    sourceMap
  };

  return cachedKnowledge;
}

export function resetKnowledgeBase() {
  cachedKnowledge = null;
}

export function resolveSources(sourceIds, language = "en") {
  const { sourceMap } = loadKnowledgeBase();
  const uniqueIds = Array.from(new Set((sourceIds || []).filter(Boolean)));

  return uniqueIds
    .map((id) => {
      const source = sourceMap.get(id);
      if (!source) return null;
      return {
        id,
        label: language === "he" ? source.label_he : source.label_en,
        section: language === "he" ? source.section_he : source.section_en,
        url: source.url
      };
    })
    .filter(Boolean);
}
