const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");

async function getSession() {
  const email = `shot${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Shot Tester", email, password: "Secret#1234" }),
  });
  const raw = res.headers.get("set-cookie");
  if (res.ok && raw) return raw.split(";")[0].split("=").slice(1).join("=");
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "Secret#1234" }),
  });
  const raw2 = login.headers.get("set-cookie");
  if (!login.ok || !raw2) throw new Error(`session failed: ${res.status}/${login.status}`);
  return raw2.split(";")[0].split("=").slice(1).join("=");
}

async function shoot(browser, theme, session, routes) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 940 },
    colorScheme: theme === "dark" ? "dark" : "light",
  });
  await ctx.addInitScript((value) => {
    window.localStorage.setItem("kitaabistan_theme", value);
  }, theme);
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1200);
    const name = `${theme}${route.replace(/\//g, "_")}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    console.log(`saved ${name}`);
  }
  await ctx.close();
}

(async () => {
  const args = process.argv.slice(2);
  const themes = args[0] === "both" ? ["light", "dark"] : [args[0] || "light"];
  const routes = args.slice(1).length ? args.slice(1) : ["/poems", "/stories"];
  fs.mkdirSync(OUT, { recursive: true });
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  for (const theme of themes) await shoot(browser, theme, session, routes);
  await browser.close();
  console.log("done", OUT);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
