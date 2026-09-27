const fs = require("fs");
const path = require("path");

/* Auth-page strings that were still hard-coded EN/UR. One entry per key,
   translated for every bundled language. */
const KEYS = {
  welcomeBack: {
    en: "Welcome back", ur: "خوش آمدید", ar: "مرحبًا بعودتك", fa: "خوش برگشتید",
    ps: "بیا ته خوش راغلی", sd: "۾ ڀلي ٻڌايو", hi: "वापसी पर स्वागत है",
    bn: "ফিরে আসায় স্বাগতম", pa: "ਵਾਪਸੀ ਤੇ ਸਵਾਗਤ ਹੈ", tr: "Tekrar hoş geldiniz",
    fr: "Bon retour", es: "Bienvenido de nuevo", de: "Willkommen zurück",
    pt: "Bem-vindo de volta", ru: "С возвращением", zh: "欢迎回来",
    id: "Selamat datang kembali", ja: "おかえりなさい",
  },
  errEmail: {
    en: "Enter a valid email address.", ur: "درست ای میل درکار ہے۔",
    ar: "أدخل بريدًا إلكترونيًا صالحًا.", fa: "یک ایمیل معتبر وارد کنید.",
    ps: "یوټاکل ایمیل دننه کړئ.", sd: "هڪ صحيح ايميل داخل ڪريو.",
    hi: "मान्य ईमेल दर्ज करें।", bn: "একটি বৈধ ইমেইল লিখুন।",
    pa: "ਇੱਕ ਵੈਧ ਈਮੇਲ ਦਰਜ ਕਰੋ।", tr: "Geçerli bir e-posta adresi girin.",
    fr: "Saisissez une adresse e-mail valide.", es: "Introduce una dirección de correo válida.",
    de: "Geben Sie eine gültige E-Mail-Adresse ein.", pt: "Insira um endereço de e-mail válido.",
    ru: "Введите действительный адрес электронной почты.", zh: "请输入有效的电子邮箱地址。",
    id: "Masukkan alamat email yang valid.", ja: "有効なメールアドレスを入力してください。",
  },
  errPasswordRequired: {
    en: "Password is required.", ur: "پاس ورڈ درکار ہے۔", ar: "كلمة المرور مطلوبة.",
    fa: "رمز عبور لازم است.", ps: "پټ نوم اړین دی.", sd: "پاس ورڊ ضروري آهي.",
    hi: "पासवर्ड आवश्यक है।", bn: "পাসওয়ার্ড প্রয়োজন।", pa: "ਪਾਸਵਰਡ ਲੋੜੀਂਦਾ ਹੈ।",
    tr: "Şifre gerekli.", fr: "Le mot de passe est requis.", es: "La contraseña es obligatoria.",
    de: "Passwort erforderlich.", pt: "A senha é obrigatória.", ru: "Пароль обязателен.",
    zh: "需要密码。", id: "Kata sandi wajib diisi.", ja: "パスワードは必須です。",
  },
  orWord: {
    en: "or", ur: "یا", ar: "أو", fa: "یا", ps: "یا", sd: "يا", hi: "या",
    bn: "অথবা", pa: "ਜਾਂ", tr: "veya", fr: "ou", es: "o", de: "oder", pt: "ou",
    ru: "или", zh: "或", id: "atau", ja: "または",
  },
  signupPanelTitle: {
    en: "Make your reading yours.", ur: "اپنی پڑھنے کی جگہ محفوظ کریں۔",
    ar: "اجعل قراءتك لك.", fa: "خواندنِ خود را از آنِ خود کنید.",
    ps: "خپل لوستلوځای خپل کړئ.", sd: "پنهنجي پڙهڻ جي جاءِ پنهنجيڪريو.",
    hi: "अपनी पढ़ाई को अपनी बनाएँ।", bn: "আপনার পড়াকে আপনার করে নিন।",
    pa: "ਆਪਣੀ ਪੜ੍ਹਾਈ ਨੂੰ ਆਪਣੀ ਬਣਾਓ।", tr: "Okumanı kendine ait kıl.",
    fr: "Faites de votre lecture la vôtre.", es: "Haz tuya tu lectura.",
    de: "Machen Sie Ihr Lesen zu Ihrem eigenen.", pt: "Torne a sua leitura sua.",
    ru: "Сделайте чтение своим.", zh: "让阅读成为你的专属。",
    id: "Jadikan bacaanmu milikmu.", ja: "読書をあなたのものに。",
  },
  signupPanelBody: {
    en: "An account carries your bookmarks, streak and progress with you across every device.",
    ur: "اکاؤنٹ بنائیں تاکہ بک مارکس، سٹریک اور پیش رفت ہر ڈیوائس پر منتقل ہو۔",
    ar: "يحمل حسابك علاماتك المرجعية وسلسلة قراءتك وتقدمك على كل جهاز.",
    fa: "حسابتان نشانک‌ها، پیاپی روزهای مطالعه و پیشرفت شما را روی همه دستگاه‌ها همراه می‌برد.",
    ps: "حساب ستاسو نښې، لکر او پرمختګ د ټولو وسایلو ته غواړي.",
    sd: "اڪائونٹ توهان جا نشاني، سلسلو ۽ ترقي ڀرڻ واري ڊائيس تي وٺي وڃي.",
    hi: "खाता आपके बुकमार्क, स्ट्रीक और प्रगति को हर डिवाइस पर साथ ले चलता है।",
    bn: "অ্যাকাউন্ট আপনার বুকমার্ক, স্ট্রিক ও অগ্রগতি প্রতিটি ডিভাইসে নিয়ে যায়।",
    pa: "ਅਕਾਊਂਟ ਤੁਹਾਡੇ ਬੁੱਕਮਾਰਕ, ਸਟਰੀਕ ਅਤੇ ਪ੍ਰਗਤੀ ਨੂੰ ਹਰ ਡਿਵਾਈਸ ਤੇ ਲੈ ਕੇ ਜਾਂਦਾ ਹੈ।",
    tr: "Hesabın yer imlerini, serisini ve ilerlemeni her cihaza taşır.",
    fr: "Un compte emporte vos favoris, votre série et votre progression sur tous vos appareils.",
    es: "Una cuenta lleva tus marcadores, racha y progreso a todos tus dispositivos.",
    de: "Ein Konto bringt Lesezeichen, Serie und Fortschritt auf jedes Gerät mit.",
    pt: "Uma conta leva os seus favoritos, sequência e progresso para qualquer dispositivo.",
    ru: "Аккаунт переносит закладки, серию и прогресс на любое устройство.",
    zh: "账户会把书签、连续阅读和进度带到每台设备。",
    id: "Akun membawa markah, rentetan, dan progres ke semua perangkat.",
    ja: "アカウントがあれば、ブックマーク・連続読書・進捗をどの端末にも持ち込めます。",
  },
  freeAccount: {
    en: "Free account", ur: "مفت اکاؤنٹ", ar: "حساب مجاني", fa: "حساب رایگان",
    ps: "آزاد حساب", sd: "مفت اڪائونٹ", hi: "मुफ़्त खाता", bn: "বিনামূল্যের অ্যাকাউন্ট",
    pa: "ਮੁਫ਼ਤ ਅਕਾਊਂਟ", tr: "Ücretsiz hesap", fr: "Compte gratuit", es: "Cuenta gratuita",
    de: "Kostenloses Konto", pt: "Conta gratuita", ru: "Бесплатный аккаунт", zh: "免费账户",
    id: "Akun gratis", ja: "無料アカウント",
  },
  errNameLength: {
    en: "Name must be at least 2 characters.", ur: "نام کم از کم 2 حروف کا ہو۔",
    ar: "يجب أن يتكون الاسم من حرفين على الأقل.", fa: "نام باید دست‌کم ۲ حرفی باشد.",
    ps: "نوم باید لږ تر لږه ۲ حروف وي.", sd: "نالو گھٽ ۾ گھٽ ٢ اکر وڃي.",
    hi: "नाम कम से कम 2 अक्षरों का होना चाहिए।", bn: "নাম কমপক্ষে ২ অক্ষরের হতে হবে।",
    pa: "ਨਾਮ ਘੱਟੋ-ਘੱਟ 2 ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।", tr: "Ad en az 2 karakter olmalıdır.",
    fr: "Le nom doit contenir au moins 2 caractères.", es: "El nombre debe tener al menos 2 caracteres.",
    de: "Der Name muss mindestens 2 Zeichen lang sein.", pt: "O nome deve ter pelo menos 2 caracteres.",
    ru: "Имя должно содержать не менее 2 символов.", zh: "姓名至少需要 2 个字符。",
    id: "Nama minimal 2 karakter.", ja: "名前は2文字以上必要です。",
  },
  errPasswordShort: {
    en: "Password must be at least {n} characters.", ur: "پاس ورڈ کم از کم {n} حروف کا ہو۔",
    ar: "يجب أن تتكون كلمة المرور من {n} أحرف على الأقل.", fa: "رمز عبور باید دست‌کم {n} نویسه باشد.",
    ps: "پټ نوم باید لږ تر لږه {n} حروف وي.", sd: "پاس ورڊ گھٽ ۾ گھٽ {n} اکر وڃي.",
    hi: "पासवर्ड कम से कम {n} अक्षरों का होना चाहिए।", bn: "পাসওয়ার্ড কমপক্ষে {n} অক্ষরের হতে হবে।",
    pa: "ਪਾਸਵਰਡ ਘੱਟੋ-ਘੱਟ {n} ਅੱਖਰਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।", tr: "Şifre en az {n} karakter olmalıdır.",
    fr: "Le mot de passe doit contenir au moins {n} caractères.", es: "La contraseña debe tener al menos {n} caracteres.",
    de: "Das Passwort muss mindestens {n} Zeichen lang sein.", pt: "A senha deve ter pelo menos {n} caracteres.",
    ru: "Пароль должен содержать не менее {n} символов.", zh: "密码至少需要 {n} 个字符。",
    id: "Kata sandi minimal {n} karakter.", ja: "パスワードは{n}文字以上必要です。",
  },
  namePlaceholder: {
    en: "Your name", ur: "آپ کا نام", ar: "اسمك", fa: "نام شما", ps: "ستاسو نوم",
    sd: "توهان جو نالو", hi: "आपका नाम", bn: "আপনার নাম", pa: "ਤੁਹਾਡਾ ਨਾਮ",
    tr: "Adın", fr: "Votre nom", es: "Tu nombre", de: "Ihr Name", pt: "O seu nome",
    ru: "Ваше имя", zh: "你的姓名", id: "Nama Anda", ja: "お名前",
  },
  createPassword: {
    en: "Create a password", ur: "پاس ورڈ بنائیں", ar: "أنشئ كلمة مرور", fa: "یک رمز عبور بسازید",
    ps: "پټ نوم جوړ کړئ", sd: "پاس ورڊ ٺاهيو", hi: "पासवर्ड बनाएँ",
    bn: "পাসওয়ার্ড তৈরি করুন", pa: "ਪਾਸਵਰਡ ਬਣਾਓ", tr: "Bir şifre oluştur",
    fr: "Créez un mot de passe", es: "Crea una contraseña", de: "Passwort erstellen",
    pt: "Crie uma senha", ru: "Придумайте пароль", zh: "创建密码", id: "Buat kata sandi",
    ja: "パスワードを作成",
  },
  strengthTooShort: {
    en: "Too short", ur: "بہت مختصر", ar: "قصيرة جدًا", fa: "خیلی کوتاه", ps: "ډېر ورو",
    sd: "ڀياڻڏينهن جو", hi: "बहुत छोटा", bn: "খুব ছোট", pa: "ਬਹੁਤ ਛੋਟਾ", tr: "Çok kısa",
    fr: "Trop court", es: "Muy corta", de: "Zu kurz", pt: "Curta demais", ru: "Слишком короткий",
    zh: "太短", id: "Terlalu pendek", ja: "短すぎます",
  },
  strengthWeak: {
    en: "Weak", ur: "کمزور", ar: "ضعيفة", fa: "ضعیف", ps: "کمزور", sd: "ڪمزور", hi: "कमज़ोर",
    bn: "দুর্বল", pa: "ਕਮਜ਼ੋਰ", tr: "Zayıf", fr: "Faible", es: "Débil", de: "Schwach", pt: "Fraca",
    ru: "Слабый", zh: "较弱", id: "Lemah", ja: "弱い",
  },
  strengthFair: {
    en: "Fair", ur: "درمیانہ", ar: "مقبولة", fa: "متوسط", ps: "مناسب", sd: "مناسبت جو",
    hi: "ठीक-ठाक", bn: "মোটামুটি", pa: "ਠੀਕ-ਠਾਕ", tr: "İdare eder", fr: "Correct", es: "Aceptable",
    de: "Ordentlich", pt: "Razoável", ru: "Средний", zh: "一般", id: "Cukup", ja: "ふつう",
  },
  strengthGood: {
    en: "Good", ur: "اچھا", ar: "جيدة", fa: "خوب", ps: "ښه", sd: "ٺيڪ", hi: "अच्छा",
    bn: "ভালো", pa: "ਚੰਗਾ", tr: "İyi", fr: "Bien", es: "Buena", de: "Gut", pt: "Boa",
    ru: "Хороший", zh: "良好", id: "Bagus", ja: "良い",
  },
  strengthStrong: {
    en: "Strong", ur: "مضبوط", ar: "قوية", fa: "قوی", ps: "محکم", sd: "مضبوط", hi: "मज़बूत",
    bn: "শক্তিশালী", pa: "ਮਜ਼ਬੂਤ", tr: "Güçlü", fr: "Solide", es: "Fuerte", de: "Stark",
    pt: "Forte", ru: "Надёжный", zh: "强", id: "Kuat", ja: "強い",
  },
  reqChars: {
    en: "{n}+ characters", ur: "{n}+ حروف", ar: "{n}+ حرفًا", fa: "{n}+ نویسه", ps: "{n}+ حروف",
    sd: "{n}+ اکر", hi: "{n}+ अक्षर", bn: "{n}+ অক্ষর", pa: "{n}+ ਅੱਖਰ", tr: "{n}+ karakter",
    fr: "{n}+ caractères", es: "{n}+ caracteres", de: "{n}+ Zeichen", pt: "{n}+ caracteres",
    ru: "{n}+ символов", zh: "{n}+ 个字符", id: "{n}+ karakter", ja: "{n}文字以上",
  },
  reqNumber: {
    en: "One number", ur: "ایک عدد", ar: "رقم واحد", fa: "یک عدد", ps: "یو عدد", sd: "هڪ عدد",
    hi: "एक अंक", bn: "একটি সংখ্যা", pa: "ਇੱਕ ਅੰਕ", tr: "Bir rakam", fr: "Un chiffre",
    es: "Un número", de: "Eine Ziffer", pt: "Um número", ru: "Одна цифра", zh: "一个数字",
    id: "Satu angka", ja: "数字1つ",
  },
  reqSymbol: {
    en: "One symbol", ur: "ایک خاص علامت", ar: "رمز واحد", fa: "یک نماد", ps: "یو نښه",
    sd: "هڪ نشاني", hi: "एक चिह्न", bn: "একটি প্রতীক", pa: "ਇੱਕ ਚਿੰਨ੍ਹ", tr: "Bir sembol",
    fr: "Un symbole", es: "Un símbolo", de: "Ein Symbol", pt: "Um símbolo", ru: "Один символ",
    zh: "一个符号", id: "Satu simbol", ja: "記号1つ",
  },
};

