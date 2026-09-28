"use client";

import Link from "next/link";
import { ArrowUp, BookOpen, Globe, GraduationCap, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ThemeToggle, { LangToggle } from "@/components/ThemeToggle";
import { allBooks } from "@/lib/booksData";
import { LANGUAGES } from "@/lib/locales";

/**
 * Site-wide footer: a trust strip built from real numbers (library size,
 * bundled languages, offline-first, free), the brand block with the
 * language/theme switches, three link columns and a bottom bar with the
 * copyright, the promise line and back-to-top.
 *
 * `app` adds the clearance the fixed mobile tab bar needs so nothing
 * hides behind it when the footer renders inside AppShell.
 */
export default function Footer({ app = false }) {
  const { t, isUrdu } = useLanguage();

  const trust = [
    { icon: BookOpen, text: t("footerStatBooks", { n: allBooks().length }) },
    { icon: Globe, text: t("footerStatLanguages", { n: LANGUAGES.length }) },
    { icon: WifiOff, text: t("statOffline") },
    { icon: GraduationCap, text: t("termsFreeT") },
  ];

  const columns = [
    {
      title: t("footerProduct"),
      links: [
        { label: t("navFeatures"), href: "/#features" },
        { label: t("libraryTitle"), href: "/library" },
        { label: t("chatbotName"), href: "/chatbot" },
        { label: t("navImport"), href: "/import" },
        { label: t("navSaved"), href: "/saved" },
      ],
    },
    {
      title: t("footerResources"),
      links: [
        { label: t("navHow"), href: "/#how" },
        { label: t("footerDemo"), href: "/demo" },
        { label: t("footerFirstTime"), href: "/onboarding" },
      ],
    },
    {
      title: t("footerLegal"),
      links: [
        { label: t("footerPrivacyLabel"), href: "/privacy" },
        { label: t("footerTermsLabel"), href: "/terms" },
      ],
    },
  ];

  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const trustItem = `inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-bold text-ink-soft`;
  const linkClass = `group relative inline-block text-sm font-semibold text-ink-soft hover:text-brand transition-colors focus-visible:outline-none focus-visible:text-brand ${
    isUrdu ? "font-urdu" : ""
  }`;

  return (
    <footer className="bg-panel/50">
      <div className="h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />

      <div className="mx-auto max-w-6xl px-5 md:px-8 pt-8">
        <div className="flex flex-wrap gap-2.5">
          {trust.map(({ icon: Icon, text }) => (
            <span key={text} className={trustItem}>
              <Icon size={12} className="text-brand" />
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 md:px-8 pt-9 pb-11">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span className="grid place-items-center w-10 h-10 rounded-xl bg-brand text-on-brand font-extrabold text-base transition-transform group-hover:-translate-y-0.5">
                {t("appName").slice(0, 1)}
              </span>
              <span className="font-extrabold text-lg tracking-tight">{t("appName")}</span>
            </Link>
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
              <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink-soft">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                      <span className="absolute -bottom-1 left-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div
          className={`mx-auto max-w-6xl px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 ${
            app ? "pt-5 pb-24 md:pb-5" : "py-5"
          }`}
        >
          <p className={`text-xs text-ink-soft text-center sm:text-start ${isUrdu ? "font-urdu" : ""}`}>
            © {new Date().getFullYear()} {t("appName")}. {t("footerRights")}
          </p>
          <p className={`hidden sm:block text-xs font-semibold text-ink-soft ${isUrdu ? "font-urdu" : ""}`}>
            {t("footerTagline")}
          </p>
          <button
            type="button"
            onClick={backToTop}
            aria-label={t("footerBackToTop")}
            title={t("footerBackToTop")}
            className="group inline-flex items-center gap-2 text-xs font-bold text-ink-soft hover:text-brand transition-colors focus-visible:outline-none focus-visible:text-brand"
          >
            <span className="grid place-items-center w-8 h-8 rounded-full border border-line group-hover:border-brand transition-colors">
              <ArrowUp size={14} />
            </span>
            <span className="hidden sm:inline">{t("footerBackToTop")}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
