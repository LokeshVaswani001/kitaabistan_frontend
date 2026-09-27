const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EXPECT = [
  { code: "en", native: null, text: "No card, no app store" },
  { code: "ur", native: "اردو", text: "نہ کارڈ" },
  { code: "ja", native: "日本語", text: "カードもアプリストアも不要" },
  { code: "de", native: "Deutsch", text: "Keine Karte, kein App Store" },
];

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 940 } });
  let bad = 0;
  for (const e of EXPECT) {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    if (e.native) {
      await page.locator("button[aria-label='Change language']").first().click();
      await page.waitForTimeout(220);
      await page.locator("[role='option']").filter({ hasText: e.native }).first().click();
      await page.waitForTimeout(450);
    }
    const body = await page.locator("body").innerText();
    const ok = body.includes(e.text);
    if (!ok) bad++;
    console.log(`${ok ? "PASS" : "FAIL"}  heroNote ${e.code}`);
  }
  await browser.close();
  console.log(bad ? `${bad} FAILURES` : "ALL PASS");
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error("SCRIPT ERROR:", e.message);
  process.exit(2);
});
