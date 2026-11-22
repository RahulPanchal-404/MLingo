import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { LabArt, type LabArtType } from "@/features/labs/lab-art";
import { FRAME_LABS } from "@/features/labs/frame-lab/registry";
import type { LabCategory } from "@/features/labs/frame-lab/types";

export const metadata: Metadata = {
  title: "Labs — MLingo",
  description: "Train real models in your browser and scrub through every step: regression, classification, trees, clustering, PCA and neural networks.",
};

type LabRow = { href: string; title: string; watch: string; frame: string; theory: string; art: LabArtType };

/** The four original labs, recorded by the shared training engine. */
const RECORDED: (LabRow & { category: LabCategory })[] = [
  { category: "Regression", href: "/labs/gradient-descent", art: "linear", title: "Linear regression and gradient descent", watch: "A line fitting points one update at a time, with its gradients and the loss.", frame: "one gradient step", theory: "gradient-descent" },
  { category: "Classification", href: "/labs/logistic-regression", art: "logistic", title: "Logistic regression", watch: "Probabilities turning into a decision boundary as the log loss falls.", frame: "one gradient step", theory: "logistic-regression" },
  { category: "Unsupervised learning", href: "/labs/k-means", art: "kmeans", title: "K-Means clustering", watch: "Centroids moving to the middle of their points until nothing changes.", frame: "one assign-and-move round", theory: "k-means" },
  { category: "Neural networks", href: "/labs/neural-network", art: "neural", title: "Neural network and backpropagation", watch: "Hidden neurons, gradients and a curved decision surface during training.", frame: "one backpropagation update", theory: "neural-networks" },
];

const FRAME_WATCH: Record<string, { watch: string; frame: string; art: LabArtType }> = {
  "polynomial-regularization": { watch: "A curve going from too simple to too wiggly, and a ridge penalty holding it back.", frame: "one more degree", art: "poly" },
  "k-nearest-neighbours": { watch: "How the number of neighbours shapes the border, from jagged islands to over-smooth.", frame: "a larger k", art: "knn" },
  "support-vector-machine": { watch: "The widest-margin boundary forming, pushed only by the support vectors.", frame: "one training update", art: "svm" },
  "decision-tree": { watch: "Yes/no questions carving the map into boxes, and training accuracy racing past test accuracy.", frame: "one more question", art: "tree" },
  "gradient-boosting": { watch: "Small trees fixing the errors left by the trees before them.", frame: "one more tree", art: "boosting" },
  pca: { watch: "A direction turning onto the axis of greatest variance.", frame: "one power-iteration step", art: "pca" },
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
      <div className="space-y-12 py-2">
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
              <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
                {rows.map((lab) => (
                  <Link
                    key={lab.href}
                    href={lab.href}
                    className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-teal-500/50 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500/40"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        Lab {String(ORDERED.indexOf(lab) + 1).padStart(2, "0")}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">Each frame: {lab.frame}</span>
                    </div>
                    <LabArt type={lab.art} />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">{lab.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{lab.watch}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
