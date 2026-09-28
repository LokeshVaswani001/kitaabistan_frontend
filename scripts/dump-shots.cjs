const fs = require("fs");
const s = fs.readFileSync("src/lib/translations.js", "utf8");
const keys = [
  "shotsLabel", "shotsTitle", "shotsBody",
  "shotHomeT", "shotHomeB", "shotLibraryT", "shotLibraryB",
  "shotChatT", "shotChatB", "shotLangT", "shotLangB",
  "shotAddT", "shotAddB", "shotAnimatedT", "shotAnimatedB",
];
for (const k of keys) {
  const m = s.match(new RegExp("^    " + k + ': "((?:[^"\\\\]|\\\\.)*)",$', "m"));
  if (m) console.log(`${k} (${m[1].length} chars): ${m[1]}\n`);
}
