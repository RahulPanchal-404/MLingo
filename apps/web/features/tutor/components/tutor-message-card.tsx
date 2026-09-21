"use client";

import type { TutorChatMessage } from "../types";

export type TutorMessageCardProps = {
  message: TutorChatMessage;
  onSelectSuggestion?: (prompt: string) => void;
};

export function TutorMessageCard({ message, onSelectSuggestion }: TutorMessageCardProps) {
  const isUser = message.role === "user";

  const handleScrollToAnchor = (anchorId?: string | null) => {
    if (!anchorId || typeof document === "undefined") return;
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("highlight-panel-pulse");
      window.setTimeout(() => {
        element.classList.remove("highlight-panel-pulse");
      }, 2000);
    }
  };

  const handleJumpToStep = (step?: number | null) => {
    if (step === undefined || step === null || typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("mlingo-jump-step", { detail: { step } })
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-teal-800 px-4 py-2.5 text-xs text-white shadow-xs leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-4 text-xs text-slate-800 shadow-sm space-y-3 leading-relaxed">
        {/* Tutor Badge Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-teal-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 text-xs">
              💡
            </span>
            <span>MLingo AI Tutor</span>
          </div>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200">
            {message.provider === "external_llm" ? "AI Telemetry Mentor" : "Grounded Telemetry Engine"}
          </span>
        </div>

        {/* Primary Answer */}
        <div className="whitespace-pre-line font-normal text-slate-800">
          {message.text}
        </div>

        {/* Why Reason */}
        {message.why && (
          <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider">
              Mathematical & Optimization Reason:
            </span>
            <p className="text-slate-600 leading-normal">{message.why}</p>
          </div>
        )}

        {/* Evidence from current state */}
        {message.evidence && message.evidence.length > 0 && (
          <div className="space-y-1">
            <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider block">
              Recorded Evidence from Context:
            </span>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2 text-[11px] font-mono">
              {message.evidence.map((ev, idx) => (
                <li
                  key={idx}
                  className="rounded bg-slate-100/80 px-2 py-1 text-slate-700 border border-slate-200 truncate"
                >
                  {ev}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Math Connection */}
        {message.math_connection && (
          <div className="rounded-md bg-teal-50/50 p-2 border border-teal-100 text-[11px] text-teal-950 font-sans">
            <span className="font-bold block text-[10px] uppercase tracking-wider text-teal-800">
              Formula Connection:
            </span>
            {message.math_connection}
          </div>
        )}

        {/* What to Inspect Next */}
        {message.what_to_inspect_next && (
          <p className="text-[11px] text-slate-500 italic">
            👉 <strong>Next:</strong> {message.what_to_inspect_next}
          </p>
        )}

        {/* Interactive Action Anchors */}
        {message.anchors && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
            {message.anchors.math_anchor_id && (
              <button
                type="button"
                onClick={() => handleScrollToAnchor(message.anchors?.math_anchor_id)}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                📐 Open in Math Mode
              </button>
            )}

            {message.anchors.code_anchor_id && (
              <button
                type="button"
                onClick={() => handleScrollToAnchor(message.anchors?.code_anchor_id)}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                💻 See in Code
              </button>
            )}

            {message.anchors.model_xray_anchor_id && (
              <button
                type="button"
                onClick={() => handleScrollToAnchor(message.anchors?.model_xray_anchor_id)}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                🔬 Inspect model state
              </button>
            )}

            {message.anchors.timeline_step !== undefined &&
              message.anchors.timeline_step !== null && (
                <button
                  type="button"
                  onClick={() => handleJumpToStep(message.anchors?.timeline_step)}
                  className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  ⏱️ Jump to step {message.anchors.timeline_step + 1}
                </button>
              )}
          </div>
        )}

        {/* Suggested Followup Prompts */}
        {message.suggested_followups &&
          message.suggested_followups.length > 0 &&
          onSelectSuggestion && (
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Follow-up Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.suggested_followups.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestion(q)}
                    className="rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-teal-800 hover:bg-teal-50 hover:border-teal-300 transition-colors text-left"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
