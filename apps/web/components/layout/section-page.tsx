import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type SectionPageProps = { title: string; description: string; children?: ReactNode };

export function SectionPage({ title, description, children }: SectionPageProps) {
  return (
    <AppShell>
      <section className="space-y-3">
        <p className="eyebrow">MLingo</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        {children}
      </section>
    </AppShell>
  );
}
