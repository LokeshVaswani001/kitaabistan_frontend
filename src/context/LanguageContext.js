"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { t as translate } from "@/lib/translations";
import { LANGUAGES, LANGUAGE_CODES, dirFor, languageFor } from "@/lib/locales";

const LANG_KEY = "kitaabistan_lang";
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Always start with the server-safe default ("en") so the first client
  // render matches the server-rendered HTML exactly. The real saved
  // preference is applied a moment later inside useEffect, which only
  // runs on the client after hydration — this avoids a hydration
  // mismatch warning while still restoring the user's choice.
  const [lang, setLangState] = useState("en");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY);
    if (stored && LANGUAGE_CODES.has(stored)) {
      setLangState(stored);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keep <html lang/dir> in sync so assistive tech and search engines
  // read the document in the right language and direction.
  useEffect(() => {
    document.documentElement.setAttribute("dir", dirFor(lang));
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((next) => {
    const value = LANGUAGE_CODES.has(next) ? next : "en";
    setLangState(value);
    try {
      window.localStorage.setItem(LANG_KEY, value);
    } catch {
      /* storage unavailable — the choice still applies this session */
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      isUrdu: lang === "ur",
      dir: dirFor(lang),
      language: languageFor(lang),
      languages: LANGUAGES,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "ur" : "en"),
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
