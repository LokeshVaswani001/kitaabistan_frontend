"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ACTIVITY_KEY = "kitaabistan_activity_days"; // ["2026-09-05", ...]
const BOOKS_OPENED_KEY = "kitaabistan_books_opened_count";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function readDays() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(ACTIVITY_KEY) || "[]");
  } catch {
    return [];
  }
}

function readBooksOpened() {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(BOOKS_OPENED_KEY) || 0);
}

function computeStreak(days) {
  if (days.length === 0) return 0;
  const set = new Set(days);
  let streak = 0;
  let cursor = new Date();
  // Count backward from today while consecutive days exist.
  // If today isn't logged yet, still allow yesterday-based streak to show.
  if (!set.has(todayStr())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const StreakContext = createContext(null);

export function StreakProvider({ children }) {
  const [days, setDays] = useState(() => readDays());
  const [booksOpened, setBooksOpened] = useState(() => readBooksOpened());

  const logActivity = useCallback(() => {
    const today = todayStr();
    setDays((prev) => {
      if (prev.includes(today)) return prev;
      const next = [...prev, today];
      window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logBookOpened = useCallback(() => {
    setBooksOpened((prev) => {
      const next = prev + 1;
      window.localStorage.setItem(BOOKS_OPENED_KEY, String(next));
      return next;
    });
    logActivity();
  }, [logActivity]);

  const streak = useMemo(() => computeStreak(days), [days]);

  const badges = useMemo(() => {
    const list = [];
    if (streak >= 3) list.push({ id: "streak3", label: "3-Day Streak", labelUr: "3 دن کا سلسلہ" });
    if (streak >= 7) list.push({ id: "streak7", label: "7-Day Streak", labelUr: "7 دن کا سلسلہ" });
    if (booksOpened >= 1) list.push({ id: "first-book", label: "First Book Opened", labelUr: "پہلی کتاب کھولی" });
    if (booksOpened >= 5) list.push({ id: "five-books", label: "5 Books Explored", labelUr: "5 کتابیں پڑھیں" });
    return list;
  }, [streak, booksOpened]);

  const value = useMemo(
    () => ({ streak, booksOpened, badges, logActivity, logBookOpened }),
    [streak, booksOpened, badges, logActivity, logBookOpened]
  );

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error("useStreak must be used inside <StreakProvider>");
  return ctx;
}
