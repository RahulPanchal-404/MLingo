"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/features/players/auth-provider";
import { FlagIcon, LockIcon, Stars } from "@/features/players/icons";
import { ResultPanel } from "../result-panel";
import { useClearedLevels } from "../use-cleared-levels";
import {
  BOUNDS,
  CUP_RADIUS,
  HOLES,
  MAX_STROKES,
  STEPS_PER_SHOT,
  golfTerm,
  lrFromSlider,
  scoreFor,
  simulateShot,
  sliderFromLr,
  starsFor,
  type Hole,
  type Optimizer,
  type Shot,
  type Vec,
} from "./golf-engine";

const OPTIMIZER_INFO: Record<Optimizer, { label: string; blurb: string; unlock: number }> = {
  gd: { label: "Gradient descent", blurb: "Steps straight downhill.", unlock: 1 },
  momentum: { label: "Momentum", blurb: "Builds speed, rolls through bumps.", unlock: 2 },
  adam: { label: "Adam", blurb: "Rescales each direction.", unlock: 3 },
};

type Theme = { dark: boolean };

function useIsDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

/** Pre-render the loss surface as terrain bands. Low loss is fairway green, high loss is rough. */
function renderTerrain(hole: Hole, size: number, { dark }: Theme): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const res = 260;
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d")!;
  const values: number[] = [];
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const x = -BOUNDS + ((i + 0.5) / res) * 2 * BOUNDS;
      const y = BOUNDS - ((j + 0.5) / res) * 2 * BOUNDS;
      values.push(hole.loss(x, y));
    }
  }
  const sorted = [...values].sort((a, b) => a - b);
  const bands = 14;
  const cuts = Array.from({ length: bands }, (_, k) => sorted[Math.floor((k / bands) * (sorted.length - 1))]);
  const light = [
    [196, 236, 186], [178, 226, 166], [160, 215, 148], [143, 204, 132], [128, 192, 118], [116, 180, 108], [106, 168, 100],
    [98, 156, 94], [104, 148, 92], [118, 142, 90], [134, 138, 92], [150, 136, 98], [164, 138, 108], [176, 144, 118],
  ];
  const darkPal = [
    [30, 92, 72], [27, 84, 66], [25, 77, 61], [23, 70, 56], [22, 64, 52], [21, 58, 48], [20, 53, 45],
    [20, 48, 42], [22, 44, 40], [25, 41, 40], [28, 38, 40], [31, 36, 42], [34, 35, 45], [37, 35, 48],
  ];
  const palette = dark ? darkPal : light;
  const img = ctx.createImageData(res, res);
  values.forEach((v, idx) => {
    let band = 0;
    while (band < bands - 1 && v > cuts[band + 1]) band++;
    const [r, gr, b] = palette[band];
    img.data[idx * 4] = r;
    img.data[idx * 4 + 1] = gr;
    img.data[idx * 4 + 2] = b;
    img.data[idx * 4 + 3] = 255;
  });
  ctx.putImageData(img, 0, 0);
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const o = out.getContext("2d")!;
  o.imageSmoothingEnabled = true;
  o.drawImage(canvas, 0, 0, size, size);
  // contour lines on top for a topographic feel
  o.strokeStyle = dark ? "rgba(255,255,255,0.06)" : "rgba(20,60,30,0.10)";
  o.lineWidth = 1;
  for (let j = 1; j < res; j++) {
    for (let i = 1; i < res; i++) {
      const a = values[j * res + i];
      const left = values[j * res + i - 1];
      const up = values[(j - 1) * res + i];
      const bandOf = (v: number) => cuts.findLastIndex((c) => v >= c);
      if (bandOf(a) !== bandOf(left) || bandOf(a) !== bandOf(up)) {
        o.fillStyle = o.strokeStyle;
        o.fillRect((i / res) * size, (j / res) * size, size / res, size / res);
      }
    }
  }
  return out;
}

type ShotRecord = Shot & { lr: number; optimizer: Optimizer };

