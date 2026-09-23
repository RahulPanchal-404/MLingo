"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { readLearningActivity, type LearningActivity } from "@/features/progress/activity";
import { resetOnboarding } from "@/features/onboarding/onboarding-storage";
import { getPortfolioSummary } from "@/features/portfolio/portfolio-helpers";

const emptySubscribe = () => () => {};

export function ProfileView() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activity, setActivity] = useState<LearningActivity>(() => readLearningActivity());
  const [portfolioStats, setPortfolioStats] = useState(() => getPortfolioSummary());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isMounted) return;
    const refresh = () => {
      setActivity(readLearningActivity());
      setPortfolioStats(getPortfolioSummary());
    };
    refresh();
    window.addEventListener("mlingo-activity-change", refresh);
    window.addEventListener("mlingo-project-state-change", refresh);
    return () => {
      window.removeEventListener("mlingo-activity-change", refresh);
      window.removeEventListener("mlingo-project-state-change", refresh);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const handleReplayOnboarding = () => {
    resetOnboarding();
    setMessage("Onboarding flow reopened.");
    window.setTimeout(() => setMessage(null), 3000);
  };

  const handleResetData = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "Are you sure you want to reset all stored progress, experiments, and project data? This cannot be undone."
    );
    if (confirmed) {
      window.localStorage.clear();
      resetOnboarding();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Profile Header */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-2xl font-bold text-teal-800">
            ML
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              MLingo Learner Profile
            </h1>
            <p className="text-xs text-slate-500">
              Personal machine learning workspace & local learning history
            </p>
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-xs text-teal-800">
            {message}
          </div>
        )}

        {/* Activity Summary Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-4 border-t border-slate-100">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Labs Explored
            </span>
            <div className="text-xl font-extrabold font-mono text-slate-800">
              {activity.labsExplored}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Experiments Run
            </span>
            <div className="text-xl font-extrabold font-mono text-slate-800">
              {activity.experimentsRun}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Projects Completed
            </span>
            <div className="text-xl font-extrabold font-mono text-emerald-700">
              {portfolioStats.completedProjects}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Concepts Practiced
            </span>
            <div className="text-xl font-extrabold font-mono text-teal-700">
              {activity.concepts.length}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Access & Actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Workspace Navigation
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/portfolio"
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-xs font-semibold text-slate-800 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">📁</span>
              <div>
                <div>My Project Portfolio</div>
                <div className="text-[11px] font-normal text-slate-500">View case studies and export reports</div>
              </div>
            </div>
            <span>→</span>
          </Link>

          <Link
            href="/demo"
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-xs font-semibold text-slate-800 hover:border-teal-300 hover:bg-teal-50/30 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">⚡</span>
              <div>
                <div>Interactive Tour</div>
                <div className="text-[11px] font-normal text-slate-500">Revisit the 8-step learning loop</div>
              </div>
            </div>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Preferences & Reset */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Preferences & Data Management
        </h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div>
              <div className="text-xs font-bold text-slate-800">
                First-Time Onboarding
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Review the 4-step welcome walkthrough introducing MLingo&apos;s philosophy and learning loop.
              </p>
            </div>
            <button
              type="button"
              id="replay-onboarding-button"
              onClick={handleReplayOnboarding}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            >
              🚀 Replay Onboarding
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 bg-red-50/30 p-4">
            <div>
              <div className="text-xs font-bold text-red-900">
                Reset Local Learning Data
              </div>
              <p className="text-[11px] text-red-700 mt-0.5">
                Clears all stored progress, project states, and experiment sweeps from your browser&apos;s localStorage.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
            >
              Reset All Progress
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
    </AppShell>
  );
}
