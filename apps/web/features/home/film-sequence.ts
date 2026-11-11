/**
 * Theatre.js choreography for the home-page training film.
 * The sequence is 10 units long and plays like a video (FILM_RATE stretches it to ~24s). Keyframes are authored in KEYS below
 * and turned into Theatre project state, so the film can also be opened and re-timed in
 * Theatre Studio during development.
 */
import { getProject, onChange, types, type ISheetObject } from "@theatre/core";

export const FILM_LENGTH = 10;
/** Playback speed: 10 units / 0.42 ≈ 24 seconds, enough time to read each scene. */
export const FILM_RATE = 0.42;

type Key = [position: number, value: number];
type Track = Record<string, Key[]>;

/** One row per object, one track per prop. Times in sequence units (0..10). */
export const KEYS: Record<string, Track> = {
  // Title card: pops in, holds, lifts away.
  title: { opacity: [[0, 0], [0.3, 1], [1.5, 1], [1.9, 0]], y: [[0, 30], [0.3, 0], [1.9, -40]], scale: [[0, 0.85], [0.45, 1]] },
  // Data points drop in (per-point stagger and bounce are computed from this 0..1 value).
  points: { drop: [[1.6, 0], [2.7, 1]] },
  // The model's first guess swings in.
  line: { opacity: [[2.5, 0], [2.8, 1]], swing: [[2.5, -30], [3, 0]] },
  gaps: { opacity: [[2.8, 0], [3.1, 1], [8, 0.2]] },
  meter: { opacity: [[2.8, 0], [3.2, 1]], x: [[2.8, 40], [3.2, 0]] },
  badge: { opacity: [[2.8, 0], [3.1, 1]] },
  // Subtitles, one per beat.
  cap1: { opacity: [[1.8, 0], [2, 1], [2.7, 1], [2.9, 0]] },
  cap2: { opacity: [[2.9, 0], [3.1, 1], [4.2, 1], [4.4, 0]] },
  cap3: { opacity: [[4.4, 0], [4.6, 1], [7.8, 1], [8, 0]] },
  cap4: { opacity: [[8, 0], [8.2, 1], [10, 1]] },
  // End stamp lands with a slap.
  stamp: { opacity: [[8.1, 0], [8.3, 1]], scale: [[8.1, 1.7], [8.45, 1]], rotate: [[8.1, -32], [8.45, -8]] },
};

const DEFAULTS: Record<string, Record<string, number>> = {
  title: { opacity: 1, y: 0, scale: 1 },
  points: { drop: 0 },
  line: { opacity: 0, swing: 0 },
  gaps: { opacity: 0 },
  meter: { opacity: 0, x: 0 },
  badge: { opacity: 0 },
  cap1: { opacity: 0 },
  cap2: { opacity: 0 },
  cap3: { opacity: 0 },
  cap4: { opacity: 0 },
  stamp: { opacity: 0, scale: 1, rotate: 0 },
};

/** Training happens between these sequence positions. */
export const TRAIN_START = 3.2;
export const TRAIN_END = 8;

// Theatre bezier handles [rightX, rightY, leftX, leftY]: ease-out entrances (web-motion-design §3).
const EASE = [0.05, 0.7, 0.1, 1];

let uid = 0;
const id = () => `k${(uid++).toString(36).padStart(9, "0")}`;

export function filmState() {
  uid = 0;
  const tracksByObject: Record<string, unknown> = {};
  for (const [obj, props] of Object.entries(KEYS)) {
    const trackData: Record<string, unknown> = {};
    const trackIdByPropPath: Record<string, string> = {};
    for (const [prop, keys] of Object.entries(props)) {
      const trackId = id();
      trackIdByPropPath[JSON.stringify([prop])] = trackId;
      trackData[trackId] = {
        type: "BasicKeyframedTrack",
        keyframes: keys.map(([position, value]) => ({ id: id(), position, connectedRight: true, handles: EASE, value })),
      };
    }
    tracksByObject[obj] = { trackData, trackIdByPropPath };
  }
  return {
    sheetsById: {
      film: { staticOverrides: { byObject: {} }, sequence: { subUnitsPerUnit: 30, length: FILM_LENGTH, type: "PositionalSequence", tracksByObject } },
    },
    definitionVersion: "0.4.0",
    revisionHistory: [],
  };
}

export type FilmValues = Record<string, Record<string, number>>;

/** Builds the project once per page and returns a seek function plus the sheet objects. */
export function createFilm() {
  const project = getProject("MLingo film", { state: filmState() });
  const sheet = project.sheet("film");
  const objects: Record<string, ISheetObject> = {};
  for (const [name, props] of Object.entries(DEFAULTS)) {
    objects[name] = sheet.object(name, Object.fromEntries(Object.entries(props).map(([k, v]) => [k, types.number(v)])));
  }
  return {
    ready: project.ready,
    seek: (progress: number) => {
      sheet.sequence.position = Math.min(1, Math.max(0, progress)) * FILM_LENGTH;
    },
    /** Plays from the current position to the end; resolves true if it finished, false if paused. */
    play: () => sheet.sequence.play({ rate: FILM_RATE }),
    pause: () => sheet.sequence.pause(),
    /** Calls back with playhead progress 0..1 on every frame. */
    onProgress: (fn: (p: number) => void) => onChange(sheet.sequence.pointer.position, (pos) => fn(pos / FILM_LENGTH)),
    read: (): FilmValues => Object.fromEntries(Object.entries(objects).map(([k, o]) => [k, o.value as Record<string, number>])),
    subscribe: (fn: (v: FilmValues) => void) => {
      const offs = Object.values(objects).map((o) => o.onValuesChange(() => fn(Object.fromEntries(Object.entries(objects).map(([k, ob]) => [k, ob.value as Record<string, number>])))));
      return () => offs.forEach((off) => off());
    },
  };
}
