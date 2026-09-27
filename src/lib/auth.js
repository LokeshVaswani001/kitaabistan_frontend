import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { execute, get } from "./db";

const scrypt = promisify(scryptCb);

export const SESSION_COOKIE = "kitaabistan_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SCRYPT_OPTS = { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 256 * 1024 * 1024 };

/* ------------------------------------------------------------------ hashing */

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LEN, SCRYPT_OPTS);
  return ["scrypt", SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString("base64"), derived.toString("base64")].join("$");
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "scrypt" || !hashB64) return false;
    const expected = Buffer.from(hashB64, "base64");
    const derived = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 256 * 1024 * 1024,
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/* ----------------------------------------------------------------- sessions */

/** Regular 30-day login session for a registered account. */
export function createSession(userId) {
  return insertSession({ userId, kind: "member", ttlMs: SESSION_TTL_MS });
}

/** Short-lived timed demo session (no account required). */
export function createDemoSession(minutes) {
  return insertSession({ userId: null, kind: "demo", durationMinutes: minutes, ttlMs: minutes * 60 * 1000 });
}

function insertSession({ userId, kind, durationMinutes = null, ttlMs }) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  execute(
    "INSERT INTO sessions (token, user_id, kind, duration_minutes, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
    token,
    userId,
    kind,
    durationMinutes,
    now,
    now + ttlMs
  );
  return token;
}

/**
 * Resolve a session token to its session, or null when missing/expired.
 * Returns `{ type: "member", id, name, email }` or
 * `{ type: "demo", expiresAt, durationMinutes }`.
 */
export function readSession(token) {
  if (!token) return null;

  const row = get("SELECT * FROM sessions WHERE token = ? LIMIT 1", token);
  if (!row) return null;

  if (row.expires_at < Date.now()) {
    destroySession(token);
    return null;
  }

  if (row.kind === "demo") {
    return { type: "demo", expiresAt: row.expires_at, durationMinutes: row.duration_minutes };
  }

  const user = get("SELECT id, name, email FROM users WHERE id = ?", row.user_id);
  if (!user) {
    destroySession(token);
    return null;
  }
  return { type: "member", id: user.id, name: user.name, email: user.email };
}

export function destroySession(token) {
  if (token) execute("DELETE FROM sessions WHERE token = ?", token);
}

export function destroyAllSessions(userId) {
  execute("DELETE FROM sessions WHERE user_id = ?", userId);
}

/* --------------------------------------------------------------- cookie API */

/**
 * The session cookie is httpOnly, so <proxy> cannot see whether it belongs to
 * a real account or a guest/demo session without touching the database (on
 * Vercel the middleware has its own /tmp, so the SQLite row is invisible).
 * A second, tiny cookie carries that kind so the gate stays instant.
 */
const KIND_COOKIE = "kitaabistan_kind";

async function writeCookie(token, maxAge, kind) {
  const jar = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
  jar.set(SESSION_COOKIE, token, options);
  jar.set(KIND_COOKIE, kind, options);
}

export async function setSessionCookie(token) {
  await writeCookie(token, SESSION_TTL_MS / 1000, "member");
}

export async function setDemoSessionCookie(token, minutes) {
  await writeCookie(token, minutes * 60, "demo");
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(KIND_COOKIE);
}

export async function getSessionToken() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

/** Convenience for route handlers: the current session, or null. */
export async function getCurrentSession() {
  return readSession(await getSessionToken());
}
