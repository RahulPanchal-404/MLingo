"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import { useTutor } from "@/features/tutor/tutor-provider";
import { buildTrainingTutorContext } from "@/features/tutor/tutor-context-builder";
import { PredictBeforeReveal } from "@/features/learning/components/predict-before-reveal";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const DEMO_STEPS = [
  { step: 1, title: "Start with a Dataset", subtitle: "Inspect raw data before training" },
  { step: 2, title: "Watch the Model Learn", subtitle: "Trigger a real gradient descent run" },
  { step: 3, title: "Scrub Through Training", subtitle: "Travel frame by frame through the timeline" },
  { step: 4, title: "Inspect What Changed", subtitle: "Look inside parameters, weights & gradients" },
  { step: 5, title: "Ask Why (AI Tutor)", subtitle: "Ground questions in live telemetry" },
  { step: 6, title: "Change Something", subtitle: "Configure a controlled experiment" },
  { step: 7, title: "Compare the Result", subtitle: "Analyze Run A vs Run B convergence" },
  { step: 8, title: "Turn Learning into a Project", subtitle: "Build your first end-to-end ML project" },
] as const;

const initialDemoRequest: TrainingRunRequest = {
  algorithm: "linear_regression",
  dataset: { samples: 32, slope: 2, intercept: 1, noise: 0.12, seed: 42 },
  training: { learning_rate: 0.05, epochs: 30, initial_weight: 0, initial_bias: 0 },
};

