const fs = require("fs");
const path = require("path");

/* Usage: node scripts/add-keys.cjs scripts/copy-8.json
   Inserts each key (en/ur into translations.js, the other 16 into lang/*.js)
   that isn't already present. CRLF-safe and idempotent. */
const file = process.argv[2];
if (!file) throw new Error("usage: node scripts/add-keys.cjs <json>");
const KEYS = JSON.parse(fs.readFileSync(file, "utf8"));
const LANGS = ["en", "ur", "ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];

for (const lang of LANGS) {
  for (const [key, table] of Object.entries(KEYS)) {
    if (typeof table[lang] !== "string" || !table[lang].trim())
      throw new Error(`missing or empty ${lang}.${key}`);
  }
}

const linesFor = (lang, indent) =>
  Object.entries(KEYS).map(([key, table]) => `${indent}${key}: ${JSON.stringify(table[lang])},`);

function ensureComma(lines, idx) {
  const prev = lines[idx - 1];
  if (prev !== undefined && !prev.trimEnd().endsWith(",") && !/[{[]$/.test(prev.trimEnd()))
    lines[idx - 1] = prev.trimEnd() + ",";
}

function insertBefore(lines, idx, newLines) {
  ensureComma(lines, idx);
  lines.splice(idx, 0, ...newLines);
}

/* translations.js — en block, then ur block */
const tp = "src/lib/translations.js";
const tText = fs.readFileSync(tp, "utf8");
const tSep = tText.includes("\r\n") ? "\r\n" : "\n";
const tl = tText.split(/\r?\n/);
const missing = Object.keys(KEYS).filter((k) => !tl.some((l) => /^ {4}\w+:/.test(l) && l.startsWith(`    ${k}:`)));
if (!missing.length) {
  console.log("translations.js already has all keys — skipped");
} else {
  const urIdx = tl.findIndex((l) => /^ {2}ur: \{/.test(l));
  if (urIdx < 0) throw new Error("ur block not found");
  insertBefore(tl, urIdx - 1, linesFor("en", "    "));
  const objCloseIdx = tl.findIndex((l) => /^};$/.test(l.replace(/\r$/, "")));
  if (!/^ {2}\},?$/.test((tl[objCloseIdx - 1] || "").replace(/\r$/, "")))
    throw new Error("ur block close not found");
  insertBefore(tl, objCloseIdx - 1, linesFor("ur", "    "));
  fs.writeFileSync(tp, tl.join(tSep));
  console.log(`translations.js: +${missing.length} en, +${missing.length} ur (${missing.join(", ")})`);
}

/* lang files */
for (const lang of LANGS.filter((c) => c !== "en" && c !== "ur")) {
  const fp = path.join("src", "lib", "locales", "lang", `${lang}.js`);
  const text = fs.readFileSync(fp, "utf8");
  const sep = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const closeIdx = lines.lastIndexOf("};");
  if (closeIdx < 0) throw new Error("close not found in " + fp);
  const todo = Object.keys(KEYS).filter((k) => !lines.some((l) => l.startsWith(`  ${k}:`)));
  if (!todo.length) {
    console.log(`${lang}.js already has the keys — skipped`);
    continue;
  }
  insertBefore(lines, closeIdx, todo.map((k) => `  ${k}: ${JSON.stringify(KEYS[k][lang])},`));
  fs.writeFileSync(fp, lines.join(sep));
  console.log(`${lang}.js: +${todo.length}`);
}
