"use client";

import { useSyncExternalStore } from "react";
import { useTutor } from "../tutor-provider";

const emptySubscribe = () => () => {};

export function TutorLauncher() {
  const { isOpen, toggleTutor, activeContext } = useTutor();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isMounted) return null;

  const training = activeContext.training;
  const project = activeContext.project;

  let contextSnippet = "";
  if (project?.project_title) {
    contextSnippet = `${project.project_title} • ${project.milestone_title || "Project"}`;
  } else if (training?.algorithm) {
    const name = training.algorithm.replace(/_/g, " ");
    contextSnippet = `${name} • Step ${training.selected_step + 1}/${training.total_steps}`;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <button
        type="button"
        id="mlingo-tutor-launcher-button"
        onClick={toggleTutor}
        aria-label={isOpen ? "Close MLingo AI Tutor" : "Open MLingo AI Tutor"}
        className="group relative flex items-center gap-2.5 rounded-full border border-teal-500/40 bg-slate-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:border-teal-400 hover:bg-slate-900 hover:shadow-teal-900/20 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-teal-400/50 cursor-pointer"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs transition-transform group-hover:scale-110">
          💡
        </span>
        <span className="tracking-wide">
          {isOpen ? "Close Tutor" : "Ask MLingo Tutor"}
        </span>

        {contextSnippet && !isOpen && (
          <span className="hidden sm:inline-block max-w-[160px] truncate rounded-full bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 text-[10px] text-teal-300 font-normal">
            {contextSnippet}
          </span>
        )}

        <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse" />
      </button>
    </div>
  );
}
