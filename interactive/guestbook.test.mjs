// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountGuestbook } from "./guestbook.js";
import { createRooms } from "./exhibits.js";
import { renderScene } from "./scene.js";
import { BOARD_CAPACITY, createGuestbookHandler, createRedisGuestbook, NOTE_TTL_MS } from "../server/guestbook.mjs";
import "../resume-content.js";

const START = Date.UTC(2026, 10, 21);
const sample = (overrides = {}) => ({
  id: "note-1", name: "Visitor", message: "Great museum", createdAt: START,
  expiresAt: START + NOTE_TTL_MS, ...overrides,
});

async function call(handler, method = "GET", body, headers = {}) {
  const reply = {};
  const response = {
    setHeader(name, value) { reply[name.toLowerCase()] = value; },
    end(payload) { reply.status = this.statusCode; reply.data = JSON.parse(payload); },
  };
  await handler({
    method, body, headers: { "content-type": "application/json", host: "example.test", ...headers },
    socket: { remoteAddress: "192.0.2.20" },
  }, response);
  return reply;
}

describe("guestbook API", () => {
  it("publishes shared notes for 14 days, then excludes them at the expiry boundary", async () => {
    const notes = [];
    const store = {
      async publish(note) { notes.unshift(note); return "created"; },
      async list() { return notes; },
    };
    let time = START;
    const handler = createGuestbookHandler({ getStore: () => store, now: () => time });
    const created = await call(handler, "POST", { name: "   ", message: "  Hello\r\nKris! " });
    expect(created.status).toBe(201);
    expect(created.data.note).toMatchObject({
      name: "Anonymous visitor", message: "Hello\nKris!", createdAt: START,
      expiresAt: START + 1_209_600_000,
    });
    time = created.data.note.expiresAt - 1;
    expect((await call(handler)).data.notes).toEqual([created.data.note]);
    time++;
    expect(await call(handler)).toMatchObject({ status: 200, "cache-control": "no-store", data: { notes: [] } });
  });

  it("rejects invalid or cross-site posts without writing", async () => {
    const publish = vi.fn();
    const handler = createGuestbookHandler({ getStore: () => ({ publish }) });
    expect((await call(handler, "POST", { message: "" })).status).toBe(400);
    expect((await call(handler, "POST", { message: "z".repeat(401) })).status).toBe(400);
    expect((await call(handler, "POST", { message: "https://example.com" })).status).toBe(400);
    expect((await call(handler, "POST", { message: "hello" }, { "content-length": "4097" })).status).toBe(413);
    expect((await call(handler, "POST", { message: "hello" }, { origin: "https://elsewhere.test" })).status).toBe(403);
    expect(publish).not.toHaveBeenCalled();
  });

  it("returns clear cooldown, capacity and unavailable states", async () => {
    const publish = vi.fn().mockResolvedValueOnce("limited").mockResolvedValueOnce("full");
    const handler = createGuestbookHandler({ getStore: () => ({ publish }) });
    expect(await call(handler, "POST", { message: "hi" })).toMatchObject({ status: 429, "retry-after": "120" });
    expect((await call(handler, "POST", { message: "hi" })).status).toBe(409);
    expect((await call(createGuestbookHandler({ getStore: () => null }))).status).toBe(503);
  });

  it("asks Redis to atomically store with a real TTL and queries only live records", async () => {
    const note = sample();
    const key = `museum:guestbook:v1:note:${note.id}`;
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(Response.json({ result: "created" }))
      .mockResolvedValueOnce(Response.json({ result: [key, "expired-key"] }))
      .mockResolvedValueOnce(Response.json({ result: [JSON.stringify(note), null] }));
    const store = createRedisGuestbook({ url: "https://redis.example.test", token: "test-token", fetchImpl, now: () => START });
    expect(await store.publish(note, "192.0.2.20")).toBe("created");
    expect(await store.list()).toEqual([note]);
    const [write, range, read] = fetchImpl.mock.calls.map(([, request]) => JSON.parse(request.body));
    expect(write[0]).toBe("EVAL");
    expect(write[1]).toContain("redis.call('SET', KEYS[2], ARGV[4], 'PX', ARGV[5])");
    expect(write[5]).not.toContain("192.0.2.20");
    expect(write.slice(6)).toEqual([START, BOARD_CAPACITY, 120, JSON.stringify(note), NOTE_TTL_MS, note.expiresAt]);
    expect(range.slice(2)).toEqual(["+inf", `(${START}`, "LIMIT", 0, BOARD_CAPACITY]);
    expect(read).toEqual(["MGET", key, "expired-key"]);
  });

  it("accepts quoted dashboard values and keeps Redis failures private", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(Response.json({ error: "secret provider detail" }, { status: 401 }));
    const getStore = () => createRedisGuestbook({
      url: ' "https://redis.example.test" ', token: ' "sample-secret" ', fetchImpl,
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const reply = await call(createGuestbookHandler({ getStore }));
      expect(reply.status).toBe(503);
      expect(reply.data.error).not.toContain("secret");
      expect(fetchImpl.mock.calls[0][0].href).toBe("https://redis.example.test/");
      expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe("Bearer sample-secret");
      expect(log.mock.calls).toEqual([["Museum guestbook storage unavailable:", "rest_http_401"]]);
    } finally {
      log.mockRestore();
    }
  });
});

