import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BOARD_CAPACITY, createGuestbookHandler } from "../server/guestbook.mjs";

// Loopback-only preview, deliberately separate from the deployed store.
const notes = [];
const store = {
  async list() {
    return notes.filter(note => note.expiresAt > Date.now());
  },
  async publish(note) {
    const active = await this.list();
    if (active.length >= BOARD_CAPACITY) return "full";
    notes.splice(0, notes.length, note, ...active);
    return "created";
  },
};
const api = createGuestbookHandler({ getStore: () => store });
const root = fileURLToPath(new URL("..", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".m4a": "audio/mp4",
};
const port = Number(process.argv[2] || 8141);

createServer(async (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  try {
    let path = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    if (path === "/api/guestbook") {
      if (request.method === "POST") {
        const chunks = [];
        let length = 0;
        for await (const chunk of request) {
          length += chunk.length;
          if (length <= 4096) chunks.push(chunk);
          else { response.writeHead(413).end(); return; }
        }
        request.body = Buffer.concat(chunks);
      }
      await api(request, response);
      return;
    }
    if (path === "/" || path === "/interactive/") path = "/interactive/index.html";
    const type = types[extname(path).toLowerCase()];
    const allowed = /^\/interactive\/[a-z][\w-]*\.(html|css|js|webp)$/.test(path) ||
      (/^\/assets\//.test(path) && !path.split("/").some(part => part.startsWith("."))) ||
      ["/domain-redirect.js", "/resume-content.js", "/profile.JPG"].includes(path);
    if (!allowed || !type || !["GET", "HEAD"].includes(request.method)) {
      response.writeHead(404).end();
      return;
    }
    const data = await readFile(resolve(root, `.${path}`));
    response.writeHead(200, { "Content-Type": type }).end(request.method === "HEAD" ? undefined : data);
  } catch {
    if (!response.headersSent) response.writeHead(404);
    response.end();
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Visitor Notes preview (temporary local data): http://127.0.0.1:${port}/interactive/`);
});
