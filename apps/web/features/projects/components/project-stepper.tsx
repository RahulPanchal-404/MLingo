"use client";

import type { ProjectMilestone, ProjectMilestoneId } from "../types";

export type ProjectStepperProps = {
  milestones: ProjectMilestone[];
  currentMilestoneId: ProjectMilestoneId;
  completedMilestones: ProjectMilestoneId[];
  onSelectMilestone: (id: ProjectMilestoneId) => void;
};

export function ProjectStepper({
  milestones,
  currentMilestoneId,
  completedMilestones,
  onSelectMilestone,
}: ProjectStepperProps) {
  const completedSet = new Set(completedMilestones);

  return (
    <nav aria-label="Project Milestones Navigation" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="border-b border-slate-100 pb-3 mb-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Guided Journey / Milestones
        </p>
      </div>

      <ol className="space-y-1">
        {milestones.map((m) => {
          const isCompleted = completedSet.has(m.id);
          const isCurrent = currentMilestoneId === m.id;
          // Unlocked if completed, current, or immediately following a completed one (or milestone 1)
          const isFirst = m.order === 1;
          const prevCompleted = m.order > 1 && completedSet.has(milestones[m.order - 2].id);
          const isUnlocked = isCompleted || isCurrent || isFirst || prevCompleted;

          return (
            <li key={m.id}>
              <button
                type="button"
                disabled={!isUnlocked}
                onClick={() => onSelectMilestone(m.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all ${
                  isCurrent
                    ? "bg-teal-50 text-teal-950 font-bold border border-teal-200 shadow-xs"
                    : isCompleted
                    ? "text-slate-800 font-semibold hover:bg-slate-50"
                    : isUnlocked
                    ? "text-slate-600 hover:bg-slate-50"
                    : "text-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-teal-700 text-white ring-2 ring-teal-300"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : m.order}
                  </span>
                  <span className="truncate">{m.title}</span>
                </div>

                <span className="shrink-0 text-[10px] font-mono font-medium text-slate-400">
                  {m.tag}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
