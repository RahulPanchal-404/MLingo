"use client";

import { Plot, polyline } from "../framework/plot";
import type { VisualProps } from "../framework/types";
import { BEST_LINE, BUMPY_GLOBAL, BUMPY_START, LINE_DATA, bumpy, lineMse } from "./engine";

const range = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a + (i / (n - 1)) * (b - a));

export function DescentVisual({ level, params, evaluation }: VisualProps) {
  if (level.id === "eyeball") {
    const w = Number(params.w);
    const b = Number(params.b);
    return (
      <div className="space-y-2">
        <Plot x={[0, 4.4]} y={[-1, 11]} xLabel="x" yLabel="y">
          {(s) => (
            <>
              {LINE_DATA.map((p) => (
                <line key={`r${p.x}`} x1={s.x(p.x)} x2={s.x(p.x)} y1={s.y(p.y)} y2={s.y(w * p.x + b)} stroke="#f43f5e" strokeWidth={3} strokeOpacity={0.7} />
              ))}
              <line x1={s.x(0)} y1={s.y(b)} x2={s.x(4.4)} y2={s.y(w * 4.4 + b)} stroke="#14b8a6" strokeWidth={3} />
              {LINE_DATA.map((p) => (
                <circle key={p.x} cx={s.x(p.x)} cy={s.y(p.y)} r={5} fill="#0f172a" stroke="white" strokeWidth={1.5} />
              ))}
            </>
          )}
        </Plot>
        <p className="text-center text-xs text-slate-500">Red bars are residuals: prediction minus actual. The loss averages their squares.</p>
      </div>
    );
  }

  if (level.id === "step-size") {
    const ws = range(-1.5, 5, 80);
    const path = (evaluation?.viz as { path?: number[] } | undefined)?.path ?? [];
    const lossAt = (w: number) => lineMse(w, BEST_LINE.b);
    return (
      <div className="space-y-2">
        <Plot x={[-1.5, 5]} y={[0, 60]} xLabel="slope w" yLabel="MSE loss">
          {(s) => (
            <>
              <polyline points={polyline(ws.map((w) => [w, lossAt(w)]), s)} fill="none" stroke="#94a3b8" strokeWidth={2.5} />
              <line x1={s.x(BEST_LINE.w)} x2={s.x(BEST_LINE.w)} y1={s.y(0)} y2={s.y(60)} stroke="#14b8a6" strokeDasharray="4 4" />
              {path.length ? (
                <polyline
                  points={polyline(path.filter((w) => w > -1.5 && w < 5).map((w) => [w, Math.min(lossAt(w), 60)]), s)}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                />
              ) : null}
              {path
                .filter((w) => w > -1.5 && w < 5)
                .map((w, i) => (
                  <circle key={i} cx={s.x(w)} cy={s.y(Math.min(lossAt(w), 60))} r={i === 0 ? 6 : 4} fill={i === 0 ? "#0f172a" : "#f59e0b"} />
                ))}
              {!path.length ? <circle cx={s.x(-1)} cy={s.y(lossAt(-1))} r={6} fill="#0f172a" /> : null}
            </>
          )}
        </Plot>
        <p className="text-center text-xs text-slate-500">
          {path.length ? "Orange dots: where the slope landed after each step." : "Black dot: the start (w = −1). Dashed line: the minimum. Pick α, then Run."}
        </p>
      </div>
    );
  }

  if (level.id === "ravine") {
    const loss = (evaluation?.viz as { loss?: number[] } | undefined)?.loss;
    if (!loss) {
      return (
        <div className="space-y-4 p-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Feature ranges in this dataset</p>
          {[
            { name: "x₁", max: 1, color: "bg-teal-500" },
            { name: "x₂", max: 100, color: "bg-rose-500" },
          ].map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="font-mono">{f.name}</span>
                <span>0 – {f.max}</span>
              </div>
              <div className="h-4 rounded bg-slate-100 dark:bg-slate-800">
                <div className={`h-4 rounded ${f.color}`} style={{ width: `${Math.max(1, f.max)}%` }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">Run to see the loss curve over 60 gradient descent steps.</p>
        </div>
      );
    }
    const finite = loss.map((l) => (Number.isFinite(l) ? Math.log10(Math.max(l, 1e-6)) : NaN));
    const ys = finite.filter(Number.isFinite);
    return (
      <div className="space-y-2">
        <Plot x={[0, 60]} y={[Math.min(...ys, -1), Math.max(...ys, 2)]} xLabel="step" yLabel="log₁₀ MSE">
          {(s) => <polyline points={polyline(finite.map((v, i) => [i, v]), s)} fill="none" stroke="#14b8a6" strokeWidth={2.5} />}
        </Plot>
        <p className="text-center text-xs text-slate-500">Loss per step, log scale. A flat line means the model has stopped learning.</p>
      </div>
    );
  }

  // trap
  const ws = range(-3.5, 6.5, 160);
  const path = (evaluation?.viz as { path?: number[] } | undefined)?.path ?? [];
  const visible = path.filter((w) => w > -3.5 && w < 6.5);
  return (
    <div className="space-y-2">
      <Plot x={[-3.5, 6.5]} y={[-1, 8]} xLabel="w" yLabel="loss">
        {(s) => (
          <>
            <polyline points={polyline(ws.map((w) => [w, bumpy(w)]), s)} fill="none" stroke="#94a3b8" strokeWidth={2.5} />
            <line x1={s.x(BUMPY_GLOBAL)} x2={s.x(BUMPY_GLOBAL)} y1={s.y(-1)} y2={s.y(8)} stroke="#14b8a6" strokeDasharray="4 4" />
            {visible.map((w, i) => (
              <circle key={i} cx={s.x(w)} cy={s.y(bumpy(w))} r={3} fill="#f59e0b" fillOpacity={0.35 + (0.65 * i) / visible.length} />
            ))}
            <circle cx={s.x(visible.at(-1) ?? BUMPY_START)} cy={s.y(bumpy(visible.at(-1) ?? BUMPY_START))} r={7} fill="#0f172a" stroke="white" strokeWidth={2} />
          </>
        )}
      </Plot>
      <p className="text-center text-xs text-slate-500">The ball starts at w = {BUMPY_START}. Dashed line: the true minimum.</p>
    </div>
  );
}
