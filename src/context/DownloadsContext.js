"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/**
 * Simulates the "download once on Wi-Fi, then read fully offline" storage
 * model from the blueprint (Section 4 & 10): books tagged `bundled: true`
 * in booksData.js are available the instant the app installs; books with a
 * `sizeMb` must be downloaded once (progress shown in MB) before they can
 * be opened offline. Once downloaded, the id is kept in localStorage so the
 * "book" stays available on every future visit with zero network — exactly
 * like the local SQLite/Hive store described in the technical architecture.
 */

const DOWNLOADED_KEY = "kitaabistan_downloaded_books";
const DownloadsContext = createContext(null);

function readDownloaded() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DOWNLOADED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function DownloadsProvider({ children }) {
  const [downloadedIds, setDownloadedIds] = useState(() => readDownloaded());
  const [progressById, setProgressById] = useState({}); // { [bookId]: 0-100 while downloading }
  const timers = useRef({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DOWNLOADED_KEY, JSON.stringify(downloadedIds));
    }
  }, [downloadedIds]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      Object.values(activeTimers).forEach(clearInterval);
    };
  }, []);

  const isDownloaded = useCallback(
    (book) => !book || book.bundled || !book.sizeMb || downloadedIds.includes(book.id),
    [downloadedIds]
  );

  const isDownloading = useCallback((id) => progressById[id] != null && progressById[id] < 100, [progressById]);

  const startDownload = useCallback((book) => {
    if (!book || downloadedIds.includes(book.id)) return;
    if (timers.current[book.id]) return; // already in progress

    setProgressById((prev) => ({ ...prev, [book.id]: 0 }));
    const interval = setInterval(() => {
      setProgressById((prev) => {
        const current = prev[book.id] ?? 0;
        const next = Math.min(100, current + Math.random() * 22 + 10);
        if (next >= 100) {
          clearInterval(interval);
          delete timers.current[book.id];
          setDownloadedIds((ids) => (ids.includes(book.id) ? ids : [...ids, book.id]));
        }
        return { ...prev, [book.id]: next };
      });
    }, 220);
    timers.current[book.id] = interval;
  }, [downloadedIds]);

  const value = useMemo(
    () => ({
      isDownloaded,
      isDownloading,
      getProgress: (id) => progressById[id] ?? 0,
      startDownload,
    }),
    [isDownloaded, isDownloading, progressById, startDownload]
  );

  return <DownloadsContext.Provider value={value}>{children}</DownloadsContext.Provider>;
}

export function useDownloads() {
  const ctx = useContext(DownloadsContext);
  if (!ctx) throw new Error("useDownloads must be used inside <DownloadsProvider>");
  return ctx;
}
