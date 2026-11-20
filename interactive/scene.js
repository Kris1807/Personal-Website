const roomWidth = 1010;
const roomDepth = 740;
const floorY = 160;
const ceilingY = -245;
const roomHeight = floorY - ceilingY;
const centerY = (floorY + ceilingY) / 2;

const doorPositions = {
  education: { x: -302, z: -369, turn: 0 },
  projects: { x: 0, z: -369, turn: 0 },
  swimming: { x: 302, z: -369, turn: 0 },
  skills: { x: -504, z: -145, turn: 90 },
  honors: { x: 504, z: -145, turn: -90 },
};

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

function door(id, title, { x, z, turn }) {
  const node = plane("gallery-door", 147, 276, x, floorY - 138, z, `rotateY(${turn}deg)`);
  node.dataset.door = id;
  const opening = element("div", "door-opening");
  opening.append(element("div", "door-leaf"), element("div", "door-leaf"));
  node.append(element("div", "door-sign", title), opening);
  return node;
}

function exhibitImage(exhibit) {
  if (exhibit.photo) {
    const image = element("img", exhibit.photo.fit === "document" ? "frame-document" : "frame-photo");
    image.src = new URL(`../${exhibit.photo.src}`, import.meta.url);
    image.alt = "";
    image.decoding = "async";
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

function exhibitFrame(exhibit, index, total) {
  const spacing = total === 3 ? 282 : 345;
  const width = total === 3 ? 220 : 280;
  const x = (index - (total - 1) / 2) * spacing;
  const frame = plane("gallery-frame", width, 198, x, -3, -366);
  frame.dataset.exhibit = String(index);
  frame.append(exhibitImage(exhibit), element("span", "frame-caption", exhibit.title));
  return frame;
}

function bench() {
  const shadow = plane("bench-shadow", 207, 110, 0, floorY - 1, 15, "rotateX(90deg)");
  const seat = plane("bench-seat", 180, 73, 0, floorY - 42, 15, "rotateX(90deg)");
  const front = plane("bench-front", 180, 32, 0, floorY - 26, 51);
  const rear = plane("bench-front", 180, 32, 0, floorY - 26, -21, "rotateY(180deg)");
  const left = plane("bench-front", 73, 32, -90, floorY - 26, 15, "rotateY(-90deg)");
  const right = plane("bench-front", 73, 32, 90, floorY - 26, 15, "rotateY(90deg)");
  return [shadow, seat, front, rear, left, right];
}

export function renderScene(camera, roomId, rooms) {
  const room = rooms[roomId];
  camera.style.setProperty("--wall-tone", room.tone);
  const floor = plane("gallery-floor", roomWidth, roomDepth, 0, floorY, 0, "rotateX(90deg)");
  const ceiling = plane("gallery-ceiling", roomWidth, roomDepth, 0, ceilingY, 0, "rotateX(-90deg)");
  ceiling.append(element("div", "gallery-skylight"));
  camera.replaceChildren(
    floor,
    ceiling,
    plane("gallery-wall", roomWidth, roomHeight, 0, centerY, -370),
    plane("gallery-wall gallery-wall--side", roomDepth, roomHeight, -505, centerY, 0, "rotateY(90deg)"),
    plane("gallery-wall gallery-wall--side", roomDepth, roomHeight, 505, centerY, 0, "rotateY(-90deg)"),
    plane("gallery-wall", roomWidth, roomHeight, 0, centerY, 370, "rotateY(180deg)"),
  );

  if (roomId === "lobby") {
    camera.append(...Object.entries(doorPositions).map(([id, position]) => door(id, rooms[id].title, position)), ...bench());
  } else {
    camera.append(...room.exhibits.map((exhibit, index) => exhibitFrame(exhibit, index, room.exhibits.length)));
    camera.append(door("lobby", "Lobby", { x: 504, z: -85, turn: -90 }));
  }
}

const startingView = { x: 0, z: 288, yaw: 0, pitch: -3 };
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

export function createCamera(viewport, camera) {
  let view = { ...startingView };
  let perspective = 650;

  const paint = () => {
    const { x, z, yaw, pitch } = view;
    camera.style.transform = `translateZ(${perspective}px) rotateX(${pitch}deg) rotateY(${yaw}deg) translate3d(${-x}px, 0, ${-z}px)`;
  };

  new ResizeObserver(([{ contentRect }]) => {
    perspective = Math.max(contentRect.width * 0.64, contentRect.height * 0.71);
    viewport.style.perspective = `${perspective}px`;
    paint();
  }).observe(viewport);

  return {
    reset() {
      view = { ...startingView };
      paint();
    },
    look(horizontal, vertical = 0) {
      view.yaw = (view.yaw + horizontal) % 360;
      view.pitch = clamp(view.pitch + vertical, -28, 30);
      paint();
    },
    move(forward, sideways = 0) {
      const angle = view.yaw * Math.PI / 180;
      view.x = clamp(view.x + forward * Math.sin(angle) + sideways * Math.cos(angle), -407, 407);
      view.z = clamp(view.z - forward * Math.cos(angle) + sideways * Math.sin(angle), -275, 315);
      paint();
    },
    approach(id) {
      const position = doorPositions[id];
      if (!position) return;
      const angle = position.turn * Math.PI / 180;
      view = {
        x: position.x + Math.sin(angle) * 119,
        z: position.z + Math.cos(angle) * 119,
        yaw: -(position.turn + Math.round((-view.yaw - position.turn) / 360) * 360),
        pitch: -1,
      };
      paint();
    },
  };
}
