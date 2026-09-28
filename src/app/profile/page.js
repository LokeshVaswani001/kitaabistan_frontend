"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  LogOut,
  UserRound,
  Flame,
  Award,
  Plus,
  Shield,
  Trash2,
  Check,
  Mail,
  Bookmark,
  BookOpen,
  MessageCircle,
  BookPlus,
  Library,
  ChevronRight,
  Star,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useAuth, formatRemaining } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStreak } from "@/context/StreakContext";
import { useProfiles } from "@/context/ProfilesContext";
import { useBookmarks } from "@/context/BookmarksContext";

function AddProfileForm({ onClose }) {
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState("child");
  const { addProfile } = useProfiles();
  const { isUrdu } = useLanguage();

  const colors = ["#5A7A6E", "#8F6A1F", "#7A5EB8", "#2F7E91", "#B84A33"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProfile({
      name: name.trim(),
      ageBand,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className="pt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isUrdu ? "نام (مثلاً بہن یا بھائی کا نام)" : "Name (e.g. a sibling's name)"}
          className={`w-full border border-[var(--line)] rounded-xl px-4 py-3 text-sm bg-[var(--panel)] ${
            isUrdu ? "font-urdu text-right" : ""
          }`}
        />
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "child", en: "Child (8–12)", ur: "بچہ (8–12)" },
            { id: "teen", en: "Teen (13–18)", ur: "نوجوان (13–18)" },
            { id: "all", en: "Adult", ur: "بالغ" },
          ].map((band) => (
            <motion.button
              type="button"
              key={band.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setAgeBand(band.id)}
              className={`text-xs font-bold rounded-xl border-2 py-2.5 ${isUrdu ? "font-urdu" : ""}`}
              style={{
                borderColor: ageBand === band.id ? "var(--ink)" : "var(--line)",
                background: ageBand === band.id ? "var(--panel)" : "transparent",
              }}
            >
              {isUrdu ? band.ur : band.en}
            </motion.button>
          ))}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="w-full py-3 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold text-sm"
        >
          {isUrdu ? "پروفائل شامل کریں" : "Add profile"}
        </motion.button>
      </div>
    </motion.form>
  );
}

