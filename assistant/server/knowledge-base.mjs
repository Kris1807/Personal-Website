import { readFileSync } from "node:fs";

const compiledKnowledgeUrl = new URL("../knowledge/compiled-knowledge.json", import.meta.url);
const sourceCatalogUrl = new URL("../knowledge/source-catalog.json", import.meta.url);

let cachedKnowledge = null;

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((entry) => entry.length > 1);
}

function hydrateEntry(entry) {
  const searchEn = [entry.title, entry.content_en, ...(entry.keywords_en || [])].join(" ");
  const searchHe = [entry.title, entry.content_he, ...(entry.keywords_he || [])].join(" ");

  return {
    ...entry,
    search_en: normalizeText(searchEn),
    search_he: normalizeText(searchHe),
    tokens_en: tokenize(searchEn),
    tokens_he: tokenize(searchHe),
    tokens_all: tokenize(`${searchEn} ${searchHe}`)
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
