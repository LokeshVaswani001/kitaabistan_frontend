const fs = require("fs");
const copy = JSON.parse(fs.readFileSync("scripts/copy-6.json", "utf8"));
const values = copy.createFreeAccount;
const LANGS = ["ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];

const file = "src/lib/locales/ui.js";
const text = fs.readFileSync(file, "utf8");
const sep = text.includes("\r\n") ? "\r\n" : "\n";
const lines = text.split(/\r?\n/);

let added = 0;
for (const lang of LANGS) {
  const start = lines.findIndex((l, i) => new RegExp(`^ {2}${lang}: \\{`).test(l) && lines.slice(0, i).every((x, j) => j === i || !new RegExp(`^ {2}${lang}: \\{`).test(x)));
  if (start < 0) throw new Error("block not found: " + lang);
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^ {2}\},?$/.test(lines[i])) {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error("close not found: " + lang);
  const block = lines.slice(start, end);
  if (block.some((l) => /^ {4}createFreeAccount:/.test(l))) {
    console.log(`${lang}: already has it`);
    continue;
  }
  const anchor = block.findIndex((l) => /^ {4}createAccount:/.test(l));
  if (anchor < 0) throw new Error("createAccount not found in " + lang);
  const src = block[anchor];
  const comma = src.trim().endsWith(",") ? "," : "";
  const indent = src.match(/^ */)[0];
  lines.splice(start + anchor + 1, 0, `${indent}createFreeAccount: ${JSON.stringify(values[lang])}${comma}`);
  added++;
  console.log(`${lang}: added`);
}

fs.writeFileSync(file, lines.join(sep), "utf8");
console.log(`added to ${added} blocks`);
