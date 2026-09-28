const fs = require("fs");

const p = "src/app/profile/page.js";
let t = fs.readFileSync(p, "utf8");
const pairs = [
  ['label: isUrdu ? "دن کا سلسلہ" : "Day streak",', 'label: t("statStreak"),'],
  ['label: isUrdu ? "کتابیں کھولیں" : "Books opened",', 'label: t("statOpened"),'],
  ['label: isUrdu ? "محفوظ کتابیں" : "Saved books",', 'label: t("statSaved"),'],
  ['label: isUrdu ? "بیج" : "Badges",', 'label: t("statBadges"),'],
];
for (const [a, b] of pairs) {
  const n = t.split(a).length - 1;
  if (n !== 1) throw new Error(`matches ${n} for ${a.slice(0, 40)}`);
  t = t.replace(a, b);
}
fs.writeFileSync(p, t);
console.log("4 stat labels -> t()");

const m = t.match(/isUrdu \? "[^"]+" : "[^"]+"/g) || [];
console.log("remaining hardcoded isUrdu strings in profile:", m.length);
m.forEach((x) => console.log("  " + x.slice(0, 100)));
