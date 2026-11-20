// Dumps every "How to code it" step to JSON for check.py: npx tsx --tsconfig tsconfig.json scripts/theory-code/dump.ts
import fs from "fs";
import { THEORY } from "@/features/theory/topics";

const steps = THEORY.flatMap((t) =>
  t.sections.flatMap((s) => s.blocks.flatMap((b) => ("codestep" in b ? [{ slug: t.slug, n: b.codestep.n, goal: b.codestep.goal, code: b.codestep.code }] : []))),
);
fs.writeFileSync(process.argv[2] ?? "/tmp/codesteps.json", JSON.stringify(steps));
console.log(`${steps.length} code steps`);
