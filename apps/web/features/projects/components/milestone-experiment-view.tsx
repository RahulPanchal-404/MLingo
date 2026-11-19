"use client";

import { useMemo, useState } from "react";
import type { ProjectDefinition, ProjectExperimentRecord, ProjectState } from "../types";
import { saveExperiment } from "@/features/experiments/experiment-storage";
import { runProject } from "../engine";

export type MilestoneExperimentViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onRecordExperiment: (exp: ProjectExperimentRecord) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneExperimentView({
  project,
  state,
  onRecordExperiment,
  onComplete,
  onBack,
}: MilestoneExperimentViewProps) {
  const prompt = project.experimentPrompt;
  const [paramVal, setParamVal] = useState<number>(prompt.testVal);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Run the baseline and the chosen setting on the project's real data (same split, preprocessing and epochs).
  const runFor = (val: number) =>
    runProject(project, state, prompt.parameterName === "threshold" ? { threshold: val } : prompt.parameterName === "clusters" ? { clusters: Math.round(val) } : { learningRate: val });
  const base = useMemo(() => runFor(prompt.defaultVal), [project, state.splitConfig, state.preprocessingConfig]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = useMemo(() => runFor(paramVal), [project, state.splitConfig, state.preprocessingConfig, paramVal]); // eslint-disable-line react-hooks/exhaustive-deps
  const comparison = describeExperiment(prompt.parameterName, prompt.defaultVal, paramVal, base, cur);

  const handleRunAndSave = () => {
    const expRecord: ProjectExperimentRecord = {
      id: `proj-${project.slug}-${Date.now()}`,
      title: `${project.title}: ${prompt.parameterName}=${paramVal}`,
      timestamp: Date.now(),
      parameterVal: paramVal,
      metricLabel: comparison.metricLabel,
      metricValue: comparison.testVal,
    };

    // Save to existing experiment history
    saveExperiment({
      run: {
        id: expRecord.id,
        algorithm: project.type,
        dataset: { samples: cur.trainRaw.length + cur.testRaw.length, seed: state.splitConfig.seed, noise: 0 },
        dataset_points: [],
        training: {
          learning_rate: prompt.parameterName === "learning_rate" ? paramVal : cur.options.learningRate ?? 0,
          epochs: cur.options.epochs ?? 100,
          initial_weight: 0,
          initial_bias: 0,
        },
        total_steps: cur.options.epochs ?? 100,
        history: [],
        markers: [],
        metadata: {
          project: project.title,
          experiment: prompt.title,
          [prompt.parameterName]: String(paramVal),
          metric: `${comparison.metricLabel}: ${comparison.testVal}`,
        },
      },
      title: `Project: ${project.title} (${prompt.parameterName}=${paramVal})`,
      notes: `${prompt.question} Result: ${comparison.observation}`,
    });

    onRecordExperiment(expRecord);
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔬</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Controlled Scientific Hypothesis Testing
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Machine learning is an experimental science. Practice hypothesis testing by tuning a single
              factor at a time and evaluating whether the outcome aligns with mathematical expectations.
            </p>
          </div>
        </div>
      </div>

      {/* Experiment Specification Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
            Guided Experiment: {prompt.title}
          </span>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            {prompt.question}
          </h3>
        </div>

        {/* Experiment Controller */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Hyperparameter: <code>{prompt.parameterName}</code></span>
              <span className="font-mono font-bold text-teal-800 text-sm">{paramVal}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParamVal(prompt.defaultVal)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition-all ${
                  paramVal === prompt.defaultVal
                    ? "border-teal-700 bg-teal-50 text-teal-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Baseline ({prompt.defaultVal})
              </button>

              <button
                type="button"
                onClick={() => setParamVal(prompt.testVal)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold border transition-all ${
                  paramVal === prompt.testVal
                    ? "border-amber-600 bg-amber-50 text-amber-900 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Experimental ({prompt.testVal})
              </button>
            </div>
          </div>

          {/* Metric Comparison Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Measured {comparison.metricLabel} (real runs on this dataset)
            </span>
            <div className="flex items-baseline gap-4 font-mono">
              <div>
                <span className="text-[11px] text-slate-500 font-sans block">Baseline:</span>
                <span className="text-xl font-bold text-slate-700">{comparison.baselineVal}</span>
              </div>
              <span className="text-xl text-slate-400">→</span>
              <div>
                <span className="text-[11px] text-teal-700 font-sans font-bold block">Current:</span>
                <span className="text-2xl font-black text-teal-900">{comparison.testVal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Observation Note */}
        <div className="rounded-lg bg-teal-50/60 border border-teal-200 p-4 text-xs text-teal-950 space-y-1">
          <span className="font-bold block">What the two runs show:</span>
          <p className="leading-relaxed">{comparison.observation}</p>
        </div>

        {/* Run & Save Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            {isSaved
              ? "✓ Experiment logged to your persistent project telemetry."
              : "Save this run to compare in your final project portfolio."}
          </p>

          <button
            type="button"
            onClick={handleRunAndSave}
            className="rounded-lg bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
          >
            {isSaved ? "Re-Record Experiment ✓" : "Record Experiment in History →"}
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Training
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Experiment Verified: Proceed to Multi-Metric Evaluation →
        </button>
      </div>
    </div>
  );
}


type Run = ReturnType<typeof runProject>;
const f = (x: number, d = 3) => (Number.isFinite(x) ? Number(x.toPrecision(d)).toLocaleString() : "∞");
const pc = (x: number) => `${(x * 100).toFixed(1)}%`;

/** Compare two real runs and say what changed, in plain words. */
function describeExperiment(param: string, baseVal: number, val: number, base: Run, cur: Run) {
  const same = val === baseVal;
  if (param === "threshold") {
    const b = base.result.classification!;
    const c = cur.result.classification!;
    const obs = same
      ? `At θ = ${val} the model catches ${pc(b.recall)} of positives with ${b.confusionMatrix.fp} false alarm(s) on the ${cur.testRaw.length} test rows. Switch to the experimental value to compare.`
      : `Moving θ from ${baseVal} to ${val} changed recall from ${pc(b.recall)} to ${pc(c.recall)} and false alarms from ${b.confusionMatrix.fp} to ${c.confusionMatrix.fp} (precision ${pc(b.precision)} → ${pc(c.precision)}). ${c.recall > b.recall ? "A lower threshold flags more cases, so fewer positives slip through but more innocents get flagged." : c.recall === b.recall ? "On this small test set no extra positives were caught; the threshold change would matter more on borderline cases." : "A higher threshold flags fewer cases."}`;
    return { metricLabel: "test recall", baselineVal: pc(b.recall), testVal: pc(c.recall), observation: obs };
  }
  if (param === "clusters") {
    const b = base.result.clustering!;
    const c = cur.result.clustering!;
    const drop = b.inertia > 0 ? (b.inertia - c.inertia) / b.inertia : 0;
    const obs = same
      ? `With K = ${val}, inertia is ${b.inertia} and the clusters have ${b.clusterSizes.join(", ")} customers. Switch to the experimental value to compare.`
      : `Going from K = ${baseVal} to K = ${val} cut inertia from ${b.inertia} to ${c.inertia} (${Math.round(drop * 100)}% lower); cluster sizes went from ${b.clusterSizes.join(", ")} to ${c.clusterSizes.join(", ")}. ${drop > 0.4 ? "A drop that large suggests a real extra group was being merged before." : "A small drop suggests the extra cluster mostly splits an existing group, so the smaller K may be enough."}`;
    return { metricLabel: "inertia", baselineVal: String(b.inertia), testVal: String(c.inertia), observation: obs };
  }
  // Learning rate.
  const lossB = base.result.frames?.at(-1)?.loss ?? NaN;
  const lossC = cur.result.frames?.at(-1)?.loss ?? NaN;
  const epochs = cur.options.epochs ?? 100;
  if (cur.result.regression && base.result.regression) {
    const b = base.result.regression;
    const c = cur.result.regression;
    const obs = same
      ? `With α = ${val}, ${epochs} epochs of gradient descent reach a training loss of ${f(lossB)} and test MSE ${f(b.testMse)} (R² ${f(b.testR2)}). Switch to the experimental value to compare.`
      : cur.result.diverged
        ? `With α = ${val} training diverged: every step overshot the minimum by more than the last, and the loss grew to ${f(lossC)} instead of shrinking. The learning rate is above the stability limit for this data, so use something smaller.`
        : `With α = ${val} the training loss after ${epochs} epochs was ${f(lossC)} versus ${f(lossB)} at α = ${baseVal}${lossC < lossB ? ": the bigger steps got closer to the best fit in the same time" : ": the bigger steps did not help"}. Test MSE went from ${f(b.testMse)} to ${f(c.testMse)} and R² from ${f(b.testR2)} to ${f(c.testR2)}${cur.testRaw.length < 5 ? `. With only ${cur.testRaw.length} test rows, small changes in test error are mostly noise` : ""}.`;
    return { metricLabel: "test MSE", baselineVal: f(b.testMse), testVal: cur.result.diverged ? "diverged" : f(c.testMse), observation: obs };
  }
  const b = base.result.classification!;
  const c = cur.result.classification!;
  const obs = same
    ? `With α = ${val}, ${epochs} epochs reach a training log loss of ${f(lossB)} and ${pc(b.accuracy)} test accuracy. Switch to the experimental value to compare.`
    : cur.result.diverged
      ? `With α = ${val} training diverged: the steps overshot and the loss grew. Use a smaller learning rate.`
      : `With α = ${val} the training log loss after ${epochs} epochs was ${f(lossC)} versus ${f(lossB)} at α = ${baseVal}, so ${lossC < lossB ? "the model became more confident faster" : "it did not train faster"}. Test accuracy went from ${pc(b.accuracy)} to ${pc(c.accuracy)}${c.accuracy === b.accuracy ? " (both runs already classify every test row the same way, so a lower loss shows up as more confident probabilities rather than more correct answers)" : ""}.`;
  return { metricLabel: "training log loss", baselineVal: f(lossB), testVal: cur.result.diverged ? "diverged" : f(lossC), observation: obs };
}
