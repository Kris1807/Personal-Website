import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const readProjectFile = (name) => readFile(new URL(`../../${name}`, import.meta.url), "utf8");

describe("portfolio landing page", () => {
  it("renders every resume chapter on the primary page", async () => {
    const [html, resumeSource, siteSource] = await Promise.all([
      readProjectFile("index.html"),
      readProjectFile("resume-content.js"),
      readProjectFile("site.js"),
    ]);

    const dom = new JSDOM(html, {
      url: "https://krispitshugin.com/",
      runScripts: "outside-only",
      pretendToBeVisual: true,
    });
    const { window } = dom;

    window.matchMedia = () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    });
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.Element.prototype.scrollTo = () => {};
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(window.document.documentElement, "scrollHeight", {
      configurable: true,
      value: 9000,
    });
    const chapterTops = {
      experience: 1600,
      education: 3000,
      projects: 4300,
      honors: 5900,
      athletics: 7000,
      skills: 8100,
    };
    window.Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
      if (this.classList?.contains("site-header")) {
        return { top: 0, bottom: 88, left: 0, right: 1200, width: 1200, height: 88 };
      }
      const chapterKey = this.id?.replace("portfolio-", "");
      if (chapterTops[chapterKey]) {
        const top = chapterTops[chapterKey] - window.scrollY;
        return { top, bottom: top + 1200, left: 0, right: 1200, width: 1200, height: 1200 };
      }
      return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 };
    };
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Object.defineProperty(window.document, "fonts", {
      configurable: true,
      value: { ready: Promise.resolve() },
    });

    window.eval(resumeSource);
    window.eval(siteSource);

    const chapterKeys = ["experience", "education", "projects", "honors", "athletics", "skills"];
    for (const key of chapterKeys) {
      const chapter = window.document.getElementById(`portfolio-${key}`);
      const content = window.document.getElementById(`landing-${key}`);
      const navLink = window.document.querySelector(`#section-nav a[href="#portfolio-${key}"]`);

      expect(chapter, `${key} chapter`).not.toBeNull();
      expect(content?.children.length, `${key} content`).toBeGreaterThan(0);
      expect(navLink, `${key} landing navigation`).not.toBeNull();
    }

    expect(window.document.querySelectorAll("#landing-experience .detail-card").length).toBe(
      window.resume.experience.length
    );
    expect(window.document.querySelectorAll("#landing-projects .project-feature, #landing-projects .project-secondary-card").length).toBe(
      window.resume.projects.length
    );

    const homeLink = window.document.querySelector('.site-nav-link[href="index.html"]');
    const projectsLink = window.document.querySelector('.site-nav-link[href="#portfolio-projects"]');
    expect(homeLink?.classList.contains("is-active")).toBe(true);

    window.scrollY = 4200;
    window.dispatchEvent(new window.Event("scroll"));
    await new Promise((resolve) => window.setTimeout(resolve, 30));

    expect(homeLink?.classList.contains("is-active")).toBe(false);
    expect(projectsLink?.classList.contains("is-active")).toBe(true);
    expect(projectsLink?.getAttribute("aria-current")).toBe("location");

    dom.window.close();
  });
});
