// Downloads REAL public-domain books into public/books + public/covers.
// Sources: Project Gutenberg (English), Urdu/English Wikisource (Urdu & poems).
// Run: node scripts/fetch-real-books.cjs
const fs = require("node:fs");
const path = require("node:path");

const BOOKS_DIR = "public/books";
const COVER_DIR = "public/covers";
const UA = "KitaabistanLibraryBuilder/1.0 (offline reading app build script)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, opts = {}) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, ...(opts.headers || {}) },
        redirect: "follow",
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(2500 * (attempt + 1));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr;
}

// ---------------------------------------------------------------- Project Gutenberg

async function searchPg(query) {
  const res = await get(`https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const html = await res.text();
  return [...new Set([...html.matchAll(/\/ebooks\/(\d+)/g)].map((m) => m[1]))].slice(0, 6);
}

function looksRight(text, spec) {
  // Verify against the Project Gutenberg header line (the book's title line)
  // so a keyword appearing somewhere inside an unrelated book can't match.
  const firstLines = text.slice(0, 1500).split("\n");
  const headerLine = firstLines.find((l) => /project gutenberg ebook of/i.test(l)) || firstLines[0] || "";
  const head = headerLine.toLowerCase();
  const andOk = (spec.verify || []).every((v) => head.includes(v.toLowerCase()));
  const anyOk = !spec.any || spec.any.some((v) => head.includes(v.toLowerCase()));
  return andOk && anyOk;
}

const isComplete = (text) => /\*{3}\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i.test(text);

async function saveCover(buffer, slug) {
  if (!buffer || buffer.length < 2500) return "none";
  fs.writeFileSync(path.join(COVER_DIR, `${slug}.jpg`), buffer);
  return `${buffer.length}b`;
}

async function gutenbergCover(id, slug) {
  for (const name of [`pg${id}.cover.medium.jpg`, `pg${id}.cover.large.jpg`]) {
    try {
      const res = await get(`https://www.gutenberg.org/cache/epub/${id}/${name}`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const out = await saveCover(buf, slug);
        if (out !== "none") return out;
      }
    } catch { /* try next */ }
    await sleep(300);
  }
  return "none";
}

async function wikiCover(apiHost, title, slug) {
  try {
    const base = /^https?:\/\//.test(apiHost) ? apiHost : `https://${apiHost}`;
    const url = `${base}/w/api.php?action=query&prop=pageimages&piprop=original&titles=${encodeURIComponent(title)}&format=json&formatversion=2`;
    const res = await get(url);
    if (!res.ok) return "none";
    const data = await res.json();
    const src = data?.query?.pages?.[0]?.original?.source;
    if (!src) return "none";
    const img = await get(src);
    if (!img.ok) return "http:" + img.status;
    const buf = Buffer.from(await img.arrayBuffer());
    if (buf.length < 2500) return "tiny";
    const ext = src.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
    fs.writeFileSync(path.join(COVER_DIR, `${slug}${ext}`), buf);
    return `${slug}${ext} ${buf.length}b`;
  } catch (err) {
    return "err:" + err.message;
  }
}

async function buildPg(spec) {
  const ids = [...new Set([...(spec.knownId ? [spec.knownId] : []), ...(await searchPg(spec.query || spec.slug))])];
  let chosen = null;
  for (const id of ids) {
    try {
      const res = await get(`https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`);
      if (!res.ok) continue;
      const text = (await res.text()).replace(/\r\n?/g, "\n");
      if (text.length < 20000 || !looksRight(text, spec)) continue;
      chosen = { id, text };
      if (isComplete(text)) break;
    } catch { /* next candidate */ }
    await sleep(700);
  }
  if (!chosen) return { slug: spec.slug, status: "FAILED", ids: ids.join(",") };
  fs.writeFileSync(path.join(BOOKS_DIR, `${spec.slug}.txt`), chosen.text, "utf8");
  let cover = await gutenbergCover(chosen.id, spec.slug);
  if (cover === "none" && spec.wikiTitle) cover = await wikiCover("https://en.wikipedia.org", spec.wikiTitle, spec.slug);
  await sleep(900);
  const header = chosen.text.split("\n").find((l) => l.includes("Project Gutenberg eBook of")) || "";
  return {
    slug: spec.slug,
    status: isComplete(chosen.text) ? "full" : "NO-FOOTER",
    id: chosen.id,
    chars: chosen.text.length,
    cover,
    header: header.replace("The Project Gutenberg eBook of ", "").replace("This eBook of ", "").slice(0, 70),
  };
}

// ---------------------------------------------------------------- Wikisource

