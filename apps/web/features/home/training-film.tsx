"use client";

import { useEffect, useRef, useState } from "react";

import { createFilm, type FilmValues } from "./film-sequence";

/**
 * Scroll-scrubbed training run. Scroll seeks a Theatre.js sequence (scene text, camera, loss card);
 * the plot itself is data: every frame is a real gradient-descent step on 32 fixed points.
 * Readable when stopped, reversible on scroll-back (oil-motion runtime rules).
 */
const STEPS = 40;
const SCENES = [
  { kicker: "", title: "Watch a model learn.", body: "Scroll to play it. Every frame is a real step of gradient descent on 32 points." },
  { kicker: "Step 0", title: "It starts out wrong.", body: "Random weights. The line misses almost every point. The orange gaps are the error it will try to shrink." },
  { kicker: "Steps 1 to 20", title: "Then it walks downhill.", body: "Each step nudges the weights against the gradient. The loss falls fast at first, then slows down." },
  { kicker: "Step 40", title: "Until it settles.", body: "Converged. That was linear regression. In MLingo you can pause, rewind and break any frame of any model." },
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
    w -= (0.18 * gw) / 16;
    b -= (0.18 * gb) / 16;
  }
  return { xs, ys, frames };
}

const { xs, ys, frames } = run();

const sx = (x: number) => 40 + (x + 1) * 170;
const sy = (y: number) => 400 - (y + 2) * 80;

export function TrainingFilm() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const [v, setV] = useState<FilmValues | null>(null);
  const [still, setStill] = useState(false);
  const filmRef = useRef<ReturnType<typeof createFilm> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const film = createFilm();
    filmRef.current = film;
    const off = film.subscribe(setV);
    void film.ready.then(() => setV(film.read()));
    return off;
  }, []);

  useEffect(() => {
    filmRef.current?.seek(p);
  }, [p]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setP(Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (still) return <StillFrame />;

  const step = Math.min(STEPS, Math.round(Math.max(0, (p - 0.2) / 0.72) * STEPS));
  const { w, b, loss } = frames[step];
  const scene = p < 0.11 ? 0 : p < 0.29 ? 1 : p < 0.84 ? 2 : 3;
  const val = (obj: string, prop: string, fallback: number) => v?.[obj]?.[prop] ?? fallback;
  const lossPath = frames.map((f, i) => `${i ? "L" : "M"}${14 + i * 4.8} ${108 - (f.loss / frames[0].loss) * 76}`).join("");
  const lossLen = 260;

  return (
    <section ref={ref} className="relative h-[480vh] bg-slate-950 text-[#eeece6]" aria-label="Scroll-driven training run">
      <div className="sticky top-0 grid h-screen content-center items-center gap-6 overflow-hidden px-6 sm:px-10 lg:grid-cols-[1fr_1.2fr] lg:gap-10 lg:px-[6vw]">
        <div className="relative h-[36vh] lg:h-[60vh]">
          {SCENES.map((s, i) => (
            <div
              key={s.title}
              aria-hidden={i !== scene}
              className="absolute inset-0 flex flex-col justify-center will-change-transform"
              style={{
                opacity: val(`scene${i}`, "opacity", i === scene ? 1 : 0),
                transform: `translateY(${val(`scene${i}`, "y", 0)}px)`,
                pointerEvents: i === scene ? "auto" : "none",
              }}
            >
              {s.kicker ? <p className="mb-5 text-[15px] text-slate-400">{s.kicker}</p> : null}
              {i === 0 ? (
                <h1 className="text-[clamp(3.5rem,8vw,8rem)] text-[#eeece6]">{s.title}</h1>
              ) : (
                <h2 className="text-[clamp(2.75rem,5.5vw,5.5rem)] text-[#eeece6]">{s.title}</h2>
              )}
              <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-slate-300 lg:mt-6 lg:text-lg">{s.body}</p>
            </div>
          ))}
        </div>

        <svg
          viewBox="0 0 640 460"
          className="mx-auto block w-full max-w-sm overflow-visible lg:max-w-none"
          aria-hidden="true"
          style={{ transform: `translateX(${val("plot", "x", 0)}px) scale(${val("plot", "scale", 1)})`, transformOrigin: "40% 55%" }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="40" x2="380" y1={80 + i * 40} y2={80 + i * 40} className="stroke-slate-800" />
          ))}
          <g opacity={val("gaps", "opacity", 0)}>
            {xs.map((x, i) => (
              <line key={i} x1={sx(x)} x2={sx(x)} y1={sy(ys[i])} y2={sy(w * x + b)} className="stroke-ember" strokeWidth="1.5" />
            ))}
          </g>
          {xs.map((x, i) => (
            <circle key={i} cx={sx(x)} cy={sy(ys[i])} r="4" fill="#eeece6" />
          ))}
          <line x1={sx(-1)} x2={sx(1)} y1={sy(-w + b)} y2={sy(w + b)} className="stroke-teal-300" strokeWidth="3" strokeLinecap="round" />
          <g transform={`translate(400,${40 + val("loss", "y", 0)})`} opacity={val("loss", "opacity", 0)}>
            <rect width="220" height="120" rx="10" className="fill-slate-900 stroke-slate-800" />
            <path d={lossPath} fill="none" className="stroke-ember" strokeWidth="2" pathLength={lossLen} strokeDasharray={lossLen} strokeDashoffset={lossLen * (1 - step / STEPS)} />
            <text x="14" y="22" className="fill-slate-400" fontSize="12">loss</text>
            <text x="206" y="22" textAnchor="end" fill="#eeece6" fontSize="13" fontWeight="600">{loss.toFixed(3)}</text>
          </g>
        </svg>

        <div className="absolute inset-x-6 bottom-8 flex items-center gap-4 text-[13px] font-semibold text-slate-500 sm:inset-x-10 lg:inset-x-[6vw]">
          <span className="w-16 tabular-nums">step {String(step).padStart(2, "0")}</span>
          <div className="relative h-0.5 flex-1 bg-slate-800">
            <i className="absolute inset-0 origin-left bg-ember" style={{ transform: `scaleX(${step / STEPS})` }} />
          </div>
          <span>step {STEPS}</span>
        </div>
      </div>
    </section>
  );
}

/** Reduced motion: no scroll-scrubbing, just the converged result and the story in one frame. */
function StillFrame() {
  const { w, b, loss } = frames[STEPS];
  return (
    <section className="bg-slate-950 px-6 py-20 text-[#eeece6] sm:px-10 lg:px-[6vw]" aria-label="Training run, final frame">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-[clamp(3.5rem,8vw,8rem)] text-[#eeece6]">Watch a model learn.</h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-slate-300">
            This line started out wrong and walked downhill for {STEPS} steps of gradient descent until the loss settled at {loss.toFixed(3)}. In MLingo you can pause, rewind and break any frame.
          </p>
        </div>
        <svg viewBox="0 0 400 460" className="mx-auto w-full max-w-sm" aria-hidden="true">
          {xs.map((x, i) => (
            <circle key={i} cx={sx(x)} cy={sy(ys[i])} r="4" fill="#eeece6" />
          ))}
          <line x1={sx(-1)} x2={sx(1)} y1={sy(-w + b)} y2={sy(w + b)} className="stroke-teal-300" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
