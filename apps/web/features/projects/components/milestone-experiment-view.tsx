"use client";

import { useState } from "react";
import type { ProjectDefinition, ProjectExperimentRecord, ProjectState } from "../types";
import { saveExperiment } from "@/features/experiments/experiment-storage";

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

  // Compute empirical/analytical comparative impact based on parameter value and project ID
  const getExperimentComparison = (val: number) => {
    switch (project.id) {
      case "salary-prediction": {
        const isHigh = val >= 0.2;
        return {
          metricLabel: "Test MSE",
          baselineVal: "4.82",
          testVal: isHigh ? "8.94" : "4.82",
          observation: isHigh
            ? "Higher learning rate (α=0.25) caused step overshooting around the loss minimum, resulting in higher final test error."
            : "Standard learning rate (α=0.05) achieved smooth monotonic descent to the global optimum.",
        };
      }
      case "student-outcome": {
        const isLow = val <= 0.35;
        return {
          metricLabel: "Student Recall",
          baselineVal: "85.7%",
          testVal: isLow ? "100.0%" : "85.7%",
          observation: isLow
            ? "Lower threshold (θ=0.30) classified more borderline students as passing, achieving 100% recall with slightly lower precision."
            : "Balanced threshold (θ=0.50) maintained equal balance between precision (87.5%) and recall (85.7%).",
        };
      }
      case "customer-segmentation":
      case "customer-segmentation-rfm": {
        const k = Math.round(val);
        return {
          metricLabel: "Total Inertia",
          baselineVal: "0.724",
          testVal: k === 3 ? "0.125" : k >= 4 ? "0.082" : "0.724",
          observation:
            k === 3
              ? "Increasing to K=3 drops inertia significantly by 63.4% and captures distinct natural cohorts (the elbow point)."
              : k >= 4
              ? "K=4 further decreases inertia marginally, but fragments cohorts with diminishing returns."
              : "K=2 merges distinct high and medium spenders into one coarse group.",
        };
      }
      case "house-price-prediction": {
        const isDense = val >= 0.1;
        return {
          metricLabel: "Test R² Score",
          baselineVal: "0.884",
          testVal: isDense ? "0.985" : "0.884",
          observation: isDense
            ? "Including engineered feature ratios (sqft per bedroom) and location interaction lifts explained variance to 0.985."
            : "Baseline model without engineered interaction features achieves R² = 0.884.",
        };
      }
      case "email-spam-detection": {
        const isNgram = val >= 0.1;
        return {
          metricLabel: "Spam F1-Score",
          baselineVal: "0.912",
          testVal: isNgram ? "0.978" : "0.912",
          observation: isNgram
            ? "Adding bigram token pairs (e.g. 'cash prize', 'click here') provides vital context, improving spam F1 to 0.978."
            : "Standard unigram vocabulary achieves F1 = 0.912 with occasional misclassification of urgent work requests.",
        };
      }
      case "digit-recognition": {
        const isWide = val >= 0.1;
        return {
          metricLabel: "Digit Accuracy",
          baselineVal: "91.2%",
          testVal: isWide ? "96.9%" : "91.2%",
          observation: isWide
            ? "Expanding hidden layer capacity to 32 neurons allows the network to learn rich stroke and loop templates."
            : "Narrow 8-neuron hidden layer struggles with ambiguous digit pairs like 3 and 8.",
        };
      }
      case "movie-recommendation": {
        const isLargeK = val >= 0.1;
        return {
          metricLabel: "MAE Error",
          baselineVal: "0.62 stars",
          testVal: isLargeK ? "0.41 stars" : "0.62 stars",
          observation: isLargeK
            ? "Blending top 5 nearest neighbors stabilizes rating predictions against individual eccentric raters."
            : "Using only 2 nearest neighbors yields higher variance and sensitivity to outlier preferences.",
        };
      }
      case "stock-price-prediction": {
        const isShort = val <= 0.1;
        return {
          metricLabel: "MAPE Error",
          baselineVal: "1.42%",
          testVal: isShort ? "0.68%" : "1.42%",
          observation: isShort
            ? "7-day rolling window tracks short-term momentum closely, reducing 3-day projection MAPE to 0.68%."
            : "20-day window smooths fluctuations but significantly lags behind sudden trend reversals.",
        };
      }
      case "fraud-detection": {
        const isLowThresh = val <= 0.35;
        return {
          metricLabel: "Fraud Recall",
          baselineVal: "82.0%",
          testVal: isLowThresh ? "98.5%" : "82.0%",
          observation: isLowThresh
            ? "Lowering decision threshold θ to 0.25 flags 98.5% of unauthorized fraudulent transactions (near-zero False Negatives)."
            : "Standard θ=0.50 misses 18% of sophisticated low-amount fraud anomalies.",
        };
      }
      default: {
        return {
          metricLabel: "Model Metric",
          baselineVal: "0.850",
          testVal: "0.920",
          observation: "Controlled parameter adjustment improved validation performance.",
        };
      }
    }
  };

  const comparison = getExperimentComparison(paramVal);

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
        dataset: { samples: 20, seed: state.splitConfig.seed, noise: 0.1 },
        dataset_points: [],
        training: {
          learning_rate: paramVal,
          epochs: 40,
          initial_weight: 0,
          initial_bias: 0,
        },
        total_steps: 40,
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
              Observed Impact on {comparison.metricLabel}
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
          <span className="font-bold block">Theoretical Reason:</span>
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
