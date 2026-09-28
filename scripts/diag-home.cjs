const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";

async function getSession() {
  const email = `diag${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Diag", email, password: "Secret#1234" }),
  });
  const raw = res.headers.get("set-cookie") || "";
  return { cookie: raw.split(";")[0].split("=").slice(1).join("="), status: res.status };
}

(async () => {
  const { cookie, status } = await getSession();
  console.log("signup status:", status, "cookie len:", cookie.length);
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: cookie, url: BASE }]);
  const page = await ctx.newPage();
  const seen = [];
  page.on("framenavigated", (f) => { if (f === page.mainFrame()) seen.push(f.url()); });

  await page.goto(`${BASE}/home`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  console.log("final url:", page.url());
  console.log("navigations:", seen.join(" -> "));
  const text = await page.locator("body").innerText();
  console.log("has landing CTA:", text.includes("START READING") || text.includes("Open a book tonight"));
  console.log("has tab nav:", text.includes("Library") && text.includes("Saved"));
  console.log("first 220 chars:", text.slice(0, 220).replace(/\n/g, " | "));
  const footers = await page.locator("footer").count();
  const ftext = footers ? (await page.locator("footer").first().innerText()).slice(0, 120).replace(/\n/g, " | ") : "";
  console.log("footers:", footers, "| first footer:", ftext);
  await browser.close();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(2); });
