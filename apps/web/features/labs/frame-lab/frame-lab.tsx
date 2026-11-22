"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { LabLinks, LabSettings, LabWorkspace } from "@/features/labs/workspace/lab-workspace";
import { recordLabVisit } from "@/features/progress/activity";
import { PersistentTimelineDock } from "@/features/timeline/persistent-timeline-dock";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TrainingRun } from "@/types/training-run";

import { MetricChart, PlanePlot, TreeDiagram } from "./plots";
import { getFrameLab } from "./registry";
import type { FrameLabDef } from "./types";

/** Any frame lab: settings on the right, plot and metric curves on the left, timeline under them. */
export function FrameLab<C extends Record<string, number>>({ def }: { def: FrameLabDef<C> }) {
  const [draft, setDraft] = useState<C>(def.defaults);
  const [config, setConfig] = useState<C>(def.defaults);
  const [runCount, setRunCount] = useState(0);
  const result = useMemo(() => {
    try {
      return { run: def.run(config), error: null };
    } catch (caught) {
      return { run: null, error: caught instanceof Error ? caught.message : "This lab could not run with these settings." };
    }
  }, [def, config]);
  const run = result.run;
  // The shared timeline hook only needs an id (to reset on a new run) and a list of frames.
  const timelineSource = useMemo(() => (run ? ({ id: `${def.slug}-${runCount}`, history: run.frames } as unknown as TrainingRun) : null), [run, def.slug, runCount]);
  const timeline = useTrainingTimeline(timelineSource);
  const index = Math.min(timeline.currentStep, (run?.frames.length ?? 1) - 1);
  const frame = run?.frames[index];

  useEffect(() => {
    recordLabVisit(def.slug, [def.title]);
  }, [def.slug, def.title]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfig(draft);
    setRunCount((n) => n + 1);
  };
  const firstSeries = run?.series[0];

  return (
    <LabWorkspace
      title={def.title}
      summary={def.summary}
      status={{ loading: false, error: result.error }}
      settings={
        <LabSettings
          onSubmit={submit}
          loading={false}
          fields={def.fields.map((f) => ({
            label: f.label,
            hint: f.hint,
            min: f.min,
            max: f.max,
            step: f.step,
            value: draft[f.key],
            onChange: (v: number) => setDraft((d) => ({ ...d, [f.key]: v })),
          }))}
          footer={<LabLinks theory={def.theory} code={def.code} />}
        />
      }
      visuals={run && frame ? <><PlanePlot run={run} frame={frame} title="What the model sees" label={run.frameLabel(index)} /><MetricChart run={run} current={index} />{frame.tree ? <TreeDiagram tree={frame.tree} label={run.frameLabel(index)} /> : null}</> : undefined}
      timeline={
        run && frame ? (
          <PersistentTimelineDock
            currentStep={index}
            totalSteps={run.frames.length}
            isPlaying={timeline.isPlaying}
            onPlayToggle={timeline.togglePlay}
            onBackward={timeline.stepBackward}
            onForward={timeline.stepForward}
            onJump={timeline.jumpToStep}
            onReset={timeline.reset}
            playbackSpeed={timeline.playbackSpeed}
            onSpeed={timeline.setPlaybackSpeed}
            lossValue={firstSeries ? frame.metrics[firstSeries.key] : undefined}
            metricLabel={firstSeries?.label.replace(/ \(.*\)$/, "")}
          />
        ) : undefined
      }
    >
      {frame ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 p-5 lg:col-span-2 dark:border-slate-800" aria-live="polite">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400">This frame: {run!.frameLabel(index)}</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">{frame.caption}</p>
          </section>
          <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">How to read the plot</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {def.howToRead.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
          <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Try this</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {def.tryThis.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </section>
          <section className="rounded-xl bg-sky-50 p-5 lg:col-span-2 dark:bg-sky-500/10">
            <h2 className="text-base font-bold text-sky-900 dark:text-sky-200">The idea</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">{def.idea}</p>
          </section>
        </div>
      ) : null}
    </LabWorkspace>
  );
}

/** Client entry for the dynamic route: the lab definitions hold functions, so they are looked up here. */
export function FrameLabBySlug({ slug }: { slug: string }) {
  const def = getFrameLab(slug);
  return def ? <FrameLab def={def as unknown as FrameLabDef<Record<string, number>>} /> : null;
}
