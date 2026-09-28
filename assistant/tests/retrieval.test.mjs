import { describe, expect, it } from "vitest";
import { retrieveRelevantEntries } from "../server/retrieve.mjs";

describe("portfolio retrieval", () => {
  it("finds the software engineering background", () => {
    const result = retrieveRelevantEntries({ query: "Summarize his technical engineering background", language: "en" });
    expect(result.supported).toBe(true);
    expect(result.entries[0].id).toBe("portfolio-about-overview");
  });

  it("keeps an AI/ML projects request within projects", () => {
    const result = retrieveRelevantEntries({ query: "Which AI and machine-learning projects has Kris built?", language: "en" });
    expect(result.supported).toBe(true);
    expect(result.entries[0].id).toBe("portfolio-project-cnn");
    expect(result.entries.every((entry) => entry.category === "projects")).toBe(true);
  });

  it("resolves Film-Hub and its technology metadata", () => {
    const result = retrieveRelevantEntries({ query: "What technologies did he use for Film-Hub in one sentence?", language: "en" });
    expect(result.entries.map((entry) => entry.id)).toEqual(["portfolio-project-cinema"]);
    expect(result.entries[0].technologies).toEqual(["Django", "JavaScript", "Supabase"]);
  });

  it("finds swimming achievements", () => {
    const result = retrieveRelevantEntries({ query: "What are his major swimming achievements?", language: "en" });
    expect(result.supported).toBe(true);
    expect(result.entries.every((entry) => entry.category === "athletics")).toBe(true);
  });

  it("uses conversation context for an English medal-year follow-up", () => {
    const result = retrieveRelevantEntries({ query: "Which year was that European medal?", language: "en", history: [{ role: "user", content: "What are his international swimming achievements?" }], previousSourceIds: ["source-portfolio-athletics-israel"] });
    expect(result.followUp).toBe(true);
    expect(result.entries[0].id).toBe("portfolio-athletics-israel");
    expect(result.entries[0].dates).toContain("2024");
  });

  it("handles a Hebrew contextual follow-up", () => {
    const result = retrieveRelevantEntries({ query: "באיזו שנה הייתה המדליה הזו?", language: "he", history: [{ role: "user", content: "מהם הישגי השחייה הבינלאומיים שלו?" }], previousSourceIds: ["source-portfolio-athletics-israel"] });
    expect(result.followUp).toBe(true);
    expect(result.entries[0].id).toBe("portfolio-athletics-israel");
  });

  it("handles a paraphrased project question", () => {
    const result = retrieveRelevantEntries({ query: "Tell me about the movie-seat reservation build", language: "en" });
    expect(result.supported).toBe(true);
    expect(result.entries[0].id).toBe("portfolio-project-cinema");
  });

  it("rejects facts absent from approved sources", () => {
    const result = retrieveRelevantEntries({ query: "What is Kris's favorite food?", language: "en" });
    expect(result.supported).toBe(false);
    expect(result.entries).toEqual([]);
  });
});
