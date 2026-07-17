const sectionMeta = {
  experience: {
    label: "Experience",
    href: "experience.html",
    eyebrow: "Professional Focus",
    description: "Research, technical leadership, and hands-on delivery work in one focused view.",
  },
  education: {
    label: "Education",
    href: "education.html",
    eyebrow: "Academic Path",
    description: "Degrees, academic direction, and supporting credentials without extra clutter.",
  },
  projects: {
    label: "Projects",
    href: "projects.html",
    eyebrow: "Built Work",
    description: "A focused walkthrough of the products and systems I have built and shipped.",
  },
  honors: {
    label: "Honors",
    href: "honors.html",
    eyebrow: "Recognition",
    description: "Awards, distinctions, and milestones that stand out across academics and athletics.",
  },
  athletics: {
    label: "Athletics",
    href: "athletics.html",
    eyebrow: "Competition",
    description: "Swimming achievements across university, national, and international levels.",
  },
  skills: {
    label: "Skills",
    href: "skills.html",
    eyebrow: "Toolbox",
    description: "A clean breakdown of languages, frameworks, platforms, and tools I use most.",
  },
};

const sectionOrder = [
  "experience",
  "education",
  "projects",
  "honors",
  "athletics",
  "skills",
];

const formatText = (value) =>
  String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

const isExternalLink = (url) => url.startsWith("http://") || url.startsWith("https://");

function applyRevealMotion(element, index = 0, step = 45) {
  if (!element) return element;
  element.classList.add("reveal-card");
  element.style.setProperty("--reveal-delay", `${index * step}ms`);
  return element;
}

function finalizePageLoad() {
  const reveal = () => document.body.classList.remove("is-loading");
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.finally(() => requestAnimationFrame(reveal));
  } else {
    requestAnimationFrame(reveal);
  }
}

function fillBasicIdentity() {
  document.title = `${resume.name}`;

  const title = document.getElementById("title");
  const name = document.getElementById("name");
  const summary = document.getElementById("summary");
  const image = document.getElementById("profile-image");
  const imageWrap = document.getElementById("profile-image-wrap");

  if (title) {
    title.textContent = resume.title;
    title.classList.remove("skeleton-text", "skeleton-eyebrow");
  }
  if (name) {
    name.textContent = resume.name;
    name.classList.remove("skeleton-text", "skeleton-name");
  }
  if (summary) {
    summary.textContent = resume.summary;
    summary.classList.remove("skeleton-text", "skeleton-summary");
  }

  if (image && imageWrap) {
    if (resume.profileImage && resume.profileImage.trim() !== "") {
      const revealImage = () => {
        image.hidden = false;
        imageWrap.classList.remove("media-loading");
      };
      image.addEventListener("load", revealImage, { once: true });
      image.addEventListener(
        "error",
        () => imageWrap.classList.remove("media-loading"),
        { once: true }
      );
      image.src = resume.profileImage;
      if (image.complete) {
        revealImage();
      }
    } else {
      imageWrap.style.display = "none";
    }
  }
}

