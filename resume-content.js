const resume = {
  name: "Kristian Pitshugin",
  title:
    "Athlete | Computer Science B.S. | AI M.S. Student | Researcher | Full-Stack Developer",
  profileImage: "profile.JPG",
  summary:
    "Computer Science graduate and Double Dawgs M.S. in Artificial Intelligence student focused on full-stack product development, healthcare-oriented research, and data-driven systems. Experience spans AI application work, recruiting and roster-analysis platforms, and production-style applications built with React, Next.js, Django, Supabase, and PostgreSQL.",
  relatedLinks: [
    { label: "Thesis Sources", url: "thesis-sources.html" },
    {
      label: "Resume PDF",
      url: "Kristian-Pitshugin-Resume.pdf",
      download: true,
    },
  ],
  contact: [
    { label: "krispitshugin@gmail.com", url: "mailto:krispitshugin@gmail.com" },
    { label: "+972-52-633-5738", url: "tel:+972526335738" },
    { label: "GitHub", url: "https://github.com/Kris1807" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/kristian-pitshugin-3461001a9/",
    },
  ],
  experience: [
    {
      role: "AI & App Development Intern",
      company: "IntelliVerse",
      period: "Remote | July 2026 - Present",
      highlights: [
        "Contribute to the development, testing, and improvement of AI-driven application features and technical workflows in collaboration with the development team.",
      ],
    },
    {
      role: "App Developer / Incoming Graduate Assistant",
      company: "University of Georgia Swimming & Diving",
      period: "Athens, GA | April 2026 - Present",
      highlights: [
        "Develop a recruiting and roster-analysis application with athlete management, roster projections, recruiting priorities, and collaborative staff tools.",
        "Begin a formal Graduate Assistant appointment in August 2026, supporting team operations and athlete development.",
      ],
    },
    {
      role: "Team Lead & Mobile Developer",
      company: "CoolDawgs Research Team, University of Georgia",
      period: "Athens, GA | Aug 2025 - May 2026",
      highlights: [
        "Led development of a React Native application that collected and visualized data from Bluetooth-connected environmental sensors.",
        "Built temperature summaries and interactive charts for multidisciplinary research recognized with the CURO Best Paper Award.",
      ],
    },
  ],
  projects: [
    {
      name: "Cinema Ticketing Website",
      description: "Full-stack developer.",
      highlights: [
        "Developed a full-stack movie ticket booking platform with dynamic seat selection, checkout flow, and reservation logic.",
        "Implemented seat states including available, held, and booked to prevent double-booking and handle concurrent users.",
        "Designed server-side temporary seat holds that automatically expire if checkout is not completed.",
        "Contributed frontend components for booking, payment, saved cards, navigation, and user interaction.",
      ],
      link: "https://film-hub-theta.vercel.app/",
    },
    {
      name: "Patient Record App",
      description: "Full-stack medical records platform.",
      highlights: [
        "Built a secure patient record management system for patient intake, treatment sessions, appointments, and PDF exports.",
        "Implemented authentication, row-level security, patient search/filtering, automatic age calculation, and session numbering.",
        "Designed relational database schemas for patients, reports, and appointments with protected multi-user access.",
        "Added reusable clinical note templates and PDF summary exports, including support for Hebrew notes.",
        "Stack: React/Next.js, Supabase Auth, PostgreSQL.",
      ],
      link: "https://keepatients.vercel.app/",
    },
    {
      name: "DoCompare",
      description: "Document comparison web application.",
      highlights: [
        "Built a lightweight web app for comparing two legal-style documents side by side.",
        "Added protected account access so document data is only visible after sign-in.",
        "Implemented quoted-difference review, downloadable reports, and per-user cached comparisons.",
        "Supports PDF, DOCX, TXT, and Markdown uploads with Supabase-backed storage workflows.",
      ],
      link: "https://do-compare-879rlbsk4-kris-projects-c44a0f3c.vercel.app/",
    },
    {
      name: "Roster Lab App",
      description: "Full-stack developer.",
      highlights: [
        "Developed a swim team recruiting and roster analysis platform for managing athletes, commits, roster turnover, and recruiting priorities.",
        "Built analytics for roster projections, team strength scoring, recruiting needs, and what-if recruit simulations.",
        "Implemented searchable roster views, best-time tables, filtering/sorting, CSV/XLSX import, and CSV export.",
        "Added shared authentication with role-based admin access for collaborative staff use.",
        "Stack: Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL.",
      ],
      link: "https://swimming-stats.vercel.app/",
    },
    {
      name: "CNN Project",
      description: "Deep learning and model evaluation project.",
      highlights: [
        "Built a convolutional neural network project centered on model training, evaluation, and iterative performance improvement.",
        "Implemented supporting workflows for dataset handling, evaluation output, and model analysis.",
        "Added Grad-CAM style visualization tooling to inspect how the model makes predictions.",
      ],
      link: "",
    },
    {
      name: "Personal Profile Website",
      description: "GitHub Pages portfolio site.",
      highlights: [
        "Designed and deployed a responsive personal portfolio website using GitHub Pages.",
        "Implemented modular, data-driven sections for education, experience, projects, honors, athletics, and skills.",
        "Added dedicated page structure for thesis references and future academic source tracking.",
        "Stack: HTML, CSS, JavaScript, Git, GitHub Pages.",
      ],
      link: "https://kris1807.github.io/Personal-Website/",
    },
  ],
  education: [
    {
      degree: "Master of Science in Artificial Intelligence\nDouble Dawgs Program",
      school: "University of Georgia, School of Computing",
      period: "Expected December 2026",
    },
    {
      degree:
        "Bachelor of Science in Computer Science\nArea of Emphasis in Artificial Intelligence",
      school: "University of Georgia, School of Computing",
      period: "Graduated May 2026",
    },
    {
      degree: "Minor in Business",
      school: "University of Georgia",
      period: "Graduated May 2026",
    },
    {
      degree: "Relevant Coursework & Credentials",
      school: "University of Georgia / Independent Study",
      period: "Current",
      details: [
        "Google Cybersecurity Certificate",
        "Swimming & Diving Team Scholarship",
      ],
    },
  ],
  honors: [
    "Morton S. Hodgson, Jr. Men's Swimming and Diving Scholarship",
    "Carey Louis Davis Scholarship",
    "SEC Academic Honor Roll",
    "University of Georgia Presidential Scholars honors",
    "J. Reid Parker Director of Athletics Honor Roll for receiving multiple 4.0 semesters",
    "Best Paper award with the CoolDawgs lead team at CURO",
  ],
  athletics: [
    {
      organization: "UGA Swimming and Diving",
      period: "August 2022 - May 2025",
      achievements: [
        "All American for 2023 and 2025",
        "8th place at the SEC conference",
        "6th and 8th place at NCAA as a relay swimmer",
        "Part of the school records in the 200 and 400 IM relays",
        "8th fastest result in the 100Y breaststroke",
        "Fastest 50Y breaststroke in school history",
      ],
    },
    {
      organization: "International - Israel National Team",
      period: "September 2019 - Present",
      achievements: [
        "3rd place at the European Championships 2024",
        "One of only three Israeli swimmers to make two semifinals at World Championships",
        "10th and 14th place at the World Championships 2022",
        "Two gold medals at Switzerland Olympic Trials competition",
        "Part of 2 Israeli relay records for the national team",
      ],
    },
    {
      organization: "National - Greater Jerusalem Swimming Club",
      period: "September 2019 - Present",
      achievements: [
        "Only swimmer in club history to win a medal at European Championships",
        "Israeli record holder in 3 individual events and 2 additional relay events",
        "Israeli champion since 2020 in both short-course and long-course pools",
      ],
    },
  ],
  skills: [
    {
      category: "Programming Languages",
      items: [
        "Python",
        "Java",
        "C",
        "C++",
        "JavaScript",
        "TypeScript",
        "SQL",
        "Assembly",
      ],
    },
    {
      category: "Frameworks / Libraries",
      items: [
        "React",
        "React Native",
        "Expo",
        "JavaFX",
        "Django",
        "Node.js",
        "Tailwind CSS",
      ],
    },
    {
      category: "Databases / Platforms",
      items: [
        "PostgreSQL",
        "MongoDB",
        "Supabase",
        "Firebase",
        "Firestore",
      ],
    },
    {
      category: "Tools / Hardware",
      items: ["Git/GitHub", "Prisma", "Arduino", "KiCad"],
    },
    {
      category: "Languages",
      items: ["Hebrew - Native", "English - Fluent", "Russian - Professional"],
    },
  ],
};
