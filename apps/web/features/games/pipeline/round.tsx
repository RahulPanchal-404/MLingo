"use client";

import { useMemo, useState } from "react";

import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar } from "../framework/kit";
import { mulberry32 } from "../framework/math";
import type { RoundProps } from "../framework/types";
import { BADGES_PER_CASE, CASES, CLUE_COST, caseScore, type SuspectCase, type TimelineCase } from "./cases";

type Outcome = { score: number; solved: boolean };

export function PipelineRound({ level, onDone }: RoundProps) {
  const cases = CASES[level.id];
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Outcome[]>([]);
  const c = cases[i];

  function closed(o: Outcome) {
    const all = [...results, o];
    if (all.length === cases.length) {
      const score = Math.round(all.reduce((s, r) => s + r.score, 0) / all.length);
      onDone({
        score,
        headline: all.every((r) => r.solved) ? "Every case closed." : `${all.filter((r) => r.solved).length} of ${all.length} cases closed.`,
        detail: LESSON[level.id],
        stats: [
          { label: "Cases closed", value: `${all.filter((r) => r.solved).length} / ${all.length}` },
          { label: "Per case", value: all.map((r) => r.score).join(" · ") },
        ],
      });
      return;
    }
    setResults(all);
    setI(all.length);
  }

  return (
    <GameScreen className="bg-[radial-gradient(ellipse_at_top,#1e293b,#020617)]">
      {c.kind === "suspects" ? (
        <SuspectBoard key={i} c={c} index={i} total={cases.length} onClosed={closed} />
      ) : (
        <Timeline key={i} c={c} index={i} total={cases.length} onClosed={closed} />
      )}
    </GameScreen>
  );
}

function Badges({ left }: { left: number }) {
  return <span aria-label={`${left} badges left`}>{Array.from({ length: BADGES_PER_CASE }, (_, n) => <span key={n} className={n < left ? "" : "opacity-20 grayscale"}>🎖️</span>)}</span>;
}

