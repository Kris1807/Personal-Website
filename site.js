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

    if (!paused) {
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

  const repeatedItems = items.length > 1 ? [...items, ...items] : items;
  root.dataset.repeated = String(items.length > 1);
  root.dataset.speed = "36";
  root.dataset.step = "0.84";
  root.innerHTML = "";

  repeatedItems.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "story-strip-item";
    figure.innerHTML = `
      <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
    `;
    root.appendChild(applyRevealMotion(figure, index, 20));
  });

  const section = root.closest(".story-strip-card");
  if (section) setupMarqueeScroller(section);
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
        } catch (_error) {
          button.textContent = "Copy failed";
          button.classList.remove("is-copied");
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

function renderPhotoGallery(root, options) {
  const { items, eyebrow, title, copy } = options;
  if (!Array.isArray(items) || items.length === 0) return;

  const repeatedItems = items.length > 1 ? [...items, ...items] : items;
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
            (item) => `
              <figure class="section-gallery-item">
                <img src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async" />
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

const brainBankRows = [
  { y: 96, left: 214, right: 506, count: 2 },
  { y: 138, left: 146, right: 574, count: 3 },
  { y: 180, left: 118, right: 602, count: 3 },
  { y: 224, left: 98, right: 622, count: 4 },
  { y: 268, left: 90, right: 630, count: 4 },
  { y: 312, left: 102, right: 618, count: 4 },
  { y: 356, left: 132, right: 588, count: 3 },
  { y: 398, left: 184, right: 536, count: 2 },
  { y: 438, left: 234, right: 486, count: 2 },
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
  return Math.max(72, Math.min(136, 26 + label.length * 4.9));
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
  shadow.setAttribute("height", "30");
  shadow.setAttribute("rx", "15");
  shadow.setAttribute("ry", "15");
  shadow.setAttribute("class", "brain-bank-token-shadow");

  rect.setAttribute("x", String(-token.width / 2));
  rect.setAttribute("y", "-16");
  rect.setAttribute("width", String(token.width));
  rect.setAttribute("height", "30");
  rect.setAttribute("rx", "15");
  rect.setAttribute("ry", "15");
  rect.setAttribute("class", "brain-bank-token-pill");

  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.setAttribute("y", "-1");
  text.setAttribute("class", "brain-bank-token-text");
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

function renderSkillBrainBank(root) {
  const allSkills = flattenSkills();
  if (allSkills.length === 0) return;

  const section = document.createElement("section");
  section.className = "card detail-card brain-bank-card";
  section.innerHTML = `
    <div class="brain-bank-layout">
      <div class="brain-bank-copy">
        <p class="eyebrow">Interactive Vault</p>
        <h2>Brain Bank</h2>
        <p class="brain-bank-lead">A transparent brain piggy bank packed with the languages, frameworks, platforms, and tools I rely on most.</p>
        <button type="button" class="brain-bank-button" data-brain-bank-shuffle>Shuffle Skills</button>
      </div>
      <div class="brain-bank-stage">
        <svg class="brain-bank-svg" viewBox="0 0 720 520" role="img" aria-labelledby="brain-bank-title brain-bank-desc">
          <title id="brain-bank-title">Transparent brain bank filled with skills</title>
          <desc id="brain-bank-desc">An interactive glass brain holding Kristian Pitshugin's skills. Use the shuffle button to rearrange them.</desc>
          <defs>
            <path id="brain-bank-shape" d="M181 108C207 63 255 42 304 54C338 24 392 24 430 56C486 37 549 54 589 98C632 146 650 208 640 268C653 332 633 392 594 432C553 474 493 488 434 470C396 495 330 498 284 474C220 489 159 470 119 428C82 388 67 334 78 276C65 216 82 154 122 114C139 97 158 94 181 108Z" />
            <clipPath id="brain-bank-clip">
              <use href="#brain-bank-shape" />
            </clipPath>
            <linearGradient id="brain-bank-glass-fill" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(248, 244, 237, 0.9)" />
              <stop offset="55%" stop-color="rgba(203, 218, 241, 0.32)" />
              <stop offset="100%" stop-color="rgba(247, 238, 223, 0.84)" />
            </linearGradient>
            <linearGradient id="brain-bank-rim" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#9bb5dd" />
              <stop offset="50%" stop-color="#f3e3c9" />
              <stop offset="100%" stop-color="#6f92c3" />
            </linearGradient>
            <filter id="brain-bank-shadow" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(7,15,31,0.16)" />
            </filter>
          </defs>
          <ellipse class="brain-bank-floor-shadow" cx="362" cy="484" rx="220" ry="22" />
          <g filter="url(#brain-bank-shadow)">
            <g clip-path="url(#brain-bank-clip)">
              <rect class="brain-bank-fill" x="70" y="42" width="580" height="434" rx="190" />
              <rect class="brain-bank-sheen" x="96" y="64" width="118" height="332" rx="56" />
              <g class="brain-bank-skill-layer" data-brain-bank-layer></g>
            </g>
            <use href="#brain-bank-shape" class="brain-bank-shell" />
            <path class="brain-bank-ridge" d="M214 122C187 146 181 180 209 206" />
            <path class="brain-bank-ridge" d="M288 92C255 132 258 182 298 226" />
            <path class="brain-bank-ridge" d="M356 84C334 128 334 186 356 238" />
            <path class="brain-bank-ridge" d="M432 96C464 136 468 188 442 234" />
            <path class="brain-bank-ridge" d="M506 122C535 152 540 192 514 220" />
            <rect class="brain-bank-slot" x="310" y="36" width="100" height="14" rx="7" />
            <circle class="brain-bank-coin" cx="534" cy="88" r="20" />
            <text class="brain-bank-coin-mark" x="534" y="89">K</text>
          </g>
        </svg>
      </div>
    </div>
  `;

  root.appendChild(applyRevealMotion(section, root.children.length));
  setupSkillBrainBank(section);
}

function renderSkills(root) {
  root.innerHTML = "";
  renderSkillBrainBank(root);
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
