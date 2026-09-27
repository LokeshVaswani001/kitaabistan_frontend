"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, Mail, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import PasswordField from "@/components/PasswordField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^\w\s]/.test(pw)) score++;
  return Math.min(score, 4); // 0–4
}

const STRENGTH_KEYS = ["strengthTooShort", "strengthWeak", "strengthFair", "strengthGood", "strengthStrong"];
const STRENGTH_COLORS = ["var(--danger)", "var(--danger)", "var(--accent)", "var(--success)", "var(--success)"];

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { signup, isDemo } = useAuth();
  const { t, isUrdu } = useLanguage();
  const router = useRouter();

  const strength = useMemo(() => scorePassword(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;

    const nextErrors = {};
    if (name.trim().length < 2) nextErrors.name = t("errNameLength");
    if (!EMAIL_RE.test(email.trim())) nextErrors.email = t("errEmail");
    if (password.length < MIN_PASSWORD) {
      nextErrors.password = t("errPasswordShort", { n: MIN_PASSWORD });
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setError("");
    const result = await signup({ name: name.trim(), email: email.trim(), password });
    setBusy(false);

    if (result.ok) {
      router.replace("/home");
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthShell panelTitle={t("signupPanelTitle")} panelBody={t("signupPanelBody")}>
      <span className="chip chip-accent">{t("freeAccount")}</span>

      <h1 className={`text-[2rem] leading-tight font-extrabold mt-4 ${isUrdu ? "font-urdu" : ""}`}>
        {t("signupTitle")}
      </h1>
      <p className={`text-sm text-ink-soft mt-2 ${isUrdu ? "font-urdu" : ""}`}>
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          {t("login")}
        </Link>
      </p>

      {isDemo && (
        <p className={`mt-4 rounded-xl bg-brand-soft border border-brand/20 px-4 py-3 text-sm font-semibold text-brand ${
          isUrdu ? "font-urdu" : ""
        }`}>
          {t("signupKeepsProgress")}
        </p>
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
          id="name"
          label={t("name")}
          value={name}
          onChange={setName}
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          icon={User}
          error={errors.name}
        />

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
          autoComplete="new-password"
          error={errors.password}
        />

        {/* Strength meter — advisory; the server enforces the real minimum. */}
        <div className="-mt-2">
          <div className="flex gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{
                  background: i < strength ? STRENGTH_COLORS[strength] : "var(--line)",
                }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] font-bold" style={{ color: strength ? STRENGTH_COLORS[strength] : "var(--ink-soft)" }}>
            {password ? t(STRENGTH_KEYS[strength]) : t("createPassword")}
          </p>
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-ink-soft">
          {[
            { ok: password.length >= MIN_PASSWORD, label: t("reqChars", { n: MIN_PASSWORD }) },
            { ok: /\d/.test(password), label: t("reqNumber") },
            { ok: /[^\w\s]/.test(password), label: t("reqSymbol") },
          ].map((rule) => (
            <li key={rule.label} className="flex items-center gap-1.5" style={{ color: rule.ok ? "var(--success)" : undefined }}>
              <Check size={13} strokeWidth={3} className={rule.ok ? "opacity-100" : "opacity-30"} />
              {rule.label}
            </li>
          ))}
        </ul>

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
              {t("signupTitle")}
              <ArrowRight size={17} />
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}
