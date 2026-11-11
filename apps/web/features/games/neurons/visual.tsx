"use client";

import { MiniChart, Plot } from "../framework/plot";
import type { VisualProps } from "../framework/types";
import { BOUNDS, DATA } from "./engine";

function blend(p: number): string {
  // teal (class 0) → rose (class 1)
  const a = [20, 184, 166];
  const b = [244, 63, 94];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * p));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function NeuronsVisual({ level, evaluation }: VisualProps) {
  const b = BOUNDS[level.id];
  const data = DATA[level.id];
  const viz = evaluation?.viz as { grid?: number[][]; loss?: number[] } | undefined;
  return (
    <div className="space-y-3">
      <Plot x={b.x} y={b.y} xLabel={b.xLabel} yLabel={b.yLabel}>
        {(s) => {
          const n = viz?.grid?.length ?? 0;
          const cw = n ? (s.x(b.x[1]) - s.x(b.x[0])) / n : 0;
          const ch = n ? (s.y(b.y[0]) - s.y(b.y[1])) / n : 0;
          return (
            <>
              {viz?.grid?.map((row, j) =>
                row.map((p, i) => (
                  <rect
                    key={`${i}-${j}`}
                    x={s.x(b.x[0]) + i * cw}
                    y={s.y(b.y[0]) - (j + 1) * ch}
                    width={cw + 0.5}
                    height={ch + 0.5}
                    fill={blend(p)}
                    fillOpacity={0.28}
                  />
                )),
              )}
              {data.map((d, i) => (
                <circle key={i} cx={s.x(d.x)} cy={s.y(d.y)} r={3.6} fill={d.label ? "#f43f5e" : "#14b8a6"} stroke="white" strokeWidth={0.8} />
              ))}
            </>
          );
        }}
      </Plot>
      {viz?.loss ? (
        <MiniChart values={viz.loss} label="Training loss per epoch (log scale)" xLabel="epoch" log />
      ) : (
        <p className="text-center text-xs text-slate-500">Run to train the network. The background will show what it predicts everywhere.</p>
      )}
    </div>
  );
}
