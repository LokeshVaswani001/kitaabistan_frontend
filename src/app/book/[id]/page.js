"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Moon,
  Sun,
  Bookmark,
  Volume2,
  Square,
  ChevronLeft,
  ChevronRight,
  Type,
  AlignJustify,
  CloudDownload,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { findBook, needsDownload } from "@/lib/booksData";
import { getImportedBook } from "@/lib/importedBooks";
import { useBookmarks } from "@/context/BookmarksContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProgress } from "@/context/ProgressContext";
import { useStreak } from "@/context/StreakContext";
import { useDownloads } from "@/context/DownloadsContext";

// Placeholder book "pages" — replace with the real, rights-cleared text
// for each book via the admin panel described in the product blueprint.
// Structured as pages (arrays of paragraphs) so the reading screen can
// show and turn through actual book pages instead of one long scroll.
const PLACEHOLDER_PAGES = [["phPage1"], ["phPage2"], ["phPage3"], ["phPage4"], ["phEndNote"]];

function splitBookText(raw) {
  let text = raw.replace(/\r\n?/g, "\n");
  const startMatch = text.match(/\*{3}\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i);
  const endMatch = text.match(/\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i);
  if (startMatch) {
    text = text.slice((startMatch.index || 0) + startMatch[0].length);
  }
  if (endMatch && endMatch.index) {
    text = text.slice(0, text.indexOf(endMatch[0]));
  }

  let blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\[Illustration[^\]]*\]/g, "").trim())
    .filter(Boolean);
  if (blocks.length < 6) {
    blocks = text
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
  }

  const cleaned = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].replace(/_([^_\n]+)_/g, "$1");
    if (/^contents$/i.test(block)) {
      const next = blocks[i + 1] || "";
      if ((next.match(/CHAPTER/gi) || []).length >= 3) i++;
      continue;
    }
    if ((block.match(/CHAPTER/gi) || []).length >= 6 && /^contents$/i.test(blocks[i - 1] || "")) {
      continue;
    }
    cleaned.push(block);
  }

  const pages = [];
  let current = [];
  let length = 0;
  for (const block of cleaned) {
    current.push(block);
    length += block.length;
    if (length > 2400) {
      pages.push(current);
      current = [];
      length = 0;
    }
  }
  if (current.length) pages.push(current);
  return pages.length ? pages : [[text.trim()]];
}

