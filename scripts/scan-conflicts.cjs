const fs = require("fs");
const path = require("path");

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]
  );

const COMP = /\b(card|card-hover|btn|btn-primary|btn-outline|btn-ghost|btn-accent|btn-danger|field|chip|chip-brand|chip-accent|eyebrow|band)\b/;
const UTIL = /\b(bg-|text-(white|xs|sm|base|lg|xl|2xl|3xl)|px-|py-|p-[0-9]|gap-|rounded-|border-|w-|h-|font-)/;

for (const f of walk("src").filter((f) => f.endsWith(".js"))) {
  const src = fs.readFileSync(f, "utf8");
  src.split("\n").forEach((line, i) => {
    const m = line.match(/className=(?:"([^"]*)"|\{`([^`]*)`\})/);
    if (!m) return;
    const cls = m[1] || m[2] || "";
    if (COMP.test(cls) && UTIL.test(cls)) {
      console.log(`${f.split(path.sep).join("/")}:${i + 1}: ${cls.trim().slice(0, 160)}`);
    }
  });
}
