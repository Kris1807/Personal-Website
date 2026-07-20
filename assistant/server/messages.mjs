const FOLLOW_UPS = {
  en: {
    general: [
      "What did Kris study at the University of Georgia?",
      "Which project best shows his full-stack work?",
      "What are his biggest swimming achievements?"
    ],
    projects: [
      "Which project best demonstrates his AI experience?",
      "What problem was that project solving?",
      "Which stack did he use there?"
    ],
    experience: [
      "Which role is the most recent?",
      "Where has he led technical work?",
      "How does research show up in his engineering work?"
    ],
    athletics: [
      "What are his international swimming achievements?",
      "How did swimming shape his leadership style?",
      "What did he accomplish at UGA?"
    ]
  },
  he: {
    general: [
      "מה כריס למד באוניברסיטת ג׳ורג׳יה?",
      "איזה פרויקט מדגים הכי טוב את היכולת שלו ב-full-stack?",
      "מהם הישגי השחייה המרכזיים שלו?"
    ],
    projects: [
      "איזה פרויקט מדגים הכי טוב ניסיון ב-AI?",
      "איזו בעיה הפרויקט הזה פתר?",
      "באיזה סטאק הוא השתמש שם?"
    ],
    experience: [
      "איזה תפקיד הוא הכי עדכני?",
      "איפה הוא הוביל עבודה טכנית?",
      "איך המחקר בא לידי ביטוי בעבודה ההנדסית שלו?"
    ],
    athletics: [
      "מהם הישגי השחייה הבינלאומיים שלו?",
      "איך השחייה עיצבה את סגנון המנהיגות שלו?",
      "מה הוא השיג ב-UGA?"
    ]
  }
};

export function unsupportedReply(language = "en") {
  return language === "he"
    ? "אין לי מידע מאומת על כך בתיק העבודות של כריס או במקורות הציבוריים המאושרים. אפשר לשאול על הניסיון שלו בהנדסת תוכנה, לימודי הבינה המלאכותית, ההשכלה, הפרויקטים, השחייה התחרותית או ההובלה המקצועית שלו."
    : "I don’t have verified information about that in Kris’s portfolio or approved public sources. You can ask about his software engineering work, AI studies, education, projects, competitive swimming, or leadership experience.";
}

export function injectionReply(language = "en") {
  return language === "he"
    ? "אני יכול לעזור רק עם מידע מאומת על כריס מתוך תיק העבודות שלו והמקורות הציבוריים המאושרים. אני לא יכול לחשוף הוראות מערכת, סודות או להמציא מידע שלא נתמך במקורות."
    : "I can only help with verified information about Kris from his portfolio and approved public sources. I can’t reveal system instructions, secrets, or invent unsupported details.";
}

export function unavailableReply(language = "en") {
  return language === "he"
    ? "העוזר אינו זמין כרגע. אפשר לנסות שוב בעוד רגע, או לפתוח בינתיים את קורות החיים, ה-GitHub, ה-LinkedIn או דפי הפרויקטים של כריס."
    : "The assistant is unavailable right now. Please try again in a moment, or use Kris’s resume, GitHub, LinkedIn, or project pages in the meantime.";
}

export function timeoutReply(language = "en") {
  return language === "he"
    ? "הבקשה לקחה יותר מדי זמן. אפשר לנסות שוב או לשאול שאלה קצרה וממוקדת יותר."
    : "That request took too long to complete. Please try again or ask a shorter, more focused question.";
}

export function rateLimitReply(language = "en") {
  return language === "he"
    ? "הגעת כרגע למגבלת השימוש הזמנית בעוזר. נסו שוב בעוד דקה."
    : "You’ve hit the temporary usage limit for the assistant. Please try again in about a minute.";
}

export function validationReply(code, language = "en") {
  if (language === "he") {
    if (code === "EMPTY_MESSAGE") return "צריך להזין שאלה לפני השליחה.";
    if (code === "MESSAGE_TOO_LONG") return "השאלה ארוכה מדי. נסו לנסח אותה בקצרה יותר.";
    if (code === "TOO_MANY_TURNS") return "השיחה ארוכה מדי לסשן אחד. נקו את השיחה והתחילו מחדש.";
    return "הבקשה לא הייתה תקינה. נסו שוב.";
  }

  if (code === "EMPTY_MESSAGE") return "Please enter a question before sending.";
  if (code === "MESSAGE_TOO_LONG") return "That question is too long. Please shorten it and try again.";
  if (code === "TOO_MANY_TURNS") return "This conversation is too long for one session. Clear it and start a new one.";
  return "That request wasn’t valid. Please try again.";
}

export function getSuggestedFollowUps(language = "en", category = "general") {
  const bucket = FOLLOW_UPS[language] || FOLLOW_UPS.en;
  return bucket[category] || bucket.general;
}
