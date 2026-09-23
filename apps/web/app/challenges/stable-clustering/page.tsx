import { AppShell } from "@/components/layout/app-shell";
import { kMeansStabilizationChallenge } from "@/features/challenges/types";
import { KMeansLab } from "@/features/labs/k-means/k-means-lab";

export default function KMeansStableClusteringChallengePage() {
  return (
    <AppShell>
      <KMeansLab breakMode={kMeansStabilizationChallenge} />
    </AppShell>
  );
}
