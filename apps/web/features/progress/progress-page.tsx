"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readLearningActivity, type LearningActivity } from "@/features/progress/activity";

const defaultActivity: LearningActivity = {
  labsExplored: 0,
  experimentsRun: 0,
  challengesCompleted: [],
  concepts: [],
  projectsCompleted: 0,
  projectsInProgress: 0,
  workbenchExplored: 0,
  sweepsCompleted: 0,
  experimentsSaved: 0,
  experimentsReplayed: 0,
};

type ConceptNode = {
  name: string;
  category: "Optimization & Training" | "Data & Preprocessing" | "Model Architectures";
  description: string;
};

const CURRICULUM_CONCEPTS: ConceptNode[] = [
  // Optimization & Training
  { name: "Gradient Descent", category: "Optimization & Training", description: "Iterative parameter optimization using negative gradient vectors." },
  { name: "Loss Curves", category: "Optimization & Training", description: "Convex error surfaces tracked across sequential training epochs." },
  { name: "Learning Rate (Alpha)", category: "Optimization & Training", description: "Hyperparameter governing weight update magnitude." },
  { name: "Plateau Detection", category: "Optimization & Training", description: "Recognizing vanishing loss deltas and learning rate stagnation." },
  { name: "Instability & Divergence", category: "Optimization & Training", description: "Oscillatory error explosion caused by excessive step sizes." },
  // Data & Preprocessing
  { name: "Feature Normalization", category: "Data & Preprocessing", description: "Scaling inputs to ensure uniform gradient descent convergence." },
  { name: "Train/Test Split", category: "Data & Preprocessing", description: "Partitioning datasets to validate generalization capability." },
  { name: "Noise & Residuals", category: "Data & Preprocessing", description: "Stochastic data variance and unmodeled deviation analysis." },
  { name: "Centroid Inertia", category: "Data & Preprocessing", description: "Within-cluster sum of squares minimization metric." },
  // Model Architectures
  { name: "Linear Hypothesis", category: "Model Architectures", description: "Continuous scalar prediction via slope and intercept formulation." },
  { name: "Sigmoid Probability Boundary", category: "Model Architectures", description: "Logistic function mapping logits to calibrated probabilities." },
  { name: "K-Means Clustering", category: "Model Architectures", description: "Unsupervised iterative assignment to K nearest centers of mass." },
  { name: "Backpropagation", category: "Model Architectures", description: "Multi-layer chain-rule gradient calculus through hidden activations." },
  { name: "Hidden Layer Activations", category: "Model Architectures", description: "Non-linear manifold transformation via Tanh and ReLU functions." },
];

