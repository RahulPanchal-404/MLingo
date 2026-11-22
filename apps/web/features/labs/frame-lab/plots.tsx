"use client";

import { useEffect, useRef } from "react";

import type { Frame, FrameRun, TreeView, TreeViewNode } from "./types";

const CLASS = ["#14b8a6", "#f59e0b"];
const W = 560;
const H = 380;
const PAD = 34;
/** Round SVG coordinates so server and browser renders match exactly (their maths libraries can differ in the last digit). */
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Points, decision surface, curves and segments on one 2-D plane. */
export function PlanePlot({ run, frame, title, label }: { run: FrameRun; frame: Frame; title: string; label: string }) {
  const { domain } = run;
  const sx = (x: number) => r2(PAD + ((x - domain.x[0]) / (domain.x[1] - domain.x[0])) * (W - 2 * PAD));
  const sy = (y: number) => r2(H - PAD - ((y - domain.y[0]) / (domain.y[1] - domain.y[0])) * (H - 2 * PAD));
  const clipY = (y: number) => Math.max(domain.y[0], Math.min(domain.y[1], y));
  const s = frame.surface;
  const cw = s ? (W - 2 * PAD) / s.n : 0;
  const ch = s ? (H - 2 * PAD) / s.n : 0;
  return (
    <figure className="lab-chart">
      <figcaption>
        {title} <span>{label}</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}, ${label}`}>
        <defs>
          <clipPath id="plane-clip">
            <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} />
          </clipPath>
        </defs>
        <g clipPath="url(#plane-clip)">
          {s
            ? s.values.map((v, i) => {
                const r = Math.floor(i / s.n);
                const c = i % s.n;
                return <rect key={i} x={r2(PAD + c * cw)} y={r2(H - PAD - (r + 1) * ch)} width={r2(cw + 0.6)} height={r2(ch + 0.6)} fill={v >= 0.5 ? CLASS[1] : CLASS[0]} opacity={0.16} />;
              })
            : null}
          {(frame.segments ?? []).map((g, i) => {
            const style =
              g.kind === "split-new"
                ? { stroke: "var(--foreground)", strokeWidth: 3 }
                : g.kind === "split"
                  ? { stroke: "var(--foreground)", strokeWidth: 1.2, opacity: 0.55 }
                  : { stroke: "var(--muted)", strokeWidth: 1, opacity: 0.45 };
            return <line key={i} x1={sx(g.a[0])} y1={sy(clipY(g.a[1]))} x2={sx(g.b[0])} y2={sy(clipY(g.b[1]))} {...style} />;
          })}
          {(frame.curves ?? []).map((cv, i) => (
            <polyline
              key={i}
              points={cv.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}
              fill="none"
              stroke={cv.kind === "truth" || cv.kind === "margin" || cv.kind === "axis2" ? "var(--muted)" : "var(--foreground)"}
              strokeWidth={cv.kind === "model" || cv.kind === "axis" ? 2.6 : 1.5}
              strokeDasharray={cv.kind === "truth" || cv.kind === "margin" || cv.kind === "axis2" ? "6 5" : undefined}
            />
          ))}
          {frame.points.map((p, i) => {
            const color = p.c === undefined ? "#38bdf8" : CLASS[p.c];
            return (
              <g key={i}>
                {p.ring ? <circle cx={sx(p.x)} cy={sy(p.y)} r={7.5} fill="none" stroke="var(--foreground)" strokeWidth={1.4} /> : null}
                <circle cx={sx(p.x)} cy={sy(p.y)} r={p.test ? 3.6 : 3.8} fill={p.test ? "var(--surface)" : color} stroke={color} strokeWidth={p.test ? 1.6 : 0} />
              </g>
            );
          })}
        </g>
        <rect x={PAD} y={PAD} width={W - 2 * PAD} height={H - 2 * PAD} fill="none" stroke="var(--border)" />
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--muted)">{run.axes.x}</text>
        <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="var(--muted)" transform={`rotate(-90 12 ${H / 2})`}>{run.axes.y}</text>
      </svg>
      <Legend frame={frame} />
    </figure>
  );
}

function Legend({ frame }: { frame: Frame }) {
  const hasClasses = frame.points.some((p) => p.c !== undefined);
  const hasTest = frame.points.some((p) => p.test);
  const kinds = new Set((frame.curves ?? []).map((c) => c.kind));
  const items: [string, React.ReactNode][] = [];
  if (hasClasses) items.push(["class 0", <Dot key="a" color={CLASS[0]} />], ["class 1", <Dot key="b" color={CLASS[1]} />]);
  if (hasTest) items.push(["test point (not used for training)", <Dot key="t" color="#94a3b8" hollow />]);
  if (kinds.has("truth")) items.push(["true curve", <Dash key="d" />]);
  if (kinds.has("margin")) items.push(["margin", <Dash key="m" />]);
  if (frame.points.some((p) => p.ring)) items.push(["support vector", <Ring key="r" />]);
  if (!items.length) return null;
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map(([text, icon]) => (
        <span key={text} className="inline-flex items-center gap-1.5">
          {icon}
          {text}
        </span>
      ))}
    </p>
  );
}
const Dot = ({ color, hollow }: { color: string; hollow?: boolean }) => (
  <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: hollow ? "transparent" : color, border: `1.5px solid ${color}` }} />
);
const Dash = () => <span aria-hidden="true" className="inline-block w-4 border-t-[1.5px] border-dashed border-current" />;
const Ring = () => <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border-[1.3px] border-current" />;

/** One line per metric across all frames, with a cursor at the current frame. */
export function MetricChart({ run, current }: { run: FrameRun; current: number }) {
  const w = 420;
  const h = 300;
  const pad = { l: 44, r: 12, t: 12, b: 28 };
  const n = run.frames.length;
  const values = run.series.flatMap((s) => run.frames.map((f) => f.metrics[s.key]).filter(Number.isFinite));
  const isPct = run.series.every((s) => s.format === "pct");
  let lo = isPct ? Math.max(0, Math.min(...values) - 0.05) : 0;
  let hi = isPct ? Math.min(1, Math.max(...values) + 0.02) : Math.max(...values) * 1.08;
  if (!(hi > lo)) [lo, hi] = [0, 1];
  const x = (i: number) => r2(pad.l + (n <= 1 ? 0 : (i / (n - 1)) * (w - pad.l - pad.r)));
  const y = (v: number) => r2(h - pad.b - ((v - lo) / (hi - lo)) * (h - pad.t - pad.b));
  const fmt = (v: number) => (isPct ? `${Math.round(v * 100)}%` : Number(v.toPrecision(2)).toString());
  const ticks = [lo, (lo + hi) / 2, hi];
  return (
    <figure className="lab-chart">
      <figcaption>
        {run.metricTitle} <span>{run.frameLabel(current)}</span>
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={run.metricTitle}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{fmt(t)}</text>
          </g>
        ))}
        <line x1={x(current)} x2={x(current)} y1={pad.t} y2={h - pad.b} stroke="var(--foreground)" strokeDasharray="3 3" opacity={0.6} />
        {run.series.map((s) => (
          <g key={s.key}>
            <polyline points={run.frames.map((f, i) => `${x(i)},${y(f.metrics[s.key])}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2.2} />
            <circle cx={x(current)} cy={y(run.frames[current].metrics[s.key])} r={4} fill={s.color} />
          </g>
        ))}
        <text x={pad.l} y={h - 8} fontSize="10" fill="var(--muted)">{run.frameLabel(0)}</text>
        <text x={w - pad.r} y={h - 8} textAnchor="end" fontSize="10" fill="var(--muted)">{run.frameLabel(n - 1)}</text>
      </svg>
      <p className="flex flex-wrap gap-x-4 gap-y-1">
        {run.series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4" style={{ background: s.color }} />
            {s.label}: <b className="text-[var(--foreground)]">{fmt(run.frames[current].metrics[s.key])}</b>
          </span>
        ))}
      </p>
    </figure>
  );
}

