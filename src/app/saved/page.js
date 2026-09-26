"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import BookCard from "@/components/BookCard";
import { allBooks } from "@/lib/booksData";
import { useBookmarks } from "@/context/BookmarksContext";
import { useLanguage } from "@/context/LanguageContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function SavedPage() {
  const { bookmarkIds } = useBookmarks();
  const { t } = useLanguage();
  const savedBooks = allBooks().filter((b) => bookmarkIds.includes(b.id));

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
        <h1 className="text-2xl md:text-3xl font-extrabold">{t("savedTitle")}</h1>

        {savedBooks.length === 0 ? (
          <div className="mt-8 text-center py-16">
            <p className="text-sm text-[var(--ink-soft)]">{t("savedEmpty")}</p>
            <Link
              href="/library"
              className="inline-block mt-4 text-sm font-bold underline"
            >
              {t("browseLibrary")}
            </Link>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {savedBooks.map((b) => (
              <motion.div variants={item} key={b.id}>
                <BookCard book={b} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
