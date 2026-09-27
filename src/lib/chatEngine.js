import { KNOWLEDGE_BASE, starterQuestions } from "./knowledge";
import { chatReply } from "./locales/chat";
import { POEM_VIDEOS } from "@/components/poem-player/poems";
import { STORY_VIDEOS } from "@/components/story-player/stories";

const URDU_SCRIPT = /[\u0600-\u06FF]/;

const STOPWORDS = new Set([
  // English
  "the", "a", "an", "of", "and", "or", "is", "are", "was", "were", "to", "in",
  "on", "for", "it", "this", "that", "with", "what", "who", "when", "how",
  "why", "do", "does", "did", "can", "could", "you", "your", "my", "me", "i",
  "from", "about", "please", "tell", "explain", "there", "their", "they",
  "have", "has", "had", "will", "would", "should", "into", "than", "then",
  "any", "some", "just", "also", "very", "much", "many", "get", "got", "let",
  "us", "we", "he", "she", "his", "her", "its", "am", "be", "been", "being",
  // Roman Urdu / Hinglish
  "hai", "ho", "hoon", "hain", "he", "ka", "ki", "ke", "se", "me", "mein",
  "ko", "pe", "par", "aur", "ya", "jo", "wo", "woh", "yeh", "ye", "kya",
  "kia", "kyu", "kyun", "kyn", "kaise", "kaisay", "kaisa", "kaisi", "kab",
  "kahan", "kis", "kisne", "mujhe", "mujhy", "mujh", "tum", "aap", "ap",
  "apka", "apki", "apke", "mera", "meri", "mere", "meray", "tera", "teri",
  "tumhara", "humara", "hamara", "hum", "is", "us", "yehi", "wahi", "bhi",
  "to", "toh", "hi", "na", "ne", "tak", "liye", "liya", "wala", "wali",
  "kar", "karo", "karta", "karti", "karen", "kare", "bolo", "batao",
  "bataen", "bata", "btao", "poocho", "poch", "samjhao", "chahiye", "chahta",
  "chahti", "hota", "hoti", "hotay", "raha", "rahe", "rahi", "gaya", "gaye",
  "gi", "ga", "ge", "tha", "thi", "thay", "the", "matlab", "waisay",
  "zara", "bohat", "buhut", "sab", "kuch", "koi", "kuchch", "yahan", "wahan",
]);

const SYNONYMS = {
  namaz: "salah", namaaz: "salah", pray: "salah", praying: "salah", prayers: "salah",
  kitab: "book", kitaab: "book", kitaabein: "book", kitabein: "book", kitabon: "book",
  nazm: "poem", nazmain: "poem", nazms: "poem", nazmoon: "poem",
  kahani: "story", kahany: "story", kahaniyan: "story",
  muft: "free", mehnga: "price", qeemat: "price",
  mehfooz: "saved", mausooda: "saved", bookmark: "saved",
  talba: "students", student: "students",
  internet: "offline", wifi: "offline", online: "offline",
  streek: "streak", roz: "daily", daily: "daily",
  bache: "kids", bachay: "kids", bacchon: "kids", children: "kids",
  talveez: "screen", screen: "screen",
  padhna: "read", parhna: "read", reading: "read", reader: "read",
  ulla: "allah", allah: "allah",
};

const URDU_STOP = new Set([
  "کیا", "ہے", "ہیں", "ہو", "ہوں", "کے", "کا", "کی", "میں", "پر", "سے", "کو",
  "بھی", "تو", "نہیں", "نہ", "جی", "کیسے", "کیسا", "کیسی", "کب", "کہاں",
  "کیوں", "کس", "کسے", "کون", "میرا", "میری", "میرے", "مجھے", "آپ", "ہم",
  "وہ", "یہ", "اس", "اسی", "یہی", "وہی", "جو", "اور", "یا", "نے", "کیا",
  "گیا", "گئی", "ہوا", "ہوئی", "سب", "کچھ", "کوئی", "ہر", "بعد", "پہلے",
  "بالکل", "صرف", "بلکہ", "پھر", "جب", "تب", "اگر", "لیکن", "یعنی", "مطلب",
  "بتاؤ", "بتائیں", "پوچھو", "پوچھیں", "کہہ", "کہتے", "کہتی", "کرتے", "کرتی",
  "کریں", "کیجیے", "والے", "والی", "اپنے", "اپنی", "اپنا", "تیرا", "تیری",
  "اسے", "اسی", "یہاں", "وہاں", "کی", "کا", "کے", "زیادہ", "کم", "تمام",
]);

