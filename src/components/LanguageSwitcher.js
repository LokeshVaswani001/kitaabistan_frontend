"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

/**
 * 18-language picker. Everything is bundled (see src/lib/locales), so the
 * switch — and the labels it changes — work with zero connection.
 */
export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang, languages, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`relative shrink-0 ${className}`}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex items-center gap-1.5 bg-[var(--panel)] border border-[var(--line)] rounded-full px-3 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--brand)] transition-colors"
      >
        <Globe size={14} className="text-[var(--brand)]" />
        <span className="max-w-[92px] truncate">{language.native}</span>
        <ChevronDown
          size={13}
          className="text-[var(--ink-soft)] transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            role="listbox"
            className="absolute right-0 mt-2 w-60 max-h-[62vh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] z-50"
          >
            {languages.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "text-[var(--ink)] hover:bg-[var(--brand-soft)]"
                  }`}
                >
                  <span className="truncate">{l.native}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">
                      {l.label}
                    </span>
                    {active && <Check size={13} />}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
