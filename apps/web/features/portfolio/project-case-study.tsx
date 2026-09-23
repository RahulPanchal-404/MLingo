"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { ProjectDefinition, ProjectState } from "@/features/projects/types";
import { getProjectProgress, loadProjectState } from "@/features/projects/project-storage";
import { downloadProjectMarkdown } from "./portfolio-export";

const emptySubscribe = () => () => {};

export function ProjectCaseStudy({ project }: { project: ProjectDefinition }) {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [state, setState] = useState<ProjectState>(() => loadProjectState(project.id));

  useEffect(() => {
    if (!isMounted) return;
    const refresh = () => setState(loadProjectState(project.id));
    refresh();
    window.addEventListener("mlingo-project-state-change", refresh);
    return () => window.removeEventListener("mlingo-project-state-change", refresh);
  }, [project.id, isMounted]);

  if (!isMounted) return null;

  const { status, percentage, completedCount, totalCount } = getProjectProgress(state);
  const isCompleted = status === "Completed";
  const completedDateStr = state.completedAt
    ? new Date(state.completedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "In Progress";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 print:hidden">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Portfolio
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            type="button"
            onClick={() => downloadProjectMarkdown(project, state)}
            className="rounded-lg bg-teal-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 transition-colors cursor-pointer"
          >
            ⬇️ Download Markdown
          </button>
          <Link
            href={`/projects/${project.slug}`}
            className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors"
          >
            Open in Studio
          </Link>
        </div>
      </div>

      {/* Case Study Document Card */}
      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Document Header */}
        <header className="border-b border-slate-100 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
              ML Case Study · {project.type}
            </span>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold border ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-teal-50 text-teal-800 border-teal-200"
              }`}
            >
              {status} ({percentage}%)
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {project.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {project.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-mono text-slate-600 pt-2">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Model</span>
              <strong className="text-slate-800">{project.modelName}</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Dataset</span>
              <strong className="text-slate-800">{project.datasetId}</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Completed</span>
              <strong className="text-slate-800">{completedDateStr}</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Milestones</span>
              <strong className="text-slate-800">{completedCount} of {totalCount}</strong>
            </div>
          </div>
        </header>

        {/* Section 1: Problem Formulation */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">1</span>
            Problem Statement & Framing
          </h2>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>{project.problemStatement}</p>
            <div className="pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Learning Objectives:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                {project.learningObjectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Data Quality & Preprocessing Pipeline */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">2</span>
            Preprocessing & Data Hygiene Pipeline
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Pipeline Step</th>
                  <th className="px-4 py-2.5">Selected Strategy</th>
                  <th className="px-4 py-2.5">Engineering Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">Numeric Scaling</td>
                  <td className="px-4 py-2.5 font-mono text-teal-800">{state.preprocessingConfig.numericScaling}</td>
                  <td className="px-4 py-2.5 text-slate-500">Normalizes numerical magnitudes to prevent steep gradients in high-variance dimensions.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">Missing Imputation</td>
                  <td className="px-4 py-2.5 font-mono text-teal-800">{state.preprocessingConfig.missingImputation}</td>
                  <td className="px-4 py-2.5 text-slate-500">Estimates unrecorded entries using statistical central tendencies without leaking test distribution.</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-slate-800">Categorical Encoding</td>
                  <td className="px-4 py-2.5 font-mono text-teal-800">{state.preprocessingConfig.categoricalEncoding}</td>
                  <td className="px-4 py-2.5 text-slate-500">Encodes string classes into discrete binary indicators for linear tensor projections.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Train / Test Split & Leakage Prevention */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">3</span>
            Train/Test Splitting & Leakage Prevention
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs font-mono">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Train Partition</span>
              <strong className="text-slate-800 text-sm">{(state.splitConfig.trainRatio * 100).toFixed(0)}%</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Test Partition</span>
              <strong className="text-slate-800 text-sm">{((1 - state.splitConfig.trainRatio) * 100).toFixed(0)}%</strong>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[10px] text-slate-400 font-sans block uppercase">Random Seed</span>
              <strong className="text-slate-800 text-sm">{state.splitConfig.seed} (Deterministic)</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">
            🛡️ <strong>Leakage defense:</strong> Preprocessing pipelines were fitted strictly on the training partition and transformed onto the test partition.
          </p>
        </section>

        {/* Section 4: Scientific Experiments */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">4</span>
            Empirical Experiments Conducted
          </h2>
          {state.experiments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
              No empirical parameter sweeps saved yet for this project. Return to Milestone 08 in Project Studio to record hyperparameter runs.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Experiment Title</th>
                    <th className="px-4 py-2.5">Parameter Value</th>
                    <th className="px-4 py-2.5">Metric</th>
                    <th className="px-4 py-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {state.experiments.map((exp) => (
                    <tr key={exp.id}>
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-800">{exp.title}</td>
                      <td className="px-4 py-2.5 text-teal-800">{exp.parameterVal}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-sans">{exp.metricLabel}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">{exp.metricValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 5: Learner Reflections */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">5</span>
            Learner Reflections & Qualitative Analysis
          </h2>
          {Object.entries(state.reflections).length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 text-center">
              No written reflections recorded yet. Complete Milestone 11 to document qualitative evaluation notes.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(state.reflections).map(([key, text]) => {
                const promptObj = project.reflectionPrompts.find((p) => p.id === key);
                return (
                  <div key={key} className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      {promptObj ? promptObj.prompt : `Reflection (${key})`}
                    </span>
                    <blockquote className="text-xs text-slate-600 italic border-l-2 border-teal-600 pl-3 py-0.5">
                      &quot;{text.trim()}&quot;
                    </blockquote>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 6: Lessons Learned */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-[11px] font-bold text-teal-800">6</span>
            Key Lessons & Next Concepts
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Core Lessons Learned:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {project.lessonsLearned.map((l, idx) => (
                  <li key={idx}>{l}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Recommended Next Topics:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                {project.nextConcepts.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
