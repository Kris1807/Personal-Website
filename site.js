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

const galleryGroups = new Map();
const lightboxState = {
  root: null,
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

const isExternalLink = (url) => url.startsWith("http://") || url.startsWith("https://");

function getSectionHeroMetrics(sectionKey) {
  const scholarshipCount = resume.honors.filter((entry) =>
    /scholarship/i.test(String(entry))
  ).length;

  switch (sectionKey) {
    case "experience":
      return [
        { value: String(resume.experience.length).padStart(2, "0"), label: "Experience chapters" },
        {
          value: String(
            resume.experience.filter((item) => /present/i.test(String(item.period))).length
          ).padStart(2, "0"),
          label: "Current roles",
        },
        { value: "AI · apps · research", label: "Delivery focus" },
      ];
    case "education":
      return [
        { value: "2026", label: "Latest graduation" },
        { value: String(resume.education.length).padStart(2, "0"), label: "Academic blocks" },
        { value: "Double Dawgs", label: "Program track" },
      ];
    case "projects":
      return [
        { value: String(resume.projects.length).padStart(2, "0"), label: "Featured builds" },
        { value: "Web + AI + data", label: "Build range" },
        { value: "Shipped work", label: "Delivery style" },
      ];
    case "honors":
      return [
        { value: String(resume.honors.length).padStart(2, "0"), label: "Recognitions" },
        { value: String(scholarshipCount).padStart(2, "0"), label: "Scholarships" },
        { value: "Academic + athletic", label: "Recognition span" },
      ];
    case "athletics":
      return [
        { value: String(resume.athletics.length).padStart(2, "0"), label: "Competition tiers" },
        { value: "2024", label: "European medal year" },
        { value: "UGA + ISR", label: "Team footprint" },
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

function setupLandingStageSpotlight() {
  const stage = document.getElementById("landing-stage");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!stage || prefersReducedMotion || !finePointer) return;

  const reset = () => {
    stage.style.setProperty("--stage-spot-x", "76%");
    stage.style.setProperty("--stage-spot-y", "18%");
    stage.style.setProperty("--stage-spot-opacity", "0");
  };

  const handleMove = (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    stage.style.setProperty("--stage-spot-x", `${x.toFixed(2)}%`);
    stage.style.setProperty("--stage-spot-y", `${y.toFixed(2)}%`);
    stage.style.setProperty("--stage-spot-opacity", "1");
  };

  reset();
  stage.addEventListener("pointermove", handleMove);
  stage.addEventListener("pointerleave", reset);
  stage.addEventListener("pointercancel", reset);
}

function setupInteractiveSurfaces(root = document) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !finePointer) return;

  const surfaces = root.querySelectorAll(
    ".nav-button, .page-hero, .detail-card, .story-strip-card, .related-card, .landing-support-card, .hero-profile-card, .brain-bank-button"
  );

  surfaces.forEach((surface) => {
    if (surface.dataset.spotlightReady === "true") return;
    surface.dataset.spotlightReady = "true";
    surface.classList.add("surface-interactive");

    let spotlight = surface.querySelector(":scope > .surface-spotlight");
    if (!spotlight) {
      spotlight = document.createElement("span");
      spotlight.className = "surface-spotlight";
      spotlight.setAttribute("aria-hidden", "true");
      surface.appendChild(spotlight);
    }

    const reset = () => {
      surface.style.setProperty("--spot-x", "50%");
      surface.style.setProperty("--spot-y", "50%");
      surface.style.setProperty("--spot-alpha", "0");
    };

    const update = (event) => {
      const rect = surface.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      surface.style.setProperty("--spot-x", `${x.toFixed(2)}%`);
      surface.style.setProperty("--spot-y", `${y.toFixed(2)}%`);
      surface.style.setProperty("--spot-alpha", "1");
    };

    reset();
    surface.addEventListener("pointermove", update);
    surface.addEventListener("pointerenter", update);
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointercancel", reset);
  });
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
    currentIndex = Math.max(0, Math.min(maxIndex(), nextIndex));
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

  const pauseAuto = () => {
    clearAuto();
  };

  const queueResume = () => {
    if (prefersReducedMotion || maxIndex() === 0) return;
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      startAuto();
    }, 1400);
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
    if (!section.contains(event.relatedTarget)) {
      queueResume();
    }
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

function setupHeroCardMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !finePointer) return;

  const motionCards = [
    { element: document.getElementById("profile-image-wrap"), tilt: 10, shift: 12, imageShift: 9 },
    { element: document.getElementById("hero-athletics-card"), tilt: 8, shift: 10, imageShift: 7 },
    { element: document.getElementById("hero-education-card"), tilt: 8, shift: 10, imageShift: 7 },
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
      element.style.setProperty("--card-image-scale", "1.035");
    };

    resetCard();
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", resetCard);
    element.addEventListener("pointercancel", resetCard);
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

      root.appendChild(applyRevealMotion(button, index, 35));
      return;
    }

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
              ? `<ul class="experience-list">${item.highlights.map((entry) => `<li>${formatText(entry)}</li>`).join("")}</ul>`
              : ""}
          </div>
          ${item.image ? `
            <div class="experience-media-wrap">
              <div class="experience-media-frame">
                <img class="experience-media" src="${item.image}" alt="${item.imageAlt || `${item.company} visual`}" loading="eager" decoding="async" />
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
      ${items.length > 1 ? `
        <button type="button" class="marquee-control marquee-control-side marquee-control-prev" data-direction="-1" aria-label="Scroll ${title} backward">&larr;</button>
      ` : ""}
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
                  <img src="${item.src}" alt="${item.alt}" loading="eager" decoding="async" />
                  <span class="gallery-zoom-badge">Open photo</span>
                </button>
              </figure>
            `
          )
          .join("")}
        </div>
      </div>
      ${items.length > 1 ? `
        <button type="button" class="marquee-control marquee-control-side marquee-control-next" data-direction="1" aria-label="Scroll ${title} forward">&rarr;</button>
      ` : ""}
    </div>
  `;
  root.appendChild(applyRevealMotion(section, root.children.length));
  setupMarqueeScroller(section, { speed: 34, step: 0.82 });
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

function ensureGalleryLightbox() {
  if (lightboxState.root) return lightboxState;

  const root = document.createElement("div");
  root.className = "gallery-lightbox";
  root.hidden = true;
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
    if (event.key === "Escape") closeGalleryLightbox();
    if (event.key === "ArrowLeft") updateGalleryLightboxView(lightboxState.currentIndex - 1);
    if (event.key === "ArrowRight") updateGalleryLightboxView(lightboxState.currentIndex + 1);
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
          <img src="${item.src}" alt="${item.alt}" loading="eager" decoding="async" />
        </button>
      `
    )
    .join("");

  state.root.hidden = false;
  requestAnimationFrame(() => state.root.classList.add("is-open"));
  document.body.classList.add("lightbox-open");
  updateGalleryLightboxView(index);
  state.close.focus();
}

