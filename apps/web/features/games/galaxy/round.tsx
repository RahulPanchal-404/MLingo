"use client";

import { useMemo, useRef, useState } from "react";

import { svgPoint } from "../framework/hooks";
import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar, type Debrief } from "../framework/kit";
import { fmt, pct } from "../framework/math";
import type { RoundProps, RoundResult } from "../framework/types";
import {
  DENDRO_FIELDS, EPS_FIELDS, LINKAGE_FIELDS, NOISE_FIELDS, agglomerate, bestEpsF1, cutAtHeight, cutToK, dbscan, f1Score, leafOrder, noiseQuality, pairF1,
  type Linkage, type Merge, type Star,
} from "./logic";

const W = 560;
const H = 330;
const COLORS = ["#f472b6", "#38bdf8", "#facc15", "#4ade80", "#c084fc", "#fb923c", "#2dd4bf", "#f87171"];
const sx = (x: number) => 20 + (x / 10) * (W - 40);
const sy = (y: number) => H - 20 - (y / 10) * (H - 40);

function Sky({ stars, assign, halo }: { stars: Star[]; assign?: number[] | null; halo?: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none bg-[radial-gradient(ellipse_at_center,#1e1b4b,#020617)]" role="img" aria-label="Star field">
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={(i * 113) % W} cy={(i * 71) % H} r={0.6} fill="white" opacity={0.35} />)}
      {halo
        ? stars.map((s, i) => <circle key={`h${i}`} cx={sx(s.x)} cy={sy(s.y)} r={(halo / 10) * (W - 40)} fill="#a5b4fc" fillOpacity={0.05} stroke="#a5b4fc" strokeOpacity={0.12} />)
        : null}
      {stars.map((s, i) => {
        const a = assign?.[i];
        const noise = a !== undefined && a < 0;
        const col = a === undefined ? "#e2e8f0" : noise ? "#475569" : COLORS[a % COLORS.length];
        return (
          <g key={i}>
            {!noise ? <circle cx={sx(s.x)} cy={sy(s.y)} r={7} fill={col} opacity={0.18} /> : null}
            <circle cx={sx(s.x)} cy={sy(s.y)} r={noise ? 2.2 : 3.4} fill={col} style={{ transition: "fill 250ms" }} />
          </g>
        );
      })}
    </svg>
  );
}

