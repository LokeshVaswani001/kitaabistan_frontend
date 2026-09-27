"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Sparkles, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ThemeToggle, { LangToggle } from "@/components/ThemeToggle";

/**
 * Split-screen shell shared by /login, /signup and /demo:
 *   left  — the form, with a consistent top bar and legal footer
 *   right — a branded showcase panel (lg and up)
 *
 * Both columns are driven by the app's translation dictionary, so the whole
 * screen flips to Urdu with the language toggle.
 */
export default function AuthShell({ children, panelTitle, panelBody }) {
  const { t, isUrdu } = useLanguage();

  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-[1fr_minmax(0,0.85fr)]">
      {/* ---------------------------------------------------------- form side */}
      <div className="flex flex-col px-5 sm:px-10 lg:px-16 py-6 sm:py-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="grid place-items-center w-9 h-9 rounded-full border border-line bg-panel text-ink-soft hover:text-brand hover:border-brand transition-colors"
              aria-label={t("back")}
            >
              <ArrowLeft size={17} />
            </Link>
            <Link href="/" className="font-extrabold text-lg tracking-tight text-ink">
              {t("appName")}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[26rem]"
          >
            {children}
          </motion.div>
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-ink-soft">
          <span>© 2026 {t("appName")}</span>
          <Link href="/privacy" className="hover:text-brand transition-colors">
            {t("footerPrivacyLabel")}
          </Link>
          <Link href="/terms" className="hover:text-brand transition-colors">
            {t("footerTermsLabel")}
          </Link>
        </footer>
      </div>

      {/* -------------------------------------------------------- showcase side */}
      <aside className="relative hidden lg:block overflow-hidden bg-brand-deep grain">
        <div
          className="aura"
          style={{ width: 420, height: 420, top: -120, right: -100, background: "var(--brand)", opacity: 0.45 }}
        />
        <div
          className="aura"
          style={{ width: 360, height: 360, bottom: -80, left: -120, background: "var(--accent)", opacity: 0.35 }}
        />

        <div className="relative h-full flex flex-col justify-between px-12 xl:px-16 py-14 text-[#F4FBF9]">
          <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.18em] uppercase opacity-80">
            <Sparkles size={14} />
            {t("authPanelEyebrow")}
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl xl:text-[2.75rem] leading-[1.1] font-extrabold">
              {panelTitle ?? t("authPanelTitle")}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#F4FBF9]/70">
              {panelBody ?? t("authPanelBody")}
            </p>

            <div className="mt-9 grid grid-cols-3 gap-3">
              {[
                { icon: WifiOff, value: "100%", label: t("statOffline") },
                { icon: Sparkles, value: "₨0", label: t("statFree") },
                { icon: ShieldCheck, value: "2", label: t("statLanguages") },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-4"
                >
                  <Icon size={15} className="opacity-70" />
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
                  <div className={`mt-0.5 text-[11px] leading-tight text-[#F4FBF9]/65 ${isUrdu ? "font-urdu" : ""}`}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#F4FBF9]/60">
            <div className="h-px flex-1 bg-white/15" />
            {t("footerTagline")}
          </div>
        </div>
      </aside>
    </div>
  );
}
