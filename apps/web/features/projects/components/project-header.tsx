"use client";

import Link from "next/link";
import type { ProjectDefinition, ProjectState } from "../types";
import { getProjectProgress } from "../project-storage";
import { PROJECT_MILESTONES } from "../definitions";

export type ProjectHeaderProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onReset: () => void;
};

export function ProjectHeader({ project, state, onReset }: ProjectHeaderProps) {
  const { completedCount, totalCount, percentage, status } = getProjectProgress(state);
  const currentMilestone =
    PROJECT_MILESTONES.find((m) => m.id === state.currentMilestoneId) ?? PROJECT_MILESTONES[0];

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset this project? All completed milestones and experiment records for this project will be cleared."
      )
    ) {
      onReset();
    }
  };

  return (
    <header className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link href="/projects" className="hover:text-teal-700 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">{project.title}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 hover:text-rose-600 transition-colors cursor-pointer"
          >
            Reset Project
          </button>
          <Link
            href="/projects"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            ← All Projects
          </Link>
        </div>
      </div>

      {/* Main Title & Tagline */}
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-mono font-extrabold text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
              PROJECT {String(project.projectNumber).padStart(2, "0")}
            </span>
            <h1 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              {project.title}
            </h1>
            <span className="rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              {project.type}
            </span>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {project.difficulty}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ~{project.estimatedMinutes} mins
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400 max-w-3xl">
            {project.tagline}
          </p>
        </div>

        <div className="text-right">
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              status === "Completed"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : status === "In Progress"
                ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Progress Bar & Current Status */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
          <span>
            Current: <strong className="text-slate-900 dark:text-white">{currentMilestone.tag}: {currentMilestone.title}</strong>
          </span>
          <span className="font-mono">
            {completedCount} of {totalCount} milestones completed ({percentage}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${
              status === "Completed" ? "bg-emerald-600" : "bg-teal-600"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </header>
  );
}
