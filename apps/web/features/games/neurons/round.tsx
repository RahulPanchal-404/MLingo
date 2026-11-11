"use client";

import { useMemo, useRef, useState } from "react";

import { useTicker } from "../framework/hooks";
import { Banner, ControlDeck, GameButton, GameScreen, Meter, Stat, TopBar } from "../framework/kit";
import { fmt, logPosition, logValue, pct } from "../framework/math";
import type { RoundProps } from "../framework/types";
import { EPOCHS_PER_SECOND, GRID, SETUPS, TIME_LIMIT, makeTrainer, winScore, type Activation, type NetConfig, type Trainer } from "./logic";

const W = 420;
const H = 320;
const ACTS: { id: Activation; label: string; icon: string }[] = [
  { id: "linear", label: "Linear", icon: "M2,18 L28,2" },
  { id: "sigmoid", label: "Sigmoid", icon: "M2,18 C12,18 16,2 28,2" },
  { id: "tanh", label: "Tanh", icon: "M2,18 C10,18 18,2 28,2" },
  { id: "relu", label: "ReLU", icon: "M2,16 L15,16 L28,2" },
];

type Snap = { acc: number; loss: number; dead: number; grid: number[]; pred: number[] };

export function NeuronsRound({ level, onDone }: RoundProps) {
  const setup = SETUPS[level.id];
  const [cfg, setCfg] = useState<NetConfig>(setup.start);
  const [changes, setChanges] = useState(0);
  const [time, setTime] = useState(0);
  const [hp, setHp] = useState(100);
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<null | { won: boolean; score: number }>(null);
  const trainer = useRef<Trainer | null>(null);
  const built = useRef(-1);
  const [snap, setSnap] = useState<Snap>({ acc: 0, loss: Math.log(2), dead: 0, grid: [], pred: [] });

  const [x0, x1] = setup.x;
  const [y0, y1] = setup.y;
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const cells = useMemo(
    () => Array.from({ length: GRID * GRID }, (_, i) => [x0 + (((i % GRID) + 0.5) / GRID) * (x1 - x0), y0 + ((Math.floor(i / GRID) + 0.5) / GRID) * (y1 - y0)] as const),
    [x0, x1, y0, y1],
  );
  const invaders = setup.data.filter((d) => d.label === 1).length;

  function rebuild(next: Partial<NetConfig>) {
    if (result) return;
    setCfg((c) => ({ ...c, ...next }));
    setChanges((n) => n + 1);
    setVersion((v) => v + 1);
  }

  useTicker(!result, (dt) => {
    if (built.current !== version || !trainer.current) {
      trainer.current = makeTrainer(setup.data, cfg);
      built.current = version;
    }
    const tr = trainer.current;
    tr.step(Math.max(1, Math.round((EPOCHS_PER_SECOND * dt) / 1000)));
    const t = time + dt / 1000;
    const pred = setup.data.map((d) => tr.predict(d.x, d.y));
    const free = setup.data.filter((d, i) => d.label === 1 && pred[i] < 0.5).length;
    const nextHp = Math.max(0, hp - (dt / 1000) * (100 / TIME_LIMIT) * 1.7 * (free / invaders));
    const acc = tr.accuracy();
    setTime(t);
    setHp(nextHp);
    setSnap({ acc, loss: tr.loss(), dead: tr.dead(), grid: cells.map(([x, y]) => tr.predict(x, y)), pred });
    if (acc >= setup.target && tr.epoch() > 20) {
      const score = winScore(t, changes);
      setResult({ won: true, score });
      onDoneLater(() => onDone(finish(level.id, score, t, acc, changes, nextHp)));
    } else if (nextHp <= 0 || t >= TIME_LIMIT) {
      setResult({ won: false, score: 0 });
      onDoneLater(() => onDone(finish(level.id, 0, t, acc, changes, nextHp)));
    }
  });

  const cw = W / GRID;
  const ch = H / GRID;
  const freeIdx = setup.data.map((d, i) => (d.label === 1 && (snap.pred[i] ?? 0) < 0.5 ? i : -1)).filter((i) => i >= 0);
  const flicker = Math.floor(time * 6);

  return (
    <GameScreen>
      <TopBar
        left={
          <>
            <Meter value={hp / 100} color={hp > 40 ? "#22c55e" : "#ef4444"} label="🛰️ Base" />
            <Meter value={1 - time / TIME_LIMIT} color="#a78bfa" label="⏳" />
          </>
        }
        right={
          <>
            <Stat icon="🎯" value={`${pct(snap.acc)} / ${pct(setup.target)}`} tone={snap.acc >= setup.target ? "good" : undefined} />
            {cfg.activation === "relu" ? <Stat icon="💀" value={`${snap.dead} dead`} tone={snap.dead ? "bad" : undefined} /> : null}
          </>
        }
      />
      <div className="grid md:grid-cols-[1.25fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none bg-[#050816]" role="img" aria-label="Arena: your shield, invaders and allies">
          {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={(i * 97) % W} cy={(i * 61) % H} r={0.9} fill="white" opacity={0.5} />)}
          {snap.grid.map((p, i) =>
            p >= 0.5 ? <rect key={i} x={(i % GRID) * cw} y={H - (Math.floor(i / GRID) + 1) * ch} width={cw + 0.4} height={ch + 0.4} fill="#22d3ee" fillOpacity={0.1 + 0.45 * (p - 0.5) * 2} /> : null,
          )}
          {freeIdx.slice(0, 8).map((i, n) =>
            (flicker + n) % 3 === 0 ? <line key={i} x1={sx(setup.data[i].x)} y1={sy(setup.data[i].y)} x2={W / 2} y2={H + 10} stroke="#f87171" strokeWidth={1.5} opacity={0.7} /> : null,
          )}
          {setup.data.map((d, i) => {
            const shielded = (snap.pred[i] ?? 0) >= 0.5;
            const x = sx(d.x);
            const y = sy(d.y);
            if (d.label === 1)
              return <text key={i} x={x} y={y + 4} textAnchor="middle" className="text-[11px]" opacity={shielded ? 0.35 : 1}>{shielded ? "🔒" : "👾"}</text>;
            return <text key={i} x={x} y={y + 4} textAnchor="middle" className="text-[10px]">{shielded ? "⚡" : "🛸"}</text>;
          })}
          <rect x={6} y={6} width={250} height={18} rx={9} fill="black" opacity={0.5} />
          <text x={12} y={19} className="fill-white text-[10px] font-bold">Trap every 👾 in the shield. Keep 🛸 allies out.</text>
        </svg>
        <div className="space-y-3 bg-slate-900 p-3">
          <NetDiagram cfg={cfg} />
          <p className="text-[11px] leading-snug text-white/60">{setup.hint}</p>
          <p className="font-mono text-[11px] text-white/50">loss {Number.isFinite(snap.loss) ? fmt(snap.loss, 3) : "∞"} · rebuilds {changes}</p>
        </div>
      </div>
      {result ? (
        <Banner title={result.won ? "💥 Invaders trapped!" : hp <= 0 ? "☠️ Base destroyed" : "⌛ Out of time"} sub={result.won ? `Shield complete in ${time.toFixed(1)}s.` : "The shield never learned the pattern."} />
      ) : null}
      <ControlDeck>
        {setup.controls.includes("activation")
          ? ACTS.map((a) => (
              <GameButton key={a.id} tone="ghost" active={cfg.activation === a.id} onClick={() => rebuild({ activation: a.id })}>
                <span className="flex items-center gap-1.5">
                  <svg viewBox="0 0 30 20" className="h-4 w-6"><path d={a.icon} fill="none" stroke="currentColor" strokeWidth={2.5} /></svg>
                  {a.label}
                </span>
              </GameButton>
            ))
          : null}
        {setup.controls.includes("hidden") ? (
          <>
            <GameButton tone="ghost" onClick={() => rebuild({ hidden: Math.max(1, cfg.hidden - 1) })} disabled={cfg.hidden <= 1}>− Neuron</GameButton>
            <span className="font-mono text-sm font-black">{cfg.hidden} 🧠</span>
            <GameButton tone="ghost" onClick={() => rebuild({ hidden: Math.min(6, cfg.hidden + 1) })} disabled={cfg.hidden >= 6}>+ Neuron</GameButton>
          </>
        ) : null}
        {setup.controls.includes("standardize") ? (
          <GameButton tone="ghost" active={cfg.standardize} onClick={() => rebuild({ standardize: !cfg.standardize })}>{cfg.standardize ? "✓ Signal calibrated (standardized)" : "📡 Calibrate signal (standardize)"}</GameButton>
        ) : null}
        {setup.controls.includes("lr") ? (
          <label className="flex min-w-[220px] flex-1 items-center gap-2 text-xs text-white/70">
            <span className="whitespace-nowrap font-bold text-white">Learning rate</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={logPosition(cfg.lr, 0.001, 30)}
              onChange={(e) => setCfg((c) => ({ ...c, lr: Number(logValue(Number(e.target.value), 0.001, 30).toPrecision(3)) }))}
              onPointerUp={() => rebuild({})}
              onKeyUp={() => rebuild({})}
              className="flex-1 accent-cyan-400"
              aria-label="Learning rate"
            />
            <span className="w-12 font-mono text-sm font-black text-white">{fmt(cfg.lr, 3)}</span>
          </label>
        ) : null}
        <span className="text-[11px] text-white/50">Every rebuild retrains from zero.</span>
      </ControlDeck>
    </GameScreen>
  );
}

