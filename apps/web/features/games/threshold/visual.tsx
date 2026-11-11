"use client";

import { sigmoid } from "../framework/math";
import { Plot, PLOT_H, PLOT_W, polyline } from "../framework/plot";
import type { VisualProps } from "../framework/types";
import { DATASETS, STUDY_DATA } from "./engine";

export function ThresholdVisual({ level, params }: VisualProps) {
  if (level.id === "sigmoid") {
    const c = Number(params.center);
    const k = Number(params.steep);
    const xs = Array.from({ length: 100 }, (_, i) => (i / 99) * 10);
    return (
      <div className="space-y-2">
        <Plot x={[0, 10]} y={[-0.1, 1.1]} xLabel="hours studied" yLabel="P(pass)">
          {(s) => (
            <>
              <line x1={s.x(c)} x2={s.x(c)} y1={s.y(-0.1)} y2={s.y(1.1)} stroke="#f59e0b" strokeDasharray="5 4" strokeWidth={2} />
              <polyline points={polyline(xs.map((x) => [x, sigmoid(k * (x - c))]), s)} fill="none" stroke="#14b8a6" strokeWidth={3} />
              {STUDY_DATA.map((d, i) => (
                <circle key={i} cx={s.x(d.x)} cy={s.y(d.y === 1 ? 1 - (i % 3) * 0.025 : (i % 3) * 0.025)} r={5} fill={d.y ? "#14b8a6" : "#f43f5e"} stroke="white" strokeWidth={1} />
              ))}
            </>
          )}
        </Plot>
        <p className="text-center text-xs text-slate-500">Green: passed. Red: failed. Orange dashed line: the 50% decision boundary.</p>
      </div>
    );
  }

  const data = DATASETS[level.id];
  const t = Number(params.t);
  const padL = 70;
  const padR = 16;
  const x = (p: number) => padL + p * (PLOT_W - padL - padR);
  const rowY = { 1: 95, 0: 235 };
  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="h-auto w-full" role="img" aria-label="Risk scores by actual class">
        <rect x={x(t)} y={30} width={x(1) - x(t)} height={270} className="fill-amber-400/10" />
        <text x={x(t) + 6} y={46} className="fill-amber-600 text-[11px] font-semibold">flagged positive →</text>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={30} y2={300} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={x(v)} y={318} textAnchor="middle" className="fill-slate-500 text-[10px]">{v}</text>
          </g>
        ))}
        <text x={(padL + PLOT_W) / 2} y={PLOT_H - 4} textAnchor="middle" className="fill-slate-500 text-[11px]">model risk score</text>
        <text x={8} y={rowY[1] + 4} className="fill-slate-600 dark:fill-slate-300 text-[11px] font-semibold">Actually</text>
        <text x={8} y={rowY[1] + 18} className="fill-rose-500 text-[11px] font-semibold">positive</text>
        <text x={8} y={rowY[0] + 4} className="fill-slate-600 dark:fill-slate-300 text-[11px] font-semibold">Actually</text>
        <text x={8} y={rowY[0] + 18} className="fill-teal-500 text-[11px] font-semibold">negative</text>
        {data.map((d, i) => {
          const jitter = (((i * 7919) % 100) / 100 - 0.5) * 90;
          const flagged = d.p >= t;
          return (
            <circle
              key={i}
              cx={x(d.p)}
              cy={rowY[d.y] + jitter}
              r={d.y ? 5 : 3.5}
              fill={d.y ? "#f43f5e" : "#14b8a6"}
              fillOpacity={flagged ? 0.95 : 0.4}
              stroke={flagged ? "#f59e0b" : "none"}
              strokeWidth={1.5}
            />
          );
        })}
        <line x1={x(t)} x2={x(t)} y1={24} y2={304} stroke="#f59e0b" strokeWidth={3} />
        <text x={x(t)} y={18} textAnchor="middle" className="fill-amber-600 text-[11px] font-bold">threshold {t.toFixed(2)}</text>
      </svg>
      <p className="text-center text-xs text-slate-500">Every dot is one case. Anything right of the threshold is flagged. Red dots left of it are misses.</p>
    </div>
  );
}
