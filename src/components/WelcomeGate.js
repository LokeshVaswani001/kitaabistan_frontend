"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Globe, MessageCircle, Sparkles, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ThemeToggle, { LangToggle } from "@/components/ThemeToggle";
import WavingKid from "@/components/WavingKid";

const CARDS = [
  { icon: WifiOff, title: "featureOfflineT", body: "featureOfflineB" },
  { icon: Globe, title: "featureBilingualT", body: "featureBilingualB" },
  { icon: MessageCircle, title: "featureChatbotT", body: "featureChatbotB" },
  { icon: Sparkles, title: "featureFreeT", body: "featureFreeB" },
];

const rise = (delay) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

function shouldSkip() {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("welcome") === "1") return false;
    if (params.get("nowelcome") === "1") return true;
    if (navigator.webdriver) return true;
  } catch {
    /* keep the gate */
  }
  return false;
}

export default function WelcomeGate() {
  const { t, isUrdu } = useLanguage();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (shouldSkip()) setOpen(false);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Enter") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enter = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="welcome-gate"
          role="dialog"
          aria-modal="true"
          aria-label={t("welcomeTitle")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          className="fixed inset-0 z-[100] bg-paper overflow-y-auto"
        >
          {/* decorative background — glows kept clear of the top bar text */}
          <div
            className="aura pointer-events-none"
            style={{ width: 560, height: 560, top: 140, right: -300, background: "var(--brand)" }}
          />
          <div
            className="aura pointer-events-none"
            style={{ width: 480, height: 480, bottom: -220, left: -180, background: "var(--accent)", opacity: 0.4 }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.25]"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 80% 65% at 50% 40%, black, transparent)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 65% at 50% 40%, black, transparent)",
            }}
          />

          <div className="relative min-h-full flex flex-col">
            {/* top bar — brand + language & theme before entering */}
            <div className="mx-auto w-full max-w-5xl px-5 md:px-8 h-16 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2.5">
                <span className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-on-brand font-extrabold text-sm">
                  {t("appName").slice(0, 1)}
                </span>
                <span className="font-extrabold text-lg tracking-tight">{t("appName")}</span>
              </span>
              <span className="flex items-center gap-2">
                <LangToggle />
                <ThemeToggle />
              </span>
            </div>

            {/* welcome grid — kid stands on the left (lg+), content on the right */}
            <div className="flex-1 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-5 md:px-8 py-10 md:py-14 grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-12 items-center">
                <motion.div {...rise(0.05)} className="flex justify-center lg:self-end lg:pb-4">
                  <WavingKid className="h-40 sm:h-56 lg:h-72 xl:h-80 w-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.16)]" />
                </motion.div>

                <div className="text-center">
                <motion.span
                  {...rise(0.05)}
                  className="mx-auto grid place-items-center w-16 h-16 rounded-[1.4rem] bg-brand text-on-brand shadow-lift"
                >
                  <span className="text-2xl font-extrabold">{t("appName").slice(0, 1)}</span>
                </motion.span>

                <motion.div {...rise(0.12)} className="mt-6 flex justify-center">
                  <span className="chip chip-brand">
                    <Sparkles size={13} />
                    {t("welcomeEyebrow")}
                  </span>
                </motion.div>

                <motion.h1
                  {...rise(0.18)}
                  className={`mt-5 text-[2.1rem] leading-[1.1] sm:text-5xl md:text-[3.4rem] font-extrabold tracking-tight ${
                    isUrdu ? "font-urdu tracking-normal leading-[1.4]" : ""
                  }`}
                >
                  {t("welcomeTitle")}
                </motion.h1>

                <motion.p
                  {...rise(0.26)}
                  className={`mt-5 mx-auto max-w-2xl text-base md:text-lg leading-relaxed text-ink-soft ${
                    isUrdu ? "font-urdu" : ""
                  }`}
                >
                  {t("welcomeBody")}
                </motion.p>

                {/* four feature cards, translated already */}
                <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-left">
                  {CARDS.map(({ icon: Icon, title, body }, i) => (
                    <motion.article
                      key={title}
                      {...rise(0.34 + i * 0.08)}
                      className="card card-hover p-4 md:p-5"
                    >
                      <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand-soft text-brand">
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                      <h3
                        className={`mt-3 text-sm font-extrabold leading-snug tracking-tight ${
                          isUrdu ? "font-urdu tracking-normal" : ""
                        }`}
                      >
                        {t(title)}
                      </h3>
                      <p className={`mt-1.5 text-xs leading-relaxed text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
                        {t(body)}
                      </p>
                    </motion.article>
                  ))}
                </div>

                <motion.div {...rise(0.7)} className="mt-9 flex flex-col items-center gap-4">
                  <button
                    type="button"
                    data-testid="welcome-enter"
                    onClick={enter}
                    className="btn btn-primary btn-lg"
                  >
                    {t("welcomeBtn")}
                    <ArrowRight size={17} />
                  </button>
                  <p className={`flex items-center gap-2 text-xs font-semibold text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
                    <Check size={14} className="text-brand" />
                    {t("heroNote")}
                  </p>
                </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
