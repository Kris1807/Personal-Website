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

const landingStoryImages = () => [
  ...(resume.athleticsGallery || []).slice(0, 4),
  ...(resume.educationGallery || []).slice(0, 2),
];

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

function hydrateMediaImage(image, container, src) {
  if (!image || !container) return;

  if (!src || String(src).trim() === "") {
    container.style.display = "none";
    return;
  }

  const revealImage = () => {
    image.hidden = false;
    container.classList.remove("media-loading");
  };

  image.addEventListener("load", revealImage, { once: true });
  image.addEventListener(
    "error",
    () => container.classList.remove("media-loading"),
    { once: true }
  );
  image.src = src;

  if (image.complete) {
    revealImage();
  }
}

function fillBasicIdentity() {
  document.title = `${resume.name}`;

  const title = document.getElementById("title");
  const name = document.getElementById("name");
  const summary = document.getElementById("summary");
  const image = document.getElementById("profile-image");
  const imageWrap = document.getElementById("profile-image-wrap");
  const athleticsImage = document.getElementById("hero-athletics-image");
  const athleticsWrap = document.getElementById("hero-athletics-card");
  const educationImage = document.getElementById("hero-education-image");
  const educationWrap = document.getElementById("hero-education-card");

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

  hydrateMediaImage(image, imageWrap, resume.profileImage);
  hydrateMediaImage(
    athleticsImage,
    athleticsWrap,
    resume.athleticsGallery?.[0]?.src || ""
  );
  hydrateMediaImage(
    educationImage,
    educationWrap,
    resume.educationGallery?.[0]?.src || ""
  );
}

function renderLandingStoryStrip() {
  const root = document.getElementById("story-strip");
  if (!root) return;

  const items = landingStoryImages();
  if (items.length === 0) {
    root.parentElement?.style.setProperty("display", "none");
    return;
  }

  const visibleCount = window.innerWidth <= 720
    ? Math.min(items.length, 2)
    : window.innerWidth <= 1080
      ? Math.min(items.length, 3)
      : Math.min(items.length, 4);

  root.style.setProperty("--story-columns", String(visibleCount));
  root.innerHTML = "";

  items.slice(0, visibleCount).forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "story-strip-item";
    figure.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" loading="eager" decoding="async" />
    `;
    root.appendChild(applyRevealMotion(figure, index, 20));
  });
}

function setupScrollProgress() {
  const progressBar = document.getElementById("scroll-progress-bar");
  if (!progressBar) return;

  let ticking = false;

  const update = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${window.scrollY / maxScroll})`;
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
}

function setupLandingMotion() {
  const stage = document.getElementById("landing-stage");
  if (!stage) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  let ticking = false;

  const update = () => {
    const rect = stage.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
    );
    stage.style.setProperty("--hero-shift", `${(progress * -20).toFixed(2)}px`);
    stage.style.setProperty("--support-shift", `${(progress * -10).toFixed(2)}px`);
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  update();
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
      <span class="nav-button-index">${String(index + 1).padStart(2, "0")}</span>
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

function setupRotatingGallery(section) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const track = section.querySelector(".section-gallery-track");
  const slides = Array.from(section.querySelectorAll(".section-gallery-item"));
  const dots = Array.from(section.querySelectorAll(".gallery-dot"));

  if (!track || slides.length < 2) return;

  let currentIndex = 0;
  let timer = null;

  const setActiveSlide = (index, behavior = "smooth") => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });

    const activeSlide = slides[currentIndex];
    track.scrollTo({ left: activeSlide.offsetLeft, behavior });
  };

  const stopRotation = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const startRotation = () => {
    if (prefersReducedMotion) return;
    stopRotation();
    timer = window.setInterval(() => {
      setActiveSlide(currentIndex + 1);
    }, 3600);
  };

  track.classList.add("is-rotating");

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      setActiveSlide(index);
      startRotation();
    });
  });

  section.addEventListener("mouseenter", stopRotation);
  section.addEventListener("mouseleave", startRotation);
  section.addEventListener("focusin", stopRotation);
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      startRotation();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
    } else {
      startRotation();
    }
  });

  setActiveSlide(0, "auto");
  startRotation();
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
          (item, index) => `
            <figure class="section-gallery-item${index === 0 ? " is-active" : ""}">
              <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
            </figure>
          `
        )
        .join("")}
    </div>
    ${items.length > 1 ? `
      <div class="section-gallery-dots" aria-label="${title} slide controls">
        ${items
          .map(
            (_, index) => `
              <button
                class="gallery-dot${index === 0 ? " is-active" : ""}"
                type="button"
                aria-label="Show image ${index + 1} of ${items.length}"
                aria-pressed="${index === 0 ? "true" : "false"}"
              ></button>
            `
          )
          .join("")}
      </div>
    ` : ""}
  `;
  root.appendChild(applyRevealMotion(section, root.children.length));
  setupRotatingGallery(section);
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
  setupScrollProgress();

  const pageType = document.body.dataset.page;
  if (pageType === "landing") {
    renderLandingStoryStrip();
    renderLandingNav();
    renderRelatedLinks();
    setupLandingMotion();
    finalizePageLoad();
    return;
  }

  if (pageType === "section") {
    renderSectionPage(document.body.dataset.section);
  }

  finalizePageLoad();
}

init();
