// ./js/i18n.js
const SUPPORTED = ["en", "es", "fr", "de", "it", "pt", "ja", "ko", "zh-Hant", "ar"];
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "pos_mining_new_lang";
const RTL_LANGS = new Set(["ar"]);

const langMap = {
  "zh": "zh-Hant",
  "zh-CN": "zh-Hant",
  "zh-SG": "zh-Hant",
  "zh-TW": "zh-Hant",
  "zh-HK": "zh-Hant",
  "zh-MO": "zh-Hant",
  "es": "es",
  "fr": "fr",
  "de": "de",
  "it": "it",
  "pt": "pt",
  "ja": "ja",
  "ko": "ko",
  "ar": "ar"
};

function normalizeLang(lang) {
  const l = (lang || "").trim();
  if (SUPPORTED.includes(l)) return l;
  if (langMap[l]) return langMap[l];
  const base = l.split("-")[0];
  if (langMap[base]) return langMap[base];
  return DEFAULT_LANG;
}

function getStoredLang() {
  try { return localStorage.getItem(LANG_STORAGE_KEY); } catch { return null; }
}
function setStoredLang(lang) {
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch {}
}

async function loadLocale(lang) {
  // Relative path: adapts to root/subdirectory deployment
  const url = `../i18n/${lang}.json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load locale: ${lang}`);
  return res.json();
}

export function t(key) {
  return window.__i18n?.dict?.[key] ?? key;
}

function applyDocumentLanguage(lang) {
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", RTL_LANGS.has(lang) ? "rtl" : "ltr");
}

export async function initI18n(options = {}) {
  const prefer = options.lang || getStoredLang() || DEFAULT_LANG;
  const lang = normalizeLang(prefer);

  let dict;
  try { dict = await loadLocale(lang); }
  catch { dict = await loadLocale(DEFAULT_LANG); }

  applyDocumentLanguage(lang);
  setStoredLang(lang);

  window.__i18n = {
    lang,
    dict,
    async setLang(next) {
      const n = normalizeLang(next);
      const d = await loadLocale(n);
      window.__i18n.lang = n;
      window.__i18n.dict = d;
      applyDocumentLanguage(n);
      setStoredLang(n);
      window.dispatchEvent(new CustomEvent("i18n:changed"));
    }
  };

  return window.__i18n;
}