// Urdu-script words → the canonical English token used in the knowledge base.
const URDU_SYNONYMS = {
  "نماز": "salah", "نمازوں": "salah", "دعا": "dua", "پرستاری": "salah",
  "کتاب": "book", "کتب": "book", "کتابیں": "book", "کتابوں": "book",
  "کہانی": "story", "کہانیاں": "story", "کہانیوں": "story",
  "نظم": "poem", "نظموں": "poem", "نظمیں": "poem",
  "محفوظ": "saved", "سیوڈ": "saved", "بک مارک": "saved",
  "مفت": "free", "قیمت": "price", "پیسے": "price",
  "انٹرنیٹ": "offline", "آن لائن": "offline",
  "اکاؤنٹ": "account", "لائبریری": "library", "شیلف": "shelf",
  "ریڈر": "read", "پڑھنا": "read", "پڑھائی": "read", "پڑھنے": "read",
  "سبق": "moral", "اخلاق": "moral", "سبق": "moral",
  "بچے": "kids", "بچوں": "kids", "بچپن": "kids",
  "بیج": "badge", "سٹریک": "streak", "مسلسل": "streak",
  "صفحہ": "page", "صفحے": "page", "تلاش": "search", "ڈھونڈ": "search",
  "فونٹ": "font", "سائز": "size", "زبان": "language", "زبانیں": "languages",
  "ترجمہ": "translation", "ڈیمو": "demo", "مہمان": "guest", "استاد": "teacher",
  "شاعر": "poet", "چیٹ بوٹ": "chatbot", "رہنما": "rehnuma", "کتابستان": "kitaabistan",
};

