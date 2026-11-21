import { element } from "./scene.js";

const ENDPOINT = "../api/guestbook";
const POLICY = "Notes are public and automatically deleted 2 weeks after posting. Please don’t include private information.";
const dates = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

function action(label, primary = false) {
  const button = element("button", `museum-link${primary ? " guestbook-primary" : ""}`, label);
  button.type = "button";
  return button;
}

function dateLabel(timestamp, prefix) {
  const date = new Date(timestamp);
  const time = element("time", "", `${prefix}${dates.format(date)}`);
  time.dateTime = date.toISOString();
  return time;
}

function cardFor(note) {
  const button = element("button", "guestbook-note");
  button.type = "button";
  const name = element("strong", "", note.name);
  const excerpt = element("p", "", note.message.length > 75 ? `${note.message.slice(0, 75).trimEnd()}…` : note.message);
  name.dir = excerpt.dir = "auto";
  button.append(name, excerpt, dateLabel(note.createdAt, ""));
  return button;
}

export function mountGuestbook(container, { fetchImpl = fetch, now = Date.now } = {}) {
  const abort = new AbortController();
  const panel = element("section", "guestbook-panel");
  const status = element("p", "guestbook-status");
  const content = element("div");
  status.setAttribute("role", "status");
  panel.append(element("p", "guestbook-policy", POLICY), status, content);
  container.append(panel);

  let notes = [];
  let view = "loading";
  let selectedId;
  let timer;

  function notice(message = "") {
    status.textContent = message;
    status.hidden = !message;
  }

  async function request(options) {
    const response = await fetchImpl(ENDPOINT, { ...options, cache: "no-store", signal: abort.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) throw new Error(payload?.error || "The guestbook is not available right now.");
    return payload;
  }

  function expire() {
    clearTimeout(timer);
    const cutoff = now();
    notes = notes.filter(note => note.expiresAt > cutoff);
    if (notes.length) timer = setTimeout(() => {
      expire();
      if (view === "list") showList();
      if (view === "note" && !notes.some(({ id }) => id === selectedId)) {
        showList(true, "That note has expired.");
      }
    }, Math.max(1, Math.min(...notes.map(note => note.expiresAt)) - cutoff));
  }

  function showList(focus = false, message = "", returnId) {
    view = "list";
    expire();
    notice(message || (notes.length ? "" : "No notes yet. Leave the first one!"));
    const toolbar = element("div", "guestbook-toolbar");
    const leave = action("Leave a note", true);
    leave.addEventListener("click", showForm);
    const refresh = action("Refresh");
    refresh.addEventListener("click", () => load(true));
    toolbar.append(leave, refresh);
    const grid = element("div", "guestbook-notes");
    let returnTo;
    for (const note of notes) {
      const card = cardFor(note);
      card.addEventListener("click", () => showNote(note));
      grid.append(card);
      if (note.id === returnId) returnTo = card;
    }
    content.replaceChildren(toolbar, grid);
    if (focus) (returnTo ?? leave).focus({ preventScroll: true });
  }

  function showNote(note) {
    if (note.expiresAt <= now()) return showList(true, "That note has expired.");
    view = "note";
    selectedId = note.id;
    notice();
    const toolbar = element("div", "guestbook-toolbar");
    const back = action("Back to notes");
    back.addEventListener("click", () => showList(true, "", note.id));
    toolbar.append(back);
    const paper = element("article", "guestbook-note");
    const name = element("strong", "", note.name);
    const message = element("p", "", note.message);
    name.dir = message.dir = "auto";
    paper.append(name, dateLabel(note.createdAt, "Posted "), message, dateLabel(note.expiresAt, "Deletes "));
    content.replaceChildren(toolbar, paper);
    back.focus({ preventScroll: true });
  }

  function showForm() {
    view = "form";
    notice();
    const form = element("form", "guestbook-form");
    const name = element("input");
    name.id = "guestbook-name";
    name.maxLength = 32;
    name.autocomplete = "off";
    name.dir = "auto";
    const nameLabel = element("label", "", "Display name (optional)");
    nameLabel.htmlFor = name.id;
    const message = element("textarea");
    message.id = "guestbook-message";
    message.maxLength = 400;
    message.required = true;
    message.dir = "auto";
    const messageLabel = element("label", "", "Your note");
    messageLabel.htmlFor = message.id;
    const count = element("span", "guestbook-count", "0 / 400");
    count.id = "guestbook-count";
    message.setAttribute("aria-describedby", count.id);
    message.addEventListener("input", () => { count.textContent = `${message.value.length} / 400`; });

    const toolbar = element("div", "guestbook-toolbar");
    const submit = action("Post public note", true);
    submit.type = "submit";
    const cancel = action("Cancel");
    cancel.addEventListener("click", () => showList(true));
    toolbar.append(submit, cancel);
    form.append(nameLabel, name, messageLabel, message, count, toolbar);
    content.replaceChildren(form);
    message.focus();

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (submit.disabled) return;
      if (!message.value.trim()) {
        notice("Write a note before posting.");
        message.focus();
        return;
      }
      submit.disabled = cancel.disabled = true;
      notice("Posting…");
      try {
        const { note } = await request({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.value, message: message.value }),
        });
        if (abort.signal.aborted) return;
        notes.unshift(note);
        showList(true, "Your note is on the board.", note.id);
      } catch (error) {
        if (abort.signal.aborted) return;
        notice(error.message || "Your note couldn’t be posted.");
        submit.disabled = cancel.disabled = false;
      }
    });
  }

  async function load(focus = false) {
    view = "loading";
    notice("Reading the board…");
    content.replaceChildren();
    try {
      const data = await request();
      if (abort.signal.aborted) return;
      notes = data.notes;
      showList(focus);
    } catch {
      if (abort.signal.aborted) return;
      notice("The guestbook is not available right now.");
      const retry = action("Try again");
      retry.addEventListener("click", () => load(true));
      content.replaceChildren(retry);
      if (focus) retry.focus();
    }
  }

  void load();
  return () => {
    abort.abort();
    clearTimeout(timer);
  };
}
