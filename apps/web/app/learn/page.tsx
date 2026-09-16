import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

export default function LearnPage() {
  return <SectionPage title="Learn" description="Follow one model through prediction, loss, gradients, and updates."><div className="challenge-list"><Link className="challenge-card" href="/labs/gradient-descent"><p className="eyebrow">Lesson 01 / linear regression</p><h2>Gradient descent, frame by frame</h2><p>Run the lesson, scrub the timeline, and connect the charts to Math Mode and Code Mode.</p></Link><Link className="challenge-card" href="/labs/gradient-descent/compare"><p className="eyebrow">Lesson 02 / comparison</p><h2>Compare two learning rates</h2><p>Review two recorded training histories on one shared clock.</p></Link></div></SectionPage>;
}
