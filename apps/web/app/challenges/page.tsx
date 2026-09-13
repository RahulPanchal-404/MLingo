import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

export default function ChallengesPage() {
  return <SectionPage title="Challenges" description="Practice reading model behavior from recorded training runs."><Link className="block max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-400" href="/challenges/gradient-descent-instability"><p className="eyebrow">Gradient descent</p><h2 className="mt-2 text-xl font-semibold text-slate-950">Make Gradient Descent Unstable</h2><p className="mt-2 text-slate-600">Adjust the learning rate, find the suspicious frame, and mark it on the timeline.</p></Link></SectionPage>;
}
