"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { readLearningActivity } from "@/features/progress/activity";

type MissionListing = {
  id: string;
  href: string;
  algorithm: string;
  tag: string;
  title: string;
  codeName: string;
  briefing: string;
  targetSymptom: string;
  investigationSignals: string[];
  difficulty: "Beginner" | "Intermediate";
};

const missions: MissionListing[] = [
  {
    id: "unstable-gradient-descent",
    href: "/challenges/gradient-descent-instability",
    algorithm: "Linear Regression",
    tag: "Optimization Flaw",
    codeName: "OPERATION: BOUNCEBACK",
    title: "Make Gradient Descent Unstable",
    briefing:
      "When the learning rate is set too aggressively, weight updates overshoot the loss bowl valley. Your objective is to induce instability and isolate the inflection frame.",
    targetSymptom: "Loss oscillation followed by catastrophic divergence away from the global minimum.",
    investigationSignals: ["Loss Curve Inflection", "Gradient Sign Alternation", "Parameter Divergence"],
    difficulty: "Beginner",
  },
  {
    id: "learning-slowdown",
    href: "/challenges/learning-slowdown",
    algorithm: "Linear Regression",
    tag: "Vanishing Velocity",
    codeName: "OPERATION: STAGNATION",
    title: "Find the Learning Slowdown",
    briefing:
      "Inspect a training trajectory throttled by an excessively small step size. Detect the exact frame where parameter progress freezes into an apparent plateau.",
    targetSymptom: "Flatline loss progression with near-zero parameter updates despite distant optimality.",
    investigationSignals: ["Minimal Delta Loss", "Weight Norm Freeze", "Sub-optimal Residuals"],
    difficulty: "Beginner",
  },
  {
    id: "spot-divergence",
    href: "/challenges/spot-divergence",
    algorithm: "Linear Regression",
    tag: "Exploding Errors",
    codeName: "OPERATION: RUNAWAY",
    title: "Spot Divergence",
    briefing:
      "Identify the recorded region where optimization overshoots and error compounds exponentially. Pinpoint the first frame where parameters escape stability bounds.",
    targetSymptom: "Exponential loss growth and exploding gradient vectors exceeding numerical tolerances.",
    investigationSignals: ["Exploding Loss", "Gradient Vector Spikes", "Hypothesis Line Flips"],
    difficulty: "Intermediate",
  },
  {
    id: "threshold-tradeoff",
    href: "/challenges/threshold-tradeoff",
    algorithm: "Logistic Regression",
    tag: "Boundary Stabilization",
    codeName: "OPERATION: EQUILIBRIUM",
    title: "Find the Threshold Trade-off",
    briefing:
      "Scrub through training frames to locate where classification boundaries reach near-convergence and log-loss reaches an asymptotic floor.",
    targetSymptom: "Decision boundary shifts diminish to negligible sub-pixel adjustments.",
    investigationSignals: ["Log-Loss Asymptote", "Sigmoid Gradient Near-Zero", "Confusion Matrix Settlement"],
    difficulty: "Beginner",
  },
  {
    id: "stable-clustering",
    href: "/challenges/stable-clustering",
    algorithm: "K-Means",
    tag: "Centroid Lock",
    codeName: "OPERATION: CENTROID-LOCK",
    title: "Find the Stable Clustering",
    briefing:
      "Track centroid displacement across assignment iterations. Mark the iteration where cluster reassignment ceases and total inertia stops decreasing.",
    targetSymptom: "Zero point reassignments between consecutive Voronoi partitions.",
    investigationSignals: ["Centroid Displacement = 0", "Inertia Delta < ε", "Point Assignment Static"],
    difficulty: "Beginner",
  },
  {
    id: "neural-learning-slowdown",
    href: "/challenges/neural-learning-slowdown",
    algorithm: "Neural Network",
    tag: "Backprop Plateau",
    codeName: "OPERATION: SADDLE-POINT",
    title: "Find Neural Learning Slowdown",
    briefing:
      "Inspect multi-layer backpropagation loss curves and pinpoint the onset of an optimization plateau or saddle point during non-linear fitting.",
    targetSymptom: "Hidden layer Jacobian magnitudes shrink, stalling probability boundary curvature.",
    investigationSignals: ["Layer Weight Norm Saturation", "Backprop Gradient Vanishing", "Decision Surface Freeze"],
    difficulty: "Intermediate",
  },
];

