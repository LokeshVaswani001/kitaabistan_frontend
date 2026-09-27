const { chromium } = require("playwright-core");

const BASE = process.argv[2] || "https://kitaabistanfrontend.vercel.app";
const email = `live${Date.now()}@test.com`;

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message.slice(0, 160)));

  const cookies = async (label) => {
    const c = await ctx.cookies();
    console.log(`  cookies[${label}]:`, c.map((x) => `${x.name}=${x.value.slice(0, 18)}(${x.domain})`).join(", ") || "NONE");
  };

  console.log("1) open /signup");
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(600);
  console.log("  url:", page.url());
  await cookies("signup-page");

  console.log("2) fill + submit signup");
  const inputs = await page.locator("input").all();
  console.log("  inputs:", inputs.length);
  for (const i of inputs) console.log("    type=", await i.getAttribute("type"), "name=", await i.getAttribute("name"), "ph=", await i.getAttribute("placeholder"));
  const fields = await Promise.all(inputs.map((i) => i.getAttribute("type")));
  const nameI = inputs[0];
  await nameI.fill("Live Tester");
  const emailIdx = fields.indexOf("email");
  const passIdx = fields.indexOf("password");
  if (emailIdx >= 0) await inputs[emailIdx].fill(email);
  if (passIdx >= 0) await inputs[passIdx].fill("Secret#1234");
  const pw2 = await page.locator("input[type=password]").count();
  if (pw2 > 1) await page.locator("input[type=password]").nth(1).fill("Secret#1234");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3500);
  console.log("  after submit url:", page.url());
  await cookies("after-signup");

  const me = await page.request.get(`${BASE}/api/auth/me`);
  console.log("  /api/auth/me:", me.status(), (await me.text()).slice(0, 120));

  for (const p of ["/home", "/chatbot", "/library", "/saved", "/profile", "/poems"]) {
    await page.goto(`${BASE}${p}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1800);
    const finalUrl = page.url();
    console.log(`  ${p} -> ${finalUrl.replace(BASE, "")}`);
  }

  console.log("console errors:", errors.length ? errors.slice(0, 8) : "none");
  await browser.close();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