export default function ProfilePage() {
  const { session, isDemo, isMember, remainingMs, logout } = useAuth();
  const { t, isUrdu } = useLanguage();
  const { streak, booksOpened, badges } = useStreak();
  const { bookmarkIds } = useBookmarks();
  const { profiles, activeProfile, setActiveId, removeProfile, toggleKidsMode } = useProfiles();
  const [showAddProfile, setShowAddProfile] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const displayName = isMember ? session?.name : t("demoVisitor");
  const initials = String(displayName || "K")
    .split(" ")
    .slice(0, 2)
    .map((w) => w.slice(0, 1))
    .join("")
    .toUpperCase();

  const stats = [
    {
      key: "streak",
      icon: Flame,
      color: "#B8760E",
      tint: "rgba(245,179,1,0.16)",
      value: streak,
      label: t("statStreak"),
    },
    {
      key: "books",
      icon: BookOpen,
      color: "var(--brand)",
      tint: "var(--brand-soft)",
      value: booksOpened,
      label: t("statOpened"),
    },
    {
      key: "saved",
      icon: Bookmark,
      color: "var(--sage-deep)",
      tint: "var(--brand-soft)",
      value: bookmarkIds.length,
      label: t("statSaved"),
    },
    {
      key: "badges",
      icon: Star,
      color: "var(--accent)",
      tint: "var(--accent-soft)",
      value: badges.length,
      label: t("statBadges"),
    },
  ];

  const quickLinks = [
    {
      href: "/chatbot",
      icon: MessageCircle,
      title: isUrdu ? "رہنما سے پوچھیں" : "Ask Rehnuma",
      sub: isUrdu ? "آف لائن چیٹ بوٹ" : "Offline chatbot",
    },
    {
      href: "/library",
      icon: Library,
      title: isUrdu ? "لائبریری" : "Library",
      sub: isUrdu ? "تمام شیلفیں" : "Every shelf",
    },
    {
      href: "/saved",
      icon: Bookmark,
      title: isUrdu ? "محفوظ شدہ" : "Saved books",
      sub: isUrdu ? "نشان لگائی کتابیں" : "Bookmarked reads",
    },
    {
      href: "/import",
      icon: BookPlus,
      title: isUrdu ? "کتابیں شامل کریں" : "Add books",
      sub: isUrdu ? "لنک یا فائل سے" : "From a link or file",
    },
  ];

  const card =
    "bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-card)]";
  const sectionTitle = `font-bold text-sm ${isUrdu ? "font-urdu" : ""}`;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-12">
        <div className="eyebrow">
          <span className="w-6 h-px bg-[var(--brand)]" />
          {isUrdu ? "آپ کا اکاؤنٹ" : "Your account"}
        </div>
        <h1
          className={`mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--ink)] ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          {t("profileTitle")}
        </h1>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 relative overflow-hidden rounded-3xl border border-[var(--line)] shadow-[var(--shadow-lift)]"
        >
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #0E5C4C 0%, #0B4A3D 55%, #073A31 100%)" }}
          />
          <div
            className="absolute w-72 h-72 rounded-full -top-28 -right-16"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)" }}
          />
          <div
            className="absolute w-56 h-56 rounded-full -bottom-28 -left-10"
            style={{ background: "radial-gradient(circle, rgba(199,154,63,0.22), transparent 70%)" }}
          />

          <div className="relative p-5 md:p-7 flex flex-wrap items-center gap-4 md:gap-5">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="w-16 h-16 md:w-[70px] md:h-[70px] rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-extrabold shrink-0"
              style={{
                background: "linear-gradient(145deg, rgba(4,26,22,0.34), rgba(4,26,22,0.12))",
                boxShadow: "0 0 0 3px rgba(255,255,255,0.22), 0 14px 30px -16px rgba(0,0,0,0.6)",
              }}
            >
              {initials}
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-extrabold text-lg md:text-xl text-white truncate">
                  {displayName}
                </div>
                <span
                  className={`text-[10.5px] font-extrabold uppercase tracking-wider rounded-full px-2.5 py-1 ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                  style={{
                    background: isDemo ? "rgba(245,179,1,0.22)" : "rgba(255,255,255,0.16)",
                    color: isDemo ? "#FFD977" : "#DFF5EE",
                    border: `1px solid ${isDemo ? "rgba(245,179,1,0.5)" : "rgba(255,255,255,0.28)"}`,
                  }}
                >
                  {isDemo ? (isUrdu ? "ڈیمو" : "Demo") : isUrdu ? "ممبر" : "Member"}
                </span>
              </div>
              <div className="text-xs text-white/70 truncate flex items-center gap-1.5 mt-0.5">
                {isMember ? (
                  <>
                    <Mail size={12} />
                    {session?.email}
                  </>
                ) : (
                  t("notSignedUp")
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white/12 border border-white/25 px-3.5 py-2">
                <Flame size={15} color="#FFD977" />
                <span className="text-sm font-extrabold text-white">{streak}</span>
                <span className={`text-[11px] text-white/75 ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "دن" : "days"}
                </span>
              </div>
              {isDemo && (
                <div className="flex items-center gap-2 rounded-full bg-white/12 border border-white/25 px-3.5 py-2">
                  <Clock size={14} color="#FFD977" />
                  <span className="text-[12.5px] font-bold text-white">
                    {formatRemaining(remainingMs)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  className={`${card} p-4`}
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: s.tint, color: s.color }}
                  >
                    <s.icon size={17} />
                  </span>
                  <div className="mt-3 font-extrabold text-xl leading-none text-[var(--ink)]">
                    {s.value}
                  </div>
                  <div
                    className={`mt-1 text-[11.5px] text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}
                  >
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${card} p-5`}
            >
              <div className="flex items-center gap-2">
                <Award size={16} color="var(--sage-deep)" />
                <div className={sectionTitle}>{isUrdu ? "بیجز" : "Badges"}</div>
              </div>
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {badges.map((b) => (
                    <span
                      key={b.id}
                      className={`text-[12px] font-bold border rounded-full px-3 py-1.5 ${
                        isUrdu ? "font-urdu" : ""
                      }`}
                      style={{
                        background: "var(--accent-soft)",
                        borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)",
                        color: "var(--on-accent)",
                      }}
                    >
                      🏅 {isUrdu ? b.labelUr : b.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  className={`mt-2 text-sm text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}
                >
                  {isUrdu
                    ? "پہلا بیج قریب ہے — دو دن تسلسل سے پڑھیں یا پہلی کتاب مکمل کریں۔"
                    : "Your first badge is close — read on two consecutive days or finish a book."}
                </p>
              )}
            </motion.div>

            {/* Reader profiles */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`${card} p-5`}
            >
              <div className={sectionTitle}>{isUrdu ? "ریڈر پروفائلز" : "Reader profiles"}</div>
              <p className={`text-xs text-[var(--ink-soft)] mt-1 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu
                  ? "ایک ہی فون پر بہن بھائیوں کے لیے الگ الگ شیلف اور کڈز موڈ۔"
                  : "Separate shelves and Kids Mode for siblings sharing this device."}
              </p>

              <div className="mt-4 space-y-2">
                {profiles.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border p-3 transition-colors"
                    style={{
                      borderColor:
                        p.id === activeProfile.id ? "var(--brand)" : "var(--line)",
                      background: p.id === activeProfile.id ? "var(--brand-soft)" : "transparent",
                    }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveId(p.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0"
                        style={{ background: p.color }}
                      >
                        {p.name.slice(0, 1).toUpperCase()}
                      </motion.div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate flex items-center gap-1.5 text-[var(--ink)]">
                          {p.name}
                          {p.id === activeProfile.id && <Check size={13} color="var(--brand)" />}
                        </div>
                        <div className="text-[11px] text-[var(--ink-soft)] capitalize">
                          {p.ageBand}
                        </div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleKidsMode(p.id)}
                      className="flex items-center gap-1 text-[11px] font-bold shrink-0 rounded-full px-2.5 py-1.5"
                      style={{
                        background: p.kidsMode ? "var(--sage-deep)" : "var(--line)",
                        color: p.kidsMode ? "#fff" : "var(--ink-soft)",
                      }}
                      aria-label="Toggle Kids Mode"
                    >
                      <Shield size={12} />
                      {isUrdu ? "کڈز" : "Kids"}
                    </motion.button>

                    {p.id !== "default" && (
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15, color: "var(--danger)" }}
                        onClick={() => removeProfile(p.id)}
                        className="text-[var(--ink-soft)] shrink-0"
                        aria-label="Remove profile"
                      >
                        <Trash2 size={15} />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {showAddProfile && (
                  <AddProfileForm onClose={() => setShowAddProfile(false)} />
                )}
              </AnimatePresence>

              {!showAddProfile && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ borderColor: "var(--brand)" }}
                  onClick={() => setShowAddProfile(true)}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--line)] text-sm font-bold text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                >
                  <Plus size={16} />
                  {isUrdu ? "نیا پروفائل شامل کریں" : "Add a profile"}
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Quick links */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${card} p-5`}
            >
              <div className={sectionTitle}>{isUrdu ? "فوری راستے" : "Jump back in"}</div>
              <div className="mt-3 space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-3 rounded-xl border border-[var(--line)] px-3 py-2.5 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] transition-colors"
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                    >
                      <link.icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm font-bold text-[var(--ink)] truncate ${
                          isUrdu ? "font-urdu" : ""
                        }`}
                      >
                        {link.title}
                      </span>
                      <span
                        className={`block text-[11px] text-[var(--ink-soft)] truncate ${
                          isUrdu ? "font-urdu" : ""
                        }`}
                      >
                        {link.sub}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-[var(--ink-soft)] group-hover:text-[var(--brand)] transition-colors"
                    />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Account */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${card} p-5`}
            >
              <div className={sectionTitle}>{isUrdu ? "اکاؤنٹ" : "Account"}</div>

              {isDemo ? (
                <>
                  <div className="mt-2 font-bold text-sm text-[var(--ink)]">
                    {t("keepProgressTitle")}
                  </div>
                  <p className="text-[13px] text-[var(--ink-soft)] mt-1">
                    {t("keepProgressBody")}
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 block w-full text-center py-3 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    {t("createFreeAccount")}
                  </Link>
                  <Link
                    href="/login"
                    className={`mt-2 block w-full text-center py-2.5 rounded-xl border border-[var(--line)] font-bold text-sm text-[var(--ink-soft)] hover:border-[var(--brand)] transition-colors ${
                      isUrdu ? "font-urdu" : ""
                    }`}
                  >
                    {t("alreadyHaveAccount")} {t("login")}
                  </Link>
                </>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--line)] px-3 py-3">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "var(--brand-soft)", color: "var(--brand)" }}
                    >
                      <UserRound size={16} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[var(--ink)] truncate">
                        {session?.name}
                      </span>
                      <span className="block text-[11.5px] text-[var(--ink-soft)] truncate">
                        {session?.email}
                      </span>
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--line)] font-bold text-sm text-[var(--danger)] hover:border-[var(--danger)] transition-colors"
                  >
                    <LogOut size={17} />
                    {t("logout")}
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        </div>

        <div
          className={`flex justify-center gap-5 mt-9 text-xs text-[var(--ink-soft)] ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          <Link href="/privacy" className="hover:text-[var(--ink)] underline underline-offset-4">
            {isUrdu ? "پرائیویسی پالیسی" : "Privacy Policy"}
          </Link>
          <Link href="/terms" className="hover:text-[var(--ink)] underline underline-offset-4">
            {isUrdu ? "شرائط و ضوابط" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
