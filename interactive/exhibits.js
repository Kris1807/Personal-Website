const cvLink = (chapter, label) => ({ label, url: `../#portfolio-${chapter}` });
const photoByName = (photos, fileName) => photos.find((photo) => photo.src.endsWith(`/${fileName}`));

function projectExhibits(projects) {
  const priority = ["Roster Lab App", "CNN Project", "Patient Record App"];
  const rank = (item) => priority.includes(item.name) ? priority.indexOf(item.name) : priority.length;
  return [...projects].sort((a, b) => rank(a) - rank(b)).map((item) => ({
    title: item.name === "Cinema Ticketing Website" ? "Film-Hub" : item.name,
    label: item.category,
    description: item.summary,
    sections: [
      ["My role", item.role],
      ["Problem", item.problem],
      ["What I built", item.solution],
      ["Outcome", item.outcome],
    ].filter(([, detail]) => detail),
    facts: item.decisions || item.highlights,
    tags: item.stack,
    links: [...(item.links || []), cvLink("projects", "Portfolio case studies")],
    awaitingRecording: item.name === priority[0],
  }));
}

function skillsExhibits(resume) {
  const frameworks = new Set(resume.skills.flatMap(({ items }) => items));
  const groups = resume.skills.map(({ category, items }) => ({
    title: category === "Languages" ? "Spoken Languages" : category.replace(" / ", " & "),
    label: "Toolbox",
    tags: category === "Frameworks / Libraries" && !frameworks.has("Next.js") ? ["Next.js", ...items] : items,
    links: [cvLink("skills", "Full skills list")],
  }));
  const experience = resume.experience.map((role) => ({
    title: role.role,
    label: role.company,
    description: role.impact,
    facts: [role.period, ...role.highlights],
    tags: role.focusAreas,
    photo: role.image && { src: role.image, alt: role.imageAlt, fit: "document" },
    links: [cvLink("experience", "Experience in the CV")],
  }));
  const rosterLab = resume.projects.find((project) => project.name === "Roster Lab App");
  return [
    ...experience,
    {
      title: "Full-stack engineering",
      label: rosterLab.name,
      description: rosterLab.solution,
      tags: rosterLab.stack,
      links: [cvLink("projects", "Roster Lab case study"), ...rosterLab.links],
    },
    ...groups,
  ];
}

function swimmingExhibits(resume) {
  const [college, international, club] = resume.athletics;
  const [europeanBronze, semifinals, worldResults, trials, relayRecords] = international.achievements;
  const photos = resume.athleticsGallery;
  const medalWall = photoByName(resume.honorsGallery, "medal-wall.jpeg");
  const photo = (number) => photoByName(photos, `athletics-${number}.jpeg`);
  const links = [cvLink("athletics", "Swimming in the CV")];
  return [
    { title: "European Championships bronze", label: "Israel national team · 2024", facts: [europeanBronze], photo: photo("01"), links },
    { title: "NCAA All-American & team records", label: college.organization, facts: college.achievements, photo: photo("07"), links },
    { title: "World Championships semifinals", label: "Israel national team", facts: [semifinals, worldResults], photo: photo("09"), links },
    { title: "Israeli records & national titles", label: "Greater Jerusalem Swimming Club", facts: [...club.achievements, relayRecords], photo: photo("12"), links },
    {
      title: "Swiss Olympic Trials", label: "International competition", facts: [trials], links,
      photo: {
        src: "assets/athletics/swiss-olympic-trials.webp",
        alt: "Kristian Pitshugin smiling and flexing in the pool beside a red lane line.",
        caption: "Swiss Olympic Trials. Photo © G. Velletri.",
        fit: "contain",
      },
    },
    { title: "Medal wall", label: "Athletics and academics", photo: medalWall, links },
    {
      title: "Race photographs", label: "In the water", photo: photo("04"),
      photos: ["04", "03", "05", "06", "11", "12"].map(photo), links,
    },
    {
      title: "On deck", label: "Competition gallery", photo: photo("10"),
      photos: ["10", "07", "08", "09"].map(photo), links,
    },
  ];
}

