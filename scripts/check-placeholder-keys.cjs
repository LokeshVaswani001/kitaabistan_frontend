const fs = require("fs");
const path = require("path");

const src = fs.readFileSync("src/app/book/[id]/page.js", "utf8");
const m = src.match(/const PLACEHOLDER_PAGES = (\[[\s\S]*?\]);/);
if (!m) throw new Error("PLACEHOLDER_PAGES not found");
const keys = [...m[1].matchAll(/"([A-Za-z0-9_]+)"/g)].map((x) => x[1]);
console.log("keys used:", keys.join(", "));

const tr = fs.readFileSync("src/lib/translations.js", "utf8");
const blocks = { en: tr.match(/en:\s*\{[\s\S]*?\n  \},/)[0], ur: tr.match(/ur:\s*\{[\s\S]*?\n  \},/)[0] };
let bad = 0;
for (const [name, text] of [["translations.en", blocks.en], ["translations.ur", blocks.ur]]) {
  for (const k of keys) {
    if (!new RegExp(`^ {4}${k}:`, "m").test(text)) {
      console.log(`MISSING ${name}.${k}`);
      bad++;
    }
  }
}
for (const f of fs.readdirSync("src/lib/locales/lang")) {
  if (!f.endsWith(".js") || f === "index.js") continue;
  const text = fs.readFileSync(path.join("src/lib/locales/lang", f), "utf8");
  for (const k of keys) {
    if (!new RegExp(`^ {2}${k}:`, "m").test(text)) {
      console.log(`MISSING ${f}.${k}`);
      bad++;
    }
  }
}
console.log(bad ? `${bad} MISSING` : "all placeholder keys present in every language");
process.exit(bad ? 1 : 0);
