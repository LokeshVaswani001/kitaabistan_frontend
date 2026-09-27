// Real, rights-cleared content only: every entry below is a genuine
// public-domain book shipped from Project Gutenberg or Wikisource — no
// placeholder or self-written titles.

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
    { id: "c1", title: "Three Men in a Boat", author: "Jerome K. Jerome", bundled: true, file: "books/three-men-in-a-boat.txt", cover: "covers/three-men-in-a-boat.jpg", source: "Project Gutenberg", license: "Public domain" },
    { id: "c2", title: "The Importance of Being Earnest", author: "Oscar Wilde", bundled: true, file: "books/importance-of-earnest.txt", cover: "covers/importance-of-earnest.jpg", source: "Project Gutenberg", license: "Public domain" },
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
      { id: "n1", title: "Dracula", author: "Bram Stoker", bundled: true, file: "books/dracula.txt", cover: "covers/dracula.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n2", title: "Jane Eyre", author: "Charlotte Brontë", bundled: true, file: "books/jane-eyre.txt", cover: "covers/jane-eyre.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n3", title: "The Picture of Dorian Gray", author: "Oscar Wilde", premium: true, bundled: true, file: "books/dorian-gray.txt", cover: "covers/dorian-gray.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n5", title: "Pride and Prejudice", author: "Jane Austen", bundled: true, file: "books/pride-and-prejudice.txt", cover: "covers/pride-and-prejudice.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n6", title: "Frankenstein", author: "Mary Shelley", bundled: true, file: "books/frankenstein.txt", cover: "covers/frankenstein.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n7", title: "Moby-Dick", author: "Herman Melville", bundled: true, file: "books/moby-dick.txt", cover: "covers/moby-dick.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n8", title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", bundled: true, file: "books/sherlock-holmes.txt", cover: "covers/sherlock-holmes.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "n9", title: "Bagh-o-Bahar", urduTitle: "باغ و بہار", author: "Mir Amman Dehlvi", bundled: true, file: "books/bagh-o-bahar.txt", cover: "covers/bagh-o-bahar.jpg", source: "Urdu Wikisource", license: "Public domain", urdu: true },
      { id: "n10", title: "Fasana-e-Ajaib", urduTitle: "فسانۂ عجائب", author: "Rajab Ali Beg 'Saroor'", bundled: true, file: "books/fasana-e-ajaib.txt", cover: "covers/fasana-e-ajaib.jpg", source: "Urdu Wikisource", license: "Public domain", urdu: true },
      { id: "n11", title: "Guldasta-e-Zarafat", urduTitle: "گلدستۂ ظرافت", author: "Nishtar Lakhnavi", bundled: true, file: "books/guldasta-zarafat.txt", cover: "covers/guldasta-zarafat.jpg", source: "Urdu Wikisource", license: "Public domain", urdu: true },
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
      { id: "i1", title: "The Koran (Al-Qur'an)", author: "J. M. Rodwell (tr.)", bundled: true, file: "books/quran.txt", cover: "covers/quran.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "i2", title: "The Speeches & Table-Talk of the Prophet Mohammad", author: "Prophet Muhammad", bundled: true, file: "books/speeches-table-talk.txt", cover: "covers/speeches-table-talk.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "i3", title: "Annals of the Early Caliphate", author: "Sir William Muir", bundled: true, file: "books/annals-early-caliphate.txt", cover: "covers/annals-early-caliphate.jpg", source: "Project Gutenberg", license: "Public domain" },
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
      { id: "k1", title: "The Jungle Book", author: "Rudyard Kipling", bundled: true, file: "books/jungle-book.txt", cover: "covers/jungle-book.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k2", title: "The Adventures of Tom Sawyer", author: "Mark Twain", bundled: true, file: "books/tom-sawyer.txt", cover: "covers/tom-sawyer.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k3", title: "Treasure Island", author: "Robert Louis Stevenson", bundled: true, file: "books/treasure-island.txt", cover: "covers/treasure-island.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k4", title: "Black Beauty", author: "Anna Sewell", bundled: true, file: "books/black-beauty.txt", cover: "covers/black-beauty.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k5", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", bundled: true, file: "books/alice-in-wonderland.txt", cover: "covers/alice-in-wonderland.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k6", title: "The Wind in the Willows", author: "Kenneth Grahame", bundled: true, file: "books/wind-in-the-willows.txt", cover: "covers/wind-in-the-willows.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k7", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", bundled: true, file: "books/wizard-of-oz.txt", cover: "covers/wizard-of-oz.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "k8", title: "Anne of Green Gables", author: "L. M. Montgomery", bundled: true, file: "books/anne-of-green-gables.txt", cover: "covers/anne-of-green-gables.jpg", source: "Project Gutenberg", license: "Public domain" },
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
      { id: "m1", title: "Grimm's Fairy Tales", author: "Jacob Grimm", bundled: true, file: "books/grimm-fairy-tales.txt", cover: "covers/grimm-fairy-tales.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "m2", title: "Andersen's Fairy Tales", author: "Hans Christian Andersen", bundled: true, file: "books/andersen-fairy-tales.txt", cover: "covers/andersen-fairy-tales.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "m3", title: "The Blue Fairy Book", author: "Andrew Lang", bundled: true, file: "books/blue-fairy-book.txt", cover: "covers/blue-fairy-book.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "m4", title: "East of the Sun and West of the Moon", author: "Peter Christen Asbjørnsen", bundled: true, file: "books/east-of-the-sun.txt", cover: "covers/east-of-the-sun.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "m5", title: "Aesop's Fables", author: "Aesop", bundled: true, file: "books/aesop-fables.txt", cover: "covers/aesop-fables.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "m6", title: "A Christmas Carol", author: "Charles Dickens", bundled: true, file: "books/a-christmas-carol.txt", cover: "covers/a-christmas-carol.jpg", source: "Project Gutenberg", license: "Public domain" },
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
      { id: "p3", title: "Lab Pe Aati Hai Dua", urduTitle: "لب پہ آتی ہے دعا", author: "Allama Iqbal", bundled: true, urdu: true, file: "books/lab-pe-dua.txt", source: "Urdu Wikisource", license: "Public domain" },
      { id: "p4", title: "The Road Not Taken", author: "Robert Frost", bundled: true, file: "books/road-not-taken.txt", cover: "covers/road-not-taken.jpg", source: "English Wikisource", license: "Public domain" },
      {
        id: "p5",
        title: "Diwan-e-Ghalib",
        urduTitle: "دیوانِ غالب",
        author: "Mirza Ghalib",
        bundled: true,
        file: "books/diwan-e-ghalib.txt",
        cover: "covers/diwan-e-ghalib.jpg",
        source: "Urdu Wikisource",
        license: "Public domain",
        urdu: true,
      },
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
      { id: "a1", title: "The Tale of Peter Rabbit", author: "Beatrix Potter", bundled: true, file: "books/peter-rabbit.txt", cover: "covers/peter-rabbit.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "a2", title: "Just So Stories", author: "Rudyard Kipling", bundled: true, file: "books/just-so-stories.txt", cover: "covers/just-so-stories.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "a3", title: "The Velveteen Rabbit", author: "Margery Williams Bianco", bundled: true, file: "books/velveteen-rabbit.txt", cover: "covers/velveteen-rabbit.jpg", source: "Project Gutenberg", license: "Public domain" },
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
      { id: "g1", title: "The Story of Mankind", author: "Hendrik Willem van Loon", bundled: true, file: "books/story-of-mankind.txt", cover: "covers/story-of-mankind.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "g2", title: "A Popular History of Astronomy During the Nineteenth Century", author: "Agnes M. Clerke", bundled: true, file: "books/popular-astronomy.txt", cover: "covers/popular-astronomy.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "g3", title: "The Outline of Science, Vol. 1", author: "J. Arthur Thomson", bundled: true, file: "books/outline-of-science.txt", cover: "covers/outline-of-science.jpg", source: "Project Gutenberg", license: "Public domain" },
      { id: "g4", title: "Cosmos, Vol. 1", author: "Alexander von Humboldt", bundled: true, file: "books/cosmos-humboldt.txt", cover: "covers/cosmos-humboldt.jpg", source: "Project Gutenberg", license: "Public domain" },
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
