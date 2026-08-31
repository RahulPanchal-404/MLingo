import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <AppShell>
      <section className="space-y-3">
        <p className="eyebrow">Foundation</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Machine Learning, Frame by Frame.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          MLingo is being prepared for interactive lessons, laboratories, and
          replayable training runs. The learning experiences will arrive here
          as they are built.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <Card title="Learn" description="Structured concepts and explanations." />
        <Card title="Labs" description="Hands-on machine learning practice." />
        <Card title="Training runs" description="A future home for replay and inspection." />
      </section>
    </AppShell>
  );
}
