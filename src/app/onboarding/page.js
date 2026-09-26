"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, MessageCircle, Globe, Check, UserRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useProfiles } from "@/context/ProfilesContext";
import { markOnboarded } from "@/lib/onboarding";
import StarterPackModal from "@/components/StarterPackModal";

const STEP_COUNT = 4;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showDownload, setShowDownload] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [ageBand, setAgeBand] = useState("all");
  const { lang, setLang, t, isUrdu } = useLanguage();
  const { updateProfile } = useProfiles();
  const router = useRouter();

  const finish = () => {
    // Optional profile setup (Section 4): rename the default profile with
    // whatever the student entered, purely to personalize shelves — no
    // personal data is required, so leaving it blank just keeps "Me".
    if (profileName.trim()) {
      updateProfile("default", {
        name: profileName.trim(),
        ageBand,
        kidsMode: ageBand === "child",
      });
    }
    setShowDownload(true);
  };

  const handleDownloadDone = () => {
    markOnboarded();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center gap-2 mb-10">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 28 : 8,
                background: i <= step ? "var(--ink)" : "var(--line)",
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="lang"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--sun)] mx-auto flex items-center justify-center mb-6">
                <Globe size={28} color="#26210A" />
              </div>
              <h1 className="text-2xl font-extrabold">Choose your language</h1>
              <p className="text-sm text-[var(--ink-soft)] mt-2 font-urdu">
                اپنی زبان منتخب کریں
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLang("en")}
                  className="rounded-2xl border-2 p-5 font-bold"
                  style={{ borderColor: lang === "en" ? "var(--ink)" : "var(--line)" }}
                >
                  English
                </button>
                <button
                  onClick={() => setLang("ur")}
                  className="rounded-2xl border-2 p-5 font-bold font-urdu"
                  style={{ borderColor: lang === "ur" ? "var(--ink)" : "var(--line)" }}
                >
                  اردو
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="shelf"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--sage)] mx-auto flex items-center justify-center mb-6">
                <BookOpen size={28} color="#1D2624" />
              </div>
              <h1 className={`text-2xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? "آٹھ شیلفیں، ایک جگہ" : "Eight shelves, one place"}
              </h1>
              <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu
                  ? "ناول، اسلامی کتب، بچوں کی کہانیاں، نظمیں اور مزید — سب ایک ہی لائبریری میں۔"
                  : "Novels, Islamic books, children's stories, poems, and more — all organized into one simple library."}
              </p>
              <div className="mt-8 grid grid-cols-4 gap-2">
                {["#DDEAE4", "#E4DEF2", "#FBE0E0", "#DCEAE6", "#F5E9C8", "#DDEAF2", "#F6E4D3", "#FBE3D8"].map(
                  (c, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="aspect-square rounded-xl"
                      style={{ background: c }}
                    />
                  )
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="chatbot"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--ink)] mx-auto flex items-center justify-center mb-6">
                <MessageCircle size={28} color="#fff" />
              </div>
              <h1 className={`text-2xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? "رہنما سے پوچھیں" : "Meet Rehnuma"}
              </h1>
              <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu
                  ? "ایک محفوظ چیٹ بوٹ جو صرف منظور شدہ کتابوں سے جواب دیتا ہے — بغیر انٹرنیٹ کے بھی۔"
                  : "A safe chatbot that only answers from approved books — works with zero internet."}
              </p>
              <div className="mt-8 space-y-2 text-left">
                <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl px-4 py-3 text-sm max-w-[80%]">
                  {isUrdu ? "چیونٹی کی کہانی کا سبق کیا ہے؟" : "What's the moral of the ant story?"}
                </div>
                <div className="bg-[var(--ink)] text-white rounded-xl px-4 py-3 text-sm max-w-[80%] ml-auto">
                  {isUrdu ? "مستقبل کے لیے تیاری کریں۔" : "Prepare for the future."}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--sage)] mx-auto flex items-center justify-center mb-6">
                <UserRound size={28} color="#1D2624" />
              </div>
              <h1 className={`text-2xl font-extrabold ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu ? "اپنی شیلف بنائیں (اختیاری)" : "Personalize your shelf (optional)"}
              </h1>
              <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
                {isUrdu
                  ? "کوئی ذاتی معلومات درکار نہیں — یہ صرف مواد کو آپ کے لیے موزوں بنانے کے لیے ہے۔"
                  : "No personal data required — this just personalizes your shelves and reading level."}
              </p>

              <div className="mt-6 text-left">
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder={isUrdu ? "نام (اختیاری)" : "Your name (optional)"}
                  className={`w-full border-2 border-[var(--line)] rounded-2xl px-4 py-3.5 text-sm ${
                    isUrdu ? "font-urdu text-right" : ""
                  }`}
                />
                <div className="grid grid-cols-3 gap-2 mt-3">
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => (step < STEP_COUNT - 1 ? setStep((s) => s + 1) : finish())}
          className="mt-10 w-full py-4 rounded-xl bg-[var(--ink)] text-white font-bold flex items-center justify-center gap-2"
        >
          {step < STEP_COUNT - 1 ? (
            isUrdu ? "اگلا" : "Next"
          ) : (
            <>
              <Check size={18} /> {isUrdu ? "شروع کریں" : "Get started"}
            </>
          )}
        </motion.button>

        <button
          onClick={finish}
          className="mt-4 w-full text-center text-xs font-semibold text-[var(--ink-soft)]"
        >
          {isUrdu ? "چھوڑ دیں" : "Skip"}
        </button>
      </div>

      {showDownload && <StarterPackModal onDone={handleDownloadDone} />}
    </div>
  );
}
