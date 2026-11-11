"use client";

import { useEffect, useRef, useState } from "react";

import { createFilm, FILM_LENGTH, TRAIN_END, TRAIN_START, type FilmValues } from "./film-sequence";

/**
 * The home page opener: a short motion-graphics clip of a model learning.
 * A Theatre.js sequence choreographs the beats (title card, data dropping in, the first guess,
 * training, the "Fitted!" stamp). The plot itself is real: every frame is a gradient-descent
 * step on 32 fixed points. It autoplays, holds the last frame, then loops.
 * Two controls only: play/pause and a progress bar you can click.
 */
const STEPS = 40;
const DOT_COLORS = ["#7be0c3", "#8fd3ff", "#ff9a8a", "#b9a6ff", "#ffd166", "#ffb3d9"];
const CAPTIONS = [
  { key: "cap1", text: "Here is some data: 32 points." },
  { key: "cap2", text: "The model's first guess. The orange sticks show how wrong it is." },
  { key: "cap3", text: "Each step, gradient descent nudges the line to shrink the error." },
  { key: "cap4", text: "Fitted. That was linear regression, start to finish." },
];

function run() {
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const xs = Array.from({ length: 32 }, (_, i) => -1 + (2 * i) / 31);
  const ys = xs.map((x) => 1.6 * x + 0.9 + (rand() - 0.5) * 0.8);
  let w = -1.2;
  let b = -0.8;
  const frames: { w: number; b: number; loss: number }[] = [];
  for (let s = 0; s <= STEPS; s++) {
    let gw = 0;
    let gb = 0;
    let l = 0;
    xs.forEach((x, i) => {
      const e = w * x + b - ys[i];
      gw += e * x;
      gb += e;
      l += e * e;
    });
    frames.push({ w, b, loss: l / 32 });
    // Small learning rate so the fit visibly improves across all 40 steps.
    w -= (0.06 * gw) / 16;
    b -= (0.06 * gb) / 16;
  }
  return { xs, ys, frames };
}

const { xs, ys, frames } = run();

// Plot area inside the 1200 x 560 stage.
const sx = (x: number) => 300 + (x + 1) * 280;
const sy = (y: number) => 470 - (y + 2) * 82;

const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

type Film = ReturnType<typeof createFilm> & { loop?: () => Promise<void> };

export function TrainingFilm() {
  const [p, setP] = useState(0);
  const [v, setV] = useState<FilmValues | null>(null);
  const [still, setStill] = useState(false);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  const filmRef = useRef<Film | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const film: Film = createFilm();
    filmRef.current = film;
    const offValues = film.subscribe(setV);
    const offProgress = film.onProgress(setP);
    let timer = 0;
    let alive = true;
    // Play to the end, hold the final frame for a moment, then start again.
    const loop = async () => {
      const finished = await film.play();
      if (!alive || !finished || !playingRef.current) return;
      timer = window.setTimeout(() => {
        if (!alive || !playingRef.current) return;
        film.seek(0);
        void loop();
      }, 3000);
    };
    film.loop = loop;
    void film.ready.then(() => {
      if (!alive) return;
      setV(film.read());
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) void loop();
    });
    return () => {
      alive = false;
      window.clearTimeout(timer);
      film.pause();
      offValues();
      offProgress();
    };
  }, []);

  function toggle() {
    const film = filmRef.current;
    if (!film) return;
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      film.pause();
    } else {
      playingRef.current = true;
      setPlaying(true);
      if (p >= 0.999) film.seek(0);
      void film.loop?.();
    }
  }

  function jump(e: React.MouseEvent<HTMLButtonElement>) {
    const film = filmRef.current;
    if (!film) return;
    const r = e.currentTarget.getBoundingClientRect();
    film.pause();
    film.seek((e.clientX - r.left) / r.width);
    if (playingRef.current) void film.loop?.();
  }

  if (still) return <Stage values={null} pos={FILM_LENGTH} />;

  return (
    <Stage values={v} pos={p * FILM_LENGTH}>
      <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause animation" : "Play animation"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950"
        >
          {playing ? (
            <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden="true"><rect x="2" y="1" width="3" height="10" fill="currentColor" /><rect x="7" y="1" width="3" height="10" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 12 12" className="ml-0.5 h-3.5 w-3.5" aria-hidden="true"><path d="M2 1l9 5-9 5z" fill="currentColor" /></svg>
          )}
        </button>
        <button type="button" onClick={jump} aria-label="Jump to a point in the animation" className="relative h-8 flex-1">
          <span className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white dark:border-slate-600 dark:bg-slate-800" />
          <span className="absolute left-0 right-0 top-1/2 h-2 origin-left -translate-y-1/2 rounded-full bg-[#ff9a8a]" style={{ transform: `translateY(-50%) scaleX(${p})` }} />
        </button>
      </div>
    </Stage>
  );
}

