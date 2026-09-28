const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:3000";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  const out = await page.evaluate(async () => {
    const files = ["home", "library", "chatbot", "languages", "add-books", "animated-books"];
    const res = [];
    for (const f of files) {
      const img = new Image();
      img.src = `/screenshots/${f}.png`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const px = (x, y) => [...ctx.getImageData(x, y, 1, 1).data];
      res.push({
        f,
        type: ctx.getImageData(0, 0, 1, 1).data.length === 4 ? "rgba" : "rgb",
        corners: [px(2, 2), px(img.naturalWidth - 3, 2), px(2, img.naturalHeight - 3), px(img.naturalWidth - 3, img.naturalHeight - 3)],
        mid: px(Math.floor(img.naturalWidth / 2), 4),
      });
    }
    return res;
  });
  out.forEach((o) => console.log(o.f, "corners", JSON.stringify(o.corners), "topmid", JSON.stringify(o.mid)));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
