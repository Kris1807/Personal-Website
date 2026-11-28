import { expect, it } from "vitest";
import { nearbyExhibit } from "./exhibit-cue.js";

const view = { x: 0, z: 0, yaw: 0, pitch: 0 };
const viewport = { width: 1280, height: 720, perspective: 800 };
const front = { x: 0, z: -280, y: -4, cueY: 55, nx: 0, nz: 1 };

it("selects a nearby exhibit in view and positions its cue in the viewport", () => {
  const next = nearbyExhibit(view, [{ ...front, x: -84 }, front], viewport);
  expect(next.exhibit).toBe(front);
  expect({ x: next.x, y: next.y }).toEqual({ x: 640, y: 517 });
});

it("does not show cues from across the room, offscreen, or for a back face", () => {
  expect(nearbyExhibit(view, [{ ...front, z: -320 }], viewport)).toBeNull();
  expect(nearbyExhibit({ ...view, yaw: 90 }, [front], viewport)).toBeNull();
  expect(nearbyExhibit(view, [{ ...front, nz: -1 }], viewport)).toBeNull();
  expect(nearbyExhibit(view, [{ ...front, cueY: 150 }], viewport)).toBeNull();
});

it("handles side-wall exhibits and phone viewports", () => {
  const wall = { ...front, x: 220, z: 0, nx: -1, nz: 0 };
  const phone = { width: 390, height: 740, perspective: 288 };
  expect(nearbyExhibit({ ...view, yaw: 90 }, [wall], phone).exhibit).toBe(wall);
  expect(nearbyExhibit({ ...view, yaw: 90 }, [{ ...wall, z: 115 }], phone)).toBeNull();
  expect(nearbyExhibit({ ...view, yaw: 90, pitch: 30 }, [{ ...wall, cueY: 130 }], phone)).toBeNull();
});
