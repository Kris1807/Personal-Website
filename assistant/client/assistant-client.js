import { AssistantApiClient, AssistantApiError } from "./api-client.js";
import { detectPreferredLanguage, getCopy, getSuggestedQuestions } from "./i18n.js";

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createElement(tagName, className = "", attributes = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (key === "text") {
      element.textContent = value;
      return;
    }
    if (key === "html") {
      element.innerHTML = value;
      return;
    }
    if (key === "hidden") {
      element.hidden = Boolean(value);
      return;
    }
    element.setAttribute(key, value);
  });
  return element;
}

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n{2,}/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getAssistantConfig() {
  return globalThis.__KRIS_ASSISTANT_CONFIG__ || {
    apiUrl: "",
    sessionStorageKey: "kris-assistant-session-v1",
    languageStorageKey: "kris-assistant-language-v1",
    fallbackLinks: []
  };
}

function getPageContext() {
  return {
    page: document.body.dataset.page || "unknown",
    section: document.body.dataset.section || document.body.dataset.page || "home",
    title: document.title,
    href: `${window.location.pathname}${window.location.hash}`
  };
}

function getLauncherLanguage(config) {
  const stored = window.localStorage.getItem(config.languageStorageKey);
  if (stored === "en" || stored === "he") return stored;
  return detectPreferredLanguage();
}

function createMessageId(prefix = "message") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeMessage(entry) {
  return {
    id: entry.id || createMessageId(entry.role || "message"),
    role: entry.role === "user" ? "user" : "assistant",
    content: String(entry.content || "").trim(),
    sources: Array.isArray(entry.sources) ? entry.sources : [],
    supported: typeof entry.supported === "boolean" ? entry.supported : true,
    suggestedFollowUps: Array.isArray(entry.suggestedFollowUps) ? entry.suggestedFollowUps : [],
    isError: Boolean(entry.isError),
    retryTargetId: entry.retryTargetId || ""
  };
}

class PortfolioAssistant {
  constructor({ apiClient = null } = {}) {
    this.config = getAssistantConfig();
    this.apiClient = apiClient || new AssistantApiClient({ apiUrl: this.config.apiUrl });
    this.language = getLauncherLanguage(this.config);
    this.hasChosenLanguage = Boolean(window.localStorage.getItem(this.config.languageStorageKey));
    this.messages = [];
    this.isBusy = false;
    this.isOpen = false;
    this.lastFocusedElement = null;
    this.lastRetryTarget = "";
    this.nodes = {};
    this.restoreSession();
  }

  mount() {
    if (document.querySelector(".assistant-root")) return;
    this.createLaunchers();
    this.createShell();
    this.render();
  }

  createLaunchers() {
    const copy = getCopy(this.language);
    const headerActions = document.querySelector(".site-header-actions");
    const headerButton = createElement("button", "site-header-action assistant-header-trigger", {
      type: "button",
      text: copy.launcher,
      "aria-label": copy.openAria
    });
    headerButton.addEventListener("click", () => this.open(headerButton));
    this.nodes.headerButton = headerButton;

    if (headerActions) {
      headerActions.prepend(headerButton);
    }

    const mobileButton = createElement("button", "assistant-mobile-trigger", {
      type: "button",
      text: copy.mobileLauncher,
      "aria-label": copy.openAria
    });
    mobileButton.addEventListener("click", () => this.open(mobileButton));
    document.body.appendChild(mobileButton);
    this.nodes.mobileButton = mobileButton;
  }

