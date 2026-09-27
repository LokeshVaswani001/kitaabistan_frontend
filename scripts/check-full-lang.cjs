const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");
const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  [${extra}]` : ""}`);

async function getSession() {
  const email = `full${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Full Lang", email, password: "Secret#1234" }),
  });
  return res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");
}

const CHECKS = [
  { code: "fr", native: "Français", landing: ["Lisez", "Gratuit pour les élèves"], terms: "Conditions d'utilisation", home: "Bibliothèque" },
  { code: "ja", native: "日本語", landing: ["読もう", "学生には無料"], terms: "利用規約", home: "図書館" },
  { code: "ar", native: "العربية", landing: ["اقرأ", "مجاني للطلاب"], terms: "شروط الخدمة", home: "المكتبة" },
  { code: "ru", native: "Русский", landing: ["Читайте", "Бесплатно для учеников"], terms: "Условия использования", home: "Библиотека" },
  { code: "hi", native: "हिन्दी", landing: ["पढ़ें", "छात्रों के लिए मुफ़्त"], terms: "सेवा की शर्तें", home: "लाइब्रेरी" },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));

  async function pick(c) {
    await page.locator("button[aria-label='Change language']").first().click();
    await page.waitForTimeout(220);
    await page.locator("[role='option']").filter({ hasText: c.native }).first().click();
    await page.waitForTimeout(450);
  }

  // English baseline for "differs" checks
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);
  const enHero = await page.locator("body").innerText();

  for (const c of CHECKS) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    await pick(c);
    await page.waitForTimeout(500);
    let body = await page.locator("body").innerText();
    ok(`${c.code} landing headline`, c.landing.every((s) => body.includes(s)), body.slice(0, 60).replace(/\n/g, "|"));
    ok(`${c.code} landing differs from EN`, body !== enHero);
    await page.screenshot({ path: path.join(OUT, `full_${c.code}_landing.png`), fullPage: false });

    await page.goto(`${BASE}/terms`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(600);
    body = await page.locator("body").innerText();
    ok(`${c.code} terms heading`, body.includes(c.terms));

    await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    body = await page.locator("body").innerText();
    ok(`${c.code} home label`, body.includes(c.home));
    await page.screenshot({ path: path.join(OUT, `full_${c.code}_home.png`) });
  }

  // Onboarding: all 18 language options offered
  await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(700);
  await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(700);
  const buttons = await page.locator("main button, div button").allInnerTexts();
  const langs = ["English", "اردو", "العربية", "فارسی", "پښتو", "سنڌي", "हिन्दी", "বাংলা", "ਪੰਜਾਬੀ", "Türkçe", "Français", "Español", "Deutsch", "Português", "Русский", "中文", "Indonesia", "日本語"];
  const found = langs.filter((l) => buttons.some((b) => b.trim() === l || b.includes(l)));
  ok("onboarding offers 18 languages", found.length === 18, `found ${found.length}: ${found.filter((l) => !langs.includes(l)).join("")}${found.length < 18 ? " missing:" + langs.filter((l) => !found.includes(l)).join(",") : ""}`);
  await page.screenshot({ path: path.join(OUT, "full_onboarding.png") });

  ok("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(failed ? `${failed} FAILURES` : "ALL PASS");
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error("SCRIPT ERROR:", err.message);
  process.exit(2);
});
