"use client";

import { useMemo, useState, type ReactNode } from "react";

import { lassoFit, ridgeFit, solve } from "@/features/games/framework/linalg";
import type { WidgetId } from "./topics";

/* ------------------------------------------------------------------ shared UI */

function Card({ title, children, caption }: { title: string; children: ReactNode; caption?: string }) {
  return (
    <figure className="rounded-2xl border-2 border-[var(--ink)] bg-white p-5 dark:bg-slate-900">
      <figcaption className="mb-4 flex items-center gap-2">
        <span className="rounded-full border-2 border-slate-950 bg-[#7be0c3] px-2.5 py-0.5 text-xs font-bold text-slate-950">Try it</span>
        <span className="font-semibold text-slate-950 dark:text-white">{title}</span>
      </figcaption>
      {children}
      {caption ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{caption}</p> : null}
    </figure>
  );
}

function Slider({ label, value, min, max, step, onChange, fmt = (v) => v.toString() }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt?: (v: number) => string;
}) {
  return (
    <label className="grid grid-cols-[7.5rem_1fr_4rem] items-center gap-3 text-sm">
      <span className="text-slate-700 dark:text-slate-300">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-teal-600" />
      <span className="text-right font-semibold tabular-nums text-slate-950 dark:text-white">{fmt(value)}</span>
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
      <div className={`text-lg font-bold tabular-nums ${tone === "good" ? "text-emerald-700 dark:text-emerald-400" : tone === "bad" ? "text-rose-700 dark:text-rose-400" : "text-slate-950 dark:text-white"}`}>{value}</div>
    </div>
  );
}

const f2 = (v: number) => v.toFixed(2);
const f3 = (v: number) => v.toFixed(3);

/* ------------------------------------------------------------------ widgets */

function GdStep({ caption }: { caption?: string }) {
  const [w0, setW0] = useState(-1);
  const [lr, setLr] = useState(0.2);
  const path = useMemo(() => {
    const out = [w0];
    let w = w0;
    for (let i = 0; i < 12; i++) {
      w = w - lr * 2 * (w - 3);
      out.push(w);
      if (Math.abs(w) > 1e4) break;
    }
    return out;
  }, [w0, lr]);
  const last = path[path.length - 1];
  const status = Math.abs(last - 3) < 0.05 ? "converged" : Math.abs(last - 3) > Math.abs(w0 - 3) ? "diverging" : lr > 0.5 ? "zig-zagging" : "still descending";
  const X = (w: number) => 20 + ((w + 3) / 12) * 300;
  const Y = (w: number) => 170 - Math.min(160, ((w - 3) ** 2) * 4.4);
  return (
    <Card title="Gradient descent on L(w) = (w − 3)²" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 340 180" className="w-full" aria-hidden="true">
          <path d={Array.from({ length: 121 }, (_, i) => -3 + i * 0.1).map((w, i) => `${i ? "L" : "M"}${X(w)} ${Y(w)}`).join(" ")} fill="none" className="stroke-slate-400" strokeWidth="2" />
          <polyline points={path.filter((w) => w > -3 && w < 9).map((w) => `${X(w)},${Y(w)}`).join(" ")} fill="none" stroke="#ff7a59" strokeWidth="2" />
          {path.filter((w) => w > -3 && w < 9).map((w, i) => <circle key={i} cx={X(w)} cy={Y(w)} r={i === 0 ? 6 : 4} fill={i === 0 ? "#ffd166" : "#ff7a59"} stroke="#0e1016" strokeWidth="1.5" />)}
          <line x1={X(3)} x2={X(3)} y1="10" y2="175" stroke="#0a82bd" strokeDasharray="4 4" />
        </svg>
        <div className="space-y-3">
          <Slider label="Start w₀" value={w0} min={-2} max={8} step={0.5} onChange={setW0} />
          <Slider label="Learning rate η" value={lr} min={0.02} max={1.1} step={0.02} onChange={setLr} fmt={f2} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="w after 12 steps" value={Math.abs(last) > 1e4 ? "∞" : f3(last)} />
            <Stat label="Status" value={status} tone={status === "converged" ? "good" : status === "diverging" ? "bad" : undefined} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Update: w ← w − η · 2(w − 3). The minimum is at w = 3.</p>
        </div>
      </div>
    </Card>
  );
}