function normalise(text) {
  return text
    .toLowerCase()
    .replace(/["'’“”]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(word) {
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith("ies") && w.length > 4) w = `${w.slice(0, -3)}y`;
  else if (w.endsWith("sses")) w = w.slice(0, -2);
  else if (w.endsWith("ing") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ed") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("es") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) w = w.slice(0, -1);
  else if (w.endsWith("ly") && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith("er") && w.length > 5) w = w.slice(0, -2);
  if (w.endsWith("ain") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("ein") && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith("yan") && w.length > 5) w = w.slice(0, -3);
  return SYNONYMS[word] || SYNONYMS[w] || w;
}

function tokens(text) {
  const out = [];
  for (const word of normalise(text).split(" ")) {
    if (word.length <= 1) continue;
    if (URDU_SCRIPT.test(word)) {
      if (URDU_STOP.has(word)) continue;
      out.push(URDU_SYNONYMS[word] || word);
      continue;
    }
    if (STOPWORDS.has(word)) continue;
    const stemmed = stem(word);
    if (stemmed.length > 1 && !STOPWORDS.has(stemmed)) out.push(stemmed);
  }
  return out;
}

/* ---------- BM25 ---------- */

const K1 = 1.4;
const B = 0.7;

function makeStats(docs) {
  const N = docs.length;
  let total = 0;
  const df = new Map();
  for (const d of docs) {
    total += d.tokens.length;
    for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);
  }
  return { N, avg: total / (N || 1) || 1, df };
}

function idf(stats, term) {
  const n = stats.df.get(term) || 0;
  return Math.log(1 + (stats.N - n + 0.5) / (n + 0.5));
}

function bm25(qTokens, doc, stats) {
  const tf = new Map();
  for (const t of doc.tokens) tf.set(t, (tf.get(t) || 0) + 1);
  let score = 0;
  const norm = stats.avg || 1;
  for (const t of qTokens) {
    const f = tf.get(t);
    if (!f) continue;
    const denom = f + K1 * (1 - B + B * (doc.tokens.length / norm));
    score += (idf(stats, t) * (f * (K1 + 1))) / denom;
  }
  return score;
}

function rank(qTokens, docs, stats, bonusFn) {
  return docs
    .map((doc) => ({
      doc,
      score: bm25(qTokens, doc, stats) + (bonusFn ? bonusFn(doc) : 0),
    }))
    .sort((a, b) => b.score - a.score);
}

/* ---------- indexes ---------- */

const KB_DOCS = KNOWLEDGE_BASE.map((entry) => ({
  entry,
  tokens: tokens(
    [
      entry.id.replace(/-/g, " "),
      ...entry.keywords,
      entry.question,
      entry.answer,
      entry.answerUrdu || "",
      entry.detail || "",
      entry.detailUrdu || "",
      entry.source,
      entry.sourceUrdu || "",
    ].join(" ")
  ),
}));
const KB_STATS = makeStats(KB_DOCS);

const POEM_DOCS = POEM_VIDEOS.map((poem) => ({
  poem,
  tokens: tokens([poem.id, poem.title, poem.titleUrdu, poem.author, ...poem.linesEn, ...poem.linesUr].join(" ")),
}));
const POEM_STATS = makeStats(POEM_DOCS);

const STORY_DOCS = STORY_VIDEOS.map((story) => ({
  story,
  tokens: tokens(
    [story.id, story.title, story.titleUrdu, story.author, ...story.beats.flatMap((b) => [b.en, b.ur])].join(" ")
  ),
}));
const STORY_STATS = makeStats(STORY_DOCS);

const KB_MIN = 3.0;
const CONTENT_MIN = 3.2;

/* ---------- language ---------- */

export function detectLang(question, fallback = "en") {
  return URDU_SCRIPT.test(question || "") ? "ur" : fallback === "ur" ? "ur" : "en";
}

/* ---------- small talk ---------- */

function entryById(id) {
  return KNOWLEDGE_BASE.find((e) => e.id === id) || null;
}

function pickAnswer(entry, lang) {
  if (!entry) return "";
  return lang === "ur" && entry.answerUrdu ? entry.answerUrdu : entry.answer;
}

function pickSource(entry, lang) {
  if (!entry) return "";
  return lang === "ur" && entry.sourceUrdu ? entry.sourceUrdu : entry.source;
}

function smallTalk(raw, uiLang, qTokens) {
  if (raw.length > 70 || qTokens.length > 7) return null;
  const source = uiLang === "ur" ? "کتابستان" : "Kitaabistan";

  if (
    /^(hi+|hey+|hello|hola|halo|hallo|hy|salam|salaam|assalam\s?o\s?alaikum|assalamualaikum|asalamu\s?alaykum|aoa|adab|greetings|bonjour|salut|merhaba|namaste|namaskar|privet|ni\s?hao|kon(nichiwa|banwa)?)\b/i.test(raw)
  ) {
    return { answer: chatReply(uiLang, "greeting"), source, topicId: "greeting" };
  }
  if (
    /\b(thanks|thank\s?you|shukriya|shukria|jazak\s?allah|merci|gracias|danke|obrigado|spasibo|xiexie|xie\s?xie|arigato|shukran)\b/i.test(raw)
  ) {
    return { answer: chatReply(uiLang, "thanks"), source, topicId: null };
  }
  if (
    /\b(bye|goodbye|good\s?bye|khuda\s?hafiz|allah\s?hafiz|alvida|see\s?you|phir\s?milenge|tata|au\s?revoir|hasta\s?luego|auf\s?wiedersehen|tschuss|adios|do\s?videnya)\b/i.test(raw)
  ) {
    return { answer: chatReply(uiLang, "bye"), source, topicId: "goodbye" };
  }
  if (
    /(kya\s?haal|kaisay\s?ho|kaise\s?ho|kya\s?hal|how\s?are\s?you|how\s?r\s?u|sab\s?theek|comment\s?ca\s?va|como\s?estas|wie\s?geht|kak\s?dela|genki\s?desu)/i.test(raw)
  ) {
    return { answer: chatReply(uiLang, "howareyou"), source, topicId: null };
  }
  if (
    /(who\s?are\s?you|tum\s?kon\s?ho|tum\s?kya\s?ho|what\s?can\s?you\s?do|what\s?do\s?you\s?do|kya\s?kar\s?sakte|ap\s?kya\s?kar|quien\s?eres|wer\s?bist|kimi\s?wa\s?dare|你是谁)/i.test(raw)
  ) {
    return { answer: chatReply(uiLang, "about"), source, topicId: null };
  }
  if (/^(help|madad|maslat|kya\s?poochun|what\s?should\s?i\s?ask|how\s?do\s?i\s?use|ayuda|hilfe|aide|مساعدة|помощь|帮助|bantuan)\b/i.test(raw)) {
    return { answer: chatReply(uiLang, "help"), source, topicId: null };
  }
  return null;
}

/* ---------- follow-ups ---------- */

const FOLLOWUP = /\b(aur|more|detail|details|tafseel|wazahat|go\s?on|phir|kyun|kyn|kyu|kyu\s?ke|why\s?is\s?that|how\s?so|what\s?do\s?you\s?mean|iska\s?aur|isi\s?ka|isi\s?bare|tell\s?me\s?more|full|poori|poora|complete|sab\s?kuch|kuch\s?aur|aage)\b/i;

function isFollowUp(raw) {
  return FOLLOWUP.test(` ${raw} `) && raw.split(" ").length <= 10;
}

function expandTopic(topic, lang, uiLang = "en") {
  if (!topic) return null;
  if (topic.kind === "poem") {
    const poem = POEM_VIDEOS.find((p) => p.id === topic.id);
    if (poem) return poemAnswer(poem, lang, "full");
    return null;
  }
  if (topic.kind === "story") {
    const story = STORY_VIDEOS.find((s) => s.id === topic.id);
    if (story) return storyAnswer(story, lang, "full");
    return null;
  }
  const entry = entryById(topic.id);
  if (!entry) return null;
  if (entry.detail) {
    return lang === "ur" && entry.detailUrdu ? entry.detailUrdu : entry.detail;
  }
  const related = relatedQuestions(entry, lang);
  if (!related.length) return null;
  return `${chatReply(uiLang, "followupMore")}\n${related.map((q) => `• ${q}`).join("\n")}`;
}

function contentSource(topic, entry, lang) {
  if (entry) return pickSource(entry, lang);
  if (topic.kind === "poem") {
    const poem = POEM_VIDEOS.find((p) => p.id === topic.id);
    return poem ? (lang === "ur" ? poem.titleUrdu : poem.title) : "";
  }
  const story = STORY_VIDEOS.find((s) => s.id === topic.id);
  return story ? (lang === "ur" ? story.titleUrdu : story.title) : "";
}

/* ---------- related chips ---------- */

function relatedQuestions(entry, lang, limit = 3) {
  if (!entry) return [];
  const sameSource = KNOWLEDGE_BASE.filter(
    (e) => e.id !== entry.id && (e.source === entry.source || e.sourceUrdu === entry.sourceUrdu)
  );
  const others = KNOWLEDGE_BASE.filter(
    (e) => e.id !== entry.id && e.source !== entry.source && e.sourceUrdu !== entry.sourceUrdu
  );
  const pool = [...sameSource, ...others];
  return pool.slice(0, limit).map((e) => e.question);
}

/* ---------- content answers ---------- */

function poemAnswer(poem, lang, mode = "lines") {
  const lines = lang === "ur" ? poem.linesUr : poem.linesEn;
  const title = lang === "ur" ? poem.titleUrdu : poem.title;
  const picked = mode === "full" ? lines : lines.slice(0, 3);
  const head =
    lang === "ur"
      ? `نظم «${title}» — ${poem.author}:\n\n`
      : `From the poem "${title}" by ${poem.author}:\n\n`;
  const tail =
    lang === "ur"
      ? "\n\nپوری نظم، متحرک مناظروں اور آواز کے ساتھ: نظمیں صفحے (/poems) کھولیں۔"
      : "\n\nWatch the whole poem with animation and narration on the Poems page (/poems).";
  return head + picked.join("\n") + tail;
}

function storyAnswer(story, lang, mode = "summary") {
  const beat = (b) => (lang === "ur" ? b.ur : b.en);
  const title = lang === "ur" ? story.titleUrdu : story.title;
  const beats = story.beats;
  let body;
  let head;
  if (mode === "moral") {
    head = lang === "ur" ? `«${title}» کا سبق:\n\n` : `The moral of "${title}":\n\n`;
    body = beat(beats[beats.length - 1]);
  } else if (mode === "full") {
    head = lang === "ur" ? `«${title}» — مکمل کہانی:\n\n` : `"${title}" — full story:\n\n`;
    body = beats.map(beat).join("\n\n");
  } else if (mode === "lines") {
    head = lang === "ur" ? `«${title}» سے:\n\n` : `From "${title}":\n\n`;
    body = beats.slice(0, 3).map(beat).join("\n\n");
  } else {
    head = lang === "ur" ? `«${title}» کا خلاصہ:\n\n` : `"${title}" in short:\n\n`;
    body = `${beat(beats[0])}\n\n…\n\n${beat(beats[beats.length - 1])}`;
  }
  const tail =
    lang === "ur"
      ? "\n\nپوری متحرک کہانی: کہانیاں صفحے (/stories) پر دیکھیں۔"
      : "\n\nWatch the full animated story on the Stories page (/stories).";
  return head + body + tail;
}

const WANTS_LINES =
  /\b(lines?|lyrics|shayr|shayar|misra|misre|misray|quote|start|starting|opening|first|pehla|pehli|poori|poora|poem|nazm|says?|kehta|kahta|kya\s?likha)\b/i;
const WANTS_MORAL = /\b(moral|lesson|seekh|sabaq|maqsad)\b/i;
const WANTS_SUMMARY = /\b(summary|what\s?happens|plot|kya\s?hua|taleem|taaruf|introduction|poori\s?kahani)\b/i;

function contentIntent(raw) {
  if (URDU_SCRIPT.test(raw)) {
    if (/سبق/.test(raw)) return "moral";
    if (/(ابیات|مصرع|سطر|پہلی|پوری|لائن|لائنس)/.test(raw)) {
      return /(پوری|مکمل)/.test(raw) ? "full" : "lines";
    }
    return null;
  }
  if (WANTS_MORAL.test(raw)) return "moral";
  if (WANTS_LINES.test(raw)) {
    return /\b(full|complete|entire|poori|poora)\b/i.test(raw) ? "full" : "lines";
  }
  if (WANTS_SUMMARY.test(raw)) return "summary";
  return null;
}

function titleHit(raw, item) {
  const title = normalise(`${item.title} ${item.titleUrdu} ${item.id.replace(/-/g, " ")}`);
  const titleTokens = new Set(tokens(`${item.title} ${item.titleUrdu} ${item.id.replace(/-/g, " ")}`));
  if (raw.includes(normalise(item.title))) return true;
  for (const t of tokens(raw)) if (titleTokens.has(t)) return true;
  return title.includes(raw) && raw.length > 3;
}

function rankPoems(raw, qTokens) {
  const ranked = rank(qTokens, POEM_DOCS, POEM_STATS, (doc) => {
    let bonus = 0;
    if (titleHit(raw, doc.poem)) bonus += 4;
    if (normalise(raw).includes(normalise(doc.poem.author))) bonus += 3;
    return bonus;
  });
  return ranked[0] && ranked[0].score >= CONTENT_MIN ? ranked[0] : null;
}

function rankStories(raw, qTokens) {
  const ranked = rank(qTokens, STORY_DOCS, STORY_STATS, (doc) => {
    let bonus = 0;
    if (titleHit(raw, doc.story)) bonus += 4;
    if (normalise(raw).includes(normalise(doc.story.author))) bonus += 1;
    return bonus;
  });
  return ranked[0] && ranked[0].score >= CONTENT_MIN ? ranked[0] : null;
}

function contentRelated(kind, item, lang, mode = "summary") {
  const out = [];
  const kb = KNOWLEDGE_BASE.find((e) =>
    e.keywords.some((k) => normalise(k) === normalise(item.id.split("-")[0]))
  );
  if (kind === "poem") {
    if (kb) out.push(kb.question);
    if (mode !== "lines") {
      out.push(
        lang === "ur"
          ? `«${item.titleUrdu}» کی پہلی لائنز سناؤ۔`
          : `Quote the first lines of "${item.title}".`
      );
    }
    const other = POEM_VIDEOS.find((p) => p.id !== item.id);
    if (other) {
      out.push(
        lang === "ur"
          ? `نظم «${other.titleUrdu}» کے بارے میں بتاؤ۔`
          : `Tell me about the poem "${other.title}".`
      );
    }
    if (!kb && out.length < 3) {
      const where = KNOWLEDGE_BASE.find((e) => e.id === "poems-location");
      if (where) out.push(where.question);
    }
  } else {
    if (kb) out.push(kb.question);
    if (mode !== "summary") {
      out.push(
        lang === "ur"
          ? `«${item.titleUrdu}» کے بارے میں بتاؤ۔`
          : `What happens in "${item.title}"?`
      );
    }
    if (mode !== "moral") {
      out.push(
        lang === "ur"
          ? `«${item.titleUrdu}» کا سبق بتاؤ۔`
          : `What is the moral of "${item.title}"?`
      );
    }
    const where = KNOWLEDGE_BASE.find((e) => e.id === "stories-location");
    if (where && out.length < 3) out.push(where.question);
  }
  return [...new Set(out)].slice(0, 3);
}

/* ---------- main entry ---------- */

/**
 * Offline answer engine. Never touches the network: everything is answered
 * from the bundled knowledge base, the poem/story scripts and the caller's
 * own saved books (handled by the chatbot page).
 *
 * @param {string} question
 * @param {{ lang?: string, uiLang?: string, topic?: { kind: string, id: string }|null }} options
 */
function resolveAnswer(question, options = {}) {
  const uiLang = options.uiLang || options.lang || "en";
  const lang = detectLang(question, uiLang === "ur" ? "ur" : "en");
  const raw = normalise(question || "");
  const qTokens = tokens(question || "");
  const prevTopic = options.topic || null;

  if (!raw) {
    return { matched: false, answer: "", source: "", related: [], topic: prevTopic, kind: "none" };
  }

  const chat = smallTalk(raw, uiLang, qTokens);
  if (chat) {
    return {
      matched: true,
      answer: chat.answer,
      source: chat.source,
      related: starterQuestions(),
      topic: chat.topicId ? { kind: "kb", id: chat.topicId } : null,
      kind: "chat",
    };
  }

  const poemHit = rankPoems(raw, qTokens);
  const storyHit = rankStories(raw, qTokens);
  const intent = contentIntent(raw);

  // 1) Explicit request for lines / moral / summary of a known piece.
  if (intent === "moral" && storyHit) {
    const story = storyHit.doc.story;
    return {
      matched: true,
      answer: storyAnswer(story, lang, "moral"),
      source: lang === "ur" ? story.titleUrdu : story.title,
      related: contentRelated("story", story, lang, "moral"),
      topic: { kind: "story", id: story.id },
      kind: "story",
    };
  }
  if (intent && poemHit && (intent === "lines" || intent === "full")) {
    const poem = poemHit.doc.poem;
    return {
      matched: true,
      answer: poemAnswer(poem, lang, intent === "full" ? "full" : "lines"),
      source: lang === "ur" ? poem.titleUrdu : poem.title,
      related: contentRelated("poem", poem, lang, intent === "full" ? "full" : "lines"),
      topic: { kind: "poem", id: poem.id },
      kind: "poem",
    };
  }
  if (intent && storyHit) {
    const story = storyHit.doc.story;
    const mode = intent === "lines" ? "lines" : "summary";
    return {
      matched: true,
      answer: storyAnswer(story, lang, mode),
      source: lang === "ur" ? story.titleUrdu : story.title,
      related: contentRelated("story", story, lang, mode),
      topic: { kind: "story", id: story.id },
      kind: "story",
    };
  }

  // 2) Short follow-up on the previous topic ("aur batao", "full poem", "why?").
  if (prevTopic && qTokens.length <= 3 && isFollowUp(raw)) {
      const answer = expandTopic(prevTopic, lang, uiLang);
    if (answer) {
      const entry = prevTopic.kind === "kb" ? entryById(prevTopic.id) : null;
      return {
        matched: true,
        answer,
        source: contentSource(prevTopic, entry, lang),
        related: entry ? relatedQuestions(entry, lang) : [],
        topic: prevTopic,
        kind: "followup",
      };
    }
  }

  // 3) Knowledge-base match.
  const kbRanked = rank(qTokens, KB_DOCS, KB_STATS, (doc) => {
    let bonus = 0;
    const nq = normalise(question);
    if (nq === normalise(doc.entry.question)) bonus += 8;
    else if (nq.includes(normalise(doc.entry.question))) bonus += 4;
    for (const k of doc.entry.keywords) {
      const nk = normalise(k);
      if (nk.includes(" ") && nq.includes(nk)) bonus += 3;
      else if (qTokens.includes(stem(nk))) bonus += 1.5;
    }
    return bonus;
  });
  const best = kbRanked[0];

  if (best && best.score >= KB_MIN) {
    const entry = best.doc.entry;
    return {
      matched: true,
      answer: pickAnswer(entry, lang),
      source: pickSource(entry, lang),
      related: relatedQuestions(entry, lang),
      topic: { kind: "kb", id: entry.id },
      kind: "kb",
    };
  }

  // 4) No KB hit — try the bundled poems/stories anyway.
  if (poemHit && poemHit.score >= CONTENT_MIN) {
    const poem = poemHit.doc.poem;
    return {
      matched: true,
      answer: poemAnswer(poem, lang, "lines"),
      source: lang === "ur" ? poem.titleUrdu : poem.title,
      related: contentRelated("poem", poem, lang, "lines"),
      topic: { kind: "poem", id: poem.id },
      kind: "poem",
    };
  }
  if (storyHit && storyHit.score >= CONTENT_MIN) {
    const story = storyHit.doc.story;
    return {
      matched: true,
      answer: storyAnswer(story, lang, "summary"),
      source: lang === "ur" ? story.titleUrdu : story.title,
      related: contentRelated("story", story, lang, "summary"),
      topic: { kind: "story", id: story.id },
      kind: "story",
    };
  }

  // 5) Nothing matched — offer the nearest questions.
  const near = kbRanked.filter((s) => s.score > 0).slice(0, 2).map((s) => s.doc.entry.question);
  const fallback = starterQuestions();
  const related = [...new Set([...near, ...fallback])].slice(0, 3);
  return {
    matched: false,
    answer: chatReply(uiLang, "notFound"),
    source: "",
    related,
    topic: prevTopic,
    kind: "none",
  };
}

/**
 * Public entry point. `lang` may be any of the 18 interface languages; the
 * knowledge base itself is English/Urdu, so answers outside those two come
 * back with a one-line `note` the chatbot page can show underneath.
 */
export function askRehnuma(question, options = {}) {
  const uiLang = options.lang || "en";
  const result = resolveAnswer(question, { ...options, uiLang });
  const note =
    uiLang !== "en" && uiLang !== "ur" && result.matched && result.kind !== "chat"
      ? chatReply(uiLang, "contentNote")
      : "";
  return { ...result, note };
}

export { starterQuestions };
