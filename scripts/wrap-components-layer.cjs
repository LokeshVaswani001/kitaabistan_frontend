const fs = require("fs");
const p = "src/app/globals.css";
const lines = fs.readFileSync(p, "utf8").split("\n");

// 1-based line numbers from the current file
const START = 198; // "/* --- buttons ---"
const END = 442; // closing brace of .no-scrollbar::-webkit-scrollbar
const SECTION = 196; // "5. COMPONENTS" comment

if (!/COMPONENTS/.test(lines[SECTION - 1]) || !/MOTION/.test(lines[443])) {
  console.error("unexpected layout", lines[SECTION - 1], "|", lines[443]);
  process.exit(1);
}
if (!lines[START - 1].includes("buttons") || lines[END - 1].trim() !== "}") {
  console.error("unexpected boundaries:", lines[START - 1], "|", lines[END - 1]);
  process.exit(1);
}

const body = lines.slice(START - 1, END).map((l) => (l.trim() ? "  " + l : l));
const out = [
  ...lines.slice(0, SECTION - 1),
  lines[SECTION - 1],
  "",
  "// Component classes live in Tailwind's `components` layer so utility",
  "// classes (bg-*, text-*, p-*) always win. Unlayered rules beat every",
  "// layer, which is why light-theme overrides on .card/.btn silently lost.",
  "@layer components {",
  ...body,
  "}",
  ...lines.slice(END),
];
fs.writeFileSync(p, out.join("\n"));
console.log("wrapped lines", START, "-", END);
