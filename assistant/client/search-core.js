const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "with", "from", "about", "what", "which", "who", "how", "where", "when", "why", "did", "does", "do", "his", "her", "their", "he", "she", "you", "your", "it", "that", "this", "tell", "me", "please", "kris", "kristian", "pitshugin",
  "את", "של", "על", "עם", "מה", "מי", "איך", "איפה", "מתי", "למה", "הוא", "היא", "אתה", "אתם", "שלך", "זה", "זו", "ספר", "לי", "כריס", "כריסטיאן", "פיצוגין"
]);

const INTENT_PATTERNS = [
  ["technologies", /\b(technology|technologies|tech|stack|built with|framework|language)\b|טכנולוג|סטאק|נבנה עם|באמצעות/i],
  ["date", /\b(which year|what year|when|date)\b|באיזו שנה|איזו שנה|מתי/i],
  ["location", /\b(where|location|which city|which country)\b|איפה|היכן|מיקום|באיזו עיר|באיזו מדינה/i],
  ["contact", /\b(contact|email|phone|github|linkedin|resume|cv)\b|יצירת קשר|ליצור קשר|קשר עם|אימייל|מייל|טלפון|גיטהאב|לינקדאין|קורות חיים/i],
  ["education", /\b(education|study|studied|degree|degrees|university|college|uga|academic)\b|השכלה|למד|לימודים|תואר|תארים|אוניברסיטה/i],
  ["achievements", /\b(swim|swimming|swimmer|medal|record|championship|athletic|achievement)\b|שחייה|שחיין|מדליה|שיא|אליפות|ספורט|הישג/i],
  ["honors", /\b(honor|award|scholarship|recognition)\b|הצטיינות|פרס|מלגה/i],
  ["methodology", /\b(method|methodology|algorithm|score|scoring|normalize|normalization|compare)\b|שיט|מתודולוג|אלגוריתם|ניקוד|מדרג|דירוג|מנרמל|משווה/i],
  ["data", /\b(data|dataset|benchmarks?|records?|times?)\b|נתונים|מאגר|מדדים|שיאים|זמנים/i],
  ["optimization", /\b(optimization|optimisation|nsga|pareto|evolutionary algorithm)\b|אופטימיז|פארטו|אלגוריתם אבולוציוני/i],
  ["interpretability", /\b(interpretability|interpret|grad.?cam|grounding|occlusion|right region)\b|פרשנות|גראד.?קאם|grounding|occlusion|האזור הנכון/i],
  ["realtime", /\b(real.?time|live camera|webcam|camera input|live inference)\b|זמן אמת|מצלמה חיה|קלט מצלמה|הסקה חיה/i],
  ["leadership", /\b(lead|leader|leadership|led|technical team)\b|הוביל|הנהגה|מנהיגות|ראש צוות|צוות טכני/i],
  ["authentication", /\b(authentication|authenticate|auth|login|sign in)\b|אימות|התחברות|כניסה לחשבון/i],
  ["workflow", /\b(booking|reservation|seat hold|checkout|workflow)\b|הזמנה|שמירת מושב|החזקת מושב|תהליך עבודה/i],
  ["research", /\b(research|thesis|study)\b|מחקר|תזה/i],
  ["roles", /\b(role|roles|job|work|experience|intern|research)\b|תפקיד|עבודה|ניסיון|התמחות|מחקר/i],
  ["projects", /\b(project|projects|built|build|app|apps|product|portfolio)\b|פרויקט|פרויקטים|בנה|אפליקציה|מוצר/i],
  ["background", /\b(background|bio|biography|engineer|engineering|software)\b|רקע|ביוגרפיה|מהנדס|הנדסה|תוכנה/i]
];