export function GolfGame() {
  const { status } = useAuth();
  const dark = useIsDark();
  const { cleared, markCleared, bestStars } = useClearedLevels("golf");
  const params = useSearchParams();
  const [holeIndex, setHoleIndex] = useState(() => Math.max(0, HOLES.findIndex((h) => h.id === params.get("hole"))));
  const hole = HOLES[holeIndex];
  const [ball, setBall] = useState<Vec>(hole.tee);
  const [shots, setShots] = useState<ShotRecord[]>([]);
  const [slider, setSlider] = useState(sliderFromLr(0.1));
  const [optimizer, setOptimizer] = useState<Optimizer>("gd");
  const [animating, setAnimating] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: "info" | "bad" | "good" } | null>(null);
  const [finished, setFinished] = useState<null | { sunk: boolean; strokes: number }>(null);
  const [shake, setShake] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const terrainRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const animRef = useRef<{ path: Vec[]; progress: number } | null>(null);
  const [size, setSize] = useState(520);

  const lr = lrFromSlider(slider);
  const strokes = shots.length;

  const unlocked = useCallback((i: number) => i === 0 || cleared.has(HOLES[i - 1].id), [cleared]);

  const resetHole = useCallback(
    (index: number) => {
      setHoleIndex(index);
      setBall(HOLES[index].tee);
      setShots([]);
      setFinished(null);
      setMessage(null);
      setOptimizer("gd");
      setSlider(sliderFromLr(0.1));
      animRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setSize(Math.max(280, Math.min(560, Math.floor(el.clientWidth), Math.floor(window.innerHeight - 260)))));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toCanvas = useCallback((p: Vec): [number, number] => [((p[0] + BOUNDS) / (2 * BOUNDS)) * size, ((BOUNDS - p[1]) / (2 * BOUNDS)) * size], [size]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const key = `${hole.id}-${size}-${dark}`;
    if (terrainRef.current?.key !== key) terrainRef.current = { key, canvas: renderTerrain(hole, size, { dark }) };
    ctx.drawImage(terrainRef.current.canvas, 0, 0, size, size);

    // tee box
    const [tx, ty] = toCanvas(hole.tee);
    ctx.fillStyle = dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.7)";
    ctx.fillRect(tx - 9, ty - 9, 18, 18);

    // cup + flag
    const [cx, cy] = toCanvas(hole.cup);
    const cupR = (CUP_RADIUS / (2 * BOUNDS)) * size;
    ctx.fillStyle = dark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, cupR * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(5, cupR * 0.9), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = dark ? "#e2e8f0" : "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 34);
    ctx.stroke();
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 34);
    ctx.lineTo(cx + 18, cy - 28);
    ctx.lineTo(cx, cy - 22);
    ctx.fill();

    // previous shots
    shots.forEach((shot, idx) => {
      const isLast = idx === shots.length - 1 && !animRef.current;
      ctx.setLineDash(isLast ? [] : [4, 5]);
      ctx.strokeStyle = shot.outcome === "out" ? "rgba(244,63,94,0.7)" : dark ? "rgba(255,255,255,0.65)" : "rgba(15,23,42,0.55)";
      ctx.lineWidth = isLast ? 2.5 : 1.5;
      ctx.beginPath();
      shot.path.forEach((p, i) => {
        const [x, y] = toCanvas(p);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      shot.path.forEach((p, i) => {
        if (i === 0) return;
        const [x, y] = toCanvas(p);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // in-flight animation
    let ballPos = ball;
    const anim = animRef.current;
    if (anim) {
      const upto = Math.max(0, Math.min(anim.path.length - 1, anim.progress));
      const whole = Math.floor(upto);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= whole; i++) {
        const [x, y] = toCanvas(anim.path[i]);
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      const a = anim.path[whole];
      const b = anim.path[Math.min(anim.path.length - 1, whole + 1)];
      const f = upto - whole;
      ballPos = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      const [bx, by] = toCanvas(ballPos);
      ctx.lineTo(bx, by);
      ctx.stroke();
    } else if (!finished) {
      // aim guide: the first update this club would make (−α·∇L), capped for display
      const [gx, gy] = hole.grad(ball[0], ball[1]);
      // Adam's first step is sign(g)·0.1α after bias correction; GD and momentum start at α·g.
      let dx = optimizer === "adam" ? -Math.sign(gx) * lr * 0.1 : -gx * lr;
      let dy = optimizer === "adam" ? -Math.sign(gy) * lr * 0.1 : -gy * lr;
      const len = Math.hypot(dx, dy);
      const maxLen = BOUNDS * 1.4;
      if (len > maxLen) {
        dx *= maxLen / len;
        dy *= maxLen / len;
      }
      const [sx, sy] = toCanvas(ball);
      const [ex, ey] = toCanvas([ball[0] + dx, ball[1] + dy]);
      ctx.strokeStyle = len > maxLen ? "#f43f5e" : "#fbbf24";
      ctx.setLineDash([6, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
      const ang = Math.atan2(ey - sy, ex - sx);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 10 * Math.cos(ang - 0.4), ey - 10 * Math.sin(ang - 0.4));
      ctx.lineTo(ex - 10 * Math.cos(ang + 0.4), ey - 10 * Math.sin(ang + 0.4));
      ctx.fill();
    }

    if (!(finished?.sunk && !anim)) {
      const [bx, by] = toCanvas(ballPos);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(bx + 2, by + 3, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, [ball, dark, finished, hole, lr, optimizer, shots, size, toCanvas]);

  useEffect(() => {
    draw();
  }, [draw]);

  const swing = () => {
    if (animating || finished) return;
    const shot = simulateShot(hole, ball, lr, optimizer);
    const record: ShotRecord = { ...shot, lr, optimizer };
    setAnimating(true);
    setMessage(null);
    animRef.current = { path: shot.path, progress: 0 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reduce ? 1000 : 0.22;
    let last = performance.now();
    const tick = (now: number) => {
      const anim = animRef.current;
      if (!anim) return;
      // rAF timestamps can be slightly earlier than performance.now(), so never step backwards.
      anim.progress += (Math.max(0, now - last) / 16) * speed;
      last = Math.max(last, now);
      draw();
      if (anim.progress < anim.path.length - 1) {
        requestAnimationFrame(tick);
        return;
      }
      animRef.current = null;
      setAnimating(false);
      const nextStrokes = strokes + 1;
      setShots((s) => [...s, record]);
      if (shot.outcome === "sunk") {
        setBall(hole.cup);
        setFinished({ sunk: true, strokes: nextStrokes });
        markCleared(hole.id, starsFor(nextStrokes, hole.par, true));
      } else if (shot.outcome === "out") {
        setShake(true);
        window.setTimeout(() => setShake(false), 500);
        setMessage({ text: "Out of bounds. That learning rate launched the ball off the course. Stroke counted, ball back where it was.", tone: "bad" });
        if (nextStrokes >= MAX_STROKES) setFinished({ sunk: false, strokes: nextStrokes });
      } else {
        setBall(shot.end);
        const moved = Math.hypot(shot.end[0] - shot.path[0][0], shot.end[1] - shot.path[0][1]);
        const hint =
          moved < 0.15
            ? "Barely moved. The gradient here is tiny, so this α is far too timid."
            : shot.distance < 1
              ? "So close. Something gentler should roll it in."
              : `Stopped ${shot.distance.toFixed(2)} from the cup after ${STEPS_PER_SHOT} steps.`;
        setMessage({ text: hint, tone: "info" });
        if (nextStrokes >= MAX_STROKES) setFinished({ sunk: false, strokes: nextStrokes });
      }
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type !== "range") return;
      if (e.code === "Space" || e.key === "Enter") {
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        swing();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const result = useMemo(() => {
    if (!finished) return null;
    const stars = starsFor(finished.strokes, hole.par, finished.sunk);
    const lastShot = shots[shots.length - 1];
    return {
      game: "golf" as const,
      level_id: hole.id,
      stars,
      score: scoreFor(finished.strokes, hole.par, finished.sunk),
      meta: { strokes: finished.strokes, par: hole.par, optimizer: lastShot?.optimizer, lr: lastShot ? Number(lastShot.lr.toFixed(4)) : null },
    };
  }, [finished, hole, shots]);

  const optimizerUnlocked = (o: Optimizer) => hole.optimizers.includes(o);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/games" className="text-xs font-mono text-slate-500 hover:text-teal-700 dark:hover:text-teal-300">← Games</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gradient Golf</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Your club is the learning rate. Each swing runs {STEPS_PER_SHOT} real optimizer steps from where the ball rests. Sink it at the minimum.
          </p>
        </div>
        {status === "guest" ? (
          <Link href="/login?next=/games/golf" className="rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
            Guest mode · sign in to save scores
          </Link>
        ) : null}
      </header>

      <nav aria-label="Holes" className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {HOLES.map((h, i) => {
          const open = unlocked(i);
          const active = i === holeIndex;
          return (
            <button
              key={h.id}
              type="button"
              disabled={!open || animating}
              onClick={() => resetHole(i)}
              className={`relative rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 ring-2 ring-teal-500/20"
                  : open
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700"
                    : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-60 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                Hole {h.number}
                {open ? <span>Par {h.par}</span> : <LockIcon size={12} />}
              </span>
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{h.name}</span>
              <Stars count={bestStars(h.id)} size={12} className="mt-1" />
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div ref={wrapRef} className={`relative ${shake ? "game-shake" : ""}`}>
          <div className="relative mx-auto overflow-hidden rounded-2xl border-4 border-sky-300/70 dark:border-sky-900 shadow-lg" style={{ width: size, height: size }}>
            <canvas ref={canvasRef} style={{ width: size, height: size }} className="block" aria-label={`Loss surface for ${hole.name}`} role="img" />
            <div className="absolute left-3 top-3 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs font-mono text-white backdrop-blur">
              Hole {hole.number} · Par {hole.par} · {finished ? `${strokes} ${strokes === 1 ? "stroke" : "strokes"}` : `Stroke ${Math.min(strokes + 1, MAX_STROKES)}`}
            </div>
            <div className="absolute right-3 top-3 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs font-mono text-white backdrop-blur">
              L(ball) = {hole.loss(ball[0], ball[1]).toFixed(3)}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-slate-500">Dashed arrow: the first update this swing will make, −α·∇L. Red means it leaves the course.</p>
        </div>

        <aside className="space-y-4">
          {finished && result ? (
            <ResultPanel
              key={`${hole.id}-${shots.length}`}
              result={result}
              title={finished.sunk ? golfTerm(finished.strokes, hole.par) : "Picked up"}
              subtitle={finished.sunk ? `${finished.strokes} ${finished.strokes === 1 ? "stroke" : "strokes"} on a par ${hole.par}.` : `Out of strokes after ${MAX_STROKES} swings.`}
              lesson={hole.lesson}
              onRetry={() => resetHole(holeIndex)}
              next={finished.sunk && holeIndex < HOLES.length - 1 ? { label: `Hole ${holeIndex + 2} →`, onClick: () => resetHole(holeIndex + 1) } : null}
            />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <p className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <FlagIcon size={14} /> Hole {hole.number}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{hole.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{hole.tagline}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="power" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Club power (learning rate)</label>
                    <span className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">α = {lr < 0.01 ? lr.toFixed(4) : lr < 1 ? lr.toFixed(3) : lr.toFixed(2)}</span>
                  </div>
                  <input
                    id="power"
                    type="range"
                    min={0}
                    max={1}
                    step={0.0025}
                    value={slider}
                    disabled={animating}
                    onChange={(e) => setSlider(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>putt 0.001</span>
                    <span>0.1</span>
                    <span>1</span>
                    <span>drive 30</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Club type (optimizer)</p>
                  <div className="grid gap-2">
                    {(Object.keys(OPTIMIZER_INFO) as Optimizer[]).map((o) => {
                      const open = optimizerUnlocked(o);
                      const active = optimizer === o;
                      return (
                        <button
                          key={o}
                          type="button"
                          disabled={!open || animating}
                          onClick={() => setOptimizer(o)}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
                            active
                              ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
                              : open
                                ? "border-slate-200 dark:border-slate-700 hover:border-teal-300"
                                : "border-dashed border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-semibold text-slate-900 dark:text-white">{OPTIMIZER_INFO[o].label}</span>
                            <span className="block text-xs text-slate-500">{open ? OPTIMIZER_INFO[o].blurb : `Unlocks on hole ${o === "momentum" ? 2 : 3}`}</span>
                          </span>
                          {!open ? <LockIcon size={14} className="text-slate-400" /> : active ? <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={swing}
                  disabled={animating}
                  className="w-full rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-700 py-3.5 text-base font-extrabold tracking-wide text-white shadow-lg shadow-emerald-700/25 hover:from-emerald-400 hover:to-emerald-600 active:scale-[0.99] transition disabled:opacity-60"
                >
                  {animating ? "Rolling…" : "Swing"} <span className="ml-1 text-xs font-mono opacity-70">space</span>
                </button>

                {message ? (
                  <p className={`game-rise rounded-xl px-3 py-2.5 text-sm ${message.tone === "bad" ? "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200" : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200"}`}>
                    {message.text}
                  </p>
                ) : null}
              </div>
            </>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">Scorecard</p>
            {shots.length === 0 ? (
              <p className="text-sm text-slate-500">No swings yet. Watch the arrow as you drag the power slider.</p>
            ) : (
              <ol className="space-y-1.5 text-sm font-mono">
                {shots.map((s, i) => (
                  <li key={i} className="flex justify-between gap-2 text-slate-600 dark:text-slate-300">
                    <span>#{i + 1} {s.optimizer === "gd" ? "GD" : s.optimizer === "momentum" ? "Mom" : "Adam"} α={s.lr < 1 ? s.lr.toFixed(3) : s.lr.toFixed(1)}</span>
                    <span className={s.outcome === "sunk" ? "text-emerald-600 dark:text-emerald-400 font-bold" : s.outcome === "out" ? "text-rose-600 dark:text-rose-400" : ""}>
                      {s.outcome === "sunk" ? "in the cup" : s.outcome === "out" ? "out" : `${s.distance.toFixed(2)} away`}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
