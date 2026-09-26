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
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useAuth, formatRemaining } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useStreak } from "@/context/StreakContext";
import { useProfiles } from "@/context/ProfilesContext";

function AddProfileForm({ onClose }) {
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState("child");
  const { addProfile } = useProfiles();
  const { isUrdu } = useLanguage();

  const colors = ["#6E8E80", "#C79A3B", "#8B6FC9", "#4FB0C6", "#F17456"];

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
          className="w-full py-3 rounded-xl bg-[var(--ink)] text-white font-bold text-sm"
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
  const { profiles, activeProfile, setActiveId, removeProfile, toggleKidsMode } = useProfiles();
  const [showAddProfile, setShowAddProfile] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AppShell>
      <div className="max-w-md mx-auto px-5 md:px-10 pt-6 md:pt-10 pb-10">
        <h1 className="text-2xl font-extrabold">{t("profileTitle")}</h1>

        {/* Account card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--sage-deep)] flex items-center justify-center text-white">
              <UserRound size={22} />
            </div>
            <div>
              <div className="font-bold">{isMember ? session.name : t("demoVisitor")}</div>
              <div className="text-xs text-[var(--ink-soft)]">
                {isMember ? session.email : t("notSignedUp")}
              </div>
            </div>
          </div>

          {isDemo && (
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-5 flex items-center gap-3 bg-[var(--sun)]/25 border border-[var(--sun)] rounded-xl px-4 py-3"
            >
              <Clock size={18} />
              <div className="text-sm font-semibold">
                {t("demoTimeLeft", { time: formatRemaining(remainingMs) })}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Streak & badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Flame size={20} color="#B8760E" />
              <div>
                <div className="font-extrabold text-lg leading-none">{streak}</div>
                <div className={`text-[11px] text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "دن کا سلسلہ" : "day streak"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award size={20} color="var(--sage-deep)" />
              <div>
                <div className="font-extrabold text-lg leading-none">{booksOpened}</div>
                <div className={`text-[11px] text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}>
                  {isUrdu ? "کتابیں کھولیں" : "books opened"}
                </div>
              </div>
            </div>
          </div>

          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {badges.map((b) => (
                <span
                  key={b.id}
                  className={`text-[11px] font-bold bg-[var(--sun)]/25 border border-[var(--sun)] rounded-full px-3 py-1 ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                >
                  🏅 {isUrdu ? b.labelUr : b.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reader profiles */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5"
        >
          <div className={`font-bold text-sm ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu ? "ریڈر پروفائلز" : "Reader profiles"}
          </div>
          <p className={`text-xs text-[var(--ink-soft)] mt-1 ${isUrdu ? "font-urdu" : ""}`}>
            {isUrdu
              ? "ایک ہی فون پر بہن بھائیوں کے لیے الگ الگ شیلف اور کڈز موڈ۔"
              : "Separate shelves and Kids Mode for siblings sharing this device."}
          </p>

          <div className="mt-4 space-y-2">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{
                  borderColor: p.id === activeProfile.id ? "var(--ink)" : "var(--line)",
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
                    <div className="text-sm font-bold truncate flex items-center gap-1.5">
                      {p.name}
                      {p.id === activeProfile.id && <Check size={13} color="var(--sage-deep)" />}
                    </div>
                    <div className="text-[11px] text-[var(--ink-soft)] capitalize">{p.ageBand}</div>
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

          <AnimatePresence>{showAddProfile && <AddProfileForm onClose={() => setShowAddProfile(false)} />}</AnimatePresence>

          {!showAddProfile && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ borderColor: "var(--sage)" }}
              onClick={() => setShowAddProfile(true)}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--line)] text-sm font-bold text-[var(--ink-soft)] ${
                isUrdu ? "font-urdu" : ""
              }`}
            >
              <Plus size={16} />
              {isUrdu ? "نیا پروفائل شامل کریں" : "Add a profile"}
            </motion.button>
          )}
        </motion.div>

        {isDemo ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5"
          >
            <div className="font-bold">{t("keepProgressTitle")}</div>
            <p className="text-sm text-[var(--ink-soft)] mt-1">{t("keepProgressBody")}</p>
            <Link
              href="/signup"
              className="mt-4 inline-block w-full text-center py-3 rounded-xl bg-[var(--ink)] text-white font-bold"
            >
              {t("createFreeAccount")}
            </Link>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[var(--line)] font-bold text-[var(--danger)]"
          >
            <LogOut size={18} />
            {t("logout")}
          </motion.button>
        )}

        <div className={`flex justify-center gap-4 mt-8 text-xs text-[var(--ink-soft)] ${isUrdu ? "font-urdu" : ""}`}>
          <Link href="/privacy" className="underline">
            {isUrdu ? "پرائیویسی پالیسی" : "Privacy Policy"}
          </Link>
          <Link href="/terms" className="underline">
            {isUrdu ? "شرائط و ضوابط" : "Terms of Service"}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
