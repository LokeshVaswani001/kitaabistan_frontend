"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { categories } from "@/lib/booksData";
import { isOnboarded } from "@/lib/onboarding";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function LangToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      onClick={toggleLang}
      className="flex shrink-0 bg-[var(--panel)] border border-[var(--line)] rounded-full p-1 text-[11px] sm:text-xs font-bold"
      aria-label="Toggle language"
    >
      <span
        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full transition-colors"
        style={{
          background: lang === "en" ? "var(--ink)" : "transparent",
          color: lang === "en" ? "#fff" : "var(--ink-soft)",
        }}
      >
        EN
      </span>
      <span
        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-full font-urdu transition-colors"
        style={{
          background: lang === "ur" ? "var(--ink)" : "transparent",
          color: lang === "ur" ? "#fff" : "var(--ink-soft)",
        }}
      >
        اردو
      </span>
    </button>
  );
}

export default function LandingPage() {
  const { ready, isAuthenticated } = useAuth();
  const { t, isUrdu } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!isOnboarded()) {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--paper)] overflow-x-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:px-6 md:px-10 py-4 md:py-6 border-b border-[var(--line)]">
        <div className="font-extrabold text-base sm:text-lg shrink-0">{t("appName")}</div>
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-semibold">
          <LangToggle />
          <Link href="/login" className="px-2 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap">
            {t("login")}
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--ink)] text-white whitespace-nowrap"
          >
            {t("signup")}
          </Link>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center px-6 py-20"
      >
        <h1
          className={`text-4xl md:text-6xl font-extrabold tracking-tight leading-tight ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          {t("heroLine1")} <span className="text-[var(--sage-deep)]">{t("heroHighlight")}</span>
          <br />
          {t("heroLine2")}
        </h1>
        <p className={`text-[var(--ink-soft)] mt-6 text-base md:text-lg max-w-xl mx-auto ${isUrdu ? "font-urdu" : ""}`}>
          {t("heroSubtitle")}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {ready && isAuthenticated ? (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/home" className="block px-7 py-4 rounded-xl bg-[var(--ink)] text-white font-bold">
                {t("continueToApp")}
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
                <Link href="/demo" className="block px-7 py-4 rounded-xl border-2 border-[var(--ink)] font-bold">
                  {t("tryDemo")}
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
                <Link href="/signup" className="block px-7 py-4 rounded-xl bg-[var(--ink)] text-white font-bold">
                  {t("createAccount")}
                </Link>
              </motion.div>
            </>
          )}
        </div>

        <p className={`text-xs text-[var(--ink-soft)] mt-6 ${isUrdu ? "font-urdu" : ""}`}>
          {t("demoDisclaimer")}
        </p>
      </motion.section>

      {/* Stats row */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="max-w-4xl mx-auto px-6 flex flex-wrap gap-x-12 gap-y-6 py-10 border-y border-[var(--line)]"
      >
        {[
          ["8", t("statCategories")],
          ["100%", t("statOffline")],
          ["2", t("statLanguages")],
          ["₨0", t("statFree")],
        ].map(([num, label]) => (
          <motion.div variants={fadeUp} key={label}>
            <div className="text-3xl font-extrabold">{num}</div>
            <div className={`text-xs text-[var(--ink-soft)] mt-1 ${isUrdu ? "font-urdu" : ""}`}>
              {label}
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Shelves / categories */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="max-w-5xl mx-auto px-6 py-20"
      >
        <div className="text-xs font-bold text-[var(--ink-soft)] tracking-wide">
          {t("shelvesLabel")}
        </div>
        <h2 className={`text-2xl md:text-4xl font-extrabold mt-2 max-w-xl leading-snug ${isUrdu ? "font-urdu" : ""}`}>
          {t("shelvesTitle")}
        </h2>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = Icons[c.icon] || Icons.BookOpen;
            return (
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4 }}
                key={c.slug}
                className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: c.color }}
                >
                  <Icon size={20} color="#1D2624" />
                </div>
                <div className="font-bold text-sm">{isUrdu ? c.nameUrdu : c.name}</div>
                <div className={`text-xs text-[var(--ink-soft)] mt-1 ${isUrdu ? "" : "font-urdu"}`}>
                  {isUrdu ? c.name : c.nameUrdu}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Bilingual poems band */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="bg-[#F5E9C8]/60 py-16"
      >
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold text-[var(--ink-soft)] tracking-wide">
              {t("poemsLabel")}
            </div>
            <h2 className={`text-2xl md:text-3xl font-extrabold mt-2 leading-snug ${isUrdu ? "font-urdu" : ""}`}>
              {t("poemsTitle")}
            </h2>
          </div>
          <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6">
            <div className="text-[15px] italic">{t("samplePoemLine")}</div>
            <div className="font-urdu text-lg text-[var(--sage-deep)] mt-3">
              اگر تم اپنا حوصلہ برقرار رکھ سکو
            </div>
          </div>
        </div>
      </motion.section>

      {/* Chatbot preview */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center"
      >
        <div>
          <div className="text-xs font-bold text-[var(--ink-soft)] tracking-wide">
            {t("chatbotLabel")}
          </div>
          <h2 className={`text-2xl md:text-3xl font-extrabold mt-2 leading-snug ${isUrdu ? "font-urdu" : ""}`}>
            {t("chatbotSectionTitle")}
          </h2>
          <p className={`text-sm text-[var(--ink-soft)] mt-4 max-w-sm ${isUrdu ? "font-urdu" : ""}`}>
            {t("chatbotSectionBody")}
          </p>
        </div>
        <div className="space-y-3">
          <div className={`bg-[var(--panel)] border border-[var(--line)] rounded-2xl px-4 py-3 text-sm max-w-xs ${isUrdu ? "font-urdu text-right mr-0 ml-auto" : ""}`}>
            {t("sampleQuestion")}
          </div>
          <div className={`bg-[var(--ink)] text-white rounded-2xl px-4 py-3 text-sm max-w-xs font-semibold ${isUrdu ? "font-urdu text-right mr-0 ml-auto" : ""}`}>
            {t("sampleAnswer")}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-extrabold">{t("appName")}</div>
          <div className={`text-xs text-[var(--ink-soft)] flex flex-wrap items-center gap-x-4 gap-y-2 justify-center ${isUrdu ? "font-urdu" : ""}`}>
            <span>{t("footerTagline")} © 2026</span>
            <Link href="/privacy" className="underline">
              {isUrdu ? "پرائیویسی پالیسی" : "Privacy Policy"}
            </Link>
            <Link href="/terms" className="underline">
              {isUrdu ? "شرائط و ضوابط" : "Terms of Service"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
