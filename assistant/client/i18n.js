const COPY = {
  en: {
    direction: "ltr",
    launcher: "Ask about Kris",
    mobileLauncher: "Ask about Kris",
    title: "Ask about Kris",
    subtitle:
      "Explore Kris’s engineering work, AI studies, projects, and competitive swimming career through verified portfolio and public sources.",
    languageLabel: "Language",
    languageScreenKicker: "Language setup",
    chooseLanguage: "Choose your language",
    chooseLanguageBody:
      "This assistant answers only from Kris’s portfolio and approved public sources, with source links included for verification.",
    languageEnglish: "English",
    languageHebrew: "עברית",
    newChat: "Clear",
    close: "Close",
    send: "Send",
    retry: "Retry",
    working: "Thinking…",
    readyPrompt: "Grounded answers only",
    promptLabel: "Ask a verified question about Kris",
    promptPlaceholder: "Ask about Kris’s work, education, projects, leadership, or swimming career…",
    emptyTitle: "Start with a grounded question",
    emptyBody:
      "You can ask about Kris’s software engineering background, AI studies, student-athlete experience, leadership, projects, education, or competitive swimming record.",
    suggestedTitle: "Suggested questions",
    sourceLabel: "Sources",
    disclosureSummary: "How the assistant works",
    disclosureBody:
      "This assistant uses information from Kris’s portfolio and approved public sources, including Wikipedia and Wikidata. AI responses can still contain mistakes, so source links are provided for verification.",
    privacySummary: "Privacy note",
    privacyBody:
      "Questions stay in the current browsing session only. The assistant does not ask for sensitive personal information.",
    unavailableTitle: "Assistant unavailable",
    unavailableBody:
      "The AI assistant is temporarily offline. The rest of the portfolio still works, and you can open these links directly in the meantime.",
    languageRestart: "Language changed. Starting a fresh conversation.",
    unsupportedTitle: "Need a better angle?",
    unsupportedBody:
      "Try asking about Kris’s engineering work, AI education, projects, swimming achievements, scholarships, or leadership experience.",
    networkError: "The request could not be completed. Please try again in a moment.",
    focusTitle: "Assistant conversation",
    clearConfirmation: "Conversation cleared.",
    openAria: "Open the Kris assistant",
    closeAria: "Close the Kris assistant",
    clearAria: "Clear conversation",
    selectLanguageAria: "Choose assistant language"
  },
  he: {
    direction: "rtl",
    launcher: "שאלו על כריס",
    mobileLauncher: "שאלו על כריס",
    title: "שאלו על כריס",
    subtitle:
      "גלו מידע על הניסיון של כריס בהנדסת תוכנה, לימודי בינה מלאכותית, פרויקטים וקריירת השחייה התחרותית שלו, על בסיס מקורות מאומתים.",
    languageLabel: "שפה",
    languageScreenKicker: "בחירת שפה",
    chooseLanguage: "בחרו שפה",
    chooseLanguageBody:
      "העוזר הזה משיב רק על סמך תיק העבודות של כריס ומקורות ציבוריים מאושרים, עם קישורי מקור לצורך אימות.",
    languageEnglish: "English",
    languageHebrew: "עברית",
    newChat: "ניקוי",
    close: "סגירה",
    send: "שליחה",
    retry: "נסו שוב",
    working: "חושב…",
    readyPrompt: "תשובות מאומתות בלבד",
    promptLabel: "שאלו שאלה מאומתת על כריס",
    promptPlaceholder: "שאלו על העבודה של כריס, ההשכלה, הפרויקטים, המנהיגות או קריירת השחייה…",
    emptyTitle: "התחילו עם שאלה מבוססת",
    emptyBody:
      "אפשר לשאול על הרקע של כריס בהנדסת תוכנה, לימודי הבינה המלאכותית, חוויית הספורטאי-סטודנט, המנהיגות, הפרויקטים, ההשכלה או הישגי השחייה שלו.",
    suggestedTitle: "שאלות מוצעות",
    sourceLabel: "מקורות",
    disclosureSummary: "איך העוזר עובד",
    disclosureBody:
      "העוזר משיב על סמך מידע מתיק העבודות של כריס וממקורות ציבוריים מאושרים, כולל ויקיפדיה וויקינתונים. תשובות AI עדיין עלולות לכלול שגיאות, ולכן מצורפים קישורי מקור לצורך אימות.",
    privacySummary: "הערת פרטיות",
    privacyBody:
      "השאלות נשמרות רק במהלך הסשן הנוכחי בדפדפן. העוזר לא מבקש מידע אישי רגיש.",
    unavailableTitle: "העוזר אינו זמין כרגע",
    unavailableBody:
      "העוזר מבוסס ה-AI אינו זמין כרגע. שאר תיק העבודות ממשיך לפעול, ואפשר לפתוח בינתיים את הקישורים הישירים האלו.",
    languageRestart: "השפה הוחלפה. מתחילים שיחה חדשה.",
    unsupportedTitle: "רוצים לחדד את השאלה?",
    unsupportedBody:
      "נסו לשאול על העבודה ההנדסית של כריס, לימודי ה-AI, הפרויקטים, הישגי השחייה, המלגות או הניסיון המנהיגותי שלו.",
    networkError: "לא היה אפשר להשלים את הבקשה. נסו שוב בעוד רגע.",
    focusTitle: "שיחת העוזר",
    clearConfirmation: "השיחה נוקתה.",
    openAria: "פתחו את העוזר של כריס",
    closeAria: "סגרו את העוזר של כריס",
    clearAria: "ניקוי השיחה",
    selectLanguageAria: "בחירת שפת העוזר"
  }
};

const SUGGESTIONS = {
  en: [
    "What is Kris’s background in software engineering?",
    "Which AI and machine-learning projects has Kris worked on?",
    "How did competitive swimming shape his professional approach?",
    "What did Kris study at the University of Georgia?",
    "What are his major swimming achievements?",
    "Which project best demonstrates his full-stack experience?"
  ],
  he: [
    "מהו הרקע של כריס בהנדסת תוכנה?",
    "על אילו פרויקטים בבינה מלאכותית ובלמידת מכונה הוא עבד?",
    "כיצד השחייה התחרותית השפיעה על הגישה המקצועית שלו?",
    "מה כריס למד באוניברסיטת ג׳ורג׳יה?",
    "מהם ההישגים המרכזיים שלו בשחייה?",
    "איזה פרויקט מדגים בצורה הטובה ביותר את הניסיון שלו בפיתוח מלא?"
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
