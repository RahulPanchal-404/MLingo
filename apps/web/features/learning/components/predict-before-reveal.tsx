"use client";

import { useState } from "react";

export type PredictOption = {
  id: string;
  label: string;
  isAccurate?: boolean;
};

export type PredictBeforeRevealProps = {
  title?: string;
  question: string;
  contextNote?: string;
  options: PredictOption[];
  onPredict?: (optionId: string) => void;
  revealed?: boolean;
  actualOutcome?: {
    headline: string;
    explanation: string;
    accurateOptionId: string;
  };
};

export function PredictBeforeReveal({
  title = "Think Before You Run",
  question,
  contextNote,
  options,
  onPredict,
  revealed = false,
  actualOutcome,
}: PredictBeforeRevealProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelect = (id: string) => {
    if (isLocked) return;
    setSelectedId(id);
  };

  const handleLockIn = () => {
    if (!selectedId) return;
    setIsLocked(true);
    onPredict?.(selectedId);
  };

  const showOutcome = (isLocked || revealed) && actualOutcome;
  const isSelectedAccurate = selectedId === actualOutcome?.accurateOptionId;

  return (
    <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/60 to-slate-50 p-5 shadow-xs space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-700 text-sm text-white shadow-xs">
            🤔
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
            {title}
          </span>
        </div>
        {isLocked && !showOutcome && (
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
            Prediction locked in
          </span>
        )}
      </div>

      {/* Question */}
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {question}
        </h3>
        {contextNote && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {contextNote}
          </p>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isAccurate = actualOutcome?.accurateOptionId === opt.id;

          let optionStyle = "border-slate-200 bg-white hover:border-slate-300 text-slate-700";
          if (isSelected) {
            optionStyle = "border-teal-600 bg-teal-50/80 text-teal-950 ring-1 ring-teal-600";
          }
          if (showOutcome) {
            if (isAccurate) {
              optionStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500 font-semibold";
            } else if (isSelected && !isAccurate) {
              optionStyle = "border-amber-400 bg-amber-50/70 text-slate-700 line-through opacity-80";
            } else {
              optionStyle = "border-slate-200 bg-white/70 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isLocked}
              onClick={() => handleSelect(opt.id)}
              className={`w-full flex items-center justify-between rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${optionStyle} ${
                isLocked ? "cursor-default" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                    isSelected
                      ? "border-teal-600 bg-teal-600 text-white font-bold"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
                <span>{opt.label}</span>
              </div>
              {showOutcome && isAccurate && (
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Observed Outcome
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Action / Lock-in */}
      {!isLocked && (
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            disabled={!selectedId}
            onClick={handleLockIn}
            className="rounded-xl bg-teal-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Lock in prediction & see what happens →
          </button>
        </div>
      )}

      {/* Revealed Outcome Explanation */}
      {showOutcome && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-base">{isSelectedAccurate ? "🎉" : "💡"}</span>
            <div className="text-xs font-bold text-slate-900">
              {isSelectedAccurate ? "Your hypothesis was confirmed!" : "Here is what actually happened:"}
            </div>
          </div>
          <div className="text-xs font-semibold text-teal-900">
            {actualOutcome.headline}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {actualOutcome.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
