const fs = require("fs");
const path = require("path");

const NON_LATIN = ["ur", "ar", "fa", "ps", "sd", "hi", "bn", "pa", "ru", "zh", "ja"];
const ALLOWED = /^(Kitaabistan|Rehnuma|Q&A|Kids|Mode|app|offline|AI|Gutenberg|WhatsApp)$/i;

const files = [
  { file: "src/lib/translations.js", blocks: ["ur"] },
  ...NON_LATIN.map((l) => ({ file: `src/lib/locales/ui.js`, blocks: [l] })),
  ...NON_LATIN.map((l) => ({ file: `src/lib/locales/lang/${l}.js`, blocks: [l] })),
];

let bad = 0;
for (const { file } of new Map(files.map((f) => [f.file, f])).values()) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((l, i) => {
    const m = l.match(/:\s*"((?:[^"\\]|\\.)*)"/);
    if (!m) return;
    const v = m[1];
    // latin letter adjacent to a non-latin script character = likely mixed garbage
    const mixed = v.match(/[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF][A-Za-z]{2,}|[A-Za-z]{2,}[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0400-\u04FF\u3040-\u30FF\u4E00-\u9FFF]/g);
    if (mixed) {
      const parts = mixed.filter((x) => !ALLOWED.test(x.replace(/^[A-Za-z]+|[A-Za-z]+$/g, "")) || x.length > 2);
      const real = mixed.filter((x) => {
        const stripped = x.replace(/[^A-Za-z]/g, "");
        return stripped.length >= 2 && !ALLOWED.test(stripped);
      });
      if (real.length) {
        bad++;
        console.log(`${file}:${i + 1}  ${real.join(" | ")}`);
        console.log(`    ${v.slice(0, 120)}`);
      }
    }
  });
}
console.log(bad ? `\n${bad} suspicious lines` : "clean");
