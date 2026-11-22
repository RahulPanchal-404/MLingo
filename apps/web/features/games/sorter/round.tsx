"use client";

import { useMemo, useState } from "react";

import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar, type Debrief } from "../framework/kit";
import { fmt, pct } from "../framework/math";
import type { RoundProps, RoundResult } from "../framework/types";
import {
  DEPTHS, DEPTH_TASKS, KNN_TASKS, KS, SCALE_TASKS, TREE_TASKS, accScore, accuracy, bestDepth, bestDepthAcc, bestK, bestKnnAcc, fullTree, gini, go, knnPredict, majority, questionScore, questionsFor, splitGini, standardizer, treePredict,
  type C, type Node, type Split, type Task,
} from "./logic";

const W = 560;
const H = 330;
const GRID = 28;
const SPECIES: [string, string] = ["🐞", "🐝"];
const NAMES: [string, string] = ["ladybird", "bee"];

type Dom = { a: [number, number]; b: [number, number] };
const domainOf = (t: Task): Dom => {
  const all = [...t.train, ...t.test];
  const pad = (lo: number, hi: number): [number, number] => [lo - (hi - lo) * 0.06, hi + (hi - lo) * 0.06];
  return { a: pad(Math.min(...all.map((c) => c.a)), Math.max(...all.map((c) => c.a))), b: pad(Math.min(...all.map((c) => c.b)), Math.max(...all.map((c) => c.b))) };
};

/** The sorting field: coloured map = what the model would say for a creature standing there. */
function Field({ task, predict, show, highlight, tested }: { task: Task; predict?: (q: { a: number; b: number }) => 0 | 1; show: "train" | "test"; highlight?: (c: C) => boolean; tested?: boolean }) {
  const dom = domainOf(task);
  const sx = (a: number) => 40 + ((a - dom.a[0]) / (dom.a[1] - dom.a[0])) * (W - 50);
  const sy = (b: number) => H - 30 - ((b - dom.b[0]) / (dom.b[1] - dom.b[0])) * (H - 40);
  const cw = (W - 50) / GRID;
  const ch = (H - 40) / GRID;
  const cells = useMemo(() => {
    if (!predict) return [];
    return Array.from({ length: GRID * GRID }, (_, i) => {
      const a = dom.a[0] + (((i % GRID) + 0.5) / GRID) * (dom.a[1] - dom.a[0]);
      const b = dom.b[0] + ((Math.floor(i / GRID) + 0.5) / GRID) * (dom.b[1] - dom.b[0]);
      return predict({ a, b });
    });
  }, [predict, dom.a, dom.b]);
  const pts = show === "train" ? task.train : task.test;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none bg-[#ecfccb]" role="img" aria-label="Creature field and the model's sorting map">
      {cells.map((p, i) => (
        <rect key={i} x={40 + (i % GRID) * cw} y={H - 30 - (Math.floor(i / GRID) + 1) * ch} width={cw + 0.5} height={ch + 0.5} fill={p ? "#facc15" : "#f87171"} fillOpacity={0.28} />
      ))}
      <text x={W / 2} y={H - 8} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">→ {task.axes[0]}</text>
      <text x={12} y={H / 2} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold" transform={`rotate(-90 12 ${H / 2})`}>{task.axes[1]} →</text>
      {pts.map((c, i) => {
        const dim = highlight && !highlight(c);
        const ok = tested && predict ? predict(c) === c.label : null;
        return (
          <g key={i} opacity={dim ? 0.15 : 1}>
            {ok !== null ? <circle cx={sx(c.a)} cy={sy(c.b)} r={8} fill="none" stroke={ok ? "#16a34a" : "#dc2626"} strokeWidth={2.5} /> : null}
            <text x={sx(c.a)} y={sy(c.b) + 4} textAnchor="middle" className="text-[12px]">{SPECIES[c.label]}</text>
          </g>
        );
      })}
    </svg>
  );
}

const Legend = () => (
  <span className="text-xs text-white/70">
    <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-rose-400/70 align-middle" /> sorted as {NAMES[0]} {SPECIES[0]} · <span className="mx-1 inline-block h-3 w-3 rounded-sm bg-yellow-300/70 align-middle" /> sorted as {NAMES[1]} {SPECIES[1]}
  </span>
);

type Mode = "knn" | "scale" | "depth";

