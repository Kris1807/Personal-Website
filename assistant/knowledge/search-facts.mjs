const CATEGORY_INTENTS = {
  about: ["background", "engineering"],
  experience: ["roles", "experience"],
  projects: ["projects", "overview"],
  education: ["education"],
  honors: ["honors"],
  athletics: ["achievements", "swimming"],
  leadership: ["leadership"],
  links: ["contact"]
};

function factFromEntry(entry) {
  return {
    id: `fact-${entry.id}`,
    subject: entry.id,
    category: entry.category,
    intents: CATEGORY_INTENTS[entry.category] || ["overview"],
    aliases: [entry.title, ...(entry.aliases || [])],
    keywords_en: entry.keywords_en || [],
    keywords_he: entry.keywords_he || [],
    answer_en: entry.content_en,
    answer_he: entry.content_he,
    source_ids: [entry.source_id],
    priority: 0
  };
}

function technologyFact(entry) {
  if (!Array.isArray(entry.technologies) || entry.technologies.length === 0) return null;
  const technologies = entry.technologies.join(", ");
  return {
    id: `fact-${entry.id}-technologies`,
    subject: entry.id,
    category: "projects",
    intents: ["technologies"],
    aliases: [entry.title, ...(entry.aliases || [])],
    keywords_en: ["technology", "technologies", "tech", "stack", "built with", ...entry.technologies],
    keywords_he: ["טכנולוגיה", "טכנולוגיות", "סטאק", "נבנה עם", ...entry.technologies],
    answer_en: `${entry.title} uses ${technologies}.`,
    answer_he: `${entry.title} נבנה עם ${technologies}.`,
    source_ids: [entry.source_id],
    priority: 20
  };
}

function find(entries, id) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) throw new Error(`Search knowledge is missing ${id}`);
  return entry;
}

