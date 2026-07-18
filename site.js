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

const landingMediaFallbacks = {
  athletics: "assets/athletics/athletics-01.jpeg",
  education: "assets/education/education-01.jpeg",
};

const formatText = (value) =>
  String(value ?? "")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");

const isExternalLink = (url) => url.startsWith("http://") || url.startsWith("https://");

const getFlatSkillItems = (limit = 10) =>
  resume.skills.flatMap((category) => category.items).slice(0, limit);

function getLandingShowcaseData() {
  return {
    experience: {
      index: "01",
      eyebrow: sectionMeta.experience.eyebrow,
      title: "Technical ownership across research, AI apps, and athlete operations.",
      copy:
        "A focused lane of work spanning AI application support, staff-facing systems, and hands-on mobile delivery for research environments.",
      meta: [
        `${resume.experience.length} core roles`,
        "AI + operations systems",
        "Remote + UGA execution",
      ],
      media: {
        type: "image",
        src: resume.experience[1]?.image || resume.experience[0]?.image,
        alt: resume.experience[1]?.imageAlt || resume.experience[0]?.imageAlt || "Experience highlight visual.",
        caption: "App systems, athlete workflows, and product delivery.",
      },
    },
    education: {
      index: "02",
      eyebrow: sectionMeta.education.eyebrow,
      title: "Double Dawgs academic track with a finished B.S. and active A.I. M.S.",
      copy:
        "The academic story is structured, current, and forward-moving: computer science completed, artificial intelligence in progress, and business layered in as a complement.",
      meta: [
        "B.S. completed May 2026",
        "M.S. expected Dec 2026",
        "Business minor completed",
      ],
      media: {
        type: "image",
        src: resume.educationGallery?.[1]?.src || resume.educationGallery?.[0]?.src || landingMediaFallbacks.education,
        alt:
          resume.educationGallery?.[1]?.alt ||
          resume.educationGallery?.[0]?.alt ||
          "Education highlight visual.",
        caption: "Graduation and campus moments from the UGA chapter.",
      },
    },
    projects: {
      index: "03",
      eyebrow: sectionMeta.projects.eyebrow,
      title: "A product-oriented mix of healthcare, recruiting, comparison, and ML builds.",
      copy:
        "The projects section is built to read like shipped work, not class output. Each entry highlights what was built, why it mattered, and how the system behaves.",
      meta: [
        `${resume.projects.length} featured builds`,
        "Healthcare + AI + recruiting",
        "Production-style web delivery",
      ],
      media: {
        type: "stack",
        items: resume.projects.slice(0, 4).map((item) => ({
          title: item.name,
          note: item.description,
        })),
      },
    },
    honors: {
      index: "04",
      eyebrow: sectionMeta.honors.eyebrow,
      title: "Recognition that spans scholarships, academic distinction, and research outcomes.",
      copy:
        "Instead of padding the site with trophies, the honors view keeps the strongest distinctions visible in one clean chapter.",
      meta: [
        "Scholarships + honor roll",
        "Research recognition",
        "Academic + athletic crossover",
      ],
      media: {
        type: "list",
        items: resume.honors.slice(0, 4),
      },
    },
    athletics: {
      index: "05",
      eyebrow: sectionMeta.athletics.eyebrow,
      title: "International, national, and NCAA-level competition with real visual energy.",
      copy:
        "The athletics chapter is more than a bullet list. It carries race-day intensity, national-team context, and proof of high-level competitive discipline.",
      meta: [
        "All-American",
        "European medalist",
        "Israel National Team",
      ],
      media: {
        type: "image",
        src: resume.athleticsGallery?.[0]?.src || landingMediaFallbacks.athletics,
        alt: resume.athleticsGallery?.[0]?.alt || "Athletics highlight visual.",
        caption: "Competition moments across UGA, Israel, and international meets.",
      },
    },
    skills: {
      index: "06",
      eyebrow: sectionMeta.skills.eyebrow,
      title: "A practical toolkit built around shipping, iteration, and systems thinking.",
      copy:
        "The skills section is intentionally clean: just the languages, frameworks, platforms, and hardware that show up most in the actual work.",
      meta: [
        "Full-stack engineering",
        "Data + AI workflows",
        "Hardware + product tooling",
      ],
      media: {
        type: "chips",
        items: getFlatSkillItems(10),
      },
    },
  };
}

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
  const heroAthleticsImage = document.getElementById("hero-athletics-image");
  const heroAthleticsWrap = heroAthleticsImage?.closest(".hero-motion-card");
  const heroEducationImage = document.getElementById("hero-education-image");
  const heroEducationWrap = heroEducationImage?.closest(".hero-motion-card");

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
    heroAthleticsImage,
    heroAthleticsWrap,
    resume.athleticsGallery?.[0]?.src || landingMediaFallbacks.athletics
  );
  hydrateMediaImage(
    heroEducationImage,
    heroEducationWrap,
    resume.educationGallery?.[0]?.src || landingMediaFallbacks.education
  );
}

