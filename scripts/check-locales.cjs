const fs = require("fs");
const path = require("path");

const dir = path.join("src", "lib", "locales", "lang");
const translations = fs.readFileSync("src/lib/translations.js", "utf8");
const en = translations.match(/en:\s*\{[\s\S]*?\n  \},/)[0];
const enKeys = [...en.matchAll(/^\s{4}([A-Za-z0-9_]+):/gm)].map((m) => m[1]);
const ui = fs.readFileSync("src/lib/locales/ui.js", "utf8");
const arStart = ui.indexOf("ar: {");
const coreKeys = new Set(
  [...ui.slice(arStart).matchAll(/^\s{4}([A-Za-z0-9_]+):/gm)].map((m) => m[1])
);
const needed = enKeys.filter((k) => !coreKeys.has(k));

const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js") && f !== "index.js");
let bad = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), "utf8");
  const keys = new Set([...src.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map((m) => m[1]));
  const missing = needed.filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.includes(k));
  const dupes = [...src.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)].map((m) => m[1]);
  const dupList = dupes.filter((k, i) => dupes.indexOf(k) !== i);
  if (missing.length || extra.length || dupList.length) {
    bad++;
    console.log(`\n${f}: have ${keys.size}/${needed.length}`);
    if (missing.length) console.log("  MISSING:", missing.join(","));
    if (extra.length) console.log("  EXTRA:", extra.join(","));
    if (dupList.length) console.log("  DUPES:", [...new Set(dupList)].join(","));
  } else {
    console.log(`OK   ${f} (${keys.size})`);
  }
}
const have = files.map((f) => f.replace(".js", ""));
const all16 = ["ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];
const absent = all16.filter((c) => !have.includes(c));
if (absent.length) console.log("\nNOT WRITTEN YET:", absent.join(", "));
console.log(`\nneeded keys per language: ${needed.length}; files: ${files.length}`);
process.exit(bad ? 1 : 0);
