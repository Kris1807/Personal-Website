// @vitest-environment jsdom
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import "../resume-content.js";
import { createRooms } from "./exhibits.js";
import { renderScene } from "./scene.js";

const resume = globalThis.resume;
const rooms = createRooms(resume);
const titles = (room) => rooms[room].exhibits.map(({ title }) => title);

describe("museum collection", () => {
  it("includes every listed project and professional role", () => {
    expect(titles("projects")).toEqual(expect.arrayContaining(resume.projects.map(({ name }) => (
      name === "Cinema Ticketing Website" ? "Film-Hub" : name
    ))));
    expect(titles("projects")[0]).toBe("Roster Lab App");
    expect(titles("skills")).toEqual(expect.arrayContaining(resume.experience.map(({ role }) => role)));
    expect(rooms.projects.exhibits.find(({ title }) => title === "Film-Hub").tags).toEqual([
      "Django", "JavaScript", "Supabase",
    ]);
  });

  it("covers every academic entry and honor in the shared portfolio data", () => {
    expect(titles("education")).toEqual(expect.arrayContaining(resume.education.map(({ degree }) => degree.split("\n")[0])));
    expect(titles("education")).toContain("Master’s thesis");
    expect(rooms.honors.exhibits.map(({ description }) => description)).toEqual(expect.arrayContaining(resume.honors));
  });

  it("hangs every exhibit with a matching index and keeps the large collections spread across three walls", () => {
    const camera = document.createElement("div");
    for (const [roomId, room] of Object.entries(rooms)) {
      renderScene(camera, roomId, rooms);
      const frames = [...camera.querySelectorAll("[data-exhibit]")];
      expect(frames.map((frame) => Number(frame.dataset.exhibit))).toEqual(room.exhibits.map((_, index) => index));
      if (roomId !== "lobby") expect(new Set(frames.map((frame) => frame.dataset.wall)).size).toBe(3);
    }
  });

  it("references existing image files for every frame and photo collection", async () => {
    const paths = new Set();
    for (const { exhibits } of Object.values(rooms)) {
      for (const exhibit of exhibits) {
        if (exhibit.photo) paths.add(exhibit.photo.src);
        for (const photo of exhibit.photos || []) paths.add(photo.src);
      }
    }
    for (const photo of resume.athleticsGallery) expect(paths.has(photo.src)).toBe(true);
    await Promise.all([...paths].map((path) => access(resolve(path))));
  });
});
