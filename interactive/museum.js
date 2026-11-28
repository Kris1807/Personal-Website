import { createRooms } from "./exhibits.js";
import { createCamera, element, renderScene } from "./scene.js";
import { createTouchPad } from "./touch-pad.js";
import { mountGuestbook } from "./guestbook.js";
import { bindMuseumMusic } from "./music.js";
import { museumSkyTime, startSkyClock } from "./sky.js";

const rooms = createRooms(globalThis.resume);
const heading = document.querySelector("#room-heading");
const description = document.querySelector("#room-description");
const viewport = document.querySelector("#museum-viewport");
const cameraNode = document.querySelector("#museum-camera");
const controls = document.querySelector("#museum-controls");
const menu = document.querySelector("#museum-menu");
const menuButton = menu.querySelector("summary");
const resetView = document.querySelector("#reset-view");
const roomIndex = document.querySelector(".room-index");
const roomLinks = [...roomIndex.querySelectorAll("[data-room]")];
const exhibits = document.querySelector("#museum-exhibits");
const exhibitList = document.querySelector("#exhibit-list");
const dialog = document.querySelector("#exhibit-dialog");
const dialogContent = document.querySelector("#exhibit-content");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const spatial = CSS.supports("transform-style", "preserve-3d") && "ResizeObserver" in window;
const camera = spatial ? createCamera(viewport, cameraNode, rooms) : null;
const setMusicRoom = bindMuseumMusic(
  document.querySelector("#museum-soundtrack"),
  document.querySelectorAll("[data-music-toggle]"),
  document.querySelectorAll("[data-music-status]"),
);
for (const wrapper of document.querySelectorAll(".museum-music, .exhibit-music")) wrapper.hidden = false;

let activeRoom = "lobby";
let dialogReturn;
let closeGuestbook;
let pointer;
let lastGestureWasDrag = false;

viewport.hidden = !spatial;
controls.hidden = !spatial;
resetView.hidden = !spatial;
document.body.classList.toggle("spatial-museum", spatial);
if (spatial) {
  menu.open = false;
  startSkyClock(viewport, () => museumSkyTime(location));
}

function createPhotoDisplay(photos) {
  const figure = element("figure", "exhibit-photos");
  const image = element("img");
  const caption = element("figcaption");
  const fullImage = element("a", "museum-link", "Open full image");
  fullImage.target = "_blank";
  fullImage.rel = "noopener noreferrer";
  figure.append(image, caption);

  const actions = element("div", "photo-actions");
  let index = 0;
  function showPhoto() {
    const photo = photos[index];
    image.src = new URL(`../${photo.src}`, import.meta.url);
    image.alt = photo.alt;
    fullImage.href = image.src;
    const position = photos.length > 1 ? `Photo ${index + 1} of ${photos.length}` : "";
    caption.textContent = [photo.caption, position].filter(Boolean).join(" · ");
    caption.hidden = !caption.textContent;
  }

  if (photos.length > 1) {
    caption.setAttribute("aria-live", "polite");
    for (const [label, direction] of [["Previous photo", -1], ["Next photo", 1]]) {
      const button = element("button", "museum-link", label);
      button.type = "button";
      button.addEventListener("click", () => {
        index = (index + direction + photos.length) % photos.length;
        showPhoto();
      });
      actions.append(button);
    }
  }

  actions.append(fullImage);
  figure.insertBefore(actions, caption);
  showPhoto();
  return figure;
}

function openExhibit(index) {
  const exhibit = rooms[activeRoom].exhibits?.[index];
  if (!exhibit || dialog.open) return;
  const label = element("p", "room-overline", exhibit.label);
  const title = element("h2", "", exhibit.title);
  title.id = "exhibit-title";
  dialogContent.replaceChildren(label, title);
  if (exhibit.kind === "guestbook") closeGuestbook = mountGuestbook(dialogContent);

  const photos = exhibit.photos || (exhibit.photo ? [exhibit.photo] : []);
  if (photos.length) dialogContent.append(createPhotoDisplay(photos));

  if (exhibit.description) dialogContent.append(element("p", "", exhibit.description));

  if (exhibit.sections?.length) {
    const details = element("dl", "exhibit-details");
    for (const [term, value] of exhibit.sections) details.append(element("dt", "", term), element("dd", "", value));
    dialogContent.append(details);
  }

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

  if (exhibit.awaitingRecording) {
    dialogContent.append(element("p", "recording-note", "The recorded walkthrough will be added here."));
  }

  if (exhibit.links?.length) {
    const links = element("div", "exhibit-links");
    for (const link of exhibit.links) {
      const anchor = element("a", "museum-link", link.label);
      anchor.href = link.url;
      if (link.download) anchor.download = "";
      if (link.url.startsWith("https://")) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      links.append(anchor);
    }
    dialogContent.append(links);
  }

  stopMovement();
  dialogReturn = menu.open ? exhibitList.children[index] : menuButton;
  dialog.showModal();
  dialog.scrollTop = 0;
}

