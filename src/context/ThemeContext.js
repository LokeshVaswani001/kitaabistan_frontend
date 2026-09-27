"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Light / dark theme driven by `data-theme` on <html>.
 *
 * The initial value is applied by an inline script in layout.js *before*
 * first paint, so there is never a flash of the wrong theme; this provider
 * only takes over for user-initiated toggles afterwards.
 */

const STORAGE_KEY = "kitaabistan_theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
}

function apply(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setThemeState(current === "dark" ? "dark" : "light");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTheme = useCallback((next) => {
    const theme = next === "dark" ? "dark" : "light";
    setThemeState(theme);
    apply(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  }, [setTheme]);

  const value = useMemo(() => ({ theme, isDark: theme === "dark", setTheme, toggle }), [theme, setTheme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export { readStoredTheme };
