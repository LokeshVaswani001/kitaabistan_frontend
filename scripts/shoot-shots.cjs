const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");

let pass = 0;
let fail = 0;
const check = (label, ok, extra = "") => {
  if (ok) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${extra ? " :: " + extra : ""}`);
  }
};

async function run(browser, theme, viewport, label, lang) {
  const ctx = await browser.newContext({ viewport, colorScheme: theme === "dark" ? "dark" : "light" });
  await ctx.addInitScript(
    ([th, lg]) => {
      window.localStorage.setItem("kitaabistan_theme", th);
      window.localStorage.setItem("kitaabistan_lang", lg);
    },
    [theme, lang || "en"]
  );
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);

  const section = page.locator("#screens");
  check(`${label}: #screens exists`, (await section.count()) === 1);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);

  const imgs = section.locator("img");
  const n = await imgs.count();
  check(`${label}: 6 screenshots`, n === 6, `got ${n}`);
  for (let i = 0; i < n; i++) await imgs.nth(i).scrollIntoViewIfNeeded();
  await section.scrollIntoViewIfNeeded();
  let broken = [];
  try {
    await page.waitForFunction(
      () => [...document.querySelectorAll("#screens img")].every((e) => e.complete && e.naturalWidth > 0),
      { timeout: 15000 }
    );
  } catch {
    /* fall through to report */
  }
  broken = await imgs.evaluateAll((els) =>
    els.filter((e) => !e.complete || e.naturalWidth === 0).map((e) => e.getAttribute("src"))
  );
  check(`${label}: all images loaded`, broken.length === 0, broken.join(","));

  const figs = section.locator("figure");
  const captions = await figs.evaluateAll((els) =>
    els.map((f) => ({
      h: (f.querySelector("figcaption h3")?.textContent || "").trim(),
      p: (f.querySelector("figcaption p")?.textContent || "").trim(),
      capRight: Math.round(f.querySelector("figcaption").getBoundingClientRect().right),
      capLeft: Math.round(f.querySelector("figcaption").getBoundingClientRect().left),
      imgLeft: Math.round(f.querySelector("img").getBoundingClientRect().left),
      imgRight: Math.round(f.querySelector("img").getBoundingClientRect().right),
      imgTop: Math.round(f.querySelector("img").getBoundingClientRect().top),
      capTop: Math.round(f.querySelector("figcaption").getBoundingClientRect().top),
      capBottom: Math.round(f.querySelector("figcaption").getBoundingClientRect().bottom),
      imgH: Math.round(f.querySelector("img").getBoundingClientRect().height),
    }))
  );
  check(
    `${label}: captions present`,
    captions.length === 6 && captions.every((c) => c.h.length > 2 && c.p.length > 10)
  );
  const english = captions.filter((c) => /^(Your shelf|Eight shelves|Ask Rehnuma|18 languages|Bring your|Animated books)/.test(c.h));
  if (lang && lang !== "en") {
    check(`${label}: captions translated (${lang})`, english.length === 0, JSON.stringify(captions.map((c) => c.h)));
  } else {
    check(`${label}: captions in English`, english.length === 6, JSON.stringify(captions.map((c) => c.h)));
  }

  if (viewport.width >= 768) {
    const badOrder = captions.filter((c, i) =>
      i % 2 === 0 ? c.capRight > c.imgLeft + 2 : c.imgRight > c.capLeft + 2
    );
    check(
      `${label}: alternating text/image sides`,
      badOrder.length === 0,
      `${badOrder.length} rows wrong: ` +
        captions.map((c, i) => `${i}:${i % 2 === 0 ? "text-left" : "image-left"}`).join(",")
    );
    const badImg = captions.filter((c) => c.imgH < 260 || c.imgH > 620);
    check(`${label}: image height sane (${captions[0]?.imgH}px)`, badImg.length === 0);
  } else {
    const stacked = captions.filter((c) => c.imgTop < c.capTop || c.imgTop + 4 < c.capBottom);
    check(`${label}: image stacked below text`, stacked.length === 0, `${stacked.length} rows wrong`);
    const badImg = captions.filter((c) => c.imgH < 380);
    check(`${label}: image readable on mobile (${captions[0]?.imgH}px)`, badImg.length === 0);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label}: no page-level horizontal overflow`, overflow <= 1, `overflow=${overflow}`);

  if (viewport.width >= 768) {
    const firstImg = section.locator("figure img").first();
    await firstImg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const before = await firstImg.boundingBox();
    await firstImg.hover();
    await page.waitForTimeout(500);
    const after = await firstImg.boundingBox();
    const lifted = before && after && after.y < before.y - 3;
    const grew = before && after && after.height > before.height + 3;
    check(`${label}: image hover lift/scale`, !!(lifted && grew), `before=${JSON.stringify(before)} after=${JSON.stringify(after)}`);
    await page.mouse.move(4, 4);
    await page.waitForTimeout(350);
  }

  await page.evaluate(() => document.querySelector("#screens").scrollIntoView({ block: "start" }));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `screens-${label}.png`), fullPage: false });
  console.log(`saved screens-${label}.png`);

  await ctx.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  await run(browser, "light", { width: 1440, height: 940 }, "desktop-light", "en");
  await run(browser, "dark", { width: 1440, height: 940 }, "desktop-dark", "en");
  await run(browser, "light", { width: 390, height: 844 }, "mobile-light", "en");
  await run(browser, "dark", { width: 390, height: 844 }, "mobile-dark", "en");
  await run(browser, "light", { width: 1440, height: 940 }, "desktop-light-fr", "fr");
  await run(browser, "light", { width: 390, height: 844 }, "mobile-light-ur", "ur");
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