  createShell() {
    const copy = getCopy(this.language);
    const root = createElement("div", "assistant-root", { hidden: true });
    const backdrop = createElement("button", "assistant-backdrop", {
      type: "button",
      "aria-label": copy.closeAria
    });
    backdrop.addEventListener("click", () => this.close());

    const panel = createElement("aside", "assistant-panel", {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "assistant-title",
      "aria-describedby": "assistant-subtitle"
    });

    panel.innerHTML = `
      <div class="assistant-panel-frame">
        <header class="assistant-header">
          <div class="assistant-title-lockup">
            <span class="assistant-kicker"></span>
            <h2 id="assistant-title"></h2>
            <p id="assistant-subtitle" class="assistant-subtitle"></p>
          </div>
          <div class="assistant-header-controls">
            <div class="assistant-language-switch" role="group" aria-label="${copy.selectLanguageAria}">
              <button type="button" class="assistant-language-button" data-language="en">English</button>
              <button type="button" class="assistant-language-button" data-language="he">עברית</button>
            </div>
            <button type="button" class="assistant-clear-button"></button>
            <button type="button" class="assistant-close-button" aria-label="${copy.closeAria}">&times;</button>
          </div>
        </header>

        <div class="assistant-status-rail" aria-live="polite"></div>

        <div class="assistant-body">
          <section class="assistant-language-screen">
            <p class="assistant-kicker assistant-kicker-inline"></p>
            <h3 class="assistant-language-title"></h3>
            <p class="assistant-language-body"></p>
            <div class="assistant-language-options">
              <button type="button" class="assistant-language-option" data-language-choice="en">English</button>
              <button type="button" class="assistant-language-option" data-language-choice="he">עברית</button>
            </div>
          </section>

          <section class="assistant-conversation" hidden>
            <div class="assistant-empty-state">
              <h3 class="assistant-empty-title"></h3>
              <p class="assistant-empty-copy"></p>
            </div>
            <div class="assistant-messages" role="log" aria-live="polite" aria-label="${copy.focusTitle}"></div>
            <section class="assistant-suggestions-block">
              <div class="assistant-block-heading"></div>
              <div class="assistant-suggestions"></div>
            </section>
            <section class="assistant-fallback-block" hidden>
              <h3 class="assistant-fallback-title"></h3>
              <p class="assistant-fallback-copy"></p>
              <div class="assistant-fallback-links"></div>
            </section>
            <details class="assistant-disclosure">
              <summary></summary>
              <p class="assistant-disclosure-copy"></p>
              <p class="assistant-disclosure-copy assistant-privacy-copy"></p>
            </details>
          </section>
        </div>

        <form class="assistant-composer" novalidate>
          <label class="assistant-composer-label" for="assistant-input"></label>
          <div class="assistant-composer-row">
            <textarea id="assistant-input" rows="1"></textarea>
            <button type="submit" class="assistant-send-button"></button>
          </div>
        </form>
      </div>
    `;

    root.append(backdrop, panel);
    document.body.appendChild(root);

    this.nodes.root = root;
    this.nodes.backdrop = backdrop;
    this.nodes.panel = panel;
    this.nodes.statusRail = panel.querySelector(".assistant-status-rail");
    this.nodes.title = panel.querySelector("#assistant-title");
    this.nodes.subtitle = panel.querySelector("#assistant-subtitle");
    this.nodes.closeButton = panel.querySelector(".assistant-close-button");
    this.nodes.clearButton = panel.querySelector(".assistant-clear-button");
    this.nodes.languageButtons = Array.from(panel.querySelectorAll(".assistant-language-button"));
    this.nodes.languageOptionButtons = Array.from(panel.querySelectorAll(".assistant-language-option"));
    this.nodes.languageScreen = panel.querySelector(".assistant-language-screen");
    this.nodes.languageKicker = panel.querySelector(".assistant-kicker-inline");
    this.nodes.languageTitle = panel.querySelector(".assistant-language-title");
    this.nodes.languageBody = panel.querySelector(".assistant-language-body");
    this.nodes.conversation = panel.querySelector(".assistant-conversation");
    this.nodes.emptyTitle = panel.querySelector(".assistant-empty-title");
    this.nodes.emptyCopy = panel.querySelector(".assistant-empty-copy");
    this.nodes.messages = panel.querySelector(".assistant-messages");
    this.nodes.suggestionsHeading = panel.querySelector(".assistant-block-heading");
    this.nodes.suggestions = panel.querySelector(".assistant-suggestions");
    this.nodes.fallbackBlock = panel.querySelector(".assistant-fallback-block");
    this.nodes.fallbackTitle = panel.querySelector(".assistant-fallback-title");
    this.nodes.fallbackCopy = panel.querySelector(".assistant-fallback-copy");
    this.nodes.fallbackLinks = panel.querySelector(".assistant-fallback-links");
    this.nodes.disclosure = panel.querySelector(".assistant-disclosure");
    this.nodes.disclosureSummary = panel.querySelector(".assistant-disclosure summary");
    this.nodes.disclosureCopy = panel.querySelector(".assistant-disclosure-copy");
    this.nodes.privacyCopy = panel.querySelector(".assistant-privacy-copy");
    this.nodes.form = panel.querySelector(".assistant-composer");
    this.nodes.label = panel.querySelector(".assistant-composer-label");
    this.nodes.textarea = panel.querySelector("#assistant-input");
    this.nodes.sendButton = panel.querySelector(".assistant-send-button");

    this.nodes.closeButton.addEventListener("click", () => this.close());
    this.nodes.clearButton.addEventListener("click", () => this.clearConversation({ announce: true }));
    this.nodes.form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.handleSubmit();
    });

    this.nodes.textarea.addEventListener("input", () => this.autoResizeTextarea());
    this.nodes.textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        this.handleSubmit();
      }
    });

    this.nodes.languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.language === this.language) return;
        this.setLanguage(button.dataset.language, { clearConversation: true, persist: true });
      });
    });

    this.nodes.languageOptionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.hasChosenLanguage = true;
        this.setLanguage(button.dataset.languageChoice, { clearConversation: false, persist: true });
        this.focusComposer();
      });
    });

    this.nodes.root.addEventListener("click", (event) => {
      const suggestion = event.target.closest("[data-assistant-suggestion]");
      if (suggestion) {
        this.submitMessage(suggestion.dataset.assistantSuggestion, { fromSuggestion: true });
        return;
      }

      const retryButton = event.target.closest("[data-assistant-retry]");
      if (retryButton) {
        this.retryMessage(retryButton.dataset.assistantRetry);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!this.isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
      }
      if (event.key === "Tab") {
        this.trapFocus(event);
      }
    });
  }

  render() {
    const copy = getCopy(this.language);
    this.nodes.root.dir = copy.direction;
    this.nodes.root.lang = this.language;
    this.nodes.root.classList.toggle("is-hebrew", this.language === "he");

    if (this.nodes.headerButton) {
      this.nodes.headerButton.textContent = copy.launcher;
      this.nodes.headerButton.setAttribute("aria-label", copy.openAria);
    }
    if (this.nodes.mobileButton) {
      this.nodes.mobileButton.textContent = copy.mobileLauncher;
      this.nodes.mobileButton.setAttribute("aria-label", copy.openAria);
    }

    this.nodes.title.textContent = copy.title;
    this.nodes.subtitle.textContent = copy.subtitle;
    this.nodes.languageKicker.textContent = copy.languageScreenKicker;
    this.nodes.languageTitle.textContent = copy.chooseLanguage;
    this.nodes.languageBody.textContent = copy.chooseLanguageBody;
    this.nodes.clearButton.textContent = copy.newChat;
    this.nodes.clearButton.setAttribute("aria-label", copy.clearAria);
    this.nodes.closeButton.setAttribute("aria-label", copy.closeAria);
    this.nodes.emptyTitle.textContent = copy.emptyTitle;
    this.nodes.emptyCopy.textContent = copy.emptyBody;
    this.nodes.suggestionsHeading.textContent = copy.suggestedTitle;
    this.nodes.disclosureSummary.textContent = copy.disclosureSummary;
    this.nodes.disclosureCopy.textContent = copy.disclosureBody;
    this.nodes.privacyCopy.textContent = copy.privacyBody;
    this.nodes.label.textContent = copy.promptLabel;
    this.nodes.textarea.placeholder = copy.promptPlaceholder;
    this.nodes.sendButton.textContent = copy.send;
    this.nodes.fallbackTitle.textContent = copy.unavailableTitle;
    this.nodes.fallbackCopy.textContent = copy.unavailableBody;

    this.nodes.languageButtons.forEach((button) => {
      const nextLanguage = button.dataset.language;
      button.textContent = nextLanguage === "he" ? copy.languageHebrew : copy.languageEnglish;
      button.classList.toggle("is-active", nextLanguage === this.language);
      button.setAttribute("aria-pressed", String(nextLanguage === this.language));
    });

    this.nodes.languageOptionButtons.forEach((button) => {
      button.textContent = button.dataset.languageChoice === "he" ? copy.languageHebrew : copy.languageEnglish;
    });

    this.nodes.languageScreen.hidden = this.hasChosenLanguage;
    this.nodes.conversation.hidden = !this.hasChosenLanguage;
    this.nodes.form.hidden = !this.hasChosenLanguage || !this.apiClient.hasEndpoint();
    this.nodes.fallbackBlock.hidden = this.apiClient.hasEndpoint();

    this.renderFallbackLinks();
    this.renderSuggestions();
    this.renderMessages();
    this.updateStatus(this.isBusy ? copy.working : copy.readyPrompt);
    this.autoResizeTextarea();
    this.saveSession();
  }

  renderFallbackLinks() {
    this.nodes.fallbackLinks.innerHTML = "";
    (this.config.fallbackLinks || []).forEach((entry) => {
      const label = this.language === "he"
        ? entry.label_he || entry.label || entry.label_en
        : entry.label_en || entry.label || entry.label_he;

      const link = createElement("a", "assistant-source-chip", {
        href: entry.url,
        text: label,
        target: "_blank",
        rel: "noreferrer noopener"
      });
      this.nodes.fallbackLinks.appendChild(link);
    });
  }

  renderSuggestions() {
    this.nodes.suggestions.innerHTML = "";
    getSuggestedQuestions(this.language).slice(0, 6).forEach((question) => {
      const button = createElement("button", "assistant-suggestion", {
        type: "button",
        text: question,
        "data-assistant-suggestion": question
      });
      this.nodes.suggestions.appendChild(button);
    });
  }

  renderMessages() {
    this.nodes.messages.innerHTML = "";

    if (this.messages.length === 0) {
      this.nodes.messages.hidden = true;
      return;
    }

    this.nodes.messages.hidden = false;

    this.messages.forEach((message) => {
      const article = createElement(
        "article",
        `assistant-message assistant-message-${message.role}${message.isError ? " is-error" : ""}`
      );
      const label = createElement("span", "assistant-message-role", {
        text: message.role === "user"
          ? this.language === "he"
            ? "אתם"
            : "You"
          : this.language === "he"
            ? "העוזר"
            : "Assistant"
      });
      const content = createElement("div", "assistant-message-copy");
      splitParagraphs(message.content).forEach((paragraph) => {
        content.appendChild(createElement("p", "", { text: paragraph }));
      });

      article.append(label, content);

      if (Array.isArray(message.sources) && message.sources.length > 0) {
        const footer = createElement("footer", "assistant-message-footer");
        footer.appendChild(createElement("span", "assistant-message-footer-label", {
          text: getCopy(this.language).sourceLabel
        }));

        const chips = createElement("div", "assistant-source-list");
        message.sources.forEach((source) => {
          const sourceUrl = new URL(source.url, window.location.href).toString();
          chips.appendChild(
            createElement("a", "assistant-source-chip", {
              href: sourceUrl,
              text: source.label,
              target: "_blank",
              rel: "noreferrer noopener"
            })
          );
        });
        footer.appendChild(chips);
        article.appendChild(footer);
      }

      if (message.isError && message.retryTargetId) {
        article.appendChild(
          createElement("button", "assistant-retry-button", {
            type: "button",
            text: getCopy(this.language).retry,
            "data-assistant-retry": message.retryTargetId
          })
        );
      }

      if (Array.isArray(message.suggestedFollowUps) && message.suggestedFollowUps.length > 0) {
        const followUps = createElement("div", "assistant-followups");
        message.suggestedFollowUps.slice(0, 3).forEach((entry) => {
          followUps.appendChild(
            createElement("button", "assistant-followup-button", {
              type: "button",
              text: entry,
              "data-assistant-suggestion": entry
            })
          );
        });
        article.appendChild(followUps);
      }

      this.nodes.messages.appendChild(article);
    });

    this.nodes.messages.scrollTop = this.nodes.messages.scrollHeight;
  }

  open(trigger = null) {
    this.lastFocusedElement = trigger || document.activeElement;
    this.isOpen = true;
    this.nodes.root.hidden = false;
    this.nodes.root.classList.add("is-open");
    document.body.classList.add("assistant-is-open");
    this.render();

    window.requestAnimationFrame(() => {
      if (this.hasChosenLanguage && this.apiClient.hasEndpoint()) {
        this.focusComposer();
      } else {
        const firstOption = this.nodes.languageOptionButtons[0];
        firstOption?.focus();
      }
    });
  }

  close() {
    this.isOpen = false;
    this.nodes.root.classList.remove("is-open");
    document.body.classList.remove("assistant-is-open");
    window.setTimeout(() => {
      if (!this.isOpen) this.nodes.root.hidden = true;
    }, 220);
    this.lastFocusedElement?.focus?.();
  }

  setLanguage(language, { clearConversation = false, persist = true } = {}) {
    this.language = language === "he" ? "he" : "en";
    this.hasChosenLanguage = true;

    if (persist) {
      window.localStorage.setItem(this.config.languageStorageKey, this.language);
    }

    if (clearConversation) {
      this.messages = [];
      this.updateStatus(getCopy(this.language).languageRestart);
    }

    this.render();
  }

  clearConversation({ announce = false } = {}) {
    this.messages = [];
    this.lastRetryTarget = "";
    if (announce) this.updateStatus(getCopy(this.language).clearConfirmation);
    this.render();
    this.focusComposer();
  }

  restoreSession() {
    const raw = window.sessionStorage.getItem(this.config.sessionStorageKey);
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);
      if (payload.language === "en" || payload.language === "he") {
        this.language = payload.language;
      }
      if (Array.isArray(payload.messages)) {
        this.messages = payload.messages.map(normalizeMessage).filter((entry) => entry.content);
      }
      this.hasChosenLanguage = Boolean(window.localStorage.getItem(this.config.languageStorageKey));
    } catch (_error) {
      this.messages = [];
    }
  }

  saveSession() {
    const payload = {
      language: this.language,
      messages: this.messages
        .filter((entry) => !entry.isError || entry.retryTargetId)
        .slice(-12)
        .map((entry) => ({
          id: entry.id,
          role: entry.role,
          content: entry.content,
          sources: entry.sources,
          supported: entry.supported,
          suggestedFollowUps: entry.suggestedFollowUps,
          isError: entry.isError,
          retryTargetId: entry.retryTargetId
        }))
    };

    window.sessionStorage.setItem(this.config.sessionStorageKey, JSON.stringify(payload));
  }

  updateStatus(text) {
    this.nodes.statusRail.textContent = text;
  }

  autoResizeTextarea() {
    if (!this.nodes.textarea) return;
    this.nodes.textarea.style.height = "auto";
    const nextHeight = Math.min(this.nodes.textarea.scrollHeight, 168);
    this.nodes.textarea.style.height = `${nextHeight}px`;
  }

  focusComposer() {
    if (!this.nodes.textarea || this.nodes.form.hidden) return;
    this.nodes.textarea.focus();
  }

  trapFocus(event) {
    const focusable = Array.from(
      this.nodes.panel.querySelectorAll(
        'button:not([disabled]), textarea:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => !element.hidden && element.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  getPreviousSourceIds() {
    const recentAssistant = [...this.messages].reverse().find((entry) => entry.role === "assistant" && Array.isArray(entry.sources));
    return recentAssistant ? recentAssistant.sources.map((source) => source.id).filter(Boolean) : [];
  }

  getHistoryPayload() {
    return this.messages
      .filter((entry) => entry.role === "user" || entry.role === "assistant")
      .slice(-8)
      .map((entry) => ({
        role: entry.role,
        content: entry.content,
        sourceIds: Array.isArray(entry.sources) ? entry.sources.map((source) => source.id).filter(Boolean) : []
      }));
  }

  addMessage(entry) {
    this.messages.push(normalizeMessage(entry));
    this.renderMessages();
    this.saveSession();
  }

  handleSubmit() {
    const text = this.nodes.textarea.value.trim();
    if (!text || this.isBusy) return;
    this.submitMessage(text);
  }

  async submitMessage(text, { fromSuggestion = false, retryTargetId = "" } = {}) {
    const message = String(text || "").trim();
    if (!message || this.isBusy) return;

    let targetUserMessageId = retryTargetId;
    if (!retryTargetId) {
      targetUserMessageId = createMessageId("user");
      this.addMessage({
        id: targetUserMessageId,
        role: "user",
        content: message
      });
    }

    this.isBusy = true;
    this.nodes.textarea.value = "";
    this.autoResizeTextarea();
    this.updateStatus(getCopy(this.language).working);
    this.render();

    try {
      const response = await this.apiClient.ask({
        language: this.language,
        message,
        history: this.getHistoryPayload(),
        pageContext: getPageContext(),
        previousSourceIds: this.getPreviousSourceIds(),
        metadata: {
          source: fromSuggestion ? "suggested-question" : "manual"
        }
      });

      this.addMessage({
        id: createMessageId("assistant"),
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        supported: response.supported,
        suggestedFollowUps: response.suggestedFollowUps
      });
      this.lastRetryTarget = "";
    } catch (error) {
      const fallbackText = error instanceof AssistantApiError
        ? error.message
        : getCopy(this.language).networkError;

      this.addMessage({
        id: createMessageId("assistant"),
        role: "assistant",
        content: fallbackText,
        sources: [],
        supported: false,
        suggestedFollowUps: [],
        isError: true,
        retryTargetId: targetUserMessageId
      });
      this.lastRetryTarget = targetUserMessageId;
    } finally {
      this.isBusy = false;
      this.updateStatus(getCopy(this.language).readyPrompt);
      this.render();
      this.focusComposer();
    }
  }

  retryMessage(userMessageId) {
    const userMessage = this.messages.find((entry) => entry.id === userMessageId && entry.role === "user");
    if (!userMessage || this.isBusy) return;
    this.messages = this.messages.filter((entry) => entry.retryTargetId !== userMessageId);
    this.renderMessages();
    this.submitMessage(userMessage.content, { retryTargetId: userMessageId });
  }
}

export function bootAssistant(options = {}) {
  const assistant = new PortfolioAssistant(options);
  assistant.mount();
  return assistant;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const start = () => {
    if (!window.__KRIS_ASSISTANT_INSTANCE__) {
      window.__KRIS_ASSISTANT_INSTANCE__ = bootAssistant();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
