const fs = require("fs");
const { chromium } = require("playwright-core");

const BASE = process.argv[2] || "http://localhost:3000";
const CODES = process.argv[3] ? process.argv[3].split(",") : ["en", "ur", "ar", "fa", "hi", "tr", "fr", "es", "de", "ru", "zh", "id", "ja"];

function key(code, k) {
  if (code === "en" || code === "ur") {
    const lines = fs.readFileSync("src/lib/translations.js", "utf8").split(/\r?\n/);
    const hits = [];
    lines.forEach((l, i) => {
      const m = l.match(new RegExp(`^ {4}${k}: "((?:[^"\\\\]|\\\\.)*)"`));
      if (m) hits.push({ i, v: m[1] });
    });
    const urStart = lines.findIndex((l) => /^ {2}ur: \{/.test(l));
    const pick = hits.filter((h) => (code === "ur" ? h.i > urStart : h.i < urStart));
    return pick.length ? pick[pick.length - 1].v : null;
  }
  const t = fs.readFileSync(`src/lib/locales/lang/${code}.js`, "utf8");
  const m = t.match(new RegExp(`^ {2}${k}: "((?:[^"\\\\]|\\\\.)*)"`, "m"));
  return m ? m[1] : null;
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  let bad = 0;
  for (const code of CODES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
    await ctx.addInitScript((c) => localStorage.setItem("kitaabistan_lang", c), code);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 100)));

    const checks = [];
    for (const [path, k, sel] of [
      ["/signup", "freeAccount", null],
      ["/login", "welcomeBack", null],
    ]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(1200);
      const want = key(code, k);
      const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
      checks.push({ k, ok: want ? body.includes(want) : false, want });
    }

    /* submit empty signup -> localized validation errors */
    await page.goto(`${BASE}/signup`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(1000);
    await page.click('form button[type="submit"]');
    await page.waitForTimeout(900);
    const body = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
    const wantErr = key(code, "errNameLength");
    checks.push({ k: "errNameLength", ok: wantErr ? body.includes(wantErr) : false, want: wantErr });

    const failed = checks.filter((c) => !c.ok);
    if (failed.length) bad++;
    console.log(
      `${failed.length ? "FAIL" : "PASS"}  ${code.padEnd(3)} ${checks
        .map((c) => `${c.k}=${c.ok ? "ok" : "MISSING"}`)
        .join(" ")}${failed.length ? "  want: " + failed.map((f) => f.want).join(" | ") : ""}${errors.length ? "  JSERR:" + errors[0] : ""}`
    );
    await ctx.close();
  }
  console.log(bad === 0 ? "\nALL PASS" : `\n${bad} LOCALES FAILED`);
  await browser.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
