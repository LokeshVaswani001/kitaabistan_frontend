"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup, isDemo } = useAuth();
  const { t, isUrdu, lang, toggleLang } = useLanguage();
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = signup({ name, email, password });
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
          {t("signupTitle")}
        </h1>
        {isDemo && (
          <p className={`text-sm text-[var(--ink-soft)] mt-2 ${isUrdu ? "font-urdu" : ""}`}>
            {t("signupKeepsProgress")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {t("name")}
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[var(--line)] rounded-xl px-4 py-3 font-normal"
              placeholder="Your name"
            />
          </label>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[var(--line)] rounded-xl px-4 py-3 font-normal"
              placeholder="At least 6 characters"
            />
          </label>

          {error && <div className="text-sm text-[var(--danger)] font-semibold">{error}</div>}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-2 w-full py-3.5 rounded-xl bg-[var(--ink)] text-white font-bold"
          >
            {t("signupTitle")}
          </motion.button>
        </form>

        <p className={`text-center text-xs text-[var(--ink-soft)] mt-6 ${isUrdu ? "font-urdu" : ""}`}>
          {t("alreadyHaveAccount")}{" "}
          <Link href="/login" className="font-bold underline">
            {t("login")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
