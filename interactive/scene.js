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

function door(doorway, rooms) {
  const { id, x, z, nx, nz, turn } = doorway;
  const node = plane("gallery-door", 147, 276, x + nx, floorY - 138, z + nz, `rotateY(${turn}deg)`);
  node.dataset.door = id;
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

function passage({ id, x, z, nx, nz, turn }, rooms) {
  const depth = 94;
  const galleryDepth = 310;
  const galleryWidth = 390;
  const midpoint = floorY - doorwayHeight / 2;
  const facing = `rotateY(${turn}deg)`;
  const surface = (style, width, height, offset, y, distance, angle = facing) => plane(
    style, width, height, x + nz * offset - nx * distance, y, z - nx * offset - nz * distance, angle,
  );
  const side = (length, height, width, y, distance, direction) => surface(
    "portal-side", length, height, direction * width / 2, y, distance, `rotateY(${turn - direction * 90}deg)`,
  );
  const galleryCenter = depth + galleryDepth / 2;
  const back = depth + galleryDepth;
  const room = rooms[id];
  const farWall = surface("gallery-wall portal-wall", galleryWidth, roomHeight, 0, centerY, back);
  farWall.style.setProperty("--wall-tone", room.tone);
  const title = surface("portal-preview", 154, 89, 0, -10, back - 2);
  title.append(element("span", "", id === "lobby" ? room.title : room.exhibits[0]?.title || room.title));

  return [
    surface("portal-floor", doorwayWidth, depth, 0, floorY, depth / 2, `${facing} rotateX(90deg)`),
    surface("portal-ceiling", doorwayWidth, depth, 0, floorY - doorwayHeight, depth / 2, `${facing} rotateX(-90deg)`),
    side(depth, doorwayHeight, doorwayWidth, midpoint, depth / 2, -1),
    side(depth, doorwayHeight, doorwayWidth, midpoint, depth / 2, 1),
    surface("portal-floor", galleryWidth, galleryDepth, 0, floorY, galleryCenter, `${facing} rotateX(90deg)`),
    surface("portal-ceiling", galleryWidth, galleryDepth, 0, ceilingY, galleryCenter, `${facing} rotateX(-90deg)`),
    side(galleryDepth, roomHeight, galleryWidth, centerY, galleryCenter, -1),
    side(galleryDepth, roomHeight, galleryWidth, centerY, galleryCenter, 1),
    farWall,
    surface("gallery-wash", 265, 260, 0, -30, back - 1),
    title,
  ];
}

function exhibitImage(exhibit) {
  if (exhibit.photo) {
    const image = element("img", exhibit.photo.fit === "document" ? "frame-document" : "frame-photo");
    image.src = new URL(`../${exhibit.photo.src}`, import.meta.url);
    image.alt = "";
    image.decoding = "async";
    image.loading = "lazy";
    image.draggable = false;
    return image;
  }

  const artwork = element("div", `exhibit-art exhibit-art--${exhibit.style || "type"}`);
  artwork.append(element("span", "art-label", exhibit.label), element("strong", "art-title", exhibit.title));
  if (exhibit.style === "roster" || exhibit.style === "vision") {
    const motif = element("div", "art-motif");
    for (let index = 0; index < 8; index++) {
      const block = element("span");
      block.style.setProperty("--level", [34, 76, 50, 64, 86, 59, 74, 96][index] + "%");
      motif.append(block);
    }
    artwork.append(motif);
  }
  return artwork;
}

const displayWalls = {
  front: { x: 0, z: -roomDepth / 2, nx: 0, nz: 1, turn: 0, span: roomWidth - 100 },
  right: { x: roomWidth / 2, z: 0, nx: -1, nz: 0, turn: -90, span: roomDepth - 104 },
  left: { x: -roomWidth / 2, z: 0, nx: 1, nz: 0, turn: 90, span: roomDepth - 104 },
};

function wallSlots(roomId, count) {
  if (roomId === "lobby") return [{ wallName: "front", offset: 151, width: 114, height: 136 }];

  const front = Math.min(count, count >= 10 ? 4 : 3);
  const spare = count - front;
  const slots = ([wallName, total]) => {
    const distance = displayWalls[wallName].span / Math.max(2, total);
    const width = Math.min(278, distance - 27);
    return Array.from({ length: total }, (_, index) => ({
      wallName, offset: (index - (total - 1) / 2) * distance, width, height: 180,
    }));
  };
  return [["front", front], ["right", Math.ceil(spare / 2)], ["left", Math.floor(spare / 2)]].flatMap(slots);
}

function exhibitFrame(exhibit, index, { wallName, offset, width, height }) {
  const { x, z, nx, nz, turn } = displayWalls[wallName];
  const mount = (style, w, h, y, depth) => plane(
    style, w, h, x + offset * nz + nx * depth, y, z - offset * nx + nz * depth, `rotateY(${turn}deg)`,
  );
  const frame = mount(`gallery-frame${width < 200 ? " is-compact" : ""}`, width, height, -4, 4);
  frame.dataset.exhibit = String(index);
  frame.dataset.wall = wallName;
  frame.append(exhibitImage(exhibit), element("span", "frame-caption", exhibit.title));
  const wash = mount("gallery-wash", width + 64, 300, -44, 1);
  const lamp = mount("gallery-frame-lamp", Math.min(57, width / 3), 7, -height / 2 - 22, 6);
  return [wash, lamp, frame];
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

export function renderScene(camera, roomId, rooms) {
  const room = rooms[roomId];
  const doors = roomDoors(roomId);
  camera.style.setProperty("--wall-tone", room.tone);
  const floor = plane("gallery-floor", roomWidth, roomDepth, 0, floorY, 0, "rotateX(90deg)");
  const ceiling = plane("gallery-ceiling", roomWidth, roomDepth, 0, ceilingY, 0, "rotateX(-90deg)");
  ceiling.append(element("div", "gallery-skylight"));
  camera.replaceChildren(
    floor,
    ceiling,
    wall("", roomWidth, 0, -roomDepth / 2, 0, 1, 0, doors),
    wall("gallery-wall--left", roomDepth, -roomWidth / 2, 0, 1, 0, 90, doors),
    wall("gallery-wall--right", roomDepth, roomWidth / 2, 0, -1, 0, -90, doors),
    wall("", roomWidth, 0, roomDepth / 2, 0, -1, 180, doors),
    ...doors.flatMap((doorway) => passage(doorway, rooms)),
    ...doors.map((doorway) => door(doorway, rooms)),
  );

  const slots = wallSlots(roomId, room.exhibits.length);
  camera.append(...room.exhibits.flatMap((exhibit, index) => exhibitFrame(exhibit, index, slots[index])));
  if (roomId === "lobby") camera.append(...bench());
}

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function createCamera(viewport, camera) {
  let roomId = "lobby";
  let view = arrivalView(roomId);
  let doors = [];
  let perspective = 650;

  const paint = () => {
    const { x, z, yaw, pitch } = view;
    camera.style.transform = `translateZ(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) translate3d(${-x}px, 0, ${-z}px)`;
    for (const { doorway, node } of doors) {
      node.classList.toggle("is-open", shouldOpenDoor(view, doorway, node.classList.contains("is-open")));
    }
  };

  new ResizeObserver(([{ contentRect }]) => {
    const lens = contentRect.width < 700 ? 0.7 : 0.65;
    perspective = Math.min(contentRect.width * lens, contentRect.height * 1.1);
    viewport.style.perspective = `${perspective}px`;
    paint();
  }).observe(viewport);

  return {
    enter(nextRoom, crossing) {
      roomId = nextRoom;
      doors = roomDoors(roomId).map((doorway) => ({ doorway, node: camera.querySelector(`[data-door="${doorway.id}"]`) }));
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
