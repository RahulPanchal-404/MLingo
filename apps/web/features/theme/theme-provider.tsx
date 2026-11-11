"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Theme, ResolvedTheme, ThemeContextValue } from "./theme-types";

const THEME_STORAGE_KEY = "mlingo.theme";
const THEME_CHANGE_EVENT = "mlingo:theme-change";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Used when localStorage is unavailable (e.g. blocked in a privacy mode).
let inMemoryTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // LocalStorage access may fail in restricted environments
  }
  return inMemoryTheme ?? "system";
}

function subscribeToStoredTheme(onChange: () => void) {
  window.addEventListener("storage", onChange); // other tabs
  window.addEventListener(THEME_CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

function subscribeToSystemTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia(SYSTEM_DARK_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

const readSystemIsDark = () => window.matchMedia(SYSTEM_DARK_QUERY).matches;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // useSyncExternalStore renders the server snapshot during hydration, so the
  // first client render matches the server HTML, then switches to the stored
  // theme. Reading localStorage in a useState initializer caused a mismatch.
  const theme = useSyncExternalStore<Theme>(subscribeToStoredTheme, readStoredTheme, () => "system");
  const systemIsDark = useSyncExternalStore(subscribeToSystemTheme, readSystemIsDark, () => false);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  // Synchronize document element class list
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    inMemoryTheme = nextTheme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore; inMemoryTheme keeps this tab consistent
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Script to inject in <head> to prevent theme flashing on initial load.
 */
export function ThemeScript() {
  const scriptSrc = `
(function() {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var isDark = false;
    if (stored === "dark") {
      isDark = true;
    } else if (stored === "light") {
      isDark = false;
    } else {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    var root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  } catch (e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptSrc }}
      suppressHydrationWarning
    />
  );
}
