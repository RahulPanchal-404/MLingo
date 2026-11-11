"use client";

import { useMemo, useRef, useState } from "react";

import { useTicker } from "../framework/hooks";
import { ControlDeck, Floaters, GameScreen, Stat, TopBar, type Floater } from "../framework/kit";
import { pct } from "../framework/math";
import type { RoundProps } from "../framework/types";
import { CFGS, SPAWN_MS, TRAVEL_MS, costOf, fixedRange, judge, makeItems, runScore, type Outcome } from "./logic";

const W = 560;
const H = 300;
const GATE_X = 430;
const LANES = [150, 195, 240];
const SPRITE: Record<string, [string, string]> = {
  sigmoid: ["👹", "🧑‍🌾"],
  balanced: ["👹", "🧑‍🌾"],
  screening: ["🤢", "🧳"],
  fraud: ["🕵️", "🧑‍💼"],
};
const OUT_TEXT: Record<Outcome, [string, string]> = {
  TP: ["Blocked! +🛡️", "#34d399"],
  TN: ["Welcome in", "#94a3b8"],
  FP: ["Wrongly refused 💰", "#fbbf24"],
  FN: ["Got in! 💥", "#f87171"],
};

export function ThresholdRound({ level, onDone }: RoundProps) {
  const cfg = CFGS[level.id];
  const items = useMemo(() => makeItems(cfg), [cfg]);
  const range = useMemo(() => fixedRange(items, cfg), [items, cfg]);
  const [bad, good] = SPRITE[level.id];
  const [t, setT] = useState(0.5);
  const [time, setTime] = useState(-1200);
  const [done, setDone] = useState<Outcome[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [hit, setHit] = useState(0);
  const finished = useRef(false);
  const [over, setOver] = useState(false);

  useTicker(!over, (dt) => {
    const now = time + dt;
    setTime(now);
    let next = done;
    const fl: Floater[] = [];
    for (let i = done.length; i < items.length; i++) {
      if (now - i * SPAWN_MS < TRAVEL_MS) break;
      const o = judge(items[i], t);
      next = [...next, o];
      fl.push({ id: Math.random(), x: GATE_X - 10, y: LANES[i % 3] - 40, text: OUT_TEXT[o][0], color: OUT_TEXT[o][1] });
      if (o === "FN") setHit((h) => h + 1);
    }
    if (next !== done) {
      setDone(next);
      setFloaters((f) => [...f.slice(-5), ...fl]);
    }
    if (next.length === items.length && !finished.current) {
      finished.current = true;
      setOver(true);
      const cost = next.reduce((s, o) => s + costOf(o, cfg), 0);
      const score = runScore(cost, range.best, range.worst);
      const c = (o: Outcome) => next.filter((x) => x === o).length;
      const accuracy = (c("TP") + c("TN")) / next.length;
      onDone({
        score,
        headline: score >= 850 ? "The kingdom is safe and the gold is intact." : score >= 500 ? "You held, but it cost you." : "The gate was set wrong.",
        detail: explain(level.id, cfg.positive, accuracy, range.bestT),
        stats: [
          { label: "Damage taken", value: String(cost) },
          { label: "Best possible", value: `${range.best} (gate at ${pct(range.bestT)})` },
          { label: `${cap(cfg.positive)}s stopped`, value: `${c("TP")} / ${c("TP") + c("FN")}` },
          { label: "Innocents refused", value: String(c("FP")) },
          { label: "Accuracy", value: pct(accuracy) },
        ],
      });
    }
  });

  const c = (o: Outcome) => done.filter((x) => x === o).length;
  const damage = c("FN") * cfg.costFN;
  const gold = c("FP") * cfg.costFP;
  const accuracy = done.length ? (c("TP") + c("TN")) / done.length : 1;

  return (
    <GameScreen>
      <TopBar
        left={
          <>
            <Stat icon="🏰" value={`-${damage}`} tone={damage ? "bad" : undefined} />
            <Stat icon="💰" value={`-${gold}`} tone={gold ? "bad" : undefined} />
            <Stat icon="🛡️" value={c("TP")} tone="good" />
          </>
        }
        right={
          <>
            <span className="text-xs text-white/60">Accuracy {pct(accuracy)}</span>
            <span className="text-xs text-white/60">Wave {done.length}/{items.length}</span>
          </>
        }
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="img" aria-label="Visitors walking to the castle gate">
        <defs>
          <linearGradient id="gk-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#312e81" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#gk-sky)" />
        <circle cx={70} cy={50} r={22} fill="#fef3c7" opacity={0.85} />
        <rect y={120} width={W} height={H - 120} fill="#14532d" />
        <rect y={130} width={GATE_X + 20} height={140} fill="#78350f" opacity={0.45} />
        {/* castle */}
        <g key={hit} className={hit ? "g-shake" : ""}>
          <rect x={GATE_X + 20} y={60} width={W - GATE_X - 20} height={H - 60} fill="#475569" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={GATE_X + 24 + i * 28} y={46} width={18} height={18} fill="#475569" />)}
          <rect x={GATE_X + 50} y={90} width={14} height={20} rx={7} fill="#fde68a" opacity={0.9} />
          <path d={`M${GATE_X + 20},${H - 20} L${GATE_X + 20},150 Q${GATE_X + 60},120 ${GATE_X + 100},150 L${GATE_X + 100},${H - 20} Z`} fill="#1e293b" />
          <text x={GATE_X + 60} y={H - 30} textAnchor="middle" className="text-[11px] font-black" fill="#fca5a5">
            {damage ? `🏰 -${damage}` : ""}
          </text>
        </g>
        <rect x={GATE_X + 6} y={128} width={10} height={150} fill="#a16207" />
        <text x={GATE_X + 11} y={122} textAnchor="middle" className="fill-amber-200 text-[10px] font-black">GATE</text>
        {items.map((it, i) => {
          const age = time - i * SPAWN_MS;
          if (age < 0 || age > TRAVEL_MS + 1000) return null;
          const o = done[i];
          const lane = LANES[i % 3];
          const walk = Math.min(1, age / TRAVEL_MS);
          const blocked = o === "TP" || o === "FP";
          const after = Math.max(0, age - TRAVEL_MS) / 1000;
          const x = !o ? 10 + walk * (GATE_X - 30) : blocked ? GATE_X - 20 - after * 140 : GATE_X - 20 + after * 120;
          const fade = o ? Math.max(0, 1 - after) : 1;
          const p = it.p;
          const col = p > 0.66 ? "#ef4444" : p > 0.33 ? "#f59e0b" : "#22c55e";
          return (
            <g key={i} opacity={fade}>
              {!o ? (
                <g className="g-bob" style={{ animationDelay: `${(i % 4) * 120}ms` }}>
                  <path d={`M${x - 11},${lane} L${x},${lane - 30} L${x + 11},${lane} Z`} fill="#6d28d9" />
                  <circle cx={x} cy={lane - 26} r={7} fill="#4c1d95" />
                  <circle cx={x - 2.5} cy={lane - 26} r={1.3} fill="#fde047" />
                  <circle cx={x + 2.5} cy={lane - 26} r={1.3} fill="#fde047" />
                </g>
              ) : (
                <text x={x} y={lane} textAnchor="middle" className="g-pop text-[24px]">{it.y ? bad : good}</text>
              )}
              <rect x={x - 16} y={lane - 46} width={32} height={6} rx={3} fill="#0f172a" />
              <rect x={x - 16} y={lane - 46} width={32 * p} height={6} rx={3} fill={col} />
              <text x={x} y={lane - 50} textAnchor="middle" className="fill-white text-[9px] font-bold">{Math.round(p * 100)}%</text>
            </g>
          );
        })}
        <Floaters items={floaters} />
        <text x={10} y={18} className="fill-white/70 text-[11px]">
          Everyone is cloaked. The bar is the oracle&apos;s suspicion. Refuse anyone at or above your gate level.
        </text>
      </svg>
      <ControlDeck>
        <label className="flex flex-1 items-center gap-3 text-xs text-white/70">
          <span className="whitespace-nowrap font-bold text-white">Refuse if suspicion ≥</span>
          <input type="range" min={2} max={98} value={Math.round(t * 100)} onChange={(e) => setT(Number(e.target.value) / 100)} className="flex-1 accent-rose-400" aria-label="Gate threshold" />
          <span className="w-12 font-mono text-lg font-black text-white">{Math.round(t * 100)}%</span>
        </label>
        <span className="text-xs text-white/60">
          {cap(cfg.positive)} gets in: <b className="text-rose-300">-{cfg.costFN} 🏰</b> · innocent refused: <b className="text-amber-300">-{cfg.costFP} 💰</b>
        </span>
      </ControlDeck>
    </GameScreen>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function explain(id: string, positive: string, accuracy: number, bestT: number): string {
  const t = pct(bestT);
  if (id === "sigmoid")
    return `The oracle is a classifier: it gives each visitor a probability. Your gate level is the threshold that turns that probability into a decision. With a sharp oracle and equal costs, a gate near the middle works (the best fixed gate was ${t}).`;
  if (id === "balanced")
    return `When the oracle is unsure, monsters and villagers overlap in suspicion, so every gate level makes mistakes. Raising it lets more monsters in; lowering it refuses more villagers. With equal costs the best gate balances the two (${t} here).`;
  if (id === "screening")
    return `A ${positive} getting in cost 25 times more than refusing a healthy traveller, so the best gate dropped to ${t}: refuse lots of innocents to stop the carriers. Accuracy went down but the damage went down too. Choose the threshold from the costs.`;
  return `Only 1 merchant in 20 was a ${positive}, so letting everyone in is already 95% accurate and still lets every spy through. Your accuracy was ${pct(accuracy)}, which says almost nothing. With rare cases, count how many you caught and what the mistakes cost.`;
}
