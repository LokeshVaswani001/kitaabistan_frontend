const { chromium } = require("playwright-core");

const BASE = "http://localhost:3000";
const theme = process.argv[2] || "light";
const only = process.argv[3];

const ROUTES = [
  "/", "/home", "/library", "/chatbot", "/profile", "/saved", "/import",
  "/poems", "/stories", "/login", "/signup", "/demo", "/onboarding",
  "/terms", "/privacy", "/book/n9",
];

async function getSession() {
  const email = `audit${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Audit", email, password: "Secret#1234" }),
  });
  return res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");
}

const AUDIT = () => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const bgOf = (el) => {
    let cur = el;
    let acc = null;
    while (cur) {
      const c = parse(getComputedStyle(cur).backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc.a >= 0.999) return acc;
      }
      cur = cur.parentElement;
    }
    return acc && acc.a >= 0.999 ? acc : { r: 255, g: 255, b: 255, a: 1 };
  };

  const out = [];
  const els = document.querySelectorAll("body *");
  for (const el of els) {
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").trim();
    if (!text) continue;
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    if (parseFloat(st.opacity) < 0.15) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    const fg = parse(st.color);
    if (!fg) continue;
    const bg = bgOf(el);
    const eff = fg.a < 1 ? over(fg, bg) : fg;
    const r = ratio(eff, bg);
    const size = parseFloat(st.fontSize);
    const bold = parseInt(st.fontWeight, 10) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const need = large ? 3 : 4.5;
    if (r < need) {
      out.push({
        r: Math.round(r * 100) / 100,
        need,
        text: text.slice(0, 70).replace(/\s+/g, " "),
        color: st.color,
        bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
        cls: (el.className && el.className.toString ? el.className.toString() : "").slice(0, 110),
        tag: el.tagName.toLowerCase(),
      });
    }
  }
  return out;
};

(async () => {
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addInitScript((t) => localStorage.setItem("kitaabistan_theme", t), theme);
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();

  let total = 0;
  for (const route of ROUTES) {
    if (only && !route.includes(only)) continue;
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(900);
    const issues = await page.evaluate(AUDIT);
    if (issues.length) {
      total += issues.length;
      console.log(`\n### ${route}  (${issues.length} issues)`);
      const seen = new Set();
      for (const i of issues) {
        const key = `${i.tag}.${i.cls}|${i.color}|${i.bg}`;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  ${i.r}:1 (need ${i.need})  <${i.tag}> "${i.text}"`);
        console.log(`      color=${i.color}  bg=${i.bg}  class="${i.cls}"`);
      }
    } else {
      console.log(`\n### ${route}  OK`);
    }
  }
  await browser.close();
  console.log(`\n${theme.toUpperCase()} TOTAL: ${total}`);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
