// User-imported books, stored locally in IndexedDB so they work fully
// offline: download/paste once, then read and chat about them anytime.

const DB_NAME = "kitaabistan_imports";
const STORE = "books";
const MAX_CHARS = 6_000_000;

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function run(mode, work) {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    let req;
    try {
      req = work(t.objectStore(STORE));
    } catch (err) {
      reject(err);
      return;
    }
    if (req) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    }
  });
}

export async function listImportedBooks() {
  const rows = (await run("readonly", (s) => s.getAll())) || [];
  return rows
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    .map(({ id, title, author, addedAt, chars }) => ({ id, title, author, addedAt, chars }));
}

export async function getImportedBook(id) {
  return (await run("readonly", (s) => s.get(id))) || null;
}

export async function saveImportedBook({ title, author, text }) {
  const clean = String(text || "")
    .replace(/\r\n?/g, "\n")
    .slice(0, MAX_CHARS);
  if (clean.trim().length < 120) throw new Error("too-short");
  const rec = {
    id: `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: String(title || "Imported book").trim().slice(0, 160) || "Imported book",
    author: String(author || "").trim().slice(0, 120),
    text: clean,
    chars: clean.length,
    addedAt: Date.now(),
  };
  await run("readwrite", (s) => s.put(rec));
  return rec;
}

export async function deleteImportedBook(id) {
  await run("readwrite", (s) => s.delete(id));
}

const STOP = new Set([
  "the", "a", "an", "of", "and", "or", "to", "in", "is", "it", "on", "for", "with", "as",
  "at", "by", "be", "this", "that", "what", "who", "when", "where", "how", "do", "does",
  "did", "tell", "me", "about", "please", "from", "there", "their", "they", "them", "then",
  "than", "into", "out", "off", "all", "any", "can", "could", "would", "should", "will",
  "hai", "ka", "ke", "ki", "ko", "se", "me", "aur", "ya", "kya", "koi", "kya", "bata",
  "batao", "bolo", "suna", "wo", "woh", "ye", "yeh", "par", "liye", "krna", "karna",
]);

function tokenize(query) {
  return String(query)
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

// Local retrieval over saved books: windowed keyword scoring, no network.
export async function searchImportedBooks(query) {
  const qTokens = tokenize(query);
  if (!qTokens.length) return null;
  const rows = (await run("readonly", (s) => s.getAll())) || [];
  if (!rows.length) return null;

  const WINDOW = 900;
  const STEP = 550;
  let best = null;
  for (const book of rows) {
    const lower = String(book.text || "").toLowerCase();
    for (let i = 0; i < lower.length; i += STEP) {
      const win = lower.slice(i, i + WINDOW);
      let score = 0;
      for (const tok of qTokens) if (win.includes(tok)) score += 1;
      if (score > 0 && (!best || score > best.score)) best = { book, score, index: i };
    }
  }
  if (!best) return null;
  const hasStrongToken = qTokens.some((t) => t.length >= 5);
  const needed = hasStrongToken ? 1 : 2;
  if (best.score < needed) return null;

  const start = best.index;
  const snippet = best.book.text.slice(start, start + 620).replace(/\s+/g, " ").trim();
  return {
    id: best.book.id,
    title: best.book.title,
    author: best.book.author,
    score: best.score,
    snippet: `${snippet}${best.book.text.length > start + 620 ? "…" : ""}`,
  };
}
