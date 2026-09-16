import { AppShell } from "@/components/layout/app-shell";
import { gradientDescentDivergenceChallenge } from "@/features/challenges/types";
import { GradientDescentLab } from "@/features/labs/gradient-descent/gradient-descent-lab";

export default function SpotDivergenceChallengePage() { return <AppShell><GradientDescentLab breakMode={gradientDescentDivergenceChallenge} /></AppShell>; }