const fs = require("fs");
const path = require("path");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk("src");
let total = 0;
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  const m = s.match(/isUrdu \? "[^"]*" : "[^"]*"/g) || [];
  if (m.length) {
    total += m.length;
    console.log(`${f}: ${m.length}`);
  }
}
console.log("TOTAL hardcoded isUrdu ternaries:", total);
