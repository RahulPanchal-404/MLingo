import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

const challenges = [{ href: "/challenges/gradient-descent-instability", title: "Make Gradient Descent Unstable", description: "Find the frame where loss begins rising after a decrease." }, { href: "/challenges/learning-slowdown", title: "Find the learning slowdown", description: "Find a recorded plateau where learning has slowed." }, { href: "/challenges/spot-divergence", title: "Spot divergence", description: "Find the region where optimization moves away from a good solution." }];

export default function ChallengesPage() { return <SectionPage title="Challenges" description="Practice reading model behavior from recorded training runs."><div className="challenge-list">{challenges.map((challenge) => <Link className="challenge-card" href={challenge.href} key={challenge.href}><p className="eyebrow">Gradient descent</p><h2>{challenge.title}</h2><p>{challenge.description}</p></Link>)}</div></SectionPage>; }
