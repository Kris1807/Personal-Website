(() => {
  const { hostname, protocol } = window.location;
  const isFile = protocol === "file:";
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const configuredApiUrl = typeof window.__KRIS_ASSISTANT_API_URL__ === "string"
    ? window.__KRIS_ASSISTANT_API_URL__.trim()
    : "";

  const fallbackLinks = [
    { label_en: "Resume PDF", label_he: "קובץ קורות החיים", url: "Kristian-Pitshugin-Resume.pdf" },
    { label_en: "GitHub", label_he: "GitHub", url: "https://github.com/Kris1807" },
    { label_en: "LinkedIn", label_he: "LinkedIn", url: "https://www.linkedin.com/in/kristian-pitshugin-3461001a9/" },
    { label_en: "Wikipedia", label_he: "ויקיפדיה", url: "https://he.wikipedia.org/wiki/%D7%9B%D7%A8%D7%99%D7%A1%D7%98%D7%99%D7%90%D7%9F_%D7%A4%D7%99%D7%A6%27%D7%95%D7%92%D7%99%D7%9F" }
  ];

  const defaultApiUrl = configuredApiUrl || ((isFile || isLocal)
    ? "http://127.0.0.1:8788/api/assistant"
    : "/api/assistant");

  window.__KRIS_ASSISTANT_CONFIG__ = Object.freeze({
    apiUrl: defaultApiUrl,
    sessionStorageKey: "kris-assistant-session-v1",
    languageStorageKey: "kris-assistant-language-v1",
    fallbackLinks
  });
})();
