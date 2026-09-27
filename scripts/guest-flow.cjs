const { chromium } = require("playwright-core");

const BASE = process.argv[2] || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message.slice(0, 140)));

  let bad = 0;
  for (const p of ["/home", "/library", "/chatbot", "/saved", "/profile", "/book/n9", "/import"]) {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(2200);
    const url = page.url().replace(BASE, "");
    const onLogin = url.startsWith("/login");
    const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 140));
    const hasDemo = await page.evaluate(() => document.body.innerText.includes("Demo") || /\d+:\d\d/.test(document.body.innerText));
    if (onLogin) bad++;
    console.log(`${onLogin ? "FAIL" : "PASS"}  ${p} -> ${url}  demoBanner=${hasDemo}`);
    console.log(`      text: ${body.slice(0, 110)}`);
  }
  const c = await ctx.cookies();
  console.log("\ncookies:", c.map((x) => x.name).join(", ") || "NONE");
  console.log("page errors:", errors.length ? errors : "none");
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