/** Dendrogram with a draggable cut line. */
function Dendrogram({ n, merges, cut, onCut }: { n: number; merges: Merge[]; cut: number; onCut: (h: number) => void }) {
  const svg = useRef<SVGSVGElement>(null);
  const DW = 300;
  const DH = 330;
  const order = useMemo(() => leafOrder(n, merges), [n, merges]);
  const top = merges[merges.length - 1].height * 1.05;
  const hy = (h: number) => DH - 20 - (h / top) * (DH - 40);
  const pos = new Map<number, { x: number; h: number }>();
  order.forEach((leaf, i) => pos.set(leaf, { x: 10 + ((i + 0.5) / n) * (DW - 20), h: 0 }));
  const lines: string[] = [];
  merges.forEach((m) => {
    const A = pos.get(m.a)!;
    const B = pos.get(m.b)!;
    lines.push(`M${A.x},${hy(A.h)} V${hy(m.height)} H${B.x} V${hy(B.h)}`);
    pos.set(m.id, { x: (A.x + B.x) / 2, h: m.height });
  });
  function move(clientY: number) {
    if (!svg.current) return;
    const p = svgPoint({ clientX: 0, clientY }, svg.current, DW, DH);
    onCut(Math.max(0, Math.min(top, ((DH - 20 - p.y) / (DH - 40)) * top)));
  }
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${DW} ${DH}`}
      className="block h-auto w-full touch-none select-none bg-slate-900"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e.clientY);
      }}
      onPointerMove={(e) => e.buttons === 1 && move(e.clientY)}
      role="slider"
      aria-label="Dendrogram cut height"
      aria-valuenow={Number(cut.toFixed(2))}
    >
      {lines.map((d, i) => <path key={i} d={d} fill="none" stroke="#94a3b8" strokeWidth={1.2} />)}
      <line x1={0} x2={DW} y1={hy(cut)} y2={hy(cut)} stroke="#f43f5e" strokeWidth={2.5} />
      <rect x={DW - 92} y={hy(cut) - 18} width={88} height={16} rx={8} fill="#f43f5e" />
      <text x={DW - 48} y={hy(cut) - 6} textAnchor="middle" className="fill-white text-[10px] font-bold">cut ✂ drag me</text>
      <text x={6} y={14} className="fill-white/50 text-[10px]">merge distance ↑</text>
    </svg>
  );
}

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

function DendroRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const field = DENDRO_FIELDS[i];
  const merges = useMemo(() => agglomerate(field.stars, "average"), [field]);
  const [cut, setCut] = useState(() => merges[merges.length - 1].height * 0.3);
  const [locked, setLocked] = useState<null | number>(null);
  const [scores, setScores] = useState<number[]>([]);
  const assign = cutAtHeight(field.stars.length, merges, cut);
  const k = new Set(assign).size;
  const trueK = new Set(field.stars.map((s) => s.label)).size;

  function next() {
    const all = [...scores, locked!];
    if (all.length === DENDRO_FIELDS.length)
      return onDone(summary("dendro", all));
    setScores(all);
    setI(all.length);
    setLocked(null);
    const nm = agglomerate(DENDRO_FIELDS[all.length].stars, "average");
    setCut(nm[nm.length - 1].height * 0.3);
  }
  return (
    <GameScreen>
      <TopBar left={<span className="text-white/70">🔭 {field.name} · {i + 1}/{DENDRO_FIELDS.length}</span>} right={<Stat icon="🌌" value={`${k} galaxies`} />} />
      <div className="grid md:grid-cols-[1.5fr_1fr]">
        <Sky stars={field.stars} assign={assign} />
        <Dendrogram n={field.stars.length} merges={merges} cut={cut} onCut={(h) => locked === null && setCut(h)} />
      </div>
      {locked !== null ? (
        <Banner title={locked >= 850 ? "🌌 Galaxies mapped!" : "🔭 Not quite"} score={locked} debrief={dendroDebrief(locked, k, trueK)}>
          <GameButton onClick={next}>{i + 1 === DENDRO_FIELDS.length ? "Finish" : "Next sky →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <span className="text-xs text-white/70">Drag the red line on the family tree. Everything joined below the line is one galaxy.</span>
        <span className="ml-auto" />
        <GameButton onClick={() => setLocked(f1Score(pairF1(assign, field.stars.map((s) => s.label))))} disabled={locked !== null}>Publish map 📜</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

function LinkageRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<null | { link: Linkage; assign: number[]; score: number }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const field = LINKAGE_FIELDS[i];
  function choose(link: Linkage) {
    const assign = cutToK(field.stars.length, agglomerate(field.stars, link), field.k);
    setPick({ link, assign, score: f1Score(pairF1(assign, field.stars.map((s) => s.label))) });
  }
  function next() {
    const all = [...scores, pick!.score];
    if (all.length === LINKAGE_FIELDS.length) return onDone(summary("linkage", all));
    setScores(all);
    setI(all.length);
    setPick(null);
  }
  return (
    <GameScreen>
      <TopBar left={<span className="text-white/70">🔗 {field.name} · {i + 1}/{LINKAGE_FIELDS.length}</span>} right={<Stat icon="🌌" value={`${field.k} galaxies wanted`} />} />
      <Sky stars={field.stars} assign={pick?.assign ?? null} />
      {pick ? (
        <Banner title={pick.score >= 850 ? "🌌 Right linkage!" : "💫 Galaxies tangled"} score={pick.score} debrief={linkageDebrief(pick.link, field.best)}>
          <GameButton onClick={next}>{i + 1 === LINKAGE_FIELDS.length ? "Finish" : "Next sky →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <span className="text-sm font-bold text-white/80">How should galaxies be measured? One try:</span>
        <GameButton onClick={() => choose("single")}>🔗 Single (closest pair)</GameButton>
        <GameButton onClick={() => choose("complete")}>⭕ Complete (farthest pair)</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

function EpsRound({ mode, onDone }: { mode: "eps" | "noise"; onDone: RoundProps["onDone"] }) {
  const fields = mode === "eps" ? EPS_FIELDS : NOISE_FIELDS;
  const [i, setI] = useState(0);
  const field = fields[i];
  const [eps, setEps] = useState(0.3);
  const [minPts, setMinPts] = useState(mode === "eps" ? 4 : 2);
  const [locked, setLocked] = useState<null | { score: number; debrief: Debrief }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const mp = mode === "eps" ? (field as (typeof EPS_FIELDS)[number]).minPts : minPts;
  const assign = useMemo(() => dbscan(field.stars, eps, mp), [field, eps, mp]);
  const k = new Set(assign.filter((a) => a >= 0)).size;
  const noise = assign.filter((a) => a < 0).length;

  function lock() {
    if (mode === "eps") {
      const f1 = pairF1(assign, field.stars.map((s) => s.label));
      const best = bestEpsF1(field.stars, mp);
      const trueK = new Set(field.stars.map((s) => s.label)).size;
      const happened = `Your map agrees with the real galaxies on ${pct(f1)} of star pairs. The best possible light reach scores ${pct(best)}. You found ${k} ${k === 1 ? "galaxy" : "galaxies"} and ${noise} dust specks; the sky really has ${trueK} galaxies.`;
      const tooSmall = noise > field.stars.length * 0.15 || k > trueK;
      const debrief: Debrief =
        f1 >= best - 0.01
          ? { happened, why: "Your light reach links the stars inside each galaxy without jumping the gaps between galaxies.", idea: EPS_IDEA }
          : tooSmall
            ? { happened, why: "The light reach ε was too short to cross between neighbouring stars, so galaxies broke into pieces or into grey dust.", fix: "Increase ε a little at a time until each galaxy is one colour.", idea: EPS_IDEA }
            : { happened, why: "The light reach ε was so long it jumped the empty gaps, so separate galaxies merged into one.", fix: "Decrease ε until the galaxies separate.", idea: EPS_IDEA };
      setLocked({ score: f1Score(f1 >= best - 0.01 ? Math.max(f1, 0.95) : f1), debrief });
    } else {
      const q = noiseQuality(field.stars, assign);
      const happened = `${pct(q.clusterF1)} of the galaxy stars are in the right galaxy, and ${pct(q.noiseF1)} of the dust was correctly marked as dust (grey).`;
      const debrief: Debrief =
        q.score >= 850
          ? { happened, why: "Your density rule is strict enough to reject lone dust specks but loose enough to keep the galaxies whole.", idea: NOISE_IDEA }
          : q.noiseF1 < 0.6
            ? { happened, why: "Dust specks were pulled into galaxies, because with so few neighbours required, even a lonely speck near a galaxy counts as part of it.", fix: "Raise minPts so a speck needs more neighbours to count, or lower ε.", idea: NOISE_IDEA }
            : { happened, why: "The galaxies themselves broke up: the rule is too strict for how densely their stars are packed.", fix: "Lower minPts or raise ε a little.", idea: NOISE_IDEA };
      setLocked({ score: q.score, debrief });
    }
  }
  function next() {
    const all = [...scores, locked!.score];
    if (all.length === fields.length) return onDone(summary(mode, all));
    setScores(all);
    setI(all.length);
    setLocked(null);
    setEps(0.3);
    setMinPts(2);
  }
  return (
    <GameScreen>
      <TopBar left={<span className="text-white/70">✨ {field.name} · {i + 1}/{fields.length}</span>} right={<><Stat icon="🌌" value={`${k} galaxies`} /><Stat icon="🌫️" value={`${noise} noise`} /></>} />
      <Sky stars={field.stars} assign={assign} halo={eps} />
      {locked ? (
        <Banner title={locked.score >= 850 ? "🌌 Perfect map!" : locked.score >= 450 ? "🔭 Close" : "💫 Messy map"} score={locked.score} debrief={locked.debrief}>
          <GameButton onClick={next}>{i + 1 === fields.length ? "Finish" : "Next sky →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <label className="flex min-w-[200px] flex-1 items-center gap-2 text-xs text-white/70">
          <span className="whitespace-nowrap font-bold text-white">Light reach ε</span>
          <input type="range" min={0.1} max={2.05} step={0.05} value={eps} onChange={(e) => setEps(Number(e.target.value))} disabled={!!locked} className="flex-1 accent-indigo-400" aria-label="DBSCAN epsilon" />
          <span className="w-10 font-mono text-sm font-black text-white">{fmt(eps, 2)}</span>
        </label>
        {mode === "noise" ? (
          <label className="flex min-w-[180px] items-center gap-2 text-xs text-white/70">
            <span className="whitespace-nowrap font-bold text-white">minPts</span>
            <input type="range" min={2} max={12} step={1} value={minPts} onChange={(e) => setMinPts(Number(e.target.value))} disabled={!!locked} className="flex-1 accent-indigo-400" aria-label="DBSCAN minPts" />
            <span className="w-6 font-mono text-sm font-black text-white">{minPts}</span>
          </label>
        ) : (
          <span className="text-xs text-white/50">minPts = {mp}</span>
        )}
        <GameButton onClick={lock} disabled={!!locked}>Publish map 📜</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

const DENDRO_IDEA =
  "This is hierarchical clustering. It starts with every star alone, then keeps merging the two closest groups. The family tree (a dendrogram) records how far apart each pair of groups was when they merged: the taller the line, the farther apart. Cutting the tree at a height turns it into groups. Cut in the biggest vertical gap: merges above that gap join groups that are genuinely far apart.";

function dendroDebrief(score: number, k: number, trueK: number): Debrief {
  const happened = `Your cut made ${k} ${k === 1 ? "galaxy" : "galaxies"}. The sky really has ${trueK}.`;
  if (score >= 850)
    return { happened, why: k > trueK ? `The extra ${k - trueK === 1 ? "group is" : "groups are"} just a few stray stars, so the map still matches.` : "Your cut sits in the big gap between merges inside galaxies and merges between galaxies.", idea: DENDRO_IDEA };
  return k > trueK
    ? { happened, why: "Your cut was too low on the tree, below merges that only join stars of the same galaxy, so real galaxies were split apart.", fix: "Move the cut up into the tallest stretch of the tree with no merges.", idea: DENDRO_IDEA }
    : { happened, why: "Your cut was too high on the tree, above merges that join different galaxies, so separate galaxies were combined.", fix: "Move the cut down into the tallest stretch of the tree with no merges.", idea: DENDRO_IDEA };
}

function linkageDebrief(link: string, best: string): Debrief {
  const name = (l: string) => (l === "single" ? "Single" : "Complete");
  const happened = `You used ${name(link).toLowerCase()} linkage. On this sky, ${best} linkage works best.`;
  const idea =
    "To merge groups, hierarchical clustering needs a distance between two groups, not just two stars. Single linkage uses the closest pair of stars, so it follows long chains and rings, but one thin bridge of stars is enough to glue two galaxies together. Complete linkage uses the farthest pair, so it keeps groups compact and ignores thin bridges, but it cuts long shapes apart.";
  const why =
    best === "single"
      ? "These galaxies are long or ring-shaped, so their far ends are far apart. Single linkage follows the chain of closest stars; complete linkage sees the far ends and refuses to merge them."
      : "A thin bridge of stars joins two galaxies. Single linkage walks across it and merges them; complete linkage keeps each galaxy compact.";
  return link === best ? { happened, why, idea } : { happened, why, fix: `Look for long shapes (use single) or thin bridges between blobs (use complete).`, idea };
}

const EPS_IDEA =
  "This is DBSCAN, a clustering method based on density. A star is part of a galaxy if enough other stars are within its light reach (ε). Galaxies grow by chaining such stars together, so they can be any shape, and stars with too few neighbours are labelled noise. Too small an ε and everything becomes noise; too large and everything merges.";
const NOISE_IDEA =
  "minPts is how many neighbours within reach a star needs to count as part of a dense region. Raising it makes DBSCAN stricter, so isolated points are labelled noise instead of being forced into a cluster. That is how DBSCAN finds outliers, which K-Means can't do: K-Means puts every point in some group.";

function summary(mode: string, all: number[]): RoundResult {
  const a = avg(all);
  const text: Record<string, string> = {
    dendro: "Hierarchical clustering merged the two closest groups again and again, and the dendrogram recorded the distance of every merge. Cutting it at a height turns it into clusters. The right cut sits in the biggest vertical gap: merges above it join groups that are genuinely far apart.",
    linkage: "Linkage decides what 'distance between two groups' means. Single linkage (closest pair) follows long streams and rings, but one bridge of stars glues two galaxies together. Complete linkage (farthest pair) keeps galaxies compact and ignores thin bridges.",
    eps: "ε is how far a star's light reaches. Too small and every star is alone (noise); too large and everything merges into one blob. DBSCAN chains together stars inside each other's reach, so at the right ε it follows spirals and rings that K-Means would cut in half.",
    noise: "minPts says how many neighbours a star needs to count as part of a dense region. Raising it makes DBSCAN stricter, so lonely dust specks are labelled noise instead of being forced into a galaxy. This is how DBSCAN finds outliers.",
  };
  return { score: a, headline: a >= 850 ? "Astronomer royal." : a >= 450 ? "A decent star chart." : "The map needs work.", detail: text[mode], stats: [{ label: "Per sky", value: all.join(" · ") }] };
}

export function GalaxyRound({ level, onDone }: RoundProps) {
  if (level.id === "dendro") return <DendroRound onDone={onDone} />;
  if (level.id === "linkage") return <LinkageRound onDone={onDone} />;
  return <EpsRound key={level.id} mode={level.id as "eps" | "noise"} onDone={onDone} />;
}
