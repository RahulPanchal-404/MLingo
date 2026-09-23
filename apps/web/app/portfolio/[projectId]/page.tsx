import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_PROJECTS, getProjectById } from "@/features/projects/definitions";
import { AppShell } from "@/components/layout/app-shell";
import { ProjectCaseStudy } from "@/features/portfolio/project-case-study";

type PortfolioDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export function generateStaticParams() {
  return ALL_PROJECTS.map((p) => ({ projectId: p.id }));
}

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = getProjectById(projectId);
  if (!project) {
    return { title: "Case Study Not Found — MLingo" };
  }
  return {
    title: `${project.title} Case Study — MLingo Portfolio`,
    description: `Complete ML engineering case study for ${project.title}.`,
  };
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <AppShell>
      <ProjectCaseStudy project={project} />
    </AppShell>
  );
}