const stripHtml = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|pre|br|dd|dt)>/gi, "\n")
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

async function wsApi(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await sleep(3500 * attempt);
    else await sleep(1200);
    const res = await get(url);
    if (res.status === 429 || res.status === 503) continue;
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`rate-limited: ${url}`);
}

async function wsSearch(host, term, limit = 8) {
  const data = await wsApi(host, { action: "query", list: "search", srsearch: term, srlimit: String(limit), srnamespace: "0" });
  return (data.query?.search || []).map((h) => h.title);
}

async function wsRender(host, title) {
  await sleep(700);
  const data = await wsApi(host, { action: "parse", page: title, prop: "text", disablespecsection: "1" });
  const html = data.parse?.text;
  return html ? stripHtml(html) : "";
}

async function buildWs(spec) {
  const host = spec.wiki === "ur" ? "ur.wikisource.org" : "en.wikisource.org";
  const hits = await wsSearch(host, spec.search);
  let title = spec.exact?.find((t) => hits.includes(t)) || hits.find((t) => t === spec.search) || hits[0];
  if (!title) return { slug: spec.slug, status: "FAILED-no page" };
  const text = await wsRender(host, title);
  if (!text || text.length < 200) return { slug: spec.slug, status: "FAILED-empty", title };
  fs.writeFileSync(path.join(BOOKS_DIR, `${spec.slug}.txt`), `# ${title}\n\n${text}\n`, "utf8");
  let cover = "none";
  for (const t of spec.coverTitles || []) {
    const wikiHost = spec.wiki === "ur" ? "ur.wikipedia.org" : "en.wikipedia.org";
    cover = await wsApi(host, { action: "query", prop: "pageimages", piprop: "original", titles: t })
      .then(async (d) => {
        const src = d?.query?.pages?.[0]?.original?.source;
        if (!src) return "none";
        const img = await get(src);
        if (!img.ok) return "none";
        const buf = Buffer.from(await img.arrayBuffer());
        if (buf.length < 2500) return "tiny";
        const ext = src.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
        fs.writeFileSync(path.join(COVER_DIR, `${spec.slug}${ext}`), buf);
        return `${buf.length}b`;
      })
      .catch((e) => "err:" + e.message);
    if (cover !== "none") break;
    if (cover === "none" && spec.wikiCoverTitle && t === spec.coverTitles[0]) {
      cover = await wikiCover(wikiHost, spec.wikiCoverTitle, spec.slug);
      if (cover !== "none") break;
    }
    await sleep(600);
  }
  return { slug: spec.slug, status: "full", id: "-", chars: text.length, cover, header: title };
}

// ---------------------------------------------------------------- book lists

