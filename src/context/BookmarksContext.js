"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const BOOKMARKS_KEY = "kitaabistan_bookmarks";
const BookmarksContext = createContext(null);

function readBookmarks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function BookmarksProvider({ children }) {
  const [ids, setIds] = useState(() => readBookmarks());

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(ids));
    }
  }, [ids]);

  const value = useMemo(
    () => ({
      bookmarkIds: ids,
      isBookmarked: (id) => ids.includes(id),
      toggleBookmark: (id) =>
        setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    }),
    [ids]
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used inside <BookmarksProvider>");
  return ctx;
}
