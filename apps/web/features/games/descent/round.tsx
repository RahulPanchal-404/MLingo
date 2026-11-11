"use client";

import { useEffect, useMemo, useState } from "react";

import { useTicker } from "../framework/hooks";
import { Banner, ControlDeck, Floaters, GameButton, GameScreen, Hearts, Stat, TopBar, type Floater } from "../framework/kit";
import { fmt, logPosition, logValue } from "../framework/math";
import type { RoundProps } from "../framework/types";
import { COURSES, LIFE_PENALTY, LIVES, bestManualJumps, initSim, stepManual, stepSim, type Land, type Sim } from "./logic";

const W = 560;
const H = 320;

const LR_RANGE: Record<string, [number, number, number]> = {
  "step-size": [0.02, 8, 0.3],
  ravine: [0.005, 2, 0.5],
  trap: [0.01, 0.5, 0.1],
};

type Result = { score: number; jumps: number; won: boolean; livesLost: number };
type Popup = null | { kind: "won" | "dead" | "out"; title: string; sub: string };

export function DescentRound({ level, onDone }: RoundProps) {
  const id = level.id;
  const manual = id === "eyeball";
  const [waxed, setWaxed] = useState(false);
  const [ci, setCi] = useState(0);
  const courses = useMemo(() => COURSES[id](waxed), [id, waxed]);
  const course = courses[ci];
  const land = course.land;
  const [lrMin, lrMax, lr0] = LR_RANGE[id] ?? [0.1, 1, course.lr ?? 0.4];
  const [lr, setLr] = useState(lr0);
  const [momentum, setMomentum] = useState(false);
  const [sim, setSim] = useState<Sim>(() => initSim(land));
  const [clock, setClock] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [results, setResults] = useState<Result[]>([]);
  const [popup, setPopup] = useState<Popup>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [shake, setShake] = useState(0);
  const manualBest = manual ? bestManualJumps(land, course.lr!) : 0;

  const animMs = manual ? 380 : land.stepMs;
  const t = Math.min(1, clock / animMs);

  function float(text: string, color: string, p: number[]) {
    const f = { id: Math.random(), text, color, ...toScreen(land, p) };
    setFloaters((fs) => [...fs.slice(-6), { ...f, y: f.y - 24 }]);
  }

  function resolve(next: Sim) {
    if (next.status === "running" || next.status === "ready") return;
    if (next.status === "won") {
      const pts = manual ? Math.max(300, 1000 - 80 * (next.jumps - manualBest)) : land.points(next.jumps);
      const score = Math.max(0, pts - LIFE_PENALTY * (LIVES - lives));
      float(`+${score}`, "#fde047", next.pos);
      setPopup({ kind: "won", title: "🚩 Flag reached!", sub: `${next.jumps} jumps, ${LIVES - lives} ${LIVES - lives === 1 ? "life" : "lives"} lost: +${score}` });
      return;
    }
    const why =
      next.status === "lava"
        ? "You jumped so far you flew off the mountain. Each overshoot was bigger than the last: the learning rate is too big."
        : next.status === "stuck"
          ? "You stopped in a dip. The slope there is flat, so plain gradient descent stops moving."
          : "Out of fuel before the flag. Your jumps were too small, or wasted going uphill.";
    setShake((s) => s + 1);
    const left = lives - 1;
    setLives(left);
    setPopup(
      left > 0
        ? { kind: "dead", title: next.status === "lava" ? "🔥 Into the lava!" : next.status === "stuck" ? "🕳️ Stuck in a dip" : "⛽ Out of fuel", sub: why }
        : { kind: "out", title: "💀 Out of lives", sub: why },
    );
  }

  useTicker(!popup && (sim.status === "running" || clock < animMs), (dt) => {
    const c = clock + dt;
    if (c < animMs) return setClock(c);
    if (sim.status !== "running" || manual) return setClock(animMs);
    setClock(0);
    const next = stepSim(land, sim, { lr, momentum });
    setSim(next);
    resolve(next);
  });

  function jump(dir: -1 | 1) {
    if (popup || clock < animMs || sim.status === "won") return;
    const next = stepManual(land, { ...sim, status: "running" }, dir, course.lr!);
    setClock(0);
    setSim(next);
    resolve(next);
  }

  useEffect(() => {
    if (!manual) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") jump(-1);
      if (e.key === "ArrowRight") jump(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function retry() {
    setSim(initSim(land));
    setClock(animMs);
    setPopup(null);
  }

  function nextCourse(won: boolean) {
    const pts = won ? (manual ? Math.max(300, 1000 - 80 * (sim.jumps - manualBest)) : land.points(sim.jumps)) : 0;
    const r: Result = { score: won ? Math.max(0, pts - LIFE_PENALTY * (LIVES - lives)) : 0, jumps: sim.jumps, won, livesLost: LIVES - lives };
    const all = [...results, r];
    if (all.length === courses.length) {
      const score = Math.round(all.reduce((s, x) => s + x.score, 0) / all.length);
      onDone({ score, ...summary(id, all) });
      return;
    }
    setResults(all);
    setCi(all.length);
    const nl = COURSES[id](waxed)[all.length].land;
    setSim(initSim(nl));
    setClock(animMs);
    setLives(LIVES);
    setPopup(null);
    setMomentum(false);
  }

  function toggleWax() {
    const w = !waxed;
    setWaxed(w);
    setSim(initSim(COURSES[id](w)[ci].land));
  }

  const g = land.grad(sim.pos);
  return (
    <GameScreen>
      <TopBar
        left={
          <>
            <span className="text-white/70">⛷️ {course.name} <span className="text-white/40">· {ci + 1}/{courses.length}</span></span>
            <Hearts lives={lives} max={LIVES} />
          </>
        }
        right={<Stat icon="⛽" value={`${land.fuel - sim.jumps}`} tone={land.fuel - sim.jumps < 5 ? "bad" : undefined} />}
      />
      <div key={shake} className={shake ? "g-shake" : ""}>
        {land.dim === 1 ? <Slope land={land} sim={sim} t={t} fog={manual} floaters={floaters} /> : <Canyon land={land} sim={sim} t={t} floaters={floaters} waxed={waxed} />}
      </div>
      {popup ? (
        <Banner title={popup.title} sub={popup.sub}>
          {popup.kind === "dead" ? <GameButton onClick={retry}>Try again ↻</GameButton> : null}
          {popup.kind === "won" ? <GameButton onClick={() => nextCourse(true)}>{ci + 1 === courses.length ? "Finish" : "Next run →"}</GameButton> : null}
          {popup.kind === "out" ? <GameButton tone="ghost" onClick={() => nextCourse(false)}>{ci + 1 === courses.length ? "Finish" : "Skip to next run"}</GameButton> : null}
        </Banner>
      ) : null}
      <ControlDeck>
        {manual ? (
          <>
            <GameButton tone="ghost" onClick={() => jump(-1)}>◀ Jump left</GameButton>
            <span className="mx-auto flex items-center gap-2 text-xs text-white/70">
              Slope under you: <b className="font-mono text-base text-white">{g[0] > 0 ? "↗ uphill to the right" : "↖ uphill to the left"}</b>
              <span className="font-mono text-white/50">(steepness {fmt(Math.abs(g[0]), 2)})</span>
            </span>
            <GameButton tone="ghost" onClick={() => jump(1)}>Jump right ▶</GameButton>
          </>
        ) : (
          <>
            <label className="flex min-w-[220px] flex-1 items-center gap-3 text-xs text-white/70">
              <span className="whitespace-nowrap font-bold text-white">Jump power</span>
              <input
                type="range"
                min={0}
                max={1000}
                value={logPosition(lr, lrMin, lrMax)}
                onChange={(e) => setLr(Number(logValue(Number(e.target.value), lrMin, lrMax).toPrecision(3)))}
                className="flex-1 accent-teal-400"
                aria-label="Learning rate (jump power)"
              />
              <span className="w-14 font-mono text-sm font-black text-white">{fmt(lr, 3)}</span>
            </label>
            {id === "ravine" ? <GameButton tone="ghost" active={waxed} onClick={toggleWax} disabled={sim.status !== "ready"}>{waxed ? "✓ Skis waxed (standardized)" : "🧴 Wax skis (standardize)"}</GameButton> : null}
            {id === "trap" ? <GameButton tone="ghost" active={momentum} onClick={() => setMomentum(!momentum)}>{momentum ? "✓ Momentum boots ON" : "👢 Momentum boots"}</GameButton> : null}
            <GameButton onClick={() => setSim({ ...sim, status: "running" })} disabled={sim.status !== "ready"}>Go ▶</GameButton>
          </>
        )}
      </ControlDeck>
    </GameScreen>
  );
}

function toScreen(land: Land, p: number[]) {
  const [x0, x1] = land.xRange;
  if (land.dim === 2) {
    const [y0, y1] = land.yRange;
    return { x: 20 + ((p[0] - x0) / (x1 - x0)) * (W - 40), y: 20 + (1 - (p[1] - y0) / (y1 - y0)) * (H - 40) };
  }
  const top = visibleTop(land);
  const bottom = Math.min(...Array.from({ length: 81 }, (_, i) => land.loss([x0 + ((x1 - x0) * i) / 80])));
  return { x: 30 + ((p[0] - x0) / (x1 - x0)) * (W - 60), y: 40 + (1 - (land.loss(p) - bottom) / (top - bottom)) * (H - 80) };
}

const topCache = new WeakMap<Land, number>();
function visibleTop(land: Land) {
  if (!topCache.has(land)) {
    const [x0, x1] = land.xRange;
    topCache.set(land, Math.max(...Array.from({ length: 81 }, (_, i) => land.loss([x0 + ((x1 - x0) * i) / 80]))));
  }
  return topCache.get(land)!;
}

function Slope({ land, sim, t, fog, floaters }: { land: Land; sim: Sim; t: number; fog: boolean; floaters: Floater[] }) {
  const [x0, x1] = land.xRange;
  const pts = Array.from({ length: 141 }, (_, i) => toScreen(land, [x0 + ((x1 - x0) * i) / 140]));
  const ground = `M${pts[0].x},${H} ` + pts.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length - 1].x},${H} Z`;
  const a = toScreen(land, sim.prev);
  const b = toScreen(land, sim.pos);
  const inside = (q: { x: number }) => Math.max(0, Math.min(W, q.x));
  const sx = inside(a) + (inside(b) - inside(a)) * t;
  const sy = Math.min(H - 10, a.y + (b.y - a.y) * t) - Math.sin(Math.PI * t) * Math.min(60, 12 + Math.abs(b.x - a.x) * 0.3);
  const flag = toScreen(land, land.center);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="The skier on the mountain">
      <defs>
        <linearGradient id="vr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="vr-lava" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <radialGradient id="vr-fog">
          <stop offset="0.55" stopColor="black" />
          <stop offset="1" stopColor="white" />
        </radialGradient>
        <mask id="vr-mask">
          <rect width={W} height={H} fill="white" />
          <circle cx={sx} cy={sy} r={95} fill="url(#vr-fog)" />
        </mask>
      </defs>
      <rect width={W} height={H} fill="url(#vr-sky)" />
      {[[60, 30], [200, 55], [380, 25], [500, 60], [130, 80]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={1.4} fill="white" opacity={0.6} />)}
      <rect x={0} y={H - 40} width={30} height={40} fill="url(#vr-lava)" className="g-pulse" />
      <rect x={W - 30} y={H - 40} width={30} height={40} fill="url(#vr-lava)" className="g-pulse" />
      <text x={15} y={H - 46} textAnchor="middle" className="text-[16px]">🔥</text>
      <text x={W - 15} y={H - 46} textAnchor="middle" className="text-[16px]">🔥</text>
      <path d={ground} fill="#e2e8f0" />
      <path d={pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ")} fill="none" stroke="#f8fafc" strokeWidth={3} />
      <text x={flag.x} y={flag.y - 4} textAnchor="middle" className="text-[22px]">🚩</text>
      {fog ? <rect width={W} height={H} fill="#0b1120" opacity={0.96} mask="url(#vr-mask)" /> : null}
      <text x={sx} y={sy} textAnchor="middle" dominantBaseline="text-after-edge" className="text-[30px]">⛷️</text>
      <Floaters items={floaters} />
    </svg>
  );
}

function Canyon({ land, sim, t, floaters, waxed }: { land: Land; sim: Sim; t: number; floaters: Floater[]; waxed: boolean }) {
  const c = land.curv!;
  const l0 = land.loss(land.start);
  const centre = toScreen(land, [0, 0]);
  const a = toScreen(land, sim.prev);
  const b = toScreen(land, sim.pos);
  const clampX = (v: number) => Math.max(6, Math.min(W - 6, v));
  const clampY = (v: number) => Math.max(6, Math.min(H - 6, v));
  const sx = clampX(a.x + (b.x - a.x) * t);
  const sy = clampY(a.y + (b.y - a.y) * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="Top-down view of the canyon">
      <defs>
        <linearGradient id="cv-lava" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f97316" />
          <stop offset="1" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cv-lava)" className="g-pulse" />
      <rect x={20} y={20} width={W - 40} height={H - 40} rx={14} fill={waxed ? "#e0f2fe" : "#e2e8f0"} />
      {[0.7, 0.4, 0.2, 0.08, 0.02].map((f) => {
        const l = l0 * f;
        const rx = Math.abs(toScreen(land, [Math.sqrt((2 * l) / c[0]), 0]).x - centre.x);
        const ry = Math.abs(toScreen(land, [0, Math.sqrt((2 * l) / c[1])]).y - centre.y);
        return <ellipse key={f} cx={centre.x} cy={centre.y} rx={rx} ry={ry} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 4" />;
      })}
      <polyline points={[...[sim.prev], sim.pos].map((p) => { const q = toScreen(land, p); return `${clampX(q.x)},${clampY(q.y)}`; }).join(" ")} fill="none" stroke="#0d9488" strokeWidth={2} opacity={0.5} />
      <text x={centre.x} y={centre.y + 8} textAnchor="middle" className="text-[22px]">🚩</text>
      <text x={sx} y={sy + 10} textAnchor="middle" className="text-[26px]">⛷️</text>
      <text x={W / 2} y={14} textAnchor="middle" className="fill-white text-[11px] font-bold">LAVA</text>
      <text x={W / 2} y={H - 5} textAnchor="middle" className="fill-white text-[11px] font-bold">LAVA</text>
      <Floaters items={floaters} />
    </svg>
  );
}

function summary(id: string, all: Result[]) {
  const wins = all.filter((r) => r.won).length;
  const text: Record<string, string> = {
    eyeball:
      "In the fog you can't see the bottom, only the slope under your feet. That is exactly what a model has: the gradient. Go the opposite way to the slope and you go downhill. Your jumps got shorter near the bottom because the slope flattens out there.",
    "step-size":
      "Jump power is the learning rate. Each mountain has a different steepness, so each needs a different power. Too weak and you run out of fuel; too strong and every jump overshoots further than the last, until you fly into the lava (divergence).",
    ravine:
      "When one weight lives on a much bigger scale, the bowl turns into a narrow canyon. A jump strong enough to make progress along it smashes you into the walls. Waxing the skis (standardizing the features) makes the bowl round, so one jump power works in every direction.",
    trap:
      "Plain gradient descent follows the slope, so it stops in the first dip it finds. Momentum boots keep part of your last jump's speed, which carries you over the bump to the real minimum.",
  };
  return {
    headline: wins === all.length ? "Every flag captured." : `${wins} of ${all.length} flags captured.`,
    detail: text[id],
    stats: [
      { label: "Flags", value: `${wins} / ${all.length}` },
      { label: "Jumps per run", value: all.map((r) => (r.won ? r.jumps : "✗")).join(" · ") },
      { label: "Lives lost", value: String(all.reduce((s, r) => s + r.livesLost, 0)) },
    ],
  };
}
