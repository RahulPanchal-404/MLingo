import { WalkList } from "@/features/theory/blocks";
import { CodeBlock, TexText } from "@/features/theory/tex";

import type { Program } from "./types";

/** A complete program: its goal, the code, then the explanation of each important part below it. */
export function ProgramView({ program, id }: { program: Program; id?: string }) {
  return (
    <div id={id} className="scroll-mt-24 space-y-3 rounded-2xl border-2 border-[var(--panel-line)] bg-white p-4 dark:bg-slate-900">
      <h3 className="text-[17px] font-extrabold text-slate-950 dark:text-white"><TexText text={program.goal} /></h3>
      <CodeBlock code={program.code} lang={program.lang} />
      {program.walk.length ? <WalkList walk={program.walk} /> : null}
    </div>
  );
}
