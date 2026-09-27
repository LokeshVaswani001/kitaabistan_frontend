const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "or", "is", "are", "was", "were", "to", "in",
  "on", "for", "it", "this", "that", "with", "what", "who", "when", "how",
  "why", "do", "does", "did", "can", "could", "you", "your", "my", "me", "i",
  "from", "about", "please", "tell", "explain", "hai", "kya", "ka", "ki",
  "ke", "se", "me", "mein", "kya", "hai", "batao", "bataen", "mujhe",
]);

export const KNOWLEDGE_BASE = [
  {
    id: "ant-grasshopper",
    keywords: ["moral", "ant", "grasshopper", "lesson"],
    question: 'What is the moral of "The Ant and the Grasshopper"?',
    answer:
      "The moral of \"The Ant and the Grasshopper\" is to prepare for the future instead of only living for today.",
    answerUrdu:
      "\"تیڑھے اور ٹڈی\" کا سبق: صرف آج کے لیے نہ جیو، بلکہ مستقبل کے لیے پہلے سے تیاری کرو۔",
    source: "Moral Stories",
    sourceUrdu: "اخلاقی کہانیاں",
    detail:
      "In the fable the Grasshopper sings all summer while the Ant gathers and stores grain. Winter arrives, food runs out, and the Grasshopper reaches the Ant's full granary and is turned away. The Ant's answer is the moral itself: work done in good weather is what keeps you safe in bad.",
    detailUrdu:
      "کہانی میں ٹڈی ساری گرمیاں گاتا رہتا ہے جبکہ تیڑھا دانہ جمع کر کے رکھتا ہے۔ سردی آنے پر کھانا ختم ہو جاتا ہے اور ٹڈی تیڑھے کے بھرے خوراک کے مخزن تک پہنچ کر واپس ہو جاتا ہے۔ سبق وہی ہے: میٹھے موسم میں کی گئی محنت ہی برے وقت میں حفاظت دیتی ہے۔",
  },
  {
    id: "honest-woodcutter",
    keywords: ["honest", "woodcutter", "axe", "gold", "silver", "truth"],
    question: 'What happens in "The Honest Woodcutter"?',
    answer:
      "An honest woodcutter's axe falls into a river. A spirit offers him gold and silver axes, and because he returns the ones that are not his, she rewards him with all three. The story teaches that honesty is repaid.",
    answerUrdu:
      "ایک ایماندار لکڑھارے کا کٹار دریا میں گر جاتا ہے۔ جن اسے سنہرے اور چاندی کے کٹارے پیش کرتی ہے؛ چونکہ وہ غیر اپنے واپس کر دیتا ہے، وہ تینوں اسے دے دیتی ہے۔ سبق: ایمانداری کا اجر ضرور ملتا ہے۔",
    source: "Moral Stories",
    sourceUrdu: "اخلاقی کہانیاں",
  },
  {
    id: "salah",
    keywords: ["salah", "prayer", "namaz", "five", "times", "farz"],
    question: "What is Salah?",
    answer:
      "Salah is the five-times-daily prayer in Islam — Fajr, Zuhr, Asr, Maghrib and Isha. The Islamic Books shelf ships a public-domain Quran translation (J. M. Rodwell) where the daily prayers are addressed.",
    answerUrdu:
      "صلہ پانچ وقت کی نماز ہے — فجر، ظہر، عصر، مغرب اور عشاء۔ اسلامی کتب شیلف پر عوامی زمینے کا قرآن ترجمہ (جے. ایم. روڈویل) موجود ہے جہاں روزمرہ نماز کا ذکر ہے۔",
    source: "Islamic Books",
    sourceUrdu: "اسلامی کتب",
    detail:
      "The five prayers begin at dawn (Fajr) and end after nightfall (Isha), with a pause after each one until the next begins. To follow the references, open the public-domain Quran translation (J. M. Rodwell) from the Islamic Books shelf.",
    detailUrdu:
      "پانچوں نمازیں فجر سے شروع اور رات کی عشا پر ختم ہوتی ہیں — ہر نماز کے بعد اگلی تک وقفہ رہتا ہے۔ حوالے سمجھنے کے لیے اسلامی کتب شیلف سے قرآن کا عوامی زمینے کا ترجمہ (جے. ایم. روڈویل) کھولیں۔",
  },
  {
    id: "offline",
    keywords: ["offline", "internet", "data", "download", "connection", "wifi"],
    question: "Does it work without internet?",
    answer:
      "Yes. Download a shelf once over Wi-Fi and every book in it opens offline — on the bus, in a village, anywhere. Rehnuma's approved answers are stored on the device too, so questions still get answered with zero connection.",
    answerUrdu:
      "جی ہاں۔ ایک بار واائی فائے پر شیلف ڈاؤن لوڈ کر لیں، پھر اس کی ہر کتاب آف لائن کھلتی ہے — بس میں، گاؤں میں، کہیں بھی۔ رہنما کے منظور شدہ جواب بھی ڈیوائس پر محفوظ ہوتے ہیں، اس لیے انٹرنیٹ کے بغیر بھی جواب ملتے ہیں۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
    detail:
      "Nothing has to be installed: shelves you have downloaded, every poem, every animated story and my answers all come from files already on your device. Only two things ever go online — signing in to sync, and importing a book from a link.",
    detailUrdu:
      "کچھ بھی انسٹال نہیں کرنا پڑتا: ڈاؤن لوڈ کی گئی شیلفیں، ہر نظم، ہر متحرک کہانی اور میرے جواب پہلے سے ہی ڈیوائس پر موجود ہیں۔ صرف دو چیزیں آن لائن جاتی ہیں — سینک کے لیے سائن این، اور لنک سے کتاب درآمد۔",
  },
  {
    id: "curated",
    keywords: ["invent", "make", "guess", "approved", "safe", "hallucinate", "wrong"],
    question: "Can the chatbot invent answers?",
    answer:
      "No. Rehnuma only answers from approved content that a teacher or the app's founder has added. When nothing in the library matches, she says so plainly and notes your question instead of guessing.",
    answerUrdu:
      "نہیں۔ رہنما صرف منظور شدہ مواد سے جواب دیتی ہے جو استاد یا ایپ کے بنائی نے شامل کیا ہو۔ جب لائبریری میں کچھ نہیں ملتا تو وہ صاف کہتی ہے اور آپ کا سوال یاد رکھتی ہے — قیاس نہیں لگاتی۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
    detail:
      "Every answer comes from content already in the bundle — none of it is generated on the spot. If my search misses, I say so plainly, log your question on this device for my teacher to review, and offer the nearest approved questions instead of guessing.",
    detailUrdu:
      "ہر جواب پہلے سے بندل میں موجود مواد سے آتا ہے — کچھ بھی اسی وقت بنایا نہیں جاتا۔ اگر تلاش ناکام ہو تو میں سیدھا کہتی ہوں، آپ کا سوال اسی ڈیوائس پر درج کرتی ہوں اور قیاس کے بجائے قریب ترین منظور شدہ سوالات پیش کرتی ہوں۔",
  },
  {
    id: "streak",
    keywords: ["streak", "badge", "habit", "daily", "points"],
    question: "How do streaks and badges work?",
    answer:
      "Read on consecutive days to grow your streak. Each new day adds one, badges unlock as milestones are reached, and the Profile page shows the full collection.",
    answerUrdu:
      "مسلسل دن پڑھنے سے آپ کی سٹریک بڑھتی ہے۔ ہر نیا دن ایک شامل ہوتا ہے، ہدف پورے ہونے پر بیجز کھلتے ہیں، اور پورا مجموعہ پروفائل صفحے پر ملتا ہے۔",
    source: "Profile",
    sourceUrdu: "پروفائل",
    detail:
      "One day of reading adds one to the streak; miss a day and it resets to zero, so a single short session daily is enough. Badges unlock at milestones — your first week, your first saved book, your longest streak — and all of them are collected on the Profile page.",
    detailUrdu:
      "ایک دن پڑھنے پر سٹریک میں ایک کا اضافہ ہوتا ہے؛ ایک دن چھوٹ جائے تو وہ صفر ہو جاتی ہے، اس لیے روز تھوڑا سا پڑھنا کافی ہے۔ بیجز پہلے ہفتے، پہلی محفوظ کتاب اور سب سے لمبی سٹریک جیسے ہدفوں پر کھلتے ہیں اور پورا مجموعہ پروفائل صفحے پر ملتا ہے۔",
  },
  {
    id: "kids-mode",
    keywords: ["kids", "child", "children", "safe", "mature", "filter", "parent"],
    question: "What does Kids Mode do?",
    answer:
      "Kids Mode hides mature shelves in one toggle and keeps younger readers inside age-appropriate content. You can switch it on from the Profile page.",
    answerUrdu:
      "کڈز موڈ ایک ہی ٹگ سے مخصوص شیلف چھپا دیتا ہے اور چھوٹے پڑھنے والوں کو عمر کے مطابق مواد تک رکھتا ہے۔ آپ اسے پروفائل صفحے سے آن کر سکتے ہیں۔",
    source: "Profile",
    sourceUrdu: "پروفائل",
    detail:
      "Kids Mode hides shelves meant for older readers and keeps younger ones inside age-appropriate books, poems and stories, so nothing mature can open by accident. The toggle sits on the Profile page and stays on until you turn it off.",
    detailUrdu:
      "کڈز موڈ بڑوں کے لیے مخصوص شیلفیں چھپا دیتا ہے اور چھوٹوں کو عمر کے مطابق کتابیں، نظمیں اور کہانیاں دکھاتا ہے تاکہ کچھ بھی غلط کھل نہ جائے۔ ٹگ پروفائل صفحے پر ہے اور آپ اسے آف کرنے تک چلتا رہتا ہے।",
  },
  {
    id: "price",
    keywords: ["free", "price", "cost", "pay", "money", "subscription", "premium"],
    question: "Is it free?",
    answer:
      "Yes — free, forever. No subscriptions, no paywalled chapters: the whole library stays open to students.",
    answerUrdu:
      "جی ہاں — ہمیشہ مفت۔ نہ کوئی سبسکرپشن، نہ پے والے باب: پوری لائبریری طلباء کے لیے کھلی ہے۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
    detail:
      "Free means every shelf, every chapter, every poem video and every animated story — and no ads inside the books either. The only optional step is creating an account, so your reading, streak and bookmarks carry over.",
    detailUrdu:
      "مفت کا مطلب ہے ہر شیلف، ہر باب، ہر نظم ویڈیو اور ہر متحرک کہانی — اور کتابوں کے اندر کوئی اشتہار بھی نہیں۔ صرف اختیاری قدم اکاؤنٹ بنانا ہے تاکہ آپ کی پڑھائی، سٹریک اور بک مارکس منتقل ہو سکیں۔",
  },
  {
    id: "languages",
    keywords: ["urdu", "english", "bilingual", "translation", "language", "side"],
    question: "Are books in Urdu and English?",
    answer:
      "Both. The library is bilingual: poems and stories line up in Urdu and English side by side, so meaning is never a guess, and the whole app switches language with one tap.",
    answerUrdu:
      "دونوں۔ لائبریری دو زبانی ہے: نظمیں اور کہانیاں اردو اور انگریزی ساتھ ساتھ ہیں تاکہ مطلب کا اندازہ نہ لگانا پڑے، اور پوری ایپ ایک ٹپ میں زبان بدلتی ہے۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
  },
  {
    id: "daffodils",
    keywords: ["daffodils", "wordsworth", "cloud", "lonely", "poem"],
    question: "Explain the poem \"Daffodils\".",
    answer:
      "Wordsworth's \"Daffodils\" describes the poet wandering like a cloud and suddenly seeing a long row of golden daffodils beside a lake. Later, when he is idle, the joyful scene comes back to his mind and lifts his spirits. Its message: nature keeps giving long after the moment has passed.",
    answerUrdu:
      "ورڈزورتھ کی \"ڈیفوڈلز\": شاعر بادل کی طرح بھٹکتا ہے اور اچانک جھیل کے کنارے سنہرے ڈیفوڈلز کی لمبی کتیں دیکھتا ہے۔ بعد میں جب وہ بیکار بیٹھتا ہے تو وہ منظر یاد آ کر اس کا دل خوش کر دیتا ہے۔ پیغام: قدرت وہ لطف ہمیشہ دیتی ہے۔",
    source: "English Poems",
    sourceUrdu: "نظمیں",
    detail:
      "Wordsworth and his sister Dorothy walked beside Ullswater in 1802 and came upon a long belt of daffodils along the shore; the poem comes from that walk. Later, lying on his couch, the memory alone makes his heart dance again — that is the poem's claim about nature.",
    detailUrdu:
      "ورڈزورتھ اور اس کی بہن ڈوروتھی ۱۸۰۲ میں الج سواتر کے کنارے چلتے ہوئے ساحل پر ڈیفوڈلز کی لمبی کتی سے ملے؛ نظم انہیں پر لکھی گئی۔ بعد میں، کاؤچ پر لیٹے ہوئے صرف یاد ہی اس کے دل کو دوبارہ نچاتی ہے — یہی قدرت کا پیغام ہے۔",
  },
  {
    id: "if-poem",
    keywords: ["if", "kipling", "head", "trust", "won", "lost", "poem"],
    question: 'What is the poem "If —" about?',
    answer:
      "Kipling's \"If —\" lists the composure a person needs to grow up well: keeping your head when others lose theirs, trusting yourself while allowing for doubt, meeting triumph and disaster the same way — and only then, filling the unforgiving minute with purpose.",
    answerUrdu:
      "کپلنگ کی \"اگر\": بڑے ہونے کے لیے ضروری سکون کی فہرست — جب سب اپنا بھلاچوکے تو اپنا سر گھٹنے نہ دینا، خود پر بھروسہ رکھتے ہوئے دوسروں کے شک کو بھی جگہ دینا، جیت اور ہار کو ایک جیسا دیکھنا — اور پھر ہر لمحے کو مقصد سے بھرنا۔",
    source: "English Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "lab-pe-dua",
    keywords: ["lab", "ati", "dua", "iqbal", "children", "school", "namaz"],
    question: 'What is "Lab Pe Aati Hai Dua" about?',
    answer:
      "\"Lab Pe Aati Hai Dua\" is Allama Iqbal's prayer of a child: he asks for eyes that light up with the Quran, a heart that trembles with faith, hands that reach out for prayer, and a life spent doing good.",
    answerUrdu:
      "\"لب پہ آتی ہے دعا\" علامہ اقبال کی ایک بچے کی دعا ہے: وہ آئینے جیسی آنکھیں مانگتا ہے جو قرآن سے روشن ہوں، ایسا دل جو ایمان سے کانپے، نماز کی طرف بڑھتے ہاتھ، اور ایسی زندگی جو دوسروں کے لیے روشنی بنے۔",
    source: "English Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "search",
    keywords: ["search", "find", "book", "shelf", "category", "browse", "library"],
    question: "How do I find a book?",
    answer:
      "Open Library and tap a shelf — Novels, Islamic Books, Children's Stories, Moral Stories, Poems, Animated Books or GK. The search box at the top matches titles and authors in both Urdu and English.",
    answerUrdu:
      "لائبریری کھولیں اور کوئی شیلف چنیں — ناول، اسلامی کتب، بچوں کی کہانیاں، اخلاقی کہانیاں، نظمیں، اینیمیٹڈ کتب یا جی کے۔ اوپر سرچ باکس دونوں زبانوں میں عنوان اور مصنف سے ملتا ہے۔",
    source: "Library",
    sourceUrdu: "لائبریری",
  },
  {
    id: "saved",
    keywords: ["save", "bookmark", "saved", "favourite", "favorite"],
    question: "How do I save a book for later?",
    answer:
      "Tap the bookmark icon on any book card or inside the reader. Everything you save appears on the Saved tab, and your account keeps it across sessions.",
    answerUrdu:
      "کسی بھی بک کارڈ یا ریڈر کے اندر بک مارک آئیکن دبائیں۔ آپ کی ہر محفوظ شدہ چیز سیوڈ ٹیب پر آتی ہے اور اکاؤنٹ ہر سیشن میں رکھتا ہے۔",
    source: "Saved",
    sourceUrdu: "محفوظ شدہ",
    detail:
      "Saved items follow your account, so a book bookmarked on one device appears on every other one you sign in from. The Saved tab also has its own search box, which finds a title the moment you start typing.",
    detailUrdu:
      "محفوظ شدہ چیزیں اکاؤنٹ کے ساتھ جڑی ہوتی ہیں، اس لیے ایک ڈیوائس پر بک مارک شدہ کتاب دوسرے ڈیوائس پر بھی آ جاتی ہے۔ سیوڈ ٹیب کا اپنا سرچ باکس ہے جو ٹائپ شروع ہوتے ہی عنوان ڈھونڈ دیتا ہے۔",
  },
  {
    id: "reading-settings",
    keywords: ["font", "size", "read", "bigger", "text", "dyslexia", "setting"],
    question: "Can I change the text while reading?",
    answer:
      "Yes. The reader has font-size controls, a dyslexia-friendly font option, and dark mode — all from the toolbar at the top of the page.",
    answerUrdu:
      "جی۔ ریڈر میں فونٹ سائز کنٹرول، ڈس لیکسیا فرینڈلی فونٹ آپشن اور ڈارک موڈ ہیں — سب صفحے کے اوپر ٹول بار سے۔",
    source: "Reader",
    sourceUrdu: "ریڈر",
  },
  {
    id: "greeting",
    keywords: ["salam", "hello", "hi", "assalam", "asalam", "asalamu", "aslamo", "hey", "greetings", "adab"],
    question: "Salam / Hello!",
    answer:
      "Wa alaikum assalam! Hello! I'm Rehnuma, your reading guide at Kitaabistan. Ask me about books, poems, stories or how the app works — I only answer from our approved library.",
    answerUrdu:
      "وعلیکم السلام! ہیلو! میں رہنما ہوں، کتابستان کی آپ کی پڑھائی کی رہنمائی کرنے والی۔ کتابوں، نظموں، کہانیوں یا ایپ کے استعمال کے بارے میں پوچھیے — میں صرف منظور شدہ لائبریری سے جواب دیتا ہوں۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
  },
  {
    id: "goodbye",
    keywords: ["bye", "goodbye", "good bye", "god by", "khuda hafiz", "allah hafiz", "alvida", "see you", "tata", "phir milenge"],
    question: "Goodbye!",
    answer:
      "Goodbye! 👋 Happy reading — I'll be right here whenever you come back. Khuda hafiz!",
    answerUrdu:
      "الوداع! 👋 خوش قراءت — جب بھی واپس آئیں، میں یہیں ملاؤں گا۔ خدا حافظ!",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
  },
  {
    id: "pages",
    keywords: ["page", "pages", "navigate", "navigation", "menu", "section", "where", "route", "home", "profile", "saved"],
    question: "Which pages does the app have?",
    answer:
      "Seven pages: Home (/home) for your dashboard, Library (/library) for all shelves and search, Poems (/poems) for cartoon poem videos, Stories (/stories) for animated stories, Chatbot (/chatbot) for me, Saved (/saved) for bookmarks, and Profile (/profile) for streaks, badges and settings.",
    answerUrdu:
      "سات صفحات: ہوم (/home) ڈیش بورڈ کے لیے، لائبریری (/library) تمام شیلف اور سرچ کے لیے، نظمیں (/poems) کارٹون پوئم ویڈیوز کے لیے، کہانیاں (/stories) متحرک کہانیوں کے لیے، چیٹ بوٹ (/chatbot) میرے لیے، محفوظ شدہ (/saved) بک مارکس کے لیے، اور پروفائل (/profile) سٹریک، بیجز اور سیٹنگز کے لیے۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
  },
  {
    id: "poems-location",
    keywords: ["poems", "poem", "nazm", "nazmain", "rhyme", "verse"],
    question: "Where can I find all the poems?",
    answer:
      "All 8 cartoon poem videos live on the Poems page (/poems): Daffodils, If —, Twinkle Twinkle Little Star, Lab Pe Aati Hai Dua, Humpty Dumpty, Baa Baa Black Sheep, Mary Had a Little Lamb and Sitaron Ki Kahani — each with animated scenes and narration in Urdu and English.",
    answerUrdu:
      "تمام ۸ کارٹون نظمیں نظمیں صفحے (/poems) پر ہیں: ڈیفوڈلز، اگر، ٹوٹکن ٹوٹکن چھوٹا ستارہ، لب پہ آتی ہے دعا، ہمپی ڈمپی، بھیں بھیں کالا بھیڑ، میری کے پاس ایک چھوٹا بھیڑ اور ستاروں کی کہانی — ہر ایک متحرک مناظر اور اردو-انگریزی آواز کے ساتھ۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "stories-location",
    keywords: ["stories", "story", "kahani", "kahaniyan", "animated", "tortoise", "hare", "crow", "bear"],
    question: "Which animated stories are there?",
    answer:
      "Four animated stories on the Stories page (/stories): The Tortoise and the Hare, The Thirsty Crow, The Moon's Little Friend, and The Two Friends and the Bear — each with animated scenes, characters and narration in Urdu and English.",
    answerUrdu:
      "کہانیاں صفحے (/stories) پر چار متحرک کہانیاں ہیں: کچھوہ اور خرگہ، پیاسا کووا، چاند کا چھوٹا دوست اور دو دوست اور بھالو — ہر ایک متحرک مناظر، پیشوں اور اردو-انگریزی آواز کے ساتھ۔",
    source: "Stories",
    sourceUrdu: "کہانیاں",
  },
  {
    id: "twinkle-poem",
    keywords: ["twinkle", "little", "star", "taylor", "diamond"],
    question: 'Explain the poem "Twinkle, Twinkle, Little Star".',
    answer:
      "Jane Taylor's lullaby asks the star what it is — twinkling above the world like a diamond in the sky. Watch it as a cartoon poem video on the Poems page (/poems).",
    answerUrdu:
      "جین ٹیلر کی گلی بچوں کی نظم بچے سے پوچھتی ہے کہ ٹمٹماتا ستارہ تو کیسے ہے — دنیا کے اوپر آسمان میں ہیرے جیسا۔ اسے نظمیں صفحے (/poems) پر کارٹون ویڈیو کے طور پر دیکھیں۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "humpty-poem",
    keywords: ["humpty", "dumpty", "wall", "horse", "king", "fall"],
    question: 'What is "Humpty Dumpty" about?',
    answer:
      "The classic nursery rhyme: Humpty Dumpty sat on a wall and had a great fall — and all the king's horses and men could not put him together again. Watch it on the Poems page (/poems).",
    answerUrdu:
      "مشہور بچوں کی نظم: ہمپی ڈمپی دیوار پر بیٹھا اور زور سے گرا — بادشاہ کے سارے گھڑے اور سپاہی اسے دوبارہ جوڑ نہ سکے۔ نظمیں صفحے (/poems) پر دیکھیں۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "baa-baa-poem",
    keywords: ["baa", "black", "sheep", "wool", "bags"],
    question: 'What is "Baa Baa Black Sheep" about?',
    answer:
      "The rhyme asks a black sheep if he has any wool — yes sir, three bags full: one for the master, one for the dame and one for the little boy down the lane. On the Poems page (/poems).",
    answerUrdu:
      "یہ نظم کالے بھیڑ سے پوچھتی ہے کہ کیا اون ہے — جی ہاں، تین بوریاں: ایک مالک کے لیے، ایک بیگم کے لیے اور ایک چھوٹے بچے کے لیے۔ نظمیں صفحے (/poems) پر۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "mary-lamb-poem",
    keywords: ["mary", "lamb", "school", "fleece", "snow"],
    question: 'What is "Mary Had a Little Lamb" about?',
    answer:
      "Mary's lamb has fleece white as snow and follows her everywhere — even to school, which is against the rule and makes all the children laugh. On the Poems page (/poems).",
    answerUrdu:
      "میری کے بھیڑ کا پشم برف جیسا سفید ہے اور وہ ہر جگہ اس کے ساتھ چلتا ہے — سکول تک بھی، جو قاعدے کے خلاف ہے اور سارے بچوں کو ہنساتا ہے۔ نظمیں صفحے (/poems) پر۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "sitarey-poem",
    keywords: ["sitarey", "sitaron", "kahani", "guards", "night", "sleep"],
    question: 'What is "Sitaron Ki Kahani" about?',
    answer:
      "Our own bedtime poem: when the moon climbs the sky, little stars come out to blink and shine, guarding us the whole night — then it is time to sleep, because morning brings the sun. On the Poems page (/poems).",
    answerUrdu:
      "ہماری اپنی سون پر سنائی جانے والی نظم: جب چاند آسمان پر چڑھے تو چھوٹے ستارے کھیلنے آتے ہیں، ٹمٹماتے اور پوری رات ہماری حفاظت کرتے ہیں — پھر سونے کا وقت ہے، کیونکہ صبح سورج لاتا ہے۔ نظمیں صفحے (/poems) پر۔",
    source: "Poems",
    sourceUrdu: "نظمیں",
  },
  {
    id: "account",
    keywords: ["account", "signup", "sign", "login", "password", "progress"],
    question: "Do I need an account?",
    answer:
      "You can browse as a guest or with a timed demo, but a free account keeps your progress, streaks, badges and saved books on every device you sign in from.",
    answerUrdu:
      "آپ مہمان یا ڈیمو کے طور پر براؤز کر سکتے ہیں، مگر مفت اکاؤنٹ آپ کی پروگریس، سٹریک، بیجز اور محفوظ شدہ کتابوں کو ہر ڈیوائس پر رکھتا ہے۔",
    source: "Kitaabistan",
    sourceUrdu: "کتابستان",
    detail:
      "A guest session keeps things only for the current visit, and a demo stops when its timer runs out. A free account keeps bookmarks, streaks, badges and saved books across every device — and either way you can read everything, nothing is paywalled.",
    detailUrdu:
      "مہمان سیشن صرف اسی وزٹ میں رکھتا ہے اور ڈیمو ٹائمر ختم ہوتے ہی رک جاتا ہے۔ مفت اکاؤنٹ بک مارکس، سٹریک، بیجز اور محفوظ کتابیں ہر ڈیوائس پر رکھتا ہے — اور ہر صورت میں سب کچھ پڑھا جا سکتا ہے، کچھ بھی پے والد نہیں۔",
  },
];

