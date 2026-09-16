import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

export default function Home() {
  return <SectionPage title="Dashboard" description="Machine Learning, Frame by Frame. Start with a recorded lab, then inspect what each update changed."><div className="challenge-list"><Link className="challenge-card" href="/learn"><p className="eyebrow">Start here</p><h2>Learn gradient descent</h2><p>Build an intuition for prediction, loss, gradients, and parameter updates.</p></Link><Link className="challenge-card" href="/labs/gradient-descent"><p className="eyebrow">Open lab</p><h2>Run Gradient Descent</h2><p>Train a real model, scrub its recorded states, and inspect the selected frame.</p></Link></div></SectionPage>;
}
