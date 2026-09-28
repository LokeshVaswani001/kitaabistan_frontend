"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Library, MessageCircle, Bookmark, User, WifiOff, BookPlus } from "lucide-react";
import { useAuth, formatRemaining } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Footer from "@/components/Footer";

function useTabs(t) {
  return [
    { href: "/home", label: t("navHome"), icon: Home },
    { href: "/library", label: t("navLibrary"), icon: Library },
    { href: "/import", label: t("navImport"), icon: BookPlus },
    { href: "/chatbot", label: t("navChatbot"), icon: MessageCircle },
    { href: "/saved", label: t("navSaved"), icon: Bookmark },
    { href: "/profile", label: t("navProfile"), icon: User },
  ];
}

// Reflects the blueprint's core promise back to the reader in real time:
// when the device actually goes offline, the app doesn't panic or block —
// it just says so, calmly, because everything downloaded still works.
function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return online;
}

/**
 * Wrap any protected page with <AppShell>. It:
 *  - starts a guest/demo session when there is none, so no page ever
 *    bounces the reader to the login screen (accounts are optional)
 *  - shows a live countdown banner while a demo session is active
 *  - shows a calm "you're offline" banner when the device has no
 *    connection, reinforcing that downloaded content still works
 *  - renders a bottom tab bar (mobile) and a top nav (desktop/web)
 *  - exposes the Urdu/English toggle everywhere
 */
export default function AppShell({ children }) {
  const { ready, isAuthenticated, isMember, isDemo, session, remainingMs, startDemo, logout } = useAuth();
  const { t, isUrdu } = useLanguage();
  const online = useOnlineStatus();
  const router = useRouter();
  const pathname = usePathname();
  const TABS = useTabs(t);
  const [autoStarted, setAutoStarted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready || isAuthenticated || autoStarted) return;
    setAutoStarted(true);
    startDemo(60).then((res) => {
      if (!res.ok) router.replace("/login?reason=session");
    });
  }, [ready, isAuthenticated, autoStarted, startDemo, router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (!ready || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-sm text-[var(--ink-soft)]"
        >
          {t("appName")}…
        </motion.div>
      </div>
    );
  }

  const urgentDemo = isDemo && remainingMs != null && remainingMs < 60_000;

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col">
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              backgroundColor: urgentDemo ? "#E7736A" : "var(--sun)",
            }}
            exit={{ height: 0, opacity: 0 }}
            className="text-sm font-bold text-center py-2 px-4 overflow-hidden"
            style={{ color: urgentDemo ? "#fff" : "#26210A" }}
          >
            <motion.span
              animate={urgentDemo ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block"
            >
              {t("demoRemaining", { time: formatRemaining(remainingMs) })}
            </motion.span>{" "}
            ·{" "}
            <Link href="/signup" className="underline">
              {t("signupToKeep")}
            </Link>
          </motion.div>
        )}

        {!online && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`flex items-center justify-center gap-2 text-xs font-bold text-center py-2 px-4 overflow-hidden bg-[var(--sage-deep)] text-[#F7F1E1] ${
              isUrdu ? "font-urdu" : ""
            }`}
          >
            <WifiOff size={13} />
            {t("offlineBanner")}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar — logo + language toggle everywhere, nav links on md+ */}
      <header className="flex items-center justify-between px-5 md:px-10 py-4 md:py-5 border-b border-[var(--line)]">
        <Link href="/home" className="font-extrabold text-lg tracking-tight">
          {t("appName")}
        </Link>

        <nav className="hidden md:flex gap-6 lg:gap-8 text-sm font-semibold text-[var(--ink-soft)]">
          {TABS.slice(0, 5).map((tab) => {
            const active = pathname.startsWith(tab.href.split("?")[0]);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative transition-colors ${active ? "text-[var(--ink)]" : "hover:text-[var(--ink)]"}`}
              >
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-[var(--brand)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />
          <Link
            href="/profile"
            className="hidden md:inline-block max-w-[9rem] truncate text-xs font-bold border border-[var(--line)] rounded-full px-4 py-2 hover:border-[var(--brand)] transition-colors"
            title={session?.name}
          >
            {isMember && session?.name ? session.name : t("navProfile")}
          </Link>
          {isMember ? (
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:inline-flex items-center text-xs font-bold bg-[var(--ink)] text-[var(--paper)] rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
            >
              {t("logout")}
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-block text-xs font-bold border border-[var(--line)] rounded-full px-4 py-2 hover:border-[var(--brand)] transition-colors"
              >
                {t("login")}
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-block text-xs font-bold bg-[var(--brand)] text-[var(--on-brand)] rounded-full px-4 py-2 hover:opacity-90 transition-opacity"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`flex-1 md:pb-10 ${pathname.startsWith("/book/") ? "pb-24" : ""}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Reader pages stay immersive; every other page gets the site footer. */}
      {!pathname.startsWith("/book/") && <Footer app />}

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--panel)] border-t border-[var(--line)] flex pt-2 pb-3 z-20">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href.split("?")[0]);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 text-[10px] font-bold"
              style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}
            >
              <motion.span whileTap={{ scale: 0.85 }}>
                <Icon size={20} strokeWidth={2.2} />
              </motion.span>
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
