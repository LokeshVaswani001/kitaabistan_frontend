"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Frontend-only auth/demo layer.
 *
 * NOTE: This stores a "registered users" list and the current session in
 * localStorage purely so the frontend is fully demonstrable without a
 * backend. When a real backend/API is ready, replace the functions below
 * (signup/login/logout/startDemo) with real API calls and keep the same
 * context shape so components don't need to change.
 *
 * Session shape stored under SESSION_KEY:
 *   { type: "demo", expiresAt: <timestamp ms> }
 *   { type: "member", name, email }
 */

const SESSION_KEY = "kitaabistan_session";
const USERS_KEY = "kitaabistan_users"; // fake local "database" of signed-up users

const AuthContext = createContext(null);

function readSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  if (typeof window === "undefined") return;
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
}

function readUsers() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);
  const [demoJustExpired, setDemoJustExpired] = useState(false);
  const [ready, setReady] = useState(false);

  // Intentionally loaded post-mount (not via a lazy useState initializer):
  // "ready" stays false on both the server render and the client's first
  // paint, so AppShell shows the same "Loading" state on both and only
  // swaps in the real session client-side, avoiding a hydration mismatch
  // on the auth-gated screens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Tick the demo countdown. This effect subscribes to an external timer
  // (setInterval) and resets/updates remainingMs as session changes —
  // a legitimate effect, not a plain state sync.
  useEffect(() => {
    if (!session || session.type !== "demo") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemainingMs(null);
      return;
    }

    const tick = () => {
      const ms = session.expiresAt - Date.now();
      if (ms <= 0) {
        setRemainingMs(0);
        setSession(null);
        writeSession(null);
        setDemoJustExpired(true);
      } else {
        setRemainingMs(ms);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const startDemo = useCallback((minutes) => {
    const newSession = {
      type: "demo",
      expiresAt: Date.now() + minutes * 60 * 1000,
      durationMinutes: minutes,
    };
    writeSession(newSession);
    setSession(newSession);
    setDemoJustExpired(false);
  }, []);

  const signup = useCallback(({ name, email, password }) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const newUser = { name, email, password }; // demo only — never store plain passwords in production
    writeUsers([...users, newUser]);
    const newSession = { type: "member", name, email };
    writeSession(newSession);
    setSession(newSession);
    setDemoJustExpired(false);
    return { ok: true };
  }, []);

  const login = useCallback(({ email, password }) => {
    const users = readUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      return { ok: false, error: "Incorrect email or password." };
    }
    const newSession = { type: "member", name: user.name, email: user.email };
    writeSession(newSession);
    setSession(newSession);
    setDemoJustExpired(false);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      session,
      isDemo: session?.type === "demo",
      isMember: session?.type === "member",
      isAuthenticated: !!session,
      remainingMs,
      demoJustExpired,
      clearDemoExpiredFlag: () => setDemoJustExpired(false),
      startDemo,
      signup,
      login,
      logout,
    }),
    [ready, session, remainingMs, demoJustExpired, startDemo, signup, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function formatRemaining(ms) {
  if (ms == null) return "";
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
