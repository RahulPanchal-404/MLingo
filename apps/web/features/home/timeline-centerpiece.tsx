"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HERO_MILESTONES,
  HERO_TRAINING_FRAMES,
  type HeroTrainingFrame,
} from "./hero-training-math";

export function TimelineCenterpiece() {
  const [selectedStep, setSelectedStep] = useState(24);
  const totalSteps = HERO_TRAINING_FRAMES.length - 1;
  const frame: HeroTrainingFrame = HERO_TRAINING_FRAMES[selectedStep] ?? HERO_TRAINING_FRAMES[0];

  // SVG dimensions for the centerpiece loss curve
  const width = 640;
  const height = 220;
  const padX = 36;
  const padY = 24;

  const toX = (stepIndex: number) =>
    padX + (stepIndex / totalSteps) * (width - padX * 2);
  const toY = (lossValue: number) =>
    height - padY - (lossValue / 2.0) * (height - padY * 2);

  const lossPoints = HERO_TRAINING_FRAMES.map(
    (f, idx) => `${toX(idx).toFixed(1)},${toY(f.loss).toFixed(1)}`
  ).join(" ");

  const areaPoints = `${toX(0).toFixed(1)},${height - padY} ${lossPoints} ${toX(
    totalSteps
  ).toFixed(1)},${height - padY}`;

  const playheadX = toX(selectedStep);
  const playheadY = toY(frame.loss);

  // Dynamic explanation based on the selected step
  let physicalInsight = "";
  if (selectedStep <= 5) {
    physicalInsight =
      "Initial State: Weights start at 0.00. Errors across the entire dataset are at their peak, producing maximum gradient vectors that force large parameter jumps.";
  } else if (selectedStep <= 18) {
    physicalInsight =
      "Rapid Descent Phase: High gradient norm drives steep loss reduction. The regression line rotates quickly toward the bulk of data points.";
  } else if (selectedStep <= 32) {
    physicalInsight =
      "Curvature Deceleration: The error surface begins to level out. Step sizes decay naturally because gradients are proportional to remaining prediction errors.";
  } else {
    physicalInsight =
      "Asymptotic Convergence: Gradients approach zero (||∇|| < 0.02). Parameters settle at the global minimum (w ≈ 1.98, b ≈ 0.98), completing training.";
  }

  return (
    <section className="space-y-6" aria-labelledby="timeline-centerpiece-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-500/30 px-3 py-0.5 text-xs font-mono font-semibold text-teal-800 dark:text-teal-300">
            <span>02 // THE CENTERPIECE INTERFACE</span>
          </div>
          <h2
            id="timeline-centerpiece-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
          >
            The Synchronized Training Timeline
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Every training run produces an interactive timeline. As you scrub from frame to frame,
            loss, weights, gradients, and model predictions update in lockstep.
          </p>
        </div>

        <Link
          href="/labs/gradient-descent"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 transition-colors shrink-0"
        >
          <span>Open Full Gradient Descent Lab →</span>
        </Link>
      </div>

      {/* Main Timeline Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Control Bar: Active Step Indicator and Milestone Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              SYNCHRONIZED STATE
            </span>
            <span className="rounded-md bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-700 px-2.5 py-1 font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
              FRAME {String(selectedStep).padStart(2, "0")} OF {totalSteps}
            </span>
          </div>

          {/* Quick Milestone Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {HERO_MILESTONES.map((m) => (
              <button
                key={m.step}
                onClick={() => setSelectedStep(m.step)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-all cursor-pointer ${
                  selectedStep === m.step
                    ? "bg-teal-700 dark:bg-teal-600 text-white font-bold shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <span>{m.label}</span>
                <span className="ml-1 opacity-70">s{m.step}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Large Loss Curve SVG with Interactive Click-to-Step */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>TRAINING LOSS CURVE (MSE)</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold">Click curve to jump to any frame</span>
          </div>

          <div
            className="relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 sm:p-4 cursor-crosshair select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, (x - padX) / (rect.width - padX * 2)));
              setSelectedStep(Math.round(ratio * totalSteps));
            }}
          >
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[220px]"
              role="img"
              aria-label="Synchronized loss descent trajectory curve"
            >
              <defs>
                <linearGradient id="centerpiece-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-primary, #0f766e)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--chart-primary, #0f766e)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padX} y1={height / 2} x2={width - padX} y2={height / 2} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

              {/* Area under curve */}
              <polygon fill="url(#centerpiece-gradient)" points={areaPoints} />

              {/* Loss Curve */}
              <polyline fill="none" stroke="var(--chart-primary, #0f766e)" strokeWidth="3" points={lossPoints} strokeLinecap="round" />

              {/* Milestone Markers as pins */}
              {HERO_MILESTONES.map((m) => {
                const mx = toX(m.step);
                const frameAtM = HERO_TRAINING_FRAMES[m.step];
                const my = toY(frameAtM ? frameAtM.loss : 0);
                return (
                  <g key={m.step} className="opacity-90">
                    <circle cx={mx} cy={my} r="4" fill="var(--surface, #ffffff)" stroke="var(--accent, #0f766e)" strokeWidth="1.5" />
                    <text x={mx} y={my - 8} textAnchor="middle" fill="currentColor" className="text-slate-600 dark:text-slate-400 font-medium" fontSize="9" fontFamily="monospace">
                      s{m.step}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Playhead Cursor Line */}
              <line
                x1={playheadX}
                y1={padY}
                x2={playheadX}
                y2={height - padY}
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Active Dot on Curve */}
              <circle
                cx={playheadX}
                cy={playheadY}
                r="6"
                fill="#d97706"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Scrubber Range Slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>STEP SLIDER</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">Step {selectedStep} / {totalSteps}</span>
          </div>
          <input
            type="range"
            min={0}
            max={totalSteps}
            value={selectedStep}
            onChange={(e) => setSelectedStep(Number(e.target.value))}
            className="w-full accent-teal-700 dark:accent-teal-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
            aria-label="Training timeline frame slider"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span>Step 0 (Init)</span>
            <span>Step 20 (Midpoint)</span>
            <span>Step 40 (Convergence)</span>
          </div>
        </div>

        {/* Synchronized Metrics Barometer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Loss (MSE)
            </span>
            <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
              {frame.loss.toFixed(3)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Weight (w)
            </span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {frame.weight.toFixed(3)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Bias (b)
            </span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
              {frame.bias.toFixed(3)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Weight Grad (∂L/∂w)
            </span>
            <span className="text-lg font-mono font-bold text-teal-700 dark:text-teal-400 block mt-0.5">
              {frame.weightGradient.toFixed(3)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Bias Grad (∂L/∂b)
            </span>
            <span className="text-lg font-mono font-bold text-teal-700 dark:text-teal-400 block mt-0.5">
              {frame.biasGradient.toFixed(3)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Pred @ x=1.0
            </span>
            <span className="text-lg font-mono font-bold text-indigo-700 dark:text-indigo-400 block mt-0.5">
              {frame.predictionAtOne.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mathematical Intuition Callout */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-teal-950/40 p-4 flex items-start gap-3">
          <span className="text-lg">💡</span>
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              WHAT HAPPENS AT FRAME {selectedStep} ({frame.phaseLabel}):
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{physicalInsight}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
