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
import { recordLabVisit } from "@/features/progress/activity";
import { PersistentTimelineDock } from "@/features/timeline/persistent-timeline-dock";
import { LabLinks, LabSettings, LabWorkspace } from "@/features/labs/workspace/lab-workspace";

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
            recordLabVisit("gradient-descent", ["Gradient Descent", "Loss", "Learning Rate"]);
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

      const setTraining = (key: "learning_rate" | "epochs", value: number) => setConfiguration((c) => ({ ...c, training: { ...c.training, [key]: key === "epochs" ? Math.round(value) : value } }));
      const setDataset = (key: "samples" | "noise", value: number) => setConfiguration((c) => ({ ...c, dataset: { ...c.dataset, [key]: key === "samples" ? Math.round(value) : value } }));

      return (
            <LabWorkspace
                  title="Linear regression and gradient descent"
                  summary="A straight line learns to fit the points one update at a time. Scrub the timeline to watch the line, its gradients and the loss change together."
                  actions={<><SaveExperimentButton run={run} /><Link className="secondary-button" href="/labs/gradient-descent/compare">Compare runs</Link></>}
                  notices={breakMode ? <BreakModePanel challenge={breakMode} diagnostics={run ? diagnostics : null} markers={markers} run={run} /> : null}
                  status={{ loading: isLoading, error, loadingText: "Training the line…" }}
                  settings={
                        <LabSettings
                              onSubmit={submit}
                              loading={isLoading}
                              fields={[
                                    { label: "Learning rate (α)", value: configuration.training.learning_rate, min: Number(learningRateInput.min), max: Number(learningRateInput.max), step: Number(learningRateInput.step), onChange: (v) => setTraining("learning_rate", v), hint: "How big each update step is." },
                                    { label: "Epochs", value: configuration.training.epochs, min: 1, max: 300, step: 1, onChange: (v) => setTraining("epochs", v), hint: "How many updates to record." },
                                    { label: "Samples", value: configuration.dataset.samples, min: 10, max: 100, step: 1, onChange: (v) => setDataset("samples", v), hint: "Points along y = 2x + 1." },
                                    { label: "Noise (σ)", value: configuration.dataset.noise, min: 0, max: 2, step: 0.05, onChange: (v) => setDataset("noise", v), hint: "Random scatter added to each point." },
                              ]}
                              footer={<LabLinks theory="gradient-descent" code="linear-regression" />}
                        />
                  }
                  visuals={run ? <>
                        <RegressionPlot points={run.dataset_points} state={state} yDomain={regressionYDomain} />
                        <LossChart currentStep={timeline.currentStep} history={run.history} />
                  </> : undefined}
                  timeline={
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
                              onAddMarker={() => setIsMarkerFormOpen(true)}
                              onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))}
                        />
                  }
            >
                  {run && <>
                        {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                        <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />
                        <section className="learning-modes-grid" aria-label="Selected frame learning modes">
                              <MathMode learningRate={run.training.learning_rate} state={state} />
                              <CodeMode learningRate={run.training.learning_rate} state={state} />
                        </section>
                        {!breakMode && <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} run={run} state={state} />}
                        {!breakMode && <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />}
                  </>}
            </LabWorkspace>
      );
}
