import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

const learningLoopSteps = [
  { step: "LEARN", label: "Understand the idea", icon: "📖" },
  { step: "RUN", label: "Train a real model", icon: "▶️" },
  { step: "SCRUB", label: "Move through training frame by frame", icon: "⏱️" },
  { step: "INSPECT", label: "See what changed inside", icon: "🔬" },
  { step: "BREAK", label: "Intentionally create interesting behavior", icon: "⚡" },
  { step: "COMPARE", label: "Test different choices", icon: "⚖️" },
  { step: "UNDERSTAND", label: "Connect behavior to math", icon: "💡" },
  { step: "BUILD", label: "Apply it in a project", icon: "🚀" },
];

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-10">
        {/* Hero Section */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs sm:p-12 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3.5 py-1 text-xs font-semibold text-teal-800">
              <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              Machine Learning, Frame by Frame
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl leading-[1.15]">
              See what happens inside a model while it learns.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed sm:text-lg max-w-2xl">
              Run a real model, scrub through its training, and see exactly how its parameters and loss change frame by frame.
            </p>
          </div>

          {/* CTA Group: Interactive Demo is Visually Dominant */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-800 px-7 py-4 text-sm font-extrabold text-white shadow-md hover:bg-teal-900 transition-all hover:scale-[1.01] active:scale-[0.99] text-center cursor-pointer"
            >
              <span>⚡ Try Interactive Demo →</span>
            </Link>

            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              Start Learning
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              Explore Projects
            </Link>
          </div>

          {/* New to MLingo? Banner */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/70 via-teal-50/40 to-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                New to MLingo?
              </span>
              <p className="text-xs text-slate-700">
                Start with the 5-minute interactive demo. No setup required.
              </p>
            </div>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 transition-colors shrink-0"
            >
              Launch 5-min demo →
            </Link>
          </div>

          {/* The 8-Step Learning Loop with Micro-Cards */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                The MLingo Learning Loop
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                8 interconnected steps of deep machine learning understanding
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {learningLoopSteps.map((item, idx) => (
                <div
                  key={item.step}
                  className="group relative rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:border-teal-300 hover:bg-teal-50/40 transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-teal-900 block">
                      {item.step}
                    </span>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Broader Capabilities Grid: Below the Primary Hero Action */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Explore the Platform
            </h2>
            <span className="text-xs text-slate-400">
              Interactive tools for every stage of your ML journey
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/labs"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">🧪</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Interactive Labs
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Run Linear Regression, Logistic Regression, K-Means, or Neural Networks with frame scrubbing and Model X-Ray.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">Browse labs →</span>
            </Link>

            <Link
              href="/workbench"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">📊</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Data Science Workbench
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clean missing values, scale features, prevent data leakage during train/test split, and evaluate ROC curves.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">Open workbench →</span>
            </Link>

            <Link
              href="/projects"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">🚀</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Project Studio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete guided end-to-end data science projects: Salary Prediction, Student Outcome, and Retail Segmentation.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">Launch Project Studio →</span>
            </Link>

            <Link
              href="/challenges"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">⚡</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Break Mode Challenges
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Intentionally break optimization conditions to diagnose exploding loss, threshold trade-offs, and plateaus.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">Test intuition →</span>
            </Link>

            <Link
              href="/portfolio"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">📁</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Personal Portfolio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review your completed projects, inspect professional ML case studies, and export markdown reports.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">View portfolio →</span>
            </Link>

            <Link
              href="/learn"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <span className="text-xl">📚</span>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Curriculum & Foundations
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Step-by-step conceptual lessons covering features, loss surfaces, classification probabilities, and cluster inertia.
                </p>
              </div>
              <span className="text-xs font-semibold text-teal-700">Open curriculum →</span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
