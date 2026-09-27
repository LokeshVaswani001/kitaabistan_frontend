const { chromium } = require("playwright-core");

const BASE = process.argv[2] || "http://localhost:3000";
const EMAIL = `auth${Date.now()}@example.com`;
const PASS = "Passw0rd!2026";

const step = (ok, label, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  " + extra : ""}`);
  return ok ? 0 : 1;
};

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message.slice(0, 140)));
  let bad = 0;

  const text = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
  const hasLink = (label) =>
    page.evaluate((l) => {
      const els = [...document.querySelectorAll("a,button")];
      return els.some((e) => e.innerText.trim() === l && e.offsetParent !== null);
    }, label);
  const apiMe = async () => {
    const r = await page.evaluate(async () => {
      const res = await fetch("/api/auth/me", { headers: { accept: "application/json" } });
      return { s: res.status, b: await res.text() };
    });
    return r;
  };

  /* 1 — guest: header shows Log in / Sign up, no login wall */
  await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  bad += step(!page.url().includes("/login"), "guest lands on /home", page.url().replace(BASE, ""));
  bad += step(await hasLink("Log in"), "guest header has 'Log in'");
  bad += step(await hasLink("Sign up"), "guest header has 'Sign up'");
  bad += step(!(await hasLink("Log out")), "guest header has NO 'Log out'");
  const me0 = await apiMe();
  bad += step(me0.s === 200 && JSON.parse(me0.b).user === null, "guest /api/auth/me -> 200 guest", JSON.parse(me0.b).user ? "MEMBER" : "guest");

  /* 2 — signup via header */
  await page.evaluate(() => {
    [...document.querySelectorAll("a")].find((a) => a.innerText.trim() === "Sign up").click();
  });
  await page.waitForURL("**/signup**", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(800);
  bad += step(page.url().includes("/signup"), "header Sign up -> /signup", page.url().replace(BASE, ""));
  bad += step((await text()).includes("Your books follow you"), "signup panel title localized (en)");

  await page.fill('input[autocomplete="name"]', "Ayla Tester");
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="new-password"]', PASS);
  await page.click('form button[type="submit"]');
  await page.waitForURL((u) => !u.includes("/signup"), { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  bad += step(!page.url().includes("/signup"), "signup submits", page.url().replace(BASE, ""));
  const me1 = await apiMe();
  bad += step(me1.s === 200 && JSON.parse(me1.b).user && JSON.parse(me1.b).user.email === EMAIL, "member /api/auth/me -> 200", me1.s === 200 ? JSON.stringify(JSON.parse(me1.b).user) : String(me1.s));
  bad += step(await hasLink("Log out"), "member header has 'Log out'");
  bad += step((await text()).includes("Ayla Tester"), "header shows member name");
  bad += step(!(await hasLink("Sign up")), "member header has NO 'Sign up'");

  /* 3 — logout */
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Log out").click();
  });
  await page.waitForURL((u) => u.includes("/login") || u.includes("/"), { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  bad += step(page.url().includes("/login"), "logout -> /login", page.url().replace(BASE, ""));
  const me2 = await apiMe();
  bad += step(me2.s === 401 || JSON.parse(me2.b).user === null, "after logout no member session", String(me2.s));

  /* 4 — login */
  bad += step((await text()).includes("Welcome back"), "login chip localized (en)");
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASS);
  await page.click('form button[type="submit"]');
  await page.waitForURL((u) => !u.includes("/login"), { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2500);
  bad += step(!page.url().includes("/login"), "login submits", page.url().replace(BASE, ""));
  const me3 = await apiMe();
  bad += step(me3.s === 200, "re-login /api/auth/me -> 200", String(me3.s));
  bad += step(await hasLink("Log out"), "re-login header has 'Log out'");

  /* 5 — wrong password surfaces a localized error */
  await page.evaluate(() => {
    [...document.querySelectorAll("button")].find((b) => b.innerText.trim() === "Log out").click();
  });
  await page.waitForURL((u) => u.includes("/login"), { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.fill('input[autocomplete="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', "wrongpass123");
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(2000);
  const t5 = await text();
  bad += step(page.url().includes("/login") && !t5.includes("Ayla Tester"), "wrong password stays on /login");

  /* 6 — signup validation errors are localized */
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.click('form button[type="submit"]');
  await page.waitForTimeout(900);
  const t6 = await text();
  bad += step(
    t6.includes("Name must be at least 2 characters.") && t6.includes("Enter a valid email address."),
    "signup validation errors localized (en)"
  );

  console.log("\npage errors:", errors.length ? errors : "none");
  console.log(bad === 0 ? "\nALL PASS" : `\n${bad} FAILURES`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
