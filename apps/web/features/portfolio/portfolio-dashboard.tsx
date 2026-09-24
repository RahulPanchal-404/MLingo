"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  getPortfolioProjects,
  getPortfolioSummary,
  type PortfolioProjectCardData,
  type PortfolioSummaryStats,
} from "./portfolio-helpers";
import { downloadProjectMarkdown } from "./portfolio-export";

const emptySubscribe = () => () => {};

export function PortfolioDashboard() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [projects, setProjects] = useState<PortfolioProjectCardData[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryStats>({
    completedProjects: 0,
    inProgressProjects: 0,
    notStartedProjects: 0,
    totalExperiments: 0,
    totalConcepts: 0,
  });

  useEffect(() => {
    if (!isMounted) return;
    const refresh = () => {
      setProjects(getPortfolioProjects());
      setSummary(getPortfolioSummary());
    };
    refresh();

    window.addEventListener("mlingo-project-state-change", refresh);
    window.addEventListener("mlingo-experiments-change", refresh);
    window.addEventListener("mlingo-activity-change", refresh);
    return () => {
      window.removeEventListener("mlingo-project-state-change", refresh);
      window.removeEventListener("mlingo-experiments-change", refresh);
      window.removeEventListener("mlingo-activity-change", refresh);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const hasCompleted = summary.completedProjects > 0;

  return (
    <div className="space-y-8">
      {/* Portfolio Header */}
      <header className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white shadow-xs">
                📁
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                Showcase & Case Studies
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Your ML Portfolio
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Inspect and export your machine learning engineering work. Every case study is generated from your real preprocessing, training, and evaluation telemetry.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl bg-teal-800 dark:bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-900 dark:hover:bg-teal-600 transition-colors"
            >
              Explore Projects →
            </Link>
          </div>
        </div>

        {/* Honest Storage & Sharing Callout */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Local Browser Storage:</strong> Your learning memory is stored in this browser.
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Export your case study to share your work via Markdown (.md) or Print/PDF.
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Projects Completed
            </span>
            <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              {summary.completedProjects}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">of 3 available</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              In Progress
            </span>
            <div className="text-2xl font-extrabold font-mono text-teal-700 dark:text-teal-400">
              {summary.inProgressProjects}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">active workflows</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Experiments Conducted
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-800 dark:text-white">
              {summary.totalExperiments}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">empirical sweeps</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Concepts Practiced
            </span>
            <div className="text-2xl font-extrabold font-mono text-slate-800 dark:text-white">
              {summary.totalConcepts}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">across curriculum</span>
          </div>
        </div>
      </header>

      {/* Empty State Banner if no project completed yet */}
      {!hasCompleted && (
        <section className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 dark:border-teal-800/60 dark:bg-slate-900/60 p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-2xl shadow-inner">
            🌱
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              No projects completed yet.
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Complete a Project Studio project and your work will appear here. You&apos;ll formulate real problems, clean data, run training experiments, and document findings into a portfolio-ready case study.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Explore Projects
            </Link>
            <Link
              href="/projects/salary-prediction"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 dark:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 dark:hover:bg-teal-600 transition-colors"
            >
              Start Your First Project →
            </Link>
          </div>
        </section>
      )}

      {/* Projects Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Project Showcase & Case Studies
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {projects.length} Guided Projects
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {projects.map(({ project, state, status, percentage, completedCount, totalCount, experimentCount, reflectionCount }) => {
            const isCompleted = status === "Completed";
            const isInProgress = status === "In Progress";

            return (
              <article
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-5"
              >
                {/* Header & Badges */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {project.type}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                          : isInProgress
                          ? "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {project.tagline}
                  </p>
                </div>

                {/* Progress & Telemetry Snapshot */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                        {percentage}% ({completedCount}/{totalCount})
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? "bg-emerald-600 dark:bg-emerald-500" : "bg-teal-600 dark:bg-teal-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-2 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase">Model</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{project.modelName}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-2 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase">Dataset</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{project.datasetId}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-2 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase">Experiments</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{experimentCount} recorded</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-2 border border-slate-200 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-sans block uppercase">Reflections</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{reflectionCount} documented</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 text-center text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {isCompleted ? "Review Studio" : isInProgress ? "Continue" : "Start"}
                    </Link>

                    <Link
                      href={`/portfolio/${project.id}`}
                      className="rounded-xl bg-teal-800 dark:bg-teal-700 py-2 text-center text-xs font-semibold text-white shadow-xs hover:bg-teal-900 dark:hover:bg-teal-600 transition-colors"
                    >
                      View Case Study
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadProjectMarkdown(project, state)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 py-1.5 text-center text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    ⬇️ Download Markdown (.md)
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
