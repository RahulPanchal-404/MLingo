"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding, markOnboardingCompleted } from "./onboarding-storage";

const emptySubscribe = () => () => {};

export function OnboardingModal() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isOpen, setIsOpen] = useState(() => (typeof window !== "undefined" ? !hasCompletedOnboarding() : false));
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPath, setSelectedPath] = useState<string>("/learn");

  const handleSkip = () => {
    markOnboardingCompleted();
    setIsOpen(false);
  };

  const handleComplete = () => {
    markOnboardingCompleted();
    setIsOpen(false);
    router.push(selectedPath);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: Event) => {
      const custom = e as CustomEvent<{ completed?: boolean }>;
      if (typeof custom.detail?.completed === "boolean") {
        setIsOpen(!custom.detail.completed);
        if (!custom.detail.completed) {
          setStep(1);
        }
      }
    };

    window.addEventListener("mlingo-onboarding-change", handleStorageChange);
    return () => window.removeEventListener("mlingo-onboarding-change", handleStorageChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return (


    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to MLingo Onboarding"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white shadow-xs">
              M
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Welcome to MLingo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">
              Step {step} of 4
            </span>
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 min-h-[320px] flex flex-col justify-between">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800">
                ✨ Core Philosophy
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                “Machine Learning, Frame by Frame.”
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Most machine learning tools treat training as a black box: you write code, wait for a loop to finish, and look at a final accuracy number.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>MLingo makes the learning process visible.</strong> Watch gradients update weights step by step, scrub backwards to observe where the loss diverged, inspect internal parameters, and learn what math actually powers optimization.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800">
                🔄 The MLingo Learning Loop
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                How you learn in MLingo
              </h2>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 pt-1">
                {[
                  { tag: "LEARN", desc: "Build foundations in features & loss" },
                  { tag: "RUN", desc: "Train authentic gradient descent runs" },
                  { tag: "SCRUB", desc: "Timeline scrubber between exact frames" },
                  { tag: "INSPECT", desc: "Model X-Ray parameters & gradients" },
                  { tag: "EXPERIMENT", desc: "Compare hyperparameter sweeps" },
                  { tag: "BUILD", desc: "Complete guided data science projects" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left space-y-1"
                  >
                    <span className="text-[10px] font-mono font-bold tracking-wider text-teal-700 block">
                      {item.tag}
                    </span>
                    <p className="text-xs text-slate-600 leading-tight">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800">
                🎯 Choose Your Starting Point
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Where would you like to begin?
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-1">
                {[
                  {
                    id: "/learn",
                    title: "Understand ML Foundations",
                    desc: "Step-by-step curriculum starting with features, datasets, and loss.",
                    icon: "📚",
                  },
                  {
                    id: "/demo",
                    title: "Take the Interactive Demo",
                    desc: "2-minute live walkthrough scrubbing frames and asking the AI Tutor.",
                    icon: "⚡",
                  },
                  {
                    id: "/labs",
                    title: "Explore a Hands-on Lab",
                    desc: "Interactive Linear, Logistic, K-Means, or Neural Network lab.",
                    icon: "🧪",
                  },
                  {
                    id: "/projects",
                    title: "Start a Guided Project",
                    desc: "Complete end-to-end data science projects for your portfolio.",
                    icon: "🚀",
                  },
                ].map((option) => {
                  const isSelected = selectedPath === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPath(option.id)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-600"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {option.title}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                          {option.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">
                🎉 Ready to Explore
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                You are ready to begin.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Remember: in MLingo, whenever you feel curious or uncertain about what a gradient, parameter, or evaluation metric means, click the floating <strong>Ask MLingo Tutor</strong> button at the bottom right.
              </p>
              <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3.5 text-xs text-teal-950 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <span>
                  The AI Tutor inspects your active training state in real-time and grounds every explanation in actual mathematical evidence.
                </span>
              </div>
            </div>
          )}

          {/* Progress Indicators & Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    step === i
                      ? "w-6 bg-teal-700"
                      : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                id="onboarding-next-button"
                onClick={handleNext}
                className="rounded-lg bg-teal-800 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 transition-colors cursor-pointer"
              >
                {step === 4 ? "Start Learning" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
