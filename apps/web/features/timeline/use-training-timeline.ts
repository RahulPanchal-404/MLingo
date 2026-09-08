"use client";

import { useEffect, useState } from "react";

import type { TrainingRun } from "@/types/training-run";

export type PlaybackSpeed = 0.5 | 1 | 2;

export function useTrainingTimeline(run: TrainingRun | null, sharedTotalSteps?: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const totalSteps = Math.min(run?.history.length ?? 0, sharedTotalSteps ?? Number.POSITIVE_INFINITY);
  const selectedTrainingState = run?.history[currentStep] ?? null;

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setCurrentStep(0);
      setIsPlaying(false);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [run?.id]);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference(); mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => {
    if (!isPlaying || reducedMotion || totalSteps < 2) return;
    const interval = window.setInterval(() => setCurrentStep((step) => {
      if (step >= totalSteps - 1) { setIsPlaying(false); return step; }
      return step + 1;
    }), 900 / playbackSpeed);
    return () => window.clearInterval(interval);
  }, [isPlaying, reducedMotion, playbackSpeed, totalSteps]);

  const setStep = (step: number) => {
    setCurrentStep(Math.min(Math.max(step, 0), Math.max(totalSteps - 1, 0)));
    setIsPlaying(false);
  };

  return {
    currentStep,
    selectedTrainingState,
    isPlaying,
    reducedMotion,
    playbackSpeed,
    totalSteps,
    play: () => !reducedMotion && currentStep < totalSteps - 1 && setIsPlaying(true),
    pause: () => setIsPlaying(false),
    togglePlay: () => setIsPlaying((playing) => !playing && !reducedMotion && currentStep < totalSteps - 1),
    stepForward: () => setCurrentStep((step) => Math.min(step + 1, Math.max(totalSteps - 1, 0))),
    stepBackward: () => setCurrentStep((step) => Math.max(step - 1, 0)),
    reset: () => { setCurrentStep(0); setIsPlaying(false); },
    jumpToStep: setStep,
    setPlaybackSpeed,
  };
}
