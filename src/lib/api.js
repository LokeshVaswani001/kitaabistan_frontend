/** Shared request/response helpers for the API routes. */

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

export function fail(error, status = 400, extra = {}) {
  return json({ ok: false, error, ...extra }, status);
}

export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return null;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSignup({ name, email, password }) {
  const n = String(name ?? "").trim();
  const e = String(email ?? "").trim().toLowerCase();
  const p = String(password ?? "");

  if (n.length < 2) return { error: "Please enter your name (at least 2 characters)." };
  if (n.length > 60) return { error: "Name must be 60 characters or fewer." };
  if (!EMAIL_RE.test(e)) return { error: "Please enter a valid email address." };
  if (e.length > 254) return { error: "Email address is too long." };
  if (p.length < 8) return { error: "Password must be at least 8 characters." };
  if (p.length > 128) return { error: "Password must be 128 characters or fewer." };

  return { name: n, email: e, password: p };
}

export function validateLogin({ email, password }) {
  const e = String(email ?? "").trim().toLowerCase();
  const p = String(password ?? "");
  if (!EMAIL_RE.test(e)) return { error: "Please enter a valid email address." };
  if (!p) return { error: "Please enter your password." };
  return { email: e, password: p };
}

/** Never leak hashes or ids of other users to the client. */
export function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}
