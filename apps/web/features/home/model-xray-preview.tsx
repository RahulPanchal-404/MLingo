"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HERO_TRAINING_FRAMES,
  type HeroTrainingFrame,
} from "./hero-training-math";

const INSPECTION_STEPS = [0, 8, 24, 40] as const;

export function ModelXRayPreview() {
  const [activeStep, setActiveStep] = useState<number>(24);

  const currentFrame: HeroTrainingFrame =
    HERO_TRAINING_FRAMES[activeStep] ?? HERO_TRAINING_FRAMES[0];
  const prevFrame: HeroTrainingFrame | null =
    activeStep > 0 ? HERO_TRAINING_FRAMES[activeStep - 1] ?? null : null;

  const deltaW = prevFrame
    ? Number((currentFrame.weight - prevFrame.weight).toFixed(3))
    : 0;
  const deltaB = prevFrame
    ? Number((currentFrame.bias - prevFrame.bias).toFixed(3))
    : 0;
  const deltaLoss = prevFrame
    ? Number((currentFrame.loss - prevFrame.loss).toFixed(3))
    : 0;

  return (
    <section className="space-y-6" aria-labelledby="xray-preview-heading">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700">
            <span>03 // DEEP INSPECTION</span>
          </div>
          <h2
            id="xray-preview-heading"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950"
          >
            Model X-Ray: Inspect why the model learned
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Instead of seeing only the final score, Model X-Ray reveals the exact parameter deltas,
            gradient norms, and internal calculations at every snapshot.
          </p>
        </div>

        <Link
          href="/workbench"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-teal-700 hover:text-teal-900 transition-colors shrink-0"
        >
          <span>Open Data Workbench →</span>
        </Link>
      </div>

      {/* Model X-Ray Container (Dark Slate Developer Aesthetic) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
        {/* Top Header & Step Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-300">
              MODEL X-RAY // INTERNAL STATE INSPECTOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">
              SELECT FRAME:
            </span>
            {INSPECTION_STEPS.map((s) => (
              <button
                key={s}
                onClick={() => setActiveStep(s)}
                className={`rounded-lg px-3 py-1 font-mono text-xs font-semibold transition-all cursor-pointer ${
                  activeStep === s
                    ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                Step {s}
              </button>
            ))}
          </div>
        </div>

        {/* Big State Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              ACTIVE FRAME
            </span>
            <h3 className="text-xl font-mono font-bold text-white">
              STEP {currentFrame.step} — {currentFrame.phaseLabel}
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">FRAME LOSS</span>
              <span className="text-amber-400 font-bold text-sm">
                {currentFrame.loss.toFixed(3)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Δ LOSS VS PREV</span>
              <span className="text-teal-400 font-bold text-sm">
                {deltaLoss <= 0 ? deltaLoss.toFixed(3) : `+${deltaLoss.toFixed(3)}`}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Inspection Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Model Parameters */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 border-b border-slate-800 pb-2">
              <span className="font-bold">1. PARAMETERS</span>
              <span className="text-[10px] text-slate-400">y = wx + b</span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">WEIGHT (w)</span>
                  <span className="text-base font-bold text-white">
                    {currentFrame.weight.toFixed(3)}
                  </span>
                </div>
                <span className="text-xs text-teal-400 font-semibold">
                  Δ {deltaW >= 0 ? `+${deltaW.toFixed(3)}` : deltaW.toFixed(3)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">BIAS (b)</span>
                  <span className="text-base font-bold text-white">
                    {currentFrame.bias.toFixed(3)}
                  </span>
                </div>
                <span className="text-xs text-teal-400 font-semibold">
                  Δ {deltaB >= 0 ? `+${deltaB.toFixed(3)}` : deltaB.toFixed(3)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
              Parameters are adjusted along the negative gradient direction scaled by learning rate
              α = 0.05.
            </p>
          </div>

          {/* Column 2: Gradients */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 border-b border-slate-800 pb-2">
              <span className="font-bold">2. GRADIENTS (∂L/∂θ)</span>
              <span className="text-[10px] text-slate-400">Calculus Chain Rule</span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">WEIGHT GRADIENT</span>
                  <span className="text-base font-bold text-amber-300">
                    {currentFrame.weightGradient.toFixed(3)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">∂L/∂w</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">BIAS GRADIENT</span>
                  <span className="text-base font-bold text-amber-300">
                    {currentFrame.biasGradient.toFixed(3)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">∂L/∂b</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span className="text-[10px] text-slate-400 uppercase">Gradient Norm ||∇||</span>
                <span className="text-sm font-bold text-teal-400">
                  {currentFrame.gradientNorm.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Predictions & Error Landscape */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-teal-400 border-b border-slate-800 pb-2">
              <span className="font-bold">3. OUTPUT PREDICTION</span>
              <span className="text-[10px] text-slate-400">Test Feature x = 1.0</span>
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">PREDICTED VALUE ŷ</span>
                <span className="text-2xl font-bold text-indigo-300">
                  {currentFrame.predictionAtOne.toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">GROUND TRUTH VALUE y</span>
                <span className="text-sm font-bold text-slate-400">3.05 (Error = {(Math.abs(3.05 - currentFrame.predictionAtOne)).toFixed(2)})</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
              As weight approaches 2.0 and bias approaches 1.0, prediction error shrinks to zero.
            </p>
          </div>
        </div>

        {/* X-Ray Pedagogical Summary Banner */}
        <div className="rounded-xl border border-teal-500/30 bg-teal-950/40 p-4 font-mono text-xs text-teal-200 flex items-start gap-3">
          <span className="text-base text-teal-400">🔬</span>
          <div>
            <strong className="text-white block mb-0.5">
              X-RAY TAKEAWAY FOR STEP {currentFrame.step}:
            </strong>
            <span>
              {currentFrame.step === 0 &&
                "Initial Step: Gradients are at maximum magnitude because predictions are far from the data. The first update will trigger the largest step size."}
              {currentFrame.step === 8 &&
                "Descent in Action: The gradient norm has decreased by 55%, visibly rotating the fitted line to match the slope of the dataset."}
              {currentFrame.step === 24 &&
                "Fine Tuning: The gradient norm is now down to 0.048. Parameter deltas are small and graceful as the model zeroes in on optimal values."}
              {currentFrame.step === 40 &&
                "Convergence: The gradient norm has flattened to 0.012. The model has arrived at the global minimum of the loss surface."}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
