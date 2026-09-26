// Sample / placeholder content.
// Replace with real, rights-cleared content via the admin panel described
// in the product blueprint (Section 5: Core Content Categories).

// Per the blueprint (Section 5), "Funny / comedy books sit as a light-hearted
// sub-shelf inside Novels" — it is NOT one of the eight top-level pillars.
// It lives on the Novels category page as a nested `subShelf`, not in the
// top-level `categories` array, so the home/library grids correctly show
// eight shelves rather than nine.
const comedySubShelf = {
  slug: "comedy",
  name: "Comedy",
  nameUrdu: "مزاحیہ",
  books: [
    { id: "c1", title: "Uncle Chaudhry's Chaos", author: "Placeholder Author", bundled: true },
    { id: "c2", title: "The Great Biryani Heist", author: "Placeholder Author", sizeMb: 3 },
  ],
};

export const categories = [
  {
    slug: "novels",
    name: "Novels",
    nameUrdu: "ناول",
    icon: "BookOpen",
    color: "#DDEAE4",
    description:
      "Full-length fiction in Urdu and English — drama, romance, adventure, and classic literature.",
    descriptionUrdu:
      "اردو اور انگریزی میں مکمل ناول — ڈرامہ، رومانس، ایڈونچر اور کلاسیکی ادب۔",
    kidsSafe: false,
    subShelf: comedySubShelf,
    books: [
      { id: "n1", title: "The Orchard of Small Miracles", author: "Placeholder Author", progress: 62, bundled: true },
      { id: "n2", title: "Raat Ki Rani", author: "Placeholder Author", sizeMb: 4 },
      { id: "n3", title: "Shadows Over Lahore", author: "Placeholder Author", premium: true, sizeMb: 5 },
    ],
  },
  {
    slug: "islamic",
    name: "Islamic Books",
    nameUrdu: "اسلامی کتب",
    icon: "Moon",
    color: "#E4DEF2",
    description: "Quran translations, Hadees collections, Seerah, du'as, and Islamic moral stories.",
    descriptionUrdu: "قرآن کے تراجم، احادیث، سیرت، دعائیں اور اسلامی اخلاقی کہانیاں۔",
    books: [
      { id: "i1", title: "Seerat-un-Nabi (Simplified)", author: "Placeholder Author", bundled: true },
      { id: "i2", title: "Stories of the Sahaba", author: "Placeholder Author", sizeMb: 3 },
      { id: "i3", title: "Everyday Du'as for Students", author: "Placeholder Author", bundled: true },
      { id: "i4", title: "Understanding Salah", author: "Placeholder Author", sizeMb: 4 },
    ],
  },
  {
    slug: "childrens",
    name: "Children's Stories",
    nameUrdu: "بچوں کی کہانیاں",
    icon: "Baby",
    color: "#FBE0E0",
    description: "Short, colorful, easy-to-read stories for young children.",
    descriptionUrdu: "چھوٹے بچوں کے لیے مختصر، رنگین اور آسان کہانیاں۔",
    books: [
      { id: "k1", title: "The Little Kite That Flew Home", author: "Placeholder Author", bundled: true },
      { id: "k2", title: "Chunnu Aur Munnu Ki Kahani", author: "Placeholder Author", bundled: true },
      { id: "k3", title: "The Sparrow's Gift", author: "Placeholder Author", sizeMb: 2 },
      { id: "k4", title: "Bilal and the Magic Lantern", author: "Placeholder Author", sizeMb: 3 },
    ],
  },
  {
    slug: "moral",
    name: "Moral Stories",
    nameUrdu: "اخلاقی کہانیاں",
    icon: "Sprout",
    color: "#DCEAE6",
    description: "Character-building stories that teach honesty, kindness, and patience.",
    descriptionUrdu: "ایسی کہانیاں جو دیانت، مہربانی اور صبر سکھاتی ہیں۔",
    books: [
      { id: "m1", title: "The Honest Woodcutter", author: "Placeholder Author", bundled: true },
      { id: "m2", title: "Sach Bolne Wala Larka", author: "Placeholder Author", bundled: true },
      { id: "m3", title: "The Ant and the Grasshopper", author: "Placeholder Author", bundled: true },
      { id: "m4", title: "Patience of the Turtle", author: "Placeholder Author", sizeMb: 2 },
    ],
  },
  {
    slug: "poems",
    name: "English Poems",
    nameUrdu: "نظمیں",
    icon: "Feather",
    color: "#F5E9C8",
    description: "Classic English poems shown together with accurate Urdu translation.",
    descriptionUrdu: "کلاسیکی انگریزی نظمیں، درست اردو ترجمے کے ساتھ۔",
    books: [
      {
        id: "p1",
        bundled: true,
        title: "If —",
        author: "Rudyard Kipling",
        urduTitle: "اگر",
        linesEn: [
          "If you can keep your head when all about you",
          "Are losing theirs and blaming it on you,",
          "If you can trust yourself when all men doubt you,",
          "But make allowance for their doubting too;",
        ],
        linesUr: [
          "اگر تم اپنا حوصلہ برقرار رکھ سکو، جب سب اپنا کھو بیٹھیں",
          "اور اس کا الزام تم پر رکھیں،",
          "اگر تم خود پر بھروسہ کر سکو جب سب شک کریں،",
          "مگر ان کے شک کو بھی سمجھ سکو؛",
        ],
      },
      {
        id: "p2",
        bundled: true,
        title: "Daffodils",
        author: "William Wordsworth",
        urduTitle: "ڈیفوڈلز",
        linesEn: [
          "I wandered lonely as a cloud",
          "That floats on high o'er vales and hills,",
          "When all at once I saw a crowd,",
          "A host, of golden daffodils;",
        ],
        linesUr: [
          "میں تنہا ایک بادل کی طرح بھٹکتا رہا",
          "جو وادیوں اور پہاڑیوں کے اوپر تیرتا ہے،",
          "جب اچانک میں نے ایک ہجوم دیکھا،",
          "سنہرے پھولوں کا ایک لشکر؛",
        ],
      },
      { id: "p3", title: "Lab Pe Aati Hai Dua", author: "Allama Iqbal", sizeMb: 1 },
      { id: "p4", title: "The Road Not Taken", author: "Robert Frost", urduTitle: "وہ راستہ جو نہ چنا گیا", sizeMb: 1 },
    ],
  },
  {
    slug: "animated",
    name: "Animated Books",
    nameUrdu: "اینیمیٹڈ کتابیں",
    icon: "Clapperboard",
    color: "#DDEAF2",
    description: "Short animated / narrated stories with motion and simple visuals.",
    descriptionUrdu: "مختصر اینیمیٹڈ کہانیاں، سادہ تصاویر اور حرکت کے ساتھ۔",
    books: [
      { id: "a1", title: "The Dancing Peacock", author: "Placeholder Studio", sizeMb: 8 },
      { id: "a2", title: "Sindbad's First Voyage", author: "Placeholder Studio", sizeMb: 10 },
      { id: "a3", title: "Neki Ka Phal", author: "Placeholder Studio", sizeMb: 6 },
    ],
  },
  {
    slug: "gk",
    name: "GK Books",
    nameUrdu: "جنرل نالج",
    icon: "Brain",
    color: "#F6E4D3",
    description: "General knowledge, current affairs basics, quizzes, and fun-fact books.",
    descriptionUrdu: "عمومی معلومات، حالات حاضرہ، کوئز اور دلچسپ حقائق پر مبنی کتابیں۔",
    books: [
      { id: "g1", title: "World Capitals for Students", author: "Placeholder Author", bundled: true },
      { id: "g2", title: "Pakistan Studies Quick Facts", author: "Placeholder Author", bundled: true },
      { id: "g3", title: "100 Fun Science Facts", author: "Placeholder Author", sizeMb: 2 },
      { id: "g4", title: "General Knowledge Quiz Book", author: "Placeholder Author", sizeMb: 2 },
    ],
  },
];

