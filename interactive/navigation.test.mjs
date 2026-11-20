import { describe, expect, it } from "vitest";
import { arrivalView, benchPosition, roomDoors, shouldOpenDoor, walkStep } from "./navigation.js";

function walk(room, start, { forward = 1, strafe = 0, steps = 150 } = {}) {
  let view = { ...start };
  for (let index = 0; index < steps; index++) {
    view = { ...view, ...walkStep(view, room, forward, strafe, 5) };
    if (view.entrance) break;
  }
  return view;
}

describe("first-person museum navigation", () => {
  it("walks straight from the lobby spawn through the Projects door", () => {
    expect(walk("lobby", arrivalView("lobby")).entrance).toBe("projects");
  });

  it("opens doors on approach and keeps them open while walking through", () => {
    const door = roomDoors("lobby").find(({ id }) => id === "projects");
    expect(shouldOpenDoor({ x: 0, z: -190 }, door, false)).toBe(false);
    expect(shouldOpenDoor({ x: 0, z: -220 }, door, false)).toBe(true);
    expect(shouldOpenDoor({ x: 0, z: -380 }, door, true)).toBe(true);
    expect(shouldOpenDoor({ x: 140, z: -220 }, door, false)).toBe(false);
  });

  it("blocks a walk into the wall or the bench", () => {
    const wall = walk("lobby", { x: 130, z: -220, yaw: 0 });
    expect(wall.entrance).toBeUndefined();
    expect(wall.z).toBeGreaterThan(-370);
    const bench = walk("lobby", { x: benchPosition.x, z: 10, yaw: 0 });
    expect(bench.entrance).toBeUndefined();
    expect(bench.z).toBeGreaterThan(benchPosition.z + 36);
  });

  it("preserves sideways movement through side doors", () => {
    const exit = walk("lobby", { x: -330, z: -238, yaw: 0 }, { forward: 0, strafe: -1 });
    expect(exit.entrance).toBe("skills");
    const arrival = arrivalView("skills", { fromRoom: "lobby", yaw: 0, pitch: 3 });
    const inside = walk("skills", arrival, { forward: 0, strafe: -1, steps: 20 });
    expect(inside.z).toBeLessThan(arrival.z);
    expect(inside.entrance).toBeUndefined();
  });

  it("continues backing away from the door after returning to the lobby", () => {
    const entered = arrivalView("projects", { fromRoom: "lobby", yaw: 0, pitch: 3 });
    expect(walk("projects", entered, { forward: -1 }).entrance).toBe("lobby");
    const returned = arrivalView("lobby", { fromRoom: "projects", yaw: 0, pitch: 3 });
    const retreated = walk("lobby", returned, { forward: -1, steps: 30 });
    expect(retreated.z).toBeGreaterThan(returned.z);
    expect(retreated.entrance).toBeUndefined();
  });
});
