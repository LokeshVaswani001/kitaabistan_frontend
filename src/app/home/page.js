"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, BookOpen, Bookmark, Flame, MessageCircle, Play, Wifi } from "lucide-react";
import AppShell from "@/components/AppShell";
import CategoryTile from "@/components/CategoryTile";
import { visibleCategories, allBooks } from "@/lib/booksData";
import { STORY_VIDEOS } from "@/components/story-player/stories";
import { SCENE_EMOJI, SCENE_STYLES } from "@/components/story-player/sceneStyles";
import { useAuth } from "@/context/AuthContext";
import { useBookmarks } from "@/context/BookmarksContext";
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
  const { streak, booksOpened, badges } = useStreak();
  const { bookmarkIds } = useBookmarks();
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

  const stats = [
    { icon: Flame, n: streak, label: t("statStreak") },
    { icon: BookOpen, n: booksOpened, label: t("statOpened") },
    { icon: Bookmark, n: bookmarkIds.length, label: t("statSaved") },
    { icon: Award, n: badges.length, label: t("statBadges") },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/library?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
        {/* Welcome card — greeting plus the reader's real numbers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-[var(--sage-deep)] text-[#F7F1E1] px-5 py-5 md:px-7 md:py-6"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 w-64 h-64 rounded-full bg-[var(--brand)]/30 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold opacity-75">{t("goodToSeeYou")}</div>
              <h1 className={`text-2xl md:text-3xl font-extrabold mt-1 ${isUrdu ? "font-urdu" : ""}`}>
                {t("shelfOf", { name: firstName })}
              </h1>
              {activeProfile.kidsMode && (
                <div className={`mt-2 text-[11px] font-bold text-[var(--sun)] ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu
                    ? `${activeProfile.name} — کڈز موڈ فعال ہے`
                    : `${activeProfile.name} — Kids Mode is on`}
                </div>
              )}
            </div>
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/25 bg-black/35 px-3 py-1.5 text-[11px] font-bold">
              <Wifi size={13} />
              {t("statOffline")}
            </span>
          </div>

          <div className="relative mt-4 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ icon: Icon, n, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-white/10 text-[var(--sun)] shrink-0">
                  <Icon size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-none">{n}</span>
                  <span className={`block text-[11px] opacity-70 mt-1 truncate ${isUrdu ? "font-urdu" : ""}`}>
                    {label}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

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

        {continueBook ? (
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
        ) : (
          <Link
            href="/chatbot"
            className="mt-6 flex items-center gap-4 border border-[var(--line)] bg-[var(--panel)] rounded-2xl px-5 py-4 hover:border-[var(--brand)] transition-colors"
          >
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-[var(--brand)]/15 text-[var(--brand)] shrink-0">
              <MessageCircle size={20} />
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold text-sm">{t("obBotTitle")}</span>
              <span
                className={`block text-xs text-[var(--ink-soft)] mt-1 line-clamp-2 ${
                  isUrdu ? "font-urdu" : ""
                }`}
              >
                {t("obBotBody")}
              </span>
            </span>
            <ArrowRight size={18} className="ml-auto shrink-0 text-[var(--ink-soft)]" />
          </Link>
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
                    {p.cover ? (
                      <div className="h-28 rounded-lg overflow-hidden bg-[var(--line)]">
                        <img src={`/${p.cover}`} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-28 rounded-lg bg-[var(--line)]" />
                    )}
                    <div className="text-xs font-bold mt-2 leading-snug">{p.title}</div>
                    <div className="text-[11px] text-[var(--ink-soft)]">{p.author}</div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-[var(--ink-soft)]">{t("homeStories")}</div>
            <Link href="/stories" className="text-xs font-bold">
              {t("seeAll")}
            </Link>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex gap-3 overflow-x-auto pb-2"
          >
            {STORY_VIDEOS.map((s) => (
              <motion.div variants={item} key={s.id}>
                <Link
                  href={`/stories?id=${s.id}`}
                  className="block w-40 shrink-0 bg-[var(--panel)] border border-[var(--line)] rounded-xl overflow-hidden hover:border-[var(--brand)] transition-colors"
                >
                  <div
                    className="h-24 relative flex items-center justify-center text-3xl bg-[var(--line)]"
                    style={{ background: SCENE_STYLES[s.scene] }}
                  >
                    <span className="drop-shadow">{SCENE_EMOJI[s.scene] || "📖"}</span>
                    <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 text-[#10201c] flex items-center justify-center">
                      <Play size={13} fill="currentColor" />
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold leading-snug">{s.title}</div>
                    <div className="text-[11px] text-[var(--ink-soft)] mt-0.5 truncate">
                      {s.author} · {s.minutes} min
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