export function findCategory(slug) {
  return categories.find((c) => c.slug === slug);
}

export function visibleCategories(kidsMode) {
  if (!kidsMode) return categories;
  return categories.filter((c) => c.kidsSafe !== false);
}

export function findBook(id) {
  for (const cat of categories) {
    const book = cat.books.find((b) => b.id === id);
    if (book) return { ...book, category: cat };
    if (cat.subShelf) {
      const subBook = cat.subShelf.books.find((b) => b.id === id);
      if (subBook) {
        return { ...subBook, category: cat, subShelf: cat.subShelf };
      }
    }
  }
  return null;
}

export function allBooks() {
  return categories.flatMap((c) => {
    const own = c.books.map((b) => ({ ...b, category: c }));
    const sub = c.subShelf
      ? c.subShelf.books.map((b) => ({ ...b, category: c, subShelf: c.subShelf }))
      : [];
    return [...own, ...sub];
  });
}

// --- Offline download simulation (Sections 4 & 10 of the blueprint) ---
// A book is either `bundled` (shipped inside the app itself, readable the
// instant it's installed — the "starter set" from Section 4) or has a
// `sizeMb` and must be fetched once over Wi-Fi before it can be read
// offline (see DownloadsContext). Books with neither flag are treated as
// bundled, so existing/placeholder entries stay backward compatible.
export function needsDownload(book) {
  return !!book && !book.bundled && typeof book.sizeMb === "number";
}

// --- Payment-ready architecture (Section 8 of the blueprint) ---
// Books can be tagged `premium: true` in the data above. At launch,
// PAYMENTS_ENABLED stays false so every book — premium-tagged or not —
// is fully free and unlocked; only a small "Premium" label shows so the
// data model and UI are ready for Phase 2 without disrupting Phase 1's
// free access.
export const PAYMENTS_ENABLED = false;

export function isLocked(book) {
  return PAYMENTS_ENABLED && !!book?.premium;
}
