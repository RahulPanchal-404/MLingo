"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ALL_PROJECTS } from "./definitions";
import { loadAllProjectStates, getOverallProjectStats } from "./project-storage";
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
    <section className="space-y-8">
      {/* Header & Vision */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Guided Machine Learning / Frame by Frame
          </p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
            Project Studio
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Complete guided, end-to-end machine learning projects: from problem formulation and missing data
            cleaning to gradient optimization, scientific experimentation, and generalization interpretation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/workbench"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            Data Workbench
          </Link>
          <Link
            href="/learn"
            className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
          >
            Learn Curriculum
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available Projects
          </span>
          <p className="mt-1 text-2xl font-black text-slate-900">{ALL_PROJECTS.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Regression, Classification, Clustering</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            In Progress
          </span>
          <p className="mt-1 text-2xl font-black text-amber-950">{isMounted ? stats.inProgress : 0}</p>
          <p className="text-xs text-amber-800 mt-0.5">Active engineering workflows</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Completed
          </span>
          <p className="mt-1 text-2xl font-black text-emerald-950">{isMounted ? stats.completed : 0}</p>
          <p className="text-xs text-emerald-800 mt-0.5">All 11 milestones satisfied</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Concepts Touched
          </span>
          <p className="mt-1 text-2xl font-black text-teal-800">24+</p>
          <p className="text-xs text-slate-500 mt-0.5">Tracked in Learning Memory</p>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Select an End-to-End Project
          </h2>
          <span className="text-xs text-slate-500">
            Progress persists automatically in your browser
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ALL_PROJECTS.map((project) => {
            const projectState = states[project.id] ?? {
              projectId: project.id,
              currentMilestoneId: "problem",
              completedMilestones: [],
              preprocessingConfig: {
                numericScaling: "standard",
                missingImputation: "mean_mode",
                categoricalEncoding: "onehot",
              },
              splitConfig: { trainRatio: 0.8, seed: 42 },
              classificationThreshold: 0.5,
              trainingRunId: null,
              experiments: [],
              reflections: {},
              completed: false,
              completedAt: null,
              updatedAt: new Date().toISOString(),
            };

            return <ProjectCard key={project.id} project={project} state={projectState} />;
          })}
        </div>
      </div>

      {/* Educational Guidance Footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          The MLingo Project Philosophy: “Machine Learning, Frame by Frame”
        </h3>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed max-w-4xl">
          Unlike static coding exercises or disconnected black-box scripts, MLingo projects guide you through each
          substantive machine learning phase. You will observe how missing values propagate, why feature scaling preserves
          gradient balance, how train/test isolation prevents data leakage, and why decision thresholds calibrate real-world
          operational precision and recall.
        </p>
      </div>
    </section>
  );
}