const buttonNamed = (node, name) => [...node.querySelectorAll("button")].find(button => button.textContent === name);
const mount = (fetchImpl, now = () => START) => {
  const node = document.createElement("div");
  document.body.append(node);
  return { node, close: mountGuestbook(node, { fetchImpl, now }) };
};
afterEach(() => document.body.replaceChildren());

it("mounts the guestbook as a left-wall lobby exhibit and preserves the rear drawings", () => {
  const rooms = createRooms(globalThis.resume);
  const scene = document.createElement("div");
  renderScene(scene, "lobby", rooms);
  const board = scene.querySelector(".gallery-guestbook");
  expect(board.dataset.wall).toBe("left");
  expect(rooms.lobby.exhibits[board.dataset.exhibit].kind).toBe("guestbook");
  expect(scene.querySelectorAll('[data-wall="rear"].gallery-frame--drawing')).toHaveLength(3);
});

it("lists notes, lets a visitor read one and post safely as plain text", async () => {
  const original = sample();
  const created = sample({ id: "note-2", message: "<img src=x> Hi!" });
  const fetchImpl = vi.fn()
    .mockResolvedValueOnce(Response.json({ notes: [original, sample({ name: "Expired", expiresAt: START })] }))
    .mockResolvedValueOnce(Response.json({ note: created }, { status: 201 }));
  const { node, close } = mount(fetchImpl);
  try {
    await vi.waitFor(() => expect(node.querySelectorAll(".guestbook-note").length).toBe(1));
    expect(node.textContent).toContain("automatically deleted 2 weeks");
    node.querySelector(".guestbook-note").click();
    expect(node.querySelector("article").textContent).toContain("Deletes ");
    buttonNamed(node, "Back to notes").click();
    buttonNamed(node, "Leave a note").click();
    node.querySelector("textarea").value = created.message;
    node.querySelector("form").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    await vi.waitFor(() => expect(node.textContent).toContain("Your note is on the board."));
    expect(node.querySelector("img")).toBeNull();
    expect(node.querySelector(".guestbook-note").textContent).toContain(created.message);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toEqual({ name: "", message: created.message });
  } finally { close(); }
});

it("shows an honest unavailable state without offering to post", async () => {
  const { node, close } = mount(vi.fn().mockResolvedValue(Response.json({ error: "Unavailable" }, { status: 503 })));
  try {
    await vi.waitFor(() => expect(node.textContent).toContain("The guestbook is not available right now."));
    expect(buttonNamed(node, "Leave a note")).toBeUndefined();
    expect(buttonNamed(node, "Try again")).toBeDefined();
  } finally { close(); }
});
