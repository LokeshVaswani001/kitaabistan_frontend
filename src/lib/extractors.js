const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(xml) {
  return xml.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (m, key) => {
    if (key[0] === "#") {
      const code = key[1] === "x" || key[1] === "X" ? parseInt(key.slice(2), 16) : parseInt(key.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[key] ?? m;
  });
}

function cleanXmlText(xml) {
  return xml
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tr>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

async function pdfjs() {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!globalThis.pdfjsWorker) {
    globalThis.pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
  }
  return pdfjs;
}

export async function extractPdfText(buffer, label = "") {
  const lib = await pdfjs();
  const doc = await lib.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: false,
  }).promise;
  try {
    const pages = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      const parts = [];
      for (const item of content.items) {
        if (typeof item.str !== "string") continue;
        parts.push(item.str);
        if (item.hasEOL) parts.push("\n");
      }
      pages.push(parts.join("").trim());
      page.cleanup();
    }
    let title = "";
    try {
      const meta = await doc.getMetadata();
      title = String(meta?.info?.Title || "").trim();
    } catch {
      title = "";
    }
    const text = pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
    if (!title) title = guessTitle(label, text);
    return { text, title };
  } finally {
    try {
      await doc?.destroy?.();
    } catch {
      /* ignore */
    }
  }
}

export async function extractDocxText(buffer, label = "") {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const entry = zip.file("word/document.xml") || zip.file("word/document2.xml");
  if (!entry) throw new Error("unsupported-docx");
  const xml = await entry.async("string");
  const text = cleanXmlText(decodeEntities(xml)).replace(/^\s+|\s+$/g, "");
  return { text, title: guessTitle(label, text) };
}

export function sniffBytes(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length > 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return "pdf";
  if (b.length > 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05)) return "zip";
  if (b.length > 8 && b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return "doc";
  if (b.length > 15 && new TextDecoder().decode(b.subarray(0, 16)).includes("<")) return "html";
  return "text";
}

export function extensionOf(name = "") {
  const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function guessTitle(label, text) {
  const fromName = String(label)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\.(book|text|plain|pdf)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (fromName && !/^(book|document|untitled)$/i.test(fromName)) return fromName.slice(0, 160);
  const firstLine = (text.split("\n").find((l) => l.trim().length > 3) || "").trim();
  return firstLine.slice(0, 160) || "Imported book";
}
