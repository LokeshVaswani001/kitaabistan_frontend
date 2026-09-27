"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import PasswordField from "@/components/PasswordField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const { t, isUrdu } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const nextErrors = {};
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = t("errEmail");
    if (!password) nextErrors.password = t("errPasswordRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setError("");
    const result = await login({ email: email.trim(), password });
    setBusy(false);

    if (result.ok) {
      router.replace("/home");
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthShell>
      <span className="chip chip-brand">{t("welcomeBack")}</span>

      <h1 className={`text-[2rem] leading-tight font-extrabold mt-4 ${isUrdu ? "font-urdu" : ""}`}>
        {t("loginTitle")}
      </h1>
      <p className={`text-sm text-ink-soft mt-2 ${isUrdu ? "font-urdu" : ""}`}>
        {t("newHere")}{" "}
        <Link href="/signup" className="font-bold text-brand hover:underline">
          {t("createAccount")}
        </Link>
      </p>

      {reason === "session" && (
        <div
          className={`mt-5 flex items-start gap-2.5 rounded-xl border border-accent bg-accent-soft px-4 py-3 text-sm font-semibold text-ink ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
          <span>{t("demoEndedBanner")}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className={`mt-4 flex items-start gap-2.5 rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger ${
            isUrdu ? "font-urdu" : ""
          }`}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <TextField
          id="email"
          label={t("email")}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          inputMode="email"
          icon={Mail}
          error={errors.email}
        />

        <PasswordField
          id="password"
          label={t("password")}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />

        <motion.button
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={busy}
          className="btn btn-primary btn-lg btn-block mt-1"
        >
          {busy ? (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <>
              {t("loginTitle")}
              <ArrowRight size={17} />
            </>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 my-6 text-[11px] font-extrabold tracking-[0.14em] uppercase text-ink-soft">
        <span className="h-px flex-1 bg-line" />
        {t("orWord")}
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link href="/demo" className="btn btn-outline btn-block">
        <KeyRound size={16} />
        {t("orTryDemo")}
      </Link>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