function Sigmoid({ caption }: { caption?: string }) {
  const [z, setZ] = useState(1);
  const s = 1 / (1 + Math.exp(-z));
  const X = (v: number) => 20 + ((v + 8) / 16) * 300;
  const Y = (p: number) => 160 - p * 140;
  return (
    <Card title="The sigmoid turns a score into a probability" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 340 175" className="w-full" aria-hidden="true">
          <line x1="20" x2="320" y1={Y(0.5)} y2={Y(0.5)} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="4 4" />
          <path d={Array.from({ length: 161 }, (_, i) => -8 + i * 0.1).map((v, i) => `${i ? "L" : "M"}${X(v)} ${Y(1 / (1 + Math.exp(-v)))}`).join(" ")} fill="none" stroke="#0a82bd" strokeWidth="3" />
          <circle cx={X(z)} cy={Y(s)} r="7" fill="#ffd166" stroke="#0e1016" strokeWidth="2" />
        </svg>
        <div className="space-y-3">
          <Slider label="Score z = w·x + b" value={z} min={-8} max={8} step={0.1} onChange={setZ} fmt={(v) => v.toFixed(1)} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="σ(z) = P(class 1)" value={f3(s)} />
            <Stat label="Prediction (threshold 0.5)" value={s >= 0.5 ? "class 1" : "class 0"} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">z = 0 gives exactly 0.5. Large positive z → close to 1; large negative → close to 0.</p>
        </div>
      </div>
    </Card>
  );
}

const PTS: [number, number][] = [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6]];
function MseLine({ caption }: { caption?: string }) {
  const [w, setW] = useState(0.4);
  const [b, setB] = useState(2);
  const res = PTS.map(([x, y]) => w * x + b - y);
  const mse = res.reduce((a, r) => a + r * r, 0) / res.length;
  const mae = res.reduce((a, r) => a + Math.abs(r), 0) / res.length;
  const X = (x: number) => 20 + x * 55;
  const Y = (y: number) => 170 - y * 24;
  return (
    <Card title="Fit a line by hand and watch the error" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 340 180" className="w-full" aria-hidden="true">
          {PTS.map(([x, y], i) => <line key={i} x1={X(x)} x2={X(x)} y1={Y(y)} y2={Y(w * x + b)} stroke="#ff7a59" strokeWidth="3" />)}
          <line x1={X(0)} x2={X(6)} y1={Y(b)} y2={Y(w * 6 + b)} stroke="#0a82bd" strokeWidth="3" />
          {PTS.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r="6" fill="#b9a6ff" stroke="#0e1016" strokeWidth="2" />)}
        </svg>
        <div className="space-y-3">
          <Slider label="Slope w" value={w} min={-1} max={3} step={0.05} onChange={setW} fmt={f2} />
          <Slider label="Intercept b" value={b} min={-2} max={5} step={0.05} onChange={setB} fmt={f2} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="MSE" value={f3(mse)} tone={mse < 0.33 ? "good" : undefined} />
            <Stat label="MAE" value={f3(mae)} />
          </div>
          <button type="button" onClick={() => { setW(0.9); setB(1.3); }} className="rounded-xl border bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
            Snap to least squares (w = 0.9, b = 1.3)
          </button>
        </div>
      </div>
    </Card>
  );
}

