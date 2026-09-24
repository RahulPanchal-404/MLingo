"use client";

import type { TimelineMarker } from "@/features/timeline/types";
import type { PlaybackSpeed } from "@/features/timeline/use-training-timeline";

export type PersistentTimelineDockProps = {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onBackward: () => void;
  onForward: () => void;
  onJump: (step: number) => void;
  onReset: () => void;
  playbackSpeed: PlaybackSpeed;
  onSpeed: (speed: PlaybackSpeed) => void;
  markers?: TimelineMarker[];
  lossValue?: number;
  metricLabel?: string;
  className?: string;
};

export function PersistentTimelineDock({
  currentStep,
  totalSteps,
  isPlaying,
  onPlayToggle,
  onBackward,
  onForward,
  onJump,
  onReset,
  playbackSpeed,
  onSpeed,
  markers = [],
  lossValue,
  metricLabel = "Loss",
  className = "",
}: PersistentTimelineDockProps) {
  const maxStep = Math.max(0, totalSteps - 1);

  return (
    <div
      className={`sticky bottom-4 z-20 mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 p-3.5 sm:px-5 shadow-xl dark:shadow-2xl backdrop-blur-xl text-slate-900 dark:text-slate-100 transition-all ${className}`}
      role="region"
      aria-label="Persistent Training Timeline Scrubber"
    >
      <div className="flex flex-col gap-2.5">
        {/* Top line: Active state readout & playback controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Active Frame and Loss */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="flex h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                STEP {currentStep + 1}/{totalSteps}
              </span>
            </div>

            {typeof lossValue === "number" && Number.isFinite(lossValue) && (
              <div className="rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-xs font-mono text-amber-700 dark:text-amber-300">
                <span className="text-slate-500 dark:text-slate-400 text-[10px] mr-1">{metricLabel}:</span>
                <span className="font-bold">{lossValue.toFixed(4)}</span>
              </div>
            )}
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={onReset}
              title="Jump to Start (Step 0)"
              aria-label="Jump to start"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer text-xs font-mono"
            >
              |◀
            </button>

            <button
              type="button"
              onClick={onBackward}
              disabled={currentStep <= 0}
              title="Step Backward (Previous Frame)"
              aria-label="Step backward"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
            >
              ◀
            </button>

            <button
              type="button"
              onClick={onPlayToggle}
              aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
              className={`flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-slate-950 shadow-amber-500/20 hover:bg-amber-400"
                  : "bg-teal-600 text-white shadow-teal-600/30 hover:bg-teal-500"
              }`}
            >
              <span>{isPlaying ? "❚❚ Pause" : "▶ Play"}</span>
            </button>

            <button
              type="button"
              onClick={onForward}
              disabled={currentStep >= maxStep}
              title="Step Forward (Next Frame)"
              aria-label="Step forward"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-xs"
            >
              ▶
            </button>

            <button
              type="button"
              onClick={() => onJump(maxStep)}
              title="Jump to End"
              aria-label="Jump to end"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer text-xs font-mono"
            >
              ▶|
            </button>
          </div>

          {/* Playback Speed Toggles */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">SPEED:</span>
            {([0.5, 1, 2] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSpeed(s)}
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  playbackSpeed === s
                    ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950 font-bold"
                    : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Bottom line: Interactive Scrubber Slider with Marker Pips */}
        <div className="relative flex items-center w-full">
          <input
            type="range"
            min={0}
            max={maxStep}
            value={currentStep}
            onChange={(e) => onJump(Number(e.target.value))}
            aria-label="Scrub training timeline frame"
            className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:accent-teal-400 focus:outline-hidden"
          />

          {/* Marker pins overlay */}
          {markers.length > 0 && (
            <div className="absolute inset-x-2 pointer-events-none flex">
              {markers.map((marker) => {
                const markerPos = maxStep > 0 ? (marker.step / maxStep) * 100 : 0;
                return (
                  <div
                    key={marker.id}
                    title={`${marker.title} (Step ${marker.step})`}
                    style={{ left: `${markerPos}%` }}
                    className="absolute -top-1 h-4 w-1 -ml-0.5 rounded-full bg-amber-500 dark:bg-amber-400 ring-2 ring-white dark:ring-slate-950"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
