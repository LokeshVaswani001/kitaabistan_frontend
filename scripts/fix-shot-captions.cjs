const fs = require("fs");

const p = "scripts/copy-10.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

j.shotHomeB = {
  en: "A greeting with your name, a search box, eight library shelves and the bilingual poems row — all on the first screen, waiting for you.",
  ur: "اپنے نام کے ساتھ خوشآمدید، تلاش کا خانہ، آٹھ شیلفیں اور دو زبانی نظمیں — سب سب سے پہلی اسکرین پر، آپ کا انتظار کر رہی ہیں۔",
  ar: "تحية باسمك، وحقل بحث، وثمانية رفوف، وصفحة الشعر ثنائي اللغة — كلها في الشاشة الأولى بانتظارك.",
  fa: "خوش‌آمدید با نام شما، جست‌وجو، هشت قفسه و شعر دوزبانه — همه در نخستین صفحه، منتظر شما.",
  ps: "ستاسو نوم سره خوش آمدید، لټون خانه، اټ شلیکونه او دوه ژبو غزل — ټول په لومړنۍ پرڼه، ستاسو منتظر دي.",
  sd: "توهان جي ناڻي سان خوش آمددين، ڳولڻ جو خانو، اٺ شيل ۽ دو ٻولي جي غزل — سڀ په پهريان پرڙهي توهان جي انتظار ڪري ٿا.",
  hi: "आपके नाम के साथ स्वागत, खोज बॉक्स, आठ शेल्फ़ और द्विभाषी नज़्में — सब कुछ पहली ही स्क्रीन पर, आपका इंतज़ार करते हुए।",
  bn: "নামসহ অভ্যর্থনা, সার্চ বক্স, আটটি তাক আর দ্বিভাষিক কবিতা — সবই প্রথম পর্দায়, আপনার অপেক্ষায়।",
  pa: "ਤੁਹਾਡੇ ਨਾਮ ਨਾਲ ਸਵਾਗਤ, ਖੋਜਬਾਕਸ, ਅੱਠ ਸ਼ੈਲਫ਼ ਅਤੇ ਦੋ-ਭਾਸ਼ੀ ਨਜ਼ਮੇ — ਸਭ ਪਹਿਲੀ ਸਕ੍ਰੀਨ ਤੇ, ਤੁਹਾਡੀ ਉਡੀਕ ਵਿੱਚ।",
  tr: "Adınızla karşılama, arama kutusu, sekiz raf ve iki dilli şiirler — hepsi ilk ekranda, sizi bekliyor.",
  fr: "Un accueil avec votre nom, une recherche, huit rayons et les poèmes bilingues — tout dès le premier écran, qui vous attend.",
  es: "Un saludo con tu nombre, el buscador, ocho estanterías y los poemas bilingües — todo en la primera pantalla, esperándote.",
  de: "Eine Begrüßung mit Ihrem Namen, die Suchleiste, acht Regale und zweisprachige Gedichte – alles schon auf dem ersten Bildschirm und wartet auf Sie.",
  pt: "Uma saudação com seu nome, a busca, oito estantes e os poemas bilíngues — tudo já na primeira tela, esperando por você.",
  ru: "Приветствие с вашим именем, поиск, восемь полок и двуязычные стихи — всё на первом экране и ждёт вас.",
  zh: "带你名字的问候、搜索框、八个书架和双语诗歌——全在首屏，等你来读。",
  id: "Sapaan dengan nama Anda, kotak pencarian, delapan rak dan puisi dwibahasa — semuanya di layar pertama, menunggu Anda.",
  ja: "名前入りのご挨拶、検索欄、8つの棚、二言語の詩 — すべて最初の画面に、あなたをお待ちしています。",
};

