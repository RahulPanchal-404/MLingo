"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

type LabInfo = {
  href: string;
  tag: string;
  number: string;
  title: string;
  category: string;
  description: string;
  inspectionDetails: string;
  parameters: string[];
  svgType: "linear" | "logistic" | "kmeans" | "neural";
};

const labs: LabInfo[] = [
  {
    href: "/labs/gradient-descent",
    number: "01",
    tag: "Regression & Optimization",
    title: "Linear Regression & Gradient Descent",
    category: "Supervised Learning",
    description:
      "Watch a single linear hypothesis adapt to continuous data while parameter updates and the convex loss curve evolve frame by frame.",
    inspectionDetails:
      "Scrub step-by-step to observe slope (w) and intercept (b) adjustments, gradient vectors, and the direct impact of learning rate on convergence speed.",
    parameters: ["Learning Rate (α)", "Epochs", "Sample Size", "Noise Level"],
    svgType: "linear",
  },
  {
    href: "/labs/logistic-regression",
    number: "02",
    tag: "Classification & Probability",
    title: "Logistic Regression & Decision Boundaries",
    category: "Supervised Learning",
    description:
      "Observe sigmoid probabilities materialize into a calibrated decision boundary between two distinct classes with real-time log-loss tracking.",
    inspectionDetails:
      "Inspect probability surfaces, classification threshold cutoffs, confusion matrices, and the penalty dynamics of confident misclassifications.",
    parameters: ["Decision Threshold", "Learning Rate", "Epochs", "Class Separation"],
    svgType: "logistic",
  },
  {
    href: "/labs/k-means",
    number: "03",
    tag: "Unsupervised Clustering",
    title: "K-Means Clustering & Centroid Inertia",
    category: "Unsupervised Learning",
    description:
      "Witness unlabeled data self-organize as centroids migrate toward centers of density and Voronoi partition boundaries shift across iterations.",
    inspectionDetails:
      "Observe assignment toggles frame-by-frame, centroid displacement vectors, and within-cluster sum of squares (inertia) reduction until convergence.",
    parameters: ["Cluster Count (K)", "Init Seed", "Max Iterations", "Cluster Spread"],
    svgType: "kmeans",
  },
  {
    href: "/labs/neural-network",
    number: "04",
    tag: "Deep Learning & Backprop",
    title: "Neural Network & Analytical Backpropagation",
    category: "Deep Learning",
    description:
      "Explore non-linear feature space transformation with a multi-layer perceptron trained via exact analytical calculus backpropagation.",
    inspectionDetails:
      "Inspect hidden neuron activations, layer-by-layer weight matrices, analytical Jacobian gradients, and the curving decision boundary manifold.",
    parameters: ["Hidden Units", "Activation (Tanh/ReLU)", "Learning Rate", "Decision Grid"],
    svgType: "neural",
  },
];

