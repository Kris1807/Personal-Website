import { lobbyLamps, lobbyPedestals, roomDepth, roomWidth } from "./navigation.js";

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

function facetedBand(plane, { x, z, base, lower, upper, facets, style }) {
  const [lowerY, lowerRadius] = lower;
  const [upperY, upperRadius] = upper;
  const chordFactor = 2 * Math.sin(Math.PI / facets);
  const apothemFactor = Math.cos(Math.PI / facets);
  const lowerWidth = lowerRadius * chordFactor;
  const upperWidth = upperRadius * chordFactor;
  // Slightly overlap adjacent faces so antialiasing cannot reveal hairline seams.
  const width = Math.max(lowerWidth, upperWidth) + 0.28;
  const radius = (lowerRadius + upperRadius) * apothemFactor / 2;
  const rise = upperY - lowerY;
  const taper = (lowerRadius - upperRadius) * apothemFactor;
  const tilt = Math.atan2(taper, rise) * 180 / Math.PI;
  const y = base - (lowerY + upperY) / 2;
  const corner = (edge) => `${Math.max(0, (width - edge) / 2 - 0.12)}px`;
  const upperInset = corner(upperWidth);
  const lowerInset = corner(lowerWidth);

  return Array.from({ length: facets }, (_, side) => {
    const angle = side * 2 * Math.PI / facets;
    const halfAngle = Math.PI / facets;
    const rotation = `rotateY(${side * 360 / facets}deg) rotateX(${tilt}deg)`;
    const face = plane(style, width, Math.hypot(rise, taper),
      x + Math.sin(angle) * radius, y, z + Math.cos(angle) * radius, rotation);
    face.style.clipPath = `polygon(${upperInset} 0, calc(100% - ${upperInset}) 0, calc(100% - ${lowerInset}) 100%, ${lowerInset} 100%)`;
    const light = direction => `${23 + Math.round((1 + Math.cos(direction + 1.15)) * 31)}%`;
    face.style.setProperty("--facet-light", light(angle));
    if (style.startsWith("pot-face")) {
      face.style.setProperty("--facet-light-start", light(angle - halfAngle));
      face.style.setProperty("--facet-light-end", light(angle + halfAngle));
    }
    return face;
  });
}

function ceramic({ x, z, height, piece }, floorY, plane, facets) {
  const { profile } = objects[piece];
  const base = floorY - height;
  const faces = [plane("pot-shadow", 61, 47, x + 3, base - 1, z + 5, "rotateX(90deg)")];

  for (let band = 1; band < profile.length; band++) {
    const ribbon = piece === "porcelain" && (band === 1 || band === 4) ? " pot-ribbon" : "";
    faces.push(...facetedBand(plane, {
      x, z, base, lower: profile[band - 1], upper: profile[band], facets, style: `pot-face pot-${piece}${ribbon}`,
    }));
  }

  if (piece !== "bronze") {
    const [height, radius] = profile.at(-1);
    faces.push(plane(`pot-rim pot-${piece}`, radius * 2, radius * 2, x, base - height, z, "rotateX(90deg)"));
  }
  return faces;
}

function floorLamp({ x, z }, floorY, plane, preview) {
  const side = Math.sign(x);
  const end = Math.sign(z);
  const band = (style, lower, upper, facets) => facetedBand(plane, {
    x, z, base: floorY, lower, upper, facets, style: `floor-lamp-part ${style}`,
  });
  return [
    plane("floor-lamp-part lamp-floor-light", 220, 176, x - side * 22, floorY - 1, z - end * 21, "rotateX(90deg)"),
    plane("floor-lamp-part lamp-wall-light", 132, 225, side * (roomWidth / 2 - 2), -19, end * 301, `rotateY(${-side * 90}deg)`),
    plane("floor-lamp-part lamp-wall-light", 174, 225, side * 409, -19, end * (roomDepth / 2 - 2), `rotateY(${end > 0 ? 180 : 0}deg)`),
    ...band("lamp-brass lamp-base", [0, 23], [8, 21], preview ? 6 : 8),
    plane("floor-lamp-part lamp-base-top", 42, 42, x, floorY - 8, z, "rotateX(90deg)"),
    ...band("lamp-brass", [8, 3.6], [151, 3.1], 5),
    plane("floor-lamp-part lamp-diffuser", 48, 48, x, floorY - 151, z, "rotateX(-90deg)"),
    ...band("lamp-shade", [151, 29], [195, 15], preview ? 6 : 9),
    plane("floor-lamp-part lamp-shade-top", 30, 30, x, floorY - 195, z, "rotateX(90deg)"),
  ];
}

export function lobbyDecor(plane, floorY, preview) {
  const pieces = lobbyPedestals.flatMap((item) => [
    ...pedestal(item, floorY, plane),
    ...ceramic(item, floorY, plane, preview ? 6 : 15),
  ]);
  return [...pieces, ...lobbyLamps.flatMap((item) => floorLamp(item, floorY, plane, preview))];
}
