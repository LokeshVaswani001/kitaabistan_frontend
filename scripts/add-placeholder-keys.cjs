const fs = require("fs");
const path = require("path");

/* Reader-facing text for books whose full text isn't in the library yet.
   (Was hard-coded dev-speak English on the reading screen.) */
const KEYS = {
  phPage1: {
    en: "This book hasn't been added to the library yet. Once it is, you'll read it here, page by page.",
    ur: "اس کتاب کا متن ابھی لائبریری میں نہیں ہے۔ جیسے ہی شامل ہوگا، آپ یہیں صفحوں کے صفحوں پڑھیں گے۔",
    ar: "لم تُضَف نصوص هذا الكتاب إلى المكتبة بعد. وبمجرد إضافتها ستقرأه هنا صفحةً صفحة.",
    fa: "متن این کتاب هنوز به کتابخانه اضافه نشده است. به محض اضافه‌شدنش، همین‌جا می‌خوانیدش.",
    ps: "د دې کتاب متن لا ته کتابتون ته نه دي اضافه شوی. څخه وروسته یې اضافه شي، تاسو دلته پر پرېکو لیدل شئ.",
    sd: "هنن ڪتاب جو متن اڃا ڪتاب خانه ۾ داخل نه ڪيو ويو آهي. جيئن ٿئي، توهان هتي صفحو صفحو پڙهندا.",
    hi: "इस किताब का पाठ अभी लाइब्रेरी में नहीं है। जुड़ते ही आप यहीं पन्ना-दर-पन्ना पढ़ेंगे।",
    bn: "এই বইয়ের লেখা এখনো লাইব্রেরিতে যোগ হয়নি। যোগ হলেই এখানেই পাতা ধরে পড়বেন।",
    pa: "ਇਸ ਕਿਤਾਬ ਦਾ ਪਾਠ ਹਾਲੇ ਲਾਇਬ੍ਰੇਰੀ ਵਿੱਚ ਨਹੀਂ ਹੈ। ਜਿਵੇਂ ਹੀ ਜੁੜੇਗਾ, ਤੁਸੀਂ ਇੱਥੇ ਹੀ ਪੰਨਾ-ਦਰ-ਪੰਨਾ ਪੜ੍ਹੋਗੇ।",
    tr: "Bu kitabın metni henüz kütüphanede değil. Eklendiğinde burada, sayfa sayfa okuyacaksın.",
    es: "El texto de este libro aún no está en la biblioteca. En cuanto se añada, lo leerás aquí, página a página.",
    fr: "Le texte de ce livre n'est pas encore dans la bibliothèque. Dès qu'il y sera, vous le lirez ici, page après page.",
    de: "Der Text dieses Buches ist noch nicht in der Bibliothek. Sobald er dort ist, lesen Sie ihn hier, Seite für Seite.",
    pt: "O texto deste livro ainda não está na biblioteca. Assim que estiver, lê-lo aqui, página a página.",
    ru: "Текста этой книги пока нет в библиотеке. Как только он появится, вы прочитаете её здесь, страница за страницей.",
    zh: "这本书的正文还没有放进图书馆。一放进来，你就能在这里一页一页地读。",
    id: "Teks buku ini belum ada di perpustakaan. Begitu masuk, kamu bisa membacanya di sini, halaman demi halaman.",
    ja: "この本の本文はまだ図書館に入っていません。入り次第、ここでページごとに読めます。",
  },
  phPage2: {
    en: "Reading here turns one page at a time, like a real book — no endless scrolling.",
    ur: "یہاں پڑھنے میں ایک وقت میں ایک پنہا موڑا جاتا ہے، جیسے اصل کتاب میں — لامحدود سکرولنگ نہیں۔",
    ar: "القراءة هنا تعرض صفحة واحدة في كل مرة، مثل الكتاب المطبوع — لا تمرير لا ينتهي.",
    fa: "اینجا صفحه‌به‌صفه مثل کتاب چاپی ورق می‌خورد، نه یک اسکرول طولانی.",
    ps: "دلته لوستل د یو ورځ د چاپ شوی کتاب په څنګه یوه پرېکه بدلېږي، نه اوږد جریان.",
    sd: "هتي پڙهڻ هڪ وقت ۾ هڪ صفحو بدلائي وڃي ٿو، جيئن ٿاڻي ڪتاب ۾ — نه گھڻي لمبي اسڪرول.",
    hi: "यहाँ पढ़ते हुए एक समय में एक पन्ना पलटता है, जैसे असली किताब में — लंबी स्क्रॉलिंग नहीं।",
    bn: "এখানে পড়ার সময় এক সময়ে একটি পাতা ওলটানো হয়, যেমন আসল বইয়ে — লামিক স্ক্রল নয়।",
    pa: "ਇੱਥੇ ਪੜ੍ਹਦੇ ਸਮੇਂ ਇੱਕ ਵਾਰ ਵਿੱਚ ਇੱਕ ਪੰਨਾ ਪਲਿਟਦਾ ਹੈ, ਜਿਵੇਂ ਅਸਲੀ ਕਿਤਾਬ ਵਿੱਚ — ਲੰਬੀ ਸਕ੍ਰੌਲਿੰਗ ਨਹੀਂ।",
    tr: "Burada sayfalar, gerçek bir kitap gibi tek tek döner; sonsuz kaydırma yok.",
    es: "Aquí se pasa página a página, como en un libro de verdad, sin desplazamientos interminables.",
    fr: "Ici, les pages tournent une à une, comme dans un vrai livre — plus de défilement sans fin.",
    de: "Hier wird Seite für Seite umgeblättert, wie in einem echten Buch — kein endloses Scrollen.",
    pt: "Aqui as páginas viram uma de cada vez, como num livro a sério — sem rolagem infinita.",
    ru: "Здесь страницы листаются по одной, как в настоящей книге, — без бесконечной прокрутки.",
    zh: "这里一页一页地翻，像真正的书一样——不用一直往下滚。",
    id: "Di sini halaman dibalik satu per satu, seperti buku asli — bukan gulir tanpa henti.",
    ja: "ここでは本のように1ページずつめくれます。長いスクロールはありません。",
  },
  phPage3: {
    en: "Font size, dark mode, bookmarks and read-aloud work on every page, so nothing gets in the way of a good read.",
    ur: "فونٹ سائز، ڈارک موڈ، بک مارکس اور پڑھ کر سنانا ہر پنہے پر کام کرتے ہیں، تاکہ پڑھنے میں کچھ نہ آئے۔",
    ar: "حجم الخط والوضع الليلي والعلامات المرجعية والقراءة بصوت عالٍ تعمل في كل صفحة، فلا شيء يعترض قراءتك.",
    fa: "اندازهٔ فونت، حالت تاریک، نشانک‌ها و خواندن با صدا روی همه صفحه‌ها کار می‌کنند تا چیزی میان شما و خواندن نباشد.",
    ps: "د فونت کچه، تور حالت، نښې او لوستل د غږ سره هر پرېکې کار کوي، نو څه هم ستاسو او لوستل ترمنځ نه وي.",
    sd: "فونٽ سايز، ڊارڪ موڊ، نشاني ۽ غوطن سان پڙهڻ هر صفحي تي ڪم ڪن ٿا، ته توهان جي پڙهڻ تي ڪو نه روڪي.",
    hi: "फ़ॉन्ट साइज़, डार्क मोड, बुकमार्क और पढ़कर सुनाना हर पन्ने पर काम करते हैं, ताकि पढ़ने में कुछ बीच में न आए।",
    bn: "ফন্ট সাইজ, ডার্ক মোড, বুকমার্ক আর পড়ে শোনানো প্রতিটি পাতায় কাজ করে, তাই পড়ার আড়াল কিছু থাকে না।",
    pa: "ਫੌਂਟ ਸਾਈਜ਼, ਡਾਰਕ ਮੋਡ, ਬੁੱਕਮਾਰਕ ਅਤੇ ਪੜ੍ਹ ਕੇ ਸੁਣਾਉਣਾ ਹਰ ਪੰਨੇ ਤੇ ਕੰਮ ਕਰਦੇ ਹਨ, ਤਾਂ ਜੋ ਪੜ੍ਹਾਈ ਵਿੱਚ ਕੁਝ ਵਿਚਕੇ ਨਾ ਆਵੇ।",
    tr: "Yazı boyutu, karanlık mod, yer imleri ve sesli okuma her sayfada çalışır, okumanın önüne hiçbir şey geçmez.",
    es: "El tamaño de letra, el modo oscuro, los marcadores y la lectura en voz alta funcionan en cada página, así nada interrumpe tu lectura.",
    fr: "Taille du texte, mode sombre, favoris et lecture à voix haute fonctionnent sur chaque page, rien n'interrompt votre lecture.",
    de: "Schriftgröße, Dunkelmodus, Lesezeichen und Vorlesen funktionieren auf jeder Seite, damit beim Lesen nichts stört.",
    pt: "Tamanho do texto, modo escuro, favoritos e leitura em voz alta funcionam em cada página, para nada interromper a leitura.",
    ru: "Размер шрифта, тёмная тема, закладки и чтение вслух работают на каждой странице, так что чтение никто не мешает.",
    zh: "字号、深色模式、书签和朗读在每一页都能用，读起来不会被打断。",
    id: "Ukuran teks, mode gelap, markah, dan fitur membacakan berfungsi di setiap halaman, jadi tidak ada yang mengganggu bacaanmu.",
    ja: "文字サイズ、ダークモード、ブックマーク、読み上げはどのページでも使えるので、読む邪魔をしません。",
  },
  phPage4: {
    en: "When the full text arrives, these pages become the real book, sized to fit your screen.",
    ur: "جب مکمل متن آ جائے گا، یہ پنہے اصل کتاب بن جائیں گے، آپ کی اسکرین کے مطابق سائز میں۔",
    ar: "وعندما يصل النص الكامل، تصبح هذه الصفحات الكتاب الحقيقيًا بما يلائم شاشتك.",
    fa: "وقتی متن کامل بیاید، این صفحه‌ها همان کتاب واقعی می‌شوند، اندازهٔ صفحهٔ شما.",
    ps: "کله چې بشپړ متن رامنا کړي، دغو پرېکو خپل اصلي کتاب شي، ستاسو سکرین ته سم تنظیم شوی.",
    sd: "جب مڪمل متن اچي، اين صفحو اصل ڪتاب بن ويندو، توهان جي اسڪرين جي پياڻ سان.",
    hi: "जब पूरा पाठ आ जाएगा, ये पन्ने असली किताब बन जाएँगे, आपकी स्क्रीन के हिसाब से।",
    bn: "পুরো লেখা এলে এই পাতাগুলোই হবে আসল বই, আপনার স্ক্রিনের মাপে।",
    pa: "ਜਦੋਂ ਪੂਰਾ ਪਾਠ ਆ ਜਾਵੇਗਾ, ਇਹ ਪੰਨੇ ਅਸਲੀ ਕਿਤਾਬ ਬਣ ਜਾਣਗੇ, ਤੁਹਾਡੀ ਸਕ੍ਰੀਨ ਦੇ ਅਨੁਸਾਰ।",
    tr: "Tam metin geldiğinde bu sayfalar gerçek kitaba dönüşür, ekranına göre boyutlanır.",
    es: "Cuando llegue el texto completo, estas páginas serán el libro real, ajustado a tu pantalla.",
    fr: "Quand le texte complet arrivera, ces pages deviendront le vrai livre, adapté à votre écran.",
    de: "Wenn der vollständige Text da ist, werden diese Seiten zum echten Buch, passend auf Ihren Bildschirm.",
    pt: "Quando o texto completo chegar, estas páginas serão o livro real, ajustado ao teu ecrã.",
    ru: "Когда полный текст появится, эти страницы станут настоящей книгой, подстроенной под ваш экран.",
    zh: "全文一到，这些页面就会变成真正的书，并按你的屏幕排好。",
    id: "Kalau teks lengkapnya sudah ada, halaman-halaman ini jadi buku sungguhan, pas dengan layarmu.",
    ja: "本文が届いたら、これらのページは実際の本になり、画面に合わせて組まれます。",
  },
  phEndNote: {
    en: "That's the end of the preview. The rest of the book opens as soon as the full text is added.",
    ur: "پیش منظر یہیں ختم ہوتا ہے۔ باقی کتاب مکمل متن شامل ہوتے ہی کھل جائے گی۔",
    ar: "انتهت هذه المعاينة. يُفتح بقيّة الكتاب بمجرد إضافة نصه الكامل.",
    fa: "پیش‌نمایش تمام شد. بقیهٔ کتاب به‌محض پیوستن متن کاملش باز می‌شود.",
    ps: "دا لیدنه وروسته ده. پاتې کتاب یوازه هله یې بشپړ متن کتابتون ته پکې شامل شي دا پرانیستل شي.",
    sd: "هتي ليدڻ ختم ٿي وڃي ٿو. ٻاقي ڪتاب توهان جو مڪمل متن ڪتاب خانه ۾ شامل ٿئي تي ظاهر ٿيندو.",
    hi: "यहीं पर प्रीव्य़ू ख़त्म होता है। बाकी किताब पूरा पाठ जुड़ते ही खुल जाएगी।",
    bn: "প্রিভিউ এখানে শেষ। পুরো লেখা যুক্ত হলেই বাকি বইটি খুলবে।",
    pa: "ਪ੍ਰੀਵਿਊ ਇੱਥੇ ਖ਼ਤਮ ਹੁੰਦਾ ਹੈ। ਬਾਕੀ ਕਿਤਾਬ ਪੂਰਾ ਪਾਠ ਜੁੜਨ ਤੇ ਖੁੱਲ੍ਹ ਜਾਵੇਗੀ।",
    tr: "Önizleme burada bitiyor. Kalan kitap, tam metni kütüphaneye eklendiğinde açılacak.",
    es: "Aquí termina la vista previa. El resto del libro se abrirá cuando se añada el texto completo.",
    fr: "L'aperçu s'arrête ici. Le reste du livre s'ouvrira dès que le texte complet rejoindra la bibliothèque.",
    de: "Die Vorschau endet hier. Der Rest des Buches öffnet sich, sobald der vollständige Text in der Bibliothek ist.",
    pt: "A pré-visualização acaba aqui. O resto do livro abre assim que o texto completo entrar na biblioteca.",
    ru: "На этом предпросмотр заканчивается. Остальная часть книги откроется, как только полный текст попадёт в библиотеку.",
    zh: "预览到这里结束。全文一进图书馆，剩下的内容就会打开。",
    id: "Pratinjau berakhir di sini. Sisa bukunya terbuka begitu teks lengkap masuk ke perpustakaan.",
    ja: "プレビューはここまでです。本文が図書館に入り次第、続きが開きます。",
  },
};