dialog.addEventListener("close", () => {
  closeGuestbook?.();
  closeGuestbook = null;
  if (dialogReturn?.isConnected) dialogReturn.focus({ preventScroll: true });
  dialogReturn = null;
  dialogContent.replaceChildren();
});

function showRoom(roomId, focus, crossing) {
  setMusicRoom(roomId);
  viewport.classList.remove("is-entering");
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
    menu.open = false;
    renderScene(cameraNode, roomId, rooms);
    camera.enter(roomId, crossing);
    if (crossing && !reduceMotion.matches) viewport.classList.add("is-entering");
  }

  if (focus) {
    heading.focus({ preventScroll: true });
    if (!spatial) window.scrollTo(0, 0);
  }
}

function showFromHash(focus) {
  stopMovement();
  const key = location.hash.slice(1);
  showRoom(Object.hasOwn(rooms, key) ? key : "lobby", focus);
}

function visit(roomId, crossing) {
  if (roomId === activeRoom) return;
  if (!crossing) stopMovement();
  history.pushState(null, "", `#${roomId}`);
  showRoom(roomId, true, crossing);
}

roomIndex.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-room]");
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (link.dataset.room === activeRoom && spatial) menu.open = false;
  else visit(link.dataset.room);
});

viewport.addEventListener("click", (event) => {
  if (lastGestureWasDrag) return;
  if (menu.open) {
    menu.open = false;
    return;
  }
  const door = event.target.closest("[data-door]");
  const frame = event.target.closest("[data-exhibit]");
  if (door) visit(door.dataset.door);
  if (frame) openExhibit(Number(frame.dataset.exhibit));
});

viewport.addEventListener("animationend", () => viewport.classList.remove("is-entering"));

viewport.addEventListener("pointerdown", (event) => {
  if (pointer || event.button !== 0 || menu.open) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === "touch" };
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
  const sensitivity = pointer.touch ? 0.28 : 0.15;
  camera.look(-horizontal * sensitivity, vertical * sensitivity * 0.8);
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

resetView.addEventListener("click", () => {
  stopMovement();
  camera.reset();
  menu.open = false;
  menuButton.focus({ preventScroll: true });
});

const keyboardActions = {
  arrowup: "forward", arrowdown: "backward", arrowleft: "left", arrowright: "right",
  w: "forward", s: "backward", a: "strafe-left", d: "strafe-right", q: "left", e: "right",
};
const heldControls = new Map();
let animationFrame = 0;
let previousFrame = 0;

function applyMovement(actions, seconds) {
  const axis = (positive, negative) => Number(actions.has(positive)) - Number(actions.has(negative));
  const crossing = camera.drive(
    axis("forward", "backward"), axis("strafe-right", "strafe-left"), axis("right", "left"), seconds,
  );
  if (crossing) visit(crossing.entrance, crossing);
}

function moveFrame(now) {
  animationFrame = 0;
  if (!heldControls.size || menu.open || dialog.open) return;
  const seconds = Math.min((now - previousFrame) / 1000, 0.045);
  previousFrame = now;
  applyMovement(new Set(heldControls.values()), seconds);
  if (heldControls.size) animationFrame = requestAnimationFrame(moveFrame);
}

function holdControl(source, action) {
  if (heldControls.get(source) === action) return;
  heldControls.set(source, action);
  if (!animationFrame) {
    previousFrame = performance.now();
    applyMovement(new Set(heldControls.values()), 0.026);
    animationFrame = requestAnimationFrame(moveFrame);
  }
}

function stopMovement() {
  touchPad.reset();
  heldControls.clear();
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
}

document.addEventListener("keydown", (event) => {
  if (!camera || dialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (menu.open) {
    if (event.key === "Escape") {
      menu.open = false;
      menuButton.focus({ preventScroll: true });
    }
    return;
  }
  if (event.target.closest?.("input, textarea, select, [contenteditable=true]")) return;
  const key = event.key.toLowerCase();
  if (!Object.hasOwn(keyboardActions, key)) return;
  event.preventDefault();
  holdControl(`key:${key}`, keyboardActions[key]);
});

document.addEventListener("keyup", (event) => heldControls.delete(`key:${event.key.toLowerCase()}`));
window.addEventListener("blur", stopMovement);
document.addEventListener("visibilitychange", () => { if (document.hidden) stopMovement(); });
menu.addEventListener("toggle", () => { if (menu.open) stopMovement(); });

const touchPad = createTouchPad(controls.querySelector(".touch-controls"), {
  enabled: () => Boolean(camera && !menu.open && !dialog.open),
  steer: (action) => {
    if (action) holdControl("touch-pad", action);
    else heldControls.delete("touch-pad");
  },
  nudge: (action) => applyMovement(new Set([action]), 0.11),
});

window.addEventListener("hashchange", () => showFromHash(true));
showFromHash(false);
