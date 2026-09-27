const fs = require("node:fs");
const path = require("node:path");

const API = "https://ur.wikisource.org/w/api.php";
const OUT = "public/books";
const COVERS = "public/covers";
const HEADERS = {
  "User-Agent": "KitaabistanLibraryBuilder/1.0 (offline reading app build script)",
};

const BOOKS = [
  { slug: "bagh-o-bahar", term: "باغ و بہار", cap: 40 },
  { slug: "fasana-e-azad", term: "فسانہ آزاد", cap: 40 },
  { slug: "mirat-ul-aroos", term: "مرآۃ العروس", cap: 40 },
  { slug: "diwan-e-ghalib", term: "دیوان غالب", cap: 34 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt > 0) await sleep(4000 * attempt);
    else await sleep(1400);
    const res = await fetch(url, { headers: HEADERS });
    if (res.status === 429 || res.status === 503) continue;
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`rate-limited: ${url}`);
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#91;/g, "[")
    .replace(/&#93;/g, "]")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function resolveTitle(term) {
  const data = await api({
    action: "query",
    list: "search",
    srsearch: term,
    srlimit: "10",
    srnamespace: "0",
  });
  const hits = data.query?.search || [];
  const exact = hits.find((h) => h.title === term);
  if (exact) return exact.title;

  for (const hit of hits) {
    const parent = hit.title.includes("/") ? hit.title.split("/")[0] : hit.title;
    if (parent !== term) continue;
    const all = await api({ action: "query", list: "allpages", appprefix: `${parent}/`, aplimit: "100" });
    if ((all.query?.allpages || []).length >= 2) return parent;
    return parent;
  }

  const fallback = hits.find((h) => h.title.includes("/"))?.title;
  if (fallback) return fallback.split("/")[0];
  return hits[0]?.title || term;
}

async function wikitext(title) {
  const data = await api({
    action: "query",
    prop: "revisions",
    rvslots: "main",
    rvprop: "content",
    titles: title,
  });
  return data.query?.pages?.[0]?.revisions?.[0]?.slots?.main?.content || "";
}

async function rendered(title) {
  await sleep(650);
  const data = await api({ action: "parse", page: title, prop: "text", disablespecsection: "1" });
  const html = data.parse?.text;
  if (!html) return "";
  return stripHtml(html);
}

async function coverFor(title, slug) {
  try {
    const data = await api({ action: "query", prop: "pageimages", piprop: "original", titles: title });
    const original = data.query?.pages?.[0]?.original?.source;
    if (!original) return "none";
    const res = await fetch(original, { headers: HEADERS });
    if (!res.ok) return `http:${res.status}`;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2500) return "tiny";
    const ext = original.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
    fs.writeFileSync(path.join(COVERS, `${slug}${ext}`), buf);
    return `${slug}${ext} (${buf.length}b)`;
  } catch (err) {
    return `err:${err.message}`;
  }
}

async function build({ slug, term, cap }) {
  const title = await resolveTitle(term);
  const mainWiki = await wikitext(title);

  const linkRe = /\[\[\s*([^\]|#]+)(?:[|#][^\]]*)?\s*\]\]/g;
  const ordered = [];
  let m;
  while ((m = linkRe.exec(mainWiki))) {
    const target = m[1].trim();
    if (target.startsWith(`${title}/`) && !ordered.includes(target)) ordered.push(target);
  }

  const all = await api({ action: "query", list: "allpages", apprefix: `${title}/`, aplimit: "100" });
  const known = (all.query?.allpages || []).map((p) => p.title);
  for (const page of known) if (!ordered.includes(page)) ordered.push(page);

  const pages = [title, ...ordered].slice(0, cap + 1);
  const parts = [];
  for (const page of pages) {
    const text = await rendered(page);
    if (!text) continue;
    if (page === title && ordered.length > 0 && text.length < 1200) continue;
    parts.push(page === title ? text : `### ${page.split("/").slice(1).join("/")}\n\n${text}`);
  }

  const full = parts.join("\n\n");
  fs.writeFileSync(path.join(OUT, `${slug}.txt`), `# ${title}\n\n${full}`, "utf8");
  const cover = await coverFor(title, slug);
  console.log(`${slug} <- "${title}" pages=${pages.length} chars=${full.length} cover=${cover}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(COVERS, { recursive: true });
  for (const book of BOOKS) {
    try {
      await build(book);
    } catch (err) {
      console.log(`${book.slug}: ERROR ${err.message}`);
    }
    await sleep(900);
  }
})();