const SLOT = 92;
const LEVEL = 74;
const QW = 118;
const LW = 70;
const BH = 38;

type Placed = { node: TreeViewNode; x: number; y: number; depth: number; kids: Placed[] };

function place(node: TreeViewNode, depth: number, next: { leaf: number }): Placed {
  if (!node.yes || !node.no) {
    const x = next.leaf * SLOT + SLOT / 2;
    next.leaf += 1;
    return { node, x, y: depth * LEVEL, depth, kids: [] };
  }
  const yes = place(node.yes, depth + 1, next);
  const no = place(node.no, depth + 1, next);
  return { node, x: (yes.x + no.x) / 2, y: depth * LEVEL, depth, kids: [yes, no] };
}
const flatten = (p: Placed): Placed[] => [p, ...p.kids.flatMap(flatten)];

/** The tree itself: each question in a box, yes to the left, no to the right, leaves coloured by the class they predict. */
export function TreeDiagram({ tree, label }: { tree: TreeView; label: string }) {
  const counter = { leaf: 0 };
  const root = place(tree.root, 0, counter);
  const all = flatten(root);
  const width = Math.max(counter.leaf * SLOT, QW + 20);
  const height = Math.max(...all.map((p) => p.y)) + BH + 16;
  const scroller = useRef<HTMLDivElement>(null);
  const newest = all.find((p) => p.node.newest);
  useEffect(() => {
    const el = scroller.current;
    if (!el || !newest) return;
    el.scrollTo({ left: Math.max(0, newest.x - el.clientWidth / 2), top: Math.max(0, newest.y - el.clientHeight / 3), behavior: "smooth" });
  }, [newest]);
  return (
    <figure className="lab-chart md:col-span-2">
      <figcaption>
        The tree <span>{label}</span>
      </figcaption>
      <div ref={scroller} className="mt-2 max-h-[26rem] overflow-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Decision tree diagram" style={{ width, maxWidth: "none", margin: "0 auto", display: "block" }}>
          {all.flatMap((p) =>
            p.kids.map((k, i) => (
              <g key={`${p.node.id}-${k.node.id}`}>
                <line x1={p.x} y1={p.y + BH + 8} x2={k.x} y2={k.y + 8} stroke="var(--muted)" strokeWidth={1.2} />
                <text x={(p.x + k.x) / 2 + (i === 0 ? -8 : 8)} y={(p.y + BH + k.y) / 2 + 12} textAnchor={i === 0 ? "end" : "start"} fontSize="10" fill="var(--muted)">
                  {i === 0 ? "yes" : "no"}
                </text>
              </g>
            )),
          )}
          {all.map((p) => {
            const n = p.node;
            const total = n.n0 + n.n1;
            if (n.question) {
              return (
                <g key={n.id} transform={`translate(${p.x - QW / 2} ${p.y + 8})`}>
                  <rect width={QW} height={BH} rx={7} fill="var(--surface-elevated, var(--surface))" stroke={n.newest ? "var(--foreground)" : "var(--border)"} strokeWidth={n.newest ? 2.5 : 1} />
                  <text x={QW / 2} y={15} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--foreground)">{n.question}?</text>
                  <text x={QW / 2} y={30} textAnchor="middle" fontSize="9.5" fill="var(--muted)">{total} points · Gini {n.gini.toFixed(2)}</text>
                </g>
              );
            }
            return (
              <g key={n.id} transform={`translate(${p.x - LW / 2} ${p.y + 8})`}>
                <rect width={LW} height={BH} rx={7} fill={CLASS[n.pred]} fillOpacity={0.18} stroke={CLASS[n.pred]} strokeWidth={1.3} />
                <circle cx={13} cy={14} r={3.5} fill={CLASS[0]} />
                <text x={20} y={17.5} fontSize="10" fill="var(--foreground)">{n.n0}</text>
                <circle cx={43} cy={14} r={3.5} fill={CLASS[1]} />
                <text x={50} y={17.5} fontSize="10" fill="var(--foreground)">{n.n1}</text>
                <text x={LW / 2} y={31} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--foreground)">→ class {n.pred}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p>Boxes are questions; a training point goes left if the answer is yes. Coloured boxes are leaves: the dots count the training points that end there, and the leaf predicts the majority class. The outlined box is the question added in this frame.</p>
    </figure>
  );
}
