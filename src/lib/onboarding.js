export const ONBOARDED_KEY = "kitaabistan_onboarded";
export const STARTER_PACK_KEY = "kitaabistan_starter_pack_downloaded";

export function isOnboarded() {
  if (typeof window === "undefined") return true; // avoid SSR flash-redirect
  return window.localStorage.getItem(ONBOARDED_KEY) === "1";
}

export function markOnboarded() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDED_KEY, "1");
  window.localStorage.setItem(STARTER_PACK_KEY, "1");
}

export function isStarterPackDownloaded() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(STARTER_PACK_KEY) === "1";
}
