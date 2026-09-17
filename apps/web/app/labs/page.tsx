import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

const labs = [
  { href: "/labs/gradient-descent", tag: "Lab 01", title: "Gradient Descent / Linear Regression", description: "Watch a single line adapt to real data while the loss curve and parameters update frame by frame.", observation: "You will observe the fit, the loss curve, and the effect of learning rate." },
  { href: "/labs/logistic-regression", tag: "Lab 02", title: "Logistic Regression", description: "See probabilities become a decision boundary between two classes.", observation: "You will observe the class boundary shifting as the model learns." },
  { href: "/labs/k-means", tag: "Lab 03", title: "K-Means Clustering", description: "Watch points change cluster membership while centroids move toward the densest regions.", observation: "You will observe assignments, centroid movement, and inertia across iterations." },
];

export default function LabsPage() {
  return <SectionPage title="ML Labs" description="Three algorithm laboratories built around one idea: understand training by reviewing it frame by frame."><div className="challenge-list">{labs.map((lab) => <Link className="challenge-card" href={lab.href} key={lab.href}><p className="eyebrow">{lab.tag}</p><h2>{lab.title}</h2><p>{lab.description}</p><div className="mt-3 text-sm text-slate-600"><strong>Inspect:</strong> {lab.observation}</div><div className="mt-4 text-sm font-medium text-teal-700">Open laboratory</div></Link>)}</div></SectionPage>;
}
