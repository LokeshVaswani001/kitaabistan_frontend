import { NextResponse } from "next/server";
import {
  sniffBytes,
  extractPdfText,
  extractDocxText,
} from "@/lib/extractors";

// Server-side fetch proxy so users can import a book from any URL without
// hitting CORS. Blocks private/local addresses (basic SSRF guard).

const MAX_BYTES = 8 * 1024 * 1024;

function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  if (["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(h)) return true;
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function fail(error, status) {
  return NextResponse.json({ error }, { status });
}

// Project Gutenberg files open with a boilerplate header line like
// "The Project Gutenberg eBook of Pride and Prejudice, by Jane Austen".
function cleanGutenbergTitle(raw) {
  if (!raw) return "";
  const before = raw.replace(/\s+/g, " ").trim();
  const after = before
    .replace(/^(?:the\s+)?project gutenberg(?:'s)?\s*(?:ebook|e-book|etext)?\s*(?:of)?\s*/i, "")
    .trim()
    .replace(/^[\s,]+/, "");
  const stripped = after !== before;
  const title = (stripped ? after.replace(/[\s,]+by\s+.+$/i, "") : after).trim();
  if (!title) return "";
  if (/^\*{3}|project gutenberg|produced by|transcriber/i.test(title)) return "";
  return title.slice(0, 160);
}

function titleFromPlainText(text) {
  const head = text.slice(0, 8000);
  const meta = head.match(/^\s*Title:\s*(.+)$/m);
  if (meta) {
    const t = meta[1].replace(/\s+/g, " ").trim();
    if (t && !/^project gutenberg/i.test(t)) return t.slice(0, 160);
  }
  for (const line of head.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length < 4) continue;
    const cleaned = cleanGutenbergTitle(trimmed);
    if (cleaned) return cleaned;
  }
  return "";
}

export async function GET(request) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return fail("no-url", 400);

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return fail("bad-url", 400);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return fail("bad-url", 400);
  if (isBlockedHost(parsed.hostname)) return fail("blocked-host", 400);

  try {
    const res = await fetch(parsed.href, {
      headers: { "user-agent": "KitaabistanLibraryBuilder/1.0 (book import)" },
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return fail(`http-${res.status}`, 502);

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) return fail("too-large", 413);

    const kind = sniffBytes(buf);

    if (kind === "doc") return fail("doc-unsupported", 415);

    if (kind === "pdf" || kind === "zip") {
      const name = decodeURIComponent(parsed.pathname.split("/").pop() || "");
      try {
        const parsedDoc =
          kind === "pdf"
            ? await extractPdfText(buf, name)
            : await extractDocxText(buf, name);
        if (parsedDoc.text.trim().length < 120) return fail("empty-content", 422);
        const suggested = cleanGutenbergTitle(parsedDoc.title) || parsedDoc.title || "Imported book";
        return NextResponse.json({ text: parsedDoc.text, suggestedTitle: suggested.slice(0, 160) });
      } catch (err) {
        console.error("[fetch-book] extract failed:", err);
        return fail(kind === "pdf" ? "pdf-failed" : "docx-failed", 422);
      }
    }

    const ctype = (res.headers.get("content-type") || "").toLowerCase();
    let text = buf.toString("utf8");
    let suggested = "";

    if (ctype.includes("html") || /^\s*<(!doctype|html)/i.test(text) || kind === "html") {
      const titleMatch = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) suggested = cleanGutenbergTitle(titleMatch[1]) || titleMatch[1].replace(/\s+/g, " ").trim();
      text = stripHtml(text);
    }

    if (text.trim().length < 120) return fail("empty-content", 422);

    if (!suggested) suggested = titleFromPlainText(text);
    if (!suggested) suggested = "Imported book";
    suggested = suggested.slice(0, 160);

    return NextResponse.json({ text, suggestedTitle: suggested });
  } catch (err) {
    const message = err?.name === "TimeoutError" ? "timeout" : "fetch-failed";
    return fail(message, 502);
  }
}
