import { searchPortfolio } from "./search-core.js?v=20260928-2";

export class PortfolioSearchError extends Error {
  constructor(message) {
    super(message);
    this.name = "PortfolioSearchError";
  }
}

export class PortfolioSearchClient {
  constructor({ indexUrl = "assistant/knowledge/search-index.json", index = null, fetchImpl = null } = {}) {
    this.indexUrl = indexUrl;
    this.index = index;
    this.fetchImpl = fetchImpl || ((...args) => globalThis.fetch(...args));
    this.loading = null;
  }

  async loadIndex() {
    if (this.index) return this.index;
    if (!this.loading) {
      this.loading = this.fetchImpl(this.indexUrl, { cache: "no-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`Search index failed with ${response.status}`);
          return response.json();
        })
        .then((index) => {
          if (!index || !Array.isArray(index.facts) || !Array.isArray(index.sources)) {
            throw new Error("Invalid search index");
          }
          this.index = index;
          return index;
        });
    }
    try {
      return await this.loading;
    } catch (_error) {
      this.loading = null;
      throw new PortfolioSearchError("The portfolio search data could not be loaded. Please try again.");
    }
  }

  async ask(payload) {
    return searchPortfolio(await this.loadIndex(), payload);
  }
}
