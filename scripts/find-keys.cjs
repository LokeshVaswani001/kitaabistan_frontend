const fs = require("fs");
const src = fs.readFileSync("src/lib/translations.js", "utf8");
const enBlock = src.slice(0, src.indexOf("  ur: {"));
const re = /^ {4}(\w+): "(.*)",$/gm;
let m;
const keys = [];
while ((m = re.exec(enBlock))) keys.push([m[1], m[2]]);
const terms = process.argv.slice(2);
for (const term of terms) {
  const hits = keys.filter(([, v]) => v.toLowerCase().includes(term.toLowerCase()));
  console.log(`--- "${term}" (${hits.length})`);
  hits.forEach(([k, v]) => console.log(`    ${k}: ${v}`));
}
