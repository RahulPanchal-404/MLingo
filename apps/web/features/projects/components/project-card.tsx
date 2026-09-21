"use client";

import Link from "next/link";
import type { ProjectDefinition, ProjectState } from "../types";
import { getProjectProgress } from "../project-storage";

export type ProjectCardProps = {
  project: ProjectDefinition;
  state: ProjectState;
};

export function ProjectCard({ project, state }: ProjectCardProps) {
  const { completedCount, totalCount, percentage, status } = getProjectProgress(state);

  const statusBadgeClasses = {
    "Not Started": "bg-slate-100 text-slate-700 border-slate-200",
    "In Progress": "bg-amber-50 text-amber-800 border-amber-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
  }[status];

  const typeBadgeClasses = {
    regression: "bg-blue-50 text-blue-700 border-blue-200",
    classification: "bg-purple-50 text-purple-700 border-purple-200",
    clustering: "bg-teal-50 text-teal-700 border-teal-200",
  }[project.type];

  return (
    <article
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
      aria-label={`Project: ${project.title}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${typeBadgeClasses}`}
            >
              {project.type}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {project.difficulty}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ~{project.estimatedMinutes} mins
            </span>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${statusBadgeClasses}`}
          >
            {status}
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
          <p className="mt-1 text-sm font-medium text-teal-800">{project.tagline}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
            {project.problemStatement}
          </p>
        </div>

        {/* Key Concepts */}
        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Core Concepts
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {project.focusConcepts.slice(0, 5).map((concept) => (
              <span
                key={concept}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {concept}
              </span>
            ))}
            {project.focusConcepts.length > 5 && (
              <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                +{project.focusConcepts.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Action */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
          <span>Project Progress</span>
          <span className="font-mono font-bold text-slate-900">
            {completedCount}/{totalCount} milestones ({percentage}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-300 ${
              status === "Completed" ? "bg-emerald-600" : "bg-teal-600"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-5">
          <Link
            href={`/projects/${project.slug}`}
            className="flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
          >
            {status === "Not Started" && "Start Project →"}
            {status === "In Progress" && `Resume Milestone (${completedCount + 1}/${totalCount}) →`}
            {status === "Completed" && "Review Project & Insights →"}
          </Link>
        </div>
      </div>
    </article>
  );
}
