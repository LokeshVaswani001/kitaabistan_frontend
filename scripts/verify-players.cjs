const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const email = `verify${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Verify", email, password: "Secret#1234" }),
  });
  const session = res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");

  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 940 },
      colorScheme: theme === "dark" ? "dark" : "light",
    });
    await ctx.addInitScript((v) => window.localStorage.setItem("kitaabistan_theme", v), theme);
    await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
    const page = await ctx.newPage();
    for (const route of ["/poems", "/stories"]) {
      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
      const eyebrow = (await page.locator(".eyebrow").first().innerText()).trim();
      const logoCount = await page.getByText("Kitaabistan", { exact: true }).count();
      const playerBox = await page.locator("button[aria-label='Play poem'], button[aria-label='Play story']").first().boundingBox();
      const name = `verify_${theme}_${route.replace(/\//g, "_")}.png`;
      await page.screenshot({ path: path.join(OUT, name) });
      console.log(`${name} | eyebrow="${eyebrow}" | logoPills=${logoCount} | playerVisible=${!!playerBox}`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