export function DemoWorkspace() {
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [runA, setRunA] = useState<TrainingRun | null>(null);
  const [runB, setRunB] = useState<TrainingRun | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [expLearningRate, setExpLearningRate] = useState<number>(0.35);

  const timelineA = useTrainingTimeline(runA);
  const { openTutor, setTutorContext } = useTutor();

  // Load Run A on mount
  const handleLoadRunA = useCallback(async () => {
    setLoadingA(true);
    setErrorA(null);
    try {
      const run = await createTrainingRun(initialDemoRequest);
      setRunA(run);
    } catch (err) {
      setErrorA(err instanceof Error ? err.message : "Failed to train Run A");
    } finally {
      setLoadingA(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void handleLoadRunA();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [handleLoadRunA]);


  // Train Run B for comparison
  const handleLoadRunB = async () => {
    setLoadingB(true);
    setErrorB(null);
    try {
      const run = await createTrainingRun({
        ...initialDemoRequest,
        training: {
          ...initialDemoRequest.training,
          learning_rate: expLearningRate,
        },
      });
      setRunB(run);
    } catch (err) {
      setErrorB(err instanceof Error ? err.message : "Failed to train Run B");
    } finally {
      setLoadingB(false);
    }
  };

  // Wire AI Tutor context when Run A active
  const stateA = timelineA.selectedTrainingState;
  useEffect(() => {
    if (runA && stateA) {
      setTutorContext({
        route: "/demo",
        training: buildTrainingTutorContext(runA, stateA, runA.training.learning_rate),
        project: null,
      });
    }
  }, [runA, stateA, setTutorContext]);

  const rawPoints = useMemo(() => {
    if (runA?.dataset_points) return runA.dataset_points;
    // Fallback deterministic points if run not loaded yet
    return Array.from({ length: 32 }, (_, i) => {
      const x = -1.5 + (i / 31) * 3;
      return { feature: x, target: 2 * x + 1 + (Math.sin(i * 99) * 0.15) };
    });
  }, [runA]);

  const activeStepMeta = DEMO_STEPS[currentStepIndex - 1];

  const handleNext = () => {
    if (currentStepIndex < 8) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStepIndex(1);
    timelineA.reset();
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Stepper Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-600 text-[10px] font-bold text-white">
                ⚡
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                MLingo Interactive Tour
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600 border border-slate-200">
                Step 0{currentStepIndex} / 08
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {activeStepMeta.title}
            </h1>
            <p className="text-xs text-slate-500">
              {activeStepMeta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestart}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Restart Tour
            </button>
            <Link
              href="/learn"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Skip to Curriculum
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-teal-700 transition-all duration-300"
            style={{ width: `${(currentStepIndex / 8) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Guided Step Content */}
      <main className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* STEP 1: Start with a Dataset */}
        {currentStepIndex === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                  Concept 01 · Data Representation
                </span>
                <h2 className="text-lg font-bold text-slate-900">
                  All machine learning begins with raw data.
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Before a neural network or regression line learns anything, all it possesses is a collection of features $x$ and targets $y$.
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-slate-800">What you are observing:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>32 deterministic data points plotted in 2D space.</li>
                    <li>The true relationship is roughly $y = 2x + 1$, plus measurement noise.</li>
                    <li>Notice: no line exists yet. Initial weights $w = 0$ and bias $b = 0$.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col items-center justify-center min-h-[300px]">
                <RegressionPlot
                  points={rawPoints}
                  state={{
                    step: 0,
                    weights: [0],
                    bias: 0,
                    loss: 5.2,
                    gradients: [0],
                    bias_gradient: 0,
                    predictions: [],
                    metrics: {},
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Watch the Model Learn */}
        {currentStepIndex === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 02 · Gradient Optimization
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Watch Mean Squared Error drop as weights update.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                We ran 30 gradient descent epochs with learning rate $\alpha = 0.05$. At every epoch, the engine calculated the instantaneous loss gradient and subtracted it from the weights.
              </p>
            </div>

            {loadingA && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-500">
                Recording real gradient descent updates on backend...
              </div>
            )}

            {errorA && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                {errorA}
              </div>
            )}

            {runA && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold text-slate-800 mb-2">Final Converged Fit</div>
                  <RegressionPlot
                    points={runA.dataset_points}
                    state={runA.history[runA.history.length - 1]}
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="text-xs font-bold text-slate-800 mb-2">Loss Convergence Curve (MSE)</div>
                  <LossChart
                    history={runA.history}
                    currentStep={runA.history.length - 1}
                    label="MSE Loss"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Scrub through Training */}
        {currentStepIndex === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 03 · Frame by Frame Timeline
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Travel backwards and forwards through training history.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use the scrubber or play controls below. Notice how the regression line rotates smoothly towards the data while the playhead moves across the loss curve.
              </p>
            </div>

            {runA && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                      <span>Regression Line Position</span>
                      <span className="font-mono text-teal-700">Step {timelineA.currentStep + 1} of {timelineA.totalSteps}</span>
                    </div>
                    <RegressionPlot
                      points={runA.dataset_points}
                      state={stateA}
                    />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-bold text-slate-800 mb-2">Loss Playhead</div>
                    <LossChart
                      history={runA.history}
                      currentStep={timelineA.currentStep}
                      label="MSE Loss"
                    />
                  </div>
                </div>

                <TimelineControls
                  currentStep={timelineA.currentStep}
                  isPlaying={timelineA.isPlaying}
                  markers={[]}
                  onAddMarker={() => {}}
                  onBackward={timelineA.stepBackward}
                  onForward={timelineA.stepForward}
                  onJump={timelineA.jumpToStep}
                  onPlayToggle={timelineA.togglePlay}
                  onRemoveMarker={() => {}}
                  onReset={timelineA.reset}
                  onSpeed={timelineA.setPlaybackSpeed}
                  playbackSpeed={timelineA.playbackSpeed}
                  reducedMotion={timelineA.reducedMotion}
                  totalSteps={timelineA.totalSteps}
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Inspect What Changed */}
        {currentStepIndex === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 04 · Model Telemetry & Internal Parameters
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Observe the exact mathematical numbers driving the model.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                In MLingo, weights and gradients are never hidden. Inspect the active values at Step {timelineA.currentStep + 1}:
              </p>
            </div>

            {stateA && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="text-[10px] text-slate-500 font-sans font-bold uppercase">Weight ($w$)</div>
                  <div className="text-lg font-bold text-slate-900">{stateA.weights[0]?.toFixed(4)}</div>
                  <div className="text-[10px] text-slate-400 font-sans">True slope target: 2.0</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="text-[10px] text-slate-500 font-sans font-bold uppercase">Bias ($b$)</div>
                  <div className="text-lg font-bold text-slate-900">{stateA.bias?.toFixed(4)}</div>
                  <div className="text-[10px] text-slate-400 font-sans">True intercept: 1.0</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="text-[10px] text-slate-500 font-sans font-bold uppercase">Weight Gradient (∂L/∂w)</div>
                  <div className="text-lg font-bold text-teal-700">{stateA.gradients[0]?.toFixed(4)}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Negative vector directs step</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="text-[10px] text-slate-500 font-sans font-bold uppercase">Mean Squared Error</div>
                  <div className="text-lg font-bold text-slate-900">{stateA.loss?.toFixed(4)}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Objective function</div>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 text-xs text-teal-950 space-y-1">
              <span className="font-bold block uppercase tracking-wider text-teal-800 text-[10px]">
                Mathematical Update Formula
              </span>
              <p className="font-mono text-sm">
                w ← w - α · (∂L/∂w) = {stateA?.weights[0]?.toFixed(3)} - 0.05 · ({stateA?.gradients[0]?.toFixed(3)})
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Ask Why (AI Tutor) */}
        {currentStepIndex === 5 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 05 · Grounded AI Tutor
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Never wonder what a gradient or equation means.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                The MLingo AI Tutor isn&apos;t a disconnected chatbot. It reads your active training frame directly and cites actual parameters in its explanations.
              </p>
            </div>

            <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 to-slate-50 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-xl text-white shadow-xs">
                  💡
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Ask the Tutor about Step {timelineA.currentStep + 1}
                  </div>
                  <div className="text-xs text-slate-500">
                    Bound context: Linear Regression · Loss = {stateA?.loss?.toFixed(4)} · LR = 0.05
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => openTutor("Why did the loss decrease in early steps?")}
                  className="rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-teal-900 shadow-xs hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  💬 &quot;Why did the loss decrease in early steps?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => openTutor("What is the mathematical reason for this gradient?")}
                  className="rounded-xl border border-teal-300 bg-white px-3.5 py-2 text-xs font-semibold text-teal-900 shadow-xs hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  💬 &quot;What does this gradient mean mathematically?&quot;
                </button>
                <button
                  type="button"
                  onClick={() => openTutor()}
                  className="rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors cursor-pointer"
                >
                  Open AI Tutor Drawer →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Change Something (Controlled Experiment) */}
        {currentStepIndex === 6 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 06 · Scientific Experimentation
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Hypothesize, tweak a hyperparameter, and measure the effect.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                In Run A, we used learning rate $\alpha = 0.05$. What happens if we increase the learning rate to $\alpha = {expLearningRate}$? Will the model converge in fewer steps or overshoot?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <PredictBeforeReveal
                question="Before we run: What do you think will happen if we increase the learning rate?"
                contextNote={`In Run A, learning rate was α = 0.05. We are now testing α = ${expLearningRate}.`}
                options={[
                  { id: "slower", label: "Training will become slower" },
                  { id: "faster_less_stable", label: "Training may become faster but less stable" },
                  { id: "no_change", label: "Nothing will change" },
                  { id: "unsure", label: "I'm not sure" },
                ]}
                revealed={Boolean(runB)}
                actualOutcome={
                  runB
                    ? {
                        headline: "Larger step size accelerated initial descent, but introduced oscillations.",
                        explanation: `With α = ${expLearningRate}, each step covered more ground on the loss surface. It dropped rapidly early on, but oscillated near the minimum. Proceed to Step 7 to see the side-by-side comparison!`,
                        accurateOptionId: "faster_less_stable",
                      }
                    : undefined
                }
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <label className="block space-y-2 text-xs font-bold text-slate-700">
                  <span>Experiment Variable: Learning Rate (α)</span>
                  <input
                    type="range"
                    min="0.01"
                    max="0.8"
                    step="0.01"
                    value={expLearningRate}
                    onChange={(e) => setExpLearningRate(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between font-mono text-[11px] text-slate-500">
                    <span>Slow (0.01)</span>
                    <span className="font-bold text-teal-800">{expLearningRate}</span>
                    <span>Aggressive (0.80)</span>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => void handleLoadRunB()}
                  disabled={loadingB}
                  className="w-full rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loadingB ? "Training Run B..." : runB ? "Re-run Experiment B" : "Train Experiment B with α = " + expLearningRate}
                </button>

                {errorB && (
                  <div className="text-xs text-red-600">{errorB}</div>
                )}

                {runB && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                    ✓ Experiment B successfully trained! Proceed to Step 7 to compare.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Compare the Result */}
        {currentStepIndex === 7 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-semibold text-teal-800">
                Concept 07 · Model Comparison
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Side-by-side comparison: Run A vs. Run B.
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Notice how the learning rate changed convergence velocity and loss trajectory:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {runA && (
                <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                    <span>Run A (Baseline)</span>
                    <span className="font-mono">α = 0.05</span>
                  </div>
                  <LossChart history={runA.history} currentStep={runA.history.length - 1} label="Run A Loss" />
                  <div className="text-[11px] text-slate-500 font-mono">
                    Final Loss: {runA.history[runA.history.length - 1]?.loss?.toFixed(4)}
                  </div>
                </div>
              )}

              {runB ? (
                <div className="rounded-xl border border-amber-200 bg-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Run B (Experiment)</span>
                    <span className="font-mono">α = {expLearningRate}</span>
                  </div>
                  <LossChart history={runB.history} currentStep={runB.history.length - 1} label="Run B Loss" />
                  <div className="text-[11px] text-slate-500 font-mono">
                    Final Loss: {runB.history[runB.history.length - 1]?.loss?.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <span>Run B has not been trained yet.</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(6)}
                    className="text-teal-700 font-bold hover:underline"
                  >
                    Go back to Step 6 to run Experiment B
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 8: Turn Learning into a Project */}
        {currentStepIndex === 8 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2">
              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                Concept 08 · Real-World Project Studio
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                You have completed the MLingo learning loop!
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                You now know the cycle: <strong>Data → Train → Scrub → Inspect → Tutor → Experiment → Compare</strong>.
                Now, apply this end-to-end process on real-world datasets with missing value imputation, train/test splitting, and evaluation in <strong>Project Studio</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
              <Link
                href="/projects/salary-prediction"
                className="group rounded-2xl border border-teal-200 bg-teal-50/40 p-4 transition-all hover:border-teal-400 hover:bg-teal-50 hover:shadow-xs text-left flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                    Regression
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-teal-900">
                    Salary Prediction
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Predict software engineer compensation based on experience and portfolio.
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700">Launch Project →</span>
              </Link>

              <Link
                href="/labs"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs text-left flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    Labs
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    Explore Other Labs
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Dive into Logistic Regression, K-Means clustering, or Neural Networks.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700">Browse Labs →</span>
              </Link>

              <Link
                href="/portfolio"
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs text-left flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    Showcase
                  </span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">
                    Personal ML Portfolio
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Track completed projects, review case studies, and export markdown reports.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-700">Open Portfolio →</span>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <footer className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 1}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            ← Previous Step
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex < 8 ? (
              <button
                type="button"
                id="demo-next-step-button"
                onClick={handleNext}
                className="rounded-lg bg-teal-800 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors cursor-pointer"
              >
                Next: {DEMO_STEPS[currentStepIndex].title} →
              </button>
            ) : (
              <Link
                href="/projects/salary-prediction"
                className="rounded-lg bg-teal-800 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors"
              >
                Start Guided Project →
              </Link>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