j.shotLibraryB = {
  en: "The library opens with cartoon poem videos, animated stories and your own uploads — then every shelf below. Download one and read it without internet.",
  ur: "لائبریری میں سب سے اوپر کارٹون نظمیں، متحرک کہانیاں اور آپ کی خود کی اپ لوڈز — پھر نیچے ہر شیلف۔ ایک ڈاؤن لوڈ کریں اور بغیر انٹرنیٹ پڑھیں۔",
  ar: "تفتح المكتبة على مقاطع شعر متحركة، وقصص متحركة، وملفاتك أنت — ثم كل الرفوف أدناه. نزّل واحدة واقرأ دون إنترنت.",
  fa: "کتابخانه با ویدیوهای شعر کارتونی، قصه‌های متحرک و فایل‌های خودتان باز می‌شود — بعد همه قفسه‌ها پایین. یکی را دانلود کنید و بی‌اینترنت بخوانید.",
  ps: "کتابخانه په پورتن کارتون غزل ویډیو، متحرکې کیسې او ستاسو خپل اپلوډونو پرانیستل کېږي — بیلګه لاندې هر شلیک. یو ډاون لوډ او بې انټرنټ لوستئ.",
  sd: "ڪتابخانه مٿان ڪارٽون غزل وڊيو، تحريڪ ڪهاڻيون ۽ توهان جون پنهن جون اپ لوڊز سان کولي وڃي ٿي — هيٺ ته هر شيل. هڪ ڊائون لوڊ ڪري ۽ بنا انٽرنيٽ پڙهو.",
  hi: "लाइब्रेरी सबसे ऊपर कार्टून नज़्म वीडियो, एनिमेटेड कहानियाँ और आपकी अपनी अपलोड्स से खुलती है — फिर नीचे हर शेल्फ़। एक डाउनलोड कीजिए और बिना इंटरनेट पढ़िए।",
  bn: "লাইব্রেরির শুরুতে কার্টুন কবিতার ভিডিও, অ্যানিমেটেড গল্প আর আপনার নিজের আপলোড — তার নিচে প্রতিটি তাক। একটি ডাউনলোড করুন, ইন্টারনেট ছাড়াই পড়ুন।",
  pa: "ਲਾਇਬ੍ਰੇਰੀ ਸਭ ਤੋਂ ਉੱਪਰ ਕਾਰਟੂਨ ਨਜ਼ਮ ਵੀਡੀਓ, ਐਨੀਮੇਟਡ ਕਹਾਣੀਆਂ ਅਤੇ ਤੁਹਾਡੀਆਂ ਆਪਣੀਆਂ ਅਪਲੋਡਾਂ ਨਾਲ ਖੁੱਲ੍ਹਦੀ ਹੈ — ਫਿਰ ਹੇਠਾਂ ਹਰ ਸ਼ੈਲਫ਼। ਇੱਕ ਡਾਊਨਲੋਡ ਕਰੋ ਅਤੇ ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਪੜ੍ਹੋ।",
  tr: "Kütüphane önce çizgi film şiir videoları, animasyonlu hikâyeler ve kendi yüklemelerinizle açılır — altında her raf. Birini indirin, internetsiz okuyun.",
  fr: "La bibliothèque s'ouvre sur des vidéos de poèmes dessinés, des histoires animées et vos propres fichiers — puis tous les rayons en dessous. Téléchargez-en un et lisez sans internet.",
  es: "La biblioteca se abre con vídeos de poemas dibujados, cuentos animados y tus propios archivos — y debajo, cada estantería. Descarga uno y léelo sin internet.",
  de: "Die Bibliothek öffnet mit Zeichentrick-Gedichtvideos, animierten Geschichten und eigenen Uploads – darunter jedes Regal. Eines herunterladen und ohne Internet lesen.",
  pt: "A biblioteca abre com vídeos de poemas em desenho, histórias animadas e seus próprios arquivos — e abaixo, cada estante. Baixe uma e leia sem internet.",
  ru: "Библиотека открывается мультипликационными стихами, анимированными историями и вашими загрузками — ниже все полки. Скачайте одну и читайте без интернета.",
  zh: "图书馆顶部是卡通诗歌视频、动画故事和你自己的上传——下面才是各个书架。下载一次，离线阅读。",
  id: "Perpustakaan dibuka dengan video puisi kartun, cerita animasi, dan unggahan Anda sendiri — lalu setiap rak di bawahnya. Unduh satu dan baca tanpa internet.",
  ja: "図書館の上にはアニメ詩の動画、アニメーションの物語、あなた自身のアップロード — その下に各棚。1つダウンロードすれば、ネットなしで読めます。",
};

fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
console.log("copy-10.json updated (shotHomeB, shotLibraryB)");
