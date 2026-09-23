"use client";

import { useTheme } from "./theme-provider";

export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 p-0.5 text-xs ${className}`}
      role="group"
      aria-label="Color theme selector"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label="Switch to light mode"
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
          theme === "light"
            ? "bg-white text-slate-900 shadow-xs font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <span aria-hidden="true">☀</span>
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label="Switch to dark mode"
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
          theme === "dark"
            ? "bg-slate-800 text-teal-300 shadow-xs font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <span aria-hidden="true">☾</span>
        <span className="hidden sm:inline">Dark</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        aria-pressed={theme === "system"}
        aria-label="Switch to system color scheme"
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
          theme === "system"
            ? "bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
      >
        <span aria-hidden="true">◐</span>
        <span className="hidden sm:inline">System</span>
      </button>
    </div>
  );
}
