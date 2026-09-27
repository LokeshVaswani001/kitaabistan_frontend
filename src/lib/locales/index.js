// The 18 interface languages shipped with Kitaabistan. Everything here is
// bundled — no network, no translation API: labels and Rehnuma's own
// conversation work with zero connection.

export const LANGUAGES = [
  { code: "en", label: "English", native: "English", dir: "ltr" },
  { code: "ur", label: "Urdu", native: "اردو", dir: "rtl" },
  { code: "ar", label: "Arabic", native: "العربية", dir: "rtl" },
  { code: "fa", label: "Persian", native: "فارسی", dir: "rtl" },
  { code: "ps", label: "Pashto", native: "پښتو", dir: "rtl" },
  { code: "sd", label: "Sindhi", native: "سنڌي", dir: "rtl" },
  { code: "hi", label: "Hindi", native: "हिन्दी", dir: "ltr" },
  { code: "bn", label: "Bengali", native: "বাংলা", dir: "ltr" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", dir: "ltr" },
  { code: "tr", label: "Turkish", native: "Türkçe", dir: "ltr" },
  { code: "fr", label: "French", native: "Français", dir: "ltr" },
  { code: "es", label: "Spanish", native: "Español", dir: "ltr" },
  { code: "de", label: "German", native: "Deutsch", dir: "ltr" },
  { code: "pt", label: "Portuguese", native: "Português", dir: "ltr" },
  { code: "ru", label: "Russian", native: "Русский", dir: "ltr" },
  { code: "zh", label: "Chinese", native: "中文", dir: "ltr" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", dir: "ltr" },
  { code: "ja", label: "Japanese", native: "日本語", dir: "ltr" },
];

export const RTL_CODES = new Set(["ur", "ar", "fa", "ps", "sd"]);
export const LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));

export function dirFor(code) {
  return RTL_CODES.has(code) ? "rtl" : "ltr";
}

export function languageFor(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
