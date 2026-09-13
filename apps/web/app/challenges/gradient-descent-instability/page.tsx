import { AppShell } from "@/components/layout/app-shell";
import { gradientDescentInstabilityChallenge } from "@/features/challenges/types";
import { GradientDescentLab } from "@/features/labs/gradient-descent/gradient-descent-lab";

export default function GradientDescentInstabilityChallengePage() {
      return <AppShell><GradientDescentLab breakMode={gradientDescentInstabilityChallenge} /></AppShell>;
}