function renderRoleStrip() {
  const root = document.getElementById("role-strip");
  if (!root) return;

  root.innerHTML = "";
  resume.title
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry, index) => {
      const chip = document.createElement("span");
      chip.className = "role-chip";
      chip.textContent = entry;
      root.appendChild(applyRevealMotion(chip, index, 28));
    });
}

function renderHeroKpis() {
  const root = document.getElementById("hero-kpis");
  if (!root) return;

  const items = [
    {
      value: String(resume.experience.length).padStart(2, "0"),
      label: "experience chapters",
    },
    {
      value: `${resume.projects.length}+`,
      label: "featured builds",
    },
    {
      value: "UGA / ISR",
      label: "academic and athletic footprint",
    },
  ];

  root.innerHTML = "";
  items.forEach((item, index) => {
    const block = document.createElement("div");
    block.className = "hero-kpi";
    block.innerHTML = `
      <span class="hero-kpi-value">${item.value}</span>
      <span class="hero-kpi-label">${item.label}</span>
    `;
    root.appendChild(applyRevealMotion(block, index, 40));
  });
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

  const showcaseData = getLandingShowcaseData();
  root.innerHTML = "";
  sectionOrder.forEach((key, index) => {
    const item = sectionMeta[key];
    const preview = showcaseData[key];
    const link = document.createElement("a");
    link.className = `nav-button showcase-card${index === 0 ? " is-active" : ""}`;
    link.href = item.href;
    link.dataset.sectionKey = key;
    link.innerHTML = `
      <span class="showcase-number">${preview.index}</span>
      <span class="showcase-copy">
        <span class="nav-button-label">${item.label}</span>
        <span class="nav-button-copy">${item.description}</span>
        <span class="showcase-meta">${preview.meta[0]} • ${preview.meta[1]}</span>
      </span>
      <span class="showcase-arrow">Open section</span>
    `;
    link.addEventListener("mouseenter", () => setActiveLandingShowcase(key));
    link.addEventListener("focus", () => setActiveLandingShowcase(key));
    root.appendChild(applyRevealMotion(link, index));
  });

  setActiveLandingShowcase(sectionOrder[0]);
}

function createCard(innerHtml, index = 0) {
  const article = document.createElement("article");
  article.className = "card detail-card";
  article.innerHTML = innerHtml;
  return applyRevealMotion(article, index);
}

