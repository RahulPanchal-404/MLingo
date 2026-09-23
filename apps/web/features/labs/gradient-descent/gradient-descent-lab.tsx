"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { BreakModePanel } from "@/features/challenges/break-mode-panel";
import { BREAK_MODE_LEARNING_RATE, type BreakModeChallenge } from "@/features/challenges/types";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { CodeMode } from "@/features/labs/gradient-descent/code-mode";
import { MathMode } from "@/features/labs/gradient-descent/math-mode";
import { getRunYDomain, RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import { MarkerForm } from "@/features/timeline/marker-form";
import { generateTrainingInsights } from "@/features/insights/engine";
import { TrainingInsights } from "@/features/insights/training-insights";
import { ModelXRay } from "@/features/x-ray/model-x-ray";
import { consumeLabHandoffRun } from "@/features/experiments/experiment-storage";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import type { TimelineMarker } from "@/features/timeline/types";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import { useTutor } from "@/features/tutor/tutor-provider";
import { buildDiagnosticTutorContext, buildTrainingTutorContext } from "@/features/tutor/tutor-context-builder";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import { PersistentTimelineDock } from "@/features/timeline/persistent-timeline-dock";
import { ExperimentControlPanel } from "./experiment-control-panel";

const defaultRequest: TrainingRunRequest = {
      algorithm: "linear_regression",
      dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
      training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 },
};

type GradientDescentLabProps = { breakMode?: BreakModeChallenge };

export type LearningRateInputConfig = {
      min: "0.0001" | "0.001";
      max: "1" | "1.30";
      step: "0.001";
};

export function getLearningRateInputConfig(isBreakMode: boolean, allowSlowLearningRate = false): LearningRateInputConfig {
      return isBreakMode ? { min: allowSlowLearningRate ? "0.0001" : "0.001", max: "1.30", step: "0.001" } : { min: "0.001", max: "1", step: "0.001" };
}