function Gini({ caption }: { caption?: string }) {
  const [a, setA] = useState(8);
  const [bb, setB] = useState(2);
  const n = a + bb || 1;
  const pa = a / n;
  const pb = bb / n;
  const gini = 1 - pa * pa - pb * pb;
  const ent = [pa, pb].reduce((s, p) => (p > 0 ? s - p * Math.log2(p) : s), 0);
  return (
    <Card title="How mixed is a node?" caption={caption}>
      <div className="space-y-3">
        <Slider label="Class A count" value={a} min={0} max={20} step={1} onChange={setA} />
        <Slider label="Class B count" value={bb} min={0} max={20} step={1} onChange={setB} />
        <div className="flex h-6 overflow-hidden rounded-full border-2 border-slate-950" aria-hidden="true">
          <div style={{ width: `${pa * 100}%`, background: "#7be0c3" }} />
          <div style={{ width: `${pb * 100}%`, background: "#ff9a8a" }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="p(A)" value={f2(pa)} />
          <Stat label="Gini = 1 − Σp²" value={f3(gini)} tone={gini < 0.05 ? "good" : undefined} />
          <Stat label="Entropy (bits)" value={f3(ent)} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">Pure node (all one class) → both are 0. A 50/50 node is the worst: Gini 0.5, entropy 1.</p>
      </div>
    </Card>
  );
}

function Distance({ caption }: { caption?: string }) {
  const [ax, setAx] = useState(2);
  const [ay, setAy] = useState(2);
  const [bx, setBx] = useState(7);
  const [by, setBy] = useState(6);
  const eu = Math.hypot(ax - bx, ay - by);
  const man = Math.abs(ax - bx) + Math.abs(ay - by);
  const P = (v: number) => 15 + v * 18;
  const Q = (v: number) => 195 - v * 18;
  return (
    <Card title="Euclidean vs Manhattan distance" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[auto_1fr]">
        <svg viewBox="0 0 210 210" className="w-full max-w-[220px]" aria-hidden="true">
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} className="stroke-slate-200 dark:stroke-slate-700">
              <line x1={P(i)} x2={P(i)} y1={Q(0)} y2={Q(10)} />
              <line x1={P(0)} x2={P(10)} y1={Q(i)} y2={Q(i)} />
            </g>
          ))}
          <polyline points={`${P(ax)},${Q(ay)} ${P(bx)},${Q(ay)} ${P(bx)},${Q(by)}`} fill="none" stroke="#ff7a59" strokeWidth="3" />
          <line x1={P(ax)} y1={Q(ay)} x2={P(bx)} y2={Q(by)} stroke="#0a82bd" strokeWidth="3" />
          <circle cx={P(ax)} cy={Q(ay)} r="6" fill="#7be0c3" stroke="#0e1016" strokeWidth="2" />
          <circle cx={P(bx)} cy={Q(by)} r="6" fill="#ffd166" stroke="#0e1016" strokeWidth="2" />
        </svg>
        <div className="space-y-2.5">
          <Slider label="A x" value={ax} min={0} max={10} step={1} onChange={setAx} />
          <Slider label="A y" value={ay} min={0} max={10} step={1} onChange={setAy} />
          <Slider label="B x" value={bx} min={0} max={10} step={1} onChange={setBx} />
          <Slider label="B y" value={by} min={0} max={10} step={1} onChange={setBy} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Euclidean (blue)" value={f2(eu)} />
            <Stat label="Manhattan (orange)" value={man.toString()} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function Confusion({ caption }: { caption?: string }) {
  const [tp, setTp] = useState(40);
  const [fp, setFp] = useState(10);
  const [fn, setFn] = useState(20);
  const [tn, setTn] = useState(130);
  const n = tp + fp + fn + tn || 1;
  const prec = tp + fp ? tp / (tp + fp) : 0;
  const rec = tp + fn ? tp / (tp + fn) : 0;
  const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0;
  const cell = (label: string, v: number, bg: string) => (
    <div className="rounded-xl border-2 border-slate-950 p-3 text-slate-950" style={{ background: bg }}>
      <div className="text-xs font-semibold">{label}</div>
      <div className="text-xl font-bold tabular-nums">{v}</div>
    </div>
  );
  return (
    <Card title="Confusion matrix → metrics" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="space-y-2.5">
          <Slider label="True positives" value={tp} min={0} max={100} step={1} onChange={setTp} />
          <Slider label="False positives" value={fp} min={0} max={100} step={1} onChange={setFp} />
          <Slider label="False negatives" value={fn} min={0} max={100} step={1} onChange={setFn} />
          <Slider label="True negatives" value={tn} min={0} max={200} step={1} onChange={setTn} />
          <div className="grid grid-cols-2 gap-2">
            {cell("TP (caught)", tp, "#7be0c3")}
            {cell("FP (false alarm)", fp, "#ff9a8a")}
            {cell("FN (missed)", fn, "#ffd166")}
            {cell("TN (correctly ignored)", tn, "#e9eaed")}
          </div>
        </div>
        <div className="grid content-start grid-cols-2 gap-2">
          <Stat label="Accuracy" value={f3((tp + tn) / n)} />
          <Stat label="Precision TP/(TP+FP)" value={f3(prec)} />
          <Stat label="Recall TP/(TP+FN)" value={f3(rec)} />
          <Stat label="F1" value={f3(f1)} />
          <p className="col-span-2 text-sm text-slate-600 dark:text-slate-400">Raise TN to 2000 in your head: accuracy shoots up while precision and recall stay the same. That is why accuracy misleads on imbalanced data.</p>
        </div>
      </div>
    </Card>
  );
}

