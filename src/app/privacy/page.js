"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const { isUrdu, t } = useLanguage();

  const sections = [
    ["privacyCollectT", "privacyCollectB"],
    ["privacyChildT", "privacyChildB"],
    ["privacyDataT", "privacyDataB"],
    ["privacyContactT", "privacyContactB"],
  ];

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col">
      <div className="px-6 py-12 flex-1">
        <div className={`max-w-2xl mx-auto ${isUrdu ? "font-urdu text-right" : ""}`}>
          <Link href="/" className="text-sm font-semibold text-[var(--ink-soft)]">
            ← {t("back")}
          </Link>

          <h1 className="text-3xl font-extrabold mt-6">{t("privacyTitle")}</h1>
          <p className="text-sm text-[var(--ink-soft)] mt-2">{t("privacyUpdated")}</p>

          <div className="mt-8 space-y-6 text-sm leading-relaxed text-[var(--ink)]">
            <p>{t("privacyIntro")}</p>
            {sections.map(([titleKey, bodyKey]) => (
              <div key={titleKey}>
                <h2 className="font-extrabold text-base mb-2">{t(titleKey)}</h2>
                <p>{t(bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