export function buildSearchFacts({ entries, resume }) {
  const filmHub = find(entries, "portfolio-project-cinema");
  const cnn = find(entries, "portfolio-project-cnn");
  const rosterScoring = find(entries, "repository-roster-lab-scoring");
  const thesis = find(entries, "repository-thesis-or-staffing");
  const medgemma = find(entries, "repository-medgemma-grounding");
  const malware = find(entries, "repository-malware-coevolution");
  const contact = Object.fromEntries((resume.contact || []).map((item) => [item.label, item.url]));

  const generated = entries.flatMap((entry) => {
    const facts = [factFromEntry(entry), technologyFact(entry)].filter(Boolean);
    return facts;
  });

  const curated = [
    {
      id: "fact-projects-overview",
      subject: "projects",
      category: "projects",
      intents: ["projects"],
      aliases: ["projects", "portfolio projects", "built work", "פרויקטים", "עבודות"],
      keywords_en: ["projects", "apps", "products", "builds", "full stack"],
      keywords_he: ["פרויקטים", "אפליקציות", "מוצרים", "פיתוח", "פול סטאק"],
      answer_en: "Kris’s portfolio spans sports analytics, real-time computer vision, healthcare optimization, medical-AI interpretability, research software, and full-stack products. Representative projects are Roster Lab, live facial-expression recognition, his operating-room staffing thesis, MedGemma grounding research, and CoolDawgs.",
      answer_he: "תיק העבודות של כריס משלב אנליטיקת ספורט, ראייה ממוחשבת בזמן אמת, אופטימיזציה רפואית, פרשנות של AI רפואי, תוכנת מחקר ומוצרי full-stack. פרויקטים מייצגים הם Roster Lab, זיהוי הבעות פנים בזמן אמת, תזת שיבוץ חדרי הניתוח, מחקר MedGemma ו-CoolDawgs.",
      source_ids: [rosterScoring.source_id, cnn.source_id, thesis.source_id, medgemma.source_id, "source-portfolio-experience-cooldawgs"],
      priority: 34
    },
    {
      id: "fact-ai-ml-projects",
      subject: "ai-projects",
      category: "projects",
      intents: ["projects", "ai"],
      aliases: ["AI projects", "AI work", "AI and machine learning projects", "machine learning projects", "ML projects", "פרויקטי AI", "עבודת AI", "פרויקטים בבינה מלאכותית", "פרויקטים בלמידת מכונה"],
      keywords_en: ["ai", "artificial intelligence", "machine learning", "ml", "deep learning", "cnn", "computer vision", "projects"],
      keywords_he: ["בינה מלאכותית", "למידת מכונה", "למידה עמוקה", "ראייה ממוחשבת", "cnn", "פרויקטים"],
      answer_en: "Kris’s AI/ML work includes real-time facial-expression recognition with CNNs and Grad-CAM, surrogate-assisted NSGA-II for operating-room staffing, MedGemma visual-grounding research, and attacker-defender coevolution for malware detection.",
      answer_he: "עבודת ה-AI/ML של כריס כוללת זיהוי הבעות פנים בזמן אמת עם CNN ו-Grad-CAM, אופטימיזציית NSGA-II בסיוע מודל חלופי לשיבוץ חדרי ניתוח, מחקר grounding חזותי ב-MedGemma וקו-אבולוציה של תוקף ומגן לזיהוי נוזקות.",
      source_ids: [cnn.source_id, thesis.source_id, medgemma.source_id, malware.source_id],
      priority: 44
    },
    {
      id: "fact-portfolio-technical-synthesis",
      subject: "portfolio-synthesis",
      category: "about",
      intents: ["projects", "background", "engineering"],
      aliases: ["strongest projects", "most technically interesting projects", "what kind of engineer", "what makes his portfolio different", "technical portfolio", "הפרויקטים החזקים", "הפרויקטים המעניינים ביותר", "איזה מהנדס", "מה מייחד את תיק העבודות"],
      keywords_en: ["strongest", "interesting", "distinctive", "engineer", "portfolio", "technical", "software engineering", "machine learning", "computer vision", "optimization", "sports analytics"],
      keywords_he: ["חזקים", "מעניינים", "ייחודי", "מהנדס", "פורטפוליו", "טכני", "הנדסת תוכנה", "למידת מכונה", "ראייה ממוחשבת", "אופטימיזציה", "אנליטיקת ספורט"],
      answer_en: "Kris works across software engineering, machine learning, computer vision, optimization research, and sports analytics. The clearest examples are Roster Lab, real-time facial-expression recognition, his operating-room staffing thesis, MedGemma grounding research, and the CoolDawgs sensor application.",
      answer_he: "כריס עובד על פני הנדסת תוכנה, למידת מכונה, ראייה ממוחשבת, מחקר אופטימיזציה ואנליטיקת ספורט. הדוגמאות הברורות ביותר הן Roster Lab, זיהוי הבעות פנים בזמן אמת, תזת שיבוץ חדרי הניתוח, מחקר MedGemma ואפליקציית החיישנים CoolDawgs.",
      source_ids: [rosterScoring.source_id, cnn.source_id, thesis.source_id, medgemma.source_id, "source-portfolio-experience-cooldawgs"],
      priority: 48
    },
    {
      id: "fact-roster-lab-overview",
      subject: rosterScoring.id,
      category: "projects",
      intents: ["projects", "methodology", "data", "ranking"],
      aliases: ["What is Roster Lab", "Roster Lab", "sports analytics software", "sports-tech project", "ranking algorithms", "מהו Roster Lab", "תוכנת אנליטיקת ספורט", "אלגוריתמי דירוג"],
      keywords_en: ["Roster Lab", "sports tech", "sports analytics", "ranking", "swimmer performance", "recruiting", "roster analysis"],
      keywords_he: ["Roster Lab", "טכנולוגיית ספורט", "אנליטיקת ספורט", "דירוג", "ביצועי שחיינים", "גיוס", "ניתוח סגל"],
      answer_en: "Roster Lab is a full-stack recruiting and roster-analysis application for college swimming. It combines athlete records, roster projections, scenario planning, event-group analytics, and normalized performance scoring so staff can compare swimmers and identify recruiting needs.",
      answer_he: "Roster Lab היא אפליקציית full-stack לגיוס ולניתוח סגל בשחייה מכללתית. היא משלבת נתוני ספורטאים, תחזיות סגל, תכנון תרחישים, ניתוח קבוצות משחים וניקוד ביצועים מנורמל, כדי שהצוות יוכל להשוות שחיינים ולזהות צורכי גיוס.",
      source_ids: ["source-portfolio-project-roster-lab", rosterScoring.source_id],
      priority: 56
    },
    {
      id: "fact-roster-lab-scoring-method",
      subject: rosterScoring.id,
      category: "projects",
      intents: ["methodology", "data", "ranking"],
      aliases: ["How does Roster Lab score swimmers", "How does he compare swimmers from different events", "Roster Lab scoring", "Competitive Fitness", "איך Roster Lab מדרג שחיינים", "איך הוא משווה שחיינים ממשחים שונים"],
      keywords_en: ["score", "scoring", "compare", "different events", "Competitive Fitness", "SCY", "SCM", "LCM", "NCAA", "Top 3", "Top 8", "Top 16", "A cut", "World Aquatics", "normalize"],
      keywords_he: ["ניקוד", "דירוג", "השוואה", "משחים שונים", "SCY", "SCM", "LCM", "NCAA", "World Aquatics", "נרמול"],
      answer_en: "Roster Lab normalizes each swim against course-specific benchmarks: NCAA Division I record, qualification, and multi-year Top 3/8/16 anchors for SCY, and World Aquatics references for SCM/LCM. It keeps the best normalized course score per event and averages a swimmer’s strongest three eligible individual events.",
      answer_he: "Roster Lab מנרמל כל תוצאה מול מדדים ייעודיים למסלול: שיא NCAA Division I, תקן העפלה וספי Top 3/8/16 רב-שנתיים ל-SCY, ומדדי World Aquatics ל-SCM/LCM. הוא שומר לכל משחה את הציון המנורמל הגבוה ביותר ומחשב ממוצע של שלושת המשחים האישיים החזקים ביותר של השחיין.",
      source_ids: [rosterScoring.source_id],
      priority: 64
    },
    {
      id: "fact-roster-lab-data",
      subject: rosterScoring.id,
      category: "projects",
      intents: ["authentication", "data"],
      aliases: ["What data does Roster Lab use", "Roster Lab data", "איזה מידע Roster Lab משתמש"],
      keywords_en: ["data", "times", "SCY", "SCM", "LCM", "benchmarks", "records", "qualifying", "roster", "eligibility"],
      keywords_he: ["נתונים", "זמנים", "SCY", "SCM", "LCM", "מדדים", "שיאים", "סגל", "זכאות"],
      answer_en: "Roster Lab uses swimmer profiles, eligibility and roster-planning data, and best times in SCY, SCM, and LCM. Its versioned benchmark catalog includes NCAA records, qualification standards, multi-year placement cutoffs, and World Aquatics metric-course references.",
      answer_he: "Roster Lab משתמש בפרופילי שחיינים, נתוני זכאות ותכנון סגל, ובזמנים מיטביים ב-SCY, SCM ו-LCM. קטלוג המדדים המתועד שלו כולל שיאי NCAA, תקני העפלה, ספי מיקום רב-שנתיים ומדדי World Aquatics למסלולים מטריים.",
      source_ids: [rosterScoring.source_id],
      priority: 64
    },
    {
      id: "fact-cnn-realtime",
      subject: cnn.id,
      category: "projects",
      intents: ["projects", "ai", "realtime", "interpretability"],
      aliases: ["computer-vision application", "what did he build with CNNs", "real-time ML experience", "facial-expression recognition", "live camera input", "model interpretability", "Grad-CAM", "יישום ראייה ממוחשבת", "זיהוי הבעות פנים", "קלט מצלמה חי", "פרשנות מודלים"],
      keywords_en: ["CNN", "computer vision", "facial expression", "emotion", "live", "real-time", "webcam", "camera", "inference", "confidence", "Grad-CAM", "interpretability", "deployed model"],
      keywords_he: ["CNN", "ראייה ממוחשבת", "הבעות פנים", "רגש", "זמן אמת", "מצלמה", "הסקה", "ביטחון", "Grad-CAM", "פרשנות"],
      answer_en: "Kris built a real-time facial-expression recognition application that classifies seven emotions from a live webcam or uploaded image. The project connects preprocessing, CNN training, held-out evaluation, confidence-ranked predictions, and optional Grad-CAM visualization in a usable browser interface.",
      answer_he: "כריס בנה אפליקציה לזיהוי הבעות פנים בזמן אמת שמסווגת שבעה רגשות מווידאו חי או מתמונה שהועלתה. הפרויקט מחבר עיבוד מקדים, אימון CNN, הערכה על סט בדיקה, תחזיות מדורגות לפי ביטחון והמחשת Grad-CAM אופציונלית בממשק דפדפן שימושי.",
      source_ids: [cnn.source_id, "source-repo-cnn"],
      priority: 60
    },
    {
      id: "fact-thesis-overview",
      subject: thesis.id,
      category: "projects",
      intents: ["projects", "research", "optimization", "ai"],
      aliases: ["What is Kris's thesis", "what is his thesis", "what is he researching", "operating-room staffing", "multi-objective optimization", "evolutionary algorithms", "NSGA-II", "מה התזה של כריס", "מה הוא חוקר", "אופטימיזציה רב-מטרתית"],
      keywords_en: ["thesis", "research", "operating room", "staffing", "scheduling", "NSGA-II", "evolutionary", "multi-objective", "Pareto", "fairness", "fatigue", "recovery", "preferences", "surrogate"],
      keywords_he: ["תזה", "מחקר", "חדרי ניתוח", "שיבוץ", "NSGA-II", "אבולוציוני", "רב-מטרתי", "פארטו", "הוגנות", "עייפות", "התאוששות", "העדפות"],
      answer_en: "Kris’s M.S. thesis applies coverage-first, surrogate-assisted NSGA-II to six-week operating-room staffing. It searches for feasible schedules while exposing Pareto tradeoffs among workload fairness, fatigue risk, recovery quality, and worker preferences, then exactly evaluates selected and final policies.",
      answer_he: "התזה של כריס מיישמת NSGA-II בסיוע מודל חלופי ותעדוף כיסוי לשיבוץ כוח אדם בחדרי ניתוח לאורך שישה שבועות. היא מחפשת סידורים ישימים תוך הצגת פשרות פארטו בין הוגנות בעומס, סיכון לעייפות, איכות התאוששות והעדפות עובדים, ולאחר מכן מבצעת הערכה מדויקת למדיניות נבחרת וסופית.",
      source_ids: [thesis.source_id],
      priority: 62
    },
    {
      id: "fact-medgemma-grounding",
      subject: medgemma.id,
      category: "projects",
      intents: ["projects", "ai", "interpretability", "research"],
      aliases: ["MedGemma project", "medical AI", "vision-language models", "visual grounding", "looking at the right region", "AI interpretability", "פרויקט MedGemma", "בינה מלאכותית רפואית", "grounding חזותי", "פרשנות AI"],
      keywords_en: ["MedGemma", "medical AI", "vision-language", "chest X-ray", "CheXlocalize", "pleural effusion", "radiologist", "grounding", "patch occlusion", "right region", "interpretability"],
      keywords_he: ["MedGemma", "בינה מלאכותית רפואית", "ראייה ושפה", "צילום חזה", "CheXlocalize", "תפליט פלאורלי", "רדיולוג", "grounding", "patch occlusion", "פרשנות"],
      answer_en: "The MedGemma project tests whether a medical vision-language model relies on the correct chest-X-ray regions. Its implemented patch-occlusion pipeline compares changes in pleural-effusion predictions with CheXlocalize radiologist contours; the repository is careful to state that real-data grounding runs have not yet been completed.",
      answer_he: "פרויקט MedGemma בודק אם מודל רפואי משולב ראייה ושפה מסתמך על האזורים הנכונים בצילום חזה. צינור ה-patch occlusion הממומש משווה שינויים בתחזיות לתפליט פלאורלי מול קווי מתאר של רדיולוגים מ-CheXlocalize; המאגר מציין בזהירות שהרצות grounding על נתונים אמיתיים עדיין לא הושלמו.",
      source_ids: [medgemma.source_id],
      priority: 60
    },
    {
      id: "fact-cooldawgs-research",
      subject: "portfolio-experience-cooldawgs",
      category: "experience",
      intents: ["roles", "leadership", "projects", "research"],
      aliases: ["CoolDawgs", "technical team", "research software", "sensor data", "mobile development", "צוות טכני", "תוכנת מחקר", "נתוני חיישנים", "פיתוח מובייל"],
      keywords_en: ["CoolDawgs", "lead", "leadership", "team", "research", "software", "mobile", "React Native", "Bluetooth", "sensor", "temperature", "charts"],
      keywords_he: ["CoolDawgs", "הובלה", "צוות", "מחקר", "תוכנה", "מובייל", "React Native", "Bluetooth", "חיישן", "טמפרטורה", "גרפים"],
      answer_en: "On CoolDawgs, Kris served as team lead and mobile developer for a research system built around Bluetooth environmental sensors. He led the React Native application work, including sensor-data integration, temperature summaries, and interactive charts, while coordinating delivery with a multidisciplinary research team.",
      answer_he: "ב-CoolDawgs כריס שימש כראש צוות וכמפתח מובייל במערכת מחקר המבוססת על חיישני סביבה ב-Bluetooth. הוא הוביל את עבודת אפליקציית React Native, כולל שילוב נתוני חיישנים, סיכומי טמפרטורה וגרפים אינטראקטיביים, ותיאם את הביצוע עם צוות מחקר רב-תחומי.",
      source_ids: ["source-portfolio-experience-cooldawgs"],
      priority: 58
    },
    {
      id: "fact-malware-coevolution",
      subject: malware.id,
      category: "projects",
      intents: ["projects", "ai", "research", "optimization"],
      aliases: ["malware coevolution", "malware detection", "evolutionary computation", "attacker-defender coevolution", "EMBER", "קו-אבולוציה של נוזקות", "זיהוי נוזקות", "חישוב אבולוציוני", "EMBER"],
      keywords_en: ["malware", "cybersecurity", "coevolution", "attacker", "defender", "EMBER", "evolutionary computation", "adversarial optimization", "genetic operators", "detection"],
      keywords_he: ["נוזקה", "סייבר", "קו-אבולוציה", "תוקף", "מגן", "EMBER", "חישוב אבולוציוני", "אופטימיזציה יריבותית", "זיהוי"],
      answer_en: "Kris’s evolutionary-computation work also includes attacker-defender coevolution for malware detection. The research uses static feature data such as EMBER so attacker candidates can evolve evasive feature changes while defender candidates adapt their classifications, without producing executable malware.",
      answer_he: "עבודתו של כריס בחישוב אבולוציוני כוללת גם קו-אבולוציה של תוקף ומגן לזיהוי נוזקות. המחקר משתמש בנתוני מאפיינים סטטיים כגון EMBER, כך שמועמדי תקיפה מפתחים שינויי מאפיינים חמקניים ומועמדי הגנה מתאימים את הסיווג שלהם, בלי לייצר נוזקה שניתנת להרצה.",
      source_ids: [malware.source_id],
      priority: 52
    },
    {
      id: "fact-education-bs-degree",
      subject: "education-bs",
      category: "education",
      intents: ["education"],
      aliases: ["bachelor's degree", "bachelors degree", "undergraduate degree", "degree does Kris have", "what degree does he have", "תואר ראשון", "איזה תואר יש לכריס"],
      keywords_en: ["bachelor", "BS", "computer science", "undergraduate", "degree", "UGA", "May 2026", "magna cum laude"],
      keywords_he: ["תואר ראשון", "מדעי המחשב", "UGA", "מאי 2026", "בהצטיינות"],
      answer_en: "Kris earned a B.S. in Computer Science from the University of Georgia in May 2026, with an area of emphasis in Artificial Intelligence; the portfolio lists him as magna cum laude.",
      answer_he: "כריס סיים במאי 2026 תואר ראשון במדעי המחשב באוניברסיטת ג׳ורג׳יה, עם דגש בבינה מלאכותית; לפי תיק העבודות הוא סיים בהצטיינות magna cum laude.",
      source_ids: ["source-portfolio-education-bs-cs"],
      priority: 48
    },
    {
      id: "fact-education-ms-status",
      subject: "education-ms",
      category: "education",
      intents: ["education", "research"],
      aliases: ["does he have a master's", "masters degree", "master's degree", "what is he studying now", "current graduate status", "Double Dawgs", "תואר שני", "מה הוא לומד עכשיו", "סטודנט לתואר שני"],
      keywords_en: ["master", "MS", "artificial intelligence", "Double Dawgs", "graduate student", "current", "December 2026"],
      keywords_he: ["תואר שני", "בינה מלאכותית", "Double Dawgs", "סטודנט לתואר שני", "דצמבר 2026"],
      answer_en: "Kris is pursuing an M.S. in Artificial Intelligence through UGA’s Double Dawgs program, with expected completion in December 2026.",
      answer_he: "כריס לומד לתואר מוסמך בבינה מלאכותית במסגרת תוכנית Double Dawgs של UGA, עם סיום צפוי בדצמבר 2026.",
      source_ids: ["source-portfolio-education-ms-ai"],
      priority: 52
    },
    {
      id: "fact-education-graduation-date",
      subject: "education-ms",
      category: "education",
      intents: ["date", "education"],
      aliases: ["when does Kris graduate", "when will he graduate", "expected graduation", "expected completion", "מתי כריס מסיים", "מתי הוא יסיים את התואר", "מועד סיום"],
      keywords_en: ["when", "graduate", "graduation", "completion", "December 2026", "master"],
      keywords_he: ["מתי", "מסיים", "סיום", "דצמבר 2026", "תואר שני"],
      answer_en: "Kris completed his B.S. in May 2026 and expects to complete his M.S. in Artificial Intelligence in December 2026.",
      answer_he: "כריס סיים את התואר הראשון במאי 2026 וצפוי להשלים את התואר המוסמך בבינה מלאכותית בדצמבר 2026.",
      source_ids: ["source-portfolio-education-bs-cs", "source-portfolio-education-ms-ai"],
      priority: 58
    },
    {
      id: "fact-education-business-minor",
      subject: "education-business",
      category: "education",
      intents: ["education"],
      aliases: ["business minor", "did he study business", "minor", "מינור בעסקים", "האם למד עסקים"],
      keywords_en: ["business", "minor", "UGA", "May 2026"],
      keywords_he: ["עסקים", "מינור", "UGA", "מאי 2026"],
      answer_en: "Kris completed a Business minor at the University of Georgia alongside his Computer Science degree in May 2026.",
      answer_he: "כריס השלים מינור בעסקים באוניברסיטת ג׳ורג׳יה לצד התואר במדעי המחשב במאי 2026.",
      source_ids: ["source-portfolio-education-business"],
      priority: 46
    },
    {
      id: "fact-programming-languages",
      subject: "skills-programming-languages",
      category: "projects",
      intents: ["technologies"],
      aliases: ["programming languages", "what languages does he use", "what languages does Kris know", "coding languages", "שפות תכנות", "באילו שפות תכנות כריס משתמש", "אילו שפות הוא יודע"],
      keywords_en: ["programming", "languages", "Python", "Java", "C", "C++", "JavaScript", "TypeScript", "SQL", "Assembly"],
      keywords_he: ["תכנות", "שפות", "Python", "Java", "C", "C++", "JavaScript", "TypeScript", "SQL", "Assembly"],
      answer_en: "The portfolio lists Python, Java, C, C++, JavaScript, TypeScript, SQL, and Assembly among Kris’s programming languages.",
      answer_he: "תיק העבודות מציג את Python, Java, C, C++, JavaScript, TypeScript, SQL ו-Assembly בין שפות התכנות של כריס.",
      source_ids: ["source-portfolio-skills"],
      priority: 58
    },
    {
      id: "fact-python-experience",
      subject: "skills-python",
      category: "projects",
      intents: ["technologies", "ai"],
      aliases: ["Python", "does Kris know Python", "has he used Python", "Python experience", "האם כריס יודע Python", "ניסיון ב-Python"],
      keywords_en: ["Python", "CNN", "machine learning", "MedGemma", "PyTorch", "research"],
      keywords_he: ["Python", "CNN", "למידת מכונה", "MedGemma", "PyTorch", "מחקר"],
      answer_en: "Yes. Kris uses Python in his facial-expression CNN work and medical-AI research; Python is also listed in his portfolio skills.",
      answer_he: "כן. כריס משתמש ב-Python בפרויקט ה-CNN לזיהוי הבעות פנים ובמחקר ה-AI הרפואי, והשפה מופיעה גם ברשימת המיומנויות שלו.",
      source_ids: ["source-portfolio-skills", cnn.source_id, medgemma.source_id],
      priority: 64
    },
    {
      id: "fact-react-experience",
      subject: "skills-react",
      category: "projects",
      intents: ["technologies"],
      aliases: ["React", "does Kris know React", "has he used React", "React experience", "Next.js experience", "האם כריס מכיר React", "ניסיון ב-React"],
      keywords_en: ["React", "React Native", "Next.js", "frontend", "mobile", "Roster Lab", "Patient Record", "CoolDawgs"],
      keywords_he: ["React", "React Native", "Next.js", "פרונטאנד", "מובייל", "Roster Lab", "CoolDawgs"],
      answer_en: "Yes. Kris has used React and Next.js in full-stack products including Roster Lab and the Patient Record App, and React Native for the CoolDawgs mobile application.",
      answer_he: "כן. כריס השתמש ב-React וב-Next.js במוצרי full-stack ובהם Roster Lab ו-Patient Record App, וב-React Native באפליקציית המובייל של CoolDawgs.",
      source_ids: ["source-portfolio-project-roster-lab", "source-portfolio-project-patient-record", "source-portfolio-experience-cooldawgs"],
      priority: 62
    },
    {
      id: "fact-backend-experience",
      subject: "skills-backend",
      category: "projects",
      intents: ["technologies", "background"],
      aliases: ["backend experience", "does Kris have backend experience", "backend engineering", "server-side experience", "ניסיון Backend", "האם לכריס יש ניסיון בצד השרת"],
      keywords_en: ["backend", "server", "Django", "Next.js", "PostgreSQL", "Supabase", "Prisma", "database", "API"],
      keywords_he: ["Backend", "צד שרת", "Django", "Next.js", "PostgreSQL", "Supabase", "Prisma", "מסד נתונים", "API"],
      answer_en: "Kris’s backend experience includes Django services and booking logic in Film-Hub, plus Next.js, Prisma, PostgreSQL, Supabase, authentication, and data workflows across Roster Lab and healthcare/document products.",
      answer_he: "הניסיון של כריס בצד השרת כולל שירותי Django ולוגיקת הזמנות ב-Film-Hub, וכן Next.js, Prisma, PostgreSQL, Supabase, אימות משתמשים ותהליכי נתונים ב-Roster Lab ובמוצרים רפואיים ותיעודיים.",
      source_ids: ["source-repo-film-hub", "source-portfolio-project-roster-lab", "source-portfolio-project-patient-record"],
      priority: 60
    },
    {
      id: "fact-database-experience",
      subject: "skills-databases",
      category: "projects",
      intents: ["technologies", "data"],
      aliases: ["databases", "what databases has he worked with", "database experience", "מסדי נתונים", "עם אילו מסדי נתונים הוא עבד"],
      keywords_en: ["database", "databases", "PostgreSQL", "MongoDB", "Supabase", "Firebase", "Firestore", "Prisma", "SQL"],
      keywords_he: ["מסד נתונים", "מסדי נתונים", "PostgreSQL", "MongoDB", "Supabase", "Firebase", "Firestore", "Prisma", "SQL"],
      answer_en: "The portfolio lists PostgreSQL, MongoDB, Supabase, Firebase, and Firestore. Project evidence specifically connects PostgreSQL and Prisma to Roster Lab, PostgreSQL and Supabase Auth to the Patient Record App, and Supabase to Film-Hub.",
      answer_he: "תיק העבודות מציג PostgreSQL, MongoDB, Supabase, Firebase ו-Firestore. בפרויקטים, PostgreSQL ו-Prisma משויכים ל-Roster Lab, PostgreSQL ו-Supabase Auth ל-Patient Record App, ו-Supabase ל-Film-Hub.",
      source_ids: ["source-portfolio-skills", "source-portfolio-project-roster-lab", "source-portfolio-project-patient-record"],
      priority: 62
    },
    {
      id: "fact-git-experience",
      subject: "skills-git",
      category: "projects",
      intents: ["technologies"],
      aliases: ["Git", "GitHub experience", "has he used Git", "version control", "האם הוא משתמש ב-Git", "בקרת גרסאות"],
      keywords_en: ["Git", "GitHub", "version control", "collaboration", "repository"],
      keywords_he: ["Git", "GitHub", "בקרת גרסאות", "שיתוף פעולה", "מאגר קוד"],
      answer_en: "Yes. Git and GitHub are listed among Kris’s development tools, and his portfolio links to his public GitHub profile and project repositories.",
      answer_he: "כן. Git ו-GitHub מופיעים בין כלי הפיתוח של כריס, ותיק העבודות מקשר לפרופיל ה-GitHub הציבורי ולמאגרי הפרויקטים שלו.",
      source_ids: ["source-portfolio-skills", "source-external-github"],
      priority: 54
    },
    {
      id: "fact-film-hub-backend",
      subject: filmHub.id,
      category: "projects",
      intents: ["background", "roles"],
      aliases: ["Film-Hub", "Film Hub", "Film-Hub backend", "Film Hub backend", "backend work in Film-Hub", "Django experience", "has he used Django", "Backend של Film-Hub", "האם כריס השתמש ב-Django"],
      keywords_en: ["Film-Hub", "backend", "Django", "API", "server", "booking", "database"],
      keywords_he: ["Film-Hub", "Backend", "Django", "API", "שרת", "הזמנות", "מסד נתונים"],
      answer_en: "In Film-Hub, Kris worked with a Django backend supporting movie data, showtimes, seat availability, user bookings, cancellations, and temporary seat holds.",
      answer_he: "ב-Film-Hub כריס עבד עם Backend מבוסס Django שתומך בנתוני סרטים, זמני הקרנה, זמינות מושבים, הזמנות משתמשים, ביטולים והחזקות זמניות של מושבים.",
      source_ids: ["source-repo-film-hub"],
      priority: 62
    },
    {
      id: "fact-film-hub-auth-database",
      subject: filmHub.id,
      category: "projects",
      intents: ["data"],
      aliases: ["Film-Hub", "Film Hub", "Film-Hub authentication", "Film Hub database", "Film-Hub Supabase", "authentication in Film-Hub", "database integration in Film-Hub", "אימות ב-Film-Hub", "מסד הנתונים של Film-Hub"],
      keywords_en: ["Film-Hub", "authentication", "auth", "Supabase", "database", "users", "Django"],
      keywords_he: ["Film-Hub", "אימות", "Supabase", "מסד נתונים", "משתמשים", "Django"],
      answer_en: "Film-Hub integrates user authentication and booking data with Supabase while its Django backend models users, shows, seats, bookings, and payment-card records.",
      answer_he: "Film-Hub משלב אימות משתמשים ונתוני הזמנות עם Supabase, בעוד ה-Backend ב-Django מנהל מודלים של משתמשים, הקרנות, מושבים, הזמנות וכרטיסי תשלום.",
      source_ids: ["source-repo-film-hub"],
      priority: 64
    },
    {
      id: "fact-film-hub-booking-workflow",
      subject: filmHub.id,
      category: "projects",
      intents: ["projects", "methodology", "workflow"],
      aliases: ["Film-Hub", "Film Hub", "Film-Hub booking workflow", "how does Film-Hub booking work", "seat reservation logic", "temporary seat holds", "תהליך ההזמנה ב-Film-Hub", "לוגיקת הזמנת מושבים"],
      keywords_en: ["Film-Hub", "booking", "seat", "reservation", "hold", "checkout", "cancel", "availability", "double booking"],
      keywords_he: ["Film-Hub", "הזמנה", "מושב", "שמירה", "החזקה", "תשלום", "ביטול", "זמינות", "הזמנה כפולה"],
      answer_en: "Film-Hub tracks seats as available, held, or booked. It supports temporary holds, availability checks, booking creation and cancellation, and protects the reservation flow from conflicting seat selections.",
      answer_he: "Film-Hub עוקב אחרי מושבים כזמינים, מוחזקים זמנית או מוזמנים. הוא תומך בהחזקות זמניות, בדיקות זמינות, יצירת הזמנה וביטולה, ומגן על התהליך מפני בחירה מתנגשת של אותו מושב.",
      source_ids: ["source-portfolio-project-cinema", "source-repo-film-hub"],
      priority: 62
    },
    {
      id: "fact-cooldawgs-technologies",
      subject: "portfolio-experience-cooldawgs",
      category: "experience",
      intents: ["technologies"],
      aliases: ["CoolDawgs technologies", "what technologies did he use in CoolDawgs", "CoolDawgs tech stack", "טכנולוגיות CoolDawgs", "באילו טכנולוגיות הוא השתמש ב-CoolDawgs"],
      keywords_en: ["CoolDawgs", "technology", "React Native", "Bluetooth", "mobile", "sensor", "charts"],
      keywords_he: ["CoolDawgs", "טכנולוגיה", "React Native", "Bluetooth", "מובייל", "חיישן", "גרפים"],
      answer_en: "For CoolDawgs, Kris used React Native to build the mobile interface and integrated Bluetooth-connected environmental sensor data into temperature summaries and interactive charts.",
      answer_he: "ב-CoolDawgs כריס השתמש ב-React Native לבניית ממשק המובייל ושילב נתונים מחיישני סביבה המחוברים ב-Bluetooth בסיכומי טמפרטורה ובגרפים אינטראקטיביים.",
      source_ids: ["source-portfolio-experience-cooldawgs"],
      priority: 66
    },
    {
      id: "fact-cooldawgs-role",
      subject: "portfolio-experience-cooldawgs",
      category: "experience",
      intents: ["roles", "leadership"],
      aliases: ["CoolDawgs role", "what was Kris's role in CoolDawgs", "what did Kris do as team lead", "responsible for in CoolDawgs", "תפקיד ב-CoolDawgs", "מה כריס עשה כראש צוות", "על מה היה אחראי ב-CoolDawgs"],
      keywords_en: ["CoolDawgs", "role", "responsibility", "team lead", "mobile developer", "coordinate", "research team"],
      keywords_he: ["CoolDawgs", "תפקיד", "אחריות", "ראש צוות", "מפתח מובייל", "תיאום", "צוות מחקר"],
      answer_en: "Kris served as Team Lead and Mobile Developer on CoolDawgs. He led the React Native application work, coordinated technical delivery, and helped turn live sensor readings into usable summaries and visualizations for the research team.",
      answer_he: "כריס שימש כראש צוות וכמפתח מובייל ב-CoolDawgs. הוא הוביל את עבודת אפליקציית React Native, תיאם את הביצוע הטכני וסייע להפוך קריאות חיישנים חיות לסיכומים ולהמחשות שימושיות לצוות המחקר.",
      source_ids: ["source-portfolio-experience-cooldawgs"],
      priority: 66
    },
    {
      id: "fact-research-experience",
      subject: "research-synthesis",
      category: "experience",
      intents: ["research", "background", "projects"],
      aliases: ["research experience", "does Kris have research experience", "what research experience does Kris have", "what is Kris researching", "ניסיון מחקרי", "האם לכריס יש ניסיון במחקר", "במה כריס חוקר"],
      keywords_en: ["research", "thesis", "CoolDawgs", "MedGemma", "malware", "optimization", "computer vision", "sensor"],
      keywords_he: ["מחקר", "תזה", "CoolDawgs", "MedGemma", "נוזקה", "אופטימיזציה", "ראייה ממוחשבת", "חיישן"],
      answer_en: "Kris’s research experience includes leading mobile development for the CoolDawgs sensor project, operating-room staffing optimization for his M.S. thesis, MedGemma visual-grounding methodology, and evolutionary attacker-defender research for malware detection.",
      answer_he: "הניסיון המחקרי של כריס כולל הובלת פיתוח המובייל בפרויקט החיישנים CoolDawgs, אופטימיזציה לשיבוץ חדרי ניתוח בתזה, מתודולוגיית grounding חזותי ב-MedGemma ומחקר אבולוציוני של תוקף ומגן לזיהוי נוזקות.",
      source_ids: ["source-portfolio-experience-cooldawgs", thesis.source_id, medgemma.source_id],
      priority: 72
    },
    {
      id: "fact-cnn-training-evaluation",
      subject: cnn.id,
      category: "projects",
      intents: ["ai", "methodology"],
      aliases: ["did he train neural networks", "model training", "CNN training", "model evaluation", "האם הוא אימן רשתות נוירונים", "אימון מודלים", "הערכת מודל"],
      keywords_en: ["train", "training", "neural network", "CNN", "validation", "evaluation", "held-out", "seven emotions", "preprocessing"],
      keywords_he: ["אימון", "רשת נוירונים", "CNN", "אימות", "הערכה", "סט בדיקה", "שבעה רגשות", "עיבוד מקדים"],
      answer_en: "Yes. Kris trained and evaluated a convolutional neural network for seven-class facial-expression recognition, using preprocessing, validation during training, held-out evaluation, and saved-model inference.",
      answer_he: "כן. כריס אימן והעריך רשת נוירונים קונבולוציונית לסיווג שבע הבעות פנים, עם עיבוד מקדים, אימות במהלך האימון, הערכה על סט בדיקה והסקה ממודל שמור.",
      source_ids: [cnn.source_id, "source-repo-cnn"],
      priority: 64
    },
    {
      id: "fact-evolutionary-computation-experience",
      subject: "evolutionary-computation",
      category: "projects",
      intents: ["optimization", "ai", "research"],
      aliases: ["evolutionary computation experience", "genetic algorithms", "optimization algorithms has he used", "evolutionary algorithms", "ניסיון בחישוב אבולוציוני", "אלגוריתמים גנטיים", "באילו אלגוריתמי אופטימיזציה הוא השתמש"],
      keywords_en: ["evolutionary computation", "genetic algorithm", "NSGA-II", "coevolution", "Pareto", "optimization", "malware", "staffing"],
      keywords_he: ["חישוב אבולוציוני", "אלגוריתם גנטי", "NSGA-II", "קו-אבולוציה", "פארטו", "אופטימיזציה", "נוזקה", "שיבוץ"],
      answer_en: "Kris’s evolutionary-computation experience spans surrogate-assisted NSGA-II for multi-objective operating-room staffing and attacker-defender coevolution for malware detection using static feature data.",
      answer_he: "הניסיון של כריס בחישוב אבולוציוני כולל NSGA-II בסיוע מודל חלופי לשיבוץ רב-מטרתי בחדרי ניתוח וקו-אבולוציה של תוקף ומגן לזיהוי נוזקות באמצעות נתוני מאפיינים סטטיים.",
      source_ids: [thesis.source_id, malware.source_id],
      priority: 64
    },
    {
      id: "fact-thesis-algorithm",
      subject: thesis.id,
      category: "projects",
      intents: ["optimization", "methodology", "technologies"],
      aliases: ["what algorithm does the thesis use", "thesis optimization method", "NSGA-II method", "surrogate-assisted optimization", "באיזה אלגוריתם התזה משתמשת", "שיטת האופטימיזציה בתזה"],
      keywords_en: ["thesis", "algorithm", "method", "NSGA-II", "surrogate", "coverage-first", "Pareto", "multi-objective"],
      keywords_he: ["תזה", "אלגוריתם", "שיטה", "NSGA-II", "מודל חלופי", "כיסוי", "פארטו", "רב-מטרתי"],
      answer_en: "The thesis uses a coverage-first, surrogate-assisted NSGA-II workflow. A k-nearest-neighbors surrogate screens some exploratory policies, while selected policies and the final population receive exact schedule evaluations before reporting the Pareto front.",
      answer_he: "התזה משתמשת בתהליך NSGA-II בסיוע מודל חלופי ותעדוף כיסוי. מודל k-nearest-neighbors מסנן חלק מהמדיניות הניסיונית, בעוד שמדיניות נבחרת והאוכלוסייה הסופית מקבלות הערכת לוח זמנים מדויקת לפני דיווח חזית הפארטו.",
      source_ids: [thesis.source_id],
      priority: 68
    },
    {
      id: "fact-european-medal-identity",
      subject: "european-medal",
      category: "athletics",
      intents: ["achievements", "swimming"],
      aliases: ["what medal did Kris win", "which medal", "European medal", "איזו מדליה כריס זכה", "באיזו מדליה הוא זכה"],
      keywords_en: ["what medal", "which medal", "bronze", "European Championships", "swimming"],
      keywords_he: ["איזו מדליה", "ארד", "אליפות אירופה", "שחייה"],
      answer_en: "Kris won a bronze medal at the 2024 European Championships in Belgrade.",
      answer_he: "כריס זכה במדליית ארד באליפות אירופה 2024 בבלגרד.",
      source_ids: ["source-wikipedia-competitive-record"],
      priority: 62
    },
    {
      id: "fact-european-medal-location",
      subject: "european-medal",
      category: "athletics",
      intents: ["location", "achievements", "swimming"],
      aliases: ["where was the European medal", "where did he win the medal", "where was that", "medal location", "איפה הוא זכה במדליה", "איפה זה היה", "מיקום המדליה"],
      keywords_en: ["where", "location", "Belgrade", "European Championships", "medal", "bronze"],
      keywords_he: ["איפה", "מיקום", "בלגרד", "אליפות אירופה", "מדליה", "ארד"],
      answer_en: "Kris won the European Championships bronze medal in Belgrade, Serbia.",
      answer_he: "כריס זכה במדליית הארד באליפות אירופה בבלגרד, סרביה.",
      source_ids: ["source-wikipedia-competitive-record"],
      priority: 68
    },
    {
      id: "fact-israeli-records-championships",
      subject: "swimming-israel-records",
      category: "athletics",
      intents: ["achievements", "swimming"],
      aliases: ["Israeli records", "swimming records", "Israeli championships", "is he an Israeli champion", "שיאי ישראל", "אליפות ישראל", "האם הוא אלוף ישראל"],
      keywords_en: ["Israeli", "records", "champion", "championship", "three individual", "two relay", "short course", "long course", "since 2020"],
      keywords_he: ["ישראל", "שיאים", "אלוף", "אליפות", "שלושה משחים אישיים", "שני משחי שליחים", "בריכה קצרה", "בריכה ארוכה", "מאז 2020"],
      answer_en: "The portfolio identifies Kris as an Israeli record holder in three individual events and two relay events, and as an Israeli champion since 2020 in both short-course and long-course pools.",
      answer_he: "תיק העבודות מציג את כריס כמחזיק בשיאי ישראל בשלושה משחים אישיים ובשני משחי שליחים, וכאלוף ישראל מאז 2020 בבריכות קצרות וארוכות.",
      source_ids: ["source-portfolio-athletics-club", "source-wikipedia-competitive-record"],
      priority: 58
    },
    {
      id: "fact-uga-swimming-achievements",
      subject: "swimming-uga",
      category: "athletics",
      intents: ["achievements", "swimming"],
      aliases: ["UGA swimming achievements", "what did he accomplish at UGA", "All-America", "NCAA swimming achievements", "הישגי שחייה ב-UGA", "מה הוא השיג ב-UGA", "All-American"],
      keywords_en: ["UGA", "All-American", "2023", "2025", "SEC", "NCAA", "relay", "school record", "breaststroke"],
      keywords_he: ["UGA", "All-American", "2023", "2025", "SEC", "NCAA", "שליחים", "שיא בית ספר", "חזה"],
      answer_en: "At UGA, Kris earned All-America recognition in 2023 and 2025, recorded sixth- and eighth-place NCAA relay results, contributed to school relay records, placed eighth at SECs, and posted notable 50- and 100-yard breaststroke marks.",
      answer_he: "ב-UGA כריס זכה להכרה כ-All-American בשנים 2023 ו-2025, השיג מקומות שישי ושמיני בשליחים ב-NCAA, היה שותף לשיאי בית ספר בשליחים, סיים שמיני ב-SEC וקבע תוצאות בולטות ב-50 וב-100 יארד חזה.",
      source_ids: ["source-portfolio-athletics-uga"],
      priority: 60
    },
    {
      id: "fact-leadership-synthesis",
      subject: "leadership",
      category: "leadership",
      intents: ["leadership", "roles", "background"],
      aliases: ["has Kris led a team", "leadership experience", "software team leadership", "what leadership experience does he have", "האם כריס הוביל צוות", "ניסיון מנהיגות", "הובלת צוות תוכנה"],
      keywords_en: ["leadership", "team lead", "CoolDawgs", "research collaboration", "software team", "student athlete", "communication"],
      keywords_he: ["מנהיגות", "ראש צוות", "CoolDawgs", "שיתוף פעולה מחקרי", "צוות תוכנה", "ספורטאי סטודנט", "תקשורת"],
      answer_en: "Kris’s clearest software-leadership example is CoolDawgs, where he served as Team Lead and Mobile Developer for a multidisciplinary sensor-research project. His portfolio also connects research and Division I athletics with clear communication, visible tradeoffs, and sustained team execution.",
      answer_he: "הדוגמה המרכזית למנהיגות תוכנה אצל כריס היא CoolDawgs, שבה שימש כראש צוות וכמפתח מובייל בפרויקט מחקר חיישנים רב-תחומי. תיק העבודות מחבר גם בין מחקר וספורט Division I לבין תקשורת ברורה, הצגת פשרות מקצועיות וביצוע צוותי מתמשך.",
      source_ids: ["source-portfolio-experience-cooldawgs", "source-portfolio-about"],
      priority: 62
    },
    {
      id: "fact-recruiter-differentiation",
      subject: "portfolio-synthesis",
      category: "about",
      intents: ["background", "engineering", "leadership"],
      aliases: ["what makes Kris different", "what makes him different from other junior developers", "why Kris", "recruiter summary", "מה מייחד את כריס", "מה מבדיל אותו ממפתחים מתחילים אחרים", "סיכום למגייס"],
      keywords_en: ["different", "distinctive", "junior developer", "recruiter", "software engineering", "AI research", "leadership", "athletics"],
      keywords_he: ["מייחד", "מבדיל", "מפתח מתחיל", "מגייס", "הנדסת תוכנה", "מחקר AI", "מנהיגות", "ספורט"],
      answer_en: "Kris combines documented full-stack delivery, applied AI and optimization research, technical leadership on a sensor project, and experience competing at NCAA and international swimming levels. The distinction is the combination of those areas, not a claim that one alone makes him stronger than other candidates.",
      answer_he: "כריס משלב ניסיון מתועד בפיתוח full-stack, מחקר יישומי ב-AI ובאופטימיזציה, הובלה טכנית בפרויקט חיישנים וניסיון תחרותי בשחייה ברמות NCAA ובינלאומית. הייחוד הוא בשילוב התחומים האלה, ולא בטענה שתחום אחד לבדו הופך אותו לטוב ממועמדים אחרים.",
      source_ids: ["source-portfolio-project-roster-lab", "source-portfolio-experience-cooldawgs", "source-portfolio-athletics-uga"],
      priority: 64
    },
    {
      id: "fact-professional-profiles",
      subject: "contact",
      category: "links",
      intents: ["contact"],
      aliases: ["GitHub profile", "LinkedIn profile", "professional profiles", "where is his GitHub", "where is his LinkedIn", "פרופיל GitHub", "פרופיל LinkedIn", "פרופילים מקצועיים"],
      keywords_en: ["GitHub", "LinkedIn", "profile", "professional", "contact", "resume"],
      keywords_he: ["GitHub", "LinkedIn", "פרופיל", "מקצועי", "יצירת קשר", "קורות חיים"],
      answer_en: "Kris’s public GitHub and LinkedIn profiles are linked from the portfolio, along with his résumé and public contact details.",
      answer_he: "פרופילי ה-GitHub וה-LinkedIn הציבוריים של כריס מקושרים מתיק העבודות, לצד קורות החיים ופרטי הקשר הציבוריים שלו.",
      source_ids: ["source-external-github", "source-external-linkedin", "source-external-resume"],
      priority: 52
    },
    {
      id: "fact-uga-overview",
      subject: "uga-overview",
      category: "about",
      intents: ["background", "education", "roles", "achievements"],
      aliases: ["what did Kris do at UGA", "Kris at UGA", "UGA background", "מה כריס עשה ב-UGA", "הרקע של כריס ב-UGA"],
      keywords_en: ["UGA", "University of Georgia", "computer science", "artificial intelligence", "swimming", "All-American", "app developer", "graduate assistant"],
      keywords_he: ["UGA", "אוניברסיטת ג׳ורג׳יה", "מדעי המחשב", "בינה מלאכותית", "שחייה", "All-American", "מפתח אפליקציה", "עוזר מחקר"],
      answer_en: "At UGA, Kris completed a B.S. in Computer Science, continued into the Double Dawgs M.S. in Artificial Intelligence, competed for the swimming team with All-America recognition, and later built recruiting and roster-analysis software for Swimming & Diving staff.",
      answer_he: "ב-UGA כריס סיים תואר ראשון במדעי המחשב, המשיך לתואר מוסמך בבינה מלאכותית במסלול Double Dawgs, התחרה בנבחרת השחייה וזכה להכרה כ-All-American, ובהמשך בנה תוכנת גיוס וניתוח סגל לצוות השחייה והצלילה.",
      source_ids: ["source-portfolio-education-bs-cs", "source-portfolio-athletics-uga", "source-portfolio-experience-uga-swim"],
      priority: 56
    },
    {
      id: "fact-education-overview",
      subject: "education",
      category: "education",
      intents: ["education"],
      aliases: ["education", "academic background", "what did Kris study", "UGA degree", "השכלה", "מה כריס למד", "תארים"],
      keywords_en: ["study", "studied", "degree", "degrees", "education", "university", "uga", "computer science", "artificial intelligence"],
      keywords_he: ["למד", "לימודים", "תואר", "תארים", "השכלה", "אוניברסיטה", "מדעי המחשב", "בינה מלאכותית"],
      answer_en: "At the University of Georgia, Kris completed a B.S. in Computer Science with an Artificial Intelligence emphasis and a Business minor in May 2026; he is pursuing a Double Dawgs M.S. in Artificial Intelligence expected in December 2026.",
      answer_he: "באוניברסיטת ג׳ורג׳יה כריס סיים במאי 2026 תואר ראשון במדעי המחשב עם דגש בבינה מלאכותית ומינור בעסקים; הוא ממשיך במסלול Double Dawgs לתואר מוסמך בבינה מלאכותית, עם סיום צפוי בדצמבר 2026.",
      source_ids: ["source-portfolio-education-bs-cs", "source-portfolio-education-business", "source-portfolio-education-ms-ai"],
      priority: 28
    },
    {
      id: "fact-swimming-major-achievements",
      subject: "swimming-achievements",
      category: "athletics",
      intents: ["achievements", "swimming"],
      aliases: ["swimming achievements", "major swimming achievements", "competitive swimming record", "הישגי שחייה", "הישגים מרכזיים בשחייה"],
      keywords_en: ["swimming", "achievements", "medal", "records", "all american", "championships", "national team"],
      keywords_he: ["שחייה", "הישגים", "מדליה", "שיאים", "אליפות", "נבחרת ישראל"],
      answer_en: "Kris won bronze at the 2024 European Championships, reached two World Championship semifinals, contributed to Israeli relay records, and earned All-America recognition at UGA in 2023 and 2025.",
      answer_he: "כריס זכה בארד באליפות אירופה 2024, הגיע לשני חצאי גמר באליפות העולם, היה שותף לשיאי שליחים ישראליים וזכה להכרה כ-All-American ב-UGA בשנים 2023 ו-2025.",
      source_ids: ["source-portfolio-athletics-israel", "source-wikipedia-competitive-record", "source-portfolio-athletics-uga"],
      priority: 30
    },
    {
      id: "fact-european-medal-year",
      subject: "european-medal",
      category: "athletics",
      intents: ["date", "achievements", "swimming"],
      aliases: ["European medal", "European Championships medal", "European bronze", "מדליה אירופית", "מדליה באליפות אירופה", "ארד באליפות אירופה"],
      keywords_en: ["which year", "what year", "when", "european", "medal", "bronze", "championships", "2024", "belgrade"],
      keywords_he: ["באיזו שנה", "מתי", "אירופה", "מדליה", "ארד", "אליפות", "2024", "בלגרד"],
      answer_en: "Kris won the European Championships bronze medal in 2024, in Belgrade.",
      answer_he: "כריס זכה במדליית הארד באליפות אירופה בשנת 2024, בבלגרד.",
      source_ids: ["source-portfolio-athletics-israel", "source-wikipedia-competitive-record"],
      priority: 36
    },
    {
      id: "fact-contact-details",
      subject: "contact",
      category: "links",
      intents: ["contact"],
      aliases: ["contact Kris", "email Kris", "phone number", "יצירת קשר", "ליצור קשר", "קשר עם כריס", "אימייל", "טלפון"],
      keywords_en: ["contact", "email", "phone", "github", "linkedin", "resume"],
      keywords_he: ["קשר", "אימייל", "טלפון", "גיטהאב", "לינקדאין", "קורות חיים"],
      answer_en: `Kris’s public contact details are ${Object.keys(contact).find((label) => label.includes("@"))} and ${Object.keys(contact).find((label) => label.startsWith("+"))}; his GitHub, LinkedIn, and résumé are also linked from the portfolio.`,
      answer_he: `פרטי הקשר הציבוריים של כריס הם ${Object.keys(contact).find((label) => label.includes("@"))} ו-${Object.keys(contact).find((label) => label.startsWith("+"))}; קישורים ל-GitHub, ל-LinkedIn ולקורות החיים מופיעים גם בתיק העבודות.`,
      source_ids: ["source-portfolio-links", "source-external-github", "source-external-linkedin", "source-external-resume"],
      priority: 28
    },
    {
      id: "fact-film-hub-technologies-curated",
      subject: filmHub.id,
      category: "projects",
      intents: ["technologies"],
      aliases: ["Film-Hub", "Film Hub", "Cinema Ticketing Website", "פילם האב", "אתר הכרטיסים לקולנוע"],
      keywords_en: ["film hub", "technology", "technologies", "tech", "stack", "built with", "django", "javascript", "supabase"],
      keywords_he: ["פילם האב", "טכנולוגיה", "טכנולוגיות", "סטאק", "נבנה", "django", "javascript", "supabase"],
      answer_en: "Film-Hub uses Django, JavaScript, and Supabase.",
      answer_he: "Film-Hub נבנה עם Django, JavaScript ו-Supabase.",
      source_ids: [filmHub.source_id],
      priority: 50
    }
  ];

  return [...curated, ...generated];
}
