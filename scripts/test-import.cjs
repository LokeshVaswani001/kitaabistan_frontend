// E2E: import a real book from a URL, read it, then ask the offline
// chatbot about it. Saves screenshots to the shots folder.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");

async function getSession() {
  const email = `imp${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Import Tester", email, password: "Secret#1234" }),
  });
  const raw = res.headers.get("set-cookie");
  if (res.ok && raw) return raw.split(";")[0].split("=").slice(1).join("=");
  throw new Error(`signup failed: ${res.status}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();

  // 1. Import page, empty state
  await page.goto(`${BASE}/import`, { waitUntil: "networkidle", timeout: 60000 });
  await page.screenshot({ path: path.join(OUT, "import_empty.png") });
  console.log("1/5 import_empty.png");

  // 2. Download a real book (Pinocchio — not in the bundled library)
  await page.fill('input[type="url"]', "https://www.gutenberg.org/cache/epub/500/pg500.txt");
  await page.getByRole("button", { name: /Download/ }).click();
  await page.waitForSelector('input[value], input[placeholder*="Title" i]', { timeout: 60000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, "import_draft.png") });
  console.log("2/5 import_draft.png");

  // 3. Save it
  await page.getByRole("button", { name: /Save book/ }).click();
  await page.waitForSelector('a[href^="/book/imp_"]', { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, "import_saved.png") });
  console.log("3/5 import_saved.png");

  // 4. Read it
  const href = await page.getAttribute('a[href^="/book/imp_"]', "href");
  await page.goto(`${BASE}${href}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "import_reader.png") });
  const bodyText = await page.textContent("body");
  const readerOk = /Pinocchio|candle|cricket/i.test(bodyText);
  console.log(`4/5 import_reader.png (content visible: ${readerOk})`);

  // 5. Ask the offline chatbot about the saved book
  await page.goto(`${BASE}/chatbot`, { waitUntil: "networkidle", timeout: 60000 });
  await page.fill("form input", "what did the talking cricket say to Pinocchio");
  await page.keyboard.press("Enter");
  await page.waitForSelector('[class*="bot"], .bot', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);
  const chatText = await page.textContent("body");
  const chatOk = /Found this in your saved book|Pinocchio/i.test(chatText);
  await page.screenshot({ path: path.join(OUT, "import_chat.png") });
  console.log(`5/5 import_chat.png (chat answered from book: ${chatOk})`);

  await browser.close();
  if (!readerOk || !chatOk) {
    console.error("FAILED", { readerOk, chatOk });
    process.exit(1);
  }
  console.log("PASS");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
