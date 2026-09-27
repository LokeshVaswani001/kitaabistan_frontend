// Fetch a Wikipedia page's lead image as a book cover.
// Usage: node scripts/get-wiki-cover.cjs <host> <pageTitle> <outSlug>
const fs = require("node:fs");
const path = require("node:path");

const [host, pageTitle, slug] = process.argv.slice(2);
if (!host || !pageTitle || !slug) {
  console.error("args: <host> <pageTitle> <outSlug>");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const api = `https://${host}/w/api.php?${new URLSearchParams({ action: "query", prop: "pageimages", piprop: "original", titles: pageTitle, format: "json", formatversion: "2" })}`;
  const res = await fetch(api, { headers: { "user-agent": "KitaabistanLibraryBuilder/1.0" } });
  const data = await res.json();
  const src = data?.query?.pages?.[0]?.original?.source;
  if (!src) {
    console.log("no image for:", pageTitle);
    process.exit(2);
  }
  await sleep(400);
  const img = await fetch(src, { headers: { "user-agent": "KitaabistanLibraryBuilder/1.0" } });
  const buf = Buffer.from(await img.arrayBuffer());
  const ext = src.toLowerCase().endsWith(".png") ? ".png" : ".jpg";
  fs.writeFileSync(path.join("public/covers", `${slug}${ext}`), buf);
  console.log(`saved covers/${slug}${ext} (${buf.length}b) <- ${src}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
