const entry = document.querySelector(".portfolio-entry");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const arrivalKey = "portfolio-portal-arrival";
const portalKinds = new Set(["official", "game"]);

function showArrival() {
  try {
    const marker = JSON.parse(sessionStorage.getItem(arrivalKey));
    if (!marker) return;
    sessionStorage.removeItem(arrivalKey);
    if (motionPreference.matches || !portalKinds.has(marker.kind) ||
        marker.path !== location.pathname + location.search || Date.now() - marker.at > 10_000) return;

    const cover = document.createElement("div");
    cover.className = "portal-arrival";
    cover.dataset.portal = marker.kind;
    cover.setAttribute("aria-hidden", "true");
    cover.addEventListener("animationend", () => cover.remove(), { once: true });
    document.body.append(cover);
    setTimeout(() => cover.remove(), 700);
  } catch {
    // Navigation also works if session storage is unavailable.
  }
}

showArrival();

if (entry) {
  const chamber = entry.querySelector(".portal-chamber");
  const departure = entry.querySelector(".portal-departure");
  let selected = null;
  let timer;
  let navigate;

  function resetPortal() {
    clearTimeout(timer);
    departure.removeEventListener("transitionend", finishPortal);
    entry.removeAttribute("data-transition");
    selected?.removeAttribute("data-selected");
    selected = null;
    navigate = null;
  }

  function finishPortal(event) {
    if (event && (event.target !== departure || event.propertyName !== "opacity")) return;
    clearTimeout(timer);
    departure.removeEventListener("transitionend", finishPortal);
    const go = navigate;
    navigate = null;
    go?.();
  }

  entry.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-portal]");
    if (!link || !document.documentElement.hasAttribute("data-portfolio-entry") ||
        !portalKinds.has(link.dataset.portal) || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (selected) {
      event.preventDefault();
      return;
    }
    if (motionPreference.matches) return;

    const aperture = link.querySelector(".portal-threshold").getBoundingClientRect();
    if (!aperture.width || !aperture.height) return;
    event.preventDefault();

    const stage = chamber.getBoundingClientRect();
    const x = aperture.left + aperture.width / 2;
    const y = aperture.top + aperture.height / 2;
    chamber.style.setProperty("--portal-origin-x", `${x - stage.left}px`);
    chamber.style.setProperty("--portal-origin-y", `${y - stage.top}px`);
    chamber.style.setProperty("--portal-pan-x", `${innerWidth / 2 - x}px`);
    chamber.style.setProperty("--portal-pan-y", `${innerHeight / 2 - y}px`);
    chamber.style.setProperty("--portal-zoom", Math.max(innerWidth / aperture.width, innerHeight / aperture.height) * 1.24);

    selected = link;
    const url = new URL(link.href);
    const kind = link.dataset.portal;
    navigate = () => {
      try {
        sessionStorage.setItem(arrivalKey, JSON.stringify({ kind, path: url.pathname + url.search, at: Date.now() }));
      } catch {
        // The departure transition does not depend on storage access.
      }
      location.assign(url.href);
    };

    departure.addEventListener("transitionend", finishPortal);
    timer = setTimeout(finishPortal, 820);
    link.setAttribute("data-selected", "");
    entry.dataset.transition = kind;
  });

  addEventListener("pageshow", (event) => {
    if (event.persisted) resetPortal();
  });
}