function normalise(text) {
  return text
    .toLowerCase()
    .replace(/["'’“”]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalise(text)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export function answerFor(message, lang = "en") {
  const raw = normalise(message);
  const tokens = tokenize(message);
  if (!raw) return { matched: false, answer: "", suggestions: [] };

  const scored = KNOWLEDGE_BASE.map((entry) => {
    let score = 0;
    const normalisedKeywords = entry.keywords.map(normalise);

    if (normalisedKeywords.includes(raw)) score += 6;

    for (const keyword of normalisedKeywords) {
      if (keyword.includes(" ") && raw.includes(keyword)) score += 4;
      if (tokens.includes(keyword)) score += 3;
      else if (tokens.some((tok) => tok.length > 3 && keyword.includes(tok))) score += 1.5;
      else if (tokens.some((tok) => tok.length > 4 && tok.includes(keyword))) score += 1;
    }

    const questionTokens = tokenize(entry.question);
    score += questionTokens.filter((q) => tokens.includes(q)).length * 1.5;

    return { entry, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best && best.score >= 4) {
    const entry = best.entry;
    const answer = lang === "ur" && entry.answerUrdu ? entry.answerUrdu : entry.answer;
    return {
      matched: true,
      answer,
      question: entry.question,
      source: lang === "ur" ? entry.sourceUrdu : entry.source,
      suggestions: [],
    };
  }

  const suggestions = scored
    .filter((s) => s.score > 0)
    .slice(0, 3)
    .map((s) => s.entry.question);

  return {
    matched: false,
    answer:
      lang === "ur"
        ? "اس کا منظور شدہ جواب ابھی میرے علم میں نہیں — آپ کا سوال یاد رکھ لیا ہے تاکہ استاد/بانی اسے کھلے میں شامل کر سکیں۔"
        : "I don't have an approved answer for that yet — I've noted your question so it can be added to my knowledge base.",
    suggestions: suggestions.length
      ? suggestions
      : [
          "What is the moral of \"The Ant and the Grasshopper\"?",
          "Does it work without internet?",
        ],
  };
}

export function starterQuestions() {
  const pick = (id) => {
    const entry = KNOWLEDGE_BASE.find((e) => e.id === id);
    return entry ? entry.question : "";
  };
  return [pick("ant-grasshopper"), pick("poems-location"), pick("offline")].filter(Boolean);
}
