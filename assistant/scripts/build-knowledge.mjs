import { readFile, writeFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

import { portfolioFirstParty } from "../knowledge/portfolio-first-party.mjs";
import { publicApprovedFacts } from "../knowledge/public-approved.mjs";
import { buildSearchFacts } from "../knowledge/search-facts.mjs";
import { sourceCatalog } from "../knowledge/source-catalog.mjs";

const compiledKnowledgeUrl = new URL("../knowledge/compiled-knowledge.json", import.meta.url);
const sourceCatalogUrl = new URL("../knowledge/source-catalog.json", import.meta.url);
const searchIndexUrl = new URL("../knowledge/search-index.json", import.meta.url);
const resumeContentUrl = new URL("../../resume-content.js", import.meta.url);

const entries = [...portfolioFirstParty, ...publicApprovedFacts];

function assert(condition, message) {
  if (!condition) throw new Error(`Knowledge build failed: ${message}`);
}

const resumeSource = await readFile(resumeContentUrl, "utf8");
const resumeSandbox = {};
runInNewContext(resumeSource, resumeSandbox, { filename: "resume-content.js" });
const resume = resumeSandbox.resume;
assert(resume && Array.isArray(resume.projects), "resume-content.js did not expose project data");

const entryIds = new Set();
const sourceIds = new Set(sourceCatalog.map((source) => source.id));
for (const entry of entries) {
  assert(entry.id && !entryIds.has(entry.id), `duplicate or missing entry id: ${entry.id || "(empty)"}`);
  entryIds.add(entry.id);
  assert(sourceIds.has(entry.source_id), `${entry.id} references unknown source ${entry.source_id}`);
  assert(String(entry.title || "").trim(), `${entry.id} is missing a title`);
  assert(String(entry.content_en || "").trim(), `${entry.id} is missing English content`);
  assert(String(entry.content_he || "").trim(), `${entry.id} is missing Hebrew content`);
}

const cinema = resume.projects.find((project) => project.name === "Cinema Ticketing Website");
const filmHub = entries.find((entry) => entry.id === "portfolio-project-cinema");
assert(cinema, "Cinema Ticketing Website is missing from resume-content.js");
assert(filmHub, "Film-Hub knowledge entry is missing");
for (const technology of cinema.stack || []) {
  assert(
    (filmHub.technologies || []).includes(technology),
    `Film-Hub knowledge is missing portfolio technology ${technology}`
  );
}

const searchFacts = buildSearchFacts({ entries, resume });
const factIds = new Set();
for (const fact of searchFacts) {
  assert(fact.id && !factIds.has(fact.id), `duplicate or missing search fact id: ${fact.id || "(empty)"}`);
  factIds.add(fact.id);
  assert(String(fact.answer_en || "").trim(), `${fact.id} is missing an English answer`);
  assert(String(fact.answer_he || "").trim(), `${fact.id} is missing a Hebrew answer`);
  assert(Array.isArray(fact.source_ids) && fact.source_ids.length > 0, `${fact.id} has no sources`);
  for (const sourceId of fact.source_ids) {
    assert(sourceIds.has(sourceId), `${fact.id} references unknown source ${sourceId}`);
  }
}

await writeFile(compiledKnowledgeUrl, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(sourceCatalogUrl, `${JSON.stringify(sourceCatalog, null, 2)}\n`, "utf8");
await writeFile(searchIndexUrl, `${JSON.stringify({ version: 1, facts: searchFacts, sources: sourceCatalog }, null, 2)}\n`, "utf8");

console.log(`Wrote ${entries.length} knowledge entries, ${searchFacts.length} search facts, and ${sourceCatalog.length} sources.`);
