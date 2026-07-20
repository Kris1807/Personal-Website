const sectionMeta = {
  experience: {
    label: "Experience",
    href: "experience.html",
    eyebrow: "Professional Focus",
    description:
      "Research, product delivery, and technical leadership across AI, athlete operations, and applied systems.",
  },
  education: {
    label: "Education",
    href: "education.html",
    eyebrow: "Academic Path",
    description:
      "Academic direction, graduate focus, and supporting credentials presented with the context that matters.",
  },
  projects: {
    label: "Projects",
    href: "projects.html",
    eyebrow: "Built Work",
    description:
      "Featured case studies and supporting builds across product engineering, AI, and data workflows.",
  },
  honors: {
    label: "Honors",
    href: "honors.html",
    eyebrow: "Recognition",
    description:
      "Recognition across academics, athletics, scholarship, and research delivery.",
  },
  athletics: {
    label: "Athletics",
    href: "athletics.html",
    eyebrow: "Competition",
    description:
      "Swimming achievements across NCAA, national-team, and international competition.",
  },
  skills: {
    label: "Skills",
    href: "skills.html",
    eyebrow: "Toolbox",
    description:
      "Languages, frameworks, systems, and tools arranged as working capability rather than a checklist.",
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

const galleryGroups = new Map();
const lightboxState = {
  root: null,
  dialog: null,
  image: null,
  caption: null,
  counter: null,
  prev: null,
  next: null,
  close: null,
  thumbs: null,
  currentGroupId: null,
  currentIndex: 0,
  returnFocusTo: null,
};

const formatText = (value) =>
  String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

const isExternalLink = (url) => /^(https?:)?\/\//.test(String(url || ""));

const getResumeDownloadLink = () =>
  resume.resumeFile ||
  resume.relatedLinks.find((entry) => entry.download)?.url ||
  "index.html";

const getEmailEntry = () =>
  resume.contact.find((entry) => String(entry.url || "").startsWith("mailto:"));

const clampIndex = (value, min, max) => Math.max(min, Math.min(max, value));

function getSectionHeroMetrics(sectionKey) {
  const featuredProjects = resume.projects.filter((item) => item.featured).length;
  const activeRoles = resume.experience.filter((item) => /present/i.test(String(item.period))).length;
  const scholarshipCount = resume.honors.filter((entry) => /scholarship/i.test(String(entry))).length;

  switch (sectionKey) {
    case "experience":
      return [
        { value: String(resume.experience.length).padStart(2, "0"), label: "Roles" },
        { value: String(activeRoles).padStart(2, "0"), label: "Current" },
        { value: "AI · apps · research", label: "Focus" },
      ];
    case "education":
      return [
        { value: "2026", label: "Latest degree" },
        { value: String(resume.education.length).padStart(2, "0"), label: "Academic blocks" },
        { value: "Double Dawgs", label: "Program" },
      ];
    case "projects":
      return [
        { value: String(featuredProjects).padStart(2, "0"), label: "Featured case studies" },
        { value: String(resume.projects.length).padStart(2, "0"), label: "Total builds" },
        { value: "Product · AI · data", label: "Range" },
      ];
    case "honors":
      return [
        { value: String(resume.honors.length).padStart(2, "0"), label: "Recognitions" },
        { value: String(scholarshipCount).padStart(2, "0"), label: "Scholarships" },
        { value: "Academic + athletic", label: "Span" },
      ];
    case "athletics":
      return [
        { value: String(resume.athletics.length).padStart(2, "0"), label: "Competition tiers" },
        { value: "2024", label: "European medal year" },
        { value: "UGA + ISR", label: "Footprint" },
      ];
    case "skills":
      return [
        { value: `${flattenSkills().length}+`, label: "Tools inside" },
        { value: String(resume.skills.length).padStart(2, "0"), label: "Skill groups" },
        { value: "Code + systems", label: "Coverage" },
      ];
    default:
      return [];
  }
}

function registerGalleryGroup(items) {
  const groupId = `gallery-${galleryGroups.size + 1}`;
  galleryGroups.set(groupId, items.map((item, index) => ({ ...item, index })));
  return groupId;
}

const landingStoryImages = () => [
  ...(resume.athleticsGallery || []).slice(0, 4),
  ...(resume.educationGallery || []).slice(0, 2),
];

function applyRevealMotion(element, index = 0, step = 42) {
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

  if (image.complete) revealImage();
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function showToast(message, tone = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    stack.setAttribute("aria-atomic", "false");
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${tone}`;
  toast.textContent = message;
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 220);
  }, 1900);
}

function setupPageTransitions() {
  document.body.classList.remove("is-navigating");

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    const url = new URL(link.href, window.location.href);
    const current = new URL(window.location.href);
    const isSameOrigin = url.origin === current.origin;
    const isHtmlPage = /\.html?$/i.test(url.pathname);
    const isSamePageHashOnly =
      url.pathname === current.pathname &&
      url.search === current.search &&
      Boolean(url.hash);

    if (!isSameOrigin || !isHtmlPage || isSamePageHashOnly) return;

    event.preventDefault();
    document.body.classList.add("is-navigating");
    window.setTimeout(() => {
      window.location.assign(url.href);
    }, 190);
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("is-navigating");
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

function setupScrollTargets() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-scroll-target]");
    if (!trigger) return;
    const target = document.querySelector(trigger.dataset.scrollTarget || "");
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function injectSiteHeader() {
  if (document.querySelector(".site-header")) return;

  const pageType = document.body.dataset.page;
  const currentKey = pageType === "section" ? document.body.dataset.section : "home";
  const navItems = [
    { key: "home", label: "Home", href: "index.html" },
    ...sectionOrder.map((key) => ({ key, label: sectionMeta[key].label, href: sectionMeta[key].href })),
  ];

  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="site-header-inner">
      <a class="site-brand" href="index.html" aria-label="Go to Kristian Pitshugin home page">
        <span class="site-brand-mark">KP</span>
        <span class="site-brand-copy">
          <strong>${resume.name}</strong>
          <span>Software engineer · AI graduate student</span>
        </span>
      </a>

      <button type="button" class="site-menu-toggle" aria-expanded="false" aria-controls="site-header-panel">
        <span></span>
        <span></span>
        <span class="site-menu-label">Menu</span>
      </button>

      <div class="site-header-panel" id="site-header-panel">
        <nav class="site-nav" aria-label="Primary">
          ${navItems
            .map(
              (item) => `
                <a
                  class="site-nav-link${currentKey === item.key ? " is-active" : ""}"
                  href="${item.href}"
                  ${currentKey === item.key ? 'aria-current="page"' : ""}
                >
                  ${item.label}
                </a>
              `
            )
            .join("")}
        </nav>
        <div class="site-header-actions">
          <a class="site-header-action" href="${getResumeDownloadLink()}" download>Resume</a>
        </div>
      </div>
    </div>
  `;

  const progress = document.querySelector(".scroll-progress");
  if (progress) {
    progress.insertAdjacentElement("afterend", header);
  } else {
    document.body.prepend(header);
  }
}

function setupSiteHeader() {
  const header = document.querySelector(".site-header");
  const toggle = header?.querySelector(".site-menu-toggle");
  const panel = header?.querySelector(".site-header-panel");
  if (!header || !toggle || !panel) return;

  const closeMenu = () => {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    header.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    if (header.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  header.addEventListener("click", (event) => {
    if (event.target.closest(".site-nav-link") || event.target.closest(".site-header-action")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const syncScrolledState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  syncScrolledState();
  window.addEventListener("scroll", syncScrolledState, { passive: true });
}

function fillBasicIdentity() {
  const title = document.getElementById("title");
  const name = document.getElementById("name");
  const positioning = document.getElementById("positioning");
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
  if (positioning) {
    positioning.textContent = resume.positioning;
    positioning.classList.remove("skeleton-text", "skeleton-summary");
  }
  if (summary) {
    summary.textContent = resume.summary;
    summary.classList.remove("skeleton-text", "skeleton-summary");
  }

  const athleticsCard = resume.heroCards?.athletics;
  const educationCard = resume.heroCards?.education;

  const athleticsLabel = document.getElementById("hero-athletics-label");
  const athleticsDetail = document.getElementById("hero-athletics-detail");
  const educationLabel = document.getElementById("hero-education-label");
  const educationDetail = document.getElementById("hero-education-detail");

  if (athleticsLabel && athleticsCard?.label) athleticsLabel.textContent = athleticsCard.label;
  if (athleticsDetail && athleticsCard?.detail) athleticsDetail.textContent = athleticsCard.detail;
  if (educationLabel && educationCard?.label) educationLabel.textContent = educationCard.label;
  if (educationDetail && educationCard?.detail) educationDetail.textContent = educationCard.detail;

  hydrateMediaImage(image, imageWrap, resume.profileImage);
  hydrateMediaImage(athleticsImage, athleticsWrap, athleticsCard?.image || resume.athleticsGallery?.[0]?.src || "");
  if (athleticsImage && athleticsCard?.alt) athleticsImage.alt = athleticsCard.alt;
  hydrateMediaImage(educationImage, educationWrap, educationCard?.image || resume.educationGallery?.[0]?.src || "");
  if (educationImage && educationCard?.alt) educationImage.alt = educationCard.alt;
}

function renderHeroActions() {
  const root = document.getElementById("hero-actions");
  if (!root) return;

  root.innerHTML = "";
  const actions = [
    {
      label: "View projects",
      href: "projects.html",
      className: "hero-action is-primary",
    },
    {
      label: "Download resume",
      href: getResumeDownloadLink(),
      className: "hero-action",
      download: true,
    },
  ];

  actions.forEach((action, index) => {
    const link = document.createElement("a");
    link.className = action.className;
    link.href = action.href;
    link.textContent = action.label;
    if (action.download) link.download = "";
    root.appendChild(applyRevealMotion(link, index, 35));
  });
}

function renderHeroHighlights() {
  const root = document.getElementById("hero-highlights");
  if (!root) return;
  root.innerHTML = "";

  (resume.heroHighlights || []).forEach((entry, index) => {
    const chip = document.createElement("span");
    chip.className = "chip hero-chip";
    chip.textContent = entry;
    root.appendChild(applyRevealMotion(chip, index, 26));
  });
}

function renderContact() {
  const root = document.getElementById("contact");
  if (!root) return;

  root.innerHTML = "";
  resume.contact.forEach((entry, index) => {
    const isEmailCopy = String(entry.url || "").startsWith("mailto:");

    if (isEmailCopy) {
      const button = document.createElement("button");
      const originalLabel = entry.label;
      let copyTimer = null;

      button.type = "button";
      button.className = "contact-copy-trigger";
      button.textContent = originalLabel;
      button.setAttribute("aria-label", `Copy email address ${originalLabel}`);
      button.title = "Copy email address";

      button.addEventListener("click", async () => {
        try {
          await copyText(originalLabel);
          button.textContent = "Copied email";
          button.classList.add("is-copied");
          showToast("Email copied to clipboard");
        } catch (_error) {
          button.textContent = "Copy failed";
          button.classList.remove("is-copied");
          showToast("Email copy failed", "error");
        }

        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          button.textContent = originalLabel;
          button.classList.remove("is-copied");
        }, 1400);
      });

      root.appendChild(applyRevealMotion(button, index, 34));
      return;
    }

    const link = document.createElement("a");
    link.href = entry.url;
    link.textContent = entry.label;
    if (isExternalLink(entry.url)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    }
    root.appendChild(applyRevealMotion(link, index, 34));
  });
}

function renderLandingAbout() {
  const eyebrow = document.getElementById("about-eyebrow");
  const heading = document.getElementById("about-heading");
  const intro = document.getElementById("about-intro");
  const statsRoot = document.getElementById("about-stats");
  const notesRoot = document.getElementById("about-notes");
  if (!eyebrow || !heading || !intro || !statsRoot || !notesRoot || !resume.about) return;

  eyebrow.textContent = resume.about.eyebrow;
  heading.textContent = resume.about.heading;
  intro.textContent = resume.about.intro;

  statsRoot.innerHTML = "";
  (resume.about.stats || []).forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "about-stat";
    article.innerHTML = `
      <span class="about-stat-value">${item.value}</span>
      <span class="about-stat-label">${item.label}</span>
    `;
    statsRoot.appendChild(applyRevealMotion(article, index, 26));
  });

  notesRoot.innerHTML = "";
  (resume.about.notes || []).forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "about-note";
    article.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.copy}</p>
    `;
    notesRoot.appendChild(applyRevealMotion(article, index, 34));
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
    root.appendChild(applyRevealMotion(link, index, 28));
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

function renderSectionHeroStats(sectionKey) {
  const hero = document.querySelector(".page-hero");
  if (!hero) return;

  const stats = getSectionHeroMetrics(sectionKey);
  if (stats.length === 0) return;

  hero.querySelector(".page-hero-stats")?.remove();

  const rail = document.createElement("div");
  rail.className = "page-hero-stats";
  rail.setAttribute("aria-label", `${sectionMeta[sectionKey]?.label || "Section"} quick facts`);
  rail.innerHTML = stats
    .map(
      (stat) => `
        <article class="page-hero-stat">
          <span class="page-hero-stat-value">${stat.value}</span>
          <span class="page-hero-stat-label">${stat.label}</span>
        </article>
      `
    )
    .join("");

  hero.appendChild(applyRevealMotion(rail, 1, 0));
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
    link.setAttribute("aria-label", `Open ${item.label}`);
    link.innerHTML = `
      <span class="nav-button-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="nav-button-eyebrow">${item.eyebrow}</span>
      <span class="nav-button-label">${item.label}</span>
      <span class="nav-button-copy">${item.description}</span>
      <span class="nav-button-arrow">Open</span>
    `;
    root.appendChild(applyRevealMotion(link, index, 40));
  });
}

function createCard(innerHtml, index = 0, className = "") {
  const article = document.createElement("article");
  article.className = `card detail-card${className ? ` ${className}` : ""}`;
  article.innerHTML = innerHtml;
  return applyRevealMotion(article, index);
}

function renderLinkCluster(links, className = "project-link-cluster") {
  const entries = Array.isArray(links) ? links : [];
  if (entries.length === 0) return "";

  return `
    <div class="${className}">
      ${entries
        .map(
          (entry) => `
            <a class="card-link" href="${entry.url}" target="_blank" rel="noreferrer">
              ${entry.label}
            </a>
          `
        )
        .join("")}
    </div>
  `;
}

function renderExperience(root) {
  root.innerHTML = "";
  resume.experience.forEach((item, index) => {
    const [location = item.period, dates = ""] = String(item.period || "").split(" | ");
    const isCurrent = /present/i.test(String(item.period || ""));
    root.appendChild(
      createCard(
        `
        <div class="experience-card-layout">
          <div class="experience-sequence">
            <span class="experience-sequence-index">${String(index + 1).padStart(2, "0")}</span>
            <span class="experience-sequence-line" aria-hidden="true"></span>
          </div>
          <div class="experience-copy">
            <div class="experience-meta-row">
              <p class="meta experience-location">${location}</p>
              <span class="experience-status-chip">${isCurrent ? "Current" : "Completed"}</span>
            </div>
            ${dates ? `<p class="experience-period-chip">${dates}</p>` : ""}
            <h2>${item.role} · ${item.company}</h2>
            ${item.impact ? `<p class="experience-impact">${formatText(item.impact)}</p>` : ""}
            ${Array.isArray(item.focusAreas) && item.focusAreas.length > 0
              ? `<div class="experience-focuses">${item.focusAreas
                  .map((entry) => `<span class="experience-focus-chip">${formatText(entry)}</span>`)
                  .join("")}</div>`
              : ""}
            ${Array.isArray(item.highlights) && item.highlights.length > 0
              ? `<ul class="experience-list">${item.highlights
                  .map((entry) => `<li>${formatText(entry)}</li>`)
                  .join("")}</ul>`
              : ""}
          </div>
          ${item.image
            ? `
              <div class="experience-media-wrap">
                <div class="experience-media-frame">
                  <img class="experience-media" src="${item.image}" alt="${item.imageAlt || `${item.company} visual`}" loading="lazy" decoding="async" />
                </div>
              </div>
            `
            : ""}
        </div>
      `,
        index
      )
    );
  });
}

function renderEducation(root) {
  root.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "education-grid";

  resume.education.forEach((item, index) => {
    grid.appendChild(
      createCard(
        `
        <h2>${formatText(item.degree)}</h2>
        <p class="meta">${item.school} · ${item.period}</p>
        ${Array.isArray(item.details) && item.details.length > 0
          ? `<ul>${item.details.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>`
          : ""}
      `,
        index,
        "education-card"
      )
    );
  });

  root.appendChild(grid);
}

function createFeaturedProjectCard(item, index) {
  const article = document.createElement("article");
  article.className = `card detail-card project-feature${index % 2 === 1 ? " is-reversed" : ""}`;
  article.innerHTML = `
    <div class="project-feature-main">
      <div class="project-feature-kicker-row">
        <span class="project-feature-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="project-feature-category">${item.category}</span>
      </div>
      <h2>${item.name}</h2>
      <p class="project-feature-summary">${item.summary}</p>
      ${renderLinkCluster(item.links)}
      <div class="project-feature-grid">
        <section class="project-story-block">
          <h3>Problem</h3>
          <p>${item.problem}</p>
        </section>
        <section class="project-story-block">
          <h3>Solution</h3>
          <p>${item.solution}</p>
        </section>
        <section class="project-story-block project-story-block-wide">
          <h3>Technical decisions</h3>
          <ul>
            ${(item.decisions || []).map((entry) => `<li>${entry}</li>`).join("")}
          </ul>
        </section>
      </div>
    </div>
    <aside class="project-feature-aside">
      <div class="project-meta-panel">
        <span class="project-meta-label">Role</span>
        <p>${item.role}</p>
      </div>
      <div class="project-meta-panel">
        <span class="project-meta-label">Stack</span>
        <div class="chips">
          ${(item.stack || []).map((entry) => `<span class="chip">${entry}</span>`).join("")}
        </div>
      </div>
      <div class="project-meta-panel project-outcome-panel">
        <span class="project-meta-label">Outcome</span>
        <p>${item.outcome}</p>
      </div>
    </aside>
  `;

  return applyRevealMotion(article, index, 46);
}

function createSecondaryProjectCard(item, index) {
  const article = document.createElement("article");
  article.className = "card detail-card project-secondary-card";
  article.innerHTML = `
    <div class="project-secondary-head">
      <span class="project-feature-category">${item.category}</span>
      <h3>${item.name}</h3>
      <p class="project-secondary-role">${item.role}</p>
    </div>
    <p class="project-secondary-summary">${item.summary}</p>
    ${Array.isArray(item.highlights) && item.highlights.length > 0
      ? `<ul class="project-secondary-list">${item.highlights.map((entry) => `<li>${entry}</li>`).join("")}</ul>`
      : ""}
    ${Array.isArray(item.stack) && item.stack.length > 0
      ? `<div class="chips project-secondary-chips">${item.stack.map((entry) => `<span class="chip">${entry}</span>`).join("")}</div>`
      : ""}
    ${renderLinkCluster(item.links)}
  `;

  return applyRevealMotion(article, index, 36);
}

function renderProjects(root) {
  root.innerHTML = "";

  const featured = resume.projects.filter((item) => item.featured);
  const secondary = resume.projects.filter((item) => !item.featured);

  if (featured.length > 0) {
    const featuredSection = document.createElement("section");
    featuredSection.className = "projects-featured-section";
    featuredSection.innerHTML = `
      <div class="section-heading section-heading-tight">
        <p class="eyebrow">Featured projects</p>
        <h2>Selected case studies</h2>
      </div>
    `;

    featured.forEach((item, index) => {
      featuredSection.appendChild(createFeaturedProjectCard(item, index));
    });

    root.appendChild(featuredSection);
  }

  if (secondary.length > 0) {
    const secondarySection = document.createElement("section");
    secondarySection.className = "projects-secondary-section";
    secondarySection.innerHTML = `
      <div class="section-heading section-heading-tight">
        <p class="eyebrow">Additional work</p>
        <h2>Supporting builds</h2>
      </div>
      <div class="project-secondary-grid"></div>
    `;

    const grid = secondarySection.querySelector(".project-secondary-grid");
    secondary.forEach((item, index) => {
      grid.appendChild(createSecondaryProjectCard(item, index));
    });

    root.appendChild(secondarySection);
  }
}

function renderHonors(root) {
  root.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "honors-grid";

  resume.honors.forEach((item, index) => {
    grid.appendChild(createCard(`<p>${formatText(item)}</p>`, index, "honor-card"));
  });

  root.appendChild(grid);
}

function renderAthletics(root) {
  root.innerHTML = "";
  const stack = document.createElement("div");
  stack.className = "athletics-stack";

  resume.athletics.forEach((item, index) => {
    stack.appendChild(
      createCard(
        `
        <h2>${item.organization}</h2>
        <p class="meta">${item.period}</p>
        <ul>${item.achievements.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>
      `,
        index,
        "athletics-card"
      )
    );
  });

  root.appendChild(stack);
}

function renderPhotoGallery(root, options) {
  const { items, eyebrow, title, copy } = options;
  if (!Array.isArray(items) || items.length === 0) return;

  const repeatedItems = items.length > 1 ? [...items, ...items] : items;
  const galleryGroupId = registerGalleryGroup(items);
  const section = document.createElement("section");
  section.className = "card detail-card section-gallery-card";
  section.innerHTML = `
    <div class="compact-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${title}</h2>
      <p class="gallery-copy">${copy}</p>
    </div>
    <div class="marquee-stage">
      ${items.length > 1
        ? `
          <button type="button" class="marquee-control marquee-control-side marquee-control-prev" data-direction="-1" aria-label="Scroll ${title} backward">&larr;</button>
        `
        : ""}
      <div class="section-gallery-viewport" data-marquee-viewport>
        <div class="section-gallery-track" data-marquee-track data-repeated="${items.length > 1 ? "true" : "false"}" data-speed="34" data-step="0.82">
          ${repeatedItems
            .map(
              (item, index) => `
                <figure class="section-gallery-item">
                  <button
                    type="button"
                    class="gallery-trigger"
                    data-gallery-group="${galleryGroupId}"
                    data-gallery-index="${index % items.length}"
                    aria-label="Open ${title} image ${index % items.length + 1}"
                  >
                    <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
                    <span class="gallery-zoom-badge">Open photo</span>
                  </button>
                </figure>
              `
            )
            .join("")}
        </div>
      </div>
      ${items.length > 1
        ? `
          <button type="button" class="marquee-control marquee-control-side marquee-control-next" data-direction="1" aria-label="Scroll ${title} forward">&rarr;</button>
        `
        : ""}
    </div>
  `;
  root.appendChild(applyRevealMotion(section, root.children.length, 38));
  setupMarqueeScroller(section, { speed: 34, step: 0.82 });
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

function getLightboxFocusable() {
  if (!lightboxState.root || lightboxState.root.hidden) return [];
  return Array.from(
    lightboxState.root.querySelectorAll(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute("hidden"));
}

function ensureGalleryLightbox() {
  if (lightboxState.root) return lightboxState;

  const root = document.createElement("div");
  root.className = "gallery-lightbox";
  root.hidden = true;
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `
    <div class="gallery-lightbox-backdrop" data-gallery-close></div>
    <div class="gallery-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image viewer">
      <button type="button" class="gallery-lightbox-close" data-gallery-close aria-label="Close image viewer">&times;</button>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" data-gallery-step="-1" aria-label="Previous image">&larr;</button>
      <figure class="gallery-lightbox-frame">
        <img class="gallery-lightbox-image" alt="" />
        <figcaption class="gallery-lightbox-meta">
          <span class="gallery-lightbox-counter"></span>
          <p class="gallery-lightbox-caption"></p>
        </figcaption>
      </figure>
      <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" data-gallery-step="1" aria-label="Next image">&rarr;</button>
      <div class="gallery-lightbox-thumbs" aria-label="Image choices"></div>
    </div>
  `;

  document.body.appendChild(root);

  lightboxState.root = root;
  lightboxState.dialog = root.querySelector(".gallery-lightbox-dialog");
  lightboxState.image = root.querySelector(".gallery-lightbox-image");
  lightboxState.caption = root.querySelector(".gallery-lightbox-caption");
  lightboxState.counter = root.querySelector(".gallery-lightbox-counter");
  lightboxState.prev = root.querySelector(".gallery-lightbox-prev");
  lightboxState.next = root.querySelector(".gallery-lightbox-next");
  lightboxState.close = root.querySelector(".gallery-lightbox-close");
  lightboxState.thumbs = root.querySelector(".gallery-lightbox-thumbs");

  root.addEventListener("click", (event) => {
    if (event.target.matches("[data-gallery-close]")) {
      closeGalleryLightbox();
      return;
    }

    const thumb = event.target.closest("[data-gallery-thumb]");
    if (thumb) {
      updateGalleryLightboxView(Number(thumb.dataset.galleryThumb));
      return;
    }

    const step = event.target.closest("[data-gallery-step]");
    if (step) {
      updateGalleryLightboxView(lightboxState.currentIndex + Number(step.dataset.galleryStep || 0));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightboxState.root || lightboxState.root.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeGalleryLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateGalleryLightboxView(lightboxState.currentIndex - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateGalleryLightboxView(lightboxState.currentIndex + 1);
      return;
    }

    if (event.key === "Tab") {
      const focusable = getLightboxFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  return lightboxState;
}

function updateGalleryLightboxView(nextIndex) {
  const items = galleryGroups.get(lightboxState.currentGroupId) || [];
  if (items.length === 0) return;

  const normalizedIndex = (nextIndex + items.length) % items.length;
  const item = items[normalizedIndex];
  if (!item) return;

  lightboxState.currentIndex = normalizedIndex;
  lightboxState.image.src = item.src;
  lightboxState.image.alt = item.alt || "";
  lightboxState.caption.textContent = item.alt || "";
  lightboxState.counter.textContent = `${normalizedIndex + 1} / ${items.length}`;

  Array.from(lightboxState.thumbs.children).forEach((thumb, index) => {
    thumb.classList.toggle("is-active", index === normalizedIndex);
  });
}

function openGalleryLightbox(groupId, index, trigger) {
  const items = galleryGroups.get(groupId);
  if (!items || items.length === 0) return;

  const state = ensureGalleryLightbox();
  state.currentGroupId = groupId;
  state.returnFocusTo = trigger || null;
  state.thumbs.innerHTML = items
    .map(
      (item, itemIndex) => `
        <button
          type="button"
          class="gallery-lightbox-thumb"
          data-gallery-thumb="${itemIndex}"
          aria-label="View image ${itemIndex + 1}"
        >
          <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
        </button>
      `
    )
    .join("");

  state.root.hidden = false;
  state.root.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => state.root.classList.add("is-open"));
  document.body.classList.add("lightbox-open");
  updateGalleryLightboxView(index);
  state.close.focus();
}

function closeGalleryLightbox() {
  if (!lightboxState.root || lightboxState.root.hidden) return;
  lightboxState.root.classList.remove("is-open");
  lightboxState.root.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  window.setTimeout(() => {
    lightboxState.root.hidden = true;
    lightboxState.image.removeAttribute("src");
  }, 180);
  lightboxState.returnFocusTo?.focus?.();
}

function setupGalleryLightbox() {
  ensureGalleryLightbox();
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".gallery-trigger");
    if (!trigger) return;
    openGalleryLightbox(
      trigger.dataset.galleryGroup,
      Number(trigger.dataset.galleryIndex || 0),
      trigger
    );
  });
}

function setupMarqueeScroller(section, options = {}) {
  const viewport = section.querySelector("[data-marquee-viewport]");
  const track = section.querySelector("[data-marquee-track]");
  if (!viewport || !track) return;

  const controls = Array.from(section.querySelectorAll(".marquee-control"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isRepeated = track.dataset.repeated === "true";
  const baseSpeed = Number(track.dataset.speed || options.speed || 34);
  const stepRatio = Number(track.dataset.step || options.step || 0.86);

  if (!isRepeated) {
    controls.forEach((control) => {
      control.hidden = true;
      control.disabled = true;
    });
    return;
  }

  let frameId = 0;
  let lastTick = 0;
  let paused = prefersReducedMotion;
  let inView = true;
  let resumeTimer = 0;

  const getLoopWidth = () => track.scrollWidth / 2;

  const normalizeScroll = () => {
    const loopWidth = getLoopWidth();
    if (!loopWidth) return;

    while (viewport.scrollLeft >= loopWidth) {
      viewport.scrollLeft -= loopWidth;
    }

    while (viewport.scrollLeft < 0) {
      viewport.scrollLeft += loopWidth;
    }
  };

  const queueResume = (delay = 1500) => {
    if (prefersReducedMotion) return;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      paused = false;
    }, delay);
  };

  const pauseRoller = () => {
    window.clearTimeout(resumeTimer);
    paused = true;
  };

  const nudge = (direction) => {
    pauseRoller();
    viewport.scrollLeft += direction * Math.max(220, viewport.clientWidth * stepRatio);
    normalizeScroll();
    queueResume();
  };

  const tick = (timestamp) => {
    if (!lastTick) lastTick = timestamp;
    const delta = timestamp - lastTick;
    lastTick = timestamp;

    if (!paused && inView) {
      viewport.scrollLeft += (baseSpeed * delta) / 1000;
      normalizeScroll();
    }

    frameId = window.requestAnimationFrame(tick);
  };

  controls.forEach((control) => {
    const direction = Number(control.dataset.direction || 1);
    control.addEventListener("click", () => nudge(direction));
  });

  section.addEventListener("mouseenter", pauseRoller);
  section.addEventListener("mouseleave", () => queueResume(240));
  section.addEventListener("focusin", pauseRoller);
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) {
      queueResume(240);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseRoller();
    } else {
      queueResume(240);
    }
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting !== false;
      if (!inView) {
        pauseRoller();
      } else {
        queueResume(220);
      }
    },
    { threshold: 0.12 }
  );
  observer.observe(section);

  normalizeScroll();
  frameId = window.requestAnimationFrame(tick);

  window.addEventListener(
    "resize",
    () => {
      normalizeScroll();
    },
    { passive: true }
  );

  section._marqueeFrameId = frameId;
}

function renderLandingStoryStrip() {
  const root = document.getElementById("story-strip");
  if (!root) return;

  const items = landingStoryImages();
  if (items.length === 0) {
    root.parentElement?.style.setProperty("display", "none");
    return;
  }

  const section = root.closest(".story-strip-card");
  const viewport = section?.querySelector("[data-marquee-viewport]");
  if (!section || !viewport) return;

  const buttons = Array.from(root.querySelectorAll(".story-strip-trigger"));
  if (buttons.length === 0) return;

  const galleryGroupId = registerGalleryGroup(items);
  buttons.forEach((button, index) => {
    button.dataset.galleryGroup = galleryGroupId;
    button.dataset.galleryIndex = String(index % items.length);
    button.setAttribute("aria-label", `Open story image ${index % items.length + 1}`);
  });

  if (section.dataset.storyStripReady === "true") return;
  section.dataset.storyStripReady = "true";

  const controls = Array.from(section.querySelectorAll(".marquee-control"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let resumeTimer = 0;
  let autoTimer = 0;
  let currentIndex = 0;

  const visibleCount = () => {
    if (window.innerWidth <= 720) return 1;
    if (window.innerWidth <= 1080) return 2;
    return 4;
  };

  const maxIndex = () => Math.max(0, items.length - visibleCount());

  const stepWidth = () => {
    const firstItem = root.querySelector(".story-strip-item");
    if (!firstItem) return 0;
    const gap = Number.parseFloat(window.getComputedStyle(root).gap || "0") || 0;
    return firstItem.getBoundingClientRect().width + gap;
  };

  const syncControls = () => {
    const enabled = items.length > visibleCount();
    controls.forEach((control) => {
      control.hidden = !enabled;
      control.disabled = !enabled;
    });
  };

  const goToIndex = (nextIndex, behavior = "smooth") => {
    currentIndex = clampIndex(nextIndex, 0, maxIndex());
    const offset = stepWidth() * currentIndex;
    viewport.scrollTo({ left: offset, behavior });
  };

  const clearAuto = () => {
    window.clearTimeout(resumeTimer);
    window.clearInterval(autoTimer);
    resumeTimer = 0;
    autoTimer = 0;
  };

  const shift = (direction) => {
    const limit = maxIndex();
    if (limit === 0) return;
    const next = currentIndex + direction;
    if (next < 0) {
      goToIndex(limit);
    } else if (next > limit) {
      goToIndex(0);
    } else {
      goToIndex(next);
    }
  };

  const startAuto = () => {
    clearAuto();
    if (prefersReducedMotion || maxIndex() === 0) return;
    autoTimer = window.setInterval(() => {
      shift(1);
    }, 3200);
  };

  const pauseAuto = () => clearAuto();

  const queueResume = () => {
    if (prefersReducedMotion || maxIndex() === 0) return;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startAuto, 1400);
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      shift(Number(control.dataset.direction || 1));
      queueResume();
    });
  });

  section.addEventListener("mouseenter", pauseAuto);
  section.addEventListener("mouseleave", queueResume);
  section.addEventListener("focusin", pauseAuto);
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) queueResume();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAuto();
    } else {
      queueResume();
    }
  });

  window.addEventListener(
    "resize",
    () => {
      syncControls();
      goToIndex(currentIndex, "auto");
      startAuto();
    },
    { passive: true }
  );

  syncControls();
  goToIndex(0, "auto");
  startAuto();
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
    stage.style.setProperty("--hero-shift", `${(progress * -12).toFixed(2)}px`);
    stage.style.setProperty("--support-shift", `${(progress * -8).toFixed(2)}px`);
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

function setupHeroCardMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !finePointer) return;

  const motionCards = [
    { element: document.getElementById("profile-image-wrap"), tilt: 8, shift: 10, imageShift: 6 },
    { element: document.getElementById("hero-athletics-card"), tilt: 6, shift: 8, imageShift: 5 },
    { element: document.getElementById("hero-education-card"), tilt: 6, shift: 8, imageShift: 5 },
  ].filter(({ element }) => element);

  motionCards.forEach(({ element, tilt, shift, imageShift }) => {
    const resetCard = () => {
      element.style.setProperty("--card-tilt-x", "0deg");
      element.style.setProperty("--card-tilt-y", "0deg");
      element.style.setProperty("--card-shift-x", "0px");
      element.style.setProperty("--card-shift-y", "0px");
      element.style.setProperty("--card-image-shift-x", "0px");
      element.style.setProperty("--card-image-shift-y", "0px");
      element.style.setProperty("--card-scale", "1");
      element.style.setProperty("--card-image-scale", "1");
    };

    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      const horizontal = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const vertical = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      element.style.setProperty("--card-tilt-x", `${(-vertical * tilt).toFixed(2)}deg`);
      element.style.setProperty("--card-tilt-y", `${(horizontal * tilt).toFixed(2)}deg`);
      element.style.setProperty("--card-shift-x", `${(horizontal * shift).toFixed(2)}px`);
      element.style.setProperty("--card-shift-y", `${(vertical * shift).toFixed(2)}px`);
      element.style.setProperty("--card-image-shift-x", `${(horizontal * imageShift).toFixed(2)}px`);
      element.style.setProperty("--card-image-shift-y", `${(vertical * imageShift).toFixed(2)}px`);
      element.style.setProperty("--card-scale", "1.01");
      element.style.setProperty("--card-image-scale", "1.03");
    };

    resetCard();
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", resetCard);
    element.addEventListener("pointercancel", resetCard);
  });
}

const brainBankRows = [
  { y: 146, left: 250, right: 450, count: 2 },
  { y: 184, left: 212, right: 488, count: 3 },
  { y: 222, left: 178, right: 522, count: 4 },
  { y: 260, left: 160, right: 540, count: 4 },
  { y: 298, left: 160, right: 540, count: 4 },
  { y: 336, left: 176, right: 524, count: 4 },
  { y: 374, left: 208, right: 492, count: 3 },
  { y: 412, left: 228, right: 472, count: 3 },
];

function shuffleArray(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function flattenSkills() {
  return resume.skills.flatMap((group) =>
    group.items.map((label) => ({
      label,
      category: group.category,
      tone: group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }))
  );
}

function estimateBrainTokenWidth(label) {
  const length = label.length;
  if (length >= 23) return Math.min(170, 36 + length * 4.8);
  if (length >= 18) return Math.min(152, 32 + length * 4.5);
  return Math.max(70, Math.min(132, 24 + length * 4.2));
}

function computeBrainBankLayout(tokens) {
  const placements = [];
  let cursor = 0;

  brainBankRows.forEach((row) => {
    const rowTokens = tokens.slice(cursor, cursor + row.count);
    if (rowTokens.length === 0) return;

    const widths = rowTokens.map((token) => token.width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0);
    const available = row.right - row.left;
    const baseGap = rowTokens.length > 1 ? (available - totalWidth) / (rowTokens.length - 1) : 0;
    const gap = rowTokens.length > 1 ? Math.max(10, Math.min(24, baseGap)) : 0;
    const occupied = totalWidth + gap * Math.max(0, rowTokens.length - 1);
    let x = row.left + Math.max(0, (available - occupied) / 2);

    rowTokens.forEach((token, tokenIndex) => {
      const width = widths[tokenIndex];
      placements.push({
        x: x + width / 2,
        y: row.y + (Math.random() * 8 - 4),
        rotate: Math.random() * 10 - 5,
      });
      x += width + gap;
    });

    cursor += row.count;
  });

  return placements;
}

function createBrainBankToken(token) {
  const svgNs = "http://www.w3.org/2000/svg";
  const group = document.createElementNS(svgNs, "g");
  const shadow = document.createElementNS(svgNs, "rect");
  const rect = document.createElementNS(svgNs, "rect");
  const text = document.createElementNS(svgNs, "text");
  const title = document.createElementNS(svgNs, "title");

  group.classList.add("brain-bank-token", `tone-${token.tone}`);
  group.setAttribute("tabindex", "0");

  shadow.setAttribute("x", String(-token.width / 2));
  shadow.setAttribute("y", "-14");
  shadow.setAttribute("width", String(token.width));
  shadow.setAttribute("height", "28");
  shadow.setAttribute("rx", "14");
  shadow.setAttribute("ry", "14");
  shadow.setAttribute("class", "brain-bank-token-shadow");

  rect.setAttribute("x", String(-token.width / 2));
  rect.setAttribute("y", "-15");
  rect.setAttribute("width", String(token.width));
  rect.setAttribute("height", "28");
  rect.setAttribute("rx", "14");
  rect.setAttribute("ry", "14");
  rect.setAttribute("class", "brain-bank-token-pill");

  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("y", "0");
  text.setAttribute("class", "brain-bank-token-text");
  const labelLength = token.label.length;
  const fontSize = labelLength > 20 ? 0.5 : labelLength > 16 ? 0.56 : labelLength > 12 ? 0.61 : 0.68;
  text.style.fontSize = `${fontSize}rem`;
  if (labelLength > 11) {
    text.setAttribute("textLength", String(Math.max(40, token.width - 18)));
    text.setAttribute("lengthAdjust", "spacingAndGlyphs");
  }
  text.textContent = token.label;

  title.textContent = `${token.label} · ${token.category}`;

  group.append(title, shadow, rect, text);
  return group;
}

function setupSkillBrainBank(section) {
  const layer = section.querySelector("[data-brain-bank-layer]");
  const button = section.querySelector("[data-brain-bank-shuffle]");
  if (!layer || !button) return;

  const tokens = flattenSkills().map((entry) => ({
    ...entry,
    width: estimateBrainTokenWidth(entry.label),
  }));

  const tokenViews = tokens.map((token) => {
    const node = createBrainBankToken(token);
    layer.appendChild(node);
    return { ...token, node };
  });

  const placeTokens = (orderedTokens, { instant = false } = {}) => {
    const placements = computeBrainBankLayout(orderedTokens);
    orderedTokens.forEach((token, index) => {
      const placement = placements[index];
      if (!placement) return;

      if (instant) {
        token.node.style.transitionDuration = "0ms";
      } else {
        token.node.style.removeProperty("transition-duration");
      }

      token.node.style.transform = `translate(${placement.x}px, ${placement.y}px) rotate(${placement.rotate}deg)`;
      token.node.style.setProperty("--token-delay", `${index * 18}ms`);
    });
  };

  let currentOrder = shuffleArray(tokenViews);
  placeTokens(currentOrder, { instant: true });

  button.addEventListener("click", () => {
    currentOrder = shuffleArray(currentOrder);
    section.classList.add("is-shuffling");
    placeTokens(currentOrder);
    window.clearTimeout(section._brainBankTimer);
    section._brainBankTimer = window.setTimeout(() => {
      section.classList.remove("is-shuffling");
    }, 680);
  });
}

function setupBrainBankMotion(section) {
  const stage = section.querySelector(".brain-bank-stage");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!stage || prefersReducedMotion || !finePointer) return;

  const reset = () => {
    stage.style.setProperty("--globe-tilt-x", "0deg");
    stage.style.setProperty("--globe-tilt-y", "0deg");
    stage.style.setProperty("--globe-shift-x", "0px");
    stage.style.setProperty("--globe-shift-y", "0px");
    stage.style.setProperty("--globe-scale", "1");
  };

  const handleMove = (event) => {
    const rect = stage.getBoundingClientRect();
    const horizontal = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const vertical = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    stage.style.setProperty("--globe-tilt-x", `${(-vertical * 4).toFixed(2)}deg`);
    stage.style.setProperty("--globe-tilt-y", `${(horizontal * 6).toFixed(2)}deg`);
    stage.style.setProperty("--globe-shift-x", `${(horizontal * 8).toFixed(2)}px`);
    stage.style.setProperty("--globe-shift-y", `${(vertical * 5).toFixed(2)}px`);
    stage.style.setProperty("--globe-scale", "1.012");
  };

  reset();
  stage.addEventListener("pointermove", handleMove);
  stage.addEventListener("pointerleave", reset);
  stage.addEventListener("pointercancel", reset);
}

function renderSkillBrainBank() {
  const allSkills = flattenSkills();
  if (allSkills.length === 0) return null;

  const section = document.createElement("section");
  section.className = "brain-bank-panel";
  section.innerHTML = `
    <div class="brain-bank-stage">
      <svg class="brain-bank-svg" viewBox="0 0 700 720" role="img" aria-label="Interactive snow globe filled with skills">
        <defs>
          <circle id="brain-bank-shape" cx="350" cy="242" r="212" />
          <clipPath id="brain-bank-clip">
            <use href="#brain-bank-shape" />
          </clipPath>
          <radialGradient id="brain-bank-glass-fill" cx="42%" cy="21%" r="82%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.99" />
            <stop offset="26%" stop-color="#f7fbff" stop-opacity="0.96" />
            <stop offset="62%" stop-color="#deeffd" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#c2daf3" stop-opacity="0.97" />
          </radialGradient>
          <radialGradient id="brain-bank-core-glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.54" />
            <stop offset="48%" stop-color="#f6fbff" stop-opacity="0.16" />
            <stop offset="100%" stop-color="#dceeff" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="brain-bank-rim" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stop-color="#87add9" />
            <stop offset="26%" stop-color="#eef7ff" />
            <stop offset="56%" stop-color="#ffffff" />
            <stop offset="82%" stop-color="#e4f2ff" />
            <stop offset="100%" stop-color="#6d98cc" />
          </linearGradient>
          <linearGradient id="brain-bank-base-fill" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="34%" stop-color="#f7fbff" />
            <stop offset="72%" stop-color="#e0e8f1" />
            <stop offset="100%" stop-color="#cad4df" />
          </linearGradient>
          <linearGradient id="brain-bank-base-trim" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stop-color="#d5dfeb" />
            <stop offset="50%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#bcc8d4" />
          </linearGradient>
          <filter id="brain-bank-shadow" x="-22%" y="-18%" width="160%" height="180%">
            <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#081629" flood-opacity="0.2" />
          </filter>
          <filter id="brain-bank-inner-glow" x="-20%" y="-20%" width="160%" height="180%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.24 0" />
          </filter>
        </defs>
        <ellipse class="brain-bank-floor-shadow" cx="350" cy="688" rx="190" ry="20" />
        <g filter="url(#brain-bank-shadow)">
          <ellipse class="brain-bank-base-top" cx="350" cy="492" rx="172" ry="20" />
          <path class="brain-bank-base-body" d="M232 492C240 530 244 568 236 606C274 620 312 628 350 628C388 628 426 620 464 606C456 568 460 530 468 492L450 488C420 496 386 500 350 500C314 500 280 496 250 488Z" />
          <path class="brain-bank-base-foot" d="M250 606C282 616 316 622 350 622C384 622 418 616 450 606L476 660C434 674 392 682 350 682C308 682 266 674 224 660Z" />
          <ellipse class="brain-bank-base-bottom" cx="350" cy="660" rx="154" ry="18" />
          <path class="brain-bank-base-trim-line" d="M254 528C312 540 388 540 446 528" />
          <path class="brain-bank-base-trim-line" d="M248 570C310 582 390 582 452 570" />
          <path class="brain-bank-base-trim-line soft" d="M288 506C326 514 374 514 412 506" />
          <path class="brain-bank-base-trim-line soft" d="M282 634C324 642 376 642 418 634" />
          <path class="brain-bank-base-trim-line vertical" d="M286 514C284 554 288 600 300 648" />
          <path class="brain-bank-base-trim-line vertical" d="M414 514C416 554 412 600 400 648" />

          <g clip-path="url(#brain-bank-clip)">
            <circle class="brain-bank-fill" cx="350" cy="242" r="212" />
            <ellipse class="brain-bank-core-glow" cx="350" cy="224" rx="170" ry="136" />
            <ellipse class="brain-bank-snow-drift" cx="350" cy="446" rx="182" ry="34" />
            <ellipse class="brain-bank-snow-shadow" cx="350" cy="451" rx="144" ry="18" />
            <path class="brain-bank-sheen-primary" d="M180 118C220 84 274 92 302 132C318 156 316 194 292 220C262 250 214 260 184 240C150 218 150 148 180 118Z" />
            <path class="brain-bank-sheen-secondary" d="M456 104C500 106 540 132 558 168C568 186 568 212 554 226C534 246 494 240 458 212C420 184 418 144 456 104Z" />
            <g class="brain-bank-flurries">
              <circle cx="226" cy="126" r="3.1" />
              <circle cx="280" cy="104" r="2.7" />
              <circle cx="404" cy="120" r="3" />
              <circle cx="478" cy="156" r="2.6" />
              <circle cx="242" cy="216" r="2.3" />
              <circle cx="448" cy="220" r="2.2" />
              <circle cx="332" cy="142" r="2.1" />
              <circle cx="388" cy="180" r="2.1" />
            </g>
            <g class="brain-bank-skill-layer" data-brain-bank-layer></g>
          </g>
          <circle class="brain-bank-shell" cx="350" cy="242" r="212" />
          <circle class="brain-bank-shell-glow" cx="350" cy="242" r="206" filter="url(#brain-bank-inner-glow)" />
        </g>
      </svg>
    </div>
    <button type="button" class="brain-bank-button" data-brain-bank-shuffle>Shuffle Skills</button>
  `;

  const revealedSection = applyRevealMotion(section, 0, 0);
  setupSkillBrainBank(revealedSection);
  setupBrainBankMotion(revealedSection);
  return revealedSection;
}

function renderSkills(root) {
  root.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "skills-stack-layout";

  const cardsColumn = document.createElement("div");
  cardsColumn.className = "skills-cards-column";

  resume.skills.forEach((item, index) => {
    cardsColumn.appendChild(
      createCard(
        `
        <h2>${item.category}</h2>
        <div class="chips">${item.items.map((entry) => `<span class="chip">${entry}</span>`).join("")}</div>
      `,
        index
      )
    );
  });

  const brainRail = document.createElement("aside");
  brainRail.className = "skills-brain-rail";
  const brainBank = renderSkillBrainBank();

  if (brainBank) {
    brainRail.appendChild(brainBank);
    layout.append(cardsColumn, brainRail);
  } else {
    layout.append(cardsColumn);
  }

  root.appendChild(layout);
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
  renderSectionHeroStats(sectionKey);

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
  injectSiteHeader();
  setupSiteHeader();
  setupPageTransitions();
  setupScrollTargets();
  setupGalleryLightbox();

  const pageType = document.body.dataset.page;
  if (pageType === "landing") {
    document.title = resume.name;
    fillBasicIdentity();
    renderHeroActions();
    renderHeroHighlights();
    renderLandingAbout();
    renderContact();
    renderLandingNav();
    renderLandingStoryStrip();
    renderRelatedLinks();
    setupScrollProgress();
    setupLandingMotion();
    setupHeroCardMotion();
    finalizePageLoad();
    return;
  }

  if (pageType === "section") {
    renderSectionPage(document.body.dataset.section);
  }

  finalizePageLoad();
}

init();
