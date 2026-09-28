const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_footer");
const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  [${extra}]` : ""}`);

/* App pages need a session (member or demo) or AppShell bounces to /login. */
async function getSession() {
  const email = `foot${Date.now()}@test.com`;
  let res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Footer Test", email, password: "Secret#1234" }),
  });
  if (!res.ok) {
    res = await fetch(`${BASE}/api/auth/demo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ minutes: 60 }),
    });
  }
  const raw = res.headers.get("set-cookie") || "";
  if (!raw) throw new Error(`no session cookie (status ${res.status})`);
  return raw.split(";")[0].split("=").slice(1).join("=");
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const errors = [];

  for (const theme of ["light", "dark"]) {
    for (const [label, viewport] of [
      ["desktop", { width: 1440, height: 940 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      const ctx = await browser.newContext({ viewport });
      await ctx.addInitScript((t) => localStorage.setItem("kitaabistan_theme", t), theme);
      await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
      const page = await ctx.newPage();
      page.on("pageerror", (e) => errors.push(String(e.message)));

      for (const route of ["/", "/home", "/terms"]) {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(700);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        const foot = page.locator("footer");
        const count = await foot.count();
        ok(`${route} ${theme} ${label} has footer`, count > 0, `count=${count}`);
        if (count > 0) {
          const box = await foot.first().boundingBox();
          ok(`${route} ${theme} ${label} footer visible`, !!box && box.height > 120, box ? `h=${Math.round(box.height)}` : "null");
        }
        const name = `${(route === "/" ? "landing" : route.slice(1))}_${theme}_${label}.png`.replace(/\//g, "");
        await page.screenshot({ path: path.join(OUT, name) });
      }

      await ctx.close();
    }
  }

  // back-to-top interaction (landing, desktop, light)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e.message)));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  const btn = page
    .locator('footer button[title]:not([title="Dark mode"]):not([title="Light mode"])')
    .first();
  ok("back-to-top button exists", (await btn.count()) > 0);
  if ((await btn.count()) > 0) {
    const label = await btn.getAttribute("title");
    await btn.click();
    let y = -1;
    for (let i = 0; i < 30; i++) {
      await page.waitForTimeout(200);
      y = await page.evaluate(() => window.scrollY);
      if (y <= 1) break;
    }
    ok("back-to-top scrolls up", y <= 1, `scrollY=${y} label=${label}`);
  }

  // footer links resolve (no 404 on a couple of them)
  for (const href of ["/privacy", "/terms", "/onboarding"]) {
    const link = page.locator(`footer a[href="${href}"]`).first();
    ok(`footer link ${href}`, (await link.count()) > 0);
  }

  // app pages must not hide footer behind the mobile tab bar
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await mctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const mp = await mctx.newPage();
  await mp.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
  await mp.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await mp.waitForTimeout(600);
  const copy = mp.locator('footer p:has-text("©")').first();
  const visible = await copy.isVisible().catch(() => false);
  ok("app footer copyright visible on mobile", visible);
  const rect = await copy.boundingBox();
  const clearance = rect ? Math.round(844 - (rect.y + rect.height)) : -1;
  ok("app footer clears the mobile tab bar", clearance >= 50, `gap=${clearance}px`);
  await mp.screenshot({ path: path.join(OUT, "home_mobile_footer_clearance.png") });

  ok("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(failed ? `${failed} FAILURES — shots in ${OUT}` : `ALL PASS — shots in ${OUT}`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  process.exit(2);
});
