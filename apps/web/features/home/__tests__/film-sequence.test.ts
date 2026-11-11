import { describe, expect, it } from "vitest";
import { createFilm, filmState, KEYS } from "../film-sequence";

describe("training film choreography (Theatre.js)", () => {
  it("generates one keyframed track per authored prop", () => {
    const tracks = filmState().sheetsById.film.sequence.tracksByObject as Record<string, { trackIdByPropPath: Record<string, string> }>;
    for (const [obj, props] of Object.entries(KEYS)) expect(Object.keys(tracks[obj].trackIdByPropPath)).toHaveLength(Object.keys(props).length);
  });

  it("seeks the sequence from scroll progress", async () => {
    const film = createFilm();
    await film.ready;
    film.seek(0);
    expect(film.read().scene0.opacity).toBeCloseTo(1);
    expect(film.read().scene3.opacity).toBeCloseTo(0);
    film.seek(1);
    expect(film.read().scene3.opacity).toBeCloseTo(1);
    expect(film.read().scene0.opacity).toBeCloseTo(0);
    film.seek(0.5);
    expect(film.read().scene2.opacity).toBeCloseTo(1);
  });
});
