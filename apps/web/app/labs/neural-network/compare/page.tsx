import { AppShell } from "@/components/layout/app-shell";
import { NeuralNetworkComparison } from "@/features/labs/neural-network/comparison";

export const metadata = {
  title: "Compare Neural Networks — MLingo",
  description: "Compare two neural network architectures side by side with a shared timeline clock.",
};

export default function NeuralNetworkComparisonPage() {
  return (
    <AppShell>
      <NeuralNetworkComparison />
    </AppShell>
  );
}