export default function BookPage({ params }) {
  const { id } = use(params);
  const catalogBook = useMemo(() => findBook(id), [id]);
  const [importedById, setImportedById] = useState({});
  const importedRec = catalogBook ? null : importedById[id] ?? null;
  const stillLooking = !catalogBook && !(id in importedById);
  const book = useMemo(
    () => catalogBook || (importedRec ? { ...importedRec, file: `imported:${id}` } : null),
    [catalogBook, importedRec, id]
  );
  const [fontSize, setFontSize] = useState(17);
  const [lineSpacing, setLineSpacing] = useState(1.75);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [dark, setDark] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { t, isUrdu } = useLanguage();
  const { getProgress, setProgressFor } = useProgress();
  const { logBookOpened } = useStreak();
  const { isDownloaded, isDownloading, getProgress: getDownloadProgress, startDownload } =
    useDownloads();
  const [fileState, setFileState] = useState({ file: null, pages: null });
  const filePages =
    book?.file && fileState.file === book.file ? fileState.pages : null;

  useEffect(() => {
    if (catalogBook) return undefined;
    let cancelled = false;
    getImportedBook(id)
      .then((rec) => {
        if (!cancelled) setImportedById((prev) => ({ ...prev, [id]: rec }));
      })
      .catch(() => {
        if (!cancelled) setImportedById((prev) => ({ ...prev, [id]: null }));
      });
    return () => {
      cancelled = true;
    };
  }, [id, catalogBook]);

  useEffect(() => {
    if (!importedRec) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setFileState({ file: `imported:${id}`, pages: splitBookText(importedRec.text) });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [importedRec, id]);

  useEffect(() => {
    if (!book?.file || String(book.file).startsWith("imported:")) return undefined;
    let cancelled = false;
    const file = book.file;
    fetch(`/${file}`)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("load failed"))))
      .then((text) => {
        if (!cancelled) setFileState({ file, pages: splitBookText(text) });
      })
      .catch(() => {
        if (!cancelled) setFileState({ file, pages: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [book?.file]);

  // NOTE: every hook below is called unconditionally on every render —
  // the "book not found" case is handled with in-hook guards, then a
  // single early return *after* all hooks (see below). Returning early
  // before a hook (e.g. before useEffect/useMemo) would break React's
  // rules of hooks and crash on route-param changes, so don't move the
  // notFound() check back above this point.
  useEffect(() => {
    if (book && !(needsDownload(book) && !isDownloaded(book))) logBookOpened();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isBilingualPoem = !!book && Array.isArray(book.linesEn) && Array.isArray(book.linesUr);
  const totalPages = !book
    ? 0
    : isBilingualPoem
      ? 1
      : book.file && filePages
        ? filePages.length
        : PLACEHOLDER_PAGES.length;

  // Keep progress in sync with the current page whenever it changes, and
  // stop any read-aloud in progress (an external-system side effect, not
  // a plain state sync) when the page turns.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!book) return;
    if (needsDownload(book) && !isDownloaded(book)) return; // gated behind download screen
    const pct = isBilingualPoem ? 100 : Math.round(((pageIndex + 1) / totalPages) * 100);
    setProgressFor(book.id, pct);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSpeaking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, book?.id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const goNext = () => {
    if (pageIndex >= totalPages - 1) return;
    setDirection(1);
    setPageIndex((p) => p + 1);
  };

  const goPrev = () => {
    if (pageIndex <= 0) return;
    setDirection(-1);
    setPageIndex((p) => p - 1);
  };

  const currentPageParagraphs = useMemo(() => {
    if (!book || isBilingualPoem) return [];
    if (book.file) return filePages?.[pageIndex] || [];
    return (PLACEHOLDER_PAGES[pageIndex] || []).map((key) => t(key));
  }, [pageIndex, isBilingualPoem, book, filePages, t]);

  if (!book) {
    if (stillLooking) {
      return (
        <AppShell>
          <div className="max-w-2xl mx-auto px-5 md:px-10 pt-8">
            <div className="h-5 w-40 skeleton rounded" />
            <div className="h-7 w-2/3 skeleton rounded mt-6" />
            <div className="mt-8 space-y-4">
              {[94, 88, 96, 70, 92, 84, 60].map((w, i) => (
                <div key={i} className="h-4 skeleton rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </AppShell>
      );
    }
    return notFound();
  }

  if (book.file && filePages === null) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto px-5 md:px-10 pt-8">
          <div className="h-5 w-40 skeleton rounded" />
          <div className="h-7 w-2/3 skeleton rounded mt-6" />
          <div className="mt-8 space-y-4">
            {[94, 88, 96, 70, 92, 84, 60].map((w, i) => (
              <div key={i} className="h-4 skeleton rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const saved = isBookmarked(book.id);
  const requiresDownload = needsDownload(book);
  const downloaded = isDownloaded(book);
  const downloading = isDownloading(book.id);

  // Gate reading behind a one-time download, matching the blueprint's core
  // "download once on Wi-Fi, then read fully offline" model (Section 4 &
  // 10). Bundled starter-pack books skip this screen entirely.
  if (requiresDownload && !downloaded) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-5 md:px-10 pt-16 text-center">
          <Link
            href={`/library/${book.category.slug}`}
            className="text-sm font-semibold text-[var(--ink-soft)]"
          >
            ← {book.category.name}
          </Link>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-[var(--sun)] mx-auto flex items-center justify-center my-6"
          >
            <CloudDownload size={26} color="#26210A" />
          </motion.div>

          <h1 className="text-xl font-extrabold">{book.title}</h1>
          {book.urduTitle && <div className="font-urdu text-base text-[var(--ink-soft)] mt-1">{book.urduTitle}</div>}
          <div className="text-sm text-[var(--ink-soft)] mt-1">{book.author}</div>

          <p className={`text-sm text-[var(--ink-soft)] mt-5 ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu
              ? "یہ کتاب ابھی اس ڈیوائس پر موجود نہیں۔ ایک بار ڈاؤن لوڈ کریں، پھر بغیر انٹرنیٹ کے کبھی بھی پڑھیں۔"
              : "This book isn't on this device yet. Download it once, then read it forever — even with zero internet."}
          </p>

          {downloading ? (
            <div className="mt-6">
              <div className="h-2 bg-[var(--line)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--sage-deep)]"
                  animate={{ width: `${getDownloadProgress(book.id)}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <div className="text-xs text-[var(--ink-soft)] mt-2 font-semibold">
                {Math.round((getDownloadProgress(book.id) / 100) * book.sizeMb)} MB / {book.sizeMb} MB
              </div>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => startDownload(book)}
              className="mt-6 w-full py-3.5 rounded-xl bg-[var(--ink)] text-white font-bold flex items-center justify-center gap-2"
            >
              <CloudDownload size={18} />
              {isUrdu ? `ڈاؤن لوڈ کریں (${book.sizeMb} MB)` : `Download (${book.sizeMb} MB)`}
            </motion.button>
          )}
        </div>
      </AppShell>
    );
  }

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = isBilingualPoem
      ? (isUrdu ? book.linesUr : book.linesEn).join(". ")
      : currentPageParagraphs.map((p) => p.replace(/^#{1,6}\s*/, "")).join(" ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = isUrdu ? "ur-PK" : "en-US";
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  return (
    <AppShell>
      <motion.div
        animate={{
          backgroundColor: dark ? "#0A2620" : "rgba(0,0,0,0)",
          color: dark ? "#F7F1E1" : "var(--ink)",
        }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-6 rounded-3xl"
      >
        <Link
          href={book.category ? `/library/${book.category.slug}` : "/import"}
          className="text-sm font-semibold"
          style={{ color: dark ? "#A9C2B8" : "var(--ink-soft)" }}
        >
          ← {book.category ? book.category.name : isUrdu ? "محفوظ کتابیں" : "My books"}
        </Link>

        <h1 className="text-2xl font-extrabold mt-4">{book.title}</h1>
        {book.urduTitle && (
          <div className="font-urdu text-lg mt-1" style={{ color: dark ? "#A9C2B8" : "var(--ink-soft)" }}>
            {book.urduTitle}
          </div>
        )}
        <div className="text-sm mt-1" style={{ color: dark ? "#A9C2B8" : "var(--ink-soft)" }}>
          {book.author}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--line)] rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--sage-deep)]"
            animate={{ width: `${getProgress(book.id)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Reading controls */}
        <div
          className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3 border"
          style={{ borderColor: dark ? "#1E4038" : "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setFontSize((f) => Math.max(13, f - 1))}
              aria-label="Decrease font size"
            >
              <Minus size={18} />
            </motion.button>
            <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setFontSize((f) => Math.min(26, f + 1))}
              aria-label="Increase font size"
            >
              <Plus size={18} />
            </motion.button>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              onClick={speaking ? stopSpeaking : speak}
              aria-label="Read aloud"
              style={{ color: speaking ? "var(--sun)" : "inherit" }}
            >
              {speaking ? <Square size={18} fill="currentColor" /> : <Volume2 size={18} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8, rotate: 20 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => toggleBookmark(book.id)}
              aria-label="Bookmark"
              style={{ color: saved ? "var(--sun)" : "inherit" }}
            >
              <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
            </motion.button>
          </div>
        </div>

        {/* Accessibility controls — line spacing + dyslexia-friendly font */}
        <div
          className="mt-3 flex items-center justify-between rounded-2xl px-4 py-3 border"
          style={{ borderColor: dark ? "#1E4038" : "var(--line)" }}
        >
          <div className="flex items-center gap-3">
            <AlignJustify size={16} style={{ color: dark ? "#A9C2B8" : "var(--ink-soft)" }} />
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setLineSpacing((s) => Math.max(1.3, +(s - 0.15).toFixed(2)))}
              aria-label="Decrease line spacing"
            >
              <Minus size={16} />
            </motion.button>
            <span className="text-[11px] font-bold w-8 text-center">{lineSpacing.toFixed(2)}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={() => setLineSpacing((s) => Math.min(2.6, +(s + 0.15).toFixed(2)))}
              aria-label="Increase line spacing"
            >
              <Plus size={16} />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setDyslexiaFont((d) => !d)}
            className="flex items-center gap-1.5 text-[11px] font-bold rounded-full px-3 py-1.5"
            style={{
              background: dyslexiaFont ? "var(--sage-deep)" : dark ? "#123128" : "var(--line)",
              color: dyslexiaFont ? "#fff" : dark ? "#A9C2B8" : "var(--ink-soft)",
            }}
            aria-pressed={dyslexiaFont}
          >
            <Type size={13} />
            {isUrdu ? "آسان فونٹ" : "Easy-read font"}
          </motion.button>
        </div>

        {/* Page content */}
        <div className="mt-6 min-h-[42vh] overflow-hidden relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={isBilingualPoem ? "poem" : pageIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {isBilingualPoem ? (
                <div
                  className={`space-y-4 ${dyslexiaFont ? "font-dyslexia" : ""}`}
                  style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
                >
                  {book.linesEn.map((line, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 pb-4 border-b"
                      style={{ borderColor: dark ? "#1E4038" : "var(--line)" }}
                    >
                      <p>{line}</p>
                      <p
                        className="font-urdu text-right"
                        style={{ color: dark ? "#CFE3D9" : "var(--sage-deep)" }}
                      >
                        {book.linesUr[i]}
                      </p>
                    </div>
                  ))}
                  <p className="text-xs italic" style={{ color: dark ? "#8FA89D" : "var(--ink-soft)" }}>
                    {isUrdu
                      ? "(نمونہ اقتباس — عوامی ڈومین کی نظم)"
                      : "(Sample excerpt — public-domain poem)"}
                  </p>
                </div>
              ) : (
                <div
                  className={`space-y-5 ${dyslexiaFont ? "font-dyslexia" : ""} ${
                    book.urdu ? "font-urdu text-right" : ""
                  }`}
                  dir={book.urdu ? "rtl" : "ltr"}
                  style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
                >
                  {currentPageParagraphs.map((p, i) =>
                    p.startsWith("#") ? (
                      <h3
                        key={i}
                        className={`font-bold tracking-tight ${
                          book.urdu ? "font-urdu" : "font-display"
                        }`}
                        style={{ fontSize: `${fontSize + 5}px`, lineHeight: lineSpacing }}
                      >
                        {p.replace(/^#{1,6}\s*/, "")}
                      </h3>
                    ) : (
                      <p key={i}>{p}</p>
                    )
                  )}
                  {pageIndex === totalPages - 1 && (
                    <div
                      className="text-xs font-bold uppercase tracking-wide text-center pt-4"
                      style={{ color: dark ? "#8FA89D" : "var(--ink-soft)" }}
                    >
                      {book.file
                        ? `${isUrdu ? "کتاب مکمل" : "End of book"} · ${book.source} · ${book.license}`
                        : t("endOfPreview")}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Page navigation — hidden for single-page bilingual poems */}
        {!isBilingualPoem && (
          <div
            className="mt-6 flex items-center justify-between border-t pt-4"
            style={{ borderColor: dark ? "#1E4038" : "var(--line)" }}
          >
            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={pageIndex > 0 ? { x: -2 } : {}}
              onClick={goPrev}
              disabled={pageIndex === 0}
              className="flex items-center gap-1 text-sm font-bold disabled:opacity-30"
            >
              <ChevronLeft size={18} />
              {t("previousPage")}
            </motion.button>

            <span className="text-xs font-semibold" style={{ color: dark ? "#A9C2B8" : "var(--ink-soft)" }}>
              {t("pageOf", { current: pageIndex + 1, total: totalPages })}
            </span>

            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={pageIndex < totalPages - 1 ? { x: 2 } : {}}
              onClick={goNext}
              disabled={pageIndex === totalPages - 1}
              className="flex items-center gap-1 text-sm font-bold disabled:opacity-30"
            >
              {t("nextPage")}
              <ChevronRight size={18} />
            </motion.button>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
