"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { t, isUrdu, lang, toggleLang } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-[var(--ink-soft)]">
            ← {t("back")}
          </Link>
          <button onClick={toggleLang} className="text-xs font-bold underline">
            {lang === "en" ? "اردو" : "EN"}
          </button>
        </div>
        <h1 className={`text-2xl font-extrabold mt-6 ${isUrdu ? "font-urdu" : ""}`}>
          {t("loginTitle")}
        </h1>

        {reason === "session" && (
          <div className={`mt-4 text-sm bg-[var(--sun)]/30 border border-[var(--sun)] rounded-xl p-3 ${isUrdu ? "font-urdu" : ""}`}>
            {t("demoEndedBanner")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("email")}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[var(--line)] rounded-xl px-4 py-3 font-normal"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("password")}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[var(--line)] rounded-xl px-4 py-3 font-normal"
              placeholder="••••••••"
            />
          </label>

          {error && <div className="text-sm text-[var(--danger)] font-semibold">{error}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-2 w-full py-3.5 rounded-xl bg-[var(--ink)] text-white font-bold"
          >
            {t("loginTitle")}
          </motion.button>
        </form>

        <p className={`text-center text-xs text-[var(--ink-soft)] mt-6 ${isUrdu ? "font-urdu" : ""}`}>
          {t("newHere")}{" "}
          <Link href="/signup" className="font-bold underline">
            {t("createAccount")}
          </Link>{" "}
          {isUrdu ? "یا" : "or"}{" "}
          <Link href="/demo" className="font-bold underline">
            {t("orTryDemo")}
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
