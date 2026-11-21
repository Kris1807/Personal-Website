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
    expect(titles("skills")).not.toContain("Full-stack engineering");
    expect(rooms.skills.exhibits.some(({ label }) => label === "Roster Lab App")).toBe(false);
    expect(rooms.projects.exhibits.find(({ title }) => title === "Film-Hub").tags).toEqual([
      "Django", "JavaScript", "Supabase",
    ]);
  });

  it("shows academic milestones, individual certificates, and all honors", () => {
    expect(titles("education")).toEqual(expect.arrayContaining([
      "Master of Science in Artificial Intelligence", "Bachelor of Science in Computer Science", "Minor in Business",
      "Google Cybersecurity", "Intermediate Machine Learning",
    ]));
    expect(titles("education")).not.toContain("Relevant Coursework & Credentials");
    expect(titles("education")).toContain("Master’s thesis");
    expect(rooms.honors.exhibits.map(({ description }) => description)).toEqual(expect.arrayContaining(resume.honors));
  });

  it("hangs every exhibit with a matching index and keeps the large collections spread across three walls", () => {
    const camera = document.createElement("div");
    for (const [roomId, room] of Object.entries(rooms)) {
      renderScene(camera, roomId, rooms);
      const frames = [...camera.querySelectorAll("[data-exhibit]")];
      expect(frames.map((frame) => Number(frame.dataset.exhibit))).toEqual(room.exhibits.map((_, index) => index));
      const generalFrames = frames.filter((frame) => !frame.matches(
        ".gallery-frame--team, .gallery-frame--partner, .gallery-partner-invitation",
      ));
      if (generalFrames.length >= 5) expect(new Set(generalFrames.map((frame) => frame.dataset.wall)).size).toBe(3);
    }
  });

  it("mounts skill names directly on the wall and keeps physical prints in frames", () => {
    const scene = document.createElement("div");
    renderScene(scene, "skills", rooms);
    const toolboxNames = [...scene.querySelectorAll(".inscription-names li")].map((item) => item.textContent);
    expect(toolboxNames).toEqual(expect.arrayContaining(["PostgreSQL", "Supabase", "KiCad", "Hebrew - Native"]));
    expect(scene.querySelectorAll(".gallery-frame img")).toHaveLength(resume.experience.length);
  });

  it("frames the text in Honors and Projects and fits the graduation cover in a portrait frame", () => {
    const scene = document.createElement("div");
    for (const roomId of ["honors", "projects"]) {
      renderScene(scene, roomId, rooms);
      expect(scene.querySelectorAll("[data-exhibit].gallery-frame")).toHaveLength(rooms[roomId].exhibits.length);
      expect(scene.querySelectorAll(".gallery-frame--lettered > .framed-inscription").length).toBeGreaterThan(0);
    }
    renderScene(scene, "education", rooms);
    const gallery = rooms.education.exhibits.findIndex(({ title }) => title === "UGA graduation gallery");
    const frame = scene.querySelector(`[data-exhibit="${gallery}"]`);
    expect(parseFloat(frame.style.width)).toBeLessThan(parseFloat(frame.style.height));
    expect(frame.querySelector("img.frame-contained")?.src).toContain("graduation-arch.jpeg");
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

  it("adds the three clickable team logos beside the Swimming room's Lobby door", async () => {
    const scene = document.createElement("div");
    renderScene(scene, "swimming", rooms);
    const teams = [...scene.querySelectorAll(".gallery-frame--team")];
    expect(teams.map(frame => frame.dataset.wall)).toEqual(["rear", "rear", "rear"]);
    expect(teams.map(frame => frame.querySelector(".frame-caption").textContent)).toEqual([
      "Georgia Swim & Dive", "Greater Jerusalem Swimming Club", "Israel National Swim Team",
    ]);
    for (const frame of teams) {
      const exhibit = rooms.swimming.exhibits[frame.dataset.exhibit];
      expect(frame.querySelector("img").classList.contains("frame-contained")).toBe(true);
      await access(resolve(exhibit.photo.src));
    }
    const index = rooms.swimming.exhibits.findIndex(({ title }) => title === "Medal wall");
    expect(scene.querySelector(`[data-exhibit="${index}"]`).dataset.wall).toBe("right");
  });

  it("displays Speedo across the door from the Swimming team frames", async () => {
    const scene = document.createElement("div");
    renderScene(scene, "swimming", rooms);
    const partner = scene.querySelector(".gallery-frame--partner");
    const team = scene.querySelector(".gallery-frame--team");
    expect(partner.dataset.wall).toBe("rear");
    expect(partner.style.transform).toMatch(/^translate3d\(-/);
    expect(team.style.transform).toMatch(/^translate3d\(\d/);
    const exhibit = rooms.swimming.exhibits[partner.dataset.exhibit];
    expect(exhibit.title).toBe("Speedo");
    expect(partner.style.width).toBe("112px");
    expect(partner.querySelector(".frame-caption").textContent).toBe("Swimming partner");
    await access(resolve(exhibit.photo.src));
  });

  it("inscribes a visible partner invitation linked to the portfolio email", () => {
    const scene = document.createElement("div");
    renderScene(scene, "swimming", rooms);
    const inscription = scene.querySelector(".gallery-partner-invitation");
    expect(inscription.dataset.wall).toBe("rear");
    expect(inscription.querySelector("strong").textContent).toBe("Want to join me on the journey?");
    expect(inscription.querySelector("span").textContent).toBe("Contact me, I would love to discuss.");
    expect(rooms.swimming.exhibits[inscription.dataset.exhibit].links).toContainEqual({
      label: "Contact me by email", url: resume.contact.find(({ url }) => url.startsWith("mailto:")).url,
    });
  });

  it("fills exactly the unused partner slots with matching emoji frames", () => {
    const scene = document.createElement("div");
    renderScene(scene, "swimming", rooms);
    const speedo = scene.querySelector(".gallery-frame--partner[data-exhibit]");
    const placeholders = [...scene.querySelectorAll(".gallery-frame--partner-placeholder")];
    expect(placeholders).toHaveLength(2);
    for (const frame of placeholders) {
      expect(frame.style.width).toBe(speedo.style.width);
      expect(frame.style.height).toBe(speedo.style.height);
      expect(frame.querySelector(".partner-placeholder-emoji").textContent).toBe("😢");
      expect(frame.hasAttribute("data-exhibit")).toBe(false);
    }
    expect(new Set([speedo, ...placeholders].map(frame => frame.style.transform)).size).toBe(3);
    const swimming = rooms.swimming;
    const partner = swimming.exhibits.find(({ kind }) => kind === "swim-partner");
    renderScene(scene, "swimming", {
      ...rooms, swimming: { ...swimming, exhibits: [...swimming.exhibits, { ...partner, title: "New partner" }] },
    });
    expect(scene.querySelectorAll(".gallery-frame--partner-placeholder")).toHaveLength(1);
  });

  it("puts the plinths and four lamps in the lobby and provides the Visitor Desk downloads", async () => {
    const scene = document.createElement("div");
    renderScene(scene, "lobby", rooms);
    expect(scene.querySelectorAll(".plinth-label")).toHaveLength(3);
    expect(scene.querySelectorAll(".lamp-floor-light")).toHaveLength(4);
    expect(scene.querySelector('[data-door="visitor-desk"] .door-sign').textContent).toBe("Visitor Desk");
    const desk = rooms["visitor-desk"].exhibits;
    expect(titles("visitor-desk")).toEqual(["Résumé", "Connect", "Grade Sheet"]);
    const downloads = desk.flatMap(({ links }) => links || []).filter(({ download }) => download);
    expect(downloads.map(({ url }) => url)).toEqual(["../Kristian-Pitshugin-Resume.pdf"]);
    expect(desk.find(({ title }) => title === "Grade Sheet").links).toBeUndefined();
    await Promise.all(downloads.map(({ url }) => access(resolve(url.slice(3)))));
  });

  it("hangs the three lobby drawings on the rear wall as openable exhibits", () => {
    const scene = document.createElement("div");
    renderScene(scene, "lobby", rooms);
    const frames = [...scene.querySelectorAll('[data-wall="rear"].gallery-frame--drawing')];
    expect(frames.map((frame) => frame.querySelector(".frame-caption").textContent)).toEqual([
      "The Turn", "Signals in Fragments", "Two Vessels at Dusk",
    ]);
    expect(frames.every((frame) => frame.hasAttribute("data-exhibit") && frame.querySelector("img.frame-contained"))).toBe(true);
  });

  it("references existing image files for every frame and photo collection", async () => {
    const paths = new Set();
    for (const { exhibits } of Object.values(rooms)) {
      for (const exhibit of exhibits) {
        if (exhibit.photo) paths.add(exhibit.photo.src);
        if (exhibit.photo?.thumbnail) paths.add(exhibit.photo.thumbnail);
        for (const photo of exhibit.photos || []) paths.add(photo.src);
      }
    }
    for (const photo of resume.athleticsGallery) expect(paths.has(photo.src)).toBe(true);
    await Promise.all([...paths].map((path) => access(resolve(path))));
  });
});
