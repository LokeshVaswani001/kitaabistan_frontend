"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PROGRESS_KEY = "kitaabistan_progress"; // { [bookId]: 0-100 }

function readProgress() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const ProgressContext = createContext(null);

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(() => readProgress());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [progress]);

  const value = useMemo(
    () => ({
      progress,
      getProgress: (id) => progress[id] ?? 0,
      // Only ever move progress forward, never backward, per book.
      setProgressFor: (id, pct) =>
        setProgress((prev) => ({
          ...prev,
          [id]: Math.max(prev[id] ?? 0, Math.min(100, Math.round(pct))),
        })),
    }),
    [progress]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
