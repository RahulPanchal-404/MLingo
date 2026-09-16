import { AppShell } from "@/components/layout/app-shell";
import { gradientDescentPlateauChallenge } from "@/features/challenges/types";
import { GradientDescentLab } from "@/features/labs/gradient-descent/gradient-descent-lab";

export default function LearningSlowdownChallengePage() { return <AppShell><GradientDescentLab breakMode={gradientDescentPlateauChallenge} /></AppShell>; }