"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { recordLabVisit } from "@/features/progress/activity";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import { ClassificationPlot } from "@/features/labs/logistic-regression/classification-plot";
import { PersistentTimelineDock } from "@/features/timeline/persistent-timeline-dock";
import { LabLinks, LabSettings, LabWorkspace } from "@/features/labs/workspace/lab-workspace";
import { LogisticCodeMode } from "@/features/labs/logistic-regression/code-mode";
import { LogisticMathMode } from "@/features/labs/logistic-regression/math-mode";
import { MarkerForm } from "@/features/timeline/marker-form";
import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import { generateTrainingInsights } from "@/features/insights/engine";
import { TrainingInsights } from "@/features/insights/training-insights";
import { ModelXRay } from "@/features/x-ray/model-x-ray";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import { consumeLabHandoffRun } from "@/features/experiments/experiment-storage";
import type { TimelineMarker } from "@/features/timeline/types";
import { useTutor } from "@/features/tutor/tutor-provider";
import { buildDiagnosticTutorContext, buildTrainingTutorContext } from "@/features/tutor/tutor-context-builder";
import { BreakModePanel } from "@/features/challenges/break-mode-panel";
import type { BreakModeChallenge } from "@/features/challenges/types";

const defaultRequest: TrainingRunRequest = { algorithm: "logistic_regression", dataset: { samples: 64, noise: 0.1, seed: 0 }, training: { learning_rate: 0.2, epochs: 50, initial_weight: 0, initial_bias: 0 } };

type LogisticRegressionLabProps = { breakMode?: BreakModeChallenge };

export function LogisticRegressionLab({ breakMode }: LogisticRegressionLabProps = {}) {
      const [request, setRequest] = useState(defaultRequest);
      const [run, setRun] = useState<TrainingRun | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(true);
      const [userMarkers, setUserMarkers] = useState<TimelineMarker[]>([]);
      const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
      const [markerTitle, setMarkerTitle] = useState("");
      const [markerDescription, setMarkerDescription] = useState("");
      const recordedRunId = useRef<string | null>(null);
      const timeline = useTrainingTimeline(run);
      const state = timeline.selectedTrainingState;
      const diagnostics = useMemo(() => (run ? analyzeTrainingRun(run) : []), [run]);
      const insights = useMemo(() => (run ? generateTrainingInsights(run, diagnostics) : []), [run, diagnostics]);
      const { setTutorContext } = useTutor();

      useEffect(() => {
        if (run && state) {
          setTutorContext({
            route: "/labs/logistic-regression",
            training: buildTrainingTutorContext(run, state, request.training.learning_rate),
            diagnostic: buildDiagnosticTutorContext(diagnostics[0] ?? null),
            project: null,
          });
        }
      }, [run, state, request.training.learning_rate, diagnostics, setTutorContext]);

      const requestTraining = useCallback(async (nextRequest: TrainingRunRequest) => {
            setLoading(true); setError(null); setRun(null);
            setUserMarkers([]); setIsMarkerFormOpen(false);
            try { setRun(await createTrainingRun(nextRequest)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Training could not start."); } finally { setLoading(false); }
      }, []);

      useEffect(() => {
            const timer = window.setTimeout(() => {
                  const handoff = consumeLabHandoffRun();
                  if (handoff && handoff.algorithm.toLowerCase().startsWith("logistic")) {
                        setRequest({ algorithm: "logistic_regression", dataset: handoff.dataset, training: handoff.training });
                        setRun(handoff);
                        setLoading(false);
                        return;
                  }
                  void requestTraining(defaultRequest);
            }, 0);
            return () => window.clearTimeout(timer);
      }, [requestTraining]);
      useEffect(() => {
            if (!run || recordedRunId.current === run.id) return;
            recordedRunId.current = run.id;
            recordLabVisit("logistic-regression", ["Logistic Regression", "Sigmoid", "Probability", "Binary Cross-Entropy", "Decision Boundary"]);
      }, [run]);

      const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void requestTraining(request); };
      const updateDataset = (key: "samples" | "noise", value: number) => setRequest((current) => ({ ...current, dataset: { ...current.dataset, [key]: key === "samples" ? Math.round(value) : value } }));
      const updateTraining = (key: "learning_rate" | "epochs", value: number) => setRequest((current) => ({ ...current, training: { ...current.training, [key]: key === "epochs" ? Math.round(value) : value } }));
      const eventMarkers = run ? diagnosticEventsToTimelineMarkers(diagnostics) : [];
      const markers = [...eventMarkers, ...userMarkers];
      const saveMarker = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const title = markerTitle.trim(); if (!title || !run) return; setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]); setMarkerTitle(""); setMarkerDescription(""); setIsMarkerFormOpen(false); };

      return (
            <LabWorkspace
                  title="Logistic regression"
                  summary="A classifier learns to turn two features into a probability. Watch the decision boundary move and the log loss fall as it trains."
                  actions={<><SaveExperimentButton run={run} /><Link className="secondary-button" href="/labs/logistic-regression/compare">Compare runs</Link></>}
                  notices={breakMode ? <BreakModePanel challenge={breakMode} diagnostics={run ? diagnostics : null} markers={markers} run={run} /> : null}
                  status={{ loading, error, loadingText: "Training the classifier…" }}
                  settings={
                        <LabSettings onSubmit={submit} loading={loading} footer={<LabLinks theory="logistic-regression" code="logistic-regression" />} fields={[
                              { label: "Learning rate (α)", value: request.training.learning_rate, min: 0.001, max: 2, step: 0.001, onChange: (v) => updateTraining("learning_rate", v) },
                              { label: "Epochs", value: request.training.epochs, min: 1, max: 300, step: 1, onChange: (v) => updateTraining("epochs", v) },
                              { label: "Samples", value: request.dataset.samples, min: 2, max: 200, step: 2, onChange: (v) => updateDataset("samples", v) },
                              { label: "Class spread", value: request.dataset.noise, min: 0.01, max: 1, step: 0.01, onChange: (v) => updateDataset("noise", v), hint: "Larger spread makes the two classes overlap." },
                        ]} />
                  }
                  visuals={run ? <><ClassificationPlot points={run.dataset_points} state={state} /><LossChart currentStep={timeline.currentStep} history={run.history} label="Binary Cross-Entropy" /></> : undefined}
                  timeline={
                        <PersistentTimelineDock currentStep={timeline.currentStep} totalSteps={timeline.totalSteps} isPlaying={timeline.isPlaying} onPlayToggle={timeline.togglePlay} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onReset={timeline.reset} playbackSpeed={timeline.playbackSpeed} onSpeed={timeline.setPlaybackSpeed} markers={markers} lossValue={state?.loss} metricLabel="Log loss" onAddMarker={() => setIsMarkerFormOpen(true)} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} />
                  }
            >
                  {run && <>
                        {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                        <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />
                        <section className="learning-modes-grid" aria-label="Selected logistic frame learning modes">
                              <LogisticMathMode learningRate={run.training.learning_rate} state={state} />
                              <LogisticCodeMode learningRate={run.training.learning_rate} state={state} />
                        </section>
                        <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} run={run} state={state} />
                        <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />
                  </>}
            </LabWorkspace>
      );
}

