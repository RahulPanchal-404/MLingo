import { chapterStyle, type ChapterId } from "./chapter-style";

/**
 * A small looping motion graphic for each chapter that shows its core idea:
 * a ball rolling to the minimum, a line fitting points, a boundary splitting two classes,
 * points gathering into clusters, a pulse moving through a network, data moving through
 * a pipeline, a project coming together. Slow, low-amplitude ambient loops (motion skill:
 * ambient layer, 3-6s, sine easing); reduced motion shows the resolved frame.
 */
export function ChapterMotif({ id, className = "" }: { id: ChapterId | string; className?: string }) {
  const { ink } = chapterStyle(id);
  const s = { stroke: ink, fill: "none", strokeWidth: 2.5, strokeLinecap: "round" as const };
  const dot = (cx: number, cy: number, extra = "", key?: string | number) => <circle key={key} cx={cx} cy={cy} r="4.5" fill={ink} className={extra} />;

  let body: React.ReactNode;
  switch (id) {
    case "regression": {
      const pts = [[30, 74], [52, 66], [74, 58], [96, 46], [118, 40], [140, 28]];
      body = (
        <>
          {pts.map(([x, y], i) => dot(x, y, "", i))}
          <line x1="20" y1="52" x2="150" y2="52" {...s} className="motif-fit" style={{ transformOrigin: "85px 52px" }} />
        </>
      );
      break;
    }
    case "supervised": {
      const a = [[30, 30], [46, 48], [36, 70], [58, 26]];
      const b = [[112, 72], [128, 52], [140, 80], [104, 50]];
      body = (
        <>
          {a.map(([x, y], i) => <circle key={`a${i}`} cx={x} cy={y} r="5" fill={ink} />)}
          {b.map(([x, y], i) => <rect key={`b${i}`} x={x - 5} y={y - 5} width="10" height="10" fill="none" stroke={ink} strokeWidth="2.5" />)}
          <line x1="80" y1="10" x2="84" y2="92" {...s} strokeDasharray="5 6" className="motif-boundary" style={{ transformOrigin: "82px 51px" }} />
        </>
      );
      break;
    }
    case "unsupervised": {
      const groups = [
        { c: [40, 34], from: [[70, 70], [100, 30], [130, 64]] },
        { c: [120, 30], from: [[40, 74], [80, 20], [60, 50]] },
        { c: [86, 76], from: [[120, 80], [30, 40], [140, 40]] },
      ];
      body = groups.flatMap((g, gi) =>
        g.from.map(([x, y], i) => {
          const tx = g.c[0] + (i - 1) * 9 - x;
          const ty = g.c[1] + ((i % 2) * 8 - 4) - y;
          return (
            <circle key={`${gi}${i}`} cx={x} cy={y} r="4.5" fill={ink} className="motif-gather" style={{ ["--tx" as string]: `${tx}px`, ["--ty" as string]: `${ty}px`, animationDelay: `${gi * 120}ms` }} />
          );
        }),
      );
      break;
    }
    case "deep-learning": {
      const L = [[30, [25, 50, 75]], [85, [20, 40, 60, 80]], [140, [50]]] as const;
      const edges: [number, number, number, number][] = [];
      for (let l = 0; l < 2; l++) for (const y1 of L[l][1]) for (const y2 of L[l + 1][1]) edges.push([L[l][0], y1, L[l + 1][0], y2]);
      body = (
        <>
          {edges.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeOpacity="0.25" strokeWidth="1.5" />
          ))}
          {edges.filter((_, i) => i % 3 === 0).map(([x1, y1, x2, y2], i) => (
            <line key={`p${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="2.5" strokeDasharray="8 120" className="motif-pulse" style={{ animationDelay: `${i * 180}ms` }} />
          ))}
          {L.flatMap(([x, ys]) => ys.map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill="white" stroke={ink} strokeWidth="2.5" />))}
        </>
      );
      break;
    }
    case "workflow": {
      const xs = [16, 56, 96, 136];
      body = (
        <>
          <line x1="24" y1="50" x2="144" y2="50" {...s} strokeOpacity="0.35" />
          {xs.map((x) => <rect key={x} x={x} y="38" width="18" height="24" rx="4" fill="white" stroke={ink} strokeWidth="2.5" />)}
          <circle r="5" fill={ink} className="motif-travel" style={{ offsetPath: 'path("M 25 50 L 145 50")' }} />
        </>
      );
      break;
    }
    case "capstone": {
      body = (
        <>
          {[[30, 40], [62, 58], [94, 76]].map(([x, h], i) => (
            <rect key={x} x={x} y={88 - h} width="22" height={h} rx="3" fill={ink} className="motif-grow" style={{ animationDelay: `${i * 140}ms`, transformOrigin: `${x + 11}px 88px` }} />
          ))}
          <path d="M120 44 l10 10 l20 -24" {...s} strokeWidth="3.5" strokeDasharray="60" className="motif-check" />
        </>
      );
      break;
    }
    default: {
      body = (
        <>
          <path d="M14 20 C 50 95, 110 95, 150 20" {...s} strokeOpacity="0.5" />
          <circle r="6.5" fill={ink} className="motif-roll" style={{ offsetPath: 'path("M14 20 C 40 74, 64 82, 82 82")' }} />
          <circle cx="82" cy="82" r="3" fill="white" stroke={ink} strokeWidth="2" />
        </>
      );
    }
  }

  return (
    <svg viewBox="0 0 164 100" className={className} aria-hidden="true">
      {body}
    </svg>
  );
}