function educationExhibits(resume) {
  const diplomas = resume.educationGallery;
  const photo = (file) => photoByName(diplomas, file);
  const links = [cvLink("education", "Education in the CV")];
  const degrees = resume.education.map((item) => {
    const [title, description] = item.degree.split("\n");
    return {
      title,
      label: item.period,
      description,
      facts: [item.school, ...(item.details || [])],
      photo: title.startsWith("Bachelor of Science") ? photo("bs-computer-science-diploma.png") : undefined,
      links,
    };
  });
  return [
    degrees[0],
    degrees[1],
    {
      title: "Master’s thesis",
      label: "Physician scheduling · University of Georgia",
      description: "Evolutionary optimization of physician scheduling using bipartite matching and machine learning.",
      links: [{ label: "Thesis proposal", url: "../thesis-proposal.pdf" }, { label: "Thesis sources", url: "../thesis-sources.html" }],
    },
    ...degrees.slice(2),
    { title: "Google Cybersecurity", label: "Professional Certificate", photo: photo("google-cybersecurity-v2.jpg"), links },
    { title: "Intermediate Machine Learning", label: "Kaggle certificate", photo: photo("intermediate-machine-learning.png"), links },
    {
      title: "UGA graduation gallery", label: "University of Georgia · May 2026",
      photo: photo("graduation-arch.jpeg"),
      photos: ["graduation-arch.jpeg", "graduation-stadium.jpeg", "graduation-classic-center.jpeg", "graduation-indoor.jpeg"].map(photo),
      links,
    },
  ];
}

function honorsExhibits(resume) {
  const details = [
    ["CURO Symposium Best Paper", "Research · 2026", "2026 CURO", "curo-best-paper-2026.jpeg"],
    ["Presidential Scholar", "University of Georgia · Fall 2024", "UGA Presidential", "presidential-scholar-fall-2024.jpeg"],
    ["SEC Academic Honor Roll", "Southeastern Conference", "SEC Academic", "sec-academic-honor-roll-2025-2026.jpeg"],
    ["Scholar Athlete", "University of Georgia · 2024–25", "UGA Scholar Athlete", "scholar-athlete-2024-2025.jpeg"],
    ["Academic Achievement", "University of Georgia · 2023–24", "UGA Academic Achievement", "academic-achievement-2023-2024.jpeg"],
    ["Morton S. Hodgson, Jr. Scholarship", "Men’s Swimming and Diving", "Morton S. Hodgson"],
    ["Carey Louis Davis Scholarship", "University of Georgia", "Carey Louis Davis"],
    ["Director of Athletics Honor Roll", "J. Reid Parker Honor Roll", "J. Reid Parker"],
  ];
  const gallery = resume.honorsGallery;
  const links = [cvLink("honors", "Honors in the CV")];
  const awards = details.map(([title, label, match, file]) => ({
    title, label, description: resume.honors.find((honor) => honor.startsWith(match)),
    photo: photoByName(gallery, file), links,
    photos: match === "SEC Academic" ? [
      photoByName(gallery, file),
      photoByName(gallery, "sec-academic-honor-roll-2025.jpeg"),
      photoByName(gallery, "sec-academic-honor-roll-2023.jpeg"),
    ] : undefined,
  }));
  return awards;
}

export function createRooms(resume) {
  return {
    lobby: {
      title: "The Lobby", description: "Walk up to a door to explore the museum.", tone: "#a69b8a",
      exhibits: [{
        title: "Kristian Pitshugin", label: "CV & contact",
        description: resume.positioning,
        photo: { src: resume.profileImage, alt: "Portrait of Kristian Pitshugin" },
        links: [
          { label: "Download résumé", url: `../${resume.resumeFile}`, download: true },
          ...resume.contact,
        ],
      }],
    },
    projects: {
      title: "Projects", description: "Explore the systems I built and the problems they solve.", tone: "#8b928c",
      exhibits: projectExhibits(resume.projects),
    },
    skills: {
      title: "Skills & Experience", description: "See where I put my tools and skills to work.", tone: "#9b8c7c",
      exhibits: skillsExhibits(resume),
    },
    swimming: {
      title: "Swimming", description: "Race results and moments from the NCAA and international competition.", tone: "#7f9398",
      exhibits: swimmingExhibits(resume),
    },
    education: {
      title: "Education", description: "My academic path at the University of Georgia.", tone: "#9c9288",
      exhibits: educationExhibits(resume),
    },
    honors: {
      title: "Honors", description: "Awards in research, academics, and athletics.", tone: "#9e8b81",
      exhibits: honorsExhibits(resume),
    },
  };
}
