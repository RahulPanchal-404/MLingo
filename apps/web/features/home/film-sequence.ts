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
  scene0: { opacity: [[0, 1], [0.7, 1], [1.1, 0]], y: [[0, 0], [1.1, -24]] },
  scene1: { opacity: [[0.9, 0], [1.3, 1], [2.6, 1], [3, 0]], y: [[0.9, 24], [1.3, 0], [3, -24]] },
  scene2: { opacity: [[2.8, 0], [3.2, 1], [8.1, 1], [8.5, 0]], y: [[2.8, 24], [3.2, 0], [8.5, -24]] },
  scene3: { opacity: [[8.3, 0], [8.7, 1], [10, 1]], y: [[8.3, 24], [8.7, 0]] },
  // Camera: starts pulled back, pushes in on the fit while it trains, settles wide at the end.
  plot: { scale: [[0, 0.92], [1.3, 1], [6, 1.08], [9, 1]], x: [[0, 30], [1.3, 0], [6, -20], [9, 0]] },
  loss: { opacity: [[0, 0], [1.6, 0], [2.2, 1]], y: [[1.6, 16], [2.2, 0]] },
  gaps: { opacity: [[0.6, 0], [1.2, 1], [8, 0.35]] },
};

const DEFAULTS: Record<string, Record<string, number>> = {
  scene0: { opacity: 1, y: 0 },
  scene1: { opacity: 0, y: 0 },
  scene2: { opacity: 0, y: 0 },
  scene3: { opacity: 0, y: 0 },
  plot: { scale: 1, x: 0 },
  loss: { opacity: 0, y: 0 },
  gaps: { opacity: 0 },
};

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