const workflowSteps = [
  { step: "01", name: "OBSERVE", detail: "Examine anomalous training run" },
  { step: "02", name: "SCRUB", detail: "Timeline frame-by-frame traversal" },
  { step: "03", name: "FIND SIGNAL", detail: "Detect diagnostic trigger or spike" },
  { step: "04", name: "MARK FRAME", detail: "Anchor frame marker on scrubber" },
  { step: "05", name: "EXPLAIN", detail: "Validate underlying mathematics" },
  { step: "06", name: "SOLVED", detail: "Earn tactical diagnostic mastery" },
];

export default function ChallengesPage() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "available" | "solved">("all");

  useEffect(() => {
    const update = () => {
      const act = readLearningActivity();
      setCompletedIds(act.challengesCompleted || []);
    };
    update();
    window.addEventListener("mlingo-activity-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("mlingo-activity-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const solvedCount = missions.filter((m) => completedIds.includes(m.id)).length;
  const filteredMissions = missions.filter((m) => {
    const isSolved = completedIds.includes(m.id);
    if (filter === "solved") return isSolved;
    if (filter === "available") return !isSolved;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-10 py-2">
        {/* Header Briefing */}
        <header className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            Break Mode Tactical Missions
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Investigation Missions
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            In standard machine learning courses, you only see models succeed. In MLingo Investigation Missions, you deliberately observe, diagnose, and isolate where mathematical training fails. Find the exact frames where gradients explode, plateaus form, and boundaries stall.
          </p>

          {/* Tactical Stats Banner */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 shadow-2xs text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Missions Solved:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                {solvedCount} / {missions.length}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 shadow-2xs text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Diagnostic Coverage:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                4 Algorithms
              </span>
            </div>
          </div>
        </header>

        {/* Workflow Strip: OBSERVE -> SCRUB -> FIND SIGNAL -> MARK FRAME -> EXPLAIN -> SOLVED */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Investigation Protocol
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {workflowSteps.map((wf, idx) => (
              <div
                key={wf.step}
                className="relative rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                    {wf.step}
                  </span>
                  {idx < workflowSteps.length - 1 && (
                    <span className="hidden lg:block text-slate-300 dark:text-slate-700 text-xs">→</span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {wf.name}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {wf.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Missions ({missions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("available")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === "available"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Available ({missions.length - solvedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("solved")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                filter === "solved"
                  ? "bg-teal-600 text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Solved ({solvedCount})
            </button>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
            Showing {filteredMissions.length} missions
          </span>
        </div>

        {/* Missions Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredMissions.map((mission) => {
            const isSolved = completedIds.includes(mission.id);

            return (
              <Link
                key={mission.id}
                href={mission.href}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 shadow-xs hover:shadow-md ${
                  isSolved
                    ? "border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500/50"
                }`}
              >
                <div className="space-y-4">
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                        {mission.codeName}
                      </span>
                      <span className="rounded bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:text-teal-300">
                        {mission.algorithm}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          mission.difficulty === "Beginner"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                        }`}
                      >
                        {mission.difficulty}
                      </span>
                      {isSolved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ✓ Solved
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Briefing */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      {mission.tag}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {mission.title}
                    </h2>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {mission.briefing}
                    </p>
                  </div>

                  {/* Failure Symptom to Detect */}
                  <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      Target Failure Symptom
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                      {mission.targetSymptom}
                    </p>
                  </div>

                  {/* Investigation Signals to Watch */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                      Signals to Monitor:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mission.investigationSignals.map((signal) => (
                        <span
                          key={signal}
                          className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <span
                    className={
                      isSolved
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-teal-600 dark:text-teal-400"
                    }
                  >
                    {isSolved ? "Re-investigate Mission" : "Launch Mission Investigation"}
                  </span>
                  <span className="inline-block transition-transform group-hover:translate-x-1 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
