import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { FRAME_LABS } from "@/features/labs/frame-lab/registry";
import type { LabCategory } from "@/features/labs/frame-lab/types";

export const metadata: Metadata = {
  title: "Labs — MLingo",
  description: "Train real models in your browser and scrub through every step: regression, classification, trees, clustering, PCA and neural networks.",
};

type LabRow = { href: string; title: string; watch: string; frame: string; theory: string };

/** The four original labs, recorded by the shared training engine. */
const RECORDED: (LabRow & { category: LabCategory })[] = [
  { category: "Regression", href: "/labs/gradient-descent", title: "Linear regression and gradient descent", watch: "A line fitting points one update at a time, with its gradients and the loss.", frame: "one gradient step", theory: "gradient-descent" },
  { category: "Classification", href: "/labs/logistic-regression", title: "Logistic regression", watch: "Probabilities turning into a decision boundary as the log loss falls.", frame: "one gradient step", theory: "logistic-regression" },
  { category: "Unsupervised learning", href: "/labs/k-means", title: "K-Means clustering", watch: "Centroids moving to the middle of their points until nothing changes.", frame: "one assign-and-move round", theory: "k-means" },
  { category: "Neural networks", href: "/labs/neural-network", title: "Neural network and backpropagation", watch: "Hidden neurons, gradients and a curved decision surface during training.", frame: "one backpropagation update", theory: "neural-networks" },
];

const FRAME_WATCH: Record<string, { watch: string; frame: string }> = {
  "polynomial-regularization": { watch: "A curve going from too simple to too wiggly, and a ridge penalty holding it back.", frame: "one more degree" },
  "k-nearest-neighbours": { watch: "How the number of neighbours shapes the border, from jagged islands to over-smooth.", frame: "a larger k" },
  "support-vector-machine": { watch: "The widest-margin boundary forming, pushed only by the support vectors.", frame: "one training update" },
  "decision-tree": { watch: "Yes/no questions carving the map into boxes, and training accuracy racing past test accuracy.", frame: "one more question" },
  "gradient-boosting": { watch: "Small trees fixing the errors left by the trees before them.", frame: "one more tree" },
  pca: { watch: "A direction turning onto the axis of greatest variance.", frame: "one power-iteration step" },
};

const CATEGORIES: { name: LabCategory; blurb: string }[] = [
  { name: "Regression", blurb: "Predict a number." },
  { name: "Classification", blurb: "Predict a class." },
  { name: "Trees and ensembles", blurb: "Models built from yes/no questions, alone or combined." },
  { name: "Unsupervised learning", blurb: "Find structure in data without labels." },
  { name: "Neural networks", blurb: "Layers of simple units trained by backpropagation." },
];

const ALL: (LabRow & { category: LabCategory })[] = [
  ...RECORDED,
  ...FRAME_LABS.map((l) => ({ category: l.category, href: `/labs/${l.slug}`, title: l.title, theory: l.theory, ...FRAME_WATCH[l.slug] })),
];

/** All labs in the order the page shows them, so numbering runs 01, 02 … across categories. */
const ORDERED = CATEGORIES.flatMap((c) => ALL.filter((l) => l.category === c.name));

export default function LabsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-12 py-2">
        <header className="space-y-3 border-b border-slate-200 pb-8 dark:border-slate-800">
          <h1 className="font-extrabold text-slate-950 dark:text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1 }}>
            Labs
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Each lab trains a real model in your browser and records every step. Change a setting, train again, and scrub the timeline to see what the model does at each step.
          </p>
        </header>

        {CATEGORIES.map((cat) => {
          const rows = ALL.filter((l) => l.category === cat.name);
          return (
            <section key={cat.name} aria-labelledby={`cat-${cat.name}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-2 dark:border-slate-800">
                <h2 id={`cat-${cat.name}`} className="text-xl font-bold text-slate-950 dark:text-white">{cat.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{cat.blurb}</p>
              </div>
              <ol>
                {rows.map((lab) => {
                  const n = ORDERED.indexOf(lab) + 1;
                  return (
                    <li key={lab.href} className="border-b border-slate-100 dark:border-slate-800/70">
                      <Link href={lab.href} className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-3 py-4 transition-colors hover:bg-slate-50 sm:px-2 dark:hover:bg-slate-900/60">
                        <span className="pt-0.5 font-mono text-sm text-slate-400">{String(n).padStart(2, "0")}</span>
                        <span>
                          <span className="block text-[17px] font-bold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">{lab.title}</span>
                          <span className="mt-0.5 block text-sm leading-relaxed text-slate-600 dark:text-slate-400">{lab.watch}</span>
                          <span className="mt-1 block text-xs text-slate-500">Each frame: {lab.frame}</span>
                        </span>
                        <span aria-hidden="true" className="pt-1 text-lg text-slate-400 group-hover:text-teal-600">›</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
