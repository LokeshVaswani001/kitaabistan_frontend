"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import AppShell from "@/components/AppShell";
import BookCard from "@/components/BookCard";
import { findCategory } from "@/lib/booksData";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function CategoryPage({ params }) {
  const { category: slug } = use(params);
  const category = findCategory(slug);
  const { t, isUrdu } = useLanguage();
  const { activeProfile } = useProfiles();

  if (!category) return notFound();

  const blockedByKidsMode = activeProfile.kidsMode && category.kidsSafe === false;

  if (blockedByKidsMode) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-5 md:px-10 pt-16 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className={`text-xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu ? "کڈز موڈ میں دستیاب نہیں" : "Not available in Kids Mode"}
          </h1>
          <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu
              ? `${activeProfile.name} کے لیے کڈز موڈ فعال ہے۔ اسے پروفائل میں بند کریں۔`
              : `Kids Mode is on for ${activeProfile.name}. Turn it off in Profile to view this shelf.`}
          </p>
          <Link href="/library" className="inline-block mt-5 text-sm font-bold underline">
            ← {t("backToLibrary")}
          </Link>
        </div>
      </AppShell>
    );
  }

  const Icon = Icons[category.icon] || Icons.BookOpen;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
        <Link href="/library" className="text-sm font-semibold text-[var(--ink-soft)]">
          ← {t("backToLibrary")}
        </Link>

        <div className="flex items-center gap-4 mt-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color }}
          >
            <Icon size={24} color="#1D2624" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-extrabold">
              {isUrdu ? category.nameUrdu : category.name}
            </h1>
            <div className={`text-sm text-[var(--ink-soft)] ${!isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? category.name : category.nameUrdu}
            </div>
          </div>
        </div>

        <p className={`text-sm text-[var(--ink-soft)] mt-4 max-w-xl ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu ? category.descriptionUrdu : category.description}
        </p>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {category.books.map((b) => (
            <motion.div variants={item} key={b.id}>
              <BookCard book={b} />
            </motion.div>
          ))}
        </motion.div>

        {/* Comedy sub-shelf, nested inside Novels per the blueprint (a
            light-hearted entry point, not a top-level pillar). */}
        {category.subShelf && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">😄</span>
              <div>
                <div className={`text-sm font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? category.subShelf.nameUrdu : category.subShelf.name}
                </div>
                <div className={`text-xs text-[var(--ink-soft)] ${!isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? category.subShelf.name : category.subShelf.nameUrdu}
                </div>
              </div>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {category.subShelf.books.map((b) => (
                <motion.div variants={item} key={b.id}>
                  <BookCard book={b} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
