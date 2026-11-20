// @vitest-environment jsdom
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import "../resume-content.js";
import { createRooms } from "./exhibits.js";
import { createCamera, renderScene } from "./scene.js";

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

  it("mounts skill names directly on the wall and keeps physical prints in frames", () => {
    const scene = document.createElement("div");
    renderScene(scene, "skills", rooms);
    const toolboxNames = [...scene.querySelectorAll(".inscription-names li")].map((item) => item.textContent);
    expect(toolboxNames).toEqual(expect.arrayContaining(["PostgreSQL", "Supabase", "KiCad", "Hebrew - Native"]));
    expect(scene.querySelectorAll(".gallery-frame img")).toHaveLength(resume.experience.length);
  });

  it("reveals multiple exhibits and the destination gallery geometry at an open door", () => {
    vi.stubGlobal("ResizeObserver", class { observe() {} });
    try {
      const scene = document.createElement("div");
      renderScene(scene, "lobby", rooms);
      const camera = createCamera(document.createElement("div"), scene, rooms);
      camera.enter("lobby");
      const preview = scene.querySelector('[data-peek="projects"]');
      expect(preview.childElementCount).toBe(0);
      for (let frame = 0; frame < 65; frame++) camera.drive(1, 0, 0, 0.04);
      expect(preview.classList.contains("is-visible")).toBe(true);
      expect(preview.querySelector(".gallery-skylight")).not.toBeNull();
      expect(preview.querySelectorAll(".gallery-inscription")).toHaveLength(rooms.projects.exhibits.length);
      expect(preview.querySelectorAll("[data-exhibit]")).toHaveLength(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("puts the credited Swiss Trials photo and medal wall in Swimming", () => {
    const swiss = rooms.swimming.exhibits.find(({ title }) => title === "Swiss Olympic Trials");
    expect(swiss.photo.caption).toContain("G. Velletri");
    expect(swiss.photo.src).toBe("assets/athletics/swiss-olympic-trials.webp");
    expect(titles("swimming")).toContain("Medal wall");
    expect(titles("honors")).not.toContain("Medal wall");
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
