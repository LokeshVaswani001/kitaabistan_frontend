"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { X } from "lucide-react";
import AppShell from "@/components/AppShell";
import BookCard from "@/components/BookCard";
import { visibleCategories, allBooks } from "@/lib/booksData";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

function LibraryContent() {
  const { t, isUrdu } = useLanguage();
  const { activeProfile } = useProfiles();
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") || "";
  const [input, setInput] = useState(query);

  const categories = visibleCategories(activeProfile.kidsMode);
  const allowedSlugs = new Set(categories.map((c) => c.slug));

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return allBooks()
      .filter((b) => allowedSlugs.has(b.category.slug))
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.category.name.toLowerCase().includes(q)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeProfile.kidsMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(input.trim() ? `/library?q=${encodeURIComponent(input.trim())}` : "/library");
  };

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
      <h1 className="text-2xl md:text-3xl font-extrabold">{t("libraryTitle")}</h1>
      {!results && (
        <p className="text-[var(--ink-soft)] text-sm mt-1">{t("librarySubtitle")}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`w-full border border-[var(--line)] rounded-xl px-4 py-3 text-sm bg-[var(--panel)] ${
            isUrdu ? "font-urdu text-right" : ""
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setInput("");
              router.push("/library");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)]"
            aria-label={t("clearSearch")}
          >
            <X size={16} />
          </button>
        )}
      </form>

      {!results && (
        <Link
          href="/poems"
          className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 hover:border-[var(--brand)] transition-colors"
        >
          <div className="min-w-0">
            <div className={`font-extrabold text-sm text-[var(--ink)] ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "بچوں کے کارٹون پوئم ویڈیوز" : "Cartoon poem videos"}
            </div>
            <div className={`text-xs text-[var(--ink-soft)] mt-0.5 ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu
                ? "اردو اور انگریزی نظمیں — متحرک مناظر اور آواز کے ساتھ"
                : "Urdu and English poems with animated scenes and narration"}
            </div>
          </div>
          <span className="text-2xl shrink-0">🎬</span>
        </Link>
      )}

      {!results && (
        <Link
          href="/stories"
          className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 hover:border-[var(--brand)] transition-colors"
        >
          <div className="min-w-0">
            <div className={`font-extrabold text-sm text-[var(--ink)] ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "بچوں کی متحرک کہانیاں" : "Animated stories"}
            </div>
            <div className={`text-xs text-[var(--ink-soft)] mt-0.5 ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu
                ? "اردو اور انگریزی کہانیاں — مناظر، پہلو اور آواز کے ساتھ"
                : "Urdu and English stories with scenes, characters and narration"}
            </div>
          </div>
          <span className="text-2xl shrink-0">📖</span>
        </Link>
      )}

      {!results && (
        <Link
          href="/import"
          className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 hover:border-[var(--brand)] transition-colors"
        >
          <div className="min-w-0">
            <div className={`font-extrabold text-sm text-[var(--ink)] ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu ? "اپنی کتابیں شامل کریں" : "Add your own books"}
            </div>
            <div className={`text-xs text-[var(--ink-soft)] mt-0.5 ${isUrdu ? "font-urdu" : ""}`}>
              {isUrdu
                ? "کوئی بھی کتاب لنک سے ڈاؤن لوڈ کریں یا فائل اپ لوڈ کریں — بغیر انٹرنیٹ کے"
                : "Download any book from a link or upload a file — works offline"}
            </div>
          </div>
          <span className="text-2xl shrink-0">📥</span>
        </Link>
      )}

      {results ? (
        <div className="mt-6">
          <div className="text-sm font-semibold text-[var(--ink-soft)] mb-4">
            {t("searchResultsFor", { query })}
          </div>
          {results.length === 0 ? (
            <div className="text-sm text-[var(--ink-soft)]">{t("noResults")}</div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {results.map((b) => (
                <motion.div variants={item} key={b.id}>
                  <BookCard book={b} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {categories.map((c) => {
            const Icon = Icons[c.icon] || Icons.BookOpen;
            return (
              <motion.div variants={item} key={c.slug} whileHover={{ y: -3 }}>
                <Link
                  href={`/library/${c.slug}`}
                  className="block bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 hover:border-[var(--sage)] transition-colors h-full"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: c.color }}
                  >
                    <Icon size={20} color="#1D2624" />
                  </div>
                  <div className="font-bold text-sm">{isUrdu ? c.nameUrdu : c.name}</div>
                  <div
                    className={`text-xs text-[var(--ink-soft)] mt-0.5 ${
                      !isUrdu ? "font-urdu" : ""
                    }`}
                  >
                    {isUrdu ? c.name : c.nameUrdu}
                  </div>
                  <div className="text-xs text-[var(--ink-soft)] mt-2">
                    {t("titlesCount", {
                      count: c.books.length + (c.subShelf?.books.length ?? 0),
                    })}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <LibraryContent />
      </Suspense>
    </AppShell>
  );
}
