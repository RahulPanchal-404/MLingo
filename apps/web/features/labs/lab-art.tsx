"use client";

/**
 * Small illustrations for the labs index. Each one sketches what the lab shows; none of
 * them carries real numbers.
 */
export type LabArtType = "linear" | "logistic" | "kmeans" | "neural" | "poly" | "knn" | "svm" | "tree" | "boosting" | "pca";

const FRAME = "w-full h-44 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 280 140" className={FRAME} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

const Axes = () => (
  <>
    <line x1="24" y1="120" x2="260" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" strokeDasharray="3 3" />
    <line x1="24" y1="20" x2="24" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />
  </>
);
const T = ({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) => <circle cx={x} cy={y} r={r} className="fill-teal-600 dark:fill-teal-400" />;
const A = ({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) => <circle cx={x} cy={y} r={r} className="fill-amber-500 dark:fill-amber-400" />;
const LINE = "stroke-teal-700 dark:stroke-teal-300";

export function LabArt({ type }: { type: LabArtType }) {
  if (type === "linear" || type === "logistic" || type === "kmeans" || type === "neural") return <ClassicArt type={type} />;
  if (type === "poly")
    return (
      <Frame>
        <Axes />
        <path d="M30 70 C 70 20, 110 20, 140 70 S 210 120, 250 70" stroke="currentColor" className="text-slate-400" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M30 60 L45 30 L62 52 L80 22 L98 44 L118 30 L135 78 L152 64 L170 112 L188 92 L205 116 L222 84 L238 104 L250 60" className={LINE} strokeWidth="2.2" strokeLinejoin="round" />
        {[[45,33],[80,25],[118,33],[152,66],[188,95],[222,87],[62,50],[170,108],[205,112],[135,75]].map(([x,y]) => <circle key={`${x}`} cx={x} cy={y} r="3.2" className="fill-sky-500 dark:fill-sky-400" />)}
      </Frame>
    );
  if (type === "knn")
    return (
      <Frame>
        {[[50,40],[70,70],[90,35],[60,100],[105,85]].map(([x,y]) => <T key={`t${x}`} x={x} y={y} />)}
        {[[180,50],[205,85],[225,40],[190,105],[240,95]].map(([x,y]) => <A key={`a${x}`} x={x} y={y} />)}
        {[[105,85],[180,50],[90,35]].map(([x,y]) => <line key={`l${x}`} x1="140" y1="65" x2={x} y2={y} stroke="currentColor" className="text-slate-400" strokeWidth="1.2" strokeDasharray="3 3" />)}
        <circle cx="140" cy="65" r="40" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.2" />
        <circle cx="140" cy="65" r="6" className="fill-white stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-200" strokeWidth="2" />
        <text x="150" y="20" fontSize="10" fontWeight="700" className="fill-slate-500 font-mono">k = 3</text>
      </Frame>
    );
  if (type === "svm")
    return (
      <Frame>
        <line x1="70" y1="130" x2="190" y2="10" className={LINE} strokeWidth="2.5" />
        <line x1="40" y1="130" x2="160" y2="10" stroke="currentColor" className="text-slate-400" strokeWidth="1.4" strokeDasharray="5 4" />
        <line x1="100" y1="130" x2="220" y2="10" stroke="currentColor" className="text-slate-400" strokeWidth="1.4" strokeDasharray="5 4" />
        {[[45,50],[70,30],[60,85],[90,60],[35,105]].map(([x,y]) => <T key={`t${x}`} x={x} y={y} />)}
        {[[200,95],[230,70],[215,120],[245,105],[170,110]].map(([x,y]) => <A key={`a${x}`} x={x} y={y} />)}
        {[[90,60],[170,110]].map(([x,y]) => <circle key={`r${x}`} cx={x} cy={y} r="8" stroke="currentColor" className="text-slate-700 dark:text-slate-200" strokeWidth="1.4" />)}
      </Frame>
    );
  if (type === "tree")
    return (
      <Frame>
        <rect x="24" y="20" width="110" height="100" className="fill-teal-500/15" />
        <rect x="134" y="20" width="126" height="55" className="fill-amber-500/15" />
        <rect x="134" y="75" width="126" height="45" className="fill-teal-500/15" />
        <line x1="134" y1="20" x2="134" y2="120" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="2.2" />
        <line x1="134" y1="75" x2="260" y2="75" className="stroke-slate-700 dark:stroke-slate-200" strokeWidth="1.4" />
        {[[50,45],[80,90],[100,40],[60,100],[160,100],[210,105]].map(([x,y]) => <T key={`t${x}${y}`} x={x} y={y} />)}
        {[[170,40],[200,55],[235,35],[245,60]].map(([x,y]) => <A key={`a${x}`} x={x} y={y} />)}
        <text x="140" y="16" fontSize="9" fontWeight="700" className="fill-slate-500 font-mono">x₁ ≤ 0.4?</text>
      </Frame>
    );
  if (type === "boosting")
    return (
      <Frame>
        <Axes />
        <path d="M30 70 C 70 20, 110 20, 140 70 S 210 120, 250 70" stroke="currentColor" className="text-slate-400" strokeWidth="1.5" strokeDasharray="5 4" />
        <path d="M30 62 H60 V36 H120 V58 H150 V96 H210 V104 H230 V76 H250" className={LINE} strokeWidth="2.2" />
        {[[45,60],[75,38],[105,33],[140,70],[170,100],[200,108],[240,78]].map(([x,y]) => <circle key={`${x}`} cx={x} cy={y} r="3.2" className="fill-sky-500 dark:fill-sky-400" />)}
        {[0,1,2].map((i) => (
          <g key={i} transform={`translate(${196 + i * 22} 16)`} className="stroke-slate-500">
            <line x1="6" y1="4" x2="1" y2="13" strokeWidth="1.2" />
            <line x1="6" y1="4" x2="11" y2="13" strokeWidth="1.2" />
            <circle cx="6" cy="4" r="2.4" className="fill-slate-500" />
          </g>
        ))}
      </Frame>
    );
  // pca
  return (
    <Frame>
      {[[70,100],[90,92],[105,80],[120,78],[135,70],[150,62],[160,58],[175,50],[190,44],[205,38],[100,95],[130,60],[145,76],[170,40],[115,88],[185,56],[80,85],[210,48]].map(([x,y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" className="fill-sky-500/80 dark:fill-sky-400/80" />)}
      <line x1="50" y1="112" x2="230" y2="28" className={LINE} strokeWidth="2.5" markerEnd="url(#pca-arrow)" />
      <line x1="125" y1="50" x2="155" y2="114" stroke="currentColor" className="text-slate-400" strokeWidth="1.5" strokeDasharray="5 4" />
      <defs>
        <marker id="pca-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-teal-700 dark:fill-teal-300" />
        </marker>
      </defs>
      <text x="234" y="30" fontSize="10" fontWeight="700" className="fill-slate-500 font-mono">PC1</text>
    </Frame>
  );
}

function ClassicArt({ type }: { type: "linear" | "logistic" | "kmeans" | "neural" }) {
  if (type === "linear") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-44 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line x1="24" y1="120" x2="260" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="24" y1="20" x2="24" y2="120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1.5" />
        {/* Scatter points */}
        <circle cx="50" cy="100" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="80" cy="85" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="110" cy="92" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="140" cy="65" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="170" cy="58" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="200" cy="40" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        <circle cx="230" cy="32" r="3.5" className="fill-teal-500/80 dark:fill-teal-400" />
        {/* Residual dashes */}
        <line x1="110" y1="92" x2="110" y2="76" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 2" />
        <line x1="170" y1="58" x2="170" y2="51" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 2" />
        {/* Fitted regression line */}
        <line x1="30" y1="112" x2="250" y2="24" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-teal-400" />
      </svg>
    );
  }

  if (type === "logistic") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-44 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Two-class background gradient representation */}
        <rect x="24" y="20" width="116" height="100" rx="4" className="fill-teal-500/10 dark:fill-teal-500/15" />
        <rect x="140" y="20" width="116" height="100" rx="4" className="fill-amber-500/10 dark:fill-amber-500/15" />
        {/* Class 0 points (Teal) */}
        <circle cx="55" cy="45" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="75" cy="70" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="95" cy="38" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="65" cy="95" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        <circle cx="105" cy="80" r="3.5" className="fill-teal-600 dark:fill-teal-400" />
        {/* Class 1 points (Amber) */}
        <circle cx="170" cy="50" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="195" cy="85" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="215" cy="42" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="180" cy="100" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        <circle cx="225" cy="75" r="3.5" className="fill-amber-600 dark:fill-amber-400" />
        {/* Decision Boundary Line */}
        <line x1="140" y1="18" x2="140" y2="122" stroke="#0f766e" strokeWidth="2.5" strokeDasharray="4 3" className="dark:stroke-teal-300" />
        <text x="145" y="32" fontSize="9" fontWeight="600" className="fill-teal-700 dark:fill-teal-300 font-mono">P = 0.50</text>
      </svg>
    );
  }

  if (type === "kmeans") {
    return (
      <svg
        viewBox="0 0 280 140"
        className="w-full h-44 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Cluster 1 (Teal) */}
        <circle cx="65" cy="45" r="3" className="fill-teal-500/70" />
        <circle cx="80" cy="35" r="3" className="fill-teal-500/70" />
        <circle cx="55" cy="65" r="3" className="fill-teal-500/70" />
        <circle cx="75" cy="60" r="3" className="fill-teal-500/70" />
        {/* Centroid 1 */}
        <circle cx="70" cy="50" r="7" className="stroke-teal-600 dark:stroke-teal-400" strokeWidth="2" fill="none" />
        <line x1="65" y1="50" x2="75" y2="50" stroke="#0d9488" strokeWidth="2" />
        <line x1="70" y1="45" x2="70" y2="55" stroke="#0d9488" strokeWidth="2" />

        {/* Cluster 2 (Indigo) */}
        <circle cx="190" cy="40" r="3" className="fill-indigo-500/70" />
        <circle cx="210" cy="50" r="3" className="fill-indigo-500/70" />
        <circle cx="225" cy="35" r="3" className="fill-indigo-500/70" />
        <circle cx="195" cy="65" r="3" className="fill-indigo-500/70" />
        {/* Centroid 2 */}
        <circle cx="205" cy="48" r="7" className="stroke-indigo-600 dark:stroke-indigo-400" strokeWidth="2" fill="none" />
        <line x1="200" y1="48" x2="210" y2="48" stroke="#6366f1" strokeWidth="2" />
        <line x1="205" y1="43" x2="205" y2="53" stroke="#6366f1" strokeWidth="2" />

        {/* Cluster 3 (Emerald) */}
        <circle cx="130" cy="95" r="3" className="fill-emerald-500/70" />
        <circle cx="145" cy="110" r="3" className="fill-emerald-500/70" />
        <circle cx="160" cy="90" r="3" className="fill-emerald-500/70" />
        <circle cx="135" cy="115" r="3" className="fill-emerald-500/70" />
        {/* Centroid 3 */}
        <circle cx="142" cy="102" r="7" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth="2" fill="none" />
        <line x1="137" y1="102" x2="147" y2="102" stroke="#10b981" strokeWidth="2" />
        <line x1="142" y1="97" x2="142" y2="107" stroke="#10b981" strokeWidth="2" />
      </svg>
    );
  }

  // Neural network
  return (
    <svg
      viewBox="0 0 280 140"
      className="w-full h-44 rounded-xl bg-slate-900/5 dark:bg-slate-950/40 p-2 border border-slate-200/60 dark:border-slate-800/80 transition-transform group-hover:scale-[1.02]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Connections Input -> Hidden */}
      <line x1="45" y1="45" x2="140" y2="30" stroke="#0d9488" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="45" y1="45" x2="140" y2="70" stroke="#0d9488" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="45" y1="45" x2="140" y2="110" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="45" y1="95" x2="140" y2="30" stroke="#0d9488" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="45" y1="95" x2="140" y2="70" stroke="#0d9488" strokeWidth="1.8" strokeOpacity="0.8" />
      <line x1="45" y1="95" x2="140" y2="110" stroke="#0d9488" strokeWidth="1" strokeOpacity="0.4" />

      {/* Connections Hidden -> Output */}
      <line x1="140" y1="30" x2="235" y2="70" stroke="#6366f1" strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="140" y1="70" x2="235" y2="70" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.9" />
      <line x1="140" y1="110" x2="235" y2="70" stroke="#6366f1" strokeWidth="1.4" strokeOpacity="0.6" />

      {/* Input Nodes (2) */}
      <circle cx="45" cy="45" r="7" className="fill-teal-600 dark:fill-teal-500 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
      <circle cx="45" cy="95" r="7" className="fill-teal-600 dark:fill-teal-500 stroke-teal-200 dark:stroke-teal-800" strokeWidth="2" />
      <text x="25" y="49" fontSize="8" fontWeight="600" className="fill-slate-500 font-mono">x₁</text>
      <text x="25" y="99" fontSize="8" fontWeight="600" className="fill-slate-500 font-mono">x₂</text>

      {/* Hidden Nodes (3) */}
      <circle cx="140" cy="30" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />
      <circle cx="140" cy="70" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />
      <circle cx="140" cy="110" r="7" className="fill-indigo-600 dark:fill-indigo-500 stroke-indigo-200 dark:stroke-indigo-800" strokeWidth="2" />

      {/* Output Node (1) */}
      <circle cx="235" cy="70" r="8" className="fill-amber-500 dark:fill-amber-400 stroke-amber-200 dark:stroke-amber-800" strokeWidth="2" />
      <text x="249" y="74" fontSize="9" fontWeight="700" className="fill-slate-700 dark:fill-slate-300 font-mono">ŷ</text>
    </svg>
  );
}

