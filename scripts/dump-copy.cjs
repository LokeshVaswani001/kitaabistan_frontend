const fs = require("fs");

function dumpBlock(file, startRe, endRe, indent) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const start = lines.findIndex((l) => startRe.test(l));
  const end = lines.findIndex((l, i) => i > start && endRe.test(l));
  const out = [];
  for (let i = start + 1; i < end; i++) {
    const one = lines[i].match(new RegExp(`^${indent}([A-Za-z0-9_]+): "((?:[^"\\\\]|\\\\.)*)",?$`));
    if (one) { out.push({ key: one[1], text: JSON.parse('"' + one[2] + '"') }); continue; }
    const head = lines[i].match(new RegExp(`^${indent}([A-Za-z0-9_]+):$`));
    if (head) {
      const vals = [];
      let j = i + 1;
      while (j < end) {
        const m = lines[j].match(/^\s+"((?:[^"\\]|\\.)*)",?$/);
        if (!m) break;
        vals.push(JSON.parse('"' + m[1] + '"'));
        j++;
      }
      out.push({ key: head[1], text: vals.join(" ") });
      i = j - 1;
    }
  }
  return out;
}

const rows = [];
rows.push(...dumpBlock("src/lib/translations.js", /^ {2}en: \{/, /^ {2}ur: \{/, "    "));
rows.push(...dumpBlock("src/lib/locales/ui.js", /^ {2}en: \{/, /^\ {2}\},?$/m, "    "));

fs.writeFileSync("copy-en.txt", rows.map((r) => `${r.key}\t${r.text}`).join("\n"), "utf8");
console.log("keys:", rows.length);

/* hardcoded English in pages/components (rough scan) */
const hits = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = dir + "/" + f;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(js|jsx)$/.test(f)) scan(p);
  }
}
function scan(p) {
  const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
  lines.forEach((l, i) => {
    // JSX text nodes with 3+ words
    const m = l.match(/> *([A-Z][A-Za-z,'’?.! -]{12,}) *</);
    if (m) hits.push(`${p}:${i + 1}\t${m[1].trim()}`);
    const t = l.match(/(?:title|placeholder|aria-label|alt)="([A-Z][A-Za-z,'’?.! -]{8,})"/);
    if (t) hits.push(`${p}:${i + 1}\t${t[1]}`);
  });
}
walk("src");
fs.writeFileSync("copy-hardcoded.txt", hits.join("\n"), "utf8");
console.log("hardcoded:", hits.length);
