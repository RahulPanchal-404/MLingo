"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HERO_DATASET_POINTS,
  HERO_MILESTONES,
  HERO_TRAINING_FRAMES,
  type HeroTrainingFrame,
} from "./hero-training-math";

export function HeroInteractiveTimeline() {
  const [currentStep, setCurrentStep] = useState(14);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const totalSteps = HERO_TRAINING_FRAMES.length - 1;
  const frame: HeroTrainingFrame = HERO_TRAINING_FRAMES[currentStep] ?? HERO_TRAINING_FRAMES[0];

  // Auto-advance playhead when playing and not being manually scrubbed
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!isPlaying || isHovering) return;

    const interval = window.setInterval(() => {
      setCurrentStep((prev) => (prev >= totalSteps ? 0 : prev + 1));
    }, 450);

    return () => window.clearInterval(interval);
  }, [isPlaying, isHovering, totalSteps]);

  // Scrub handler based on track coordinate
  const handleScrubFromX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = relativeX / rect.width;
      const targetStep = Math.round(percentage * totalSteps);
      setCurrentStep(Math.max(0, Math.min(totalSteps, targetStep)));
    },
    [totalSteps]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    setIsPlaying(false);
    handleScrubFromX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      handleScrubFromX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // SVG coordinate helpers for Regression Plot
  // Domain: x in [-1.6, 1.6], y in [-2.5, 4.5]
  const plotWidth = 320;
  const plotHeight = 160;
  const padX = 24;
  const padY = 20;

  const toPlotX = (x: number) =>
    padX + ((x - -1.6) / (1.6 - -1.6)) * (plotWidth - padX * 2);
  const toPlotY = (y: number) =>
    plotHeight - padY - ((y - -2.5) / (4.5 - -2.5)) * (plotHeight - padY * 2);

  // Line coordinates from x = -1.6 to 1.6
  const lineY0 = frame.weight * -1.6 + frame.bias;
  const lineY1 = frame.weight * 1.6 + frame.bias;

  // SVG coordinates for Loss Curve
  // Loss range: [0, 2.0], steps in [0, 40]
  const lossPoints = HERO_TRAINING_FRAMES.map((f, idx) => {
    const x = padX + (idx / totalSteps) * (plotWidth - padX * 2);
    const y = plotHeight - padY - (f.loss / 2.0) * (plotHeight - padY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const playheadX = padX + (currentStep / totalSteps) * (plotWidth - padX * 2);
  const playheadY = plotHeight - padY - (frame.loss / 2.0) * (plotHeight - padY * 2);

  return (
    <div
      className="relative rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950 p-4 sm:p-6 shadow-xl dark:shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="region"
      aria-label="Interactive Training Timeline Demonstration"
    >
      {/* Background technical grid and subtle ambient radial glow */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e133_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e133_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Header bar: Live Status & Playhead Control */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-500/30 px-3 py-1 text-[11px] font-mono font-semibold text-teal-800 dark:text-teal-300">
            <span
              className={`h-2 w-2 rounded-full ${isPlaying ? "bg-teal-600 dark:bg-teal-400 animate-pulse" : "bg-amber-500 dark:bg-amber-400"}`}
            />
            <span>{isPlaying ? "LIVE PLAYHEAD" : "MANUAL SCRUB"}</span>
          </div>
          <span className="hidden sm:inline font-mono text-xs text-slate-500 dark:text-slate-400">
            RECORDED RUN #01 // LINEAR REGRESSION
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/90 px-3 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label={isPlaying ? "Pause timeline auto-play" : "Start timeline auto-play"}
          >
            <span>{isPlaying ? "❚❚ Pause" : "▶ Play"}</span>
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset to step 0"
            aria-label="Reset to step 0"
          >
            <span className="text-xs px-1.5 font-mono">↺</span>
          </button>
          <div className="rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1 font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
            STEP {String(currentStep).padStart(2, "0")}/{totalSteps}
          </div>
        </div>
      </div>

      {/* Main Visualizer Deck: Dual SVG panels */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* Panel 1: Regression Fit */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200/80 dark:border-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-300">1. MODEL FIT SURFACE</span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">
              y = {frame.weight.toFixed(2)}x + {frame.bias.toFixed(2)}
            </span>
          </div>

          <div className="relative py-2 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${plotWidth} ${plotHeight}`}
              className="w-full h-auto max-h-[160px] select-none"
              role="img"
              aria-label="Interactive scatter plot with dynamic fitted line"
            >
              {/* Axes */}
              <line
                x1={padX}
                y1={toPlotY(0)}
                x2={plotWidth - padX}
                y2={toPlotY(0)}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <line
                x1={toPlotX(0)}
                y1={padY}
                x2={toPlotX(0)}
                y2={plotHeight - padY}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Data points */}
              {HERO_DATASET_POINTS.map((pt, i) => (
                <circle
                  key={i}
                  cx={toPlotX(pt.x)}
                  cy={toPlotY(pt.y)}
                  r="3.5"
                  className="fill-sky-600 dark:fill-sky-400"
                  opacity="0.85"
                />
              ))}

              {/* Dynamic Regression Line */}
              <line
                x1={toPlotX(-1.6)}
                y1={toPlotY(lineY0)}
                x2={toPlotX(1.6)}
                y2={toPlotY(lineY1)}
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800/50">
            <span>Points: Fixed dataset (N=32)</span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold">Line: State @ step {currentStep}</span>
          </div>
        </div>

        {/* Panel 2: Loss Curve Descent */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200/80 dark:border-slate-800/50">
            <span className="font-semibold text-slate-700 dark:text-slate-300">2. LOSS TRAJECTORY</span>
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
              MSE = {frame.loss.toFixed(3)}
            </span>
          </div>

          <div className="relative py-2 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${plotWidth} ${plotHeight}`}
              className="w-full h-auto max-h-[160px] select-none"
              role="img"
              aria-label="Loss trajectory curve with active vertical playhead marker"
            >
              {/* Baseline axis */}
              <line
                x1={padX}
                y1={plotHeight - padY}
                x2={plotWidth - padX}
                y2={plotHeight - padY}
                stroke="currentColor"
                className="text-slate-300 dark:text-slate-700"
                strokeWidth="1"
              />

              {/* Full loss curve */}
              <polyline
                fill="none"
                className="stroke-teal-600 dark:stroke-teal-400"
                strokeWidth="2.5"
                points={lossPoints}
              />

              {/* Vertical Playhead Line */}
              <line
                x1={playheadX}
                y1={padY}
                x2={playheadX}
                y2={plotHeight - padY}
                className="stroke-amber-600 dark:stroke-amber-400"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />

              {/* Active Dot on Curve */}
              <circle
                cx={playheadX}
                cy={playheadY}
                r="5"
                className="fill-amber-600 dark:fill-amber-400 stroke-white"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-800/50">
            <span>Min Loss: 0.042</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold">{frame.phaseLabel}</span>
          </div>
        </div>
      </div>

      {/* Telemetry Barometer: Parameter Readout */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 p-2.5 sm:p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Loss (MSE)
          </span>
          <span className="mt-0.5 block font-mono text-base sm:text-lg font-bold text-amber-700 dark:text-amber-400">
            {frame.loss.toFixed(3)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 p-2.5 sm:p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Weight (w)
          </span>
          <span className="mt-0.5 block font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {frame.weight.toFixed(3)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 p-2.5 sm:p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bias (b)
          </span>
          <span className="mt-0.5 block font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {frame.bias.toFixed(3)}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80 p-2.5 sm:p-3">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Gradient Norm ||∇||
          </span>
          <span className="mt-0.5 block font-mono text-base sm:text-lg font-bold text-teal-700 dark:text-teal-400">
            {frame.gradientNorm.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Tactile Scrubber Strip */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span>⇄</span> SCRUB TRAINING TIMELINE
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Drag or hover across track to inspect frames
          </span>
        </div>

        {/* Interactive Track Area */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-9 w-full rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 cursor-ew-resize flex items-center px-3 select-none touch-none dark:hover:border-slate-700 transition-colors"
          role="slider"
          aria-label="Training timeline step scrubber"
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-valuenow={currentStep}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              setCurrentStep((s) => Math.max(0, s - 1));
              setIsPlaying(false);
            } else if (e.key === "ArrowRight") {
              setCurrentStep((s) => Math.min(totalSteps, s + 1));
              setIsPlaying(false);
            } else if (e.key === "Home") {
              setCurrentStep(0);
              setIsPlaying(false);
            } else if (e.key === "End") {
              setCurrentStep(totalSteps);
              setIsPlaying(false);
            }
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 bottom-0 rounded-l-xl bg-gradient-to-r from-teal-500/15 to-teal-500/35 dark:from-teal-500/20 dark:to-teal-500/40 pointer-events-none"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />

          {/* Tick marks */}
          <div className="absolute inset-x-3 flex justify-between pointer-events-none text-[10px] font-mono text-slate-500 dark:text-slate-400">
            {HERO_MILESTONES.map((m) => (
              <span
                key={m.step}
                className={currentStep === m.step ? "text-amber-600 dark:text-amber-400 font-bold" : ""}
              >
                0{m.step}
              </span>
            ))}
          </div>

          {/* Active Handle Cursor */}
          <div
            className="absolute h-7 w-3.5 -ml-1.5 rounded-md bg-amber-500 dark:bg-amber-400 shadow-md shadow-amber-500/30 border border-white pointer-events-none flex items-center justify-center transition-transform hover:scale-110"
            style={{ left: `calc(12px + ${(currentStep / totalSteps)} * (100% - 24px))` }}
          >
            <div className="h-3 w-0.5 bg-slate-900 rounded-full" />
          </div>
        </div>

        {/* Milestone Quick Jump Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
          {HERO_MILESTONES.map((m) => (
            <button
              key={m.step}
              onClick={() => {
                setCurrentStep(m.step);
                setIsPlaying(false);
              }}
              className={`rounded-lg px-2 py-1 text-[11px] font-mono text-left transition-all cursor-pointer ${
                currentStep === m.step
                  ? "bg-amber-50 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-400/40 font-semibold"
                  : "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{m.label}</span>
                <span className="text-[10px] opacity-70">s{m.step}</span>
              </div>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5">
                {m.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
