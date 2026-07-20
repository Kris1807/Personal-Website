import { writeFile } from "node:fs/promises";

import { portfolioFirstParty } from "../knowledge/portfolio-first-party.mjs";
import { publicApprovedFacts } from "../knowledge/public-approved.mjs";
import { sourceCatalog } from "../knowledge/source-catalog.mjs";

const compiledKnowledgeUrl = new URL("../knowledge/compiled-knowledge.json", import.meta.url);
const sourceCatalogUrl = new URL("../knowledge/source-catalog.json", import.meta.url);

const entries = [...portfolioFirstParty, ...publicApprovedFacts];

await writeFile(compiledKnowledgeUrl, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
await writeFile(sourceCatalogUrl, `${JSON.stringify(sourceCatalog, null, 2)}\n`, "utf8");

console.log(`Wrote ${entries.length} knowledge entries and ${sourceCatalog.length} sources.`);
