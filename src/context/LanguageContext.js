"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { t as translate } from "@/lib/translations";

const LANG_KEY = "kitaabistan_lang";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Always start with the server-safe default ("en") so the first client
  // render matches the server-rendered HTML exactly. The real saved
  // preference is applied a moment later inside useEffect, which only
  // runs on the client after hydration — this avoids a hydration
  // mismatch warning while still restoring the user's choice.
  const [lang, setLang] = useState("en");

  // Restoring a saved preference after mount (not during render) is the
  // standard fix for the hydration-mismatch problem described above.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "ur") {
      setLang(stored);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_KEY, lang);
      document.documentElement.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", lang === "ur" ? "ur" : "en");
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      isUrdu: lang === "ur",
      toggleLang: () => setLang((l) => (l === "en" ? "ur" : "en")),
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
