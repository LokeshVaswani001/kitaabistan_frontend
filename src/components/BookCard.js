"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, CloudDownload } from "lucide-react";
import { useBookmarks } from "@/context/BookmarksContext";
import { useDownloads } from "@/context/DownloadsContext";
import { needsDownload } from "@/lib/booksData";

export default function BookCard({ book }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isDownloaded, isDownloading, getProgress } = useDownloads();
  const saved = isBookmarked(book.id);
  const requiresDownload = needsDownload(book);
  const downloaded = isDownloaded(book);
  const downloading = isDownloading(book.id);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="relative bg-[var(--panel)] border border-[var(--line)] rounded-2xl hover:border-[var(--sage)] transition-colors"
    >
      <Link href={`/book/${book.id}`} className="flex gap-3 p-3">
        <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-[var(--sage)] to-[var(--sage-deep)] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm leading-snug truncate pr-6 flex items-center gap-1.5">
            {book.title}
            {book.premium && (
              <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wide bg-[var(--sun)]/30 text-[#8A6412] rounded-full px-1.5 py-0.5">
                ★ Premium
              </span>
            )}
          </div>
          {book.urduTitle && (
            <div className="font-urdu text-sm text-[var(--sage-deep)] mt-0.5">
              {book.urduTitle}
            </div>
          )}
          <div className="text-xs text-[var(--ink-soft)] mt-1 truncate flex items-center gap-1.5">
            <span className="truncate">{book.author}</span>
            {requiresDownload && (
              <span
                className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-bold"
                style={{ color: downloaded ? "var(--sage-deep)" : "var(--ink-soft)" }}
              >
                {downloaded ? (
                  <>· {book.sizeMb} MB offline</>
                ) : downloading ? (
                  <>· {Math.round(getProgress(book.id))}%</>
                ) : (
                  <>
                    · <CloudDownload size={11} /> {book.sizeMb} MB
                  </>
                )}
              </span>
            )}
          </div>
          {typeof book.progress === "number" && (
            <div className="h-1 bg-[var(--line)] rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[var(--sage-deep)]"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          )}
        </div>
      </Link>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => {
          e.preventDefault();
          toggleBookmark(book.id);
        }}
        aria-label={saved ? "Remove bookmark" : "Add bookmark"}
        className="absolute top-3 right-3 text-[var(--ink-soft)]"
        style={{ color: saved ? "var(--sun)" : undefined }}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
      </motion.button>
    </motion.div>
  );
}
