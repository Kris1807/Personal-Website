const resume = {
  name: "Kristian Pitshugin",
  title: "Software Engineer · AI Graduate Student · Former NCAA Division I Athlete",
  positioning:
    "Building reliable product systems across AI, research, healthcare, and athlete operations.",
  profileImage: "profile.JPG",
  summary:
    "Double Dawgs M.S. in Artificial Intelligence student at the University of Georgia with experience spanning AI application workflows, internal athlete tools, research delivery, and full-stack product engineering. I care about systems that are structured, trustworthy, and clear under real-world use.",
  resumeFile: "Kristian-Pitshugin-Resume.pdf",
  heroHighlights: [
    "UGA Double Dawgs",
    "Israeli national team",
    "Research lead",
    "Full-stack delivery",
  ],
  heroCards: {
    athletics: {
      label: "European medalist",
      detail: "Israel national team",
      image: "assets/athletics/athletics-01.jpeg",
      alt: "Kristian Pitshugin holding a European Championships medal.",
    },
    education: {
      label: "UGA graduation",
      detail: "B.S. Computer Science",
      image: "assets/education/education-01.jpeg",
      alt: "Kristian Pitshugin at graduation in cap and gown holding his diploma.",
    },
  },
  about: {
    eyebrow: "About",
    heading:
      "Engineering shaped by research discipline, competitive sport, and long-horizon execution.",
    intro:
      "I move between product building, applied AI, and team leadership. That mix shows up in how I work: precise with details, calm under pressure, and focused on making complex systems usable for real people.",
    stats: [
      {
        value: "B.S. CS + M.S. AI",
        label: "Academic track at UGA",
      },
      {
        value: "NCAA / ISR",
        label: "College and international competition",
      },
      {
        value: "AI · product · research",
        label: "Work shaped by delivery and technical depth",
      },
    ],
    notes: [
      {
        title: "Engineering",
        copy:
          "I like systems that feel dependable in real usage, whether that means a clinical workflow, a recruiting platform, or an internal decision tool with complex state behind it.",
      },
      {
        title: "Research and AI",
        copy:
          "My research and AI work sit close to implementation. I care less about prototypes that look impressive once and more about workflows that stay useful after repeated use.",
      },
      {
        title: "Leadership",
        copy:
          "Swimming and research both taught me to communicate clearly, make tradeoffs visible, and keep a team moving without lowering the quality bar.",
      },
    ],
  },
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
      image: "assets/experience/intelliverse.jpeg",
      imageAlt: "IntelliVerse visual mark.",
      impact:
        "Contributing to live AI product workflows through feature delivery, testing, and technical iteration.",
      focusAreas: ["AI features", "Testing", "Workflow design"],
      highlights: [
        "Contribute to the development, testing, and improvement of AI-driven application features and technical workflows in collaboration with the development team.",
      ],
    },
    {
      role: "App Developer / Incoming Graduate Assistant",
      company: "University of Georgia Swimming & Diving",
      period: "Athens, GA | April 2026 - Present",
      image: "assets/experience/uga.webp",
      imageAlt: "University of Georgia logo.",
      impact:
        "Building internal recruiting and roster-analysis tools that support staff planning and athlete operations.",
      focusAreas: ["Recruiting", "Roster analytics", "Staff tools"],
      highlights: [
        "Develop a recruiting and roster-analysis application with athlete management, roster projections, recruiting priorities, and collaborative staff tools.",
        "Begin a formal Graduate Assistant appointment in August 2026, supporting team operations and athlete development.",
      ],
    },
    {
      role: "Team Lead & Mobile Developer",
      company: "CoolDawgs Research Team, University of Georgia",
      period: "Athens, GA | Aug 2025 - May 2026",
      image: "assets/experience/cooldawgs.png",
      imageAlt: "CoolDawgs research team logo.",
      impact:
        "Led the mobile build for an award-winning research system tied to live Bluetooth sensor data.",
      focusAreas: ["React Native", "Sensor systems", "Data visualization"],
      highlights: [
        "Led development of a React Native application that collected and visualized data from Bluetooth-connected environmental sensors.",
        "Built temperature summaries and interactive charts for multidisciplinary research recognized with the CURO Best Paper Award.",
      ],
    },
  ],
  projects: [
    {
      name: "Roster Lab App",
      featured: true,
      category: "Athlete operations",
      role: "Product designer / full-stack developer",
      summary:
        "Recruiting and roster-analysis platform for swim staff to manage athlete data, projections, and recruiting priorities in one shared workflow.",
      problem:
        "Staff planning depended on fragmented spreadsheets and manual comparison across current athletes, projected departures, and recruiting needs.",
      solution:
        "Built a shared decision platform with searchable roster views, recruiting dashboards, scenario analysis, and team-strength projections.",
      decisions: [
        "Structured the product around eligibility, event profile, and projected roster turnover instead of static athlete records.",
        "Separated input workflows from analysis views so staff could move between roster maintenance and what-if planning without losing context.",
        "Used a typed Next.js + Prisma stack to keep shared data reliable and easy to extend as recruiting logic evolves.",
      ],
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"],
      outcome:
        "Turned roster planning into a repeatable product workflow that supports staff alignment, recruiting conversations, and long-range team decisions.",
      links: [
        {
          label: "Live product",
          url: "https://swimming-stats.vercel.app/",
        },
      ],
    },
    {
      name: "Patient Record App",
      featured: true,
      category: "Healthcare workflows",
      role: "Full-stack developer",
      summary:
        "Clinical records platform for patient intake, treatment tracking, appointments, and exportable summaries.",
      problem:
        "The workflow needed faster record entry and better structure without losing safeguards around privacy, data integrity, and repeat session tracking.",
      solution:
        "Built a secure patient management system with structured reports, reusable note templates, appointment tracking, and PDF exports.",
      decisions: [
        "Used Supabase authentication and row-level security to keep records protected in a multi-user environment.",
        "Modeled patients, treatment reports, and appointments as related entities so summaries, numbering, and history stay consistent.",
        "Added export and reusable documentation flows to make the system useful beyond raw data storage.",
      ],
      stack: ["React", "Next.js", "Supabase Auth", "PostgreSQL", "PDF export"],
      outcome:
        "Created a structured workflow for patient records that balances speed of use with data integrity and practical reporting needs.",
      links: [
        {
          label: "Live product",
          url: "https://keepatients.vercel.app/",
        },
      ],
    },
    {
      name: "Cinema Ticketing Website",
      featured: true,
      category: "Booking systems",
      role: "Full-stack developer",
      summary:
        "Movie ticketing platform designed around seat state, checkout flow, and concurrency-safe reservation logic.",
      problem:
        "Ticket selection only works when inventory stays accurate under simultaneous users, expiring holds, and partially completed checkouts.",
      solution:
        "Built a booking experience with dynamic seat states, temporary holds, reusable checkout flows, and protection against double booking.",
      decisions: [
        "Modeled seats as available, held, or booked so the UI could reflect real booking state instead of optimistic assumptions.",
        "Handled temporary holds on the server and expired them automatically when checkout was abandoned.",
        "Kept booking, payment, and account interactions modular so the full flow remained maintainable as the feature set expanded.",
      ],
      stack: ["Django", "JavaScript", "Supabase", "Booking logic"],
      outcome:
        "Delivered a reliable reservation flow that protects inventory accuracy while still feeling responsive to the user.",
      links: [
        {
          label: "Live product",
          url: "https://film-hub-theta.vercel.app/",
        },
      ],
    },
    {
      name: "DoCompare",
      category: "Document intelligence",
      role: "Product developer",
      summary:
        "Side-by-side document comparison app for reviewing legal-style text differences with protected access and downloadable outputs.",
      highlights: [
        "Supports PDF, DOCX, TXT, and Markdown uploads with Supabase-backed storage workflows.",
        "Includes quoted-difference review, per-user protected access, and downloadable comparison reports.",
      ],
      stack: ["Next.js", "Supabase", "File processing"],
      links: [
        {
          label: "Live product",
          url: "https://do-compare-879rlbsk4-kris-projects-c44a0f3c.vercel.app/",
        },
      ],
    },
    {
      name: "CNN Project",
      featured: true,
      category: "Applied AI / vision",
      role: "Model design, training, and evaluation",
      summary:
        "End-to-end convolutional neural network project built from scratch to train, evaluate, and interpret image-based predictions through a deployable demo workflow.",
      problem:
        "The project needed more than a model that produced predictions. It required a full training pipeline, repeatable evaluation, and visibility into how the network was making decisions so performance could be improved with confidence.",
      solution:
        "Built the project as a complete applied-AI system with dataset handling, custom training loops, evaluation reporting, Grad-CAM interpretability views, and a live inference demo for presenting model behavior clearly.",
      decisions: [
        "Structured the workflow around repeatable training and evaluation so model changes could be compared intentionally instead of by isolated trial and error.",
        "Added interpretability tooling to inspect activation focus and understand why predictions were made, not just whether they were correct.",
        "Connected the trained model to a live demo experience so the project could be used as a practical product artifact rather than remaining a notebook-only experiment.",
      ],
      stack: ["Python", "CNNs", "Model training", "Evaluation", "Grad-CAM"],
      outcome:
        "Produced an impressive end-to-end vision project that demonstrates model training from scratch, iterative performance analysis, and interpretable predictions in a deployable format.",
      links: [
        {
          label: "Live demo",
          url: "https://faceimp.onrender.com/",
        },
      ],
    },
    {
      name: "Personal Profile Website",
      category: "Portfolio systems",
      role: "Design and frontend implementation",
      summary:
        "Personal portfolio built to present experience, projects, athletics, and thesis work in a clearer, more editorial format.",
      highlights: [
        "Moved the site from a single résumé-style page into a multi-page portfolio with dedicated sections and image-driven storytelling.",
        "Built a data-driven structure so content updates flow through shared rendering logic instead of being hardcoded page by page.",
      ],
      stack: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
      links: [
        {
          label: "Live site",
          url: "https://krispitshugin.com/",
        },
      ],
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
      details: ["Magna Cum Laude"],
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
        "Google Cybersecurity Professional Certificate",
        "Kaggle Intermediate Machine Learning certificate",
        "Swimming & Diving Team Scholarship",
      ],
    },
  ],
  educationGallery: [
    {
      src: "assets/education/education-01.jpeg",
      alt: "Kristian Pitshugin at graduation in cap and gown holding his diploma.",
    },
    {
      src: "assets/education/education-02.jpeg",
      alt: "Kristian Pitshugin at Sanford Stadium during graduation ceremonies.",
    },
    {
      src: "assets/education/education-03.jpeg",
      alt: "Kristian Pitshugin outside after graduation holding his diploma.",
    },
    {
      src: "assets/education/education-04.jpeg",
      alt: "Kristian Pitshugin under the University of Georgia arch in graduation attire.",
    },
    {
      src: "assets/honors/honors-01.jpeg",
      alt: "University of Georgia Presidential Scholar certificate awarded to Kristian Pitshugin for Fall 2024.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-02.jpeg",
      alt: "University of Georgia Scholar Athlete certificate recognizing Kristian Pitshugin for the 2024-2025 academic year.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-03.jpeg",
      alt: "University of Georgia Academic Achievement certificate recognizing Kristian Pitshugin for the 2023-2024 academic year.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-04.jpeg",
      alt: "Southeastern Conference Academic Honor Roll certificate awarded to Kristian Pitshugin for 2025-2026.",
      fit: "document",
    },
    {
      src: "assets/education/education-05.png",
      alt: "Bachelor of Science diploma from the University of Georgia awarded to Kristian Pitshugin in May 2026.",
      fit: "document",
    },
    {
      src: "assets/education/education-06.jpg",
      alt: "Google Cybersecurity Professional Certificate awarded to Kristian Pitshugin.",
      fit: "document",
    },
    {
      src: "assets/education/education-07.png",
      alt: "Kaggle Intermediate Machine Learning certificate awarded to Kristian Pitshugin.",
      fit: "document",
    },
  ],
  honors: [
    "Morton S. Hodgson, Jr. Men's Swimming and Diving Scholarship",
    "Carey Louis Davis Scholarship",
    "UGA Presidential Scholar (Fall 2024)",
    "UGA Scholar Athlete recognition (2024-2025)",
    "UGA Academic Achievement recognition (2023-2024)",
    "SEC Academic Honor Roll (2025-2026)",
    "J. Reid Parker Director of Athletics Honor Roll for receiving multiple 4.0 semesters",
    "2026 CURO Symposium Best Paper in Technology, Engineering, and Math for the VIPR CoolDawgs wearable sensor and mobile application project",
  ],
  honorsGallery: [
    {
      src: "assets/honors/honors-01.jpeg",
      alt: "University of Georgia Presidential Scholar certificate awarded to Kristian Pitshugin for Fall 2024.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-02.jpeg",
      alt: "University of Georgia Scholar Athlete certificate recognizing Kristian Pitshugin for the 2024-2025 academic year.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-03.jpeg",
      alt: "University of Georgia Academic Achievement certificate recognizing Kristian Pitshugin for the 2023-2024 academic year.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-04.jpeg",
      alt: "Southeastern Conference Academic Honor Roll certificate awarded to Kristian Pitshugin for 2025-2026.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-05.jpeg",
      alt: "CURO Best Paper recognition certificate for the VIPR CoolDawgs wearable sensor and mobile application project.",
      fit: "document",
    },
    {
      src: "assets/honors/honors-06.jpeg",
      alt: "Kristian Pitshugin's wall of medals, trophies, and framed recognitions.",
    },
    {
      src: "assets/honors/honors-07.jpeg",
      alt: "Framed SEC Academic Honor Roll certificate displayed among Kristian Pitshugin's honors.",
      fit: "document",
    },
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
  athleticsGallery: [
    {
      src: "assets/athletics/athletics-01.jpeg",
      alt: "Kristian Pitshugin holding a European Championships medal.",
    },
    {
      src: "assets/athletics/athletics-03.jpeg",
      alt: "Kristian Pitshugin smiling in the pool after a race.",
    },
    {
      src: "assets/athletics/athletics-04.jpeg",
      alt: "Kristian Pitshugin racing breaststroke in competition.",
    },
    {
      src: "assets/athletics/athletics-05.jpeg",
      alt: "Kristian Pitshugin powering through a breaststroke race.",
    },
    {
      src: "assets/athletics/athletics-06.jpeg",
      alt: "Overhead action shot of Kristian Pitshugin in the pool during competition.",
    },
    {
      src: "assets/athletics/athletics-07.jpeg",
      alt: "Kristian Pitshugin focused before a race in UGA gear.",
    },
    {
      src: "assets/athletics/athletics-08.jpeg",
      alt: "Kristian Pitshugin seated on deck before competition.",
    },
    {
      src: "assets/athletics/athletics-09.jpeg",
      alt: "Kristian Pitshugin walking onto the World Aquatics competition deck.",
    },
    {
      src: "assets/athletics/athletics-10.jpeg",
      alt: "Kristian Pitshugin waving at the European Championships venue.",
    },
    {
      src: "assets/athletics/athletics-11.jpeg",
      alt: "Kristian Pitshugin at the wall after a race in the pool.",
    },
    {
      src: "assets/athletics/athletics-12.jpeg",
      alt: "Kristian Pitshugin racing breaststroke for Israel.",
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

if (typeof globalThis !== "undefined") {
  globalThis.resume = resume;
}
