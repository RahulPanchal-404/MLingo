import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioDashboard } from "@/features/portfolio/portfolio-dashboard";

export const metadata: Metadata = {
  title: "My Portfolio — MLingo",
  description: "View and showcase your completed end-to-end machine learning engineering projects and case studies.",
};

export default function PortfolioPage() {
  return (
    <AppShell>
      <PortfolioDashboard />
    </AppShell>
  );
}
