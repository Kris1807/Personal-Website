import { lobbyDecor } from "./decor.js";
import {
  arrivalView, benchPosition, doorwayHeight, doorwayWidth, roomDepth, roomDoors,
  roomWidth, shouldOpenDoor, walkStep,
} from "./navigation.js";

const floorY = 160;
const ceilingY = -245;
const roomHeight = floorY - ceilingY;
const centerY = (floorY + ceilingY) / 2;

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function plane(className, width, height, x, y, z, rotation = "") {
  const node = element("div", `plane ${className}`);
  Object.assign(node.style, {
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate3d(${x - width / 2}px, ${y - height / 2}px, ${z}px) ${rotation}`,
  });
  return node;
}

function door(doorway, rooms, preview = false) {
  const { id, x, z, nx, nz, turn } = doorway;
  const node = plane("gallery-door", 147, 276, x + nx, floorY - 138, z + nz, `rotateY(${turn}deg)`);
  if (!preview) node.dataset.door = id;
  const opening = element("div", "door-opening");
  opening.append(element("div", "door-leaf"), element("div", "door-leaf"));
  node.append(element("div", "door-sign", id === "lobby" ? "Lobby" : rooms[id].title), opening);
  return node;
}

function wall(className, width, x, z, nx, nz, turn, doors) {
  const node = plane(`gallery-wall ${className}`, width, roomHeight, x, centerY, z, `rotateY(${turn}deg)`);
  const centers = doors.filter((doorway) => doorway.nx === nx && doorway.nz === nz)
    .map((doorway) => width / 2 + (doorway.x - x) * nz - (doorway.z - z) * nx)
    .sort((a, b) => b - a);
  if (centers.length) {
    const bottom = (xPosition) => `${xPosition}px 100%`;
    const top = (xPosition) => `${xPosition}px ${roomHeight - doorwayHeight}px`;
    const points = ["0 0", "100% 0", "100% 100%"];
    for (const center of centers) {
      const right = center + doorwayWidth / 2;
      const left = center - doorwayWidth / 2;
      points.push(bottom(right), top(right), top(left), bottom(left));
    }
    node.style.clipPath = `polygon(${[...points, "0 100%"].join(", ")})`;
  }
  return node;
}

function passage({ id, x, z, nx, nz, turn }) {
  const depth = 75;
  const scale = 0.6;
  const midpoint = floorY - doorwayHeight / 2;
  const facing = `rotateY(${turn}deg)`;
  const surface = (style, width, height, offset, y, distance, angle = facing) => plane(
    style, width, height, x + nz * offset - nx * distance, y, z - nx * offset - nz * distance, angle,
  );
  const side = (length, height, width, y, distance, direction) => surface(
    "portal-side", length, height, direction * width / 2, y, distance, `rotateY(${turn - direction * 90}deg)`,
  );
  const peek = element("div", "portal-room");
  peek.dataset.peek = id;
  peek.style.transform = `translate3d(${x - nx * depth}px, ${floorY * (1 - scale)}px, ${z - nz * depth}px) ${facing} scale3d(${scale}, ${scale}, ${scale}) translateZ(${-roomDepth / 2}px)`;

  return [
    surface("portal-floor", doorwayWidth, depth, 0, floorY, depth / 2, `${facing} rotateX(90deg)`),
    surface("portal-ceiling", doorwayWidth, depth, 0, floorY - doorwayHeight, depth / 2, `${facing} rotateX(-90deg)`),
    side(depth, doorwayHeight, doorwayWidth, midpoint, depth / 2, -1),
    side(depth, doorwayHeight, doorwayWidth, midpoint, depth / 2, 1),
    peek,
  ];
}

function exhibitImage(photo) {
  const image = element("img", photo.fit ? "frame-contained" : "frame-photo");
  image.src = new URL(`../${photo.thumbnail || photo.src}`, import.meta.url);
  image.alt = "";
  image.decoding = "async";
  image.loading = photo.thumbnail ? "eager" : "lazy";
  image.draggable = false;
  return image;
}

function letterExhibit(mount, exhibit) {
  mount.append(element("strong", "inscription-title", exhibit.title));
  if (exhibit.label === "Toolbox" && exhibit.tags?.length) {
    const list = element("ul", "inscription-names");
    list.append(...exhibit.tags.map((name) => element("li", "", name)));
    mount.append(list);
  } else if (exhibit.label) {
    mount.append(element("span", "inscription-label", exhibit.label));
  }
}

const displayWalls = {
  front: { x: 0, z: -roomDepth / 2, nx: 0, nz: 1, turn: 0, span: roomWidth - 100 },
  right: { x: roomWidth / 2, z: 0, nx: -1, nz: 0, turn: -90, span: roomDepth - 104 },
  left: { x: -roomWidth / 2, z: 0, nx: 1, nz: 0, turn: 90, span: roomDepth - 104 },
  rear: { x: 0, z: roomDepth / 2, nx: 0, nz: -1, turn: 180 },
};

const partnerSlots = 3;
const partnerSlot = (index) => ({ wallName: "rear", offset: 148 + index * 128, width: 112, height: 70 });

function wallSlots(roomId, items) {
  if (roomId === "lobby") {
    const drawings = items.slice(1).filter(({ kind }) => kind !== "guestbook");
    return items.map((item, index) => {
      if (item.kind === "guestbook") return { wallName: "left", offset: -84, width: 256, height: 185 };
      if (index === 0) return { wallName: "front", offset: 151, width: 114, height: 136 };
      return { wallName: "rear", offset: (drawings.indexOf(item) - (drawings.length - 1) / 2) * 230, width: 186, height: 206 };
    });
  }

  // Keep the competition exhibits where they were, with teams and partners
  // on opposite sides of the Lobby door.
  const isRearExhibit = ({ kind }) => ["swim-team", "swim-partner", "swim-partner-invitation"].includes(kind);
  const count = items.filter(item => !isRearExhibit(item)).length;
  const front = Math.min(count, count >= 10 ? 4 : 3);
  const spare = count - front;
  const slots = ([wallName, total]) => {
    const distance = displayWalls[wallName].span / Math.max(2, total);
    const width = Math.min(278, distance - 27);
    return Array.from({ length: total }, (_, index) => ({
      wallName, offset: (index - (total - 1) / 2) * distance, width, height: 180,
    }));
  };
  const regular = [["front", front], ["right", Math.ceil(spare / 2)], ["left", Math.floor(spare / 2)]].flatMap(slots);
  let regularIndex = 0;
  let teamIndex = 0;
  let partnerIndex = 0;
  return items.map(({ kind }) => {
    if (kind === "swim-team") return { wallName: "rear", offset: -404 + teamIndex++ * 128, width: 116, height: 116 };
    if (kind === "swim-partner") return partnerSlot(partnerIndex++);
    if (kind === "swim-partner-invitation") {
      return { wallName: "rear", offset: 276, width: 366, height: 72, y: -111 };
    }
    return regular[regularIndex++];
  });
}

function exhibitFrame(exhibit, index, { wallName, offset, width, height, y: center = -4 }, { preview, frameText }) {
  const { x, z, nx, nz, turn } = displayWalls[wallName];
  const mount = (style, w, h, y, depth) => plane(
    style, w, h, x + offset * nz + nx * depth, y, z - offset * nx + nz * depth, `rotateY(${turn}deg)`,
  );
  const matAndBorder = 28;
  const frameWidth = exhibit.photo?.aspectRatio
    ? Math.min(width, (height - matAndBorder) * exhibit.photo.aspectRatio + matAndBorder)
    : width;
  const placeholder = exhibit.kind === "swim-partner-placeholder";
  const style = exhibit.kind === "guestbook" ? "gallery-guestbook"
    : exhibit.kind === "swim-partner-invitation" ? "gallery-partner-invitation"
    : placeholder ? "gallery-frame gallery-frame--partner gallery-frame--partner-placeholder"
    : exhibit.photo ? "gallery-frame" : frameText ? "gallery-frame gallery-frame--lettered" : "gallery-inscription";
  const display = mount(`${style}${frameWidth < 200 ? " is-compact" : ""}`, frameWidth, height, center, 4);
  if (exhibit.kind === "swim-team") display.classList.add("gallery-frame--team");
  else if (exhibit.kind === "swim-partner") display.classList.add("gallery-frame--partner");
  else if (wallName === "rear" && exhibit.photo) display.classList.add("gallery-frame--drawing");
  if (!preview && !placeholder) {
    display.dataset.exhibit = String(index);
    display.dataset.wall = wallName;
  }
  if (placeholder) {
    display.setAttribute("aria-hidden", "true");
    display.append(
      element("span", "partner-placeholder-emoji", "😢"),
      element("span", "frame-caption", "Open spot"),
    );
  } else if (exhibit.kind === "guestbook") {
    const papers = element("span", "guestbook-papers");
    papers.append(...Array.from({ length: 3 }, () => element("span", "guestbook-paper")));
    display.append(
      element("strong", "guestbook-board-title", exhibit.title),
      papers,
      element("span", "guestbook-board-caption", "Read or leave a note"),
    );
  } else if (exhibit.kind === "swim-partner-invitation") {
    display.append(
      element("strong", "partner-invitation-heading", exhibit.title),
      element("span", "partner-invitation-contact", exhibit.description),
    );
    return [display];
  } else if (exhibit.photo) {
    const caption = exhibit.kind === "swim-partner" ? exhibit.label : exhibit.title;
    display.append(exhibitImage(exhibit.photo), element("span", "frame-caption", caption));
  } else if (frameText) {
    const label = element("div", "gallery-inscription framed-inscription");
    letterExhibit(label, exhibit);
    display.append(label);
  } else {
    letterExhibit(display, exhibit);
  }
  const wash = mount("gallery-wash", frameWidth + 64, 300, -44, 1);
  const lamp = mount("gallery-frame-lamp", Math.min(57, frameWidth / 3), 7, -height / 2 - 22, 6);
  return [wash, lamp, display];
}

function bench() {
  const { x, z } = benchPosition;
  const shadow = plane("bench-shadow", 242, 125, x + 12, floorY - 1, z + 14, "rotateX(90deg)");
  const seat = plane("bench-seat", 180, 73, x, floorY - 42, z, "rotateX(90deg)");
  const front = plane("bench-front", 180, 32, x, floorY - 26, z + 36);
  const rear = plane("bench-front", 180, 32, x, floorY - 26, z - 36, "rotateY(180deg)");
  const left = plane("bench-front", 73, 32, x - 90, floorY - 26, z, "rotateY(-90deg)");
  const right = plane("bench-front", 73, 32, x + 90, floorY - 26, z, "rotateY(90deg)");
  return [shadow, seat, front, rear, left, right];
}

function skylight() {
  const frame = element("div", "gallery-skylight");
  const sky = element("div", "gallery-sky");
  const distantClouds = element("div", "sky-clouds sky-clouds--distant");
  const nearClouds = element("div", "sky-clouds");
  const seconds = Date.now() / 1000;
  distantClouds.style.setProperty("--cloud-delay", `-${seconds % 720}s`);
  nearClouds.style.setProperty("--cloud-delay", `-${seconds % 480}s`);
  sky.append(element("div", "sky-stars"), element("div", "sky-sun"), distantClouds, nearClouds);
  frame.append(sky);
  return frame;
}

function gallery(roomId, rooms, preview = false) {
  const room = rooms[roomId];
  const doors = roomDoors(roomId);
  const floor = plane("gallery-floor", roomWidth, roomDepth, 0, floorY, 0, "rotateX(90deg)");
  const ceiling = plane("gallery-ceiling", roomWidth, roomDepth, 0, ceilingY, 0, "rotateX(-90deg)");
  ceiling.append(skylight());
  const surfaces = [
    floor,
    ceiling,
    wall("", roomWidth, 0, -roomDepth / 2, 0, 1, 0, doors),
    wall("gallery-wall--left", roomDepth, -roomWidth / 2, 0, 1, 0, 90, doors),
    wall("gallery-wall--right", roomDepth, roomWidth / 2, 0, -1, 0, -90, doors),
  ];
  if (!preview) {
    surfaces.push(wall("", roomWidth, 0, roomDepth / 2, 0, -1, 180, doors));
    surfaces.push(...doors.flatMap(passage), ...doors.map((doorway) => door(doorway, rooms)));
  } else if (roomId === "lobby") {
    surfaces.push(...doors.map((doorway) => door(doorway, rooms, preview)));
  }

  const slots = wallSlots(roomId, room.exhibits);
  surfaces.push(...room.exhibits.flatMap((exhibit, index) => {
    const slot = slots[index];
    if (preview && slot.wallName === "rear") return [];
    return exhibitFrame(exhibit, index, slot, { preview, frameText: room.frameText });
  }));
  if (roomId === "swimming" && !preview) {
    const occupied = room.exhibits.filter(({ kind }) => kind === "swim-partner").length;
    for (let index = occupied; index < partnerSlots; index++) {
      surfaces.push(...exhibitFrame({ kind: "swim-partner-placeholder" }, null, partnerSlot(index), { preview }));
    }
  }
  if (roomId === "lobby") surfaces.push(...bench(), ...lobbyDecor(plane, floorY, preview));
  return surfaces;
}

export function renderScene(camera, roomId, rooms) {
  camera.style.setProperty("--wall-tone", rooms[roomId].tone);
  camera.replaceChildren(...gallery(roomId, rooms));
}

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function createCamera(viewport, camera, rooms) {
  let roomId = "lobby";
  let view = arrivalView(roomId);
  let doors = [];
  let perspective = 650;

  const paint = () => {
    const { x, z, yaw, pitch } = view;
    camera.style.transform = `translateZ(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) translate3d(${-x}px, 0, ${-z}px)`;
    for (const { doorway, node, peek } of doors) {
      const open = shouldOpenDoor(view, doorway, node.classList.contains("is-open"));
      if (open && !peek.firstChild) {
        peek.style.setProperty("--wall-tone", rooms[doorway.id].tone);
        peek.append(...gallery(doorway.id, rooms, true));
      }
      node.classList.toggle("is-open", open);
      peek.classList.toggle("is-visible", open);
    }
  };

  new ResizeObserver(([{ contentRect }]) => {
    const { width, height } = contentRect;
    const portrait = width < 700 && height > width;
    perspective = portrait ? Math.min(width * 0.95, Math.max(width * 0.7, height * 0.39))
      : Math.min(width * 0.65, height * 1.1);
    viewport.style.perspective = `${perspective}px`;
    paint();
  }).observe(viewport);

  return {
    enter(nextRoom, crossing) {
      roomId = nextRoom;
      doors = roomDoors(roomId).map((doorway) => ({
        doorway,
        node: camera.querySelector(`[data-door="${doorway.id}"]`),
        peek: camera.querySelector(`[data-peek="${doorway.id}"]`),
      }));
      view = arrivalView(roomId, crossing);
      paint();
    },
    reset() {
      view = arrivalView(roomId);
      paint();
    },
    look(horizontal, vertical = 0) {
      view.yaw = (view.yaw + horizontal) % 360;
      view.pitch = clamp(view.pitch + vertical, -28, 30);
      paint();
    },
    drive(forward, strafe, turn, seconds) {
      view.yaw = (view.yaw + turn * 110 * seconds) % 360;
      const { x, z, entrance } = walkStep(view, roomId, forward, strafe, 204 * seconds);
      view.x = x;
      view.z = z;
      paint();
      if (entrance) return { entrance, fromRoom: roomId, yaw: view.yaw, pitch: view.pitch };
    },
  };
}
