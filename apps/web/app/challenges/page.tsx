import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

type ChallengeListing = {
  href: string;
  algorithm: string;
  tag: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate";
};

const challenges: ChallengeListing[] = [
  {
    href: "/challenges/gradient-descent-instability",
    algorithm: "Linear Regression",
    tag: "Gradient Descent",
    title: "Make Gradient Descent Unstable",
    description: "Increase the learning rate and find the exact frame where loss begins oscillating and rising.",
    difficulty: "Beginner",
  },
  {
    href: "/challenges/learning-slowdown",
    algorithm: "Linear Regression",
    tag: "Gradient Descent",
    title: "Find the Learning Slowdown",
    description: "Inspect a run with a very small learning rate and locate a recorded plateau where progress stalls.",
    difficulty: "Beginner",
  },
  {
    href: "/challenges/spot-divergence",
    algorithm: "Linear Regression",
    tag: "Gradient Descent",
    title: "Spot Divergence",
    description: "Identify the region where optimization overshoots and error compounds away from the minimum.",
    difficulty: "Intermediate",
  },
  {
    href: "/challenges/threshold-tradeoff",
    algorithm: "Logistic Regression",
    tag: "Classification",
    title: "Find the Threshold Trade-off",
    description: "Scrub through training frames to locate where classification boundaries reach near-convergence.",
    difficulty: "Beginner",
  },
  {
    href: "/challenges/stable-clustering",
    algorithm: "K-Means",
    tag: "Unsupervised",
    title: "Find the Stable Clustering",
    description: "Track centroid displacement across assignment iterations to find where clustering movement stabilizes.",
    difficulty: "Beginner",
  },
  {
    href: "/challenges/neural-learning-slowdown",
    algorithm: "Neural Network",
    tag: "Deep Learning",
    title: "Find the Learning Slowdown (Neural Net)",
    description: "Inspect multi-layer backpropagation loss curves and pinpoint the onset of an optimization plateau.",
    difficulty: "Intermediate",
  },
];

export default function ChallengesPage() {
  return (
    <SectionPage
      title="Break Mode Challenges"
      description="Practice diagnosing model behavior from recorded training runs. Every algorithm features real mathematical optimization with diagnostic signals and Model X-Ray."
    >
      <div className="space-y-6">
        <div className="challenge-list">
          {challenges.map((challenge) => (
            <Link className="challenge-card" href={challenge.href} key={challenge.href}>
              <div className="flex items-center justify-between">
                <p className="eyebrow">{challenge.tag}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                    {challenge.algorithm}
                  </span>
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-800">
                    {challenge.difficulty}
                  </span>
                </div>
              </div>
              <h2 className="mt-1">{challenge.title}</h2>
              <p>{challenge.description}</p>
              <div className="mt-4 text-xs font-semibold text-teal-700">
                Start Challenge →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionPage>
  );
}
