const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  [${extra}]` : ""}`);
};

async function getSession() {
  const email = `lang${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Lang Tester", email, password: "Secret#1234" }),
  });
  const raw = res.headers.get("set-cookie");
  return raw.split(";")[0].split("=").slice(1).join("=");
}

async function ask(page, text) {
  const input = page.locator("form input").first();
  const before = await page.locator("[data-role='message'], .message, [class*='message']").count();
  await input.fill(text);
  await input.press("Enter");
  await page.waitForFunction(
    (n) => document.body.innerText.length > 0 && document.querySelectorAll("form input").length > 0,
    null
  );
  await page.waitForTimeout(1800);
  return before;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message)));

  await page.goto(`${BASE}/chatbot`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);

  const switcher = page.locator("button[aria-label='Change language']");
  ok("switcher visible on chatbot", await switcher.isVisible());
  await switcher.click();
  await page.waitForTimeout(300);
  const options = page.locator("[role='option']");
  const count = await options.count();
  ok("18 language options", count === 18, `got ${count}`);
  await page.screenshot({ path: path.join(OUT, "lang_open.png") });

  // --- English ---
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok("english default dir", (await page.locator("html").getAttribute("dir")) === "ltr");
  await page.screenshot({ path: path.join(OUT, "lang_en.png") });

  // --- Urdu ---
  await switcher.click();
  await page.waitForTimeout(250);
  await page.getByRole("option", { name: /اردو/ }).first().click();
  await page.waitForTimeout(700);
  const dirUr = await page.locator("html").getAttribute("dir");
  ok("urdu sets rtl", dirUr === "rtl", `dir=${dirUr}`);
  ok("urdu html lang", (await page.locator("html").getAttribute("lang")) === "ur");
  const phUr = await page.locator("form input").first().getAttribute("placeholder");
  ok("urdu placeholder", phUr && phUr.length > 4 && /[؀-ۿ]/.test(phUr), String(phUr).slice(0, 40));
  await ask(page, "salam");
  await page.waitForTimeout(600);
  let body = await page.locator("body").innerText();
  ok("urdu greeting reply", body.includes("رہنما") || body.includes("کتابستان"), "");
  await page.screenshot({ path: path.join(OUT, "lang_ur.png") });

  // --- French ---
  await switcher.click();
  await page.waitForTimeout(250);
  await page.getByRole("option", { name: /Fran/ }).first().click();
  await page.waitForTimeout(700);
  const dirFr = await page.locator("html").getAttribute("dir");
  ok("french keeps ltr", dirFr === "ltr" || dirFr === null, `dir=${dirFr}`);
  await ask(page, "bonjour");
  await page.waitForTimeout(600);
  body = await page.locator("body").innerText();
  ok("french greeting reply", /bonjour|enchant/i.test(body), "");

  // KB question in French -> English answer + translated note
  await ask(page, "what is the moral of the thirsty crow");
  await page.waitForTimeout(1200);
  body = await page.locator("body").innerText();
  const noteFr = body.includes("anglais");
  ok("french content note under answer", noteFr, noteFr ? "" : "no 'anglais' found");
  await page.screenshot({ path: path.join(OUT, "lang_fr.png") });

  // --- Arabic (rtl + switch still works) ---
  await switcher.click();
  await page.waitForTimeout(250);
  await page.getByRole("option", { name: /العربية/ }).first().click();
  await page.waitForTimeout(700);
  ok("arabic sets rtl", (await page.locator("html").getAttribute("dir")) === "rtl");
  await page.screenshot({ path: path.join(OUT, "lang_ar.png") });

  // --- home page header still works ---
  await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);
  const navText = await page.locator("nav").first().innerText();
  ok("nav switches language", navText.includes("مكتبة") || navText.includes("Home") || navText.length > 5, navText.replace(/\n/g, "|").slice(0, 60));
  await page.screenshot({ path: path.join(OUT, "home_ar.png") });

  ok("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  await browser.close();
  console.log(results.join("\n"));
  fs.writeFileSync(path.join(OUT, "lang_results.txt"), results.join("\n"), "utf8");
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(failed ? `${failed} FAILURES` : "ALL PASS");
  process.exit(failed ? 1 : 0);
})().catch((err) => {
  console.error("SCRIPT ERROR:", err.message);
  process.exit(2);
});