const FOLLOW_UP_PATTERN = /^(which|what|when|and|how about|what about|באיזו|איזו|מתי|ומה|ואיזה)|\b(that|it|those|them|זו|זה|אותה|ההיא)\b/i;
const AMBIGUOUS_PROJECT = /\b(which|what|the) project\b|\babout the project\b|איזה פרויקט|על הפרויקט/i;
const PROJECT_QUALIFIERS = /ai|machine learning|ml|full.?stack|film|cinema|patient|health|roster|swim|document|cnn|website|בינה מלאכותית|למידת מכונה|פול.?סטאק|קולנוע|מטופל|שחייה|מסמכ|אתר/i;
const AMBIGUOUS_TECHNOLOGIES = /\b(what|which) (technologies|technology|tech stack|stack) (did|does|has)?\s*(he|kris|kristian|you)?\s*(use|used)?\b|באילו טכנולוגיות (הוא|כריס|אתה)?\s*(השתמש)?/i;
const TECHNOLOGY_QUALIFIERS = /python|java|javascript|typescript|react|next|django|database|postgres|supabase|git|film|cinema|cooldawgs|roster|patient|docompare|cnn|medgemma|שפת|תכנות|מסד|ריאקט|גיט|פילם|קולנוע|חיישן/i;

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’'׳״]/g, "")
    .replace(/[‐‑‒–—-]/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return normalizeSearchText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function detectIntent(query) {
  return INTENT_PATTERNS.find(([, pattern]) => pattern.test(query))?.[0] || "general";
}

function isAiQuery(query) {
  return /\b(ai|ml|machine learning|deep learning|cnn|computer vision|artificial intelligence|medgemma|vision.?language|nsga|evolutionary computation)\b|בינה מלאכותית|למידת מכונה|למידה עמוקה|ראייה ממוחשבת|חישוב אבולוציוני/i.test(query);
}

function isFollowUp(query, history) {
  return Array.isArray(history) && history.length > 0 && (FOLLOW_UP_PATTERN.test(query) || tokens(query).length <= 3);
}

function inferContextSubject(history) {
  const recentAssistant = [...(history || [])].reverse().find((entry) => entry?.role === "assistant");
  const content = normalizeSearchText(recentAssistant?.content || "");
  const subjects = [
    ["european-medal", /european championships|european medal|bronze medal|אליפות אירופה|מדליית ארד/],
    ["portfolio-experience-cooldawgs", /cooldawgs|cool dawgs/],
    ["repository-thesis-or-staffing", /operating room|staffing thesis|nsga|חדרי ניתוח|תזה/],
    ["portfolio-project-cinema", /film hub|cinema ticketing|פילם האב/],
    ["repository-roster-lab-scoring", /roster lab|competitive fitness/],
    ["portfolio-project-cnn", /facial expression|live webcam|grad cam|הבעות פנים/]
  ];
  return subjects.find(([, pattern]) => pattern.test(content))?.[0] || "";
}

function overlap(queryTokens, values) {
  const pool = new Set(tokens((values || []).join(" ")));
  return queryTokens.reduce((count, token) => count + (pool.has(token) ? 1 : 0), 0);
}

function exactAliasMatch(fact, query) {
  return (fact.aliases || []).some((alias) => {
    const normalized = normalizeSearchText(alias);
    return normalized.length >= 3 && query.includes(normalized);
  });
}

function scoreFact({ fact, query, queryTokens, intent, aiQuery, followUp, previousSourceIds, contextSubject }) {
  const exactAlias = exactAliasMatch(fact, query);
  const localizedKeywords = [...(fact.keywords_en || []), ...(fact.keywords_he || []), ...(fact.aliases || [])];
  let score = 0;
  if (exactAlias) score += 42;
  score += overlap(queryTokens, localizedKeywords) * 5;
  if ((fact.intents || []).includes(intent)) score += 24 + Number(fact.priority || 0);
  else if (intent !== "general") score -= 8;
  else if ((fact.intents || []).every((entry) => entry === "technologies" || entry === "date")) score -= 10;
  if (aiQuery && (fact.subject === "ai-projects" || /\b(ai|ml|cnn|machine learning)\b/i.test(localizedKeywords.join(" ")))) score += 26;
  if (followUp && (fact.source_ids || []).some((id) => previousSourceIds.includes(id))) score += 18;
  if (followUp && contextSubject && fact.subject === contextSubject) score += 32;
  return { fact, score, exactAlias };
}

function sourceObjects(index, fact, language) {
  const sourceMap = new Map((index.sources || []).map((source) => [source.id, source]));
  return (fact.source_ids || []).map((id) => {
    const source = sourceMap.get(id);
    if (!source) return null;
    return {
      id,
      label: language === "he" ? source.label_he : source.label_en,
      section: language === "he" ? source.section_he : source.section_en,
      url: source.url
    };
  }).filter(Boolean);
}

function suggestedFollowUps(language, category) {
  const suggestions = language === "he"
    ? {
        projects: ["איך Roster Lab מדרג שחיינים?", "מהו פרויקט זיהוי הבעות הפנים?"],
        athletics: ["באיזו שנה כריס זכה במדליה האירופית?", "מה הוא השיג ב-UGA?"],
        education: ["מה היה התואר הראשון שלו?", "מתי הוא צפוי לסיים את התואר ב-AI?"],
        general: ["מה כריס למד ב-UGA?", "מהם הישגי השחייה המרכזיים שלו?"]
      }
    : {
        projects: ["How does Roster Lab score swimmers?", "What does the facial-expression project do?"],
        athletics: ["Which year was the European medal?", "What did he accomplish at UGA?"],
        education: ["What was his undergraduate degree?", "When is his AI master’s expected?"],
        general: ["What did Kris study at UGA?", "What are his major swimming achievements?"]
      };
  return suggestions[category] || suggestions.general;
}

function clarification(language) {
  return language === "he"
    ? "על איזה פרויקט תרצו לשאול—Roster Lab, זיהוי הבעות פנים, תזת שיבוץ חדרי הניתוח, MedGemma, CoolDawgs או Film-Hub?"
    : "Which project do you mean—Roster Lab, facial-expression recognition, the OR staffing thesis, MedGemma, CoolDawgs, or Film-Hub?";
}

function unsupported(language) {
  return language === "he"
    ? "המידע הזה לא מופיע בתיק העבודות או במקור הוויקיפדיה המאושר. אפשר לשאול על פרויקטים, טכנולוגיות, השכלה, תפקידים או הישגי שחייה."
    : "That information is not available in the portfolio or approved Wikipedia source. Try asking about projects, technologies, education, roles, or swimming achievements.";
}

export function searchPortfolio(index, { language = "en", message, history = [], previousSourceIds = [] }) {
  const query = normalizeSearchText(message);
  const intent = detectIntent(query);
  const followUp = isFollowUp(query, history);

  if (AMBIGUOUS_PROJECT.test(query) && !PROJECT_QUALIFIERS.test(query)) {
    return {
      answer: clarification(language), supported: false, clarification: true, language, sources: [],
      suggestedFollowUps: language === "he" ? ["ספרו לי על Roster Lab", "אילו פרויקטים קשורים ל-AI?"] : ["Tell me about Roster Lab", "Which projects involve AI or ML?"]
    };
  }

  if (intent === "technologies" && !followUp && AMBIGUOUS_TECHNOLOGIES.test(query) && !TECHNOLOGY_QUALIFIERS.test(query)) {
    return {
      answer: language === "he"
        ? "לאיזה פרויקט הכוונה—Roster Lab, CoolDawgs, Film-Hub, זיהוי הבעות הפנים או פרויקט אחר?"
        : "Which project do you mean—Roster Lab, CoolDawgs, Film-Hub, facial-expression recognition, or another project?",
      supported: false, clarification: true, language, sources: [], suggestedFollowUps: suggestedFollowUps(language, "projects")
    };
  }

  if (intent === "date" && !followUp && !/europe|medal|championship|degree|graduat|אירופה|מדליה|אליפות|תואר|סיום/i.test(query)) {
    return {
      answer: language === "he" ? "לאיזה אירוע או הישג אתם מתכוונים?" : "Which event or achievement do you mean?",
      supported: false, clarification: true, language, sources: [], suggestedFollowUps: suggestedFollowUps(language, "general")
    };
  }

  const queryTokens = tokens(query);
  const contextSubject = inferContextSubject(history);
  const scored = (index.facts || [])
    .map((fact) => scoreFact({ fact, query, queryTokens, intent, aiQuery: isAiQuery(query), followUp, previousSourceIds, contextSubject }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.fact.id.localeCompare(b.fact.id));

  const explicit = scored.filter((item) => item.exactAlias);
  const candidates = explicit.length > 0 ? explicit : scored;
  const top = candidates[0];

  if (!top || top.score < 18) {
    return { answer: unsupported(language), supported: false, language, sources: [], suggestedFollowUps: suggestedFollowUps(language, "general") };
  }

  if (!top.exactAlias && candidates[1] && top.score - candidates[1].score <= 2 && top.fact.subject !== candidates[1].fact.subject) {
    return {
      answer: language === "he" ? "מצאתי כמה נושאים אפשריים. אפשר לחדד אם הכוונה לפרויקטים, להשכלה, לתפקידים או לשחייה?" : "I found several possible topics. Could you clarify whether you mean projects, education, roles, or swimming?",
      supported: false, clarification: true, language, sources: [], suggestedFollowUps: suggestedFollowUps(language, "general")
    };
  }

  return {
    answer: language === "he" ? top.fact.answer_he : top.fact.answer_en,
    supported: true,
    language,
    sources: sourceObjects(index, top.fact, language),
    suggestedFollowUps: suggestedFollowUps(language, top.fact.category),
    matchedFactId: top.fact.id
  };
}
