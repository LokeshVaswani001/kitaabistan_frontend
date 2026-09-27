import { randomUUID } from "node:crypto";
import { execute, get } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { readJson, validateSignup, publicUser, json, fail } from "@/lib/api";

export async function POST(request) {
  const limited = rateLimit(`signup:${request.headers.get("x-forwarded-for") || "local"}`);
  if (!limited.ok) return fail("Too many attempts. Please try again later.", 429);

  const body = await readJson(request);
  if (body === null) return fail("Invalid JSON body.");

  const parsed = validateSignup(body);
  if (parsed.error) return fail(parsed.error);

  const existing = get("SELECT id FROM users WHERE email = ? LIMIT 1", parsed.email);
  if (existing) return fail("An account with this email already exists.", 409);

  const user = {
    id: randomUUID(),
    name: parsed.name,
    email: parsed.email,
    created_at: Date.now(),
  };

  const passwordHash = await hashPassword(parsed.password);

  try {
    execute(
      "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      user.id,
      user.name,
      user.email,
      passwordHash,
      user.created_at
    );
  } catch {
    // UNIQUE(email) race — two submits landed at the same moment.
    return fail("An account with this email already exists.", 409);
  }

  await setSessionCookie(createSession(user.id));
  return json({ ok: true, user: publicUser(user) }, 201);
}
