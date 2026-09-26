"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import AppShell from "@/components/AppShell";
import CategoryTile from "@/components/CategoryTile";
import { visibleCategories, allBooks } from "@/lib/booksData";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { useProgress } from "@/context/ProgressContext";
import { useStreak } from "@/context/StreakContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { session } = useAuth();
  const { t, isUrdu } = useLanguage();
  const { activeProfile } = useProfiles();
  const { progress } = useProgress();
  const { streak } = useStreak();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const categories = visibleCategories(activeProfile.kidsMode);

  const inProgressIds = Object.entries(progress)
    .filter(([, pct]) => pct > 0 && pct < 100)
    .sort((a, b) => b[1] - a[1]);
  const continueBook = inProgressIds.length
    ? allBooks().find((b) => b.id === inProgressIds[0][0])
    : allBooks().find((b) => typeof b.progress === "number");
  const continuePct = continueBook
    ? progress[continueBook.id] ?? continueBook.progress ?? 0
    : 0;

  const firstName = session?.type === "member" ? session.name.split(" ")[0] : "Guest";
  const poems = categories.find((c) => c.slug === "poems");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/library?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--ink-soft)] font-semibold">
              {t("goodToSeeYou")}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
              {t("shelfOf", { name: firstName })}
            </h1>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 bg-[var(--sun)]/25 border border-[var(--sun)] rounded-full px-3 py-1.5"
            >
              <Flame size={14} color="#B8760E" />
              <span className="text-xs font-extrabold">{streak}</span>
            </motion.div>
          )}
        </div>

        {activeProfile.kidsMode && (
          <div className={`mt-3 text-[11px] font-bold text-[var(--sage-deep)] ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu ? `${activeProfile.name} — کڈز موڈ فعال ہے` : `${activeProfile.name} — Kids Mode is on`}
          </div>
        )}

        <form onSubmit={handleSearchSubmit}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`mt-6 w-full border border-[var(--line)] rounded-xl px-4 py-3.5 text-sm bg-[var(--panel)] ${
              isUrdu ? "font-urdu text-right" : ""
            }`}
          />
        </form>

        {continueBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Link
              href={`/book/${continueBook.id}`}
              className="mt-6 flex items-center justify-between bg-[var(--sage-deep)] text-[#F7F1E1] rounded-2xl px-5 py-4"
            >
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide opacity-70 font-bold">
                  {t("continueReading")}
                </div>
                <div className="font-bold mt-1 truncate">{continueBook.title}</div>
                <div className="h-1 bg-white/20 rounded-full mt-2 w-32 overflow-hidden">
                  <div className="h-full bg-[var(--sun)]" style={{ width: `${continuePct}%` }} />
                </div>
              </div>
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="bg-[var(--sun)] text-[#26210A] text-xs font-extrabold px-4 py-2 rounded-lg shrink-0"
              >
                {t("resume")}
              </motion.div>
            </Link>
          </motion.div>
        )}

        <div className="mt-9">
          <div className="text-xs font-bold text-[var(--ink-soft)] mb-4">{t("libraryLabel")}</div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-x-3 gap-y-5"
          >
            {categories.map((c) => (
              <motion.div variants={item} key={c.slug}>
                <CategoryTile category={c} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {poems && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-[var(--ink-soft)]">{t("bilingualPoems")}</div>
              <Link href="/library/poems" className="text-xs font-bold">
                {t("seeAll")}
              </Link>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex gap-3 overflow-x-auto pb-2"
            >
              {poems.books.map((p) => (
                <motion.div variants={item} key={p.id}>
                  <Link
                    href={`/book/${p.id}`}
                    className="block w-28 shrink-0 bg-[var(--panel)] border border-[var(--line)] rounded-xl p-2"
                  >
                    <div className="h-28 rounded-lg bg-[var(--line)]" />
                    <div className="text-xs font-bold mt-2 leading-snug">{p.title}</div>
                    <div className="text-[11px] text-[var(--ink-soft)]">{p.author}</div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