function renderLandingPreviewMedia(container, media) {
  if (!container) return;

  if (!media) {
    container.innerHTML = "";
    return;
  }

  if (media.type === "image") {
    container.innerHTML = `
      <figure class="preview-image-frame">
        <img src="${media.src}" alt="${media.alt}" loading="lazy" decoding="async" />
        ${media.caption ? `<figcaption>${media.caption}</figcaption>` : ""}
      </figure>
    `;
    return;
  }

  if (media.type === "stack") {
    container.innerHTML = `
      <div class="preview-project-stack">
        ${media.items
          .map(
            (item) => `
              <article class="preview-project-card">
                <p class="preview-project-title">${item.title}</p>
                <p class="preview-project-note">${item.note || ""}</p>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    return;
  }

  if (media.type === "list") {
    container.innerHTML = `
      <ul class="preview-list">
        ${media.items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
    return;
  }

  if (media.type === "chips") {
    container.innerHTML = `
      <div class="preview-chip-cloud">
        ${media.items.map((item) => `<span class="preview-chip">${item}</span>`).join("")}
      </div>
    `;
  }
}

function setActiveLandingShowcase(sectionKey) {
  const showcaseData = getLandingShowcaseData();
  const active = showcaseData[sectionKey];
  if (!active) return;

  document.querySelectorAll(".showcase-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.sectionKey === sectionKey);
  });

  const index = document.getElementById("preview-index");
  const eyebrow = document.getElementById("preview-eyebrow");
  const title = document.getElementById("preview-title");
  const copy = document.getElementById("preview-copy");
  const meta = document.getElementById("preview-meta");
  const media = document.getElementById("preview-media");
  const link = document.getElementById("preview-link");
  const preview = document.getElementById("showcase-preview");

  if (index) index.textContent = active.index;
  if (eyebrow) eyebrow.textContent = active.eyebrow;
  if (title) title.textContent = active.title;
  if (copy) copy.textContent = active.copy;
  if (meta) {
    meta.innerHTML = active.meta.map((entry) => `<span class="preview-pill">${entry}</span>`).join("");
  }
  renderLandingPreviewMedia(media, active.media);
  if (link) link.href = sectionMeta[sectionKey].href;
  if (preview) preview.dataset.sectionKey = sectionKey;
}

function setupLandingShowcase() {
  const cards = Array.from(document.querySelectorAll(".showcase-card"));
  if (cards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleCards = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visibleCards[0]) {
        setActiveLandingShowcase(visibleCards[0].target.dataset.sectionKey);
      }
    },
    {
      rootMargin: "-22% 0px -48% 0px",
      threshold: [0.3, 0.6],
    }
  );

  cards.forEach((card) => observer.observe(card));
}

function setupScrollProgress() {
  const progressBar = document.getElementById("scroll-progress-bar");
  if (!progressBar) return;

  let ticking = false;

  const update = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pageProgress = window.scrollY / maxScroll;
    progressBar.style.transform = `scaleX(${pageProgress})`;
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
  const parallaxLayers = Array.from(document.querySelectorAll("[data-parallax]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!stage) return;

  const updateScrollState = () => {
    const heroRect = stage.getBoundingClientRect();
    const heroProgress = Math.min(
      1,
      Math.max(0, (window.innerHeight - heroRect.top) / (window.innerHeight + heroRect.height))
    );
    stage.style.setProperty("--hero-lift", `${(heroProgress * -18).toFixed(2)}px`);

    if (prefersReducedMotion) return;

    parallaxLayers.forEach((layer) => {
      const speed = Number.parseFloat(layer.dataset.parallax || "0");
      const offset = heroRect.top * speed * -0.18;
      layer.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
    });
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateScrollState();
      ticking = false;
    });
  };

  const resetPointer = () => {
    stage.style.setProperty("--pointer-rotate-y", "0deg");
    stage.style.setProperty("--pointer-rotate-x", "0deg");
    stage.style.setProperty("--pointer-soft-y", "0deg");
    stage.style.setProperty("--pointer-soft-x", "0deg");
  };

  if (!prefersReducedMotion) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty("--pointer-rotate-y", `${(x * 6).toFixed(2)}deg`);
      stage.style.setProperty("--pointer-rotate-x", `${(y * -6).toFixed(2)}deg`);
      stage.style.setProperty("--pointer-soft-y", `${(x * -4).toFixed(2)}deg`);
      stage.style.setProperty("--pointer-soft-x", `${(y * 3).toFixed(2)}deg`);
    });
    stage.addEventListener("pointerleave", resetPointer);
  } else {
    resetPointer();
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateScrollState();
}

function setupSectionHeroMotion() {
  const stage = document.getElementById("section-stage");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!stage) return;

  const updateScrollState = () => {
    const rect = stage.getBoundingClientRect();
    const heroProgress = Math.min(
      1,
      Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
    );
    stage.style.setProperty("--section-lift", `${(heroProgress * -14).toFixed(2)}px`);
  };

  let ticking = false;
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      updateScrollState();
      ticking = false;
    });
  };

  const resetPointer = () => {
    stage.style.setProperty("--section-rotate-y", "0deg");
    stage.style.setProperty("--section-rotate-x", "0deg");
  };

  if (!prefersReducedMotion) {
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty("--section-rotate-y", `${(x * 4.5).toFixed(2)}deg`);
      stage.style.setProperty("--section-rotate-x", `${(y * -4).toFixed(2)}deg`);
    });
    stage.addEventListener("pointerleave", resetPointer);
  } else {
    resetPointer();
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateScrollState();
}

function getSectionSpotlightConfig(sectionKey) {
  if (sectionKey === "experience") {
    return {
      type: "roles",
      kicker: "Live workload",
      headline: "Three lanes of work shaping the current chapter.",
      copy:
        "AI product support, athlete operations systems, and research-backed mobile development all sit inside the same operating range.",
      items: resume.experience.map((item) => ({
        image: item.image,
        alt: item.imageAlt || `${item.company} visual`,
        title: item.company,
        note: item.role,
        meta: item.period,
      })),
    };
  }

  if (sectionKey === "education") {
    return {
      type: "carousel",
      kicker: "Academic milestones",
      headline: "Graduation moments and the next degree in motion.",
      copy:
        "A visual pass through the UGA chapter while the M.S. in Artificial Intelligence is still underway.",
      items: resume.educationGallery,
    };
  }

  if (sectionKey === "projects") {
    return {
      type: "projects",
      kicker: "Build reel",
      headline: "Products spanning healthcare, recruiting, comparison, and machine learning.",
      copy:
        "A quick preview of the build mix before dropping into the full project breakdown.",
      items: resume.projects.slice(0, 4).map((item) => ({
        title: item.name,
        note: item.description,
        link: item.link,
      })),
    };
  }

  if (sectionKey === "honors") {
    return {
      type: "list",
      kicker: "Selected recognition",
      headline: "Awards and distinctions with academic, research, and athletic weight.",
      copy:
        "The strongest recognition points stay visible without turning the page into a trophy wall.",
      items: resume.honors.slice(0, 5),
    };
  }

  if (sectionKey === "athletics") {
    return {
      type: "carousel",
      kicker: "Race-day motion",
      headline: "Competition imagery that carries NCAA and international energy.",
      copy:
        "Real meet visuals from UGA, Israel, and international stages keep this section feeling alive instead of archival.",
      items: resume.athleticsGallery.slice(0, 6),
    };
  }

  if (sectionKey === "skills") {
    return {
      type: "skills",
      kicker: "Core stack",
      headline: "The tools that show up most in the work that actually ships.",
      copy:
        "Languages, frameworks, data platforms, and hardware tooling grouped for a cleaner scan.",
      items: resume.skills.slice(0, 4),
    };
  }

  return null;
}

function setupSpotlightCycle(root, selector, interval = 2800) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = Array.from(root.querySelectorAll(selector));
  if (prefersReducedMotion || items.length < 2) return;

  let currentIndex = 0;
  let timer = null;

  const setActive = (index) => {
    currentIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === currentIndex);
    });
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => setActive(currentIndex + 1), interval);
  };

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) {
      start();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  setActive(0);
  start();
}

function setupSpotlightCarousel(root) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const slides = Array.from(root.querySelectorAll(".spotlight-slide"));
  const thumbs = Array.from(root.querySelectorAll(".spotlight-thumb"));
  if (slides.length < 2) return;

  let currentIndex = 0;
  let timer = null;

  const setActive = (index) => {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === currentIndex);
    });

    thumbs.forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === currentIndex;
      thumb.classList.toggle("is-active", isActive);
      thumb.setAttribute("aria-pressed", String(isActive));
    });
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    if (prefersReducedMotion) return;
    stop();
    timer = window.setInterval(() => setActive(currentIndex + 1), 3200);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      setActive(index);
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) {
      start();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  setActive(0);
  start();
}

function renderSectionSpotlight(sectionKey) {
  const shell = document.getElementById("section-spotlight");
  const body = document.getElementById("section-spotlight-body");
  const config = getSectionSpotlightConfig(sectionKey);

  if (!shell || !body) return;

  if (!config) {
    shell.style.display = "none";
    return;
  }

  shell.dataset.spotlightType = config.type;
  shell.dataset.sectionKey = sectionKey;

  const header = `
    <div class="spotlight-header">
      <p class="spotlight-kicker">${config.kicker}</p>
      <h2 class="spotlight-headline">${config.headline}</h2>
      <p class="spotlight-copy">${config.copy}</p>
    </div>
  `;

  if (config.type === "carousel") {
    body.innerHTML = `
      ${header}
      <div class="spotlight-carousel-stage">
        ${config.items
          .map(
            (item, index) => `
              <figure class="spotlight-slide${index === 0 ? " is-active" : ""}">
                <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
              </figure>
            `
          )
          .join("")}
      </div>
      ${config.items.length > 1 ? `
        <div class="spotlight-thumbs" aria-label="Section spotlight controls">
          ${config.items
            .map(
              (item, index) => `
                <button
                  class="spotlight-thumb${index === 0 ? " is-active" : ""}"
                  type="button"
                  aria-label="Show spotlight image ${index + 1} of ${config.items.length}"
                  aria-pressed="${index === 0 ? "true" : "false"}"
                  style="background-image: url('${item.src}')"
                ></button>
              `
            )
            .join("")}
        </div>
      ` : ""}
    `;
    setupSpotlightCarousel(shell);
    return;
  }

  if (config.type === "roles") {
    body.innerHTML = `
      ${header}
      <div class="spotlight-role-stack">
        ${config.items
          .map(
            (item, index) => `
              <article class="spotlight-role-card${index === 0 ? " is-active" : ""}" data-spotlight-cycler>
                <div class="spotlight-role-logo">
                  <img src="${item.image}" alt="${item.alt}" loading="lazy" decoding="async" />
                </div>
                <div class="spotlight-role-copy">
                  <p class="spotlight-role-title">${item.title}</p>
                  <p class="spotlight-role-note">${item.note}</p>
                  <p class="spotlight-role-meta">${item.meta}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    setupSpotlightCycle(shell, ".spotlight-role-card");
    return;
  }

  if (config.type === "projects") {
    body.innerHTML = `
      ${header}
      <div class="spotlight-project-grid">
        ${config.items
          .map(
            (item, index) => `
              <article class="spotlight-project-card${index === 0 ? " is-active" : ""}" data-spotlight-cycler>
                <p class="spotlight-project-title">${item.title}</p>
                <p class="spotlight-project-note">${item.note || ""}</p>
                ${item.link ? `<span class="spotlight-project-link">Live link</span>` : ""}
              </article>
            `
          )
          .join("")}
      </div>
    `;
    setupSpotlightCycle(shell, ".spotlight-project-card", 2600);
    return;
  }

  if (config.type === "list") {
    body.innerHTML = `
      ${header}
      <ol class="spotlight-list">
        ${config.items
          .map(
            (item, index) => `
              <li class="spotlight-list-item${index === 0 ? " is-active" : ""}" data-spotlight-cycler>${formatText(item)}</li>
            `
          )
          .join("")}
      </ol>
    `;
    setupSpotlightCycle(shell, ".spotlight-list-item", 2400);
    return;
  }

  if (config.type === "skills") {
    body.innerHTML = `
      ${header}
      <div class="spotlight-skills-grid">
        ${config.items
          .map(
            (item, index) => `
              <article class="spotlight-skill-group${index === 0 ? " is-active" : ""}" data-spotlight-cycler>
                <p class="spotlight-skill-title">${item.category}</p>
                <div class="spotlight-chip-cloud">
                  ${item.items.slice(0, 5).map((entry) => `<span class="spotlight-chip">${entry}</span>`).join("")}
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    setupSpotlightCycle(shell, ".spotlight-skill-group", 2600);
  }
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
  renderSectionSpotlight(sectionKey);

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

  setupSectionHeroMotion();
}

function init() {
  const pageType = document.body.dataset.page;

  fillBasicIdentity();
  if (pageType === "landing") {
    renderRoleStrip();
    renderHeroKpis();
  }
  renderContact();
  setupScrollProgress();

  if (pageType === "landing") {
    renderLandingNav();
    renderRelatedLinks();
    setupLandingShowcase();
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
