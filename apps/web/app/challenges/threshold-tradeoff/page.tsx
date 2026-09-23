import { AppShell } from "@/components/layout/app-shell";
import { logisticRegressionThresholdChallenge } from "@/features/challenges/types";
import { LogisticRegressionLab } from "@/features/labs/logistic-regression/logistic-regression-lab";

export default function LogisticRegressionThresholdChallengePage() {
  return (
    <AppShell>
      <LogisticRegressionLab breakMode={logisticRegressionThresholdChallenge} />
    </AppShell>
  );
}
