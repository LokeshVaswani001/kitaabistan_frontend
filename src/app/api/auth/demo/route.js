import { createDemoSession, setDemoSessionCookie } from "@/lib/auth";
import { readJson, json, fail } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";

const ALLOWED = [5, 15, 30, 60];

export async function POST(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  const limited = rateLimit(`demo:${ip}`);
  if (!limited.ok) return fail("Too many attempts. Please try again later.", 429);

  const body = await readJson(request);
  if (body === null) return fail("Invalid JSON body.");

  const minutes = Number(body?.minutes);
  if (!ALLOWED.includes(minutes)) {
    return fail(`Duration must be one of: ${ALLOWED.join(", ")} minutes.`);
  }

  await setDemoSessionCookie(createDemoSession(minutes), minutes);
  return json({ ok: true, demo: { durationMinutes: minutes, expiresAt: Date.now() + minutes * 60_000 } }, 201);
}
