import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  ALL_LESSONS,
  getLessonBySlug,
} from "@/features/learning/lessons-data";
import { LessonLayout } from "@/features/learning/components/lesson-layout";

type LessonPageProps = {
  params: Promise<{ lessonSlug: string }>;
};

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ lessonSlug: l.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson) {
    return { title: "Lesson Not Found — MLingo" };
  }
  return {
    title: `${lesson.title} (${lesson.tag}) — MLingo Learn`,
    description: lesson.subtitle,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    notFound();
  }

  return (
    <AppShell>
      <LessonLayout lesson={lesson} />
    </AppShell>
  );
}
