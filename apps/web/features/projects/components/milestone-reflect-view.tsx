"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";

export type MilestoneReflectViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onUpdateReflections: (reflections: Record<string, string>) => void;
  onFinalizeProject: () => void;
  onBack: () => void;
};

export function MilestoneReflectView({
  project,
  state,
  onUpdateReflections,
  onFinalizeProject,
  onBack,
}: MilestoneReflectViewProps) {
  const [answers, setAnswers] = useState<Record<string, string>>(state.reflections);
  const isCompleted = state.completed;

  const handleChange = (id: string, text: string) => {
    const next = { ...answers, [id]: text };
    setAnswers(next);
    onUpdateReflections(next);
  };

  const handleCompleteProject = () => {
    onFinalizeProject();
    // Record to progress tracking
    recordLearningActivity({
      projectsCompleted: 1,
      concepts: project.focusConcepts,
    });
    recordRunConcepts(project.focusConcepts);
  };

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">✍️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Synthesis, Conceptual Reflection & Completion
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Reflect on the end-to-end engineering decisions made: from raw missing data imputation and train/test leakage
              isolation to loss optimization, hyperparameter experimentation, and generalization metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Reflection Questionnaire Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
            Guided Project Reflection
          </span>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Consolidate Your Engineering Understanding
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Record your answers below. Responses are saved locally with your project state.
          </p>
        </div>

        <div className="space-y-4">
          {project.reflectionPrompts.map((q) => (
            <div key={q.id} className="space-y-1.5">
              <label htmlFor={`reflection-${q.id}`} className="block text-xs font-bold text-slate-800">
                {q.prompt}
              </label>
              <p className="text-[11px] text-slate-500 font-sans italic">{q.guidance}</p>
              <textarea
                id={`reflection-${q.id}`}
                rows={2}
                value={answers[q.id] ?? ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          ))}
        </div>

        {!isCompleted && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleCompleteProject}
              className="rounded-lg bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-colors"
            >
              Finalize & Complete Project ✓
            </button>
          </div>
        )}
      </div>

      {/* FACTUAL PROJECT COMPLETION SUMMARY */}
      {isCompleted && (
        <div className="rounded-xl border-2 border-emerald-500 bg-white p-6 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-800">
                ✓
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Milestones Satisfied
                </span>
                <h2 className="text-xl font-black text-slate-950">
                  Project Complete: {project.title}
                </h2>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
              Completed on {new Date().toLocaleDateString()}
            </span>
          </div>

          {/* Factual Context Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Dataset & Split</span>
              <p className="mt-1 font-bold text-slate-900">{project.datasetId}</p>
              <p className="text-slate-500 mt-0.5">
                {Math.round(state.splitConfig.trainRatio * 100)}% Train / {Math.round((1 - state.splitConfig.trainRatio) * 100)}% Test
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Trained Model</span>
              <p className="mt-1 font-bold text-slate-900">{project.modelName}</p>
              <p className="text-slate-500 mt-0.5">
                Run ID: {state.trainingRunId ?? "Deterministic engine run"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400">Experiments Logged</span>
              <p className="mt-1 font-bold text-teal-800">{state.experiments.length} runs recorded</p>
              <p className="text-slate-500 mt-0.5">Available in Experiment History</p>
            </div>
          </div>

          {/* Core Lessons Learned */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Core Engineering Takeaways
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
              {project.lessonsLearned.map((lesson, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{lesson}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Concepts to Study */}
          <div className="rounded-lg bg-teal-50/50 p-4 border border-teal-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Recommended Next Concepts to Study
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.nextConcepts.map((c) => (
                <span
                  key={c}
                  className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-teal-800 border border-teal-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Return & Explorer CTA Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/projects"
              className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
            >
              ← Back to Project Studio
            </Link>
            <Link
              href="/progress"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View Updated Learning Progress
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Interpretation
        </button>
      </div>
    </div>
  );
}
