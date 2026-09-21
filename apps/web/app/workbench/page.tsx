import { AppShell } from "@/components/layout/app-shell";
import { DataWorkbench } from "@/features/workbench/data-workbench";

export const metadata = {
  title: "Data Science Workbench — MLingo",
  description: "End-to-end data preparation, train/test splitting without data leakage, and rigorous model evaluation.",
};

export default function WorkbenchPage() {
  return (
    <AppShell>
      <DataWorkbench />
    </AppShell>
  );
}
