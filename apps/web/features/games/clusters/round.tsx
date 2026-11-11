"use client";

import { useMemo, useRef, useState } from "react";

import { svgPoint, useTicker } from "../framework/hooks";
import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar } from "../framework/kit";
import { fmt, pct } from "../framework/math";
import type { RoundProps } from "../framework/types";
import {
  ELBOW_TASKS, START_TASKS, TOOL_TASKS, UNIT_TASKS, bestOf, dbscan, dogWage, elbowCurve, elbowScore, kmeansFrames, kmeansPlusPlus, purity, purityScore, standardize, startScore, totalCost, unitScore, xy,
  type Frame, type P,
} from "./logic";

const W = 560;
const H = 330;
const COLLARS = ["#f43f5e", "#3b82f6", "#f59e0b", "#a855f7", "#10b981", "#ec4899", "#06b6d4", "#84cc16"];
type XY = [number, number];
type Dom = { x: [number, number]; y: [number, number] };

function domainOf(pts: P[]): Dom {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const px = (Math.max(...xs) - Math.min(...xs)) * 0.08;
  const py = (Math.max(...ys) - Math.min(...ys)) * 0.1;
  return { x: [Math.min(...xs) - px, Math.max(...xs) + px], y: [Math.min(...ys) - py, Math.max(...ys) + py] };
}

