import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DemoWorkspace } from "@/features/demo/demo-workspace";

export const metadata: Metadata = {
  title: "Interactive Tour — MLingo",
  description: "Experience machine learning frame by frame through a live interactive tour.",
};

export default function DemoPage() {
  return (
    <AppShell>
      <DemoWorkspace />
    </AppShell>
  );
}