const PG_BOOKS = [
  // existing library — re-download COMPLETE texts
  { slug: "pride-and-prejudice", knownId: "1342", verify: ["pride and prejudice"] },
  { slug: "frankenstein", knownId: "84", verify: ["frankenstein"] },
  { slug: "moby-dick", knownId: "2701", verify: ["moby"] },
  { slug: "sherlock-holmes", knownId: "1661", verify: ["sherlock holmes"] },
  { slug: "alice-in-wonderland", knownId: "11", verify: ["alice's adventures in wonderland"] },
  { slug: "wind-in-the-willows", knownId: "289", verify: ["wind in the willows"] },
  { slug: "wizard-of-oz", knownId: "55", verify: ["wizard of oz"] },
  { slug: "anne-of-green-gables", knownId: "45", verify: ["anne of green gables"] },
  { slug: "a-christmas-carol", knownId: "46", verify: ["christmas carol"] },
  { slug: "aesop-fables", query: "Aesop's Fables", verify: ["aesop"] },
  // novels (replace placeholders)
  { slug: "dracula", knownId: "345", verify: ["dracula"], wikiTitle: "Dracula" },
  { slug: "jane-eyre", knownId: "1260", verify: ["jane eyre"], wikiTitle: "Jane Eyre" },
  { slug: "dorian-gray", knownId: "446", verify: ["dorian gray"], wikiTitle: "The Picture of Dorian Gray" },
  // islamic (replace placeholders)
  { slug: "quran", knownId: "2800", query: "The Koran", verify: ["koran"], wikiTitle: "Quran" },
  { slug: "speeches-table-talk", query: "Speeches Table-Talk Prophet Mohammad", verify: ["speeches", "table-talk"] },
  { slug: "annals-early-caliphate", knownId: "72386", verify: ["annals of the early caliphate"] },
  // children's (replace placeholders)
  { slug: "jungle-book", knownId: "236", verify: ["jungle book"], wikiTitle: "The Jungle Book" },
  { slug: "tom-sawyer", knownId: "74", verify: ["tom sawyer"], wikiTitle: "The Adventures of Tom Sawyer" },
  { slug: "treasure-island", knownId: "120", verify: ["treasure island"], wikiTitle: "Treasure Island" },
  { slug: "black-beauty", knownId: "2039", verify: ["black beauty"], wikiTitle: "Black Beauty" },
  // moral (replace placeholders)
  { slug: "grimm-fairy-tales", knownId: "2591", verify: ["grimm"], wikiTitle: "Grimm's Fairy Tales" },
  { slug: "andersen-fairy-tales", query: "Andersen's Fairy Tales", verify: ["andersen"] },
  { slug: "blue-fairy-book", query: "The Blue Fairy Book", verify: ["blue fairy"] },
  { slug: "east-of-the-sun", knownId: "30973", verify: ["east of the sun"], fallbackQueries: ["East of the Sun and West of the Moon"] },
  // animated shelf (replace placeholders)
  { slug: "peter-rabbit", query: "The Tale of Peter Rabbit", verify: ["peter rabbit"], wikiTitle: "The Tale of Peter Rabbit" },
  { slug: "just-so-stories", knownId: "2781", query: "Just So Stories Kipling", verify: ["just so"], wikiTitle: "Just So Stories" },
  { slug: "velveteen-rabbit", query: "The Velveteen Rabbit", verify: ["velveteen"], fallbackQueries: ["The Adventures of Pinocchio"], wikiTitle: "The Velveteen Rabbit" },
  // gk (replace placeholders)
  { slug: "story-of-mankind", query: "The Story of Mankind", verify: ["story of mankind"], wikiTitle: "The Story of Mankind" },
  { slug: "cosmos-humboldt", query: "Cosmos Humboldt", verify: ["cosmos"], fallbackQueries: ["Cosmos : a sketch of the physical description of the universe"], wikiTitle: "Cosmos (Humboldt book)" },
  { slug: "outline-of-science", query: "The Outline of Science", verify: ["outline of science"] },
  { slug: "popular-astronomy", knownId: "28247", verify: ["popular history of astronomy"] },
  // comedy sub-shelf (replace placeholders)
  { slug: "three-men-in-a-boat", knownId: "308", verify: ["three men in a boat"], wikiTitle: "Three Men in a Boat" },
  { slug: "importance-of-earnest", query: "The Importance of Being Earnest", verify: ["earnest"], wikiTitle: "The Importance of Being Earnest" },
];

const WS_BOOKS = [
  {
    slug: "lab-pe-dua",
    wiki: "ur",
    search: "لب پہ آتی ہے دعا",
    exact: ["بچے کی دُعا"],
    coverTitles: ["بچے کی دُعا", "علامہ اقبال"],
    wikiCoverTitle: "Allama Iqbal",
  },
  {
    slug: "road-not-taken",
    wiki: "en",
    search: "The Road Not Taken",
    exact: ["Mountain Interval/The Road Not Taken"],
    coverTitles: ["Mountain Interval"],
    wikiCoverTitle: "Mountain Interval",
  },
];

// ---------------------------------------------------------------- main

(async () => {
  fs.mkdirSync(BOOKS_DIR, { recursive: true });
  fs.mkdirSync(COVER_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const inScope = (s) => !only.length || only.includes(s.slug);
  const report = [];
  for (const spec of PG_BOOKS.filter(inScope)) {
    const queries = [spec.query || spec.slug, ...(spec.fallbackQueries || [])];
    let result = null;
    for (const q of queries) {
      const s = { ...spec, query: q };
      result = await buildPg(s);
      if (result.status !== "FAILED") break;
    }
    report.push(result);
    console.log(`${result.status.padEnd(10)} ${result.slug.padEnd(28)} id=${result.id || "-"} chars=${result.chars || 0} cover=${result.cover || "-"} ${result.header || result.ids || ""}`);
  }
  for (const spec of WS_BOOKS.filter(inScope)) {
    const result = await buildWs(spec);
    report.push(result);
    console.log(`${result.status.padEnd(10)} ${result.slug.padEnd(28)} chars=${result.chars || 0} cover=${result.cover || "-"} ${result.header || ""}`);
  }
  const failed = report.filter((r) => r.status.startsWith("FAILED") || r.status === "NO-FOOTER");
  console.log(`\nDONE. ${report.length - failed.length}/${report.length} ok`);
  if (failed.length) console.log("PROBLEMS: " + failed.map((f) => `${f.slug}(${f.status})`).join(", "));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
