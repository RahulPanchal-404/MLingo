/**
 * A "frame lab" records a model as a list of frames (one per split, tree, epoch, k...)
 * and lets the learner scrub through them. Everything is computed in the browser.
 */
export type Pt = { x: number; y: number };

export type PlotPoint = Pt & {
  /** Class index (0 or 1) for coloured points; omit for neutral points. */
  c?: number;
  /** Held-out point: drawn hollow. */
  test?: boolean;
  /** Draw a ring around it (support vectors, neighbours...). */
  ring?: boolean;
};

export type Curve = { pts: [number, number][]; kind: "model" | "truth" | "margin" | "axis" | "axis2"; label?: string };
export type Segment = { a: [number, number]; b: [number, number]; kind: "split" | "split-new" | "projection" | "residual" };

export type Frame = {
  points: PlotPoint[];
  /** Predicted class (0/1) or probability of class 1, on an n x n grid over the domain, row by row from the bottom. */
  surface?: { n: number; values: number[] };
  curves?: Curve[];
  segments?: Segment[];
  /** One or two sentences: what changed in this frame and what it means. */
  caption: string;
  /** Values for the metric chart, keyed by series key. */
  metrics: Record<string, number>;
};

export type MetricSeries = { key: string; label: string; color: string; format?: "pct" | "num" };

export type FrameRun = {
  frames: Frame[];
  domain: { x: [number, number]; y: [number, number] };
  axes: { x: string; y: string };
  series: MetricSeries[];
  /** Label for one frame on the timeline, e.g. "split 3" or "k = 5". */
  frameLabel: (index: number) => string;
  metricTitle: string;
};

export type FieldSpec<C> = { key: keyof C & string; label: string; min: number; max: number; step: number; hint?: string };

export type FrameLabDef<C extends Record<string, number>> = {
  slug: string;
  title: string;
  summary: string;
  category: LabCategory;
  theory: string;
  code?: string;
  defaults: C;
  fields: FieldSpec<C>[];
  run: (config: C) => FrameRun;
  /** How to read the plot, for someone seeing it for the first time. */
  howToRead: string[];
  /** Experiments worth trying, each a concrete setting change and what to look for. */
  tryThis: string[];
  /** The idea in plain words, then named. */
  idea: string;
};

export type LabCategory = "Regression" | "Classification" | "Trees and ensembles" | "Unsupervised learning" | "Neural networks";
