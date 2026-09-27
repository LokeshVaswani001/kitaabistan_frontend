import { destroySession, getSessionToken, clearSessionCookie } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST() {
  const token = await getSessionToken();
  if (token) destroySession(token);
  await clearSessionCookie();
  return json({ ok: true });
}
