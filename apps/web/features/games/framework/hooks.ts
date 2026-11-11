"use client";

import { useEffect, useRef } from "react";

/** Calls onTick(dtMs) every animation frame while `active`. dt is capped so a background tab can't jump the game. */
export function useTicker(active: boolean, onTick: (dtMs: number) => void) {
  const latest = useRef(onTick);
  useEffect(() => {
    latest.current = onTick;
  });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      latest.current(Math.min(64, now - last));
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** Converts a pointer event on an SVG into viewBox coordinates. */
export function svgPoint(e: { clientX: number; clientY: number }, svg: SVGSVGElement, w: number, h: number) {
  const r = svg.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}
