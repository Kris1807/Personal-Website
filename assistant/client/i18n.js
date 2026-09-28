const COPY = {
  en: {
    direction: "ltr",
    launcher: "Search Kris’s portfolio",
    mobileLauncher: "Search Kris’s portfolio",
    title: "Portfolio search",
    languageLabel: "Language",
    languageScreenKicker: "Language setup",
    chooseLanguage: "Choose your language",
    chooseLanguageBody:
      "Search Kris’s portfolio and approved public facts in English or Hebrew. Every answer includes its source when available.",
    languageEnglish: "English",
    languageHebrew: "עברית",
    newChat: "Clear",
    close: "Close",
    send: "Send",
    retry: "Retry",
    working: "Searching…",
    readyPrompt: "Local portfolio search",
    promptLabel: "Search Kris’s portfolio",
    promptPlaceholder: "Ask about Kris…",
    emptyTitle: "Search the portfolio",
    emptyBody:
      "Ask about a project, technology, degree, role, date, contact detail, or swimming achievement.",
    suggestedTitle: "Suggested questions",
    sourceLabel: "Sources",
    disclosureSummary: "About portfolio search",
    disclosureBody:
      "This feature searches a prebuilt index of Kris’s portfolio and verified Hebrew Wikipedia facts. It uses curated answer templates and does not contact an AI service.",
    privacySummary: "Privacy note",
    privacyBody:
      "Questions and conversation context stay in this browser session. No question is sent to a backend service.",
    languageRestart: "Language changed. Starting a fresh conversation.",
    unsupportedTitle: "Need a better angle?",
    unsupportedBody:
      "Try asking about Kris’s engineering work, AI education, projects, swimming achievements, scholarships, or leadership experience.",
    searchError: "The portfolio search data could not be loaded. Please refresh and try again.",
    focusTitle: "Portfolio search conversation",
    clearConfirmation: "Conversation cleared.",
    openAria: "Open portfolio search",
    closeAria: "Close portfolio search",
    clearAria: "Clear conversation",
    selectLanguageAria: "Choose search language"
  },
  he: {
    direction: "rtl",
    launcher: "חיפוש בתיק העבודות",
    mobileLauncher: "חיפוש בתיק העבודות",
    title: "חיפוש בפורטפוליו",
    languageLabel: "שפה",
    languageScreenKicker: "בחירת שפה",
    chooseLanguage: "בחרו שפה",
    chooseLanguageBody:
      "חפשו בתיק העבודות של כריס ובעובדות ציבוריות מאושרות בעברית או באנגלית. לכל תשובה מצורף מקור כשאפשר.",
    languageEnglish: "English",
    languageHebrew: "עברית",
    newChat: "ניקוי",
    close: "סגירה",
    send: "שליחה",
    retry: "נסו שוב",
    working: "מחפש…",
    readyPrompt: "חיפוש מקומי בפורטפוליו",
    promptLabel: "חיפוש בתיק העבודות של כריס",
    promptPlaceholder: "שאלו על כריס…",
    emptyTitle: "חיפוש בתיק העבודות",
    emptyBody:
      "אפשר לשאול על פרויקט, טכנולוגיה, תואר, תפקיד, תאריך, פרטי קשר או הישג בשחייה.",
    suggestedTitle: "שאלות מוצעות",
    sourceLabel: "מקורות",
    disclosureSummary: "על החיפוש בפורטפוליו",
    disclosureBody:
      "הכלי מחפש באינדקס מוכן מראש של תיק העבודות של כריס ושל עובדות מאומתות מוויקיפדיה העברית. הוא משתמש בתבניות תשובה ערוכות ואינו פונה לשירות AI.",
    privacySummary: "הערת פרטיות",
    privacyBody:
      "השאלות והקשר השיחה נשמרים רק בסשן הנוכחי בדפדפן. שום שאלה לא נשלחת לשרת יישומים.",
    languageRestart: "השפה הוחלפה. מתחילים שיחה חדשה.",
    unsupportedTitle: "רוצים לחדד את השאלה?",
    unsupportedBody:
      "נסו לשאול על העבודה ההנדסית של כריס, לימודי ה-AI, הפרויקטים, הישגי השחייה, המלגות או הניסיון המנהיגותי שלו.",
    searchError: "לא היה אפשר לטעון את נתוני החיפוש. רעננו את העמוד ונסו שוב.",
    focusTitle: "שיחת החיפוש בפורטפוליו",
    clearConfirmation: "השיחה נוקתה.",
    openAria: "פתיחת החיפוש בפורטפוליו",
    closeAria: "סגירת החיפוש בפורטפוליו",
    clearAria: "ניקוי השיחה",
    selectLanguageAria: "בחירת שפת החיפוש"
  }
};

const SUGGESTIONS = {
  en: [
    "What are Kris’s most technically interesting projects?",
    "How does Roster Lab score swimmers?",
    "Which AI and machine-learning projects has Kris worked on?",
    "What are his major swimming achievements?",
    "What did Kris study at the University of Georgia?",
    "What does his facial-expression recognition project do?",
    "What is Kris’s thesis about?"
  ],
  he: [
    "מהם הפרויקטים המעניינים ביותר מבחינה טכנית?",
    "איך Roster Lab מדרג שחיינים?",
    "על אילו פרויקטים בבינה מלאכותית ובלמידת מכונה הוא עבד?",
    "מהם הישגי השחייה המרכזיים של כריס?",
    "מה כריס למד באוניברסיטת ג׳ורג׳יה?",
    "מה עושה פרויקט זיהוי הבעות הפנים שלו?",
    "על מה התזה של כריס?"
  ]
};

export function detectPreferredLanguage() {
  const browserLanguage = String(globalThis.navigator?.language || "en").toLowerCase();
  return browserLanguage.startsWith("he") ? "he" : "en";
}

export function getCopy(language = "en") {
  return COPY[language] || COPY.en;
}

export function getSuggestedQuestions(language = "en") {
  return SUGGESTIONS[language] || SUGGESTIONS.en;
}
