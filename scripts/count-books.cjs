const fs = require("fs");
const m = fs.readFileSync("src/lib/booksData.js", "utf8");
const ids = [...m.matchAll(/id:\s*"([^"]+)"/g)].map((x) => x[1]);
const files = [...m.matchAll(/file:\s*"([^"]+)"/g)].map((x) => x[1]);
console.log("books:", ids.length, "with file:", files.length, "without file:", ids.length - files.length);
const blocks = m.split(/^\s{2}\},?\s*$/m);
const noFile = [];
for (const b of m.split(/\n\s*\},\s*\n\s*\{/)) {
  const id = (b.match(/id:\s*"([^"]+)"/) || [])[1];
  if (id && !/file:\s*"/.test(b)) noFile.push(id);
}
console.log("no-file ids:", noFile.join(", "));
console.log("sample files:", files.slice(0, 5).join(", "));
