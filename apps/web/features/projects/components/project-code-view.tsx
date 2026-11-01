"use client";

import { useState } from "react";
import type { ProjectDefinition } from "../types";

export function ProjectCodeView({ project }: { project: ProjectDefinition }) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (project.pythonSourceCode) {
      navigator.clipboard.writeText(project.pythonSourceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Technologies Used Banner */}
      {project.technologiesUsed && project.technologiesUsed.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Technologies & Libraries Used
          </span>
          <div className="flex flex-wrap gap-2">
            {project.technologiesUsed.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 px-3 py-1 text-xs font-mono font-bold text-teal-800 dark:text-teal-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-step Implementation Steps */}
      {project.implementationSteps && project.implementationSteps.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Step-by-Step Implementation Guide
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {project.implementationSteps.length} Steps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.implementationSteps.map((step) => (
              <div
                key={step.step}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-800 dark:bg-teal-600 text-[10px] font-mono font-bold text-white">
                    {step.step}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-7">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Python Source Code */}
      {project.pythonSourceCode && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-6 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white font-mono text-xs font-bold">
                Py
              </span>
              <span className="text-sm font-mono font-bold text-slate-200">
                Complete Python Source Code (Self-Contained)
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-mono font-bold transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? "✓ Copied to Clipboard" : "Copy Source Code"}
            </button>
          </div>

          <pre className="overflow-x-auto text-xs font-mono text-emerald-400 p-4 rounded-xl bg-slate-900 border border-slate-800 leading-relaxed max-h-[500px]">
            <code>{project.pythonSourceCode}</code>
          </pre>
        </div>
      )}

      {/* Code Explanations */}
      {project.codeExplanations && project.codeExplanations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Explanation of Important Code Sections
          </h3>
          <div className="space-y-3">
            {project.codeExplanations.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1.5"
              >
                <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-400 block">
                  {exp.section}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {exp.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expected Console Output */}
      {project.expectedOutput && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-6 shadow-xs space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Expected Terminal / Execution Output
          </span>
          <pre className="overflow-x-auto text-xs font-mono text-slate-300 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <code>{project.expectedOutput}</code>
          </pre>
        </div>
      )}

      {/* Real-World Applications & Additional Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {project.realWorldApplications && project.realWorldApplications.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 block">
              Real-World Industry Applications
            </span>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {project.realWorldApplications.map((app, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.additionalExercises && project.additionalExercises.length > 0 && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 p-6 shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
              Additional Exercises & Challenges
            </span>
            <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-200">
              {project.additionalExercises.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">→</span>
                  <span>{ex}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
