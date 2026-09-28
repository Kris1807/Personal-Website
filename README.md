# Kristian Pitshugin Portfolio

Personal portfolio website for Kristian "Kris" Pitshugin, including a bilingual client-side search assistant grounded only in approved portfolio and public-reference sources.

## Live portfolio

- Frontend: [https://krispitshugin.com/](https://krispitshugin.com/)
- Repository: [https://github.com/Kris1807/Personal-Website](https://github.com/Kris1807/Personal-Website)

## Stack

- Static frontend: HTML, CSS, vanilla JavaScript
- Portfolio search: deterministic client-side matching with curated English and Hebrew answer templates
- Knowledge layer: curated first-party portfolio facts plus the approved Hebrew Wikipedia snapshot
- Tests: Vitest + JSDOM

## Architecture overview

Portfolio search is split into focused layers:

1. `assistant/client/*`
   - launcher, bilingual panel, local search matching, conversation context, localized copy, and source rendering
2. `assistant/knowledge/*`
   - source catalog, curated first-party facts, approved public facts, and the generated static search index
3. `assistant/scripts/*`
   - development-time knowledge build and optional public-source refresh

The browser loads `assistant/knowledge/search-index.json` as a static asset. Visitor questions never call a model, paid API, or application backend.

## Privacy and security model

The search feature has no credential or model dependency. Questions and lightweight conversation context remain in session storage in the visitor's browser. Local `.env*` files remain ignored by Git and are not included in public site assets.

## Knowledge grounding and source priority

Approved knowledge comes from:

1. curated first-party portfolio knowledge
2. current portfolio content
3. the approved Hebrew Wikipedia reference

Priority order:

1. first-party curated knowledge
2. portfolio website content
3. Hebrew Wikipedia

Search is intentionally scoped to verified Kris-related information only. Unsupported questions return an unavailable response instead of a generic biography or speculative answer.

## Local development

### Install dependencies

```bash
npm install
```

### Build the static search index

```bash
npm run build:knowledge
```

### Start the static frontend

```bash
python3 -m http.server 8124
```

Open: `http://127.0.0.1:8124/index.html`

No environment variables or API keys are required for portfolio search.

## Knowledge refresh

Edit focused answer facts and aliases in `assistant/knowledge/search-facts.mjs`. Edit source-backed portfolio entries in `assistant/knowledge/portfolio-first-party.mjs`, approved public-reference facts in `assistant/knowledge/public-approved.mjs`, and source links in `assistant/knowledge/source-catalog.mjs`.

The generated `assistant/knowledge/search-index.json` currently contains 78 focused facts. Do not edit that generated file directly.

Refresh public-source snapshots:

```bash
npm run refresh:knowledge
```

Then review:

- `assistant/knowledge/public-approved.mjs`
- `assistant/knowledge/source-catalog.mjs`

After approval, rebuild the compiled knowledge and static search index:

```bash
npm run build:knowledge
```

This workflow keeps manually curated portfolio facts separate from refreshable public-reference data.

## Tests

Run locally:

```bash
npm test
```

The tests currently cover:

- education, programming languages, backend/database skills, and professional links
- Film-Hub technologies, authentication, database integration, and booking workflows
- CoolDawgs research, sensor data, technology, responsibilities, and leadership
- AI/ML, CNN training and evaluation, Grad-CAM, evolutionary computation, and thesis methods
- swimming medals, locations, records, UGA achievements, and multi-turn context
- English and Hebrew recruiter questions, aliases, contextual follow-ups, and RTL rendering
- ambiguous and unsupported questions, including plausible unsupported credentials
- operation without an API key or application backend
- language switching
- collapsed source rendering

## Deployment

The portfolio search assistant is part of the static site and works on GitHub Pages or any static host. The former `/api/assistant` route is retired and returns HTTP 410 if reached.

## Troubleshooting

### Search data does not load

- run `npm run build:knowledge`
- confirm `assistant/knowledge/search-index.json` is served with the static site

### Source links do not land on the right card

- re-run `npm run build:knowledge`
- verify the anchor ids in the rendered section cards still match `assistant/knowledge/source-catalog.mjs`

### Search refuses too often

- verify that the requested fact exists in approved sources
- add a focused fact or paraphrase to the curated search knowledge instead of introducing a generic fallback
