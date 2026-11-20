export function createRooms(resume) {
  const rosterLab = resume.projects.find((project) => project.name === "Roster Lab App");
  const cnn = resume.projects.find((project) => project.name === "CNN Project");

  const project = (item, style) => ({
    title: item.name,
    label: item.category,
    description: item.summary,
    facts: [item.role, item.solution],
    tags: item.stack,
    links: [...item.links, { label: "Portfolio case studies", url: "../#portfolio-projects" }],
    style,
  });

  const athletics = (item, title, photo) => ({
    title,
    label: item.organization,
    facts: item.achievements,
    photo,
    links: [{ label: "Swimming in the CV", url: "../#portfolio-athletics" }],
  });

  const education = (item, title, photo) => ({
    title,
    label: item.period,
    description: item.degree.replaceAll("\n", " · "),
    facts: [item.school, ...(item.details || [])],
    photo,
    links: [{ label: "Education in the CV", url: "../#portfolio-education" }],
  });

  const honor = (title, photo) => ({
    title,
    label: "University of Georgia",
    description: photo.caption,
    photo,
    links: [{ label: "Honors in the CV", url: "../#portfolio-honors" }],
  });

  return {
    lobby: { title: "The Lobby", description: "Walk up to a door to explore the museum.", tone: "#a69b8a" },
    projects: {
      title: "Projects",
      description: "Explore the systems I built and the problems they solve.",
      tone: "#8b928c",
      exhibits: [project(rosterLab, "roster"), project(cnn, "vision")],
    },
    skills: {
      title: "Skills & Experience",
      description: "See where I put my tools and skills to work.",
      tone: "#9b8c7c",
      exhibits: [
        {
          title: "Full-stack engineering",
          label: rosterLab.name,
          description: rosterLab.solution,
          tags: rosterLab.stack,
          links: rosterLab.links,
          style: "type",
        },
        ...resume.experience.slice(0, 2).map((role) => ({
          title: role.role,
          label: role.company,
          description: role.impact,
          facts: [role.period, ...role.highlights],
          tags: role.focusAreas,
          photo: { src: role.image, alt: role.imageAlt, fit: "document" },
          links: [{ label: "Experience in the CV", url: "../#portfolio-experience" }],
        })),
      ],
    },
    swimming: {
      title: "Swimming",
      description: "Race results and moments from the NCAA and international competition.",
      tone: "#7f9398",
      exhibits: [
        athletics(resume.athletics[1], "European Championships medal", resume.athleticsGallery[0]),
        athletics(resume.athletics[0], "University of Georgia swimming", resume.athleticsGallery.find((photo) => photo.src.endsWith("athletics-07.jpeg"))),
      ],
    },
    education: {
      title: "Education",
      description: "My academic path at the University of Georgia.",
      tone: "#9c9288",
      exhibits: [
        education(resume.education[1], "B.S. in Computer Science", resume.educationGallery.find((photo) => photo.src.endsWith("bs-computer-science-diploma.png"))),
        education(resume.education[0], "M.S. in Artificial Intelligence"),
      ],
    },
    honors: {
      title: "Honors",
      description: "Selected awards in research, academics, and athletics.",
      tone: "#9e8b81",
      exhibits: [
        honor("CURO Symposium Best Paper", resume.honorsGallery.find((photo) => photo.src.endsWith("curo-best-paper-2026.jpeg"))),
        honor("UGA Presidential Scholar", resume.honorsGallery.find((photo) => photo.src.endsWith("presidential-scholar-fall-2024.jpeg"))),
        honor("SEC Academic Honor Roll", resume.honorsGallery.find((photo) => photo.src.endsWith("sec-academic-honor-roll-2025-2026.jpeg"))),
      ],
    },
  };
}
