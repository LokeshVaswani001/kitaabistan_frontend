const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EXPECT = [
  ["home.png", "shotHomeT"],
  ["library.png", "shotLibraryT"],
  ["chatbot.png", "shotChatT"],
  ["languages.png", "shotLangT"],
  ["add-books.png", "shotAddT"],
  ["animated-books.png", "shotAnimatedT"],
];

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });

  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 940 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);

    const rows = await page.evaluate(() => {
      const figs = [...document.querySelectorAll("#screens figure")];
      return figs.map((f) => {
        const img = f.querySelector("img");
        const r = f.getBoundingClientRect();
        return {
          src: (img && img.getAttribute("src")) || "",
          h: (f.querySelector("figcaption h3")?.textContent || "").trim(),
          top: Math.round(r.top + window.scrollY),
          left: Math.round(r.left),
          w: Math.round(r.width),
          visible: r.width > 0 && r.height > 0,
        };
      });
    });

    console.log(`\n== ${label} ==`);
    rows.forEach((r) => console.log(`  ${r.src.replace("/screenshots/", "")} | ${r.h.slice(0, 34)} | top=${r.top} left=${r.left} w=${r.w}`));

    const pairing = rows.every((r, i) => r.src.endsWith(EXPECT[i][0]));
    const EXPECT_TITLES = [
      "Your shelf, ready",
      "Eight shelves",
      "Ask Rehnuma",
      "18 languages, one tap",
      "Bring your own books",
      "Animated books",
    ];
    const titles = rows.every((r, i) => r.h === EXPECT_TITLES[i]);
    console.log(`  pairing: ${pairing ? "OK" : "MISMATCH"} | titles: ${titles ? "OK" : "MISMATCH"} | all visible: ${rows.every((r) => r.visible)}`);

    const tops = [...new Set(rows.map((r) => r.top))];
    console.log(`  rows (distinct tops): ${tops.length} (expect 6) ${tops.length === 6 ? "OK" : "CHECK"}`);

    await ctx.close();
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
