"use client";

import { CLASS_COLORS, MiniChart, Plot } from "../framework/plot";
import type { VisualProps } from "../framework/types";
import { CUSTOMER_DATA, ELBOW_DATA, KPP_SEED, RING_DATA, START_DATA, START_INITS, kmeansPlusPlus, type Pt } from "./engine";

type Viz = { assign?: number[]; centroids?: [number, number][]; elbow?: number[]; k?: number };

function Scatter({
  pts,
  viz,
  x,
  y,
  xLabel,
  yLabel,
  starts,
}: {
  pts: Pt[];
  viz: Viz | null;
  x: [number, number];
  y: [number, number];
  xLabel: string;
  yLabel: string;
  starts?: [number, number][];
}) {
  return (
    <Plot x={x} y={y} xLabel={xLabel} yLabel={yLabel}>
      {(s) => (
        <>
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={s.x(p.x)}
              cy={s.y(p.y)}
              r={4}
              fill={viz?.assign ? CLASS_COLORS[viz.assign[i] % CLASS_COLORS.length] : "#94a3b8"}
              fillOpacity={0.85}
            />
          ))}
          {starts?.map(([cx, cy], i) => (
            <circle key={`s${i}`} cx={s.x(cx)} cy={s.y(cy)} r={11} fill="none" stroke="#0f172a" strokeWidth={2.5} strokeDasharray="3 3" />
          ))}
          {viz?.centroids?.map(([cx, cy], i) => (
            <g key={`c${i}`}>
              <circle cx={s.x(cx)} cy={s.y(cy)} r={9} fill={CLASS_COLORS[i % CLASS_COLORS.length]} stroke="#0f172a" strokeWidth={2.5} />
              <path d={`M${s.x(cx) - 4},${s.y(cy)} h8 M${s.x(cx)},${s.y(cy) - 4} v8`} stroke="#0f172a" strokeWidth={2} />
            </g>
          ))}
        </>
      )}
    </Plot>
  );
}

export function ClustersVisual({ level, params, evaluation }: VisualProps) {
  const viz = (evaluation?.viz as Viz | undefined) ?? null;

  if (level.id === "elbow") {
    return (
      <div className="space-y-3">
        <Scatter pts={ELBOW_DATA} viz={viz} x={[-1, 12]} y={[-1, 12]} xLabel="behaviour A" yLabel="behaviour B" />
        {viz?.elbow ? <MiniChart values={viz.elbow} label="Inertia for K = 1…7 (the elbow chart)" xLabel="K = 1 → 7" highlight={(viz.k ?? 1) - 1} /> : (
          <p className="text-center text-xs text-slate-500">Pick K, then Run to see the clusters and the elbow chart.</p>
        )}
      </div>
    );
  }

  if (level.id === "start") {
    const rows = START_DATA.map((p) => [p.x, p.y] as [number, number]);
    const init = String(params.init);
    const starts = params.restarts ? undefined : init === "kmeanspp" ? kmeansPlusPlus(rows, 4, KPP_SEED) : START_INITS[init];
    return (
      <div className="space-y-2">
        <Scatter pts={START_DATA} viz={viz} x={[-1, 11]} y={[-1, 11]} xLabel="x" yLabel="y" starts={viz ? undefined : starts} />
        <p className="text-center text-xs text-slate-500">
          {viz ? "Filled circles: where the centroids ended up." : params.restarts ? "10 different starts will be tried; the best result is kept." : "Dashed rings: where the 4 centroids start."}
        </p>
      </div>
    );
  }

  if (level.id === "units") {
    return (
      <div className="space-y-2">
        <Scatter pts={CUSTOMER_DATA} viz={viz} x={[0, 220]} y={[0, 32]} xLabel="annual income (₹ thousands)" yLabel="visits per month" />
        <p className="text-center text-xs text-slate-500">Look at the axes: income spans about 180 units, visits about 30.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Scatter pts={RING_DATA} viz={viz} x={[0, 10]} y={[0, 10]} xLabel="x" yLabel="y" />
      <p className="text-center text-xs text-slate-500">{viz ? "Colours show which cluster K-Means put each point in." : "Pick a K and a verdict, then Run."}</p>
    </div>
  );
}
