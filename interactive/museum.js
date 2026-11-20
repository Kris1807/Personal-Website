import { createRooms } from "./exhibits.js";
import { createCamera, element, renderScene } from "./scene.js";

const rooms = createRooms(globalThis.resume);
const heading = document.querySelector("#room-heading");
const description = document.querySelector("#room-description");
const viewport = document.querySelector("#museum-viewport");
const cameraNode = document.querySelector("#museum-camera");
const controls = document.querySelector("#museum-controls");
const roomIndex = document.querySelector(".room-index");
const roomLinks = [...roomIndex.querySelectorAll("[data-room]")];
const exhibits = document.querySelector("#museum-exhibits");
const exhibitList = document.querySelector("#exhibit-list");
const dialog = document.querySelector("#exhibit-dialog");
const dialogContent = document.querySelector("#exhibit-content");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const spatial = CSS.supports("transform-style", "preserve-3d") && "ResizeObserver" in window;
const camera = spatial ? createCamera(viewport, cameraNode) : null;

let activeRoom = "lobby";
let transitionTimer;
let dialogReturn;
let pointer;
let lastGestureWasDrag = false;

viewport.hidden = !spatial;
controls.hidden = !spatial;

function openExhibit(index) {
  const exhibit = rooms[activeRoom].exhibits?.[index];
  if (!exhibit || dialog.open) return;
  const label = element("p", "room-overline", exhibit.label);
  const title = element("h2", "", exhibit.title);
  title.id = "exhibit-title";
  dialogContent.replaceChildren(label, title);

  if (exhibit.photo) {
    const figure = element("figure");
    const image = element("img");
    image.src = new URL(`../${exhibit.photo.src}`, import.meta.url);
    image.alt = exhibit.photo.alt;
    figure.append(image);
    dialogContent.append(figure);
  }

  if (exhibit.description) dialogContent.append(element("p", "", exhibit.description));

  if (exhibit.facts?.length) {
    const list = element("ul");
    list.append(...exhibit.facts.map((fact) => element("li", "", fact)));
    dialogContent.append(list);
  }

  if (exhibit.tags?.length) {
    const tags = element("div", "exhibit-tags");
    tags.append(...exhibit.tags.map((tag) => element("span", "", tag)));
    dialogContent.append(tags);
  }

  if (exhibit.style === "roster") {
    dialogContent.append(element("p", "recording-note", "The recorded walkthrough will be added here."));
  }

  if (exhibit.links?.length) {
    const links = element("div", "exhibit-links");
    for (const link of exhibit.links) {
      const anchor = element("a", "museum-link", link.label);
      anchor.href = link.url;
      links.append(anchor);
    }
    dialogContent.append(links);
  }

  dialogReturn = exhibitList.children[index];
  dialog.showModal();
  dialog.scrollTop = 0;
}

dialog.addEventListener("close", () => {
  if (dialogReturn?.isConnected) dialogReturn.focus({ preventScroll: true });
  dialogReturn = null;
  dialogContent.replaceChildren();
});

function showRoom(roomId, focus) {
  clearTimeout(transitionTimer);
  viewport.classList.remove("is-travelling");
  if (dialog.open) dialog.close();
  activeRoom = roomId;
  const room = rooms[roomId];
  heading.textContent = room.title;
  description.textContent = room.description;

  for (const link of roomLinks) {
    if (link.dataset.room === roomId) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }

  const buttons = (room.exhibits || []).map((exhibit, index) => {
    const button = element("button", "", exhibit.title);
    button.type = "button";
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => openExhibit(index));
    return button;
  });
  exhibitList.replaceChildren(...buttons);
  exhibits.hidden = !buttons.length;

  if (camera) {
    renderScene(cameraNode, roomId, rooms);
    camera.reset();
  }

  if (focus) {
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function showFromHash(focus) {
  const key = location.hash.slice(1);
  showRoom(Object.hasOwn(rooms, key) ? key : "lobby", focus);
}

function visit(roomId, animate) {
  clearTimeout(transitionTimer);
  viewport.classList.remove("is-travelling");
  if (roomId === activeRoom) return;

  const changeRoom = () => {
    history.pushState(null, "", `#${roomId}`);
    showRoom(roomId, true);
  };

  if (!camera || !animate || reduceMotion.matches || activeRoom !== "lobby") {
    changeRoom();
    return;
  }

  viewport.classList.add("is-travelling");
  camera.approach(roomId);
  transitionTimer = setTimeout(changeRoom, 420);
}

roomIndex.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-room]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  visit(link.dataset.room, false);
});

viewport.addEventListener("click", (event) => {
  if (lastGestureWasDrag) return;
  const door = event.target.closest("[data-door]");
  const frame = event.target.closest("[data-exhibit]");
  if (door) visit(door.dataset.door, true);
  if (frame) openExhibit(Number(frame.dataset.exhibit));
});

viewport.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.button !== 0 || viewport.classList.contains("is-travelling")) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  lastGestureWasDrag = false;
});

viewport.addEventListener("pointermove", (event) => {
  if (pointer?.id !== event.pointerId) return;
  const horizontal = event.clientX - pointer.x;
  const vertical = event.clientY - pointer.y;
  if (!lastGestureWasDrag && Math.hypot(horizontal, vertical) < 5) return;
  if (!lastGestureWasDrag) {
    lastGestureWasDrag = true;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  }
  camera.look(-horizontal * 0.15, vertical * 0.12);
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

function endGesture(event) {
  if (pointer?.id !== event.pointerId) return;
  pointer = null;
  viewport.classList.remove("is-dragging");
}

viewport.addEventListener("pointerup", endGesture);
viewport.addEventListener("pointercancel", endGesture);
viewport.addEventListener("pointerleave", endGesture);
viewport.addEventListener("lostpointercapture", endGesture);

controls.addEventListener("click", (event) => {
  if (!camera || viewport.classList.contains("is-travelling")) return;
  const turn = event.target.closest("[data-look]");
  if (turn) camera.look(Number(turn.dataset.look) * 25);
  if (event.target.id === "reset-view") camera.reset();
});

const keyboardMovement = {
  arrowup: () => camera.move(24),
  arrowdown: () => camera.move(-24),
  arrowleft: () => camera.look(-10),
  arrowright: () => camera.look(10),
  w: () => camera.move(24),
  s: () => camera.move(-24),
  a: () => camera.move(0, -24),
  d: () => camera.move(0, 24),
};

document.addEventListener("keydown", (event) => {
  if (!camera || dialog.open || event.altKey || event.ctrlKey || event.metaKey || viewport.classList.contains("is-travelling")) return;
  if (event.target.closest?.("a, button, input, textarea, select, [contenteditable=true]")) return;
  const key = event.key.toLowerCase();
  if (!Object.hasOwn(keyboardMovement, key)) return;
  event.preventDefault();
  keyboardMovement[key]();
});

window.addEventListener("hashchange", () => showFromHash(true));
showFromHash(false);