function closeGalleryLightbox() {
  if (!lightboxState.root || lightboxState.root.hidden) return;
  lightboxState.root.classList.remove("is-open");
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

const brainBankRows = [
  { y: 138, left: 278, right: 422, count: 2 },
  { y: 172, left: 228, right: 472, count: 3 },
  { y: 208, left: 184, right: 516, count: 4 },
  { y: 244, left: 162, right: 538, count: 4 },
  { y: 280, left: 158, right: 542, count: 4 },
  { y: 316, left: 170, right: 530, count: 4 },
  { y: 352, left: 206, right: 494, count: 3 },
  { y: 388, left: 220, right: 480, count: 3 },
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
      tone: group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    }))
  );
}

function estimateBrainTokenWidth(label) {
  const length = label.length;
  if (length >= 21) return Math.min(156, 30 + length * 5.1);
  if (length >= 16) return Math.min(142, 26 + length * 4.9);
  return Math.max(64, Math.min(126, 22 + length * 4.6));
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
    const gap = rowTokens.length > 1 ? Math.max(10, Math.min(26, baseGap)) : 0;
    const occupied = totalWidth + gap * Math.max(0, rowTokens.length - 1);
    let x = row.left + Math.max(0, (available - occupied) / 2);

    rowTokens.forEach((token, tokenIndex) => {
      const width = widths[tokenIndex];
      placements.push({
        x: x + width / 2,
        y: row.y + (Math.random() * 8 - 4),
        rotate: Math.random() * 12 - 6,
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
  const fontSize =
    labelLength > 21 ? 0.5 :
    labelLength > 18 ? 0.54 :
    labelLength > 14 ? 0.6 :
    0.68;
  text.style.fontSize = `${fontSize}rem`;
  if (labelLength > 11) {
    text.setAttribute("textLength", String(Math.max(38, token.width - 18)));
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

    stage.style.setProperty("--globe-tilt-x", `${(-vertical * 5).toFixed(2)}deg`);
    stage.style.setProperty("--globe-tilt-y", `${(horizontal * 7).toFixed(2)}deg`);
    stage.style.setProperty("--globe-shift-x", `${(horizontal * 8).toFixed(2)}px`);
    stage.style.setProperty("--globe-shift-y", `${(vertical * 6).toFixed(2)}px`);
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
      <svg class="brain-bank-svg" viewBox="0 0 700 728" role="img" aria-label="Interactive snow globe filled with skills">
        <defs>
          <circle id="brain-bank-shape" cx="350" cy="236" r="206" />
          <clipPath id="brain-bank-clip">
            <use href="#brain-bank-shape" />
          </clipPath>
          <radialGradient id="brain-bank-glass-fill" cx="42%" cy="21%" r="82%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.99" />
            <stop offset="24%" stop-color="#f8fcff" stop-opacity="0.96" />
            <stop offset="60%" stop-color="#deeffd" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#bed8f2" stop-opacity="0.97" />
          </radialGradient>
          <radialGradient id="brain-bank-core-glow" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
            <stop offset="48%" stop-color="#f6fbff" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#dceeff" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="brain-bank-rim" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stop-color="#88add6" />
            <stop offset="26%" stop-color="#edf7ff" />
            <stop offset="56%" stop-color="#ffffff" />
            <stop offset="82%" stop-color="#e4f2ff" />
            <stop offset="100%" stop-color="#6e97c8" />
          </linearGradient>
          <linearGradient id="brain-bank-base-fill" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="34%" stop-color="#f8fbff" />
            <stop offset="72%" stop-color="#e4ecf4" />
            <stop offset="100%" stop-color="#cfd7df" />
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
        <ellipse class="brain-bank-floor-shadow" cx="350" cy="694" rx="184" ry="20" />
        <g filter="url(#brain-bank-shadow)">
          <ellipse class="brain-bank-base-top" cx="350" cy="462" rx="172" ry="22" />
          <path class="brain-bank-base-body" d="M228 462C238 494 244 535 238 576C274 594 314 604 350 604C386 604 426 594 462 576C456 535 462 494 472 462L454 458C425 469 389 474 350 474C311 474 275 469 246 458Z" />
          <path class="brain-bank-base-foot" d="M252 576C284 587 317 593 350 593C383 593 416 587 448 576L476 638C434 654 392 662 350 662C308 662 266 654 224 638Z" />
          <ellipse class="brain-bank-base-bottom" cx="350" cy="638" rx="154" ry="20" />
          <path class="brain-bank-base-trim-line" d="M252 502C309 516 391 516 448 502" />
          <path class="brain-bank-base-trim-line" d="M246 548C308 562 392 562 454 548" />
          <path class="brain-bank-base-trim-line soft" d="M292 482C327 490 373 490 408 482" />
          <path class="brain-bank-base-trim-line soft" d="M278 604C321 614 379 614 422 604" />
          <path class="brain-bank-base-trim-line vertical" d="M286 486C284 528 289 574 300 622" />
          <path class="brain-bank-base-trim-line vertical" d="M414 486C416 528 411 574 400 622" />
          <g clip-path="url(#brain-bank-clip)">
            <circle class="brain-bank-fill" cx="350" cy="236" r="206" />
            <ellipse class="brain-bank-core-glow" cx="350" cy="214" rx="166" ry="130" />
            <ellipse class="brain-bank-snow-drift" cx="350" cy="420" rx="184" ry="31" />
            <ellipse class="brain-bank-snow-shadow" cx="350" cy="425" rx="142" ry="17" />
            <path class="brain-bank-sheen-primary" d="M182 112C220 80 274 88 300 128C316 154 314 190 290 216C260 248 212 259 182 240C148 220 149 143 182 112Z" />
            <path class="brain-bank-sheen-secondary" d="M458 98C502 100 542 126 560 160C570 178 570 204 556 218C536 238 496 232 458 206C420 180 418 138 458 98Z" />
            <path class="brain-bank-sheen-ribbon" d="M214 448C272 422 317 413 372 415C425 417 474 430 518 458L500 486C460 462 419 452 374 451C320 449 278 456 232 480Z" />
            <g class="brain-bank-flurries">
              <circle cx="228" cy="122" r="3.1" />
              <circle cx="280" cy="100" r="2.7" />
              <circle cx="404" cy="118" r="3" />
              <circle cx="476" cy="152" r="2.6" />
              <circle cx="242" cy="208" r="2.3" />
              <circle cx="448" cy="212" r="2.2" />
              <circle cx="332" cy="136" r="2.1" />
              <circle cx="388" cy="176" r="2.1" />
            </g>
            <g class="brain-bank-skill-layer" data-brain-bank-layer></g>
          </g>
          <circle class="brain-bank-shell" cx="350" cy="236" r="206" />
          <circle class="brain-bank-shell-glow" cx="350" cy="236" r="200" filter="url(#brain-bank-inner-glow)" />
        </g>
      </svg>
    </div>
    <button type="button" class="brain-bank-button" data-brain-bank-shuffle>Shuffle Skills</button>
  `;

  const revealedSection = applyRevealMotion(section, 0);
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
  fillBasicIdentity();
  renderContact();
  setupScrollProgress();
  setupPageTransitions();
  setupGalleryLightbox();

  const pageType = document.body.dataset.page;
  if (pageType === "landing") {
    renderLandingStoryStrip();
    renderLandingNav();
    renderRelatedLinks();
    setupLandingMotion();
    setupHeroCardMotion();
    setupLandingStageSpotlight();
    setupInteractiveSurfaces(document);
    finalizePageLoad();
    return;
  }

  if (pageType === "section") {
    renderSectionPage(document.body.dataset.section);
  }

  setupInteractiveSurfaces(document);
  finalizePageLoad();
}

init();
