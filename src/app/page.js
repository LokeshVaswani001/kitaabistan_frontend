"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bookmark,
  Check,
  Flame,
  Globe,
  GraduationCap,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  WifiOff,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { categories } from "@/lib/booksData";
import ThemeToggle, { LangToggle } from "@/components/ThemeToggle";

/* ------------------------------------------------------------------ motion */

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const group = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

function Section({ id, children, className = "" }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={group}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function Eyebrow({ children }) {
  return (
    <motion.div variants={reveal} className="eyebrow">
      <span className="w-6 h-px bg-brand" />
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ header */

const NAV_LINKS = [
  { href: "#features", key: "navFeatures" },
  { href: "#shelves", key: "navLibrary" },
  { href: "#how", key: "navHow" },
];

function Header() {
  const { t, isUrdu } = useLanguage();
  const { ready, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-line bg-panel/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 md:h-[4.5rem] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-on-brand font-extrabold text-sm">
            {t("appName").slice(0, 1)}
          </span>
          <span className="font-extrabold text-lg tracking-tight">{t("appName")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-ink-soft">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink transition-colors">
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle className="hidden sm:flex" />
          <ThemeToggle className="hidden sm:grid" />

          {ready && isAuthenticated ? (
            <Link href="/home" className="btn btn-primary btn-sm hidden sm:inline-flex">
              {t("continueToApp")}
              <ArrowRight size={15} />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                {t("signIn")}
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm hidden sm:inline-flex">
                {t("signup")}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="md:hidden grid place-items-center w-9 h-9 rounded-full border border-line bg-panel text-ink"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-line bg-panel"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 font-semibold text-ink-soft hover:text-ink ${isUrdu ? "font-urdu" : ""}`}
                >
                  {t(link.key)}
                </a>
              ))}
              <div className="h-px bg-line my-2" />
              <div className="flex items-center gap-2 pb-1">
                <LangToggle />
                <ThemeToggle />
              </div>
              <div className="flex gap-2 pt-1">
                <Link href="/login" className="btn btn-outline btn-sm flex-1" onClick={() => setOpen(false)}>
                  {t("signIn")}
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm flex-1" onClick={() => setOpen(false)}>
                  {ready && isAuthenticated ? t("continueToApp") : t("signup")}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function HeroArtwork() {
  const { t, isUrdu } = useLanguage();

  return (
    <div className="relative mx-auto w-full max-w-[30rem] pt-16 pb-14 px-1">
      {/* Main reader card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="card p-5 shadow-lift"
      >
        <div className="flex items-start gap-4">
          <div className="w-16 h-24 rounded-xl bg-gradient-to-br from-brand to-brand-deep grid place-items-center shrink-0">
            <BookOpen size={22} className="text-on-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="chip chip-accent mb-2">
              <Star size={12} className="fill-current" />
              {isUrdu ? "منتخب" : "Featured"}
            </div>
            <div className="font-extrabold leading-snug truncate">
              {isUrdu ? "ادبِ اردو کے گزشتہ اور حال" : "A century of Urdu letters"}
            </div>
            <div className={`text-xs text-ink-soft mt-1 truncate ${isUrdu ? "" : "font-urdu"}`} dir="rtl">
              {isUrdu ? "A century of Urdu letters" : "ادبِ اردو کے گزشتہ اور حال"}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: 1.4, delay: 0.7, ease: "easeOut" }}
                className="h-full rounded-full bg-brand"
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-bold text-ink-soft">
              <span>68%</span>
              <span className="flex items-center gap-1 text-brand">
                <WifiOff size={11} />
                {isUrdu ? "آف لائن" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat card — floats above the reader card's top edge */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 right-0 z-20 w-[80%] max-w-[17rem] card px-4 py-3 shadow-lift"
      >
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-brand mb-1.5">
          <MessageCircle size={12} />
          {t("chatbotName")}
        </div>
        <div className={`text-[13px] leading-snug ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu ? "چیونٹی اور ٹڈا کی تعلیم کیا ہے؟" : "What is the moral of the ant and the grasshopper?"}
        </div>
      </motion.div>

      {/* Streak card — sits on the lower-left edge */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 -left-1 sm:-left-4 z-20 card px-4 py-3 flex items-center gap-3 shadow-lift"
      >
        <span className="grid place-items-center w-9 h-9 rounded-full bg-accent-soft text-accent">
          <Flame size={17} />
        </span>
        <div>
          <div className="font-extrabold text-lg leading-none">12</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-soft mt-1">
            {isUrdu ? "دن کی سٹریک" : "day streak"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const { t, isUrdu } = useLanguage();
  const { ready, isAuthenticated } = useAuth();

  return (
    <Section className="relative overflow-hidden">
      {/* decorative background */}
      <div className="aura" style={{ width: 520, height: 520, top: -220, left: -140, background: "var(--brand)" }} />
      <div
        className="aura"
        style={{ width: 460, height: 460, top: 40, right: -200, background: "var(--accent)", opacity: 0.4 }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
        <div>
          <motion.span variants={reveal} className="chip chip-brand">
            <Sparkles size={13} />
            {t("heroBadge")}
          </motion.span>

          <motion.h1
            variants={reveal}
            className={`mt-6 text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.1rem] font-extrabold tracking-tight ${
              isUrdu ? "font-urdu tracking-normal leading-[1.4]" : ""
            }`}
          >
            {t("heroLine1")} <span className="gradient-text">{t("heroHighlight")}</span>
            <br />
            {t("heroLine2")}
          </motion.h1>

          <motion.p
            variants={reveal}
            className={`mt-6 text-base md:text-lg text-ink-soft max-w-xl leading-relaxed ${isUrdu ? "font-urdu" : ""}`}
          >
            {t("heroSubtitle")}
          </motion.p>

          <motion.div variants={reveal} className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="btn btn-primary btn-lg">
              {t("createAccount")}
              <ArrowRight size={17} />
            </Link>
            <Link href="/demo" className="btn btn-outline btn-lg">
              {t("tryDemo")}
            </Link>
          </motion.div>

          <motion.p variants={reveal} className={`mt-4 text-xs text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
            {t("heroNote")}
          </motion.p>

          <motion.ul variants={reveal} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-ink-soft">
            {[
              { icon: WifiOff, label: t("statOffline") },
              { icon: BadgeCheck, label: isUrdu ? "کوئی اشتہار نہیں" : "No ads, ever" },
              { icon: ShieldCheck, label: isUrdu ? "بچوں کے لیے محفوظ" : "Kid-safe shelves" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={14} className="text-brand" />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div variants={reveal} className="relative">
          <HeroArtwork />
        </motion.div>
      </div>

      {/* trust strip */}
      <motion.div
        variants={reveal}
        className="relative border-y border-line bg-panel/60 backdrop-blur"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
          {[
            [String(categories.length), t("statCategories")],
            ["100%", t("statOffline")],
            ["2", t("statLanguages")],
            ["₨0", t("statFree")],
          ].map(([num, label]) => (
            <div key={label} className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-extrabold tracking-tight">{num}</div>
              <div className={`text-[11px] md:text-xs text-ink-soft mt-1 ${isUrdu ? "font-urdu" : ""}`}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}

/* ---------------------------------------------------------------- features */

const FEATURES = [
  { icon: WifiOff, title: "featureOfflineT", body: "featureOfflineB" },
  { icon: Globe, title: "featureBilingualT", body: "featureBilingualB" },
  { icon: MessageCircle, title: "featureChatbotT", body: "featureChatbotB" },
  { icon: Flame, title: "featureStreakT", body: "featureStreakB" },
  { icon: ShieldCheck, title: "featureKidsT", body: "featureKidsB" },
  { icon: Sparkles, title: "featureFreeT", body: "featureFreeB" },
];

function Features() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section id="features" className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
      <Eyebrow>{t("featuresLabel")}</Eyebrow>
      <motion.h2
        variants={reveal}
        className={`mt-4 text-3xl md:text-[2.6rem] leading-tight font-extrabold tracking-tight max-w-2xl ${
          isUrdu ? "font-urdu tracking-normal" : ""
        }`}
      >
        {t("featuresTitle")}
      </motion.h2>

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <motion.article
            key={title}
            variants={reveal}
            className="card card-hover p-6 flex flex-col"
          >
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand">
              <Icon size={20} strokeWidth={2.1} />
            </span>
            <h3 className={`mt-4 text-lg font-extrabold tracking-tight ${isUrdu ? "font-urdu tracking-normal" : ""}`}>
              {t(title)}
            </h3>
            <p className={`mt-2 text-sm leading-relaxed text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>{t(body)}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------------- shelves */

function Shelves() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section id="shelves" className="relative overflow-hidden">
      <div className="band py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>{t("shelvesLabel")}</Eyebrow>
              <motion.h2
                variants={reveal}
                className={`mt-4 text-3xl md:text-[2.6rem] leading-tight font-extrabold tracking-tight max-w-xl ${
                  isUrdu ? "font-urdu tracking-normal" : ""
                }`}
              >
                {t("shelvesTitle")}
              </motion.h2>
            </div>
            <motion.div variants={reveal}>
              <Link href="/library" className="btn btn-outline">
                {t("browseLib")}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => {
              const Icon = Icons[c.icon] || Icons.BookOpen;
              return (
                <motion.div key={c.slug} variants={reveal}>
                  <Link
                    href={`/library/${c.slug}`}
                    className="card card-hover p-5 block h-full"
                  >
                    <span
                      className="grid place-items-center w-11 h-11 rounded-xl mb-4"
                      style={{ backgroundColor: c.color }}
                    >
                      <Icon size={20} color="#12211D" />
                    </span>
                    <div className={`font-extrabold text-sm leading-snug ${isUrdu ? "font-urdu" : ""}`}>
                      {isUrdu ? c.nameUrdu : c.name}
                    </div>
                    <div className={`text-xs text-ink-soft mt-1 ${isUrdu ? "" : "font-urdu"}`} dir="rtl">
                      {isUrdu ? c.name : c.nameUrdu}
                    </div>
                    <div className="mt-3 text-[11px] font-bold text-brand">
                      {t("titlesCount", { count: c.books.length })}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ bilingual + ai */

function SplitShowcase() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-6">
      {/* Poems */}
      <motion.div variants={reveal} className="card p-7 md:p-9 flex flex-col justify-between overflow-hidden relative">
        <div>
          <Eyebrow>{t("poemsLabel")}</Eyebrow>
          <h2 className={`mt-4 text-2xl md:text-3xl leading-snug font-extrabold tracking-tight ${isUrdu ? "font-urdu tracking-normal" : ""}`}>
            {t("poemsTitle")}
          </h2>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-paper p-5 md:p-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="text-[15px] italic leading-relaxed text-ink">{t("samplePoemLine")}</div>
            <div className="font-urdu text-lg leading-[2.2] text-brand" dir="rtl">
              اگر تم اپنا حوصلہ برقرار رکھ سکو
              <br />
              <span className="text-ink-soft">اور ہار نہ مانو تو…</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chatbot */}
      <motion.div
        variants={reveal}
        className="relative card p-7 md:p-9 overflow-hidden bg-brand-deep text-[#F4FBF9] grain"
      >
        <div className="aura" style={{ width: 320, height: 320, top: -120, right: -100, background: "var(--brand)" }} />

        <div className="relative">
          <div className="eyebrow" style={{ color: "#9BE3CB" }}>
            <span className="w-6 h-px" style={{ background: "#9BE3CB" }} />
            {t("chatbotLabel")}
          </div>
          <h2 className="mt-4 text-2xl md:text-3xl leading-snug font-extrabold tracking-tight">
            {t("chatbotSectionTitle")}
          </h2>
          <p className={`mt-3 text-sm leading-relaxed text-[#F4FBF9]/70 ${isUrdu ? "font-urdu" : ""}`}>
            {t("chatbotSectionBody")}
          </p>

          <div className="mt-8 space-y-3">
            <div
              className={`bg-white/10 border border-white/15 rounded-2xl rounded-br-md px-4 py-3 text-sm max-w-[85%] ${
                isUrdu ? "font-urdu mr-0 ml-auto" : ""
              }`}
            >
              {t("sampleQuestion")}
            </div>
            <div
              className={`bg-white text-[#0B2A24] rounded-2xl rounded-bl-md px-4 py-3 text-sm font-semibold max-w-[85%] ${
                isUrdu ? "font-urdu mr-auto ml-0" : "ml-auto"
              }`}
            >
              {t("sampleAnswer")}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-4 text-xs font-semibold text-[#F4FBF9]/65">
            <span className="flex items-center gap-1.5">
              <WifiOff size={14} /> {isUrdu ? "بغیر انٹرنیٹ" : "Works offline"}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} /> {isUrdu ? "منتخب مواد" : "Curated sources only"}
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} /> {isUrdu ? "تاثرات" : "Feedback loop"}
            </span>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------- how it works */

const STEPS = [
  { icon: GraduationCap, title: "howStep1T", body: "howStep1B" },
  { icon: BookOpen, title: "howStep2T", body: "howStep2B" },
  { icon: Bookmark, title: "howStep3T", body: "howStep3B" },
];

function HowItWorks() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section id="how" className="border-y border-line bg-panel/50">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
        <Eyebrow>{t("howLabel")}</Eyebrow>
        <motion.h2
          variants={reveal}
          className={`mt-4 text-3xl md:text-[2.6rem] leading-tight font-extrabold tracking-tight max-w-xl ${
            isUrdu ? "font-urdu tracking-normal" : ""
          }`}
        >
          {t("howTitle")}
        </motion.h2>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.div key={title} variants={reveal} className="relative">
              <div className="card p-7 h-full">
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-brand-soft text-brand">
                    <Icon size={20} strokeWidth={2.1} />
                  </span>
                  <span className="font-display text-5xl font-extrabold leading-none text-brand/70 select-none">
                    {i + 1}
                  </span>
                </div>
                <h3 className={`mt-5 text-lg font-extrabold tracking-tight ${isUrdu ? "font-urdu tracking-normal" : ""}`}>
                  {t(title)}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>{t(body)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------ testimonials */

const QUOTES = [
  { quote: "quote1", by: "quote1By" },
  { quote: "quote2", by: "quote2By" },
  { quote: "quote3", by: "quote3By" },
];

function Testimonials() {
  const { t, isUrdu } = useLanguage();

  return (
    <Section className="mx-auto max-w-6xl px-5 md:px-8 py-20 md:py-28">
      <Eyebrow>{t("testimonialsLabel")}</Eyebrow>
      <motion.h2
        variants={reveal}
        className={`mt-4 text-3xl md:text-[2.6rem] leading-tight font-extrabold tracking-tight max-w-2xl ${
          isUrdu ? "font-urdu tracking-normal" : ""
        }`}
      >
        {t("testimonialsTitle")}
      </motion.h2>

      <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-5">
        {QUOTES.map(({ quote, by }) => (
          <motion.figure key={quote} variants={reveal} className="card card-hover p-6 flex flex-col justify-between">
            <div className="flex gap-1 text-accent mb-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
            </div>
            <blockquote className={`text-[15px] leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>“{t(quote)}”</blockquote>
            <figcaption className={`mt-6 pt-4 border-t border-line text-xs font-bold text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
              {t(by)}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------- final cta */

function FinalCta() {
  const { t, isUrdu } = useLanguage();
  const { ready, isAuthenticated } = useAuth();

  return (
    <Section className="mx-auto max-w-6xl px-5 md:px-8 pb-20 md:pb-28">
      <motion.div
        variants={reveal}
        className="relative overflow-hidden rounded-[2rem] bg-brand-deep grain px-6 sm:px-12 py-16 md:py-20 text-center"
      >
        <div className="aura" style={{ width: 420, height: 420, top: -360, left: "50%", marginLeft: -210, background: "var(--brand)" }} />
        <div className="aura" style={{ width: 340, height: 340, bottom: -180, right: -80, background: "var(--accent)", opacity: 0.4 }} />

        <div className="relative max-w-2xl mx-auto">
          <div className="eyebrow justify-center" style={{ color: "#E7FCF4" }}>
            {t("ctaLabel")}
          </div>
          <h2 className={`mt-4 text-3xl md:text-5xl leading-tight font-extrabold tracking-tight text-[#F7F3E7] ${
            isUrdu ? "font-urdu tracking-normal" : ""
          }`}>
            {t("ctaTitle")}
          </h2>
          <p className={`mt-4 text-sm md:text-base text-[#F7F3E7]/70 max-w-lg mx-auto ${isUrdu ? "font-urdu" : ""}`}>
            {t("ctaBody")}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            {ready && isAuthenticated ? (
              <Link href="/home" className="btn btn-accent btn-lg">
                {t("continueToApp")}
                <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-accent btn-lg">
                  {t("createAccount")}
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/demo"
                  className="btn btn-lg"
                  style={{ background: "transparent", color: "#F7F3E7", borderColor: "rgba(247,243,231,0.35)" }}
                >
                  {t("tryDemo")}
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold text-[#F7F3E7]/60">
            <Check size={14} />
            {t("heroNote")}
          </div>
        </div>
      </motion.div>
    </Section>
  );
}

/* ------------------------------------------------------------------ footer */

function Footer() {
  const { t, isUrdu } = useLanguage();

  const columns = [
    {
      title: t("footerProduct"),
      links: [
        { label: t("navFeatures"), href: "#features" },
        { label: t("libraryTitle"), href: "/library" },
        { label: t("chatbotName"), href: "/chatbot" },
        { label: t("footerDemo"), href: "/demo" },
      ],
    },
    {
      title: t("footerResources"),
      links: [
        { label: t("navHow"), href: "#how" },
        { label: t("browseLib"), href: "/library" },
        { label: isUrdu ? "پہلی بار ہیں؟" : "First time here?", href: "/onboarding" },
      ],
    },
    {
      title: isUrdu ? "قانونی" : "Legal",
      links: [
        { label: t("footerPrivacyLabel"), href: "/privacy" },
        { label: t("footerTermsLabel"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-panel/50">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-on-brand font-extrabold text-sm">
                {t("appName").slice(0, 1)}
              </span>
              <span className="font-extrabold text-lg tracking-tight">{t("appName")}</span>
            </div>
            <p className={`mt-4 text-sm text-ink-soft max-w-xs leading-relaxed ${isUrdu ? "font-urdu" : ""}`}>
              {t("footerTagline")}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => {
                  const className = `text-sm font-semibold text-ink-soft hover:text-brand transition-colors ${
                    isUrdu ? "font-urdu" : ""
                  }`;
                  return link.href.startsWith("#") ? (
                    <a key={link.label} href={link.href} className={className}>
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className={className}>
                      {link.label}
                    </Link>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-xs text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
            © 2026 {t("appName")}. {t("footerRights")}
          </p>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <BarChart3 size={13} className="text-brand" />
            {t("footerTagline")}
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- page */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Features />
        <Shelves />
        <SplitShowcase />
        <HowItWorks />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
