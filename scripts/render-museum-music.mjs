import { writeFileSync } from "node:fs";

// "After Hours": original 12-bar lounge loop. Render to WAV before encoding as AAC.
const output = process.argv[2];
if (!output) throw new Error("Usage: node scripts/render-museum-music.mjs OUTPUT.wav");

const tempo = 84;
const beat = 60 / tempo;
const rate = 44100;
const tau = 2 * Math.PI;
// Root, electric piano voicing, and lead notes for each bar.
const score = [
  [48, [55, 59, 62, 64], [[0.5, 76], [1.5, 74], [2.75, 71]]],
  [45, [55, 59, 60, 64], [[0.25, 72], [1.75, 76], [3, 79]]],
  [50, [53, 57, 60, 64], [[0.5, 77], [2, 76], [3, 74]]],
  [43, [53, 57, 59, 64], [[0.75, 71], [2.75, 74]]],
  [48, [55, 59, 62, 64], [[0.5, 76], [1.5, 79], [3, 81]]],
  [43, [53, 56, 59, 64], [[0.5, 80], [1.75, 79], [3.25, 76]]],
  [45, [55, 59, 60, 64], [[0.5, 76], [1.5, 72], [3, 71]]],
  [48, [55, 58, 62, 64], [[0.75, 74], [2, 76], [3.25, 79]]],
  [41, [53, 57, 60, 64], [[0.5, 81], [2, 76]]],
  [46, [53, 57, 60, 62], [[0.25, 77], [1.75, 74], [3, 72]]],
  [50, [53, 57, 60, 64], [[0.5, 69], [1.5, 72], [2.75, 76]]],
  [43, [53, 57, 59, 64], [[0.5, 74], [2, 71], [3.25, 74]]],
];
const frames = Math.round(score.length * 4 * beat * rate);
const left = new Float32Array(frames);
const right = new Float32Array(frames);
let seed = 27;
const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32) * 2 - 1;
const hz = pitch => 440 * 2 ** ((pitch - 69) / 12);
const mix = (time, duration, pan, sample) => {
  const start = Math.round(time * rate);
  const leftGain = Math.sqrt((1 - pan) / 2);
  const rightGain = Math.sqrt((1 + pan) / 2);
  for (let frame = 0; frame < Math.round(duration * rate); frame++) {
    const at = (start + frame) % frames;
    const value = sample(frame / rate, Math.max(0, 1 - frame / (duration * rate)) ** 0.6);
    left[at] += leftGain * value;
    right[at] += rightGain * value;
  }
};

function piano(time, pitch, duration, velocity, pan) {
  const f = tau * hz(pitch);
  mix(time, duration, pan, (t, end) => {
    const attack = Math.min(1, t / 0.019);
    const release = Math.exp(-2.1 * t);
    const bell = Math.sin(f * 2.002 * t) * Math.exp(-7 * t) * 0.21 + Math.sin(f * 3.996 * t) * Math.exp(-15 * t) * 0.06;
    return velocity * attack * end * release * (Math.sin(f * t) + bell);
  });
}

function bass(time, pitch, duration, velocity) {
  const f = tau * hz(pitch - 12);
  mix(time, duration, 0, (t, end) => velocity * Math.min(1, t / 0.015) * end * Math.exp(-2.4 * t) *
    (Math.sin(f * t) + 0.22 * Math.sin(f * 2 * t) * Math.exp(-7 * t)));
}

function brush(time, velocity, pan) {
  let previous = 0;
  let soft = 0;
  mix(time, 0.19, pan, (t, end) => {
    const n = rand();
    soft += 0.17 * ((n - previous) - soft);
    previous = n;
    return soft * velocity * Math.min(1, t / 0.025) * Math.exp(-13 * t) * end;
  });
}

for (let bar = 0; bar < score.length; bar++) {
  const [root, chord, melody] = score[bar];
  const at = offset => (bar * 4 + offset) * beat;
  for (const [time, length, gain] of [[0.025, 1.25, 0.046], [1.74, 0.8, 0.034], [3.01, 0.83, 0.038]]) {
    chord.forEach((pitch, i) => piano(at(time + i * 0.018), pitch, beat * length, gain, (i - 1.5) * 0.22));
  }
  bass(at(0), root, beat * 1.42, 0.095);
  bass(at(1.51), root + 7, beat * 0.84, 0.064);
  bass(at(2.52), root, beat * 0.84, 0.075);
  bass(at(3.53), score[(bar + 1) % score.length][0] - 1, beat * 0.43, 0.052);
  for (const [offset, pitch] of melody) piano(at(offset), pitch, beat * 1.0, 0.062, 0.18);
  for (const offset of [1, 3]) brush(at(offset + 0.018), 0.083, -0.3);
  for (const offset of [0.62, 2.62, 3.61]) brush(at(offset), 0.038, 0.3);
}

const wav = Buffer.alloc(44 + frames * 4);
wav.write("RIFF", 0);
wav.writeUInt32LE(wav.length - 8, 4);
wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(2, 22);
wav.writeUInt32LE(rate, 24);
wav.writeUInt32LE(rate * 4, 28);
wav.writeUInt16LE(4, 32);
wav.writeUInt16LE(16, 34);
wav.write("data", 36);
wav.writeUInt32LE(frames * 4, 40);
// Quiet in the recording itself, including phones that ignore volume settings.
for (let i = 0; i < frames; i++) {
  const echo = (i - 3271 + frames) % frames;
  const slap = (i - 5963 + frames) % frames;
  wav.writeInt16LE(Math.round(Math.tanh((left[i] + right[echo] * 0.14 + left[slap] * 0.07) * 0.74) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.tanh((right[i] + left[echo] * 0.14 + right[slap] * 0.07) * 0.74) * 32767), 46 + i * 4);
}
writeFileSync(output, wav);
