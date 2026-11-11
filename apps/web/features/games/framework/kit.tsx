"use client";

import type { ReactNode } from "react";

/** Dark "game screen" frame with the shared keyframes used by every game. */
export function GameScreen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-inner ${className}`}>
      <style>{`
        @keyframes g-float { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-34px); opacity: 0 } }
        @keyframes g-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
        @keyframes g-pop { 0% { transform: scale(.4); opacity: 0 } 60% { transform: scale(1.25); opacity: 1 } 100% { transform: scale(1) } }
        @keyframes g-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
        @keyframes g-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .g-float { animation: g-float 900ms ease-out forwards }
        .g-shake { animation: g-shake 250ms ease-in-out 2 }
        .g-pop { animation: g-pop 380ms ease-out both; transform-box: fill-box; transform-origin: center }
        .g-bob { animation: g-bob 600ms ease-in-out infinite; transform-box: fill-box }
        .g-pulse { animation: g-pulse 1.2s ease-in-out infinite }
      `}</style>
      {children}
    </div>
  );
}

/** Top bar inside a game screen: lives, coins, level progress. */
export function TopBar({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/30 px-4 py-2 text-sm font-bold">
      <div className="flex flex-wrap items-center gap-4">{left}</div>
      <div className="flex flex-wrap items-center gap-4">{right}</div>
    </div>
  );
}

export function Hearts({ lives, max }: { lives: number; max: number }) {
  return (
    <span aria-label={`${lives} of ${max} lives`} className="tracking-tight">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < lives ? "" : "opacity-20 grayscale"}>❤️</span>
      ))}
    </span>
  );
}

export function Stat({ icon, value, tone }: { icon: string; value: ReactNode; tone?: "good" | "bad" }) {
  return (
    <span className={`flex items-center gap-1 font-mono tabular-nums ${tone === "good" ? "text-emerald-300" : tone === "bad" ? "text-rose-300" : "text-white"}`}>
      <span aria-hidden="true">{icon}</span>
      {value}
    </span>
  );
}

export function Meter({ value, color = "#2dd4bf", label }: { value: number; color?: string; label?: string }) {
  return (
    <span className="flex items-center gap-2">
      {label ? <span className="text-xs text-white/60">{label}</span> : null}
      <span className="relative h-2.5 w-24 overflow-hidden rounded-full bg-white/10">
        <span className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-150" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, background: color }} />
      </span>
    </span>
  );
}

/** Controls row under the game screen. */
export function ControlDeck({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-slate-900/80 px-4 py-3">{children}</div>;
}

export function GameButton({
  children, onClick, disabled, tone = "primary", active,
}: { children: ReactNode; onClick: () => void; disabled?: boolean; tone?: "primary" | "ghost" | "danger"; active?: boolean }) {
  const cls =
    tone === "primary"
      ? "bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-[0_3px_0_#0f766e]"
      : tone === "danger"
        ? "bg-rose-500 text-white hover:bg-rose-400 shadow-[0_3px_0_#9f1239]"
        : active
          ? "bg-white text-slate-950 shadow-[0_3px_0_#94a3b8]"
          : "bg-white/10 text-white hover:bg-white/20 shadow-[0_3px_0_rgba(0,0,0,.4)]";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`rounded-xl px-4 py-2 text-sm font-extrabold transition active:translate-y-0.5 active:shadow-none disabled:opacity-35 ${cls}`}>
      {children}
    </button>
  );
}

/** Big centred message over the game (wave cleared, crashed, ...). */
export function Banner({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]">
      <div className="g-pop max-w-sm space-y-3 rounded-2xl border border-white/15 bg-slate-900 p-5 text-center shadow-2xl">
        <p className="text-2xl font-black">{title}</p>
        {sub ? <p className="text-sm text-white/80">{sub}</p> : null}
        <div className="flex flex-wrap justify-center gap-2">{children}</div>
      </div>
    </div>
  );
}

export type Floater = { id: number; x: number; y: number; text: string; color: string };

/** Rising "+10" style text inside an SVG. Remove entries after ~900ms. */
export function Floaters({ items }: { items: Floater[] }) {
  return (
    <>
      {items.map((f) => (
        <text key={f.id} x={f.x} y={f.y} textAnchor="middle" className="g-float text-[15px] font-black" fill={f.color} style={{ transformBox: "fill-box" }}>
          {f.text}
        </text>
      ))}
    </>
  );
}
