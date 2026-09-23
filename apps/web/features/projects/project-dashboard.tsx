"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ALL_PROJECTS } from "./definitions";
import { loadAllProjectStates, getOverallProjectStats, createDefaultProjectState } from "./project-storage";
import { ProjectCard } from "./components/project-card";
import type { ProjectState } from "./types";

const emptySubscribe = () => () => {};

export function ProjectStudioDashboard() {
  const [states, setStates] = useState<Record<string, ProjectState>>(() => loadAllProjectStates());
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const handleUpdate = () => {
      setStates(loadAllProjectStates());
    };

    window.addEventListener("mlingo-project-state-change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("mlingo-project-state-change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const stats = getOverallProjectStats(ALL_PROJECTS);

  return (
    <section className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Vision */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 px-3 py-0.5 text-xs font-mono font-semibold text-teal-800 dark:text-teal-300">
            <span>BUILD WORKSPACE // CAPSTONE PROJECTS</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl tracking-tight">
            Project Studio
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Apply your verified understanding to end-to-end data science projects: from missing value cleaning and scaling to gradient training, experiment comparisons, and business interpretation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workbench"
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            Data Workbench
          </Link>
          <Link
            href="/portfolio"
            className="rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-xs font-mono font-bold text-white transition-colors shadow-sm"
          >
            My Portfolio →
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Available Projects
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{ALL_PROJECTS.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Regression, Classification, Clustering</p>
        </div>

        <div className="rounded-2xl border border-amber-300/80 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            In Progress
          </span>
          <p className="mt-1 text-2xl font-black text-amber-950 dark:text-amber-200">{isMounted ? stats.inProgress : 0}</p>
          <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">Active engineering workflows</p>
        </div>

        <div className="rounded-2xl border border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            Completed
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-950 dark:text-emerald-200">{isMounted ? stats.completed : 0}</p>
          <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">All 11 milestones satisfied</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Concepts Mastered
          </span>
          <p className="mt-1 text-2xl font-black text-teal-800 dark:text-teal-400">24+</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tracked in Learning Memory</p>
        </div>
      </div>

      {/* Focused 2-Column Desktop Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            state={states[project.id] ?? createDefaultProjectState(project.id)}
          />
        ))}
      </div>
    </section>
  );
}
