// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const assistantConfig = {
  apiUrl: "http://127.0.0.1:8788/api/assistant",
  sessionStorageKey: "kris-assistant-session-v1",
  languageStorageKey: "kris-assistant-language-v1",
  fallbackLinks: [{ label_en: "Resume PDF", label_he: "קובץ קורות החיים", url: "Kristian-Pitshugin-Resume.pdf" }]
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
    const apiClient = { hasEndpoint: () => true, ask: vi.fn() };
    const assistant = mod.bootAssistant({ apiClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[1].click();

    expect(assistant.nodes.root.dir).toBe("rtl");
    expect(assistant.nodes.title.textContent).toContain("כריס");
  });

  it("keeps the composer hidden until a language is chosen", async () => {
    const mod = await import("../client/assistant-client.js?chooser=" + Date.now());
    const apiClient = { hasEndpoint: () => true, ask: vi.fn() };
    const assistant = mod.bootAssistant({ apiClient });

    assistant.open();

    expect(assistant.nodes.languageScreen.hidden).toBe(false);
    expect(assistant.nodes.conversation.hidden).toBe(true);
    expect(assistant.nodes.form.hidden).toBe(true);
    expect(assistant.nodes.languageKicker.textContent).toBe("Language setup");
  });

  it("renders validated source chips after a successful answer", async () => {
    const mod = await import("../client/assistant-client.js?source=" + Date.now());
    const apiClient = {
      hasEndpoint: () => true,
      ask: vi.fn().mockResolvedValue({
        answer: "Kris studied computer science and artificial intelligence at the University of Georgia.",
        supported: true,
        language: "en",
        sources: [{ id: "source-portfolio-education-ms-ai", label: "Portfolio — M.S. in Artificial Intelligence", url: "education.html#education-ms-ai" }],
        suggestedFollowUps: ["Which projects connect to AI?"]
      })
    };
    const assistant = mod.bootAssistant({ apiClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[0].click();
    assistant.nodes.textarea.value = "What did Kris study?";
    assistant.handleSubmit();
    await flush();
    await flush();

    expect(apiClient.ask).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.assistant-source-chip[href*="education.html#education-ms-ai"]')).not.toBeNull();
  });

  it("shows fallback links when there is no endpoint", async () => {
    const mod = await import("../client/assistant-client.js?fallback=" + Date.now());
    const apiClient = { hasEndpoint: () => false, ask: vi.fn() };
    const assistant = mod.bootAssistant({ apiClient });

    assistant.open();
    assistant.nodes.languageOptionButtons[0].click();

    expect(assistant.nodes.fallbackBlock.hidden).toBe(false);
    expect(assistant.nodes.form.hidden).toBe(true);
    expect(assistant.nodes.fallbackLinks.textContent).toContain("Resume");
  });
});
