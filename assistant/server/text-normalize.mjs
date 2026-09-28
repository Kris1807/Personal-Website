const APOSTROPHES_AND_QUOTES = /['’‘`´ʼ׳״"]/g;
const DASHES = /[‐‑‒–—−]/g;

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(APOSTROPHES_AND_QUOTES, "")
    .replace(DASHES, "-")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchTokens(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token.length > 1);
}