function MapRound({ mode, onDone }: { mode: Mode; onDone: RoundProps["onDone"] }) {
  const tasks = mode === "knn" ? KNN_TASKS : mode === "scale" ? SCALE_TASKS : DEPTH_TASKS;
  const [i, setI] = useState(0);
  const [k, setK] = useState(mode === "knn" ? 1 : 7);
  const [std, setStd] = useState(false);
  const [depth, setDepth] = useState(12);
  const [tested, setTested] = useState<null | { acc: number; best: number; score: number }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const task = tasks[i];

  const predict = useMemo(() => {
    if (mode === "depth") {
      const tree = fullTree(task.train);
      return (q: { a: number; b: number }) => treePredict(tree, q, depth);
    }
    const tf = std ? standardizer(task.train) : (c: { a: number; b: number }) => c;
    return (q: { a: number; b: number }) => knnPredict(task.train, k, q, tf);
  }, [mode, task, k, std, depth]);
  const trainAcc = accuracy(predict, task.train);

  function release() {
    const acc = accuracy(predict, task.test);
    const best =
      mode === "knn" ? bestKnnAcc(task) : mode === "depth" ? bestDepthAcc(task) : accuracy((c) => knnPredict(task.train, 7, c, standardizer(task.train)), task.test);
    setTested({ acc, best: Math.max(best, acc), score: accScore(acc, Math.max(best, acc)) });
  }
  function next() {
    const all = [...scores, tested!.score];
    if (all.length === tasks.length) return onDone(summary(mode, all));
    setScores(all);
    setI(all.length);
    setTested(null);
    setK(mode === "knn" ? 1 : 7);
    setStd(false);
    setDepth(12);
  }
  return (
    <GameScreen>
      <TopBar
        left={<span className="text-white/70">🧺 {task.name} · {i + 1}/{tasks.length}</span>}
        right={<><Stat icon="🏋️" value={`train ${pct(trainAcc)}`} />{tested ? <Stat icon="🧪" value={`test ${pct(tested.acc)}`} tone={tested.score >= 700 ? "good" : "bad"} /> : null}</>}
      />
      <Field task={task} predict={predict} show={tested ? "test" : "train"} tested={!!tested} />
      {tested ? (
        <Banner
          title={tested.score >= 850 ? "🏆 Sorted like a pro!" : tested.score >= 450 ? "🙂 Mostly right" : "😵 Creatures in the wrong pens"}
          score={tested.score}
          debrief={sorterDebrief(mode, task, k, std, depth, trainAcc, tested.acc, tested.best)}
        >
          <GameButton onClick={next}>{i + 1 === tasks.length ? "Finish" : "Next field →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        {mode !== "depth" ? (
          <>
            <span className="text-xs font-bold">K neighbours:</span>
            {(mode === "knn" ? KS : [7]).map((n) => <GameButton key={n} tone="ghost" active={k === n} onClick={() => setK(n)} disabled={!!tested}>{n}</GameButton>)}
          </>
        ) : (
          <>
            <span className="text-xs font-bold">Max questions deep:</span>
            {DEPTHS.map((d) => <GameButton key={d} tone="ghost" active={depth === d} onClick={() => setDepth(d)} disabled={!!tested}>{d}</GameButton>)}
          </>
        )}
        {mode === "scale" ? <GameButton tone="ghost" active={std} onClick={() => setStd(!std)} disabled={!!tested}>{std ? "✓ Same units (standardized)" : "📏 Put features in same units"}</GameButton> : null}
        <Legend />
        <span className="ml-auto" />
        <GameButton onClick={release} disabled={!!tested}>Release new creatures 🥚</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

/** Build a depth-2 tree by hand: pick the best question at each node. */
function TreeRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const task = TREE_TASKS[i];
  const [path, setPath] = useState<("root" | "L" | "R")[]>(["root"]);
  const [choices, setChoices] = useState<Record<string, Split>>({});
  const [points, setPoints] = useState<number[]>([]);
  const [last, setLast] = useState<null | { drop: number; best: number; pts: number }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const node = path[0];
  const subset = (where: string, data: C[]) =>
    where === "root" ? data : data.filter((c) => (where === "L" ? go(c, choices.root) : !go(c, choices.root)));
  const data = node ? subset(node, task.train) : task.train;
  const options = useMemo(() => (node ? questionsFor(data) : []), [node, data]);
  const done = path.length === 0;

  const tree: Node | null = useMemo(() => {
    if (!done) return null;
    const leafOf = (d: C[]): Node => ({ leaf: true, label: majority(d), n: d.length });
    const sub = (where: "L" | "R"): Node => {
      const d = subset(where, task.train);
      const s = choices[where];
      return s ? { leaf: false, split: s, left: leafOf(d.filter((c) => go(c, s))), right: leafOf(d.filter((c) => !go(c, s))), n: d.length } : leafOf(d);
    };
    return { leaf: false, split: choices.root, left: sub("L"), right: sub("R"), n: task.train.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, choices, task]);

  function pick(s: Split) {
    const pts = questionScore(data, s, options);
    const g0 = gini(data);
    setLast({ drop: g0 - splitGini(data, s), best: Math.max(...options.map((o) => g0 - splitGini(data, o))), pts });
    setPoints([...points, pts]);
    const nc = { ...choices, [node]: s };
    setChoices(nc);
    let rest = path.slice(1);
    if (node === "root") {
      const L = task.train.filter((c) => go(c, s));
      const R = task.train.filter((c) => !go(c, s));
      rest = [...(gini(L) > 0.05 && L.length > 3 ? (["L"] as const) : []), ...(gini(R) > 0.05 && R.length > 3 ? (["R"] as const) : [])];
    }
    setPath(rest);
  }
  function next() {
    const avg = Math.round(points.reduce((a, b) => a + b, 0) / points.length);
    const all = [...scores, avg];
    if (all.length === TREE_TASKS.length) return onDone(summary("tree", all));
    setScores(all);
    setI(all.length);
    setPath(["root"]);
    setChoices({});
    setPoints([]);
    setLast(null);
  }
  const count = (d: C[]) => `${d.filter((c) => c.label === 0).length}${SPECIES[0]} ${d.filter((c) => c.label === 1).length}${SPECIES[1]}`;
  const fname = (s: Split) => (s.feature === "a" ? task.axes[0] : task.axes[1]).replace(/ \(.*\)/, "");
  const testAcc = tree ? accuracy((c) => treePredict(tree, c), task.test) : 0;

  return (
    <GameScreen>
      <TopBar
        left={<span className="text-white/70">🌳 {task.name} · {i + 1}/{TREE_TASKS.length}</span>}
        right={<><Stat icon="❓" value={`question ${points.length + (done ? 0 : 1)}`} /><Stat icon="⭐" value={points.length ? Math.round(points.reduce((a, b) => a + b, 0) / points.length) : "-"} /></>}
      />
      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <Field task={task} predict={tree ? (q) => treePredict(tree, q) : undefined} show={done ? "test" : "train"} tested={done} highlight={done ? undefined : (c) => subset(node, [c]).length === 1} />
        <div className="space-y-2 bg-slate-900 p-3">
          {!done ? (
            <>
              <p className="text-xs font-black uppercase tracking-wider text-amber-300">{node === "root" ? "First question (everyone)" : node === "L" ? "Question for the YES group" : "Question for the NO group"}</p>
              <p className="text-xs text-white/70">This group: {count(data)}. Mixing score (Gini) {fmt(gini(data), 2)}: 0 means one species only, 0.5 is a half-and-half mix. Pick the question that leaves both sides least mixed.</p>
              {options.map((s, n) => {
                const yes = data.filter((c) => go(c, s));
                const no = data.filter((c) => !go(c, s));
                return (
                  <button key={n} type="button" onClick={() => pick(s)} className="w-full rounded-lg border border-white/15 bg-white/5 p-2 text-left text-xs hover:bg-white/15">
                    <b className="text-white">Is {fname(s)} &lt; {s.t}?</b>
                    <span className="block text-white/70">Yes: {count(yes)} · No: {count(no)}</span>
                  </button>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-white/80">Tree built. New creatures sorted: <b>{pct(testAcc)}</b> correct.</p>
          )}
          {last ? (
            <p className="g-pop rounded-lg bg-black/40 p-2 text-xs text-white/80">
              Your question lowered the mixing score by <b>{fmt(last.drop, 3)}</b>. The best question available would have lowered it by {fmt(last.best, 3)}. <b className="text-amber-300">{last.pts} / 1000</b>
            </p>
          ) : null}
        </div>
      </div>
      {done ? (
        <Banner
          title={points.every((p) => p >= 900) ? "🌳 Perfect questions!" : "🌳 Tree built"}
          score={Math.round(points.reduce((a, b) => a + b, 0) / points.length)}
          debrief={{
            happened: `Your tree sorts ${pct(testAcc)} of new creatures into the right pen. Each question scored: ${points.join(", ")} out of 1000.`,
            why: points.every((p) => p >= 900)
              ? "Every time, you picked the question that left the two groups as unmixed as possible."
              : "Some questions left the groups more mixed than the best question available would have. A good question sends mostly one species to Yes and mostly the other to No.",
            fix: points.every((p) => p >= 900) ? undefined : "For each option, look at the Yes and No counts and pick the one where each side is closest to a single species.",
            idea: TREE_IDEA,
          }}
        >
          <GameButton onClick={next}>{i + 1 === TREE_TASKS.length ? "Finish" : "Next habitat →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck><Legend /></ControlDeck>
    </GameScreen>
  );
}

const KNN_IDEA =
  "This sorting rule is K-nearest neighbours: to sort a new creature, look at the K creatures closest to it that you have already sorted, and go with the majority. Small K copies individual creatures, mistakes and all, so the map turns jagged (overfitting). Large K averages over so many neighbours that the real border gets blurred (underfitting). The right K is found by testing on creatures the rule has not seen.";
const SCALE_IDEA =
  "Methods that measure distance, like K-nearest neighbours, add up the differences in every feature. If one feature is measured in hundreds and another in single digits, the big one swamps the small one. Standardizing rescales every feature to the same range (average 0, spread 1), so each one counts fairly.";
const TREE_IDEA =
  "This is how a decision tree is built. At each step it tries every possible yes/no question and keeps the one that splits the group into the least-mixed halves. Mixing is measured with the Gini impurity: 0 for a pure group, higher the more mixed it is. The tree repeats this on each half until the groups are pure enough.";
const DEPTH_IDEA =
  "Depth is how many questions in a row the tree may ask. A deep tree keeps going until every training creature has its own little box, which makes it perfect on creatures it has seen and poor on new ones (overfitting). A shallow tree asks too few questions to follow the border (underfitting). Limiting depth is the main way to control a tree.";

/** Feedback for the sorting map, compared with the best setting for this habitat. */
function sorterDebrief(mode: Mode, task: Task, k: number, std: boolean, depth: number, trainAcc: number, testAcc: number, best: number): Debrief {
  const happened = `${pct(testAcc)} of the new creatures went to the right pen; the best possible rule here gets ${pct(best)}. On the creatures you had already sorted, your rule was right ${pct(trainAcc)} of the time.`;
  if (mode === "scale")
    return std
      ? { happened, why: "With both features in the same units, wing length counts as much as weight, and wing length is what tells the species apart.", idea: SCALE_IDEA }
      : {
          happened,
          why: "Weight is in hundreds of grams, wing length under 6 cm. When the rule measures how close two creatures are, a weight difference of 50 swamps a wing difference of 2, so it was effectively looking at weight only. Weight doesn't tell these species apart.",
          fix: "Press 'Put features in same units' before releasing the creatures.",
          idea: SCALE_IDEA,
        };
  if (mode === "knn") {
    const bk = bestK(task);
    if (k < bk)
      return {
        happened,
        why: `With K = ${k}, each new creature copied the closest one or two creatures, including those that were mislabelled. That's why the rule looks great on creatures it has seen and worse on new ones.`,
        fix: `Ask more neighbours. K = ${bk} was best here.`,
        idea: KNN_IDEA,
      };
    if (k > bk)
      return {
        happened,
        why: `With K = ${k}, so many neighbours vote that creatures near the border get swept along with the majority species.`,
        fix: `Ask fewer neighbours. K = ${bk} was best here.`,
        idea: KNN_IDEA,
      };
    return { happened, why: `K = ${k} was the best choice for this habitat. The creatures it still got wrong sit right on the border, mixed in with the other species.`, idea: KNN_IDEA };
  }
  const bd = bestDepth(task);
  if (depth > bd)
    return {
      happened,
      why: `At depth ${depth} the tree kept asking questions until it had memorised the training creatures, mislabelled ones included. The map breaks into tiny boxes that don't help with new creatures.`,
      fix: `Allow fewer questions. Depth ${bd} was best here.`,
      idea: DEPTH_IDEA,
    };
  if (depth < bd)
    return { happened, why: `Depth ${depth} is too few questions to trace the border between the species.`, fix: `Allow more questions. Depth ${bd} was best here.`, idea: DEPTH_IDEA };
  return { happened, why: `Depth ${depth} was the best choice here.`, idea: DEPTH_IDEA };
}

function summary(mode: string, all: number[]): RoundResult {
  const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  const text: Record<string, string> = {
    knn: "Each creature was sorted by a vote of its K nearest neighbours. K = 1 copied whichever single creature was closest, so the map was jagged and noise fooled it (100% on training, worse on new creatures). Large K smooths the map until it ignores real structure. The best K sits in between.",
    scale: "Weight in grams has numbers in the hundreds, wing length under 6, so raw distance was almost all weight, which says nothing about species. Putting both features in the same units (standardizing) let wing length count, and accuracy jumped.",
    tree: "At each node you picked a question that splits the group into purer groups: that's exactly how a decision tree is built, using Gini impurity to score every possible question and taking the best one.",
    depth: "A deep tree keeps asking questions until each region holds a single creature: 100% on training, but the map breaks into tiny boxes that chase noise. A shallow tree can't follow the shape. Limiting depth is how you control overfitting in trees.",
  };
  return {
    score: avg,
    headline: avg >= 850 ? "Head zookeeper." : avg >= 450 ? "Most creatures in the right pen." : "The pens are a mess.",
    detail: text[mode],
    stats: [{ label: "Per field", value: all.join(" · ") }],
  };
}

export function SorterRound({ level, onDone }: RoundProps) {
  if (level.id === "tree") return <TreeRound onDone={onDone} />;
  return <MapRound key={level.id} mode={level.id as Mode} onDone={onDone} />;
}
