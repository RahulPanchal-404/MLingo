/** One setting a learner can change in the code, what it controls, and what to try. */
export type Knob = { name: string; what: string; try: string };
/** A variation of the code to try, and what to look for. */
export type Variation = { title: string; how: string };
export type CodeExtras = { tune?: Knob[]; vary?: Variation[] };
