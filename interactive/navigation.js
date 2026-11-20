export const roomWidth = 1010;
export const roomDepth = 740;
export const doorwayWidth = 128;
export const doorwayHeight = 215;
export const benchPosition = { x: -192, z: -147 };

const left = -roomWidth / 2;
const right = roomWidth / 2;
const front = -roomDepth / 2;
const back = roomDepth / 2;
const playerRadius = 18;
const passageDepth = 10;

const lobbyDoors = [
  { id: "education", x: -302, z: front, turn: 0, nx: 0, nz: 1 },
  { id: "projects", x: 0, z: front, turn: 0, nx: 0, nz: 1 },
  { id: "swimming", x: 302, z: front, turn: 0, nx: 0, nz: 1 },
  { id: "skills", x: left, z: -238, turn: 90, nx: 1, nz: 0 },
  { id: "honors", x: right, z: -238, turn: -90, nx: -1, nz: 0 },
];
const returnDoor = { id: "lobby", x: 0, z: back, turn: 180, nx: 0, nz: -1 };

export const roomDoors = (roomId) => roomId === "lobby" ? lobbyDoors : [returnDoor];

export function doorSpace(point, door) {
  const x = point.x - door.x;
  const z = point.z - door.z;
  return { depth: x * door.nx + z * door.nz, offset: x * door.nz - z * door.nx };
}

export function shouldOpenDoor(point, door, isOpen) {
  const { depth, offset } = doorSpace(point, door);
  return depth < (isOpen ? 207 : 164) && Math.abs(offset) < (isOpen ? 118 : 95);
}

function fitsOpening(point, door) {
  const { depth, offset } = doorSpace(point, door);
  return depth <= playerRadius && depth > -40 && Math.abs(offset) < doorwayWidth / 2 - playerRadius;
}

function canOccupy(point, roomId, doors) {
  if (roomId === "lobby" &&
      Math.abs(point.x - benchPosition.x) < 90 + playerRadius &&
      Math.abs(point.z - benchPosition.z) < 36 + playerRadius) return false;

  const inside = point.x >= left + playerRadius && point.x <= right - playerRadius &&
    point.z >= front + playerRadius && point.z <= back - playerRadius;
  return inside || doors.some((door) => fitsOpening(point, door));
}

export function walkStep(view, roomId, forward, strafe, distance) {
  const doors = roomDoors(roomId);
  const angle = view.yaw * Math.PI / 180;
  const scale = distance / Math.max(1, Math.hypot(forward, strafe));
  const across = { x: view.x + (forward * Math.sin(angle) + strafe * Math.cos(angle)) * scale, z: view.z };
  const next = canOccupy(across, roomId, doors) ? across : { x: view.x, z: view.z };
  const ahead = { x: next.x, z: next.z + (strafe * Math.sin(angle) - forward * Math.cos(angle)) * scale };
  const end = canOccupy(ahead, roomId, doors) ? ahead : next;
  const entrance = doors.find((door) => fitsOpening(end, door) && doorSpace(end, door).depth <= -passageDepth);
  return { ...end, entrance: entrance?.id };
}

export function arrivalView(roomId, crossing) {
  if (!crossing) return { x: 0, z: 288, yaw: -1.5, pitch: 3 };

  const { fromRoom, yaw, pitch } = crossing;
  const exited = roomDoors(fromRoom).find((door) => door.id === roomId);
  const entered = roomDoors(roomId).find((door) => door.id === fromRoom);
  const depth = roomId === "lobby" ? 65 : 55;
  return {
    x: entered.x + entered.nx * depth,
    z: entered.z + entered.nz * depth,
    yaw: (yaw + exited.turn + 180 - entered.turn) % 360,
    pitch,
  };
}
