export const TAFSEER_LIST = [
  { key: 'ar-tafsir-al-mukhtasar', name: 'Al-Mukhtasar', langNative: 'العربية', rank: 1 },
  { key: 'ar-tafseer-al-saddi', name: "As-Sa'di", langNative: 'العربية', rank: 1 },
  { key: 'en-tafsir-al-mukhtasar', name: 'Al-Mukhtasar', langNative: 'English', rank: 2 },
  { key: 'chinese-mokhtasar', name: 'Al-Mukhtasar', langNative: '中文', rank: 3 },
  { key: 'hindi-mokhtasar', name: 'Al-Mukhtasar', langNative: 'हिन्दी', rank: 4 },
  { key: 'spanish-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Español', rank: 5 },
  { key: 'french-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Français', rank: 6 },
  { key: 'bengali-mokhtasar', name: 'Al-Mukhtasar', langNative: 'বাংলা', rank: 7 },
  { key: 'russian-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Русский', rank: 8 },
  { key: 'indonesian-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Bahasa Indonesia', rank: 9 },
  { key: 'japanese-mokhtasar', name: 'Al-Mukhtasar', langNative: '日本語', rank: 11 },
  { key: 'turkish-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Türkçe', rank: 12 },
  { key: 'tamil-mokhtasar', name: 'Al-Mukhtasar', langNative: 'தமிழ்', rank: 13 },
  { key: 'vietnamese-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Tiếng Việt', rank: 14 },
  { key: 'italian-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Italiano', rank: 15 },
  { key: 'thai-mokhtasar', name: 'Al-Mukhtasar', langNative: 'ไทย', rank: 16 },
  { key: 'persian-mokhtasar', name: 'Al-Mukhtasar', langNative: 'فارسی', rank: 17 },
  { key: 'malayalam-mokhtasar', name: 'Al-Mukhtasar', langNative: 'മലയാളം', rank: 18 },
  { key: 'uzbek-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Oʻzbekcha', rank: 19 },
  { key: 'pashto-mokhtasar', name: 'Al-Mukhtasar', langNative: 'پښتو', rank: 20 },
  { key: 'kurdish-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Kurdî', rank: 21 },
  { key: 'bosnian-mokhtasar', name: 'Al-Mukhtasar', langNative: 'Bosanski', rank: 22 },
];

export const FREE_TAFSEERS_ORDER = [
  'ar-tafseer-al-saddi',
];

export const FREE_TAFSEER_KEYS = new Set(FREE_TAFSEERS_ORDER);

export const TAFSEER_LANGUAGES = {
  'ar-tafsir-al-mukhtasar': 'arabic',
  'ar-tafseer-al-saddi': 'arabic',
  'bengali-mokhtasar': 'bengali',
  'bosnian-mokhtasar': 'bosnian',
  'chinese-mokhtasar': 'chinese',
  'en-tafsir-al-mukhtasar': 'english',
  'french-mokhtasar': 'french',
  'hindi-mokhtasar': 'hindi',
  'indonesian-mokhtasar': 'indonesian',
  'italian-mokhtasar': 'italian',
  'japanese-mokhtasar': 'japanese',
  'kurdish-mokhtasar': 'kurdish',
  'malayalam-mokhtasar': 'malayalam',
  'pashto-mokhtasar': 'pashto',
  'persian-mokhtasar': 'persian',
  'russian-mokhtasar': 'russian',
  'spanish-mokhtasar': 'spanish',
  'tamil-mokhtasar': 'tamil',
  'thai-mokhtasar': 'thai',
  'turkish-mokhtasar': 'turkish',
  'ur-tafseer-ibn-e-kaseer': 'urdu',
  'uzbek-mokhtasar': 'uzbek',
  'vietnamese-mokhtasar': 'vietnamese',
};

export const isMatchingLang = (tafseerKey, appLang) => {
  if (!appLang) return false;
  const tLang = TAFSEER_LANGUAGES[tafseerKey];
  if (!tLang) return false;
  
  const normAppLang = appLang.toLowerCase().trim();
  const normTLang = tLang.toLowerCase().trim();
  
  if (normAppLang === normTLang) return true;
  if (normTLang === 'pashto' && normAppLang === 'pushto') return true;
  if (normTLang === 'pushto' && normAppLang === 'pashto') return true;
  
  return false;
};
