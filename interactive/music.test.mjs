// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { bindMuseumMusic } from "./music.js";

function setup() {
  const root = document.createElement("div");
  root.innerHTML = `
    <audio data-src="../assets/museum/after-hours.m4a" loop preload="none"></audio>
    <button><span data-music-label></span></button>
    <button><span data-music-label></span></button>
    <span role="status"></span>
  `;
  const audio = root.querySelector("audio");
  const [corner, dialog] = root.querySelectorAll("button");
  const status = root.querySelector('[role="status"]');
  let paused = true;
  Object.defineProperty(audio, "paused", { get: () => paused });
  audio.play = vi.fn(async () => { paused = false; });
  audio.pause = vi.fn(() => { paused = true; });
  const setRoom = bindMuseumMusic(audio, [corner, dialog], [status]);
  return { audio, corner, dialog, status, setRoom };
}

it("starts silent and keeps the corner and exhibit controls in sync", async () => {
  const { audio, corner, dialog } = setup();
  expect(audio.getAttribute("src")).toBeNull();
  expect(audio.play).not.toHaveBeenCalled();
  expect(corner.textContent).toBe("Play music");
  corner.click();
  await Promise.resolve();
  expect(audio.loop).toBe(true);
  expect(audio.getAttribute("src")).toBe(audio.dataset.src);
  expect(dialog.getAttribute("aria-label")).toBe("Pause museum music");
  audio.currentTime = 2;
  dialog.click();
  expect(audio.currentTime).toBe(2);
  expect(corner.textContent).toBe("Play music");
  corner.click();
  await Promise.resolve();
  expect(audio.currentTime).toBe(2);
  expect(dialog.textContent).toBe("Pause music");
});

it("reports a failed load and allows playback to be retried", async () => {
  const { audio, corner, status } = setup();
  audio.play.mockRejectedValueOnce(new Error("Unavailable"));
  corner.click();
  await Promise.resolve();
  expect(status.hidden).toBe(false);
  expect(corner.textContent).toBe("Play music");
  corner.click();
  await Promise.resolve();
  expect(status.hidden).toBe(true);
  expect(corner.textContent).toBe("Pause music");
});

it("keeps Projects silent and resumes only music that was already playing", async () => {
  const { audio, corner, dialog, setRoom } = setup();
  setRoom("projects");
  expect(corner.textContent).toBe("Music off in Projects");
  expect(dialog.disabled).toBe(true);
  dialog.click();
  expect(audio.play).not.toHaveBeenCalled();

  setRoom("lobby");
  expect(corner.disabled).toBe(false);
  expect(audio.play).not.toHaveBeenCalled();

  corner.click();
  await Promise.resolve();
  audio.currentTime = 4;
  setRoom("projects");
  expect(audio.paused).toBe(true);
  corner.click();
  expect(audio.play).toHaveBeenCalledTimes(1);
  setRoom("projects");
  setRoom("education");
  await Promise.resolve();
  expect(audio.paused).toBe(false);
  expect(audio.currentTime).toBe(4);
  expect(audio.play).toHaveBeenCalledTimes(2);

  corner.click();
  setRoom("projects");
  setRoom("lobby");
  expect(audio.paused).toBe(true);
  expect(audio.play).toHaveBeenCalledTimes(2);
});

it("stays silent when a pending playback is interrupted by entering Projects", async () => {
  const { audio, corner, status, setRoom } = setup();
  let rejectPlay;
  audio.play.mockImplementationOnce(() => new Promise((_, reject) => { rejectPlay = reject; }));
  corner.click();
  setRoom("projects");
  rejectPlay(new Error("Interrupted"));
  await Promise.resolve();
  expect(status.hidden).toBe(true);
  expect(audio.paused).toBe(true);
  expect(audio.play).toHaveBeenCalledTimes(1);

  setRoom("swimming");
  await Promise.resolve();
  expect(audio.paused).toBe(false);
  expect(status.hidden).toBe(true);
});
