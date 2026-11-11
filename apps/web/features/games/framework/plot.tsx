import type { ReactNode } from "react";

/** Minimal SVG plotting: a fixed viewBox with linear scales. Enough for every game visual. */
export type Scale = { x: (v: number) => number; y: (v: number) => number };

export const PLOT_W = 520;
export const PLOT_H = 340;
const PAD = { l: 44, r: 14, t: 14, b: 34 };

export function makeScale(x: [number, number], y: [number, number]): Scale {
  const w = PLOT_W - PAD.l - PAD.r;
  const h = PLOT_H - PAD.t - PAD.b;
  return {
    x: (v) => PAD.l + ((v - x[0]) / (x[1] - x[0] || 1)) * w,
    y: (v) => PAD.t + h - ((v - y[0]) / (y[1] - y[0] || 1)) * h,
  };
}

function ticks([a, b]: [number, number], n = 5): number[] {
  const step = (b - a) / n;
  return Array.from({ length: n + 1 }, (_, i) => a + i * step);
}

const tickLabel = (v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : Number(v.toFixed(2)).toString());

export function Plot({
  x,
  y,
  xLabel,
  yLabel,
  children,
  hideAxes = false,
}: {
  x: [number, number];
  y: [number, number];
  xLabel?: string;
  yLabel?: string;
  children: (s: Scale) => ReactNode;
  hideAxes?: boolean;
}) {
  const s = makeScale(x, y);
  return (
    <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="h-auto w-full select-none" role="img">
      {!hideAxes ? (
        <g className="text-slate-300 dark:text-slate-700">
          {ticks(x).map((t) => (
            <g key={`x${t}`}>
              <line x1={s.x(t)} x2={s.x(t)} y1={PAD.t} y2={PLOT_H - PAD.b} stroke="currentColor" strokeOpacity={0.35} />
              <text x={s.x(t)} y={PLOT_H - PAD.b + 14} textAnchor="middle" className="fill-slate-500 text-[10px]">
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {ticks(y).map((t) => (
            <g key={`y${t}`}>
              <line x1={PAD.l} x2={PLOT_W - PAD.r} y1={s.y(t)} y2={s.y(t)} stroke="currentColor" strokeOpacity={0.35} />
              <text x={PAD.l - 6} y={s.y(t) + 3} textAnchor="end" className="fill-slate-500 text-[10px]">
                {tickLabel(t)}
              </text>
            </g>
          ))}
          {xLabel ? (
            <text x={(PAD.l + PLOT_W - PAD.r) / 2} y={PLOT_H - 4} textAnchor="middle" className="fill-slate-500 text-[11px]">
              {xLabel}
            </text>
          ) : null}
          {yLabel ? (
            <text x={12} y={(PAD.t + PLOT_H - PAD.b) / 2} textAnchor="middle" transform={`rotate(-90 12 ${(PAD.t + PLOT_H - PAD.b) / 2})`} className="fill-slate-500 text-[11px]">
              {yLabel}
            </text>
          ) : null}
        </g>
      ) : null}
      {children(s)}
    </svg>
  );
}

export function polyline(points: [number, number][], s: Scale): string {
  return points
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b))
    .map(([a, b]) => `${s.x(a).toFixed(1)},${s.y(b).toFixed(1)}`)
    .join(" ");
}

export const CLASS_COLORS = ["#14b8a6", "#f43f5e", "#f59e0b", "#6366f1", "#84cc16", "#ec4899", "#0ea5e9"];

/** Small line chart used for loss curves and elbow plots. */
export function MiniChart({
  values,
  label,
  xLabel = "step",
  log = false,
  highlight,
}: {
  values: number[];
  label: string;
  xLabel?: string;
  log?: boolean;
  highlight?: number;
}) {
  const finite = values.map((v) => (Number.isFinite(v) ? v : NaN));
  const tr = (v: number) => (log ? Math.log10(Math.max(v, 1e-9)) : v);
  const ys = finite.filter(Number.isFinite).map(tr);
  const lo = ys.length ? Math.min(...ys) : 0;
  const hi = ys.length ? Math.max(...ys) : 1;
  const W = 260;
  const H = 90;
  const px = (i: number) => 8 + (i / Math.max(values.length - 1, 1)) * (W - 16);
  const py = (v: number) => 8 + (1 - (tr(v) - lo) / (hi - lo || 1)) * (H - 22);
  const d = finite
    .map((v, i) => (Number.isFinite(v) ? `${px(i).toFixed(1)},${py(v).toFixed(1)}` : null))
    .filter(Boolean)
    .join(" ");
  return (
    <figure className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-2">
      <figcaption className="px-1 text-[11px] font-semibold text-slate-500">{label}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <polyline points={d} fill="none" stroke="#14b8a6" strokeWidth={2} />
        {highlight !== undefined && Number.isFinite(finite[highlight]) ? (
          <circle cx={px(highlight)} cy={py(finite[highlight])} r={4} fill="#f59e0b" />
        ) : null}
        <text x={W / 2} y={H - 2} textAnchor="middle" className="fill-slate-500 text-[9px]">
          {xLabel}
        </text>
      </svg>
    </figure>
  );
}
