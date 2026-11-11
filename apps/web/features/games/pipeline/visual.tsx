"use client";

import { pct } from "../framework/math";
import { Plot, polyline } from "../framework/plot";
import type { VisualProps } from "../framework/types";
import { CHURN, DEGREE_CURVES, LOAN_FEATURES, POLY_TEST, POLY_TRAIN, fitPoly, polyAt } from "./engine";

function Step({ n, title, note, bad }: { n: number; title: string; note?: string; bad?: boolean }) {
  return (
    <li className={`flex gap-3 rounded-xl border px-3 py-2.5 ${bad ? "border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50"}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white dark:bg-slate-200 dark:text-slate-900">{n}</span>
      <span>
        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</span>
        {note ? <span className="block text-xs text-slate-500">{note}</span> : null}
      </span>
    </li>
  );
}

export function PipelineVisual({ level, params, evaluation }: VisualProps) {
  if (level.id === "leak") {
    const solos = (evaluation?.viz as { solos?: { label: string; key: string; acc: number }[] } | undefined)?.solos;
    return (
      <div className="space-y-4 p-1">
        <ol className="space-y-2">
          <Step n={1} title="Load 240 past loans" note={`Features: ${LOAN_FEATURES.map((f) => f.label).join(", ")}`} />
          <Step n={2} title="Split 160 train / 80 test" />
          <Step n={3} title="Train classifier" />
          <Step n={4} title="Test accuracy: 100%" note="Suspiciously perfect." bad />
        </ol>
        {solos ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Test accuracy using each feature alone</p>
            {solos.map((s) => (
              <div key={s.key} className="space-y-0.5">
                <div className="flex justify-between font-mono text-xs text-slate-500">
                  <span>{s.label}</span>
                  <span>{pct(s.acc)}</span>
                </div>
                <div className="h-3 rounded bg-slate-100 dark:bg-slate-800">
                  <div className={`h-3 rounded ${s.acc > 0.97 ? "bg-rose-500" : "bg-teal-500"}`} style={{ width: `${Math.round(s.acc * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Hint: for each feature, ask when that value would be known.</p>
        )}
      </div>
    );
  }

  if (level.id === "overfit") {
    const degree = Number(params.degree);
    const w = fitPoly(degree);
    const xs = Array.from({ length: 160 }, (_, i) => -1 + (2 * i) / 159);
    const revealed = Boolean(evaluation);
    const W = 260;
    const H = 90;
    const lg = (v: number) => Math.log10(v);
    const all = DEGREE_CURVES.flatMap((c) => [lg(c.train), lg(c.test)]);
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const px = (d: number) => 10 + ((d - 1) / 11) * (W - 20);
    const py = (v: number) => 8 + (1 - (lg(v) - lo) / (hi - lo)) * (H - 24);
    return (
      <div className="space-y-3">
        <Plot x={[-1, 1]} y={[-2, 2]} xLabel="x" yLabel="y">
          {(s) => (
            <>
              <polyline points={polyline(xs.map((x) => [x, Math.max(-2.5, Math.min(2.5, polyAt(w, x)))]), s)} fill="none" stroke="#14b8a6" strokeWidth={3} />
              {revealed
                ? POLY_TEST.filter((_, i) => i % 3 === 0).map((p, i) => <circle key={`t${i}`} cx={s.x(p.x)} cy={s.y(p.y)} r={4} fill="none" stroke="#f59e0b" strokeWidth={1.8} />)
                : null}
              {POLY_TRAIN.map((p, i) => (
                <circle key={i} cx={s.x(p.x)} cy={s.y(p.y)} r={5} fill="#0f172a" stroke="white" strokeWidth={1.5} />
              ))}
            </>
          )}
        </Plot>
        {revealed ? (
          <figure className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2">
            <figcaption className="px-1 text-[11px] font-semibold text-slate-500">
              Error by degree (log scale): <span className="text-slate-900 dark:text-slate-200">train</span> vs <span className="text-amber-600">test</span>
            </figcaption>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              <polyline points={DEGREE_CURVES.map((c) => `${px(c.degree)},${py(c.train)}`).join(" ")} fill="none" stroke="#0f172a" className="dark:stroke-slate-200" strokeWidth={2} />
              <polyline points={DEGREE_CURVES.map((c) => `${px(c.degree)},${py(c.test)}`).join(" ")} fill="none" stroke="#f59e0b" strokeWidth={2} />
              <line x1={px(degree)} x2={px(degree)} y1={4} y2={H - 14} stroke="#14b8a6" strokeDasharray="3 3" />
              <text x={W / 2} y={H - 2} textAnchor="middle" className="fill-slate-500 text-[9px]">degree 1 → 12</text>
            </svg>
          </figure>
        ) : (
          <p className="text-center text-xs text-slate-500">Black dots: training data. Run to reveal the test points (orange rings).</p>
        )}
      </div>
    );
  }

  if (level.id === "order") {
    return (
      <div className="space-y-3 p-1">
        <p className="text-sm text-slate-600 dark:text-slate-300">100 customers. Rows 1–80 become the training set, rows 81–100 the test set.</p>
        <ol className="space-y-2">
          <Step n={1} title="Split the data" note="Train: 80 rows · Test: 20 rows (held back)" />
          <Step n={2} title="Learn the scaler's mean and standard deviation" note="…but from which rows?" />
          <Step n={3} title="Transform the features" />
          <Step n={4} title="Train on train, score on test" />
        </ol>
        <p className="text-xs text-slate-500">The test set stands in for future customers you haven&apos;t met yet. Anything learned from it during training is cheating.</p>
      </div>
    );
  }

  const acc = (CHURN.total - CHURN.positives) / CHURN.total;
  return (
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <p className="text-xs text-slate-500">Reported accuracy</p>
          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{pct(acc)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <p className="text-xs text-slate-500">Customers who churned</p>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{CHURN.positives}<span className="text-lg text-slate-400"> / {CHURN.total}</span></p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1" aria-label="Each square is one customer">
        {Array.from({ length: CHURN.total }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-sm ${i < CHURN.positives ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-700"}`} />
        ))}
      </div>
      <p className="text-xs text-slate-500">Each square is a customer; red ones churned. What would a model that always says &quot;won&apos;t churn&quot; score?</p>
    </div>
  );
}
