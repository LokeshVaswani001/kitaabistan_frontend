"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthShell from "@/components/AuthShell";

const DURATIONS = [
  { minutes: 5, hint: "Quick look", hintUr: "فوری جائزہ" },
  { minutes: 15, hint: "Browse a category", hintUr: "ایک زمرہ دیکھیں" },
  { minutes: 30, hint: "Read a short story", hintUr: "ایک مختصر کہانی پڑھیں" },
  { minutes: 60, hint: "Full exploration", hintUr: "مکمل جائزہ" },
];

export default function DemoPage() {
  const [selected, setSelected] = useState(15);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const { startDemo } = useAuth();
  const { t, isUrdu } = useLanguage();
  const router = useRouter();

  const handleStart = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await startDemo(selected);
    if (result.ok) {
      router.replace("/home");
    } else {
      setBusy(false);
      setError(result.error);
    }
  };

  return (
    <AuthShell
      panelTitle={isUrdu ? "پہلے خود آزمائیں، پھر فیصلہ کریں۔" : "Try it before you commit."}
      panelBody={
        isUrdu
          ? "ڈیمو میں اکاؤنٹ کی ضرورت نہیں — وقت کے ساتھ لائبریری دیکھیں، پھر چاہیں تو اپنی پیش رفت محفوظ کریں۔"
          : "No account needed for the demo — explore the library against the clock, then sign up whenever you want to keep your progress."
      }
    >
      <span className="chip chip-brand">
        <Clock size={13} />
        {isUrdu ? "ٹائمڈ ڈیمو" : "Timed demo"}
      </span>

      <h1 className={`text-[2rem] leading-tight font-extrabold mt-4 ${isUrdu ? "font-urdu" : ""}`}>
        {t("demoTitle")}
      </h1>
      <p className={`text-sm text-ink-soft mt-2 ${isUrdu ? "font-urdu" : ""}`}>{t("demoSubtitle")}</p>

      <div className="mt-7 grid grid-cols-2 gap-3">
        {DURATIONS.map((d) => {
          const active = selected === d.minutes;
          return (
            <motion.button
              key={d.minutes}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelected(d.minutes)}
              aria-pressed={active}
              className="text-left rounded-2xl border p-4 transition-all"
              style={{
                borderColor: active ? "var(--brand)" : "var(--line)",
                background: active ? "var(--brand-soft)" : "var(--panel)",
                boxShadow: active ? "0 0 0 3px color-mix(in oklab, var(--brand) 14%, transparent)" : "none",
              }}
            >
              <div className="font-extrabold text-lg text-ink">
                {d.minutes >= 60
                  ? isUrdu
                    ? "1 گھنٹہ"
                    : "1 hour"
                  : isUrdu
                    ? `${d.minutes} منٹ`
                    : `${d.minutes} minutes`}
              </div>
              <div className={`text-xs text-ink-soft mt-1 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? d.hintUr : d.hint}
              </div>
            </motion.button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className={`mt-4 flex items-start gap-2.5 rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={handleStart}
        disabled={busy}
        className={`btn btn-primary btn-lg btn-block mt-7 ${isUrdu ? "font-urdu" : ""}`}
      >
        {busy ? (
          <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          <>
            {t("startDemoBtn", { min: selected })}
            <ArrowRight size={17} />
          </>
        )}
      </motion.button>

      <p className={`text-center text-xs text-ink-soft mt-6 ${isUrdu ? "font-urdu" : ""}`}>
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          {t("login")}
        </Link>
      </p>
    </AuthShell>
  );
}
