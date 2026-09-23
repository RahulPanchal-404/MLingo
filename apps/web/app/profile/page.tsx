"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { readLearningActivity, type LearningActivity } from "@/features/progress/activity";
import { resetOnboarding } from "@/features/onboarding/onboarding-storage";
import { getPortfolioSummary } from "@/features/portfolio/portfolio-helpers";
import { ThemeSwitch } from "@/features/theme/theme-switch";
import { useTheme } from "@/features/theme/theme-provider";

const emptySubscribe = () => () => {};

export function ProfileView() {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activity, setActivity] = useState<LearningActivity>(() => readLearningActivity());
  const [portfolioStats, setPortfolioStats] = useState(() => getPortfolioSummary());
  const [message, setMessage] = useState<string | null>(null);
  const [tutorPosition, setTutorPosition] = useState<string>("bottom-right");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!isMounted) return;
    const refresh = () => {
      setActivity(readLearningActivity());
      setPortfolioStats(getPortfolioSummary());
      const savedPos = window.localStorage.getItem("mlingo.tutor.position") || "bottom-right";
      setTutorPosition(savedPos);
    };
    refresh();
    window.addEventListener("mlingo-activity-change", refresh);
    window.addEventListener("mlingo-project-state-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mlingo-activity-change", refresh);
      window.removeEventListener("mlingo-project-state-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  const handleTutorPositionChange = (pos: "top-left" | "top-right" | "bottom-left" | "bottom-right") => {
    setTutorPosition(pos);
    window.localStorage.setItem("mlingo.tutor.position", pos);
    window.dispatchEvent(new Event("storage"));
    setMessage(`AI Tutor docked to ${pos.replace("-", " ")}.`);
    window.setTimeout(() => setMessage(null), 3000);
  };

  const handleReplayOnboarding = () => {
    resetOnboarding();
    setMessage("Onboarding walkthrough reset. Revisit the home page to replay.");
    window.setTimeout(() => setMessage(null), 3500);
  };

  const handleResetData = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(
      "Are you sure you want to reset all stored progress, experiments, and project milestones? This action clears browser localStorage and cannot be undone."
    );
    if (confirmed) {
      window.localStorage.clear();
      resetOnboarding();
      window.location.reload();
    }
  };

  // Derive learner rank
  const totalScore =
    (activity.labsExplored || 0) * 15 +
    (activity.challengesCompleted?.length || 0) * 25 +
    (activity.projectsCompleted || 0) * 50 +
    (activity.experimentsRun || 0) * 5;

  let learnerLevel = "ML Apprentice";
  let learnerTier = "Level 1";
  if (totalScore > 200) {
    learnerLevel = "Applied ML Practitioner";
    learnerTier = "Level 4";
  } else if (totalScore > 100) {
    learnerLevel = "Diagnostic Investigator";
    learnerTier = "Level 3";
  } else if (totalScore > 40) {
    learnerLevel = "Lab Explorer";
    learnerTier = "Level 2";
  }

  return (
    <div className="space-y-8 max-w-5xl py-2">
      {/* Toast notification */}
      {message && (
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 p-3 text-xs font-semibold text-teal-800 dark:text-teal-200 flex items-center justify-between shadow-xs">
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-teal-600 dark:text-teal-400 hover:text-teal-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Header & Learner Identity */}
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-2xl font-black text-white shadow-md">
              ML
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-teal-700 dark:text-teal-300">
                  {learnerTier}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {learnerLevel}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Learner Workspace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Local browser telemetry, appearance preferences &amp; diagnostic memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/progress"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              View Learning Journey →
            </Link>
          </div>
        </div>

        {/* Real Activity Telemetry Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Labs Explored
            </span>
            <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {activity.labsExplored} <span className="text-xs font-normal text-slate-400">/ 4</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Missions Solved
            </span>
            <div className="text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {activity.challengesCompleted?.length || 0} <span className="text-xs font-normal text-slate-400">/ 6</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Completed Projects
            </span>
            <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
              {portfolioStats.completedProjects} <span className="text-xs font-normal text-slate-400">/ 3</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Experiments Run
            </span>
            <div className="text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {activity.experimentsRun || 0}
            </div>
          </div>
        </div>
      </header>

      {/* Workspace Preferences Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Workspace Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure how MLingo looks, renders, and assists during your training investigations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Appearance & Color Theme */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Color Appearance
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Currently rendered in <strong className="capitalize text-teal-600 dark:text-teal-400">{resolvedTheme}</strong> theme.
                </p>
              </div>
            </div>
            <div className="pt-2">
              <ThemeSwitch />
            </div>
          </div>

          {/* AI Tutor Snap Dock Position */}
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5 space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                AI Tutor Snap Dock Corner
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Set where the AI Tutor pill attaches so it stays out of your way.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(
                [
                  { id: "bottom-right", label: "Bottom Right" },
                  { id: "bottom-left", label: "Bottom Left" },
                  { id: "top-right", label: "Top Right" },
                  { id: "top-left", label: "Top Left" },
                ] as const
              ).map((corner) => (
                <button
                  key={corner.id}
                  type="button"
                  onClick={() => handleTutorPositionChange(corner.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    tutorPosition === corner.id
                      ? "bg-teal-600 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-500/50"
                  }`}
                >
                  {corner.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fast Navigation Section */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Portfolio &amp; Guided Tours
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/portfolio"
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📁</span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  My Engineering Portfolio
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Export case study summaries and project milestone artifacts
                </div>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">→</span>
          </Link>

          <Link
            href="/demo"
            className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚡</span>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Interactive Platform Tour
                </div>
                <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  Revisit the 8-step frame-by-frame learning loop and key workflows
                </div>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all">→</span>
          </Link>
        </div>
      </section>

      {/* Safety & Local Data Management */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Data Safety &amp; Local Storage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            MLingo runs purely client-side with your browser&apos;s localStorage. No remote databases or accounts required.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Replay onboarding */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                First-Time Onboarding Walkthrough
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Re-trigger the 4-step welcome guide explaining the Record → Scrub → Inspect mechanics.
              </p>
            </div>
            <button
              type="button"
              id="replay-onboarding-button"
              onClick={handleReplayOnboarding}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              🚀 Replay Onboarding
            </button>
          </div>

          {/* Destructive Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 p-4">
            <div>
              <div className="text-xs font-bold text-red-900 dark:text-red-300">
                Reset Local Learning Data
              </div>
              <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                Clears all stored progress, project milestone states, and parameter sweep experiments from your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors shrink-0 cursor-pointer"
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
