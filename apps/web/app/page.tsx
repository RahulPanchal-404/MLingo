import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { HeroInteractiveTimeline } from "@/features/home/hero-interactive-timeline";
import { TheProblemSection } from "@/features/home/the-problem-section";
import { TimelineCenterpiece } from "@/features/home/timeline-centerpiece";
import { ModelXRayPreview } from "@/features/home/model-xray-preview";
import { LearningLoopInteractive } from "@/features/home/learning-loop-interactive";
import { AlgorithmShowcase } from "@/features/home/algorithm-showcase";
import { ContourSignature } from "@/features/home/contour-signature";

const PATHWAYS = [
  {
    title: "Practise",
    items: [
      { href: "/learn", label: "Lessons", text: "29 short lessons, foundations to clustering." },
      { href: "/games", label: "Games", text: "Each level is one concept you have to use to win." },
      { href: "/challenges", label: "Challenges", text: "Break training on purpose and diagnose why." },
      { href: "/theory", label: "Theory & Math", text: "The equations behind every lesson." },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/workbench", label: "Workbench", text: "Clean data, scale features, split without leaks." },
      { href: "/projects", label: "Projects", text: "Salary, exam outcome and customer segments, end to end." },
      { href: "/portfolio", label: "Portfolio", text: "Your finished projects, exportable as reports." },
    ],
  },
];

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-20">
        <section className="relative isolate overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 px-6 py-10 sm:px-10 lg:px-12 lg:py-14 dark:border-slate-800 dark:bg-slate-900/60" aria-labelledby="hero-title">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <h1 id="hero-title" className="max-w-[12ch] text-5xl font-extrabold leading-[0.98] text-slate-950 sm:text-6xl lg:text-[4.5rem] dark:text-white">
                Watch a model learn.
              </h1>
              <p className="max-w-[46ch] text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                MLingo records real training runs so you can scrub through every step: the weights moving, the gradient pointing downhill, the loss dropping. Then you play it, break it and build with it.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/demo" className="press inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-teal-600 px-6 py-3.5 font-bold text-white hover:bg-teal-700 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200">
                  Take the 5-minute tour
                </Link>
                <Link href="/learn" className="press inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 font-bold text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-500">
                  Start the lessons
                </Link>
              </div>
              <ContourSignature className="pointer-events-none -mx-2 hidden h-44 w-[calc(100%+1rem)] sm:block" />
            </div>
            <div className="lg:col-span-7">
              <HeroInteractiveTimeline />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Drag the timeline to move through a recorded run.</p>
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

        <section className="grid gap-8 border-t border-slate-200 pt-12 lg:grid-cols-[1fr_1.4fr] dark:border-slate-800" aria-labelledby="pathways-heading">
          <div className="space-y-4">
            <h2 id="pathways-heading" className="text-3xl font-extrabold text-slate-950 dark:text-white">Where to go next</h2>
            <p className="max-w-[44ch] text-slate-600 dark:text-slate-400">
              New to machine learning? The tour trains a model in front of you, then hands you the controls. Everything after it is yours to explore in any order.
            </p>
            <Link href="/demo" className="press group block rounded-2xl bg-teal-600 p-6 text-white hover:bg-teal-700 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200">
              <span className="block font-display text-2xl font-extrabold">Interactive tour</span>
              <span className="mt-1 block opacity-85">Train, scrub, inspect the model, ask the tutor, run an experiment. About five minutes.</span>
            </Link>
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            {PATHWAYS.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="pb-2 text-lg font-bold text-slate-950 dark:text-white">{group.title}</h3>
                <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="group flex items-baseline justify-between gap-4 py-3.5">
                        <span>
                          <span className="block font-bold text-slate-900 transition-colors duration-200 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">{item.label}</span>
                          <span className="block text-sm text-slate-500 dark:text-slate-400">{item.text}</span>
                        </span>
                        <span aria-hidden="true" className="translate-x-0 text-slate-400 transition-transform duration-200 ease-[var(--ease-std)] group-hover:translate-x-1 group-hover:text-teal-600">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
