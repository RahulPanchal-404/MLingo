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

  const isInProgress = status === "In Progress";
  const isCompleted = status === "Completed";

  const statusBadgeClasses = {
    "Not Started":
      "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    "In Progress":
      "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse",
    Completed:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  }[status];

  const typeBadgeClasses = {
    regression: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    classification:
      "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    clustering:
      "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  }[project.type];

  // Visual SVG preview based on project type
  const renderPreview = () => {
    if (project.type === "regression") {
      return (
        <svg viewBox="0 0 160 80" className="w-full h-20 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Regression Preview">
          <line x1="15" y1="65" x2="145" y2="65" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          <line x1="15" y1="15" x2="15" y2="65" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          {[[25, 55], [40, 50], [55, 42], [70, 38], [85, 34], [100, 28], [115, 24], [130, 18]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2.5" fill="#38bdf8" />
          ))}
          <line x1="20" y1="60" x2="135" y2="16" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (project.type === "classification") {
      return (
        <svg viewBox="0 0 160 80" className="w-full h-20 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Classification Preview">
          <line x1="15" y1="65" x2="145" y2="65" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          <line x1="15" y1="15" x2="15" y2="65" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
          {[[30, 55], [45, 45], [55, 50], [40, 35]].map(([cx, cy], i) => (
            <circle key={`c0-${i}`} cx={cx} cy={cy} r="3" fill="#38bdf8" />
          ))}
          {[[95, 25], [110, 35], [125, 20], [120, 40]].map(([cx, cy], i) => (
            <circle key={`c1-${i}`} cx={cx} cy={cy} r="3" fill="#f59e0b" />
          ))}
          <line x1="60" y1="70" x2="100" y2="10" stroke="#14b8a6" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 160 80" className="w-full h-20 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Clustering Preview">
        {[[35, 25], [45, 20], [30, 35], [40, 30]].map(([cx, cy], i) => (
          <circle key={`k1-${i}`} cx={cx} cy={cy} r="2.5" fill="#14b8a6" />
        ))}
        <circle cx="38" cy="28" r="5" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
        {[[115, 25], [125, 20], [120, 35], [130, 30]].map(([cx, cy], i) => (
          <circle key={`k2-${i}`} cx={cx} cy={cy} r="2.5" fill="#a855f7" />
        ))}
        <circle cx="122" cy="28" r="5" fill="none" stroke="#c084fc" strokeWidth="1.5" />
        {[[75, 55], [85, 50], [80, 65], [90, 60]].map(([cx, cy], i) => (
          <circle key={`k3-${i}`} cx={cx} cy={cy} r="2.5" fill="#f59e0b" />
        ))}
        <circle cx="82" cy="58" r="5" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>
    );
  };

  // Find next milestone to complete
  const nextMilestone = project.milestones.find((m) => !state.completedMilestones.includes(m.id));

  return (
    <article
      className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900/90 p-6 shadow-xs transition-all ${
        isInProgress
          ? "border-amber-400/80 dark:border-amber-500/60 ring-2 ring-amber-400/20 shadow-md"
          : "border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-slate-700 hover:shadow-md"
      }`}
      aria-label={`Project: ${project.title}`}
    >
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider ${typeBadgeClasses}`}
            >
              {project.type}
            </span>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {project.difficulty}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ~{project.estimatedMinutes}m
            </span>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider ${statusBadgeClasses}`}
          >
            {status}
          </span>
        </div>

        {/* Visual Preview */}
        {renderPreview()}

        {/* Title & Tagline */}
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{project.title}</h3>
          <p className="mt-1 text-xs font-semibold text-teal-800 dark:text-teal-400">{project.tagline}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
            {project.problemStatement}
          </p>
        </div>

        {/* Key Concepts */}
        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Core Concepts
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {project.focusConcepts.slice(0, 4).map((concept) => (
              <span
                key={concept}
                className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300"
              >
                {concept}
              </span>
            ))}
            {project.focusConcepts.length > 4 && (
              <span className="rounded-md bg-slate-50 dark:bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                +{project.focusConcepts.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Active Milestone Callout if In Progress */}
        {isInProgress && nextMilestone && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 p-2.5 text-xs text-amber-900 dark:text-amber-200">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
              NEXT MILESTONE ({nextMilestone.order}/11):
            </span>
            <span className="font-semibold">{nextMilestone.title}</span>
          </div>
        )}
      </div>

      {/* Progress & Action Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs font-mono font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            <span>Project Milestones</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {completedCount}/{totalCount} ({percentage}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted ? "bg-emerald-500" : "bg-teal-600 dark:bg-teal-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Link */}
        <Link
          href={`/projects/${project.slug}`}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer ${
            isInProgress
              ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
              : isCompleted
              ? "border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100"
              : "bg-teal-800 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white shadow-teal-800/20"
          }`}
        >
          <span>
            {isInProgress
              ? `⚡ Continue Building (${percentage}%) →`
              : isCompleted
              ? "Review Completed Case Study →"
              : "Start Building Project →"}
          </span>
        </Link>
      </div>
    </article>
  );
}