function renderContact() {
  const root = document.getElementById("contact");
  if (!root) return;

  root.innerHTML = "";
  resume.contact.forEach((entry, index) => {
    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.label;
    if (isExternalLink(entry.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    root.appendChild(applyRevealMotion(link, index, 35));
  });
}

function renderRelatedLinks() {
  const panel = document.getElementById("related-links-panel");
  const root = document.getElementById("related-links");
  if (!panel || !root) return;

  if (!Array.isArray(resume.relatedLinks) || resume.relatedLinks.length === 0) {
    panel.style.display = "none";
    return;
  }

  root.innerHTML = "";
  resume.relatedLinks.forEach((entry, index) => {
    const link = document.createElement("a");
    link.className = "related-link";
    link.href = entry.url;
    link.textContent = entry.label;
    if (entry.download) {
      link.download = entry.download === true ? "" : entry.download;
    } else if (isExternalLink(entry.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    root.appendChild(applyRevealMotion(link, index));
  });
}

function renderSectionNav(currentKey) {
  const root = document.getElementById("section-nav");
  if (!root) return;

  root.innerHTML = "";
  sectionOrder.forEach((key, index) => {
    const item = sectionMeta[key];
    const link = document.createElement("a");
    link.className = `section-pill${currentKey === key ? " is-active" : ""}`;
    link.href = item.href;
    link.textContent = item.label;
    root.appendChild(applyRevealMotion(link, index, 28));
  });
}

function renderLandingNav() {
  const root = document.getElementById("section-nav");
  if (!root) return;

  root.innerHTML = "";
  sectionOrder.forEach((key, index) => {
    const item = sectionMeta[key];
    const link = document.createElement("a");
    link.className = "nav-button";
    link.href = item.href;
    link.innerHTML = `
      <span class="nav-button-label">${item.label}</span>
      <span class="nav-button-copy">${item.description}</span>
    `;
    root.appendChild(applyRevealMotion(link, index));
  });
}

function createCard(innerHtml, index = 0) {
  const article = document.createElement("article");
  article.className = "card detail-card";
  article.innerHTML = innerHtml;
  return applyRevealMotion(article, index);
}

function renderExperience(root) {
  root.innerHTML = "";
  resume.experience.forEach((item, index) => {
    root.appendChild(
      createCard(
        `
        <div class="experience-card-layout">
          <div class="experience-copy">
            <h2>${item.role} · ${item.company}</h2>
            <p class="meta">${item.period}</p>
            ${item.description ? `<p>${formatText(item.description)}</p>` : ""}
            ${Array.isArray(item.highlights) && item.highlights.length > 0
              ? `<ul>${item.highlights.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>`
              : ""}
          </div>
          ${item.image ? `
            <div class="experience-media-wrap">
              <div class="experience-media-frame">
                <img class="experience-media" src="${item.image}" alt="${item.imageAlt || `${item.company} visual`}" loading="lazy" decoding="async" />
              </div>
            </div>
          ` : ""}
        </div>
      `,
        index
      )
    );
  });
}

function renderEducation(root) {
  root.innerHTML = "";
  resume.education.forEach((item, index) => {
    root.appendChild(
      createCard(
        `
        <h2>${formatText(item.degree)}</h2>
        <p class="meta">${item.school} · ${item.period}</p>
        ${Array.isArray(item.details) && item.details.length > 0
          ? `<ul>${item.details.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>`
          : ""}
      `,
        index
      )
    );
  });
}

function renderPhotoGallery(root, options) {
  const { items, eyebrow, title, copy } = options;
  if (!Array.isArray(items) || items.length === 0) return;

  const section = document.createElement("section");
  section.className = "card detail-card section-gallery-card";
  section.innerHTML = `
    <div class="compact-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${title}</h2>
      <p class="gallery-copy">${copy}</p>
    </div>
    <div class="section-gallery-track">
      ${items
        .map(
          (item) => `
            <figure class="section-gallery-item">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
            </figure>
          `
        )
        .join("")}
    </div>
  `;
  root.appendChild(applyRevealMotion(section, root.children.length));
}

function renderProjects(root) {
  root.innerHTML = "";
  resume.projects.forEach((item, index) => {
    root.appendChild(
      createCard(
        `
        <h2>${item.name}</h2>
        ${item.description ? `<p>${formatText(item.description)}</p>` : ""}
        ${Array.isArray(item.highlights) && item.highlights.length > 0
          ? `<ul>${item.highlights.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>`
          : ""}
        ${item.link ? `<a class="card-link" href="${item.link}" target="_blank" rel="noreferrer">Open project</a>` : ""}
      `,
        index
      )
    );
  });
}

function renderHonors(root) {
  root.innerHTML = "";
  resume.honors.forEach((item, index) => {
    root.appendChild(createCard(`<p>${formatText(item)}</p>`, index));
  });
}

function renderAthletics(root) {
  root.innerHTML = "";
  resume.athletics.forEach((item, index) => {
    root.appendChild(
      createCard(
        `
        <h2>${item.organization}</h2>
        <p class="meta">${item.period}</p>
        <ul>${item.achievements.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>
      `,
        index
      )
    );
  });
}

function renderEducationGallery(root) {
  renderPhotoGallery(root, {
    items: resume.educationGallery,
    eyebrow: "Photo Highlights",
    title: "Education Gallery",
    copy: "Graduation and campus moments that represent the academic side of the story.",
  });
}

function renderAthleticsGallery(root) {
  renderPhotoGallery(root, {
    items: resume.athleticsGallery,
    eyebrow: "Photo Highlights",
    title: "Athletics Gallery",
    copy: "Selected race-day, national-team, and college competition moments.",
  });
}

function renderSkills(root) {
  root.innerHTML = "";
  resume.skills.forEach((item, index) => {
    root.appendChild(
      createCard(
        `
        <h2>${item.category}</h2>
        <div class="chips">${item.items.map((entry) => `<span class="chip">${entry}</span>`).join("")}</div>
      `,
        index
      )
    );
  });
}

function renderSectionPage(sectionKey) {
  const meta = sectionMeta[sectionKey];
  const title = document.getElementById("section-title");
  const eyebrow = document.getElementById("section-eyebrow");
  const description = document.getElementById("section-description");
  const content = document.getElementById("section-content");

  if (!meta || !content) return;

  document.title = `${meta.label} | ${resume.name}`;
  if (title) title.textContent = meta.label;
  if (eyebrow) eyebrow.textContent = meta.eyebrow;
  if (description) description.textContent = meta.description;

  renderSectionNav(sectionKey);

  if (sectionKey === "experience") renderExperience(content);
  if (sectionKey === "education") {
    renderEducation(content);
    renderEducationGallery(content);
  }
  if (sectionKey === "projects") renderProjects(content);
  if (sectionKey === "honors") renderHonors(content);
  if (sectionKey === "athletics") {
    renderAthletics(content);
    renderAthleticsGallery(content);
  }
  if (sectionKey === "skills") renderSkills(content);
}

function init() {
  fillBasicIdentity();
  renderContact();

  const pageType = document.body.dataset.page;
  if (pageType === "landing") {
    renderLandingNav();
    renderRelatedLinks();
    finalizePageLoad();
    return;
  }

  if (pageType === "section") {
    renderSectionPage(document.body.dataset.section);
  }

  finalizePageLoad();
}

init();
