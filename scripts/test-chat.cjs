const { chromium } = require("playwright-core");

const QUESTIONS = [
  "salam",
  "thank you",
  "what is the moral of the ant and the grasshopper",
  "does it work without internet",
  "aur batao",
  "daffodils ki pehli line",
  "full poem",
  "what is the moral of the tortoise and the hare",
  "who are you",
  "how do streaks and badges work",
  "is it free",
  "what happens in the thirsty crow",
  "نماز کیا ہے",
  "کچھوہ اور خرگہ کا سبق کیا ہے",
  "السلام علیکم",
  "what is the moral of the thirsty crow",
  "xyzzy plugh foobar 12345",
];

(async () => {
  const email = `chat${Date.now()}@test.com`;
  const res = await fetch("http://localhost:3000/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Chat Test", email, password: "Secret#1234" }),
  });
  const session = res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");

  const b = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 1000 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: "http://localhost:3000" }]);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/chatbot", { waitUntil: "networkidle" });

  for (const q of QUESTIONS) {
    const before = await p.locator('div[class*="max-w-"][class*="86"]').count();
    await p.locator("form input").fill(q);
    await p.keyboard.press("Enter");
    await p.waitForFunction(
      (n) => document.querySelectorAll('div[class*="max-w-"][class*="86"]').length >= n + 2,
      before,
      { timeout: 15000 }
    );
    const wrappers = p.locator('div[class*="max-w-"][class*="86"]');
    const last = wrappers.last();
    const text = (await last.innerText()).replace(/\s+/g, " ");
    const chips = await last.locator("button:not([aria-label])").allInnerTexts();
    console.log(`\nQ: ${q}`);
    console.log(`A: ${text.slice(0, 340)}`);
    if (chips.length) console.log(`chips: ${JSON.stringify(chips.slice(0, 4))}`);
  }

  await b.close();
})();
