"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTutor } from "../tutor-provider";
import { TutorMessageCard } from "./tutor-message-card";

const emptySubscribe = () => () => {};

export function TutorDrawer() {
  const {
    isOpen,
    closeTutor,
    activeContext,
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    suggestedPrompts,
  } = useTutor();

  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [inputText, setInputText] = useState("");
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeTutor();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeTutor]);

  if (!isMounted || !isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    void sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const training = activeContext.training;
  const project = activeContext.project;
  const evalCtx = activeContext.evaluation;
  const diagCtx = activeContext.diagnostic;

  return (
    <aside
      id="mlingo-tutor-drawer"
      aria-label="MLingo AI Tutor"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-in-out sm:max-w-lg"
    >
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-sm text-white shadow-xs">
            💡
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              MLingo AI Tutor
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Telemetry
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded Machine Learning Mentor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              title="Clear conversation history"
              className="rounded-lg p-1.5 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={closeTutor}
            title="Close Tutor (Esc)"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-base cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Collapsible Telemetry Context Inspector Banner */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 px-4 py-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {project?.project_title
                ? `Project: ${project.project_title}`
                : training?.algorithm
                ? `Lab: ${training.algorithm.replace(/_/g, " ")}`
                : "General Learning"}
            </span>
            {training && (
              <span className="rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Step {training.selected_step + 1}/{training.total_steps}
              </span>
            )}
            {project?.milestone_title && (
              <span className="rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {project.milestone_title}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsContextExpanded((prev) => !prev)}
            className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 cursor-pointer"
          >
            {isContextExpanded ? "Hide Telemetry ▲" : "View Telemetry ▼"}
          </button>
        </div>

        {/* Expanded Telemetry Details */}
        {isContextExpanded && (
          <div className="mt-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-[11px] space-y-2 animate-in fade-in-50 duration-200">
            <div className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider">
              Bound Telemetry Snapshot
            </div>

            {training && (
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  Loss: <strong className="text-slate-800 dark:text-slate-200">{training.loss !== null && training.loss !== undefined ? training.loss.toFixed(4) : "N/A"}</strong>
                </div>
                <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  LR (α): <strong className="text-slate-800 dark:text-slate-200">{training.learning_rate ?? "N/A"}</strong>
                </div>
                {training.bias !== null && training.bias !== undefined && (
                  <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    Bias: <strong className="text-slate-800 dark:text-slate-200">{training.bias.toFixed(3)}</strong>
                  </div>
                )}
                {training.inertia !== null && training.inertia !== undefined && (
                  <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    Inertia: <strong className="text-slate-800 dark:text-slate-200">{training.inertia.toFixed(2)}</strong>
                  </div>
                )}
                {training.weights && training.weights.length > 0 && (
                  <div className="col-span-2 rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 truncate">
                    Weights: {training.weights.map((w) => w.toFixed(3)).join(", ")}
                  </div>
                )}
              </div>
            )}

            {evalCtx && (
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  Task: <strong className="text-slate-800 dark:text-slate-200">{evalCtx.task_type}</strong>
                </div>
                {evalCtx.r2 !== null && evalCtx.r2 !== undefined && (
                  <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    R²: <strong className="text-slate-800 dark:text-slate-200">{evalCtx.r2.toFixed(3)}</strong>
                  </div>
                )}
                {evalCtx.accuracy !== null && evalCtx.accuracy !== undefined && (
                  <div className="rounded bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                    Accuracy: <strong className="text-slate-800 dark:text-slate-200">{(evalCtx.accuracy * 100).toFixed(1)}%</strong>
                  </div>
                )}
              </div>
            )}

            {diagCtx && (
              <div className="rounded bg-amber-50 dark:bg-amber-950/40 p-1.5 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[10px]">
                <strong>Diagnostic:</strong> {diagCtx.title} — {diagCtx.what_happened}
              </div>
            )}

            <p className="text-[10px] text-slate-400 italic">
              Tutor answers are strictly grounded in these exact metrics and formulas.
            </p>
          </div>
        )}
      </section>

      {/* Message List Scroll Area */}
      <section className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-950 text-2xl shadow-inner">
              💡
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Welcome to MLingo AI Tutor
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                Ask questions about your model parameters, gradients, loss curve, math equations, or code.
              </p>
            </div>

            {/* Quick Starter Suggestions */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Suggested questions for this state:
              </span>
              <div className="flex flex-col gap-1.5 text-left">
                {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2.5 text-xs font-medium text-teal-900 dark:text-teal-200 shadow-xs hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/50 dark:hover:bg-teal-950/50 transition-all text-left flex items-start gap-2 cursor-pointer"
                  >
                    <span className="text-teal-600 dark:text-teal-400 font-bold">💬</span>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <TutorMessageCard
                key={msg.id}
                message={msg}
                onSelectSuggestion={(prompt) => void sendMessage(prompt)}
              />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3.5 text-xs text-slate-500 dark:text-slate-400 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
                  <span className="italic text-slate-600 dark:text-slate-300">
                    Analyzing telemetry, gradient vector, and optimization step...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </section>

      {/* Suggested chips strip above input if messages exist */}
      {messages.length > 0 && suggestedPrompts.length > 0 && !isLoading && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
              Suggestions:
            </span>
            {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => void sendMessage(prompt)}
                className="shrink-0 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-900 dark:hover:text-teal-200 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-1.5">
        <div className="relative flex items-end gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 focus-within:border-teal-600 dark:focus-within:border-teal-400 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-1 focus-within:ring-teal-600">
          <textarea
            ref={inputRef}
            id="mlingo-tutor-input"
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this step, gradient, math, code..."
            className="flex-1 resize-none bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden max-h-24 overflow-y-auto"
            disabled={isLoading}
          />
          <button
            type="button"
            id="mlingo-tutor-send-button"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-700 dark:bg-teal-600 text-white disabled:opacity-40 hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg
              className="h-3.5 w-3.5 fill-current rotate-90"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Enter to send • Shift+Enter for newline</span>
          <span>Zero-key grounded fallback ready</span>
        </div>
      </footer>
    </aside>
  );
}
