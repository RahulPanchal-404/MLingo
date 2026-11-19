import type { Section } from "@/features/theory/topics";
import { CORE_WALKTHROUGHS } from "./core";

/** Step-by-step walkthroughs shown on lesson pages, keyed by lesson slug. */
export const WALKTHROUGHS: Record<string, Section[]> = {
  ...CORE_WALKTHROUGHS,
};
