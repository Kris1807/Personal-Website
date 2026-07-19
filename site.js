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