/** Lets the banner show for a moment before the result screen. */
function onDoneLater(fn: () => void) {
  window.setTimeout(fn, 1400);
}

function NetDiagram({ cfg }: { cfg: NetConfig }) {
  const hy = (i: number) => 20 + ((i + 0.5) * 120) / cfg.hidden;
  const act = ACTS.find((a) => a.id === cfg.activation)!;
  return (
    <svg viewBox="0 0 220 150" className="h-auto w-full" role="img" aria-label="Your network">
      {[50, 110].map((iy) => Array.from({ length: cfg.hidden }, (_, h) => <line key={`${iy}-${h}`} x1={30} y1={iy} x2={110} y2={hy(h)} stroke="#64748b" strokeWidth={1} />))}
      {Array.from({ length: cfg.hidden }, (_, h) => <line key={h} x1={110} y1={hy(h)} x2={190} y2={80} stroke="#64748b" strokeWidth={1} />)}
      {[50, 110].map((iy, n) => (
        <g key={iy}>
          <circle cx={30} cy={iy} r={12} fill="#1e293b" stroke="#94a3b8" />
          <text x={30} y={iy + 4} textAnchor="middle" className="fill-white text-[9px] font-bold">x{n + 1}</text>
        </g>
      ))}
      {Array.from({ length: cfg.hidden }, (_, h) => (
        <g key={h}>
          <circle cx={110} cy={hy(h)} r={13} fill="#0e7490" stroke="#22d3ee" strokeWidth={2} />
          <path d={act.icon} transform={`translate(${110 - 9},${hy(h) - 6}) scale(0.6)`} fill="none" stroke="white" strokeWidth={3} />
        </g>
      ))}
      <circle cx={190} cy={80} r={14} fill="#4c1d95" stroke="#a78bfa" strokeWidth={2} />
      <text x={190} y={84} textAnchor="middle" className="text-[11px]">🛡️</text>
      <text x={30} y={142} textAnchor="middle" className="fill-white/50 text-[8px]">inputs</text>
      <text x={110} y={142} textAnchor="middle" className="fill-white/50 text-[8px]">hidden ({cfg.activation})</text>
      <text x={190} y={142} textAnchor="middle" className="fill-white/50 text-[8px]">shield</text>
    </svg>
  );
}

