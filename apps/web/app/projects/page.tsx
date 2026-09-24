import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectStudioDashboard } from "@/features/projects/project-dashboard";

export const metadata: Metadata = {
  title: "Project Studio — MLingo",
  description:
    "Complete guided, end-to-end machine learning projects: from problem formulation and missing data cleaning to gradient optimization, scientific experimentation, and generalization interpretation.",
};

export default function ProjectsPage() {
  return (
    <AppShell>
      <ProjectStudioDashboard />
    </AppShell>
  );
}
