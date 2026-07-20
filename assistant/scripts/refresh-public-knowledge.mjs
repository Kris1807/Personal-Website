import { readFile, writeFile } from "node:fs/promises";

const pageUrl = "https://he.wikipedia.org/w/api.php?action=query&prop=extracts|pageprops&titles=%D7%9B%D7%A8%D7%99%D7%A1%D7%98%D7%99%D7%90%D7%9F_%D7%A4%D7%99%D7%A6%27%D7%95%D7%92%D7%99%D7%9F&format=json&explaintext=1&redirects=1&origin=*";
const wikipediaSnapshotUrl = new URL("../knowledge/raw/wikipedia-he.json", import.meta.url);
const wikidataSnapshotUrl = new URL("../knowledge/raw/wikidata.json", import.meta.url);

const today = new Date().toISOString().slice(0, 10);

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

async function refreshWikipediaSnapshot() {
  const payload = await fetchJson(pageUrl);
  const page = Object.values(payload?.query?.pages || {})[0];
  if (!page) throw new Error("Wikipedia page payload was empty.");

  const snapshot = {
    page_title: page.title,
    wikibase_item: page.pageprops?.wikibase_item || "",
    fetched_at: today,
    source_url: "https://he.wikipedia.org/wiki/%D7%9B%D7%A8%D7%99%D7%A1%D7%98%D7%99%D7%90%D7%9F_%D7%A4%D7%99%D7%A6%27%D7%95%D7%92%D7%99%D7%9F",
    extract: page.extract || ""
  };

  await writeFile(wikipediaSnapshotUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot.wikibase_item;
}

async function refreshWikidataSnapshot(entityId) {
  if (!entityId) {
    const existing = JSON.parse(await readFile(wikidataSnapshotUrl, "utf8"));
    return existing;
  }

  const url = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
  const payload = await fetchJson(url);
  const entity = payload?.entities?.[entityId];
  if (!entity) throw new Error("Wikidata entity payload was empty.");

  const birthDate = entity?.claims?.P569?.[0]?.mainsnak?.datavalue?.value?.time || "";
  const snapshot = {
    entity_id: entityId,
    fetched_at: today,
    source_url: `https://www.wikidata.org/wiki/${entityId}`,
    labels: {
      en: entity?.labels?.en?.value || "",
      he: entity?.labels?.he?.value || ""
    },
    aliases: {
      en: (entity?.aliases?.en || []).map((entry) => entry.value),
      he: (entity?.aliases?.he || []).map((entry) => entry.value)
    },
    description_en: entity?.descriptions?.en?.value || "",
    description_he: entity?.descriptions?.he?.value || "",
    birth_date: birthDate.replace(/^\+/, "").slice(0, 10)
  };

  await writeFile(wikidataSnapshotUrl, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}

const entityId = await refreshWikipediaSnapshot();
await refreshWikidataSnapshot(entityId);
console.log("Updated Wikipedia and Wikidata raw snapshots. Review public-approved.mjs if facts changed.");