const LANGS = ["en", "ur", "ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];

for (const lang of LANGS) {
  for (const [key, table] of Object.entries(KEYS)) {
    if (typeof table[lang] !== "string" || !table[lang].trim())
      throw new Error(`missing or empty ${lang}.${key}`);
  }
}

function linesFor(lang, indent) {
  const out = [];
  for (const [key, table] of Object.entries(KEYS)) {
    const value = table[lang];
    if (value === undefined) throw new Error(`missing ${lang}.${key}`);
    out.push(`${indent}${key}: ${JSON.stringify(value)},`);
  }
  return out;
}

function ensureComma(lines, idx) {
  const prev = lines[idx - 1];
  if (prev !== undefined && !prev.trimEnd().endsWith(",") && !/[{[]$/.test(prev.trimEnd())) {
    lines[idx - 1] = prev.trimEnd() + ",";
  }
}

function insertBefore(lines, idx, newLines) {
  ensureComma(lines, idx);
  lines.splice(idx, 0, ...newLines);
}

const tp = "src/lib/translations.js";
const tText = fs.readFileSync(tp, "utf8");
const tSep = tText.includes("\r\n") ? "\r\n" : "\n";
const tl = tText.split(/\r?\n/);
const urIdx = tl.findIndex((l) => /^ {2}ur: \{/.test(l));
if (urIdx < 0) throw new Error("ur block not found");
if (tl.some((l) => /^ {4}phPage1:/.test(l))) {
  console.log("translations.js already has the keys — skipped");
} else {
  insertBefore(tl, urIdx - 1, linesFor("en", "    "));
  const objCloseIdx = tl.findIndex((l) => /^};$/.test(l.replace(/\r$/, "")));
  if (objCloseIdx < 0) throw new Error("translations object close not found");
  if (!/^ {2}\},?$/.test(tl[objCloseIdx - 1].replace(/\r$/, "")))
    throw new Error("ur block close not found: " + JSON.stringify(tl[objCloseIdx - 1]));
  insertBefore(tl, objCloseIdx - 1, linesFor("ur", "    "));
  fs.writeFileSync(tp, tl.join(tSep));
  console.log("translations.js: +5 en, +5 ur");
}

for (const lang of LANGS.filter((c) => c !== "en" && c !== "ur")) {
  const fp = path.join("src", "lib", "locales", "lang", `${lang}.js`);
  const text = fs.readFileSync(fp, "utf8");
  const sep = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const closeIdx = lines.lastIndexOf("};");
  if (closeIdx < 0) throw new Error("close not found in " + fp);
  if (lines.some((l) => /^ {2}phPage1:/.test(l))) {
    console.log(`${lang}.js already has the keys — skipped`);
    continue;
  }
  insertBefore(lines, closeIdx, linesFor(lang, "  "));
  fs.writeFileSync(fp, lines.join(sep));
  console.log(`${lang}.js: +5`);
}
