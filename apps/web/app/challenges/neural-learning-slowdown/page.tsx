import { AppShell } from "@/components/layout/app-shell";
import { neuralNetworkPlateauChallenge } from "@/features/challenges/types";
import { NeuralNetworkLab } from "@/features/labs/neural-network/neural-network-lab";

export default function NeuralNetworkPlateauChallengePage() {
  return (
    <AppShell>
      <NeuralNetworkLab breakMode={neuralNetworkPlateauChallenge} />
    </AppShell>
  );
}
