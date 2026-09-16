import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

export default function LabsPage() {
  return <SectionPage title="ML Labs" description="Explore hands-on machine learning concepts through recorded training runs."><div className="challenge-list"><Link className="challenge-card" href="/labs/gradient-descent"><p className="eyebrow">Lab 01 / regression</p><h2>Gradient Descent / Linear Regression</h2><p>Watch a continuous model fit a line, frame by frame.</p></Link><Link className="challenge-card" href="/labs/logistic-regression"><p className="eyebrow">Lab 02 / classification</p><h2>Logistic Regression</h2><p>Watch probabilities become a decision boundary between two classes.</p></Link></div></SectionPage>;
}
