const palette = [
  [0, "#172746", "#4c6284"],
  [5, "#293d68", "#666d95"],
  [6, "#5278ab", "#f5b6a1"],
  [8, "#59a7de", "#dceef8"],
  [15, "#55a5df", "#d8edf9"],
  [18, "#6b96cb", "#f9d1a2"],
  [20, "#4b5986", "#f1a795"],
  [21.5, "#283d62", "#647799"],
  [24, "#172746", "#4c6284"],
];

const clamp = (value) => Math.max(0, Math.min(1, value));
const interpolate = (from, to, fraction) => from + (to - from) * fraction;

function mixColor(from, to, fraction) {
  const channels = [1, 3, 5].map(index => Math.round(interpolate(
    parseInt(from.slice(index, index + 2), 16), parseInt(to.slice(index, index + 2), 16), fraction,
  )));
  return `rgb(${channels.join(", ")})`;
}

export function skyAtTime(date) {
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const nextIndex = palette.findIndex(([at]) => at > hour);
  const [start, topFrom, bottomFrom] = palette[nextIndex - 1];
  const [end, topTo, bottomTo] = palette[nextIndex];
  const blend = (hour - start) / (end - start);
  const progress = clamp((hour - 5.75) / 14.5);
  const altitude = Math.sin(progress * Math.PI);
  const sun = clamp((hour - 5.75) * 2.1) * clamp((20.25 - hour) * 2.1);
  const daytime = clamp((hour - 5.25) / 2) * clamp((21.25 - hour) / 2);
  const warm = sun * (1 - altitude);
  return {
    top: mixColor(topFrom, topTo, blend),
    bottom: mixColor(bottomFrom, bottomTo, blend),
    sunX: interpolate(9, 91, progress),
    sunY: 86 - 28 * altitude,
    sun,
    sunHalo: mixColor("#fff2be", "#ffb174", warm),
    cloud: interpolate(0.36, 0.92, daytime),
    cloudLight: interpolate(0.55, 1, daytime),
    cloudWarmth: 0.36 * warm,
    stars: 1 - daytime,
    floor: interpolate(0.13, 1, altitude * sun),
  };
}

export function paintSky(root, date) {
  const { top, bottom, sunX, sunY, sun, sunHalo, cloud, cloudLight, cloudWarmth, stars, floor } = skyAtTime(date);
  for (const [name, value] of Object.entries({
    top, bottom, "sun-x": `${sunX}%`, "sun-y": `${sunY}%`, sun, cloud, stars, floor,
    "sun-halo": sunHalo, "cloud-light": cloudLight, "cloud-warmth": cloudWarmth,
  })) {
    root.style.setProperty(`--sky-${name}`, String(value));
  }
}

// Local preview links can show the daylight design even while it is dark.
export function museumSkyTime(location, date = new Date()) {
  if (!["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) return date;
  const hour = new URLSearchParams(location.search).get("sky-hour");
  if (hour === null || !/^\d{1,2}$/.test(hour) || Number(hour) > 23) return date;
  const preview = new Date(date);
  preview.setHours(Number(hour), 0, 0, 0);
  return preview;
}

export function startSkyClock(root, now = () => new Date()) {
  let timer;
  function refresh() {
    clearTimeout(timer);
    if (document.hidden) return;
    const date = now();
    paintSky(root, date);
    timer = setTimeout(refresh, 60_000 - (Date.now() % 60_000));
  }
  document.addEventListener("visibilitychange", refresh);
  refresh();
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", refresh);
  };
}
