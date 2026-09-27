import { getCurrentSession } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return json({ ok: false, user: null, demo: null }, 401);

  if (session.type === "demo") {
    return json({
      ok: true,
      user: null,
      demo: { expiresAt: session.expiresAt, durationMinutes: session.durationMinutes },
    });
  }

  return json({
    ok: true,
    user: { id: session.id, name: session.name, email: session.email },
    demo: null,
  });
}
