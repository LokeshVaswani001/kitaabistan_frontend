const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";
const theme = process.argv[2] || "light";
const only = process.argv[3];

const ROUTES = [
  "/", "/?welcome=1", "/home", "/library", "/chatbot", "/profile", "/saved", "/import",
  "/poems", "/stories", "/login", "/signup", "/demo", "/onboarding",
  "/terms", "/privacy", "/book/n9",
];

async function getSession() {
  const email = `px${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Px", email, password: "Secret#1234" }),
  });
  return res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");
}

/* Collect visible text elements for the current scroll position. */
const collect = () => {
  const out = [];
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // When a modal gate is open (e.g. /?welcome=1), only audit what is
  // actually visible on top — everything behind the overlay is covered.
  const root = document.querySelector('[role="dialog"][aria-modal="true"]') || document.body;
  for (const el of root.querySelectorAll("*")) {
    const st = getComputedStyle(el);
    if (st.display === "none" || st.visibility === "hidden") continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").trim();
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) continue;
    if (r.width < 4 || r.height < 4) continue;
    if (r.width > vw * 0.98 && r.height > vh * 0.98) continue;
    const fg = st.color;
    if (fg.startsWith("rgba(0, 0, 0, 0)") || fg === "transparent") continue;
    if (el.closest("[disabled], [aria-disabled=true]")) continue;
    if (parseFloat(st.opacity) < 0.99) continue;
    const only = [...own].filter((ch) => ch.trim()).every((ch) => ch.codePointAt(0) > 0x2000);
    if (only) continue;
    const size = parseFloat(st.fontSize);
    const weight = parseInt(st.fontWeight, 10) || 400;
    out.push({
      x: Math.max(0, Math.round(r.left)),
      y: Math.max(0, Math.round(r.top)),
      w: Math.min(vw, Math.round(r.right)) - Math.max(0, Math.round(r.left)),
      h: Math.min(vh, Math.round(r.bottom)) - Math.max(0, Math.round(r.top)),
      color: fg,
      size,
      weight,
      need: size >= 24 || (weight >= 700 && size >= 18.66) ? 3 : 4.5,
      text: own.slice(0, 60).replace(/\s+/g, " "),
      tag: el.tagName.toLowerCase(),
      cls: (el.getAttribute("class") || "").slice(0, 110),
    });
  }
  return out;
};

/* Decode the viewport PNG and compare each element's text colour with the
   dominant (modal) colour actually painted behind it. Handles gradients,
   images and transparency because it reads final pixels. */
const analyse = ({ b64, els }) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      const parse = (css) => {
        const m = css.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const p = m[1].split(",").map((v) => parseFloat(v.trim()));
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const lum = (r, g, b) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const cr = (a, b) => {
        const l1 = lum(a.r, a.g, a.b), l2 = lum(b.r, b.g, b.b);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };

      const bad = [];
      for (const e of els) {
        const w = Math.min(e.w, 900);
        const h = Math.min(e.h, 400);
        if (w < 6 || h < 6) continue;
        let data;
        try { data = ctx.getImageData(e.x, e.y, w, h).data; } catch { continue; }
        // modal colour of the region (background dominates any text box)
        const hist = new Map();
        const stride = Math.max(1, Math.floor(Math.sqrt((w * h) / 4000))) * 4;
        for (let i = 0; i < data.length; i += stride) {
          if (data[i + 3] < 128) continue;
          const k = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
          hist.set(k, (hist.get(k) || 0) + 1);
        }
        let bk = null, bc = -1;
        for (const [k, n] of hist) if (n > bc) { bc = n; bk = k; }
        if (bk === null) continue;
        const bg = {
          r: (((bk >> 10) & 31) << 3) + 4,
          g: (((bk >> 5) & 31) << 3) + 4,
          b: (bk & 31) << 3 | 0,
        };
        const fg = parse(e.color);
        if (!fg) continue;
        const eff = fg.a < 1
          ? { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) }
          : fg;
        const ratio = cr(eff, bg);
        if (ratio < e.need) {
          bad.push({
            r: Math.round(ratio * 100) / 100,
            need: e.need,
            text: e.text,
            color: e.color,
            bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
            cls: e.cls,
            tag: e.tag,
            size: e.size,
          });
        }
      }
      resolve(bad);
    };
    img.onerror = () => resolve([]);
    img.src = "data:image/png;base64," + b64;
  });

(async () => {
  const session = process.env.NO_SESSION ? null : await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((t) => localStorage.setItem("kitaabistan_theme", t), theme);
  if (session) await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();

  const seen = new Set();
  let total = 0;
  for (const route of ROUTES) {
    if (only && !route.includes(only)) continue;
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(700);
    const pageH = await page.evaluate(() => document.body.scrollHeight);
    const steps = Math.min(10, Math.max(1, Math.ceil(pageH / 700)));
    let routeIssues = 0;
    for (let s = 0; s < steps; s++) {
      const y = Math.min(s * 700, Math.max(0, pageH - 940));
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(450);
      const els = await page.evaluate(collect);
      if (!els.length) continue;
      const shot = await page.screenshot({ type: "png" });
      const bad = await page.evaluate(analyse, { b64: shot.toString("base64"), els });
      for (const b of bad) {
        const key = `${route}|${b.tag}.${b.cls}|${b.color}|${b.text}`;
        if (seen.has(key)) continue;
        seen.add(key);
        routeIssues++;
        total++;
        if (routeIssues === 1) console.log(`\n### ${route}`);
        console.log(`  ${b.r}:1 (need ${b.need}) <${b.tag}> "${b.text}"`);
        console.log(`      color=${b.color}  bg=${b.bg}  size=${b.size}  class="${b.cls}"`);
      }
    }
    if (!routeIssues) console.log(`\n### ${route}  OK`);
  }
  await browser.close();
  console.log(`\n${theme.toUpperCase()} PIXEL TOTAL: ${total}`);
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
