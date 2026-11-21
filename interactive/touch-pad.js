function directionAt(pad, event) {
  const { left, top, width, height } = pad.getBoundingClientRect();
  const x = event.clientX - left - width / 2;
  const y = event.clientY - top - height / 2;
  const distance = Math.hypot(x, y);
  const radius = Math.min(width, height) / 2;
  if (distance < radius * 0.24 || distance > radius * 1.3) return null;
  if (Math.abs(x) > Math.abs(y)) return x < 0 ? "left" : "right";
  return y < 0 ? "forward" : "backward";
}

export function createTouchPad(pad, { enabled, steer, nudge }) {
  const buttons = [...pad.querySelectorAll("[data-motion]")];
  let pointerId = null;
  let direction = null;

  function setDirection(next) {
    if (direction === next) return;
    direction = next;
    buttons.forEach(button => button.classList.toggle("is-held", button.dataset.motion === direction));
    steer(direction);
  }

  function reset() {
    const id = pointerId;
    pointerId = null;
    setDirection(null);
    if (id !== null && pad.hasPointerCapture(id)) pad.releasePointerCapture(id);
  }

  for (const type of ["contextmenu", "selectstart", "dragstart"]) {
    pad.addEventListener(type, event => event.preventDefault());
  }

  pad.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (pointerId !== null || !enabled()) return;
    pointerId = event.pointerId;
    pad.setPointerCapture(pointerId);
    setDirection(event.target.closest("[data-motion]")?.dataset.motion ?? directionAt(pad, event));
  });
  pad.addEventListener("pointermove", event => {
    if (pointerId !== event.pointerId) return;
    if (!enabled()) reset();
    else setDirection(directionAt(pad, event));
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    pad.addEventListener(type, event => { if (pointerId === event.pointerId) reset(); });
  }

  pad.addEventListener("click", event => {
    const action = event.target.closest("[data-motion]")?.dataset.motion;
    if (action && event.detail === 0 && enabled()) nudge(action);
  });

  return { reset };
}
