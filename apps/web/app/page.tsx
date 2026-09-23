import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { HeroInteractiveTimeline } from "@/features/home/hero-interactive-timeline";
import { TheProblemSection } from "@/features/home/the-problem-section";
import { TimelineCenterpiece } from "@/features/home/timeline-centerpiece";
import { ModelXRayPreview } from "@/features/home/model-xray-preview";
import { LearningLoopInteractive } from "@/features/home/learning-loop-interactive";
import { AlgorithmShowcase } from "@/features/home/algorithm-showcase";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-16">
        {/* ==========================================================================
            HERO SECTION
            ========================================================================== */}
        <section
          className="relative rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden space-y-8"
          aria-labelledby="hero-title"
        >
          {/* Subtle Ambient Radial Lighting */}
          <div
            className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Typography, Narrative & CTAs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-950/80 border border-teal-500/30 px-3.5 py-1 text-xs font-mono font-semibold text-teal-300">
                <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                <span>MLINGO // V9.0 // FRAME BY FRAME</span>
              </div>

              <div className="space-y-3">
                <h1
                  id="hero-title"
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]"
                >
                  Machine Learning, <br />
                  <span className="bg-gradient-to-r from-teal-300 via-teal-100 to-amber-200 bg-clip-text text-transparent">
                    Frame by Frame.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  Don&apos;t just train a model. <strong className="text-white">Watch it learn.</strong>{" "}
                  Record real optimization runs and scrub through weights, gradients, and loss curves as training unfolds.
                </p>
              </div>

              {/* Clear CTA Hierarchy */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-700 px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-teal-500/25 hover:from-teal-400 hover:to-teal-600 transition-all hover:scale-[1.02] active:scale-[0.98] text-center cursor-pointer"
                >
                  <span>⚡ Try Interactive Demo →</span>
                </Link>

                <Link
                  href="/labs"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-4 text-xs font-mono font-bold text-slate-200 hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all text-center"
                >
                  Explore Labs
                </Link>
              </div>

              {/* Quick Orientation Note */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
                <span className="text-amber-400">●</span>
                <span>Zero setup required · 100% client-side interactive telemetry</span>
              </div>
            </div>

            {/* Right Column: Interactive Scrubbable Timeline Visualization */}
            <div className="lg:col-span-7">
              <HeroInteractiveTimeline />
            </div>
          </div>
        </section>

        {/* ==========================================================================
            SECTION 01: THE EDUCATIONAL PROBLEM (TRADITIONAL VS MLINGO)
            ========================================================================== */}
        <TheProblemSection />

        {/* ==========================================================================
            SECTION 02: THE TRAINING TIMELINE CENTERPIECE
            ========================================================================== */}
        <TimelineCenterpiece />

        {/* ==========================================================================
            SECTION 03: MODEL X-RAY INSPECTION SHOWCASE
            ========================================================================== */}
        <ModelXRayPreview />

        {/* ==========================================================================
            SECTION 04: THE 8-STEP LEARNING LOOP
            ========================================================================== */}
        <LearningLoopInteractive />

        {/* ==========================================================================
            SECTION 05: ALGORITHM ARCHITECTURE SHOWCASE
            ========================================================================== */}
        <AlgorithmShowcase />

        {/* ==========================================================================
            SECTION 06: PLATFORM PATHWAYS & FINAL CALL TO ACTION
            ========================================================================== */}
        <section className="space-y-6 pt-4" aria-labelledby="pathways-heading">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700">
                <span>06 // READY TO EXPLORE?</span>
              </div>
              <h2
                id="pathways-heading"
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950"
              >
                Choose Your Starting Point
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Whether you want to explore the guided tour, build end-to-end portfolio projects, or test failure modes, MLingo has a pathway for you.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/demo"
              className="group rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/70 to-white p-6 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-base font-bold text-teal-950 group-hover:text-teal-800">
                  Interactive Demo Tour
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The recommended 5-minute introduction. Train, scrub, inspect Model X-Ray, ask the AI Tutor, and run a controlled experiment.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800">Start 5-min demo →</span>
            </Link>

            <Link
              href="/projects"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">🚀</span>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-900">
                  Project Studio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete guided end-to-end data science projects: Salary Prediction, Student Exam Outcome, and Customer Segmentation.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">Open Project Studio →</span>
            </Link>

            <Link
              href="/workbench"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">📊</span>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-900">
                  Data Science Workbench
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Clean missing values, scale features, prevent data leakage during train/test split, and evaluate ROC curves.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">Open Workbench →</span>
            </Link>

            <Link
              href="/challenges"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">⚡</span>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-900">
                  Break Mode Challenges
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Intentionally break optimization conditions to diagnose exploding loss, threshold trade-offs, and vanishing gradients.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">Test Your Intuition →</span>
            </Link>

            <Link
              href="/portfolio"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">📁</span>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-900">
                  Personal ML Portfolio
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Review your completed projects, inspect professional ML case studies, and export markdown reports.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">View Portfolio →</span>
            </Link>

            <Link
              href="/learn"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <span className="text-2xl">📚</span>
                <h3 className="text-base font-bold text-slate-950 group-hover:text-teal-900">
                  Foundations Curriculum
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Step-by-step conceptual lessons covering features, loss surfaces, classification probabilities, and cluster inertia.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-700">Open Curriculum →</span>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
