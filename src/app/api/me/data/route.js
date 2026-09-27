import { getCurrentSession } from "@/lib/auth";
import { all, execute, upsertUserData } from "@/lib/db";
import { readJson, json, fail } from "@/lib/api";

/** Only these keys are allowed to round-trip — nothing else reaches storage. */
const ALLOWED_KEYS = new Set(["bookmarks", "progress", "streak", "profiles", "downloads", "prefs"]);
const MAX_VALUE_BYTES = 64 * 1024;

async function requireAccount() {
  const session = await getCurrentSession();
  if (!session || session.type !== "member") return null;
  return session;
}

export async function GET() {
  const user = await requireAccount();
  if (!user) return json({ ok: false, error: "Not signed in." }, 401);

  const rows = all("SELECT key, value, updated_at FROM user_data WHERE user_id = ?", user.id);
  const data = {};
  for (const row of rows) {
    try {
      data[row.key] = { value: JSON.parse(row.value), updatedAt: row.updated_at };
    } catch {
      /* skip unreadable row */
    }
  }
  return json({ ok: true, data });
}

export async function PATCH(request) {
  const user = await requireAccount();
  if (!user) return json({ ok: false, error: "Not signed in." }, 401);

  const body = await readJson(request);
  if (body === null) return fail("Invalid JSON body.");
  const incoming = body?.data;
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    return fail("`data` must be an object.");
  }

  const entries = Object.entries(incoming);
  if (entries.length > 50) return fail("Too many keys in one request.", 413);

  for (const [key, entry] of entries) {
    if (!ALLOWED_KEYS.has(key)) return fail(`Unknown key: ${key}`, 400);
    if (!entry || typeof entry !== "object") return fail(`\`${key}\` must be { value, updatedAt }.`);

    const serialized = JSON.stringify(entry.value ?? null);
    if (Buffer.byteLength(serialized, "utf8") > MAX_VALUE_BYTES) {
      return fail(`\`${key}\` is too large.`, 413);
    }

    const updatedAt = Number.isFinite(entry.updatedAt) ? entry.updatedAt : Date.now();
    upsertUserData(user.id, key, serialized, updatedAt);
  }

  return json({ ok: true, updatedAt: Date.now() });
}

export async function DELETE(request) {
  const user = await requireAccount();
  if (!user) return json({ ok: false, error: "Not signed in." }, 401);

  const body = await readJson(request);
  if (!ALLOWED_KEYS.has(body?.key)) return fail("Unknown key.", 400);
  execute("DELETE FROM user_data WHERE user_id = ? AND key = ?", user.id, body.key);
  return json({ ok: true });
}
