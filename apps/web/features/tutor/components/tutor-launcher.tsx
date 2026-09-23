"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTutor } from "../tutor-provider";

type TutorCorner = "bottom-right" | "bottom-left" | "top-right" | "top-left";

const POSITION_KEY = "mlingo.tutor.position";
const COLLAPSED_KEY = "mlingo.tutor.collapsed";
const emptySubscribe = () => () => {};

export function TutorLauncher() {
  const { isOpen, toggleTutor, activeContext } = useTutor();
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [corner, setCorner] = useState<TutorCorner>(() => {
    if (typeof window === "undefined") return "bottom-right";
    try {
      const savedCorner = localStorage.getItem(POSITION_KEY) as TutorCorner | null;
      if (
        savedCorner === "bottom-right" ||
        savedCorner === "bottom-left" ||
        savedCorner === "top-right" ||
        savedCorner === "top-left"
      ) {
        return savedCorner;
      }
    } catch {}
    return "bottom-right";
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "true";
    } catch {}
    return false;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null);

  // Listen to external storage events (e.g. from Profile page)
  useEffect(() => {
    const handleStorage = () => {
      try {
        const savedCorner = localStorage.getItem(POSITION_KEY) as TutorCorner | null;
        if (
          savedCorner === "bottom-right" ||
          savedCorner === "bottom-left" ||
          savedCorner === "top-right" ||
          savedCorner === "top-left"
        ) {
          setCorner(savedCorner);
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const saveCorner = (nextCorner: TutorCorner) => {
    setCorner(nextCorner);
    try {
      localStorage.setItem(POSITION_KEY, nextCorner);
    } catch {}
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Pointer drag to snap to nearest corner
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === "button") return;
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.clientX;
    const dy = e.clientY - dragStartRef.current.clientY;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOffset(null);
    dragStartRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Calculate nearest corner based on viewport position
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const clientX = e.clientX;
    const clientY = e.clientY;

    const isLeft = clientX < winW / 2;
    const isTop = clientY < winH / 2;

    let targetCorner: TutorCorner = "bottom-right";
    if (isTop && isLeft) targetCorner = "top-left";
    else if (isTop && !isLeft) targetCorner = "top-right";
    else if (!isTop && isLeft) targetCorner = "bottom-left";
    else targetCorner = "bottom-right";

    saveCorner(targetCorner);
  };

  // Cycle corners via quick action button
  const cycleCorner = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sequence: TutorCorner[] = ["bottom-right", "bottom-left", "top-left", "top-right"];
    const nextIdx = (sequence.indexOf(corner) + 1) % sequence.length;
    saveCorner(sequence[nextIdx]);
  };

  if (!isMounted) return null;

  const training = activeContext.training;
  const project = activeContext.project;

  let contextSnippet = "";
  if (project?.project_title) {
    contextSnippet = `${project.project_title}`;
  } else if (training?.algorithm) {
    const name = training.algorithm.replace(/_/g, " ");
    contextSnippet = `${name} • s${training.selected_step + 1}`;
  }

  // Positioning classes based on corner
  const cornerClasses: Record<TutorCorner, string> = {
    "bottom-right": "bottom-6 right-6 md:bottom-7 md:right-7",
    "bottom-left": "bottom-6 left-6 md:bottom-7 md:left-7",
    "top-right": "top-20 right-6 md:top-20 md:right-7",
    "top-left": "top-20 left-6 md:top-20 md:left-7",
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={
        dragOffset
          ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }
          : undefined
      }
      className={`fixed z-40 flex items-center gap-1.5 select-none transition-all duration-200 ${
        cornerClasses[corner]
      } ${isDragging ? "cursor-grabbing opacity-90 scale-105" : "cursor-grab"}`}
      role="region"
      aria-label="AI Tutor Floating Dock"
    >
      {/* Collapsed Pill: [ 💡 ] */}
      {isCollapsed && !isOpen ? (
        <button
          type="button"
          id="mlingo-tutor-launcher-button"
          onClick={() => {
            setIsCollapsed(false);
            toggleTutor();
          }}
          title="Open MLingo AI Tutor (click to expand)"
          aria-label="Open MLingo AI Tutor"
          className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-teal-500/50 bg-slate-900/95 text-white shadow-xl backdrop-blur-md hover:scale-110 hover:border-teal-400 hover:bg-slate-900 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-400"
        >
          <span className="text-base">💡</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-900">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </button>
      ) : (
        /* Expanded Launcher: [ 💡 Ask MLingo Tutor ] */
        <div className="flex items-center gap-1.5 rounded-full border border-teal-500/40 bg-slate-950/90 dark:bg-slate-900/90 p-1 pl-3 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            id="mlingo-tutor-launcher-button"
            onClick={toggleTutor}
            aria-label={isOpen ? "Close MLingo AI Tutor" : "Open MLingo AI Tutor"}
            className="flex items-center gap-2 text-xs font-semibold text-white hover:text-teal-300 transition-colors cursor-pointer"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs">
              💡
            </span>
            <span className="tracking-wide">
              {isOpen ? "Close Tutor" : "Ask MLingo Tutor"}
            </span>

            {contextSnippet && !isOpen && (
              <span className="hidden sm:inline-block max-w-[130px] truncate rounded-full bg-teal-950/80 border border-teal-500/30 px-2 py-0.5 text-[10px] text-teal-300 font-normal">
                {contextSnippet}
              </span>
            )}
          </button>

          {/* Quick Corner Switcher */}
          <button
            type="button"
            onClick={cycleCorner}
            title={`Dock corner: ${corner}. Click to snap to next corner`}
            aria-label="Reposition Tutor dock"
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px] cursor-pointer"
          >
            ⤢
          </button>

          {/* Collapse Toggle Button */}
          {!isOpen && (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Minimize Tutor to compact icon"
              aria-label="Minimize Tutor to compact icon"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold cursor-pointer"
            >
              −
            </button>
          )}

          <span className="flex h-2 w-2 mr-1 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse" />
        </div>
      )}
    </div>
  );
}
