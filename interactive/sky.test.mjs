// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { museumSkyTime, skyAtTime, startSkyClock } from "./sky.js";

const at = (hour, minute = 0) => new Date(2026, 10, 21, hour, minute);

it("moves the sun from morning through afternoon and softens floor light after dark", () => {
  const morning = skyAtTime(at(8));
  const noon = skyAtTime(at(13));
  const evening = skyAtTime(at(19));
  const night = skyAtTime(at(23));
  expect(morning.sunX).toBeLessThan(noon.sunX);
  expect(noon.sunX).toBeLessThan(evening.sunX);
  expect(noon.sunY).toBeLessThan(morning.sunY);
  expect(noon.sunY).toBeLessThan(evening.sunY);
  expect([morning.sun, noon.sun, evening.sun, night.sun]).toEqual([1, 1, 1, 0]);
  expect(night.stars).toBe(1);
  expect(night.floor).toBeLessThan(noon.floor);
  expect(night.top).not.toBe(noon.top);
});

it("warms the clouds in the evening and dims them after dark", () => {
  const noon = skyAtTime(at(13));
  const evening = skyAtTime(at(19));
  const night = skyAtTime(at(23));
  expect(evening.sunHalo).not.toBe(noon.sunHalo);
  expect(evening.cloudWarmth).toBeGreaterThan(noon.cloudWarmth);
  expect(night.cloudLight).toBeLessThan(noon.cloudLight);
});

it("continues across midnight and varies within the hour", () => {
  expect(skyAtTime(at(23, 59)).top).toBe(skyAtTime(at(0)).top);
  expect(skyAtTime(at(11, 1)).sunX).toBeGreaterThan(skyAtTime(at(11)).sunX);
});

it("uses a preview hour only on loopback, without changing the original date", () => {
  const actual = at(3, 12);
  const query = "?sky-hour=14";
  expect(museumSkyTime({ hostname: "127.0.0.1", search: query }, actual).getHours()).toBe(14);
  expect(actual.getHours()).toBe(3);
  expect(museumSkyTime({ hostname: "krispitshugin.com", search: query }, actual)).toBe(actual);
  expect(museumSkyTime({ hostname: "localhost", search: "?sky-hour=25" }, actual)).toBe(actual);
});

it("updates the shared scene clock at the next minute without reloading", () => {
  vi.useFakeTimers();
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  vi.setSystemTime(new Date(2026, 10, 21, 11, 59, 50));
  const root = document.createElement("div");
  const stop = startSkyClock(root);
  try {
    const before = parseFloat(root.style.getPropertyValue("--sky-sun-x"));
    vi.advanceTimersByTime(10_000);
    const after = parseFloat(root.style.getPropertyValue("--sky-sun-x"));
    expect(after).toBeGreaterThan(before);
    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
    vi.setSystemTime(at(23));
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(root.style.getPropertyValue("--sky-sun")).toBe("0");
  } finally {
    stop();
    hidden.mockRestore();
    vi.useRealTimers();
  }
});
