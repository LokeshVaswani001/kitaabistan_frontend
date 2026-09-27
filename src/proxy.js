import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth";

/**
 * Next.js 16 calls this file `proxy` (formerly `middleware`).
 *
 * Only flips real *members* away from the auth screens. Missing sessions and
 * guest/demo sessions are NOT bounced: <AppShell> starts a demo session
 * instead, so library, chatbot and books open without a login — and the
 * header's "Log in" / "Sign up" buttons still reach these pages.
 */

const AUTH_PAGES = ["/login", "/signup", "/demo"];

function matches(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request) {
  const { pathname } = new URL(request.url);
  const token = request.cookies.get("kitaabistan_session")?.value;
  const kind = request.cookies.get("kitaabistan_kind")?.value;

  // The kind cookie is written by the same API that writes the session
  // cookie. Without it we fall back to the database (local) or assume guest
  // (Vercel: the middleware cannot see the SQLite rows in /tmp).
  const isMember = kind
    ? kind === "member"
    : process.env.VERCEL
      ? false
      : readSession(token)?.type === "member";

  if (matches(pathname, AUTH_PAGES) && isMember) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/demo"],
};
