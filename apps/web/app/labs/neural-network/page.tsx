import { AppShell } from "@/components/layout/app-shell";
import { NeuralNetworkLab } from "@/features/labs/neural-network/neural-network-lab";

export const metadata = {
  title: "Lab 04: Neural Network & Backpropagation — MLingo",
  description: "Inspect a 2-layer neural network trained with analytical backpropagation frame by frame.",
};

export default function NeuralNetworkPage() {
  return (
    <AppShell>
      <NeuralNetworkLab />
    </AppShell>
  );
}
