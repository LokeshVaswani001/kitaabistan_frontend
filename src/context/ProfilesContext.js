"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PROFILES_KEY = "kitaabistan_profiles";
const ACTIVE_PROFILE_KEY = "kitaabistan_active_profile";

const DEFAULT_PROFILE = () => ({
  id: "default",
  name: "Me",
  ageBand: "all", // "child" (8-12) | "teen" (13-18) | "all" (adult/unspecified)
  kidsMode: false,
  color: "#5A7A6E",
});

/* Earlier avatar colours were too light to carry a white initial (below
   4.5:1). Saved profiles are mapped onto the darker replacements. */
const LEGACY_COLORS = {
  "#6E8E80": "#5A7A6E",
  "#C79A3B": "#8F6A1F",
  "#8B6FC9": "#7A5EB8",
  "#4FB0C6": "#2F7E91",
  "#F17456": "#B84A33",
};

function normalize(list) {
  return list.map((p) => (p && LEGACY_COLORS[p.color] ? { ...p, color: LEGACY_COLORS[p.color] } : p));
}

function readProfiles() {
  if (typeof window === "undefined") return [DEFAULT_PROFILE()];
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalize(parsed && parsed.length ? parsed : [DEFAULT_PROFILE()]);
  } catch {
    return [DEFAULT_PROFILE()];
  }
}

const ProfilesContext = createContext(null);

export function ProfilesProvider({ children }) {
  const [profiles, setProfiles] = useState(() => readProfiles());
  const [activeId, setActiveId] = useState(() => {
    if (typeof window === "undefined") return "default";
    const loaded = readProfiles();
    const storedActive = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
    return storedActive && loaded.some((p) => p.id === storedActive) ? storedActive : loaded[0].id;
  });

  useEffect(() => {
    window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    window.localStorage.setItem(ACTIVE_PROFILE_KEY, activeId);
  }, [activeId]);

  const addProfile = ({ name, ageBand, color }) => {
    const id = `p_${Date.now()}`;
    setProfiles((prev) => [...prev, { id, name, ageBand, kidsMode: ageBand === "child", color }]);
    setActiveId(id);
  };

  const removeProfile = (id) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length ? next : [DEFAULT_PROFILE()];
    });
    setActiveId((curr) => (curr === id ? "default" : curr));
  };

  const toggleKidsMode = (id) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, kidsMode: !p.kidsMode } : p)));
  };

  const updateProfile = (id, patch) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const activeProfile = useMemo(
    () => profiles.find((p) => p.id === activeId) || profiles[0] || DEFAULT_PROFILE(),
    [profiles, activeId]
  );

  const value = useMemo(
    () => ({
      profiles,
      activeProfile,
      setActiveId,
      addProfile,
      removeProfile,
      toggleKidsMode,
      updateProfile,
    }),
    [profiles, activeProfile]
  );

  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfiles() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error("useProfiles must be used inside <ProfilesProvider>");
  return ctx;
}
