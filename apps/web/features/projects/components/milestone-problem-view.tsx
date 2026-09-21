"use client";

import type { ProjectDefinition } from "../types";

export type MilestoneProblemViewProps = {
  project: ProjectDefinition;
  onComplete: () => void;
};

export function MilestoneProblemView({ project, onComplete }: MilestoneProblemViewProps) {
  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🎯</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Problem Formulation
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Before writing code or loading matrices, every machine learning project begins with framing:
              defining the target $y$, determining feature candidates $X$, and choosing a measurable evaluation metric.
            </p>
          </div>
        </div>
      </div>

      {/* Main Problem Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Problem Statement
          </span>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {project.title}: Framing the Task
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
            {project.problemStatement}
          </p>
        </div>

        {/* Task Formulation Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Task Type
            </span>
            <p className="mt-1 text-base font-bold text-teal-900 capitalize">
              {project.type === "regression"
                ? "Supervised Regression"
                : project.type === "classification"
                ? "Binary Classification"
                : "Unsupervised Clustering"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {project.type === "regression"
                ? "Continuous real-valued prediction"
                : project.type === "classification"
                ? "Discrete binary probability estimation"
                : "Cohort grouping without supervisory labels"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Chosen Model Architecture
            </span>
            <p className="mt-1 text-base font-bold text-slate-900">
              {project.modelName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Deterministic educational algorithm with inspectable parameters
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Estimated Completion
            </span>
            <p className="mt-1 text-base font-bold text-slate-900">
              ~{project.estimatedMinutes} minutes
            </p>
            <p className="mt-1 text-xs text-slate-500">
              11 guided frame-by-frame milestones
            </p>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Project Learning Objectives
          </h3>
          <ul className="mt-3 space-y-2.5">
            {project.learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                  {idx + 1}
                </span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Confirm Understanding & Explore Dataset →
        </button>
      </div>
    </div>
  );
}
