// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { createTouchPad } from "./touch-pad.js";

function setup() {
  const pad = document.createElement("div");
  pad.innerHTML = ["forward", "left", "backward", "right"].map(
    action => `<button data-motion="${action}"></button>`,
  ).join("");
  pad.getBoundingClientRect = () => ({ left: 0, top: 0, width: 150, height: 150 });
  let capture = null;
  pad.setPointerCapture = vi.fn(id => { capture = id; });
  pad.hasPointerCapture = id => capture === id;
  pad.releasePointerCapture = vi.fn(() => { capture = null; });
  const enabled = vi.fn(() => true);
  const steer = vi.fn();
  const nudge = vi.fn();
  const controller = createTouchPad(pad, { enabled, steer, nudge });

  function dispatch(type, { x = 75, y = 75, id = 1, detail = 0, target = pad } = {}) {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, detail });
    Object.defineProperty(event, "pointerId", { value: id });
    target.dispatchEvent(event);
    return event;
  }
  return { pad, enabled, steer, nudge, controller, dispatch };
}

it("holds, changes direction under a sliding thumb, and stops when released", () => {
  const { pad, steer, dispatch } = setup();
  const press = dispatch("pointerdown", { x: 75, y: 25 });
  expect(press.defaultPrevented).toBe(true);
  expect(pad.setPointerCapture).toHaveBeenCalledWith(1);
  expect(pad.querySelector(".is-held")?.dataset.motion).toBe("forward");
  dispatch("pointermove", { x: 125, y: 75, id: 2 });
  dispatch("pointermove", { x: 125, y: 75 });
  expect(pad.querySelector(".is-held")?.dataset.motion).toBe("right");
  dispatch("pointermove");
  expect(pad.querySelector(".is-held")).toBeNull();
  dispatch("pointermove", { x: 75, y: 125 });
  dispatch("pointerup");
  expect(steer.mock.calls.flat()).toEqual(["forward", "right", null, "backward", null]);
  expect(pad.releasePointerCapture).toHaveBeenCalledWith(1);
});

it.each(["pointercancel", "lostpointercapture", "reset"])("stops movement on %s", type => {
  const { pad, steer, controller, dispatch } = setup();
  dispatch("pointerdown", { target: pad.querySelector('[data-motion="left"]') });
  if (type === "reset") controller.reset();
  else dispatch(type);
  expect(steer.mock.calls.flat()).toEqual(["left", null]);
  expect(pad.querySelector(".is-held")).toBeNull();
});

it("blocks selection and long-press menus without removing keyboard and assistive clicks", () => {
  const { pad, enabled, nudge, dispatch } = setup();
  const target = pad.querySelector('[data-motion="left"]');
  for (const type of ["contextmenu", "selectstart", "dragstart"]) {
    expect(dispatch(type, { target }).defaultPrevented).toBe(true);
  }
  dispatch("click", { target, detail: 1 });
  dispatch("click", { target });
  enabled.mockReturnValue(false);
  dispatch("click", { target });
  expect(nudge.mock.calls.flat()).toEqual(["left"]);
});
