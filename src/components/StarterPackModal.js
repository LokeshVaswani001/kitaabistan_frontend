"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const STARTER_PACK_MB = 24;

export default function StarterPackModal({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const { isUrdu } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.random() * 18 + 6);
        if (next >= 100) {
          clearInterval(interval);
          setDone(true);
        }
        return next;
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--panel)] rounded-2xl p-6 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--sun)] mx-auto flex items-center justify-center mb-4">
          {done ? <Check size={24} color="#26210A" /> : <Download size={24} color="#26210A" />}
        </div>
        <h2 className={`font-extrabold text-lg ${isUrdu ? "font-urdu" : ""}`}>
          {done
            ? isUrdu
              ? "اسٹارٹر پیک تیار ہے"
              : "Starter pack ready"
            : isUrdu
            ? "اسٹارٹر پیک ڈاؤن لوڈ ہو رہا ہے"
            : "Downloading starter pack"}
        </h2>
        <p className="text-xs text-[var(--ink-soft)] mt-1">
          {Math.round((progress / 100) * STARTER_PACK_MB)} MB / {STARTER_PACK_MB} MB
        </p>

        <div className="h-2 bg-[var(--line)] rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-[var(--sage-deep)]"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear" }}
          />
        </div>

        <p className={`text-xs text-[var(--ink-soft)] mt-4 ${isUrdu ? "font-urdu" : ""}`}>
          {isUrdu
            ? "یہ کتابیں اب مکمل طور پر آف لائن دستیاب ہوں گی۔"
            : "These books will now be fully available offline, even with no connection."}
        </p>

        <button
          disabled={!done}
          onClick={onDone}
          className="mt-5 w-full py-3 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold disabled:opacity-40"
        >
          {isUrdu ? "جاری رکھیں" : "Continue"}
        </button>
      </motion.div>
    </div>
  );
}
