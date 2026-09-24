"use client";

import { useState } from "react";
import Link from "next/link";

interface LearningStepItem {
  id: string;
  stepNumber: string;
  action: string;
  icon: string;
  shortLabel: string;
  summary: string;
  whatYouObserve: string;
  featureName: string;
  featureHref: string;
}

const LEARNING_STEPS: LearningStepItem[] = [
  {
    id: "learn",
    stepNumber: "01",
    action: "LEARN",
    icon: "📖",
    shortLabel: "Understand intuition",
    summary: "Establish strong mental models before touching code. Explore physical analogies, mathematical formulas, and active prediction checks.",
    whatYouObserve: "How datasets map inputs X to labels y, and how cost functions define the optimization landscape.",
    featureName: "Foundations Curriculum",
    featureHref: "/learn",
  },
  {
    id: "run",
    stepNumber: "02",
    action: "RUN",
    icon: "▶️",
    shortLabel: "Train a real model",
    summary: "Execute authentic gradient descent, logistic regression, or clustering algorithms with real mathematical steps.",
    whatYouObserve: "Live telemetry recording parameter updates across every single epoch without pre-baked animations.",
    featureName: "Interactive Labs",
    featureHref: "/labs",
  },
  {
    id: "scrub",
    stepNumber: "03",
    action: "SCRUB",
    icon: "⏱️",
    shortLabel: "Frame-by-frame scrub",
    summary: "Slow down time. Move forward and backward across the training timeline just like an editor scrubbing video.",
    whatYouObserve: "The synchronized transition of loss curves, decision boundaries, and parameter vectors.",
    featureName: "Training Timeline",
    featureHref: "/demo",
  },
  {
    id: "inspect",
    stepNumber: "04",
    action: "INSPECT",
    icon: "🔬",
    shortLabel: "Audit model internals",
    summary: "Open Model X-Ray to peer directly into weights, biases, activations, and gradient norms at any training frame.",
    whatYouObserve: "The mathematical reasons why a specific parameter moved up or down during that iteration.",
    featureName: "Model X-Ray",
    featureHref: "/workbench",
  },
  {
    id: "break",
    stepNumber: "05",
    action: "BREAK",
    icon: "⚡",
    shortLabel: "Induce failure modes",
    summary: "Great engineers learn through failure. Intentionally destabilize learning rates, centroid seeds, or thresholds.",
    whatYouObserve: "Exploding loss, numerical divergence, local minima traps, and gradient vanishing.",
    featureName: "Break Mode Challenges",
    featureHref: "/challenges",
  },
  {
    id: "compare",
    stepNumber: "06",
    action: "COMPARE",
    icon: "⚖️",
    shortLabel: "Side-by-side runs",
    summary: "Lock Run A and Run B side-by-side to isolate the exact hyperparameter that caused divergent behavior.",
    whatYouObserve: "How learning rate α = 0.05 yields stable convergence while α = 0.35 oscillates out of control.",
    featureName: "Experiment Explorer",
    featureHref: "/experiments",
  },
  {
    id: "understand",
    stepNumber: "07",
    action: "UNDERSTAND",
    icon: "💡",
    shortLabel: "Connect code to math",
    summary: "Switch between Math Mode, Code Mode, and AI Tutor explanations grounded in live telemetry.",
    whatYouObserve: "How calculus chain-rule gradients in LaTeX correspond directly to NumPy matrix operations.",
    featureName: "Math & Code Modes",
    featureHref: "/labs/gradient-descent",
  },
  {
    id: "build",
    stepNumber: "08",
    action: "BUILD",
    icon: "🚀",
    shortLabel: "Apply in projects",
    summary: "Graduate from isolated experiments to guided, end-to-end data science projects and portfolio case studies.",
    whatYouObserve: "Real business metrics: Salary Prediction, Student Outcomes, and Retail Customer Segmentation.",
    featureName: "Project Studio",
    featureHref: "/projects",
  },
];

export function LearningLoopInteractive() {
  const [selectedStepIndex, setSelectedStepIndex] = useState(2); // Default to SCRUB
  const activeStep = LEARNING_STEPS[selectedStepIndex] ?? LEARNING_STEPS[0];

  return (
    <section className="space-y-6" aria-labelledby="learning-loop-heading">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
          <span>04 // THE CORE PEDAGOGY</span>
        </div>
        <h2
          id="learning-loop-heading"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
        >
          The 8-Step MLingo Learning Loop
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Understanding machine learning requires more than watching terminal code execute.
          MLingo structures comprehension into 8 interconnected, tactile actions.
        </p>
      </div>

      {/* Step Buttons Grid / Sequence Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {LEARNING_STEPS.map((item, idx) => {
          const isSelected = idx === selectedStepIndex;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedStepIndex(idx)}
              onMouseEnter={() => setSelectedStepIndex(idx)}
              className={`rounded-2xl border p-3.5 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                isSelected
                  ? "border-teal-700 bg-teal-800 dark:border-teal-600 dark:bg-teal-900 text-white shadow-md scale-[1.02]"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-100"
              }`}
            >
              <div className="flex items-center justify-between text-xs w-full">
                <span className="text-base">{item.icon}</span>
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isSelected ? "text-teal-200 dark:text-teal-300" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {item.stepNumber}
                </span>
              </div>

              <div>
                <span
                  className={`font-mono text-xs font-bold block ${
                    isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {item.action}
                </span>
                <span
                  className={`text-[10px] block leading-tight mt-0.5 truncate ${
                    isSelected ? "text-teal-100 dark:text-teal-200" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {item.shortLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Showcase Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6 sm:p-8 text-slate-900 dark:text-white shadow-xs dark:shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeStep.icon}</span>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-500/40 px-2 py-0.5 font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                STEP {activeStep.stepNumber}
              </span>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {activeStep.action} — {activeStep.shortLabel}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeStep.summary}
          </p>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-3.5 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-400 block font-semibold">
              WHAT YOU OBSERVE INSIDE THE MODEL:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              {activeStep.whatYouObserve}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:items-start md:items-end justify-center space-y-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            CONNECTED PLATFORM SURFACE:
          </span>
          <span className="text-sm font-mono font-bold text-teal-800 dark:text-teal-300">
            {activeStep.featureName}
          </span>
          <Link
            href={activeStep.featureHref}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-2.5 text-xs font-mono font-bold text-white transition-colors shadow-xs mt-1 cursor-pointer"
          >
            <span>Launch {activeStep.action} →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
