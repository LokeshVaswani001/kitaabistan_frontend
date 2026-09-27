const fs = require("fs");
const path = require("path");

/**
 * Rewrites copy in place, preserving line endings and block structure.
 * Usage: node scripts/apply-copy.cjs scripts/copy-*.json
 */
const LANGS = ["ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];

function esc(v) {
  return JSON.stringify(String(v));
}

function patch(lines, start, end, key, value, indent) {
  const single = new RegExp(`^(\\s*)${key}: "((?:[^"\\\\]|\\\\.)*)",?$`);
  const head = new RegExp(`^(\\s*)${key}:$`);
  for (let i = start; i < end; i++) {
    const m = lines[i].match(single);
    if (m) {
      const comma = lines[i].endsWith(",") ? "," : "";
      lines[i] = `${m[1]}${key}: ${esc(value)}${comma}`;
      return "single";
    }
    const h = lines[i].match(head);
    if (h) {
      const block = [];
      let j = i + 1;
      while (j < end && /^\s+"/.test(lines[j])) {
        block.push(lines[j]);
        j++;
      }
      const comma = lines[j - 1] && lines[j - 1].trim().endsWith(",") ? "," : "";
      lines.splice(i, j - i, `${h[1]}${key}: ${esc(value)}${comma}`);
      return "multi";
    }
  }
  return null;
}

function findBlock(lines, startRe, endRe, from = 0) {
  const start = lines.findIndex((l, i) => i >= from && startRe.test(l));
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && endRe.test(l));
  return { start, end: end < 0 ? lines.length : end };
}

function loadMap(files) {
  const map = {};
  for (const f of files) {
    const part = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const [key, langs] of Object.entries(part)) {
      map[key] = { ...(map[key] || {}), ...langs };
    }
  }
  return map;
}

function save(file, lines, sep) {
  fs.writeFileSync(file, lines.join(sep), "utf8");
}

function io(file) {
  const text = fs.readFileSync(file, "utf8");
  return { text, sep: text.includes("\r\n") ? "\r\n" : "\n", lines: text.split(/\r?\n/) };
}

const map = loadMap(process.argv.slice(2));
const report = [];
const missing = [];

/* ---------------- translations.js: en + ur ---------------- */
{
  const file = "src/lib/translations.js";
  const { sep, lines } = io(file);
  for (const [key, langs] of Object.entries(map)) {
    for (const lang of ["en", "ur"]) {
      if (!langs[lang]) continue;
      // re-find the block every time: patching shifts line indices
      const b =
        lang === "en"
          ? findBlock(lines, /^ {2}en: \{/, /^ {2}ur: \{/)
          : findBlock(lines, /^ {2}ur: \{/, /^ {2}\},?$/);
      if (!b) throw new Error(`${lang} block not found in ${file}`);
      const hit = patch(lines, b.start, b.end, key, langs[lang], "    ");
      if (hit) report.push(`${lang}/${key}`);
      else missing.push(`${lang}/${key} in ${file}`);
    }
  }
  save(file, lines, sep);
}

/* ---------------- ui.js: 42 core keys x 16 langs ---------------- */
const hits = new Set();
{
  const file = "src/lib/locales/ui.js";
  const { sep, lines } = io(file);
  for (const lang of LANGS) {
    for (const [key, langs] of Object.entries(map)) {
      if (!langs[lang]) continue;
      const b = findBlock(lines, new RegExp(`^ {2}${lang}: \\{`), /^ {2}\},?$/, 0);
      if (!b) throw new Error(`${lang} block not found in ui.js`);
      const hit = patch(lines, b.start, b.end, key, langs[lang], "    ");
      if (hit) {
        report.push(`${lang}/${key}@ui`);
        hits.add(`${lang}/${key}`);
      }
    }
  }
  save(file, lines, sep);
}

/* ---------------- lang/*.js: remaining keys x 16 langs ---------------- */
for (const lang of LANGS) {
  const file = path.join("src", "lib", "locales", "lang", `${lang}.js`);
  const { sep, lines } = io(file);
  let touched = false;
  for (const [key, langs] of Object.entries(map)) {
    if (!langs[lang]) continue;
    const hit = patch(lines, 0, lines.length, key, langs[lang], "  ");
    if (hit) {
      report.push(`${lang}/${key}@lang`);
      hits.add(`${lang}/${key}`);
      touched = true;
    }
  }
  if (touched) save(file, lines, sep);
}

for (const [key, langs] of Object.entries(map)) {
  for (const lang of Object.keys(langs)) {
    if (lang === "en" || lang === "ur") continue;
    if (!hits.has(`${lang}/${key}`)) missing.push(`${lang}/${key} (not found in ui.js or lang file)`);
  }
}

console.log(`patched ${report.length} entries`);
if (missing.length) {
  console.log("MISSING:");
  missing.forEach((m) => console.log("  " + m));
  process.exit(1);
}