export function GradientDescentLab({ breakMode }: GradientDescentLabProps = {}) {
      const initialRequest = useMemo(() => breakMode ? { ...defaultRequest, training: { ...defaultRequest.training, learning_rate: breakMode.defaultLearningRate ?? BREAK_MODE_LEARNING_RATE } } : defaultRequest, [breakMode]);
      const learningRateInput = getLearningRateInputConfig(Boolean(breakMode), breakMode?.defaultLearningRate === 0.0001);
      const [configuration, setConfiguration] = useState(initialRequest);
      const [run, setRun] = useState<TrainingRun | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [userMarkers, setUserMarkers] = useState<TimelineMarker[]>([]);
      const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
      const [markerTitle, setMarkerTitle] = useState("");
      const [markerDescription, setMarkerDescription] = useState("");
      const recordedRunId = useRef<string | null>(null);
      const timeline = useTrainingTimeline(run);
      const state = timeline.selectedTrainingState;
      const regressionYDomain = useMemo(() => breakMode && run ? getRunYDomain(run.dataset_points, run.history) : undefined, [breakMode, run]);
      const diagnostics = useMemo(() => run ? analyzeTrainingRun(run) : [], [run]);
      const insights = useMemo(() => run ? generateTrainingInsights(run, diagnostics) : [], [run, diagnostics]);
      const eventMarkers = useMemo(() => breakMode ? [] : diagnosticEventsToTimelineMarkers(diagnostics), [breakMode, diagnostics]);
      const markers = [...eventMarkers, ...userMarkers];
      const { setTutorContext } = useTutor();

      useEffect(() => {
        if (run && state) {
          setTutorContext({
            route: "/labs/gradient-descent",
            training: buildTrainingTutorContext(run, state, configuration.training.learning_rate),
            diagnostic: buildDiagnosticTutorContext(diagnostics[0] ?? null),
            project: null,
          });
        }
      }, [run, state, configuration.training.learning_rate, diagnostics, setTutorContext]);

      const requestTraining = useCallback(async (request: TrainingRunRequest) => {
            setIsLoading(true);
            setError(null);
            setRun(null);
            setUserMarkers([]);
            setIsMarkerFormOpen(false);
            try {
                  setRun(await createTrainingRun(request));
            } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "Training could not start.");
            } finally {
                  setIsLoading(false);
            }
      }, []);

      useEffect(() => {
            const initialRequestTimer = window.setTimeout(() => {
                  const handoff = consumeLabHandoffRun();
                  if (handoff && handoff.algorithm.toLowerCase().startsWith("linear")) {
                        setConfiguration({
                              algorithm: "linear_regression",
                              dataset: handoff.dataset,
                              training: handoff.training,
                        });
                        setRun(handoff);
                        setIsLoading(false);
                        return;
                  }
                  void requestTraining(initialRequest);
            }, 0);
            return () => window.clearTimeout(initialRequestTimer);
      }, [initialRequest, requestTraining]);
      useEffect(() => {
            if (!run) return;
            if (recordedRunId.current === run.id) return;
            recordedRunId.current = run.id;
            const activity = readLearningActivity();
            recordLearningActivity({ labsExplored: activity.labsExplored + 1 });
            recordRunConcepts(["Gradient Descent", "Loss", "Learning Rate"]);
      }, [run]);

      const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void requestTraining(configuration);
      };

      const saveMarker = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const title = markerTitle.trim();
            if (!title || !run) return;
            setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]);
            setMarkerTitle("");
            setMarkerDescription("");
            setIsMarkerFormOpen(false);
      };

      return (
            <div className="lab-layout space-y-6">
                  {/* Top Intro & Responsive Experiment Console */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 space-y-4">
                              <div className="lab-intro-copy">
                                    <p className="eyebrow">Lab 01 / recorded training</p>
                                    <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">
                                          Gradient descent, frame by frame.
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                          Run one real linear model, then scrub its recorded states to see the fit, gradients, and loss change together.
                                    </p>
                              </div>

                              <div className="lab-secondary-action flex flex-wrap items-center gap-3 pt-2">
                                    <SaveExperimentButton run={run} />
                                    <Link className="secondary-button" href="/labs/gradient-descent/compare">Compare training runs</Link>
                              </div>

                              {breakMode && <BreakModePanel challenge={breakMode} diagnostics={run ? diagnostics : null} markers={markers} run={run} />}
                              {error && <section className="lab-alert" role="alert"><strong>Training could not be recorded.</strong><span>{error}</span></section>}
                              {isLoading && <section className="lab-loading" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><div><strong>Recording the training run</strong><p>Generating the dataset and capturing every update.</p></div></section>}
                        </div>

                        {/* Right: Professional Experiment Control Panel */}
                        <div className="lg:col-span-5">
                              <ExperimentControlPanel
                                    configuration={configuration}
                                    onConfigurationChange={setConfiguration}
                                    onSubmit={submit}
                                    isLoading={isLoading}
                                    isReady={Boolean(run)}
                                    learningRateConfig={learningRateInput}
                              />
                        </div>
                  </div>

                  {!isLoading && !error && run && (
                        <>
                              {/* Visualizations Grid */}
                              <section className="visual-grid" aria-label="Training visualizations">
                                    <RegressionPlot points={run.dataset_points} state={state} yDomain={regressionYDomain} />
                                    <LossChart currentStep={timeline.currentStep} history={run.history} />
                              </section>

                              {/* Persistent Sticky Training Timeline Dock */}
                              <PersistentTimelineDock
                                    currentStep={timeline.currentStep}
                                    totalSteps={timeline.totalSteps}
                                    isPlaying={timeline.isPlaying}
                                    onPlayToggle={timeline.togglePlay}
                                    onBackward={timeline.stepBackward}
                                    onForward={timeline.stepForward}
                                    onJump={timeline.jumpToStep}
                                    onReset={timeline.reset}
                                    playbackSpeed={timeline.playbackSpeed}
                                    onSpeed={timeline.setPlaybackSpeed}
                                    markers={markers}
                                    lossValue={state?.loss}
                                    metricLabel="MSE"
                              />

                              <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />
                              <section className="learning-modes-grid" aria-label="Selected frame learning modes">
                                    <MathMode learningRate={run.training.learning_rate} state={state} />
                                    <CodeMode learningRate={run.training.learning_rate} state={state} />
                              </section>
                              {!breakMode && <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} run={run} state={state} />}
                              {!breakMode && <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />}
                              {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                              <TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={markers} onAddMarker={() => setIsMarkerFormOpen(true)} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={timeline.totalSteps} />
                        </>
                  )}
            </div>
      );
}
