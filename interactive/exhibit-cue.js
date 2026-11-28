const approachDistance = 305;
const radians = Math.PI / 180;

// Project the exhibit and its cue into the same view as the CSS 3D camera.
export function nearbyExhibit(view, exhibits, { width, height, perspective }) {
  if (!width || !height || !perspective) return null;
  const yaw = view.yaw * radians;
  const pitch = view.pitch * radians;
  const sinYaw = Math.sin(yaw);
  const cosYaw = Math.cos(yaw);
  const sinPitch = Math.sin(pitch);
  const cosPitch = Math.cos(pitch);
  let closest = null;
  let bestScore = Infinity;

  for (const exhibit of exhibits) {
    const dx = exhibit.x - view.x;
    const dz = exhibit.z - view.z;
    const distance = Math.hypot(dx, dz);
    if (distance > approachDistance || dx * exhibit.nx + dz * exhibit.nz >= 0) continue;
    const side = dx * cosYaw + dz * sinYaw;
    const forward = dx * sinYaw - dz * cosYaw;
    const project = y => {
      const depth = forward * cosPitch - y * sinPitch;
      if (depth <= 0) return null;
      const scale = perspective / depth;
      return { x: side * scale, y: (y * cosPitch + forward * sinPitch) * scale };
    };
    const center = project(exhibit.y);
    const cue = project(exhibit.cueY);
    if (!center || !cue || Math.abs(center.x) > width * 0.46 || Math.abs(center.y) > height * 0.45 ||
      Math.abs(cue.x) > width / 2 - 62 || Math.abs(cue.y) > height / 2 - 20) continue;
    const score = Math.hypot(center.x / width, center.y / height) + distance / approachDistance * 0.15;
    if (score >= bestScore) continue;
    bestScore = score;
    closest = { exhibit, x: Math.round(width / 2 + cue.x), y: Math.round(height / 2 + cue.y) };
  }
  return closest;
}