/** The meadow: sheep at data points, dogs at centroids. Sheep lean toward their dog to show who herds whom. */
function Field({
  points, dom, assign, dogs, onPick, caption, links,
}: {
  points: P[]; dom: Dom; assign?: number[] | null; dogs?: XY[]; onPick?: (x: number, y: number) => void; caption?: string; links?: [number, number][];
}) {
  const svg = useRef<SVGSVGElement>(null);
  const sx = (x: number) => 20 + ((x - dom.x[0]) / (dom.x[1] - dom.x[0])) * (W - 40);
  const sy = (y: number) => H - 20 - ((y - dom.y[0]) / (dom.y[1] - dom.y[0])) * (H - 40);
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-auto w-full select-none ${onPick ? "cursor-crosshair" : ""}`}
      onPointerDown={(e) => {
        if (!onPick || !svg.current) return;
        const p = svgPoint(e, svg.current, W, H);
        onPick(dom.x[0] + ((p.x - 20) / (W - 40)) * (dom.x[1] - dom.x[0]), dom.y[0] + ((H - 20 - p.y) / (H - 40)) * (dom.y[1] - dom.y[0]));
      }}
      role="img"
      aria-label="Meadow with sheep and sheepdogs"
    >
      <defs>
        <radialGradient id="sd-grass" cx="0.5" cy="0.4" r="0.8">
          <stop offset="0" stopColor="#4d7c0f" />
          <stop offset="1" stopColor="#14532d" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sd-grass)" />
      {Array.from({ length: 40 }, (_, i) => <text key={i} x={(i * 137) % W} y={(i * 89) % H} className="text-[9px]" opacity={0.25}>🌱</text>)}
      {links?.map(([i, j], n) => <line key={n} x1={sx(points[i].x)} y1={sy(points[i].y)} x2={sx(points[j].x)} y2={sy(points[j].y)} stroke="white" strokeOpacity={0.35} />)}
      {points.map((p, i) => {
        const a = assign?.[i];
        const dog = a !== undefined && dogs?.[a];
        const lean = dog ? 0.12 : 0;
        const x = sx(p.x) + (dog ? (sx(dog[0]) - sx(p.x)) * lean : 0);
        const y = sy(p.y) + (dog ? (sy(dog[1]) - sy(p.y)) * lean : 0);
        return (
          <g key={i} style={{ transform: `translate(${x}px, ${y}px)`, transition: "transform 500ms ease" }}>
            {a !== undefined ? <circle r={7.5} fill={COLLARS[a % COLLARS.length]} opacity={0.75} /> : null}
            <text y={4.5} textAnchor="middle" className="text-[13px]">🐑</text>
          </g>
        );
      })}
      {dogs?.map(([x, y], k) => (
        <g key={k} style={{ transform: `translate(${sx(x)}px, ${sy(y)}px)`, transition: "transform 550ms ease" }}>
          <circle r={15} fill={COLLARS[k % COLLARS.length]} stroke="white" strokeWidth={2.5} />
          <text y={6} textAnchor="middle" className="text-[18px]">🐕</text>
        </g>
      ))}
      {caption ? (
        <g>
          <rect x={W / 2 - 170} y={6} width={340} height={20} rx={10} fill="black" opacity={0.45} />
          <text x={W / 2} y={20} textAnchor="middle" className="fill-white text-[11px] font-bold">{caption}</text>
        </g>
      ) : null}
    </svg>
  );
}

/** Plays k-means frames: dogs move to the middle of their flock, sheep re-pick their nearest dog. */
function useHerding(frames: Frame[] | null, onEnd: () => void) {
  const [at, setAt] = useState(0);
  const [clock, setClock] = useState(0);
  const [fired, setFired] = useState(false);
  useTicker(!!frames && !fired, (dt) => {
    if (!frames) return;
    if (clock + dt < 700) return setClock(clock + dt);
    setClock(0);
    if (at < frames.length - 1) setAt(at + 1);
    else {
      setFired(true);
      onEnd();
    }
  });
  return {
    frame: frames ? frames[Math.min(at, frames.length - 1)] : null,
    at,
    reset: () => {
      setAt(0);
      setClock(0);
      setFired(false);
    },
  };
}

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

// ---------- Level 1: how many dogs to hire ----------
function HireRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [k, setK] = useState(1);
  const [scores, setScores] = useState<number[]>([]);
  const [popup, setPopup] = useState<null | { score: number }>(null);
  const task = ELBOW_TASKS[i];
  const curveFrames = useMemo(() => elbowCurve(task.points), [task]);
  const curve = curveFrames.map((f) => f.inertia);
  const wage = dogWage(curve, task.trueK);
  const dom = domainOf(task.points);
  const walk = curve[k - 1];
  const cost = totalCost(curve, k, wage);
  const maxCost = Math.max(...curve.map((_, n) => totalCost(curve, n + 1, wage)));

  function lock() {
    setPopup({ score: elbowScore(k, task.trueK) });
  }
  function next() {
    const all = [...scores, popup!.score];
    if (all.length === ELBOW_TASKS.length) {
      onDone({
        score: avg(all),
        headline: all.every((s) => s === 1000) ? "Perfect hiring on every farm." : "Some farms had too many or too few dogs.",
        detail:
          "Walking distance is the inertia: the total squared distance from each sheep to its dog. It always drops when you hire another dog, so 'lowest walking' would mean one dog per sheep. The trick is where another dog stops saving much walking. That bend, the elbow, is the right K.",
        stats: [{ label: "Per farm", value: all.join(" · ") }],
      });
      return;
    }
    setScores(all);
    setI(all.length);
    setK(1);
    setPopup(null);
  }

  return (
    <GameScreen>
      <TopBar
        left={<><span className="text-white/70">🏡 Farm {i + 1}/{ELBOW_TASKS.length}</span><Stat icon="🐕" value={`× ${k}`} /></>}
        right={<><Stat icon="👣" value={fmt(walk, 0)} /><Stat icon="💰" value={`${fmt(wage * k, 0)} wages`} /></>}
      />
      <div className="grid sm:grid-cols-[1.7fr_1fr]">
        <Field points={task.points} dom={dom} assign={curveFrames[k - 1].assign} dogs={curveFrames[k - 1].centroids} caption="Each dog herds the sheep nearest to it" />
        <div className="space-y-2 bg-slate-900 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-white/60">Running cost per dog count</p>
          {curve.map((c, n) => {
            const total = totalCost(curve, n + 1, wage);
            return (
              <button key={n} type="button" onClick={() => setK(n + 1)} className={`flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left ${k === n + 1 ? "bg-white/15" : ""}`}>
                <span className="w-8 text-xs font-bold">{n + 1}🐕</span>
                <span className="relative h-3 flex-1 overflow-hidden rounded bg-white/10">
                  <span className="absolute inset-y-0 left-0 bg-sky-400" style={{ width: `${(c / maxCost) * 100}%` }} />
                  <span className="absolute inset-y-0 bg-amber-400" style={{ left: `${(c / maxCost) * 100}%`, width: `${((wage * (n + 1)) / maxCost) * 100}%` }} />
                </span>
                <span className="w-10 text-right font-mono text-[11px]">{fmt(total, 0)}</span>
              </button>
            );
          })}
          <p className="text-[11px] text-white/60"><span className="text-sky-300">■ walking</span> <span className="text-amber-300">■ wages</span>. More dogs = less walking, more wages.</p>
        </div>
      </div>
      {popup ? (
        <Banner title={popup.score === 1000 ? "🏆 Perfect hire!" : popup.score > 0 ? "🙂 Close" : "😬 Way off"} sub={`You hired ${k}. This farm really has ${task.trueK} flocks. +${popup.score}`}>
          <GameButton onClick={next}>{i + 1 === ELBOW_TASKS.length ? "Finish" : "Next farm →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <GameButton tone="ghost" onClick={() => setK(Math.max(1, k - 1))}>− Fire a dog</GameButton>
        <GameButton tone="ghost" onClick={() => setK(Math.min(8, k + 1))}>+ Hire a dog</GameButton>
        <span className="mx-auto text-xs text-white/70">Total cost: <b className="font-mono text-base text-white">{fmt(cost, 0)}</b></span>
        <GameButton onClick={lock}>Sign contracts ✍️</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

// ---------- Level 2: drop the dogs ----------
function DropRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<XY[]>([]);
  const [frames, setFrames] = useState<Frame[] | null>(null);
  const [runs, setRuns] = useState(0);
  const [ended, setEnded] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const task = START_TASKS[i];
  const dom = domainOf(task.points);
  const herd = useHerding(frames, () => setEnded(true));
  const final = frames ? frames[frames.length - 1] : null;
  const score = final ? startScore(final.inertia, task.best, runs) : 0;

  function whistle() {
    setRuns((r) => r + 1);
    setEnded(false);
    herd.reset();
    setFrames(kmeansFrames(xy(task.points), placed));
  }
  function retry() {
    setFrames(null);
    setEnded(false);
    setPlaced([]);
    herd.reset();
  }
  function next() {
    const all = [...scores, score];
    if (all.length === START_TASKS.length) {
      onDone({
        score: avg(all),
        headline: avg(all) >= 800 ? "Every flock got its own dog." : "Some dogs ended up fighting over one flock.",
        detail:
          "Each whistle is one K-Means step: every sheep goes to its nearest dog, then each dog walks to the middle of its sheep. Dogs only ever improve their own patch, so if two start in the same flock they split it and another flock gets merged, and nobody moves again. Spread-out starts (or k-means++, which picks far-apart sheep) avoid this.",
        stats: [{ label: "Per field", value: all.join(" · ") }],
      });
      return;
    }
    setScores(all);
    setI(all.length);
    retry();
    setRuns(0);
  }
  const showing = frames ? herd.frame : null;
  const good = score >= 800;
  return (
    <GameScreen>
      <TopBar
        left={<><span className="text-white/70">🌾 Field {i + 1}/{START_TASKS.length}</span><Stat icon="🐕" value={`${placed.length}/4 placed`} /></>}
        right={<><Stat icon="👣" value={showing ? fmt(showing.inertia, 0) : "-"} tone={ended ? (good ? "good" : "bad") : undefined} /><span className="text-xs text-white/50">best {fmt(task.best, 0)}</span></>}
      />
      <Field
        points={task.points}
        dom={dom}
        assign={showing?.assign ?? null}
        dogs={showing ? showing.centroids : placed}
        onPick={frames ? undefined : (x, y) => setPlaced((p) => (p.length < 4 ? [...p, [x, y]] : p))}
        caption={frames ? (ended ? "Herding finished" : `Whistle ${herd.at + 1}: sheep pick a dog, dogs walk to the middle`) : "Tap the field to drop 4 dogs"}
      />
      {ended ? (
        <Banner title={good ? "🐑 Flocks herded!" : "🐕 Dogs got stuck"} sub={`Walking distance ${fmt(final!.inertia, 0)} vs best ${fmt(task.best, 0)}: +${score}${runs > 1 ? " (re-drop penalty applied)" : ""}`}>
          <GameButton tone="ghost" onClick={retry}>Re-drop dogs (−150)</GameButton>
          <GameButton onClick={next}>{i + 1 === START_TASKS.length ? "Finish" : "Next field →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <GameButton tone="ghost" onClick={() => setPlaced(kmeansPlusPlus(xy(task.points), 4, 7 + i))} disabled={!!frames}>✨ Smart drop (k-means++)</GameButton>
        <GameButton tone="ghost" onClick={() => setPlaced([])} disabled={!!frames || !placed.length}>Clear</GameButton>
        <span className="ml-auto" />
        <GameButton onClick={whistle} disabled={!!frames || placed.length < 4}>📯 Whistle!</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

// ---------- Level 3: the map's units are off ----------
function UnitsRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [k, setK] = useState(3);
  const [run, setRun] = useState<{ frames: Frame[]; back: (c: XY) => XY } | null>(null);
  const [runs, setRuns] = useState(0);
  const [ended, setEnded] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const points = UNIT_TASKS[i];
  const dom = domainOf(points);
  const herd = useHerding(run?.frames ?? null, () => setEnded(true));
  const final = run ? run.frames[run.frames.length - 1] : null;
  const pur = final ? purity(final.assign, points.map((p) => p.label)) : 0;
  const score = unitScore(pur, runs);

  function whistle() {
    const raw = xy(points);
    const { z, back } = standardize(raw);
    const space = fixed ? z : raw;
    setRun({ frames: kmeansFrames(space, kmeansPlusPlus(space, k, 3)), back: fixed ? back : (c) => c });
    setRuns((r) => r + 1);
    setEnded(false);
    herd.reset();
  }
  function again() {
    setRun(null);
    setEnded(false);
    herd.reset();
  }
  function next() {
    const all = [...scores, score];
    if (all.length === UNIT_TASKS.length) {
      onDone({
        score: avg(all),
        headline: avg(all) >= 800 ? "The dogs read the map right." : "The dogs only looked east-west.",
        detail:
          "This map measures east-west in kilometres-worth of big numbers (income) and north-south in tiny ones (visits per month). The dogs judge distance in raw numbers, so only the big axis counts and two flocks that differ north-south get merged. Fixing the scale (standardizing every feature) lets K-Means see both directions.",
        stats: [{ label: "Per farm", value: all.join(" · ") }],
      });
      return;
    }
    setScores(all);
    setI(all.length);
    again();
    setRuns(0);
  }
  const showing = run ? herd.frame : null;
  return (
    <GameScreen>
      <TopBar
        left={<><span className="text-white/70">🗺️ Customer farm {i + 1}/{UNIT_TASKS.length}</span><Stat icon="🐕" value={`× ${k}`} /></>}
        right={<Stat icon="🎯" value={ended ? `${pct(pur)} right flock` : "-"} tone={ended ? (pur > 0.9 ? "good" : "bad") : undefined} />}
      />
      <Field
        points={points}
        dom={dom}
        assign={showing?.assign ?? null}
        dogs={showing && run ? showing.centroids.map((c) => run.back(c)) : undefined}
        caption="→ income (₹k / year)   ↑ visits per month"
      />
      {ended ? (
        <Banner title={pur > 0.9 ? "🐑 Real segments found!" : "🌀 Flocks mixed up"} sub={`${pct(pur)} of sheep in the right flock: +${score}`}>
          <GameButton tone="ghost" onClick={again}>Change settings (−150)</GameButton>
          <GameButton onClick={next}>{i + 1 === UNIT_TASKS.length ? "Finish" : "Next farm →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <GameButton tone="ghost" active={fixed} onClick={() => setFixed(!fixed)} disabled={!!run}>{fixed ? "✓ Map scale fixed (standardized)" : "📏 Fix map scale (standardize)"}</GameButton>
        {[2, 3, 4].map((n) => <GameButton key={n} tone="ghost" active={k === n} onClick={() => setK(n)} disabled={!!run}>{n} 🐕</GameButton>)}
        <span className="ml-auto" />
        <GameButton onClick={whistle} disabled={!!run}>📯 Whistle!</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

// ---------- Level 4: dogs or follow-the-leader ----------
function ToolRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<null | { tool: "dogs" | "chain"; assign: number[]; pur: number; dogs?: XY[]; links?: [number, number][] }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const task = TOOL_TASKS[i];
  const dom = domainOf(task.points);

  function choose(tool: "dogs" | "chain") {
    const pts = xy(task.points);
    if (tool === "dogs") {
      const f = bestOf(pts, i === 0 ? 3 : 2, 6);
      setPick({ tool, assign: f.assign, dogs: f.centroids, pur: purity(f.assign, task.points.map((p) => p.label)) });
    } else {
      const assign = dbscan(pts, task.eps, task.minPts);
      const links: [number, number][] = [];
      pts.forEach((a, n) => pts.forEach((b, m) => m > n && assign[n] === assign[m] && Math.hypot(a[0] - b[0], a[1] - b[1]) <= task.eps * 0.7 && links.push([n, m])));
      setPick({ tool, assign, links: links.slice(0, 600), pur: purity(assign, task.points.map((p) => p.label)) });
    }
  }
  function next() {
    const all = [...scores, purityScore(pick!.pur)];
    if (all.length === TOOL_TASKS.length) {
      onDone({
        score: avg(all),
        headline: avg(all) >= 800 ? "Right method on every field." : "Dogs can't herd rings.",
        detail:
          "Dogs (K-Means) each guard a round patch, so the border between two dogs is always a straight line. That works for round flocks but slices rings and moons in half. Follow-the-leader (DBSCAN) links each sheep to its close neighbours, so a flock can be any shape as long as it is dense and connected.",
        stats: [{ label: "Per field", value: all.join(" · ") }],
      });
      return;
    }
    setScores(all);
    setI(all.length);
    setPick(null);
  }
  const good = pick && pick.pur > 0.9;
  return (
    <GameScreen>
      <TopBar left={<span className="text-white/70">🌀 {task.name} · {i + 1}/{TOOL_TASKS.length}</span>} right={<Stat icon="🎯" value={pick ? pct(pick.pur) : "-"} tone={pick ? (good ? "good" : "bad") : undefined} />} />
      <Field points={task.points} dom={dom} assign={pick?.assign ?? null} dogs={pick?.dogs} links={pick?.links} caption={pick ? "" : "Look at the shapes. One try per field."} />
      {pick ? (
        <Banner title={good ? "🐑 Every flock separated!" : "✂️ Flocks sliced in half"} sub={`${pct(pick.pur)} in the right flock: +${purityScore(pick.pur)}`}>
          <GameButton onClick={next}>{i + 1 === TOOL_TASKS.length ? "Finish" : "Next field →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <span className="text-sm font-bold text-white/80">Send in:</span>
        <GameButton onClick={() => choose("dogs")} disabled={!!pick}>🐕 Sheepdogs (K-Means)</GameButton>
        <GameButton onClick={() => choose("chain")} disabled={!!pick}>🔗 Follow-the-leader (DBSCAN)</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

export function ClustersRound({ level, onDone }: RoundProps) {
  if (level.id === "elbow") return <HireRound onDone={onDone} />;
  if (level.id === "start") return <DropRound onDone={onDone} />;
  if (level.id === "units") return <UnitsRound onDone={onDone} />;
  return <ToolRound onDone={onDone} />;
}
