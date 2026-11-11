/**
 * The page's one orchestrated moment: contour lines of a loss surface draw in,
 * then a marigold path walks downhill to the minimum (gradient descent).
 * Pure CSS (see globals.css "Hero signature"); reduced motion shows the final frame.
 */
const RINGS = [
  { rx: 420, ry: 150 },
  { rx: 350, ry: 124 },
  { rx: 284, ry: 100 },
  { rx: 222, ry: 78 },
  { rx: 164, ry: 58 },
  { rx: 112, ry: 40 },
  { rx: 66, ry: 24 },
  { rx: 30, ry: 11 },
];
const CX = 480;
const CY = 190;
const DESCENT = "M 10 70 C 120 80, 220 120, 300 150 S 420 186, 480 190";

export function ContourSignature({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 30 760 230" preserveAspectRatio="xMinYMid meet" className={className} aria-hidden="true">
      <g fill="none" strokeWidth="1.25">
        {RINGS.map((r, i) => {
          // Ellipse perimeter (Ramanujan) so each line's dash length matches.
          const len = Math.ceil(Math.PI * (3 * (r.rx + r.ry) - Math.sqrt((3 * r.rx + r.ry) * (r.rx + 3 * r.ry))));
          return (
            <ellipse
              key={i}
              cx={CX + i * 3}
              cy={CY + i * 1.5}
              rx={r.rx}
              ry={r.ry}
              transform={`rotate(-6 ${CX} ${CY})`}
              className="contour-line stroke-slate-300 dark:stroke-slate-700"
              style={{ ["--len" as string]: len, ["--i" as string]: RINGS.length - 1 - i }}
            />
          );
        })}
      </g>
      <path d={DESCENT} fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" className="descent-path stroke-marigold" />
      <circle r="7" className="descent-dot fill-marigold" style={{ offsetPath: `path("${DESCENT}")` }} />
      <g className="minimum-mark">
        <circle cx={CX} cy={CY} r="14" className="fill-none stroke-teal-600 dark:stroke-teal-300" strokeWidth="2" />
        <circle cx={CX} cy={CY} r="4" className="fill-teal-600 dark:fill-teal-300" />
      </g>
    </svg>
  );
}