function LabSvgGraphic({ type }: { type: LabInfo["svgType"] }) {
  if (type === "linear") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-32 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="24" y1="120" x2="260" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="24" y1="20" x2="24" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />
        {/* Scatter points */}
        <circle cx="50" cy="100" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="80" cy="85" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="110" cy="92" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="140" cy="65" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="170" cy="58" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="200" cy="40" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="230" cy="32" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        {/* Residual dashes */}
        <line x1="110" y1="92" x2="110" y2="76" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="170" y1="58" x2="170" y2="51" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 2" />
        {/* Fitted regression line */}
        <line x1="30" y1="112" x2="250" y2="24" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-teal-400" />
        {/* Mini loss indicator */}
        <rect x="180" y="10" width="76" height="24" rx="4" className="fill-slate-800/80 dark:fill-slate-900/90" />
        <text x="188" y="26" fontSize="9" fontWeight="600" className="fill-teal-300 font-mono">Loss: 0.042</text>
      </svg>
    );
  }

  if (type === "logistic") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-32 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Two-class background gradient representation */}
        <rect x="24" y="20" width="116" height="100" rx="4" className="fill-teal-500/10 dark:fill-teal-500/15" />
        <rect x="140" y="20" width="116" height="100" rx="4" className="fill-amber-500/10 dark:fill-amber-500/15" />
        {/* Class 0 points (Teal) */}
        <circle cx="55" cy="45" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="75" cy="70" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="95" cy="38" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="65" cy="95" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="105" cy="80" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        {/* Class 1 points (Amber) */}
        <circle cx="170" cy="50" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="195" cy="85" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="215" cy="42" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="180" cy="100" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="225" cy="75" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        {/* Decision Boundary Line */}
        <line x1="140" y1="18" x2="140" y2="122" stroke="#0f766e" strokeWidth="2.5" strokeDasharray="4 3" className="dark:stroke-teal-300" />
        <text x="145" y="32" fontSize="9" fontWeight="600" className="fill-teal-700 dark:fill-teal-300 font-mono">P = 0.50</text>
      </svg>
    );
  }

  if (type === "kmeans") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-32 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Cluster 1 (Teal) */}
        <circle cx="65" cy="45" r="3" className="fill-teal-500/70" />
        <circle cx="80" cy="35" r="3" className="fill-teal-500/70" />
        <circle cx="55" cy="65" r="3" className="fill-teal-500/70" />
        <circle cx="75" cy="60" r="3" className="fill-teal-500/70" />
        {/* Centroid 1 */}
        <circle cx="70" cy="50" r="7" className="stroke-teal-600 dark:stroke-teal-400" strokeWidth="2" fill="none" />
        <line x1="65" y1="50" x2="75" y2="50" stroke="#0d9488" strokeWidth="2" />
        <line x1="70" y1="45" x2="70" y2="55" stroke="#0d9488" strokeWidth="2" />

        {/* Cluster 2 (Indigo) */}
        <circle cx="190" cy="40" r="3" className="fill-indigo-500/70" />
        <circle cx="210" cy="50" r="3" className="fill-indigo-500/70" />
        <circle cx="225" cy="35" r="3" className="fill-indigo-500/70" />
        <circle cx="195" cy="65" r="3" className="fill-indigo-500/70" />
        {/* Centroid 2 */}
        <circle cx="205" cy="48" r="7" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" fill="none" />
        <line x1="200" y1="48" x2="210" y2="48" stroke="#6366f1" strokeWidth="2" />
        <line x1="205" y1="43" x2="205" y2="53" stroke="#6366f1" strokeWidth="2" />

        {/* Cluster 3 (Emerald) */}
        <circle cx="130" cy="95" r="3" className="fill-emerald-500/70" />
        <circle cx="145" cy="110" r="3" className="fill-emerald-500/70" />
        <circle cx="160" cy="90" r="3" className="fill-emerald-500/70" />
        <circle cx="135" cy="115" r="3" className="fill-emerald-500/70" />
        {/* Centroid 3 */}
        <circle cx="142" cy="102" r="7" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" fill="none" />
        <line x1="137" y1="102" x2="147" y2="102" stroke="#10b981" strokeWidth="2" />
        <line x1="142" y1="97" x2="142" y2="107" stroke="#10b981" strokeWidth="2" />
      </svg>
    );
  }

  // Neural network
  return (
    <svg
      viewBox="0 0 280 140"
      className="w-full h-32 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Connections Input -> Hidden */}
      <line x1="45" y1="45" x2="140" y2="30" stroke="#0d9488" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="45" y1="45" x2="140" y2="70" stroke="#0d9488" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="45" y1="45" x2="140" y2="110" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="45" y1="95" x2="140" y2="30" stroke="#0d9488" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="45" y1="95" x2="140" y2="70" stroke="#0d9488" strokeWidth="1.8" strokeOpacity="0.8" />
      <line x1="45" y1="95" x2="140" y2="110" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.4" />

      {/* Connections Hidden -> Output */}
      <line x1="140" y1="30" x2="235" y2="70" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="140" y1="70" x2="235" y2="70" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="140" y1="110" x2="235" y2="70" stroke="#6366f1" strokeWidth="1.4" strokeOpacity="0.6" />

      {/* Input Nodes (2) */}
      <circle cx="45" cy="45" r="7" className="fill-teal-600 dark:fill-teal-500 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
      <circle cx="45" cy="95" r="7" className="fill-teal-600 dark:fill-teal-500 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
      <text x="25" y="49" fontSize="8" fontWeight="600" className="fill-slate-500 font-mono">x₁</text>
      <text x="25" y="99" fontSize="8" fontWeight="600" className="fill-slate-500 font-mono">x₂</text>

      {/* Hidden Nodes (3) */}
      <circle cx="140" cy="30" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />
      <circle cx="140" cy="70" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />
      <circle cx="140" cy="110" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />

      {/* Output Node (1) */}
      <circle cx="235" cy="70" r="8" className="fill-amber-500 dark:fill-amber-400 stroke-amber-200 dark:stroke-amber-800" strokeWidth="2" />
      <text x="249" y="74" fontSize="9" fontWeight="700" className="fill-slate-700 dark:fill-slate-300 font-mono">ŷ</text>
    </svg>
  );
}

