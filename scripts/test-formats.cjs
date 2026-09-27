const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright-core");

const BASE = "http://localhost:3000";
const OUT = path.join(os.tmpdir(), "kitaab_shots");
const FIX = path.join(os.tmpdir(), "kitaab_fixtures");

const DOCX_TEXT = [
  "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.",
  "Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.",
  "And what is the use of a book, thought Alice, without pictures or conversations? So she was considering in her own mind, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies.",
];

async function makeFixtures() {
  fs.mkdirSync(FIX, { recursive: true });
  const JSZip = require("jszip");
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
  );
  const paras = DOCX_TEXT.map(
    (t) => `<w:p><w:r><w:t xml:space="preserve">${t}</w:t></w:r></w:p>`
  ).join("");
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`
  );
  const docxPath = path.join(FIX, "alice-sample.docx");
  const buf = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(docxPath, buf);

  const pdfPath = path.join(FIX, "sample.pdf");
  const res = await fetch("https://pdfobject.com/pdf/sample.pdf");
  fs.writeFileSync(pdfPath, Buffer.from(await res.arrayBuffer()));
  console.log("fixtures:", docxPath, fs.statSync(docxPath).size, "|", pdfPath, fs.statSync(pdfPath).size);
  return { docxPath, pdfPath };
}

async function getSession() {
  const email = `fmt${Date.now()}@test.com`;
  const res = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Format Tester", email, password: "Secret#1234" }),
  });
  return res.headers.get("set-cookie").split(";")[0].split("=").slice(1).join("=");
}

async function upload(page, filePath) {
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await page.getByText("Confirm before saving").waitFor({ timeout: 30000 });
}

async function save(page) {
  await page.getByRole("button", { name: /Save book/i }).click();
  await page.getByText("SAVED BOOKS").waitFor({ timeout: 15000 });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { docxPath, pdfPath } = await makeFixtures();
  const session = await getSession();
  const browser = await chromium.launch({ channel: "msedge", headless: true, args: ["--no-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 940 } });
  await ctx.addCookies([{ name: "kitaabistan_session", value: session, url: BASE }]);
  const page = await ctx.newPage();

  await page.goto(`${BASE}/import`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  // 1. PDF upload
  await upload(page, pdfPath);
  const pdfTitle = await page.locator('input[placeholder="Title"]').inputValue();
  await page.screenshot({ path: path.join(OUT, "formats_pdf_draft.png") });
  await save(page);
  const pdfInList = (await page.getByText(pdfTitle, { exact: false }).count()) > 0;
  console.log(`pdf upload: title='${pdfTitle}' listed=${pdfInList}`);
  await page.screenshot({ path: path.join(OUT, "formats_pdf_saved.png") });

  // 2. DOCX upload
  await upload(page, docxPath);
  const docxTitle = await page.locator('input[placeholder="Title"]').inputValue();
  await save(page);
  const docxInList = (await page.getByText(docxTitle, { exact: false }).count()) > 0;
  console.log(`docx upload: title='${docxTitle}' listed=${docxInList}`);
  await page.screenshot({ path: path.join(OUT, "formats_docx_saved.png") });

  // 3. Read the DOCX book
  await page
    .locator('a[href^="/book/imp_"]', { hasText: docxTitle })
    .first()
    .click();
  await page.waitForTimeout(1500);
  const bodyText = await page.locator("body").innerText();
  const readerOk = bodyText.includes("Alice was beginning");
  console.log(`reader shows docx text: ${readerOk}`);
  await page.screenshot({ path: path.join(OUT, "formats_reader.png") });

  // 4. Chatbot answers from the PDF book
  await page.goto(`${BASE}/chatbot`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.locator("form input").first().fill("what does the simple pdf file say about fun fun fun?");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1800);
  const chatText = await page.locator("body").innerText();
  const chatOk = /Found this in your saved book|simple PDF file/i.test(chatText);
  console.log(`chatbot answered from imported book: ${chatOk}`);
  await page.screenshot({ path: path.join(OUT, "formats_chat.png") });

  await browser.close();
  const pass = pdfInList && docxInList && readerOk && chatOk;
  console.log(pass ? "PASS" : "FAIL");
  process.exit(pass ? 0 : 1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