function SuspectBoard({ c, index, total, onClosed }: { c: SuspectCase; index: number; total: number; onClosed: (o: Outcome) => void }) {
  const [selected, setSelected] = useState(0);
  const [clues, setClues] = useState<Set<number>>(new Set());
  const [accused, setAccused] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState(0);
  const guilty = c.suspects.flatMap((x, n) => (x.guilty ? [n] : []));
  const caught = guilty.filter((n) => accused.has(n)).length;
  const solved = caught === guilty.length;
  const failed = wrong >= BADGES_PER_CASE;
  const score = caseScore(clues.size, wrong, solved);
  const sus = c.suspects[selected];

  function accuse() {
    if (accused.has(selected)) return;
    setAccused(new Set(accused).add(selected));
    if (!sus.guilty) setWrong(wrong + 1);
  }

  return (
    <>
      <TopBar
        left={<><span className="text-white/70">🕵️ Case {index + 1}/{total}: <b className="text-white">{c.title}</b></span></>}
        right={<><Badges left={BADGES_PER_CASE - wrong} /><Stat icon="🔎" value={`${clues.size} clues`} /></>}
      />
      <div className="space-y-3 p-4">
        <div className="rounded-xl border border-amber-200/20 bg-amber-100/5 p-3">
          <p className="text-sm text-amber-50/90">{c.story}</p>
          <p className="mt-1 text-sm font-black text-amber-300">{c.ask}{guilty.length > 1 ? ` (${guilty.length} culprits)` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="listbox" aria-label="Suspects">
          {c.suspects.map((x, n) => {
            const state = accused.has(n) ? (x.guilty ? "caught" : "wrong") : n === selected ? "sel" : "idle";
            return (
              <button
                key={x.name}
                type="button"
                role="option"
                aria-selected={n === selected}
                onClick={() => setSelected(n)}
                className={`relative flex w-[104px] flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition ${
                  state === "caught" ? "border-emerald-400 bg-emerald-500/15" : state === "wrong" ? "border-rose-500/60 bg-rose-500/10 opacity-60" : state === "sel" ? "border-amber-300 bg-white/10 -translate-y-1" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <span className="text-3xl">{x.avatar}</span>
                <span className="text-[11px] font-bold leading-tight">{x.name}</span>
                {state === "caught" ? <span className="g-pop absolute -right-1 -top-2 rounded bg-emerald-500 px-1 text-[10px] font-black">CAUGHT</span> : null}
                {state === "wrong" ? <span className="g-pop absolute -right-1 -top-2 rounded bg-rose-500 px-1 text-[10px] font-black">INNOCENT</span> : null}
              </button>
            );
          })}
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-black/40 p-3">
          <span className="text-4xl">{sus.avatar}</span>
          <div className="space-y-1">
            <p className="text-sm font-black">{sus.name}</p>
            <p className="text-sm italic text-white/85">&ldquo;{sus.says}&rdquo;</p>
            {clues.has(selected) ? <p className="g-pop text-sm text-sky-300">🔎 {sus.clue}</p> : null}
          </div>
        </div>
      </div>
      {solved || failed ? (
        <Banner title={solved ? "🔒 Case closed!" : "📁 Case gone cold"} sub={`${c.verdict} ${solved ? `+${score}` : ""}`}>
          <GameButton onClick={() => onClosed({ score, solved })}>{index + 1 === total ? "File the report" : "Next case →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <GameButton tone="ghost" onClick={() => setClues(new Set(clues).add(selected))} disabled={clues.has(selected)}>🔎 Interrogate (−{CLUE_COST})</GameButton>
        <span className="ml-auto text-xs text-white/50">Wrong accusation costs a badge</span>
        <GameButton tone="danger" onClick={accuse} disabled={accused.has(selected)}>☝️ Accuse {sus.name}</GameButton>
      </ControlDeck>
    </>
  );
}

function Timeline({ c, index, total, onClosed }: { c: TimelineCase; index: number; total: number; onClosed: (o: Outcome) => void }) {
  const shuffled = useMemo(() => {
    const r = mulberry32(index * 31 + 7);
    const order = c.steps.map((_, n) => n);
    for (let n = order.length - 1; n > 0; n--) {
      const j = Math.floor(r() * (n + 1));
      [order[n], order[j]] = [order[j], order[n]];
    }
    if (order.every((v, n) => v === n)) order.reverse();
    return order;
  }, [c.steps, index]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const solved = placed.length === c.steps.length;
  const failed = wrong >= BADGES_PER_CASE;
  const score = caseScore(0, wrong, solved);

  function pick(step: number) {
    if (step === placed.length) {
      setPlaced([...placed, step]);
      setFlash(null);
    } else {
      setWrong(wrong + 1);
      setFlash(step);
    }
  }

  return (
    <>
      <TopBar left={<span className="text-white/70">🕵️ Case {index + 1}/{total}: <b className="text-white">{c.title}</b></span>} right={<Badges left={BADGES_PER_CASE - wrong} />} />
      <div className="space-y-3 p-4">
        <div className="rounded-xl border border-amber-200/20 bg-amber-100/5 p-3">
          <p className="text-sm text-amber-50/90">{c.story}</p>
          <p className="mt-1 text-sm font-black text-amber-300">Pick the evidence cards in the order things should happen.</p>
        </div>
        <ol className="space-y-1.5">
          {c.steps.map((_, n) => (
            <li key={n} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${n < placed.length ? "border-emerald-400/50 bg-emerald-500/10" : "border-dashed border-white/15 text-white/30"}`}>
              <span className="font-mono text-xs">{n + 1}.</span>
              {n < placed.length ? <span className="g-pop font-bold">{c.steps[placed[n]]}</span> : <span>?</span>}
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          {shuffled.filter((n) => !placed.includes(n)).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => pick(n)}
              className={`rounded-xl border-2 bg-amber-50 px-3 py-2 text-left text-sm font-bold text-slate-900 shadow-[0_3px_0_#b45309] transition active:translate-y-0.5 ${flash === n ? "g-shake border-rose-500" : "border-amber-300"}`}
            >
              🗂️ {c.steps[n]}
            </button>
          ))}
        </div>
      </div>
      {solved || failed ? (
        <Banner title={solved ? "🔒 Timeline rebuilt!" : "📁 Case gone cold"} sub={`${c.verdict} ${solved ? `+${score}` : ""}`}>
          <GameButton onClick={() => onClosed({ score, solved })}>{index + 1 === total ? "File the report" : "Next case →"}</GameButton>
        </Banner>
      ) : null}
    </>
  );
}

const LESSON: Record<string, string> = {
  leak: "A leak is any feature you wouldn't have at prediction time, anything computed from the answer, or a split that lets the same examples appear in train and test. The tell-tale sign is a score that is too good to be true.",
  overfit: "Compare training and test error. Low training error with high test error is overfitting (memorising). High on both is underfitting (too simple). Ship the model, or the epoch, where validation error is lowest.",
  order: "Split first, and keep the test set locked away. Fit every learned step (scaling, filling missing values, tuning) on training data only. For time series, train on the past and test on the future.",
  metric: "Choose the metric from the cost of each mistake. Accuracy lies on rare events. Trust recall when misses are expensive and precision when false alarms are.",
};