export function ProgressPage() {
  const [activity, setActivity] = useState<LearningActivity>(defaultActivity);

  useEffect(() => {
    const update = () => setActivity(readLearningActivity());
    update();
    window.addEventListener("mlingo-activity-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("mlingo-activity-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // Compute learner rank/tier
  const totalScore =
    (activity.labsExplored || 0) * 15 +
    (activity.challengesCompleted?.length || 0) * 25 +
    (activity.projectsCompleted || 0) * 50 +
    (activity.experimentsRun || 0) * 5;

  let learnerLevel = "ML Apprentice";
  let learnerTier = "Level 1";
  if (totalScore > 200) {
    learnerLevel = "Applied ML Practitioner";
    learnerTier = "Level 4";
  } else if (totalScore > 100) {
    learnerLevel = "Diagnostic Investigator";
    learnerTier = "Level 3";
  } else if (totalScore > 40) {
    learnerLevel = "Lab Explorer";
    learnerTier = "Level 2";
  }

  // Derive dynamic recommendation
  let recommendation = {
    title: "Explore the Gradient Descent Lab",
    description: "Start by recording your first linear regression run and scrub through weight updates frame by frame.",
    href: "/labs/gradient-descent",
    action: "Launch Lab 01 →",
  };

  if (activity.labsExplored === 0) {
    recommendation = {
      title: "Start in Laboratory 01",
      description: "Record your first live gradient descent optimization run and scrub through frame-by-frame parameter adjustments.",
      href: "/labs/gradient-descent",
      action: "Enter Gradient Descent Lab →",
    };
  } else if ((activity.challengesCompleted?.length || 0) === 0) {
    recommendation = {
      title: "Tackle Your First Investigation Mission",
      description: "Put your diagnostic intuition to the test: induce gradient descent instability and mark the exact breakdown frame.",
      href: "/challenges/gradient-descent-instability",
      action: "Start Operation: Bounceback →",
    };
  } else if ((activity.projectsCompleted || 0) === 0) {
    recommendation = {
      title: "Build in Project Studio",
      description: "Apply your frame-by-frame intuition to an end-to-end guided engineering project with verifiable milestones.",
      href: "/projects",
      action: "Open Project Studio →",
    };
  } else {
    recommendation = {
      title: "Run Deep Hyperparameter Sweeps",
      description: "Systematically explore learning rate dynamics, compare multiple runs, and inspect Model X-Ray matrices.",
      href: "/experiments",
      action: "Explore Parameter Sweeps →",
    };
  }

  // Group concepts by category
  const categories = ["Optimization & Training", "Data & Preprocessing", "Model Architectures"] as const;

  return (
    <div className="space-y-10 py-2">
      {/* Journey Header */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                {learnerTier}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {learnerLevel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Your Machine Learning Journey
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Every frame you scrub, gradient you inspect, and failure mode you diagnose is saved locally in this browser workspace.
            </p>
          </div>

          <Link
            href="/learn"
            className="self-start sm:self-center shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-500 transition-colors"
          >
            Open Learning Curriculum →
          </Link>
        </div>

        {/* 4 Core Milestones Progress Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          {/* Labs Explored */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Labs Explored
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                {activity.labsExplored}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 4</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-teal-600 dark:bg-teal-400 transition-all duration-300"
                style={{ width: `${Math.min(100, ((activity.labsExplored || 0) / 4) * 100)}%` }}
              />
            </div>
          </div>

          {/* Missions Solved */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Missions Solved
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {activity.challengesCompleted?.length || 0}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 6</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (((activity.challengesCompleted?.length || 0)) / 6) * 100)}%` }}
              />
            </div>
          </div>

          {/* Projects Completed */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Capstone Projects
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {activity.projectsCompleted ?? 0}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 3</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${Math.min(100, (((activity.projectsCompleted ?? 0)) / 3) * 100)}%` }}
              />
            </div>
          </div>

          {/* Experiments & Sweeps */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Experiments Run
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {activity.experimentsRun || 0}
              </span>
              <span className="text-xs text-slate-500 font-mono">runs</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(100, ((activity.experimentsRun || 0) / 10) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Next Recommended Learning Step */}
      <section className="rounded-2xl border border-teal-500/30 dark:border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-slate-50/50 to-indigo-500/10 dark:from-teal-950/30 dark:via-slate-900/40 dark:to-indigo-950/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
            <span>🎯</span>
            <span>Recommended Next Action</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {recommendation.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            {recommendation.description}
          </p>
        </div>

        <Link
          href={recommendation.href}
          className="shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-500 transition-colors self-start sm:self-center"
        >
          {recommendation.action}
        </Link>
      </section>

      {/* Visual Concept Relationship Tree */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Concept Mastery Tree
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Machine Learning Concepts Practiced
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Concepts illuminated in green have been directly exercised in your recorded training runs, Model X-Ray inspections, or challenge diagnoses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const catConcepts = CURRICULUM_CONCEPTS.filter((c) => c.category === cat);
            const activeConceptsInCat = catConcepts.filter((c) =>
              activity.concepts.some((ac) => ac.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(ac.toLowerCase()))
            );

            return (
              <div
                key={cat}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {cat}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500 font-semibold">
                    {activeConceptsInCat.length}/{catConcepts.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {catConcepts.map((concept) => {
                    const isMastered = activity.concepts.some(
                      (ac) =>
                        ac.toLowerCase().includes(concept.name.toLowerCase()) ||
                        concept.name.toLowerCase().includes(ac.toLowerCase())
                    );

                    return (
                      <div
                        key={concept.name}
                        className={`rounded-lg p-2.5 transition-all text-xs ${
                          isMastered
                            ? "border border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/40 dark:border-teal-800/80"
                            : "border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isMastered ? "text-teal-900 dark:text-teal-200" : "text-slate-700 dark:text-slate-300"}`}>
                            {concept.name}
                          </span>
                          {isMastered ? (
                            <span className="text-[10px] font-bold font-mono text-teal-600 dark:text-teal-400">
                              ✓ Practiced
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-slate-400">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {concept.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Continue Learning Fast Links */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Fast Learning Shortcuts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/projects"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all space-y-1"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🏗️</span>
              <span>Project Studio</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Build end-to-end ML solutions with milestone checklists.
            </p>
          </Link>

          <Link
            href="/labs"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all space-y-1"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🔬</span>
              <span>ML Laboratories</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Scrub frame-by-frame optimization across 4 core algorithms.
            </p>
          </Link>

          <Link
            href="/workbench"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all space-y-1"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>📊</span>
              <span>Data Workbench</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Inspect distributions, correlations, and feature transformations.
            </p>
          </Link>

          <Link
            href="/challenges"
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all space-y-1"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Investigation Missions</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Isolate failure modes and mark exact breakdown frames.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}