function finish(levelId: string, score: number, seconds: number, acc: number, changes: number, hp: number) {
  const text: Record<string, string> = {
    xor: "Invaders sit in opposite corners, so no single straight wall can trap them. With a linear activation the whole network collapses into one straight line, however many neurons it has. A non-linear activation (tanh, sigmoid or ReLU) is what lets it bend the shield.",
    capacity: "Each hidden neuron adds roughly one straight edge to the shield. Enclosing a circle needs at least three edges, so one or two neurons underfit no matter how long they train.",
    saturate: "Signals in the thousands push sigmoid neurons into their flat ends, where the gradient is almost zero, so training barely moves. Calibrating (standardizing) the inputs keeps the neurons in their sensitive middle range and the shield forms fast.",
    lr: "Too high a learning rate overshoots and pushes ReLU neurons permanently below zero, where they output nothing and stop learning (dead neurons). Too low crawls. A moderate rate trains fast and keeps every neuron alive.",
  };
  return {
    score,
    headline: score > 0 ? `Shield up in ${seconds.toFixed(1)}s.` : "The shield never formed.",
    detail: text[levelId],
    stats: [
      { label: "Accuracy reached", value: pct(acc) },
      { label: "Time", value: `${seconds.toFixed(1)}s` },
      { label: "Base health left", value: `${Math.round(hp)}%` },
      { label: "Rebuilds", value: String(changes) },
    ],
  };
}