export default function LabsPage() {
  return (
    <AppShell>
      <div className="space-y-10 py-2">
        {/* Hero Section */}
        <header className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
            Interactive ML Playground
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            What do you want to watch learn?
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            Machine learning shouldn&apos;t be a black-box formula or static code snippet. In MLingo laboratories, every algorithm executes live mathematical training so you can scrub through frames, inspect internal parameter updates, and see true convergence in motion.
          </p>

          {/* 8-Step Learning Loop Pill Bar */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] mr-1">
                Learning Loop:
              </span>
              {[
                "LEARN",
                "RUN",
                "SCRUB",
                "INSPECT",
                "BREAK",
                "COMPARE",
                "UNDERSTAND",
                "BUILD",
              ].map((step, idx, arr) => (
                <span key={step} className="inline-flex items-center gap-1">
                  <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 font-mono text-teal-700 dark:text-teal-300 shadow-2xs">
                    {step}
                  </span>
                  {idx < arr.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-700">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* 4 Laboratory Playground Cards (2-Column Desktop Grid) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {labs.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs hover:border-teal-500/50 hover:shadow-lg dark:hover:border-teal-500/40 transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    LAB {lab.number}
                  </span>
                  <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                    {lab.category}
                  </span>
                </div>

                {/* SVG Visual Demo */}
                <LabSvgGraphic type={lab.svgType} />

                {/* Title & Tagline */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    {lab.tag}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {lab.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {lab.description}
                  </p>
                </div>

                {/* Inspection Deep Dive */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>🔬 What You&apos;ll Inspect</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                    {lab.inspectionDetails}
                  </p>
                </div>

                {/* Tunable Parameters */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                    Tunable Controls:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {lab.parameters.map((param) => (
                      <span
                        key={param}
                        className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-semibold text-teal-600 dark:text-teal-400">
                <span className="flex items-center gap-1.5">
                  <span>Enter Laboratory Studio</span>
                </span>
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Capabilities Footer */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-500/5 via-transparent to-indigo-500/5 p-6 sm:p-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
            Studio Capabilities Built Into Every Lab
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⏱️</span>
                <span>Frame-by-Frame Timeline</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Persistent scrubber dock allows frame stepping, speed control (0.5x–2x), and instant jumps to milestone epochs.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>🩻</span>
                <span>Model X-Ray</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspect raw numeric parameter matrices, weight changes, gradient magnitudes, and layer signals synchronized to the active frame.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📐</span>
                <span>Math &amp; Code Synchrony</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Toggle between LaTeX mathematical derivations and vectorized NumPy implementations for every algorithm in real time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