const LANGS = ["en", "ur", "ar", "fa", "ps", "sd", "hi", "bn", "pa", "tr", "fr", "es", "de", "pt", "ru", "zh", "id", "ja"];

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

/* --- translations.js: en block then ur block (4-space indent) --- */
const tp = "src/lib/translations.js";
const tText = fs.readFileSync(tp, "utf8");
const tSep = tText.includes("\r\n") ? "\r\n" : "\n";
const tl = tText.split(/\r?\n/);
const urIdx = tl.findIndex((l) => /^ {2}ur: \{/.test(l));
if (urIdx < 0) throw new Error("ur block not found");
if (tl.some((l) => /^ {4}welcomeBack:/.test(l))) {
  console.log("translations.js already has the keys — skipped");
} else {
  insertBefore(tl, urIdx - 1, linesFor("en", "    "));
  const objCloseIdx = tl.findIndex((l) => /^};$/.test(l.replace(/\r$/, "")));
  if (objCloseIdx < 0) throw new Error("translations object close not found");
  if (!/^ {2}\},?$/.test(tl[objCloseIdx - 1].replace(/\r$/, "")))
    throw new Error("ur block close not found: " + JSON.stringify(tl[objCloseIdx - 1]));
  insertBefore(tl, objCloseIdx - 1, linesFor("ur", "    "));
  fs.writeFileSync(tp, tl.join(tSep));
  console.log("translations.js: +19 en, +19 ur");
}

/* --- lang files (2-space indent) --- */
for (const lang of LANGS.filter((c) => c !== "en" && c !== "ur")) {
  const fp = path.join("src", "lib", "locales", "lang", `${lang}.js`);
  const text = fs.readFileSync(fp, "utf8");
  const sep = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const closeIdx = lines.lastIndexOf("};");
  if (closeIdx < 0) throw new Error("close not found in " + fp);
  if (lines.some((l) => /^ {2}welcomeBack:/.test(l))) {
    console.log(`${lang}.js already has the keys — skipped`);
    continue;
  }
  insertBefore(lines, closeIdx, linesFor(lang, "  "));
  fs.writeFileSync(fp, lines.join(sep));
  console.log(`${lang}.js: +19`);
}
