import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs sm:p-10 space-y-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-800">
              <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              Machine Learning, Frame by Frame
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
              See what happens inside a model while it learns.
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed sm:text-base">
              Understand how models learn by watching, inspecting, and experimenting with training. Record real gradient descent updates, scrub through exact frames, and ground every parameter in mathematics and code.
            </p>
          </div>

          {/* Three Distinct CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-xl bg-teal-800 px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-teal-900 transition-all cursor-pointer"
            >
              Start Learning →
            </Link>

            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-xl border border-teal-300 bg-teal-50/60 px-5 py-3 text-xs font-bold text-teal-900 hover:bg-teal-100/70 transition-all cursor-pointer"
            >
              ⚡ Try Interactive Demo
            </Link>

            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Explore Projects
            </Link>
          </div>

          {/* Core Learning Loop Strip */}
          <div className="pt-6 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              The MLingo Learning Loop:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-700">
              {["LEARN", "RUN", "SCRUB", "INSPECT", "BREAK", "COMPARE", "UNDERSTAND", "BUILD"].map((step, idx) => (
                <span key={step} className="flex items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-800 border border-slate-200">
                    {step}
                  </span>
                  {idx < 7 && <span className="text-slate-300">→</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Pathways Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/learn"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className="text-xl">📚</span>
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Foundations Curriculum
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Step-by-step interactive lessons covering features, loss surfaces, classification probabilities, and cluster inertia.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700">Open curriculum →</span>
          </Link>

          <Link
            href="/labs"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className="text-xl">🧪</span>
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Interactive Labs
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run Linear Regression, Logistic Regression, K-Means, or Neural Networks with timeline scrubbing and Model X-Ray.
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
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Data Science Workbench
              </h2>
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
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Project Studio
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete guided end-to-end data science projects: Salary Prediction, Student Outcome, and Retail Segmentation.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700">Launch Project Studio →</span>
          </Link>

          <Link
            href="/portfolio"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className="text-xl">📁</span>
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Personal Portfolio
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review your completed projects, inspect professional ML case studies, and export markdown reports.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700">View portfolio →</span>
          </Link>

          <Link
            href="/challenges"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 text-left flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <span className="text-xl">⚡</span>
              <h2 className="text-sm font-bold text-slate-900 group-hover:text-teal-900">
                Break Mode Challenges
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intentionally break optimization conditions to diagnose exploding loss, vanishing gradients, and plateaus.
              </p>
            </div>
            <span className="text-xs font-semibold text-teal-700">Test intuition →</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
