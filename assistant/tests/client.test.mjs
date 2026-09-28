// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const assistantConfig = {
  knowledgeBaseUrl: "assistant/knowledge/search-index.json",
  sessionStorageKey: "kris-portfolio-search-session-v2",
  languageStorageKey: "kris-assistant-language-v1"
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("assistant client", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="site-header-actions"></div>';
    document.body.dataset.page = "landing";
    document.body.dataset.section = "home";
    localStorage.clear();
    sessionStorage.clear();
    window.__KRIS_ASSISTANT_CONFIG__ = assistantConfig;
    window.__KRIS_ASSISTANT_INSTANCE__ = {};
  });

  it("renders in RTL when Hebrew is selected", async () => {
    const mod = await import("../client/assistant-client.js?rtl=" + Date.now());
    const searchClient = { ask: vi.fn() };
    const assistant = mod.bootAssistant({ searchClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[1].click();

    expect(assistant.nodes.root.dir).toBe("rtl");
    expect(assistant.nodes.title.textContent).toContain("חיפוש");
  });

  it("keeps the composer hidden until a language is chosen", async () => {
    const mod = await import("../client/assistant-client.js?chooser=" + Date.now());
    const searchClient = { ask: vi.fn() };
    const assistant = mod.bootAssistant({ searchClient });

    assistant.open();

    expect(assistant.nodes.languageScreen.hidden).toBe(false);
    expect(assistant.nodes.conversation.hidden).toBe(true);
    expect(assistant.nodes.form.hidden).toBe(true);
    expect(assistant.nodes.languageKicker.textContent).toBe("Language setup");
  });

  it("renders compact starters, follow-ups, and collapsed sources", async () => {
    const mod = await import("../client/assistant-client.js?source=" + Date.now());
    const searchClient = {
      ask: vi.fn().mockResolvedValue({
        answer: "Kris studied computer science and artificial intelligence at the University of Georgia.",
        supported: true,
        language: "en",
        sources: [{ id: "source-portfolio-education-ms-ai", label: "Portfolio — M.S. in Artificial Intelligence", url: "education.html#education-ms-ai" }],
        suggestedFollowUps: ["Which projects connect to AI?", "What was his degree?", "Where did he study?"]
      })
    };
    const assistant = mod.bootAssistant({ searchClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[0].click();
    expect(document.querySelectorAll(".assistant-suggestion")).toHaveLength(3);
    assistant.nodes.textarea.value = "What did Kris study?";
    assistant.handleSubmit();
    await flush();
    await flush();

    expect(searchClient.ask).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.assistant-source-chip[href*="education.html#education-ms-ai"]')).not.toBeNull();
    expect(document.querySelector(".assistant-message-footer").open).toBe(false);
    expect(document.querySelectorAll(".assistant-followup-button")).toHaveLength(2);
    expect(assistant.nodes.emptyState.hidden).toBe(true);
    expect(assistant.nodes.suggestionsBlock.hidden).toBe(true);
  });

  it("keeps search available without an API endpoint", async () => {
    const mod = await import("../client/assistant-client.js?local=" + Date.now());
    const searchClient = { ask: vi.fn() };
    const assistant = mod.bootAssistant({ searchClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[0].click();

    expect(assistant.nodes.form.hidden).toBe(false);
    expect(document.querySelector(".assistant-fallback-block")).toBeNull();
  });
});
