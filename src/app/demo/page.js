"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const DURATIONS = [
  { minutes: 5, hint: "Quick look", hintUr: "فوری جائزہ" },
  { minutes: 15, hint: "Browse a category", hintUr: "ایک زمرہ دیکھیں" },
  { minutes: 30, hint: "Read a short story", hintUr: "ایک مختصر کہانی پڑھیں" },
  { minutes: 60, hint: "Full exploration", hintUr: "مکمل جائزہ" },
];

export default function DemoPage() {
  const [selected, setSelected] = useState(15);
  const { startDemo } = useAuth();
  const { t, isUrdu, lang, toggleLang } = useLanguage();
  const router = useRouter();

  const handleStart = () => {
    startDemo(selected);
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[var(--ink-soft)]">
            ← {t("back")}
          </Link>
          <button onClick={toggleLang} className="text-xs font-bold underline">
            {lang === "en" ? "اردو" : "EN"}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--sun)] flex items-center justify-center">
            <Clock size={20} color="#26210A" />
          </div>
          <h1 className={`text-2xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
            {t("demoTitle")}
          </h1>
        </div>
        <p className={`text-[var(--ink-soft)] mt-3 text-sm ${isUrdu ? "font-urdu" : ""}`}>
          {t("demoSubtitle")}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {DURATIONS.map((d) => (
            <motion.button
              key={d.minutes}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelected(d.minutes)}
              className="text-left rounded-2xl border-2 p-4 transition-colors"
              style={{
                borderColor: selected === d.minutes ? "var(--ink)" : "var(--line)",
                background: selected === d.minutes ? "var(--panel)" : "transparent",
              }}
            >
              <div className="font-extrabold text-lg">
                {d.minutes >= 60 ? (isUrdu ? "1 گھنٹہ" : "1 hour") : isUrdu ? `${d.minutes} منٹ` : `${d.minutes} minutes`}
              </div>
              <div className={`text-xs text-[var(--ink-soft)] mt-1 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? d.hintUr : d.hint}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className={`mt-8 w-full py-4 rounded-xl bg-[var(--ink)] text-white font-bold ${isUrdu ? "font-urdu" : ""}`}
        >
          {t("startDemoBtn", { min: selected })}
        </motion.button>

        <p className={`text-center text-xs text-[var(--ink-soft)] mt-5 ${isUrdu ? "font-urdu" : ""}`}>
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-bold underline">
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
