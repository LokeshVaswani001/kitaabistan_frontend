"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Auth state backed by real API routes + an httpOnly session cookie.
 *
 * The context shape is intentionally identical to the old localStorage
 * implementation, so every page that already consumes `useAuth()` keeps
 * working unchanged.
 *
 *   session: { type: "member", id, name, email }
 *          | { type: "demo", expiresAt, durationMinutes }
 *          | null
 */

const AuthContext = createContext(null);

async function callApi(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, error: "Network error — please check your connection." };
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.error || "Something went wrong." };
  }
  return { ok: true, status: res.status, data };
}

function toSession(data) {
  if (!data) return null;
  if (data.demo) {
    return { type: "demo", expiresAt: data.demo.expiresAt, durationMinutes: data.demo.durationMinutes };
  }
  if (data.user) {
    return { type: "member", id: data.user.id, name: data.user.name, email: data.user.email };
  }
  return null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [demoRemaining, setDemoRemaining] = useState(null);
  const [demoJustExpired, setDemoJustExpired] = useState(false);

  // Loaded post-mount so server and first client paint agree, keeping the
  // auth-gated screens hydration-safe. The `then` callback is asynchronous,
  // which is exactly what React wants from an effect.
  useEffect(() => {
    let cancelled = false;
    callApi("/api/auth/me").then((res) => {
      if (cancelled) return;
      setSession(res.ok ? toSession(res.data) : null);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live countdown for timed demo sessions. The tick only ever runs from a
  // timer callback, so `remainingMs` below is derived rather than synced.
  useEffect(() => {
    if (session?.type !== "demo") return;

    const tick = () => {
      const ms = session.expiresAt - Date.now();
      if (ms <= 0) {
        setDemoRemaining(0);
        setSession(null);
        setDemoJustExpired(true);
        callApi("/api/auth/logout", { method: "POST" });
      } else {
        setDemoRemaining(ms);
      }
    };

    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [session]);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await callApi("/api/auth/signup", {
      method: "POST",
      body: { name, email, password },
    });
    if (!res.ok) return { ok: false, error: res.error };
    setSession(toSession(res.data));
    setDemoJustExpired(false);
    return { ok: true };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await callApi("/api/auth/login", { method: "POST", body: { email, password } });
    if (!res.ok) return { ok: false, error: res.error };
    setSession(toSession(res.data));
    setDemoJustExpired(false);
    return { ok: true };
  }, []);

  const startDemo = useCallback(async (minutes) => {
    const res = await callApi("/api/auth/demo", { method: "POST", body: { minutes } });
    if (!res.ok) return { ok: false, error: res.error };
    setSession(toSession(res.data));
    setDemoJustExpired(false);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await callApi("/api/auth/logout", { method: "POST" });
    setSession(null);
  }, []);

  const refresh = useCallback(async () => {
    const res = await callApi("/api/auth/me");
    setSession(res.ok ? toSession(res.data) : null);
  }, []);

  // Derived, never synced: null unless a demo session is actually running.
  const remainingMs = session?.type === "demo" ? demoRemaining : null;

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
      refresh,
    }),
    [ready, session, remainingMs, demoJustExpired, startDemo, signup, login, logout, refresh]
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
