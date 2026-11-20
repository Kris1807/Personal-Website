import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { expect, it } from "vitest";

const [html, script] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("./entry.js", import.meta.url), "utf8"),
]);

function makeEntry({ path = "/", reducedMotion = false } = {}) {
  const dom = new JSDOM(html, { url: `https://example.com${path}`, runScripts: "outside-only" });
  const { window } = dom;
  window.document.documentElement.toggleAttribute("data-portfolio-entry", path === "/");
  window.matchMedia = () => ({ matches: reducedMotion });
  window.Element.prototype.getBoundingClientRect = () => ({ left: 20, top: 10, width: 180, height: 300 });
  return window;
}

it("offers both requested portal titles as standard destination links", () => {
  const window = makeEntry();
  const links = [...window.document.querySelectorAll(".portal-choice")];
  expect(links.map(link => [
    window.document.getElementById(link.getAttribute("aria-labelledby")).textContent,
    link.getAttribute("href"),
  ])).toEqual([["Official CV Page", "?view=cv"], ["Interactive CV Game", "interactive/"]]);
  window.close();
});

it.each([
  ["plain", false, false, true],
  ["reduced-motion", true, false, false],
  ["modified", false, true, false],
])("handles a %s click", (_label, reducedMotion, metaKey, animates) => {
  const window = makeEntry({ reducedMotion });
  window.eval(script);
  const entry = window.document.querySelector(".portfolio-entry");
  const link = entry.querySelector('[data-portal="game"]');
  let intercepted;
  window.document.addEventListener("click", event => {
    intercepted = event.defaultPrevented;
    event.preventDefault(); // Don't navigate the test document.
  });
  link.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, metaKey }));
  expect(intercepted).toBe(animates);
  expect(entry.dataset.transition).toBe(animates ? "game" : undefined);
  if (animates) {
    window.dispatchEvent(new window.PageTransitionEvent("pageshow", { persisted: true }));
    expect(entry.dataset.transition).toBeUndefined();
    expect(link.hasAttribute("data-selected")).toBe(false);
  }
  window.close();
});

it.each([false, true])("respects reduced motion (%s) when arriving", reducedMotion => {
  const path = "/?view=cv";
  const window = makeEntry({ path, reducedMotion });
  const key = "portfolio-portal-arrival";
  window.sessionStorage.setItem(key, JSON.stringify({ kind: "official", path, at: Date.now() }));
  window.eval(script);
  expect(window.document.querySelector(".portal-arrival")?.dataset.portal).toBe(reducedMotion ? undefined : "official");
  expect(window.sessionStorage.getItem(key)).toBeNull();
  window.close();
});
