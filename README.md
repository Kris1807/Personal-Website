# Kristian Pitshugin Portfolio

Personal portfolio website for Kristian "Kris" Pitshugin, now extended with a secure bilingual AI assistant grounded only in approved portfolio and public-reference sources.

## Live portfolio

- Frontend: [https://kris1807.github.io/Personal-Website/](https://kris1807.github.io/Personal-Website/)
- Repository: [https://github.com/Kris1807/Personal-Website](https://github.com/Kris1807/Personal-Website)

## Stack

- Static frontend: HTML, CSS, vanilla JavaScript
- Secure assistant backend: serverless-compatible Node endpoint at `api/assistant.mjs`
- Knowledge layer: curated first-party portfolio facts plus approved Hebrew Wikipedia and Wikidata snapshots
- Tests: Vitest + JSDOM

## Architecture overview

The assistant is split into focused layers:

1. `assistant/client/*`
   - launcher, bilingual panel, UI state, localized copy, source-chip rendering, and browser API client
2. `assistant/server/*`
   - request validation, rate limiting, retrieval, grounding, prompt construction, response validation, and error handling
3. `assistant/knowledge/*`
   - source catalog, curated first-party facts, approved public facts, and compiled retrieval data
4. `assistant/scripts/*`
   - knowledge build, public refresh, and local dev API startup

This keeps the GitHub Pages frontend static while moving the model call to a secure server-side endpoint.

## Security model

GitHub Pages cannot safely store an OpenAI API key. The assistant therefore never exposes credentials in:

- HTML
- client-side JavaScript
- public environment variables
- browser storage
- source maps
- network responses

The backend implements:

- strict CORS allowlisting
- request body limits
- per-message limits
- conversation-turn limits
- in-memory rate limiting
- timeout handling
- prompt-injection rejection
- approved-source retrieval only
- server-side response validation
- safe, allowlisted source URL mapping
- graceful fallback when the backend is unavailable

## Knowledge grounding and source priority

Approved knowledge comes from:

1. curated first-party portfolio knowledge
2. current portfolio content
3. approved public references from Hebrew Wikipedia and linked Wikidata

Priority order:

1. first-party curated knowledge
2. portfolio website content
3. Wikipedia/Wikidata

The assistant is intentionally scoped to verified Kris-related information only. Unsupported questions are refused naturally in the selected language instead of answered speculatively.

## Local development

### Install dependencies

```bash
npm install
```

### Prepare environment

Copy `.env.example` to `.env`. If you do not set `OPENAI_API_KEY`, the assistant runs in grounded mock mode by default.

### Build the compiled knowledge

```bash
npm run build:knowledge
```

### Start the local API

```bash
npm run dev:api
```

### Start the static frontend

```bash
python3 -m http.server 8124
```

Open: `http://127.0.0.1:8124/index.html`

The assistant also supports `file://` preview mode by automatically targeting the local API when the site is opened directly from disk.

## Environment variables

Required for real model calls:

- `OPENAI_API_KEY`

Optional configuration:

- `OPENAI_MODEL`
- `KRIS_ASSISTANT_ALLOWED_ORIGINS`
- `KRIS_ASSISTANT_RATE_LIMIT_WINDOW_MS`
- `KRIS_ASSISTANT_RATE_LIMIT_MAX`
- `KRIS_ASSISTANT_TIMEOUT_MS`
- `KRIS_ASSISTANT_MAX_INPUT_CHARS`
- `KRIS_ASSISTANT_MAX_TURNS`
- `KRIS_ASSISTANT_MAX_OUTPUT_TOKENS`
- `KRIS_ASSISTANT_MAX_BODY_BYTES`
- `KRIS_ASSISTANT_MOCK_MODE`

## Knowledge refresh

Refresh public-source snapshots:

```bash
npm run refresh:knowledge
```

Then review:

- `assistant/knowledge/public-approved.mjs`
- `assistant/knowledge/source-catalog.mjs`

After approval, rebuild the compiled retrieval data:

```bash
npm run build:knowledge
```

This workflow keeps manually curated portfolio facts separate from refreshable public-reference data.

## Tests

Run without spending API credits:

```bash
npm test
```

The tests currently cover:

- supported grounded answers
- prompt-injection rejection
- disallowed origins
- rate limiting
- empty input handling
- language switching
- RTL rendering
- validated source-chip rendering
- fallback UI when the endpoint is unavailable

## Deployment

### Frontend on GitHub Pages

The static site can remain on GitHub Pages. To enable the assistant there, point `window.__KRIS_ASSISTANT_API_URL__` to a deployed backend endpoint.

### Full deployment on Vercel

This repository also includes `vercel.json` and `api/assistant.mjs`, so the entire site can be deployed to Vercel with the assistant backend mounted at `/api/assistant`.

### Backend-only deployment

You can also deploy only the backend and keep the frontend on GitHub Pages. In that case:

1. deploy the serverless endpoint
2. set server-side environment variables there
3. add the GitHub Pages origin to `KRIS_ASSISTANT_ALLOWED_ORIGINS`
4. configure the frontend API URL

## Troubleshooting

### Assistant says it is unavailable

- confirm the backend is running
- confirm the resolved API URL is correct
- confirm the current origin is allowlisted

### Source links do not land on the right card

- re-run `npm run build:knowledge`
- verify the anchor ids in the rendered section cards still match `assistant/knowledge/source-catalog.mjs`

### The assistant refuses too often

- verify that the requested fact exists in approved sources
- update curated first-party knowledge rather than broadening model freedom