const RL = (() => {
  let s = 11;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = 0; i < 40; i++) {
    const a = r();
    const b = a + r() * 0.3; // strongly correlated with a
    const c = r(); // irrelevant
    X.push([a, b, c]);
    y.push(2 * a + 1 * b + r() * 0.4);
  }
  return { X, y };
})();
function RidgeLasso({ caption }: { caption?: string }) {
  const [logL, setLogL] = useState(-2);
  const lambda = Math.pow(10, logL);
  const ridge = useMemo(() => ridgeFit(RL.X, RL.y, lambda), [lambda]);
  const lasso = useMemo(() => lassoFit(RL.X, RL.y, lambda), [lambda]);
  const names = ["x₁ (useful)", "x₂ (≈ x₁)", "x₃ (noise)"];
  const Bar = ({ v }: { v: number }) => (
    <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-800">
      <div className="absolute top-0 h-4 rounded-full" style={{ left: v >= 0 ? "50%" : `${50 + Math.max(-50, v * 12.5)}%`, width: `${Math.min(50, Math.abs(v) * 12.5)}%`, background: "#0a82bd" }} />
      <div className="absolute left-1/2 top-0 h-4 w-px bg-slate-950 dark:bg-white" />
    </div>
  );
  return (
    <Card title="Ridge shrinks weights, Lasso zeroes them" caption={caption}>
      <Slider label="Penalty λ" value={logL} min={-3} max={1} step={0.1} onChange={setLogL} fmt={() => (lambda < 0.01 ? lambda.toExponential(0) : lambda.toFixed(2))} />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {[{ name: "Ridge (L2)", w: ridge.w }, { name: "Lasso (L1)", w: lasso.w }].map((m) => (
          <div key={m.name} className="space-y-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{m.name}</p>
            {m.w.map((v, i) => (
              <div key={i} className="grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-2 text-sm">
                <span className="text-slate-700 dark:text-slate-300">{names[i]}</span>
                <Bar v={v} />
                <span className="text-right tabular-nums font-semibold text-slate-950 dark:text-white">{Math.abs(v) < 0.005 ? "0" : f2(v)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

const POLY = (() => {
  let s = 5;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  const f = (x: number) => Math.sin(2.6 * x);
  const train = Array.from({ length: 12 }, (_, i) => { const x = -1 + (2 * i) / 11 + r() * 0.04; return [x, f(x) + r() * 0.25] as [number, number]; });
  const test = Array.from({ length: 40 }, () => { const x = r(); return [x, f(x) + r() * 0.25] as [number, number]; });
  return { train, test };
})();
function PolyDegree({ caption }: { caption?: string }) {
  const [deg, setDeg] = useState(3);
  const coef = useMemo(() => {
    const A = POLY.train.map(([x]) => Array.from({ length: deg + 1 }, (_, k) => x ** k));
    const AtA = A[0].map((_, i) => A[0].map((__, j) => A.reduce((s, row) => s + row[i] * row[j], 0) + (i === j ? 1e-9 : 0)));
    const Aty = A[0].map((_, i) => A.reduce((s, row, n) => s + row[i] * POLY.train[n][1], 0));
    return solve(AtA, Aty);
  }, [deg]);
  const pred = (x: number) => coef.reduce((s, c, k) => s + c * x ** k, 0);
  const mse = (d: [number, number][]) => d.reduce((s, [x, y]) => s + (pred(x) - y) ** 2, 0) / d.length;
  const tr = mse(POLY.train);
  const te = mse(POLY.test);
  const X = (x: number) => 20 + (x + 1) * 150;
  const Y = (y: number) => 95 - Math.max(-85, Math.min(85, y * 55));
  return (
    <Card title="Model complexity: underfit → good fit → overfit" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 340 190" className="w-full" aria-hidden="true">
          {POLY.test.map(([x, y], i) => <circle key={`t${i}`} cx={X(x)} cy={Y(y)} r="3" className="fill-slate-300 dark:fill-slate-600" />)}
          <path d={Array.from({ length: 201 }, (_, i) => -1 + i * 0.01).map((x, i) => `${i ? "L" : "M"}${X(x)} ${Y(pred(x))}`).join(" ")} fill="none" stroke="#0a82bd" strokeWidth="3" />
          {POLY.train.map(([x, y], i) => <circle key={i} cx={X(x)} cy={Y(y)} r="5" fill="#ffd166" stroke="#0e1016" strokeWidth="1.5" />)}
        </svg>
        <div className="space-y-3">
          <Slider label="Polynomial degree" value={deg} min={1} max={11} step={1} onChange={setDeg} />
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Train MSE (yellow)" value={f3(tr)} />
            <Stat label="Test MSE (grey)" value={te > 99 ? "> 99" : f3(te)} tone={te < 0.12 ? "good" : te > 0.5 ? "bad" : undefined} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Train error only goes down as the degree rises. Test error falls, then climbs: that climb is overfitting.</p>
        </div>
      </div>
    </Card>
  );
}

const SC = { h: [150, 162, 170, 178, 190], inc: [20000, 45000, 60000, 85000, 120000] };
function Scaling({ caption }: { caption?: string }) {
  const [mode, setMode] = useState<"raw" | "minmax" | "standard">("raw");
  const tf = (a: number[]) => {
    if (mode === "raw") return a;
    if (mode === "minmax") { const lo = Math.min(...a); const hi = Math.max(...a); return a.map((v) => (v - lo) / (hi - lo)); }
    const m = a.reduce((s, v) => s + v, 0) / a.length;
    const sd = Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
    return a.map((v) => (v - m) / sd);
  };
  const h = tf(SC.h);
  const inc = tf(SC.inc);
  const all = [...h, ...inc];
  const lo = Math.min(...all, 0);
  const hi = Math.max(...all);
  const pos = (v: number) => `${((v - lo) / (hi - lo || 1)) * 100}%`;
  return (
    <Card title="Same data, three scales" caption={caption}>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["raw", "minmax", "standard"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${mode === m ? "border-slate-950 bg-[#ffd166] text-slate-950" : "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"}`}>
            {m === "raw" ? "Raw" : m === "minmax" ? "Min-max [0, 1]" : "Standardised (z)"}
          </button>
        ))}
      </div>
      {[{ name: "Height (cm)", v: h, c: "#7be0c3" }, { name: "Income (₹)", v: inc, c: "#b9a6ff" }].map((row) => (
        <div key={row.name} className="mb-3 grid grid-cols-[6.5rem_1fr] items-center gap-3 text-sm">
          <span className="text-slate-700 dark:text-slate-300">{row.name}</span>
          <div className="relative h-8 rounded-full bg-slate-100 dark:bg-slate-800">
            {row.v.map((v, i) => <span key={i} className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950" style={{ left: pos(v), background: row.c }} title={v.toFixed(2)} />)}
          </div>
        </div>
      ))}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {mode === "raw" ? "Raw: income is ~500× larger, so all heights collapse into one spot and distances are decided by income alone." : mode === "minmax" ? "Min-max: both features now span 0 to 1." : "Standardised: both features have mean 0 and standard deviation 1."}
      </p>
    </Card>
  );
}

function Bayes({ caption }: { caption?: string }) {
  const [prior, setPrior] = useState(1);
  const [sens, setSens] = useState(90);
  const [fpr, setFpr] = useState(5);
  const p = prior / 100;
  const tp = (sens / 100) * p;
  const fp = (fpr / 100) * (1 - p);
  const post = tp / (tp + fp);
  return (
    <Card title="Bayes' rule with natural frequencies" caption={caption}>
      <div className="space-y-3">
        <Slider label="Base rate P(A) %" value={prior} min={0.5} max={50} step={0.5} onChange={setPrior} fmt={(v) => `${v}%`} />
        <Slider label="P(flag | A) %" value={sens} min={50} max={100} step={1} onChange={setSens} fmt={(v) => `${v}%`} />
        <Slider label="P(flag | not A) %" value={fpr} min={0} max={30} step={0.5} onChange={setFpr} fmt={(v) => `${v}%`} />
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Flagged A, per 10,000" value={Math.round(tp * 10000).toString()} />
          <Stat label="Flagged not-A, per 10,000" value={Math.round(fp * 10000).toString()} />
          <Stat label="P(A | flagged)" value={`${(post * 100).toFixed(1)}%`} tone={post > 0.5 ? "good" : "bad"} />
        </div>
      </div>
    </Card>
  );
}

function Neuron({ caption }: { caption?: string }) {
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0.5);
  const [w1, setW1] = useState(0.8);
  const [w2, setW2] = useState(-1.2);
  const [b, setB] = useState(0.3);
  const [act, setAct] = useState<"sigmoid" | "relu" | "step">("sigmoid");
  const z = w1 * x1 + w2 * x2 + b;
  const out = act === "sigmoid" ? 1 / (1 + Math.exp(-z)) : act === "relu" ? Math.max(0, z) : z >= 0 ? 1 : 0;
  return (
    <Card title="One neuron: weighted sum, then activation" caption={caption}>
      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <div className="space-y-2.5">
          <Slider label="Input x₁" value={x1} min={-2} max={2} step={0.1} onChange={setX1} fmt={(v) => v.toFixed(1)} />
          <Slider label="Input x₂" value={x2} min={-2} max={2} step={0.1} onChange={setX2} fmt={(v) => v.toFixed(1)} />
          <Slider label="Weight w₁" value={w1} min={-2} max={2} step={0.1} onChange={setW1} fmt={(v) => v.toFixed(1)} />
          <Slider label="Weight w₂" value={w2} min={-2} max={2} step={0.1} onChange={setW2} fmt={(v) => v.toFixed(1)} />
          <Slider label="Bias b" value={b} min={-2} max={2} step={0.1} onChange={setB} fmt={(v) => v.toFixed(1)} />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(["sigmoid", "relu", "step"] as const).map((a) => (
              <button key={a} type="button" onClick={() => setAct(a)} aria-pressed={act === a} className={`rounded-xl border-2 px-3 py-1.5 text-sm font-semibold ${act === a ? "border-slate-950 bg-[#ffd166] text-slate-950" : "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-300"}`}>
                {a === "relu" ? "ReLU" : a[0].toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="z = w₁x₁ + w₂x₂ + b" value={f3(z)} />
            <Stat label={`a = ${act}(z)`} value={f3(out)} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">A network is many of these stacked; training adjusts every w and b with gradient descent.</p>
        </div>
      </div>
    </Card>
  );
}

const WIDGETS: Record<WidgetId, (p: { caption?: string }) => ReactNode> = {
  "gd-step": GdStep,
  sigmoid: Sigmoid,
  "mse-line": MseLine,
  gini: Gini,
  distance: Distance,
  confusion: Confusion,
  "ridge-lasso": RidgeLasso,
  "poly-degree": PolyDegree,
  scaling: Scaling,
  bayes: Bayes,
  neuron: Neuron,
};

export function TryIt({ id, caption }: { id: WidgetId; caption?: string }) {
  const W = WIDGETS[id];
  return <W caption={caption} />;
}