/** The clip itself. values=null renders the final frame (reduced motion). */
function Stage({ values, pos, children }: { values: FilmValues | null; pos: number; children?: React.ReactNode }) {
  const final = values === null;
  const val = (obj: string, prop: string, fallback: number) => (final ? fallback : (values?.[obj]?.[prop] ?? fallback));

  const t = Math.min(1, Math.max(0, (pos - TRAIN_START) / (TRAIN_END - TRAIN_START)));
  const step = final ? STEPS : Math.round(t * STEPS);
  const { w, b, loss } = frames[step];
  const lossShare = loss / frames[0].loss;
  const drop = val("points", "drop", 1);
  const swing = val("line", "swing", 0);
  const titleOpacity = final ? 0 : val("title", "opacity", 1);

  const cx = sx(0);
  const cy = sy(b);

  return (
    <section className="relative border-b-2 border-[var(--ink)] bg-[var(--background)]" aria-label="Animation: a model learning to fit a line">
      <h1 className="sr-only">Watch a model learn</h1>
      <div className="mx-auto max-w-[1320px] px-5 pb-6 pt-8 sm:px-8">
        <div className="film-paper relative overflow-hidden rounded-[28px] border-2 border-[var(--ink)] bg-white dark:bg-slate-900">
          <svg viewBox="0 0 1200 560" className="block h-auto w-full" aria-hidden="true">
            {/* Step badge */}
            <g opacity={val("badge", "opacity", 1)}>
              <rect x="32" y="28" width="168" height="48" rx="24" className="fill-white stroke-slate-950 dark:fill-slate-900 dark:stroke-slate-300" strokeWidth="2.5" />
              <text x="116" y="59" textAnchor="middle" className="fill-slate-950 dark:fill-white" fontSize="20" fontWeight="700">
                step {String(step).padStart(2, "0")} / {STEPS}
              </text>
            </g>

            {/* Error meter */}
            <g opacity={val("meter", "opacity", 1)} transform={`translate(${1060 + val("meter", "x", 0)},90)`}>
              <text x="40" y="-14" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300" fontSize="18" fontWeight="700">error</text>
              <rect x="10" y="0" width="60" height="340" rx="16" className="fill-white stroke-slate-950 dark:fill-slate-900 dark:stroke-slate-300" strokeWidth="2.5" />
              <rect x="16" y={6 + 328 * (1 - lossShare)} width="48" height={328 * lossShare} rx="11" fill="#ff9a8a" />
              <text x="40" y="372" textAnchor="middle" className="fill-slate-950 dark:fill-white" fontSize="20" fontWeight="700">{loss.toFixed(2)}</text>
            </g>

            {/* Error sticks */}
            <g opacity={val("gaps", "opacity", 0.2)}>
              {xs.map((x, i) => (
                <line key={i} x1={sx(x)} x2={sx(x)} y1={sy(ys[i])} y2={sy(w * x + b)} stroke="#ff7a59" strokeWidth="4" strokeLinecap="round" />
              ))}
            </g>

            {/* The model: thick ink line with a cyan core */}
            <g opacity={val("line", "opacity", 1)} transform={`rotate(${swing} ${cx} ${cy})`}>
              <line x1={sx(-1.08)} x2={sx(1.08)} y1={sy(-1.08 * w + b)} y2={sy(1.08 * w + b)} className="stroke-slate-950 dark:stroke-slate-200" strokeWidth="11" strokeLinecap="round" />
              <line x1={sx(-1.08)} x2={sx(1.08)} y1={sy(-1.08 * w + b)} y2={sy(1.08 * w + b)} stroke="#6fd3ff" strokeWidth="5" strokeLinecap="round" />
            </g>

            {/* Data points drop in with a bounce, staggered left to right */}
            {xs.map((x, i) => {
              const local = Math.min(1, Math.max(0, drop * 1.6 - (i / xs.length) * 0.6));
              const e = local === 0 ? 0 : easeOutBack(local);
              const y = sy(ys[i]);
              return (
                <circle
                  key={i}
                  cx={sx(x)}
                  cy={y - (1 - e) * 140}
                  r="10"
                  opacity={local > 0 ? 1 : 0}
                  fill={DOT_COLORS[i % DOT_COLORS.length]}
                  className="stroke-slate-950 dark:stroke-slate-200"
                  strokeWidth="2.5"
                />
              );
            })}

            {/* Fitted! stamp */}
            <g
              opacity={val("stamp", "opacity", 1)}
              transform={`translate(880 470) rotate(${val("stamp", "rotate", -8)}) scale(${val("stamp", "scale", 1)})`}
            >
              <rect x="-110" y="-42" width="220" height="84" rx="18" fill="#c6f07a" stroke="#0e1016" strokeWidth="4" />
              <text x="0" y="16" textAnchor="middle" fill="#0e1016" fontSize="44" fontWeight="800" style={{ fontFamily: "var(--font-display-face)" }}>
                Fitted!
              </text>
            </g>
          </svg>

          {/* Title card */}
          {titleOpacity > 0.01 ? (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/85 dark:bg-slate-900/85"
              style={{ opacity: titleOpacity }}
            >
              <p
                className="font-display px-6 text-center text-[clamp(2.5rem,7vw,6.5rem)] leading-none text-slate-950 dark:text-white"
                style={{ transform: `translateY(${val("title", "y", 0)}px) scale(${val("title", "scale", 1)})` }}
              >
                {["Watch", "a", "model", "learn."].map((word, i) => (
                  <span
                    key={word}
                    className="mx-[0.12em] inline-block rounded-2xl px-[0.18em] pb-[0.08em]"
                    style={{ background: i === 2 ? "#ffd166" : "transparent" }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>
          ) : null}
        </div>

        {/* Subtitles */}
        <div className="relative mt-5 min-h-[3.5rem]" aria-live="polite">
          {CAPTIONS.map((c, i) => {
            const o = final ? (i === CAPTIONS.length - 1 ? 1 : 0) : val(c.key, "opacity", 0);
            return (
              <p
                key={c.key}
                aria-hidden={o < 0.5}
                className="absolute inset-x-0 text-center text-[clamp(1.05rem,1.8vw,1.4rem)] font-medium text-slate-800 dark:text-slate-100"
                style={{ opacity: o, transform: `translateY(${(1 - o) * 8}px)` }}
              >
                {c.text}
              </p>
            );
          })}
        </div>

        {children ? <div className="mx-auto mt-2 max-w-3xl">{children}</div> : null}
      </div>
    </section>
  );
}
