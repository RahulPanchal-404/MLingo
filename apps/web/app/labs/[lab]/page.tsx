import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { FrameLabBySlug } from "@/features/labs/frame-lab/frame-lab";
import { FRAME_LABS, getFrameLab } from "@/features/labs/frame-lab/registry";

type Props = { params: Promise<{ lab: string }> };

export function generateStaticParams() {
  return FRAME_LABS.map((l) => ({ lab: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lab } = await params;
  const def = getFrameLab(lab);
  return { title: def ? `${def.title} lab — MLingo` : "Lab not found — MLingo", description: def?.summary };
}

export default async function FrameLabPage({ params }: Props) {
  const { lab } = await params;
  if (!getFrameLab(lab)) notFound();
  return (
    <AppShell>
      <FrameLabBySlug slug={lab} />
    </AppShell>
  );
}
