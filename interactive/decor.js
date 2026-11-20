import { lobbyPedestals } from "./navigation.js";

const objects = {
  porcelain: {
    label: "Porcelain",
    profile: [[0, 14], [10, 21], [34, 26], [53, 18], [65, 11], [79, 13]],
  },
  celadon: {
    label: "Celadon",
    profile: [[0, 11], [11, 20], [33, 24], [58, 17], [76, 10], [90, 12]],
  },
  bronze: {
    label: "Bronze Form",
    profile: [[0, 12], [10, 11], [16, 15], [23, 22], [39, 26], [55, 21], [65, 8], [67, 0]],
  },
};

function pedestal({ x, z, width, depth, height, piece }, floorY, plane) {
  const top = floorY - height;
  const center = top + height / 2;
  const front = plane("plinth-side plinth-front", width, height, x, center, z + depth / 2);
  const label = document.createElement("span");
  label.className = "plinth-label";
  label.textContent = objects[piece].label;
  front.append(label);

  return [
    plane("plinth-shadow", width + 42, depth + 43, x + 6, floorY - 1, z + 7, "rotateX(90deg)"),
    plane("plinth-top", width, depth, x, top, z, "rotateX(90deg)"),
    front,
    plane("plinth-side", width, height, x, center, z - depth / 2, "rotateY(180deg)"),
    plane("plinth-side", depth, height, x - width / 2, center, z, "rotateY(-90deg)"),
    plane("plinth-side", depth, height, x + width / 2, center, z, "rotateY(90deg)"),
  ];
}

function ceramic({ x, z, height, piece }, floorY, plane, facets) {
  const { profile } = objects[piece];
  const base = floorY - height;
  const chordFactor = 2 * Math.sin(Math.PI / facets);
  const apothemFactor = Math.cos(Math.PI / facets);
  const faces = [plane("pot-shadow", 61, 47, x + 3, base - 1, z + 5, "rotateX(90deg)")];

  for (let band = 1; band < profile.length; band++) {
    const [lowerY, lowerRadius] = profile[band - 1];
    const [upperY, upperRadius] = profile[band];
    const lowerWidth = lowerRadius * chordFactor;
    const upperWidth = upperRadius * chordFactor;
    const width = Math.max(lowerWidth, upperWidth);
    const radius = (lowerRadius + upperRadius) * apothemFactor / 2;
    const rise = upperY - lowerY;
    const taper = (lowerRadius - upperRadius) * apothemFactor;
    const tilt = Math.atan2(taper, rise) * 180 / Math.PI;
    const y = base - (lowerY + upperY) / 2;
    const corner = (edge) => `${Math.max(0, (width - edge) / 2 - 0.12)}px`;
    const upperInset = corner(upperWidth);
    const lowerInset = corner(lowerWidth);

    for (let side = 0; side < facets; side++) {
      const angle = side * 2 * Math.PI / facets;
      const rotation = `rotateY(${side * 360 / facets}deg) rotateX(${tilt}deg)`;
      const face = plane(`pot-face pot-${piece}`, width, Math.hypot(rise, taper),
        x + Math.sin(angle) * radius, y, z + Math.cos(angle) * radius, rotation);
      face.style.clipPath = `polygon(${upperInset} 0, calc(100% - ${upperInset}) 0, calc(100% - ${lowerInset}) 100%, ${lowerInset} 100%)`;
      const light = 23 + Math.round((1 + Math.cos(angle + 1.15)) * 31);
      face.style.setProperty("--pot-light", `${light}%`);
      if (piece === "porcelain" && (band === 1 || band === 4)) face.classList.add("pot-ribbon");
      faces.push(face);
    }
  }

  if (piece !== "bronze") {
    const [height, radius] = profile.at(-1);
    faces.push(plane(`pot-rim pot-${piece}`, radius * 2, radius * 2, x, base - height, z, "rotateX(90deg)"));
  }
  return faces;
}

export function lobbyDecor(plane, floorY, preview) {
  return lobbyPedestals.flatMap((item) => [
    ...pedestal(item, floorY, plane),
    ...ceramic(item, floorY, plane, preview ? 6 : 9),
  ]);
}
