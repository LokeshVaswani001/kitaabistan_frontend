const { chromium } = require("playwright-core");
const BASE = "http://localhost:3000";
const theme = process.argv[2] || "light";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addInitScript((t) => localStorage.setItem("kitaabistan_theme", t), theme);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const probe = await page.evaluate(() => {
    const card = document.querySelector(".bg-brand-deep");
    const eyebrow = [...document.querySelectorAll(".eyebrow")].find((e) => e.textContent.includes("OFFLINE") || e.textContent.includes("AI") || e.textContent.includes("chatbot") || true);
    const gt = document.querySelector(".gradient-text");
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const cardCS = cs(card);
    return {
      htmlTheme: document.documentElement.getAttribute("data-theme"),
      cardFound: !!card,
      cardBgColor: cardCS && cardCS.backgroundColor,
      cardBgImage: cardCS && cardCS.backgroundImage.slice(0, 80),
      cardClass: card && card.className,
      cardText: card && card.textContent.slice(0, 40),
      eyebrowColor: eyebrow && cs(eyebrow).color,
      eyebrowStyle: eyebrow && eyebrow.getAttribute("style"),
      eyebrowText: eyebrow && eyebrow.textContent.trim().slice(0, 30),
      gtColor: gt && cs(gt).color,
      gtBgImage: gt && cs(gt).backgroundImage.slice(0, 90),
      gtText: gt && gt.textContent,
      brandVar: getComputedStyle(document.documentElement).getPropertyValue("--brand"),
      brandDeepVar: getComputedStyle(document.documentElement).getPropertyValue("--brand-deep"),
      colorBrandDeep: getComputedStyle(document.documentElement).getPropertyValue("--color-brand-deep"),
    };
  });
  console.log(JSON.stringify(probe, null, 2));
  await browser.close();
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
