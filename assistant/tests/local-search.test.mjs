import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PortfolioSearchClient } from "../client/local-search-client.js";
import { searchPortfolio } from "../client/search-core.js";

const index = JSON.parse(readFileSync(new URL("../knowledge/search-index.json", import.meta.url), "utf8"));

function ask(message, language = "en", extra = {}) {
  return searchPortfolio(index, { message, language, history: [], previousSourceIds: [], ...extra });
}

function conversation(messages, language = "en") {
  const history = [];
  let previousSourceIds = [];
  return messages.map((message) => {
    const result = ask(message, language, { history, previousSourceIds });
    history.push({ role: "user", content: message }, { role: "assistant", content: result.answer });
    previousSourceIds = result.sources.map((source) => source.id);
    return result;
  });
}

describe("client-side portfolio search", () => {
  it("keeps the curated index within the intended focused-fact range", () => {
    expect(index.facts.length).toBeGreaterThanOrEqual(60);
    expect(index.facts.length).toBeLessThanOrEqual(100);
  });

  it("returns only Film-Hub technologies", () => {
    const result = ask("What technologies did Kris use in Film-Hub?");
    expect(result.answer).toBe("Film-Hub uses Django, JavaScript, and Supabase.");
    expect(result.answer).not.toMatch(/booking logic/i);
    expect(result.sources.map((source) => source.id)).toEqual(["source-portfolio-project-cinema"]);
  });

  it("finds AI and machine-learning projects", () => {
    const result = ask("Which AI and machine-learning projects has Kris worked on?");
    expect(result.supported).toBe(true);
    expect(result.answer).toMatch(/CNN Project|CNN/i);
    expect(result.sources[0].id).toBe("source-portfolio-project-cnn");
  });

  it("prioritizes distinctive technical work in broad synthesis answers", () => {
    for (const question of ["What are Kris's strongest projects?", "What kind of engineer is Kris?"]) {
      const result = ask(question);
      expect(result.matchedFactId).toBe("fact-portfolio-technical-synthesis");
      expect(result.answer).toMatch(/Roster Lab/);
      expect(result.answer).toMatch(/facial-expression/);
      expect(result.answer).toMatch(/operating-room staffing thesis/);
      expect(result.answer).not.toMatch(/Film-Hub/);
    }
  });

  it("explains Roster Lab scoring and data with repository-backed details", () => {
    const scoring = ask("How does Roster Lab score swimmers?");
    expect(scoring.matchedFactId).toBe("fact-roster-lab-scoring-method");
    expect(scoring.answer).toMatch(/Top 3\/8\/16/);
    expect(scoring.answer).toMatch(/World Aquatics/);
    const data = ask("What data does Roster Lab use?");
    expect(data.matchedFactId).toBe("fact-roster-lab-data");
    expect(data.answer).toMatch(/SCY, SCM, and LCM/);
  });

  it("recognizes the live facial-expression application and interpretability work", () => {
    for (const question of ["Has Kris built a computer-vision application?", "Does he have real-time ML experience?", "Has he used Grad-CAM?"]) {
      const result = ask(question);
      expect(result.matchedFactId).toBe("fact-cnn-realtime");
      expect(result.answer).toMatch(/live webcam/);
      expect(result.answer).toMatch(/Grad-CAM/);
    }
  });

  it("covers thesis, MedGemma, CoolDawgs, and malware coevolution without overstating status", () => {
    expect(ask("What is Kris's thesis?").answer).toMatch(/surrogate-assisted NSGA-II/);
    const medgemma = ask("What is his MedGemma project?");
    expect(medgemma.answer).toMatch(/real-data grounding runs have not yet been completed/);
    expect(ask("Has Kris led a technical team?").matchedFactId).toBe("fact-cooldawgs-research");
    expect(ask("Has he worked on malware detection?").matchedFactId).toBe("fact-malware-coevolution");
  });

  it("summarizes major swimming achievements with relevant sources", () => {
    const result = ask("What are his major swimming achievements?");
    expect(result.answer).toMatch(/2024 European Championships/);
    expect(result.sources.map((source) => source.id)).toContain("source-wikipedia-competitive-record");
  });

  it("uses conversation context for the European medal year", () => {
    const first = ask("What are his major swimming achievements?");
    const followUp = ask("Which year?", "en", {
      history: [{ role: "user", content: "What are his major swimming achievements?" }, { role: "assistant", content: first.answer }],
      previousSourceIds: first.sources.map((source) => source.id)
    });
    expect(followUp.matchedFactId).toBe("fact-european-medal-year");
    expect(followUp.answer).toMatch(/2024/);
  });

  it("answers education questions", () => {
    const result = ask("What did Kris study at UGA?");
    expect(result.answer).toMatch(/B\.S\. in Computer Science/);
    expect(result.answer).toMatch(/M\.S\. in Artificial Intelligence/);
  });

  it("distinguishes completed and in-progress degrees", () => {
    const bachelor = ask("What degree does Kris have?");
    expect(bachelor.matchedFactId).toBe("fact-education-bs-degree");
    expect(bachelor.answer).toMatch(/B\.S\. in Computer Science/);

    const masters = ask("Does he have a master's?");
    expect(masters.matchedFactId).toBe("fact-education-ms-status");
    expect(masters.answer).toMatch(/is pursuing an M\.S\./);
    expect(masters.answer).not.toMatch(/earned an M\.S\./);
  });

  it("answers expected graduation and current-study questions", () => {
    expect(ask("When does he graduate?").answer).toMatch(/December 2026/);
    expect(ask("What is he studying now?").answer).toMatch(/M\.S\. in Artificial Intelligence/);
    expect(ask("Did he study business?").answer).toMatch(/Business minor/);
  });

  it("answers programming-language and short Python queries", () => {
    const languages = ask("What programming languages does he use?");
    expect(languages.matchedFactId).toBe("fact-programming-languages");
    expect(languages.answer).toMatch(/Python, Java, C, C\+\+, JavaScript, TypeScript, SQL, and Assembly/);
    expect(ask("Python").matchedFactId).toBe("fact-python-experience");
    expect(ask("Does Kris know Python?").answer).toMatch(/facial-expression CNN/);
  });

  it("answers backend, Django, React, Git, and database questions", () => {
    expect(ask("Does he have backend experience?").matchedFactId).toBe("fact-backend-experience");
    expect(ask("Has he used Django?").matchedFactId).toBe("fact-film-hub-backend");
    expect(ask("Does Kris know React?").matchedFactId).toBe("fact-react-experience");
    expect(ask("Has he used Git?").matchedFactId).toBe("fact-git-experience");
    const databases = ask("What databases has he worked with?");
    expect(databases.answer).toMatch(/PostgreSQL, MongoDB, Supabase, Firebase, and Firestore/);
  });

  it("covers Film-Hub backend, authentication, database, and booking workflows", () => {
    expect(ask("What backend work did Kris do in Film-Hub?").answer).toMatch(/Django backend/);
    expect(ask("How does authentication work in Film-Hub?").answer).toMatch(/authentication.*Supabase/i);
    expect(ask("How does Film-Hub booking work?").answer).toMatch(/available, held, or booked/);
  });

  it("keeps Film-Hub technology attribution exact", () => {
    const result = ask("What technologies were used in Film-Hub?");
    expect(result.answer).toBe("Film-Hub uses Django, JavaScript, and Supabase.");
    expect(result.answer).not.toMatch(/React|Next\.js|PostgreSQL|booking logic/i);
  });

  it("covers CoolDawgs purpose, role, leadership, sensors, and technologies", () => {
    expect(ask("What is CoolDawgs?").answer).toMatch(/Bluetooth environmental sensors/);
    expect(ask("What was Kris's role in CoolDawgs?").matchedFactId).toBe("fact-cooldawgs-role");
    expect(ask("Has Kris led a software team?").matchedFactId).toBe("fact-leadership-synthesis");
    expect(ask("Has Kris worked with sensor data?").answer).toMatch(/sensor-data integration/);
    expect(ask("What technologies did he use in CoolDawgs?").answer).toMatch(/React Native.*Bluetooth/);
  });

  it("answers broad research queries with a grounded synthesis", () => {
    for (const query of ["Research", "Does Kris have research experience?", "What is Kris researching?"]) {
      const result = ask(query);
      expect(result.matchedFactId).toBe("fact-research-experience");
      expect(result.answer).toMatch(/CoolDawgs/);
      expect(result.sources.length).toBeLessThanOrEqual(3);
    }
  });

  it("covers neural-network training and evolutionary computation", () => {
    expect(ask("Did he train neural networks?").answer).toMatch(/trained and evaluated a convolutional neural network/);
    expect(ask("Has he used Grad-CAM?").answer).toMatch(/Grad-CAM/);
    const evolutionary = ask("What evolutionary computation experience does he have?");
    expect(evolutionary.answer).toMatch(/NSGA-II/);
    expect(evolutionary.answer).toMatch(/attacker-defender coevolution/);
  });

  it("answers thesis topic and method separately", () => {
    expect(ask("What is his thesis about?").answer).toMatch(/operating-room staffing/);
    expect(ask("What is Kris researching?").answer).toMatch(/operating-room staffing optimization/);
    const method = ask("What optimization method does the thesis use?");
    expect(method.matchedFactId).toBe("fact-thesis-algorithm");
    expect(method.answer).toMatch(/coverage-first, surrogate-assisted NSGA-II/);
  });

  it("supports the complete medal follow-up sequence", () => {
    const [medal, year, location] = conversation(["What medal did Kris win?", "Which year?", "Where?"]);
    expect(medal.matchedFactId).toBe("fact-european-medal-identity");
    expect(year.matchedFactId).toBe("fact-european-medal-year");
    expect(year.answer).toMatch(/2024/);
    expect(location.matchedFactId).toBe("fact-european-medal-location");
    expect(location.answer).toMatch(/Belgrade, Serbia/);
  });

  it("answers Israeli-record and UGA swimming questions", () => {
    const records = ask("What Israeli records does Kris hold?");
    expect(records.answer).toMatch(/three individual events and two relay events/);
    const uga = ask("What are his UGA swimming achievements?");
    expect(uga.answer).toMatch(/All-America recognition in 2023 and 2025/);
  });

  it("keeps project context for CoolDawgs technologies and role", () => {
    const [overview, technologies, role] = conversation([
      "Tell me about CoolDawgs.",
      "What technologies did he use?",
      "What was his role?"
    ]);
    expect(overview.matchedFactId).toBe("fact-cooldawgs-research");
    expect(technologies.matchedFactId).toBe("fact-cooldawgs-technologies");
    expect(role.matchedFactId).toBe("fact-cooldawgs-role");
  });

  it("keeps thesis context for an algorithm follow-up", () => {
    const [overview, method] = conversation(["What is his thesis about?", "What algorithm does it use?"]);
    expect(overview.matchedFactId).toBe("fact-thesis-overview");
    expect(method.matchedFactId).toBe("fact-thesis-algorithm");
  });

  it("clarifies subject-free project, technology, and date questions", () => {
    for (const query of ["Tell me about the project", "What technologies did he use?", "What year was it?"]) {
      const result = ask(query);
      expect(result.clarification).toBe(true);
      expect(result.sources).toEqual([]);
    }
  });

  it("refuses several plausible unsupported claims", () => {
    for (const query of ["Does Kris have an AWS certification?", "Has Kris worked at Google?", "What is his salary?", "Does he know Kubernetes?"]) {
      const result = ask(query);
      expect(result.supported).toBe(false);
      expect(result.answer).toMatch(/not available/i);
      expect(result.sources).toEqual([]);
    }
  });

  it("supports key recruiter-facing topics in Hebrew", () => {
    expect(ask("אילו שפות תכנות כריס יודע?", "he").matchedFactId).toBe("fact-programming-languages");
    expect(ask("האם כריס הוביל צוות?", "he").matchedFactId).toBe("fact-leadership-synthesis");
    expect(ask("מה הניסיון של כריס במחקר?", "he").matchedFactId).toBe("fact-research-experience");
    expect(ask("מה התזה של כריס?", "he").matchedFactId).toBe("fact-thesis-overview");
    expect(ask("איך אפשר ליצור קשר עם כריס?", "he").matchedFactId).toBe("fact-contact-details");
  });

  it("supports the medal sequence in Hebrew with RTL metadata", () => {
    const [medal, year, location] = conversation(["באיזו מדליה כריס זכה?", "באיזו שנה?", "איפה?"], "he");
    expect(medal.language).toBe("he");
    expect(year.answer).toContain("2024");
    expect(location.answer).toContain("בלגרד, סרביה");
  });

  it("supports English and Hebrew paraphrases", () => {
    expect(ask("What was Film Hub built with?").answer).toBe("Film-Hub uses Django, JavaScript, and Supabase.");
    const hebrew = ask("באילו טכנולוגיות נבנה פילם האב?", "he");
    expect(hebrew.answer).toContain("Django, JavaScript ו-Supabase");
    expect(hebrew.language).toBe("he");
  });

  it("uses the same medal context for a Hebrew follow-up", () => {
    const first = ask("מהם הישגי השחייה המרכזיים שלו?", "he");
    const followUp = ask("באיזו שנה הייתה המדליה הזו?", "he", {
      history: [{ role: "user", content: "מהם הישגי השחייה המרכזיים שלו?" }, { role: "assistant", content: first.answer }],
      previousSourceIds: first.sources.map((source) => source.id)
    });
    expect(followUp.matchedFactId).toBe("fact-european-medal-year");
    expect(followUp.answer).toContain("2024");
  });

  it("clarifies ambiguous questions and refuses unsupported facts", () => {
    const ambiguous = ask("Which project should I look at?");
    expect(ambiguous.clarification).toBe(true);
    expect(ambiguous.sources).toEqual([]);
    const unsupported = ask("What is Kris's favorite food?");
    expect(unsupported.supported).toBe(false);
    expect(unsupported.answer).toMatch(/not available/i);
    expect(unsupported.sources).toEqual([]);
  });

  it("operates with no API key, backend, or network request", async () => {
    const client = new PortfolioSearchClient({ index, fetchImpl: () => { throw new Error("Network should not be used"); } });
    const result = await client.ask({ language: "en", message: "What technologies does Film-Hub use?" });
    expect(result.supported).toBe(true);
    expect(result.answer).toContain("Django");
  });

  it("revalidates the static index instead of pinning stale browser data", async () => {
    let requestOptions;
    const client = new PortfolioSearchClient({
      indexUrl: "/assistant/knowledge/search-index.json",
      fetchImpl: async (_url, options) => {
        requestOptions = options;
        return { ok: true, json: async () => index };
      }
    });
    await client.loadIndex();
    expect(requestOptions).toEqual({ cache: "no-cache" });
  });
});
