import { get } from "@/lib/db";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit, clearRateLimit } from "@/lib/rateLimit";
import { readJson, validateLogin, publicUser, json, fail } from "@/lib/api";

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const body = await readJson(request);
  if (body === null) return fail("Invalid JSON body.");

  const parsed = validateLogin(body);
  if (parsed.error) return fail(parsed.error);

  const limited = rateLimit(`login:${parsed.email}:${ip}`);
  if (!limited.ok) {
    return fail("Too many attempts. Please wait a few minutes and try again.", 429, {
      retryAfterMs: limited.retryAfterMs,
    });
  }

  const row = get(
    "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    parsed.email
  );

  // Same message + comparable work whether the account exists or not,
  // so the endpoint can't be used to enumerate registered emails.
  const valid = await verifyPassword(parsed.password, row?.password_hash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==");
  if (!row || !valid) return fail("Incorrect email or password.", 401);

  clearRateLimit(`login:${parsed.email}:${ip}`);
  await setSessionCookie(
    createSession(row.id)
  );

  return json({
    ok: true,
    user: publicUser({ id: row.id, name: row.name, email: row.email }),
  });
}
