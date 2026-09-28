const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const OUT = path.join(require("os").tmpdir(), "kitaab_shots");

let pass = 0;
let fail = 0;
const check = (label, ok, extra = "") => {
  if (ok) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${extra ? " :: " + extra : ""}`);
  }
};

const EXPECT = {
  en: { title: "Welcome to Kitaabistan", btn: "Start reading" },
  fr: { title: "Bienvenue sur Kitaabistan", btn: "Commencer à lire" },
  ur: { title: "کتابستان میں خوش آمدید", btn: "پڑھنا شروع کریں" },
};

async function run(browser, theme, viewport, label, lang) {
  const ctx = await browser.newContext({ viewport, colorScheme: theme === "dark" ? "dark" : "light" });
  await ctx.addInitScript(
    ([th, lg]) => {
      window.localStorage.setItem("kitaabistan_theme", th);
      window.localStorage.setItem("kitaabistan_lang", lg);
    },
    [theme, lang]
  );
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?welcome=1`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(900);

  const dialog = page.locator('[role="dialog"]');
  check(`${label}: gate visible`, (await dialog.count()) === 1 && (await dialog.isVisible()));

  const h1 = (await page.locator('[role="dialog"] h1').textContent())?.trim() || "";
  check(`${label}: heading (${lang})`, h1 === EXPECT[lang].title, `got "${h1}"`);

  const cards = page.locator('[role="dialog"] article.card');
  const n = await cards.count();
  check(`${label}: 4 feature cards`, n === 4, `got ${n}`);

  const enterBtn = page.locator('[data-testid="welcome-enter"]');
  check(`${label}: enter button present`, (await enterBtn.count()) === 1);
  const btnText = (await enterBtn.textContent())?.trim() || "";
  check(`${label}: button text (${lang})`, btnText.startsWith(EXPECT[lang].btn), `got "${btnText}"`);

  const kid = page.locator('[data-testid="welcome-kid"]');
  check(`${label}: waving child present`, (await kid.count()) === 1 && (await kid.isVisible()));
  const armAnim = await page.evaluate(() => {
    const arm = document.querySelector('[data-testid="welcome-kid"] .kid-arm');
    return arm ? getComputedStyle(arm).animationName : "missing";
  });
  check(`${label}: child arm animation`, armAnim.includes("kid-wave"), armAnim);
  const hopAnim = await page.evaluate(() => {
    const body = document.querySelector('[data-testid="welcome-kid"] .kid-body');
    return body ? getComputedStyle(body).animationName : "missing";
  });
  check(`${label}: child body hop`, hopAnim.includes("kid-hop"), hopAnim);
  const armT1 = await page.evaluate(() => {
    const arm = document.querySelector('[data-testid="welcome-kid"] .kid-arm');
    return arm ? getComputedStyle(arm).transform : "";
  });
  await page.waitForTimeout(400);
  const armT2 = await page.evaluate(() => {
    const arm = document.querySelector('[data-testid="welcome-kid"] .kid-arm');
    return arm ? getComputedStyle(arm).transform : "";
  });
  check(`${label}: child arm moving`, !!armT1 && armT1 !== armT2, `${armT1} -> ${armT2}`);

  // pixel proof: skin + shirt colours actually painted inside the kid box
  const kidBox = await page.evaluate(() => {
    const svg = document.querySelector('[data-testid="welcome-kid"]');
    const b = svg.getBoundingClientRect();
    return { x: b.x, y: b.y, w: b.width, h: b.height };
  });
  const gateShot = await page.screenshot({ type: "png" });
  const kidPix = await page.evaluate(
    async ({ b64, box }) => {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = "data:image/png;base64," + b64;
      });
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const x = Math.max(0, Math.round(box.x));
      const y = Math.max(0, Math.round(box.y));
      const w = Math.min(img.width - x, Math.round(box.w));
      const h = Math.min(img.height - y, Math.round(box.h));
      if (w < 4 || h < 4) return { skin: 0, shirt: 0 };
      const d = ctx.getImageData(x, y, w, h).data;
      let skin = 0;
      let shirt = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        if (r > 225 && g > 175 && g < 215 && b > 135 && b < 190) skin++;
        if (g - r > 25 && g > 60 && g < 240) shirt++;
      }
      return { skin, shirt };
    },
    { b64: gateShot.toString("base64"), box: kidBox }
  );
  check(
    `${label}: child pixels rendered`,
    kidPix.skin > 400 && kidPix.shirt > 300,
    JSON.stringify(kidPix)
  );

  if (viewport.width >= 1024) {
    const sides = await page.evaluate(() => {
      const k = document.querySelector('[data-testid="welcome-kid"]').getBoundingClientRect();
      const h = document.querySelector('[role="dialog"] h1').getBoundingClientRect();
      return { kidLeft: Math.round(k.left), h1Left: Math.round(h.left) };
    });
    check(
      `${label}: child stands left of welcome text`,
      sides.kidLeft < sides.h1Left,
      JSON.stringify(sides)
    );
  }

  const langBtn = page.locator('[role="dialog"] button[aria-label="Change language"]');
  check(`${label}: language switcher inside gate`, (await langBtn.count()) >= 1);
  const themeBtn = page.locator('[role="dialog"] button[aria-label*="mode"]');
  check(`${label}: theme toggle inside gate`, (await themeBtn.count()) === 1);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${label}: no horizontal overflow`, overflow <= 1, `overflow=${overflow}`);

  await page.screenshot({ path: path.join(OUT, `welcome-${label}.png`), fullPage: false });
  console.log(`saved welcome-${label}.png`);

  // Enter -> gate leaves, landing hero shows, scroll unlocked
  await enterBtn.click();
  await page.waitForTimeout(800);
  check(`${label}: gate dismissed`, (await page.locator('[role="dialog"]').count()) === 0);
  const hero = await page.locator("main h1").first().textContent();
  check(`${label}: landing revealed`, !!hero && hero.length > 5, `got "${hero}"`);
  const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
  check(`${label}: scroll unlocked`, bodyOverflow !== "hidden", `overflow="${bodyOverflow}"`);

  await page.screenshot({ path: path.join(OUT, `welcome-after-${label}.png`), fullPage: false });
  await ctx.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });

  // default load in automation must skip the gate (keeps existing tests green)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    check("default / skips gate in automation", (await page.locator('[role="dialog"]').count()) === 0);
    await page.goto(`${BASE}/?nowelcome=1`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(500);
    check("?nowelcome=1 skips gate", (await page.locator('[role="dialog"]').count()) === 0);
    await ctx.close();
  }

  await run(browser, "light", { width: 1440, height: 940 }, "desktop-light", "en");
  await run(browser, "dark", { width: 1440, height: 940 }, "desktop-dark", "en");
  await run(browser, "light", { width: 390, height: 844 }, "mobile-light", "en");
  await run(browser, "dark", { width: 390, height: 844 }, "mobile-dark", "en");
  await run(browser, "light", { width: 1440, height: 940 }, "desktop-light-fr", "fr");
  await run(browser, "light", { width: 390, height: 844 }, "mobile-light-ur", "ur");

  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
