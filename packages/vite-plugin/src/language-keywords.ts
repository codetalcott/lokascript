/**
 * Language Keywords for Detection
 *
 * Maps of keywords for each of the 13 supported languages.
 * Used by the scanner to detect which languages are used in hyperscript templates.
 *
 * Note: These are a representative subset of keywords - enough to reliably
 * detect language usage without including every possible keyword variant.
 */

/**
 * All supported language codes.
 */
export const SUPPORTED_LANGUAGES = [
  'en', 'es', 'pt', 'fr', 'de',  // Western (Latin script)
  'ja', 'zh', 'ko',              // East Asian
  'ar',                          // RTL
  'tr',                          // Agglutinative Latin
  'id', 'sw', 'qu',              // Other
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

/**
 * Regional bundle mappings.
 */
export const REGIONS = {
  western: ['en', 'es', 'pt', 'fr', 'de'] as SupportedLanguage[],
  'east-asian': ['ja', 'zh', 'ko'] as SupportedLanguage[],
  priority: ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh', 'ko', 'ar', 'tr', 'id'] as SupportedLanguage[],
  all: SUPPORTED_LANGUAGES as unknown as SupportedLanguage[],
};

/**
 * Japanese keywords (hiragana, katakana, kanji).
 * Unique script makes detection straightforward.
 */
export const JAPANESE_KEYWORDS = new Set([
  // Commands
  'トグル', '切り替え', '追加', '削除', '表示', '隠す', '非表示',
  '設定', 'セット', '増加', '減少', 'ログ', '出力',
  // Events
  'クリック', '入力', '変更', 'フォーカス',
  // Control flow
  'もし', '繰り返し', '待つ', '待機',
  // References
  '私', 'それ', '結果',
  // Positional
  '最初', '最後', '次', '前',
]);

/**
 * Korean keywords (Hangul).
 * Unique script makes detection straightforward.
 */
export const KOREAN_KEYWORDS = new Set([
  // Commands
  '토글', '전환', '추가', '제거', '삭제', '표시', '숨기다',
  '설정', '증가', '감소', '로그',
  // Events
  '클릭', '입력', '변경', '포커스',
  // Control flow
  '만약', '반복', '대기',
  // References
  '나', '내', '그것', '결과',
  // Positional
  '첫번째', '마지막', '다음', '이전',
]);

/**
 * Chinese keywords (CJK characters).
 * Note: Some overlap with Japanese kanji, but context usually distinguishes.
 */
export const CHINESE_KEYWORDS = new Set([
  // Commands
  '切换', '添加', '移除', '删除', '显示', '隐藏',
  '设置', '设定', '增加', '减少', '日志', '记录',
  // Events
  '点击', '输入', '改变', '聚焦',
  // Control flow
  '如果', '重复', '等待',
  // References
  '我', '它', '结果',
  // Positional
  '第一', '最后', '下一个', '上一个',
]);

/**
 * Arabic keywords (Arabic script).
 * RTL script makes detection straightforward.
 */
export const ARABIC_KEYWORDS = new Set([
  // Commands
  'بدّل', 'بدل', 'أضف', 'اضف', 'أزل', 'ازل', 'احذف',
  'أظهر', 'اظهر', 'أخفِ', 'اخف',
  'ضع', 'اضع', 'زِد', 'أنقص',
  // Events
  'عند', 'نقر', 'إدخال', 'تغيير',
  // Control flow
  'إذا', 'كرر', 'انتظر',
  // References
  'أنا', 'هو', 'النتيجة',
]);

/**
 * Spanish keywords (Latin script with accents).
 * Distinguished by specific Spanish words.
 */
export const SPANISH_KEYWORDS = new Set([
  // Commands
  'alternar', 'añadir', 'agregar', 'quitar', 'eliminar',
  'mostrar', 'ocultar', 'esconder',
  'establecer', 'fijar', 'incrementar', 'decrementar',
  // Events
  'clic', 'entrada', 'cambio',
  // Control flow
  'si', 'sino', 'repetir', 'esperar', 'mientras',
  // References
  'yo', 'ello', 'resultado',
  // Positional
  'primero', 'último', 'siguiente', 'anterior',
]);

/**
 * Portuguese keywords (Latin script with accents).
 * Distinguished by specific Portuguese words.
 */
export const PORTUGUESE_KEYWORDS = new Set([
  // Commands
  'alternar', 'adicionar', 'remover', 'mostrar', 'esconder', 'ocultar',
  'definir', 'incrementar', 'decrementar',
  // Events
  'clique', 'entrada', 'mudança',
  // Control flow
  'se', 'senão', 'repetir', 'aguardar', 'enquanto',
  // References
  'eu', 'isso', 'resultado',
  // Positional
  'primeiro', 'último', 'próximo', 'anterior',
]);

/**
 * French keywords (Latin script with accents).
 * Distinguished by specific French words.
 */
export const FRENCH_KEYWORDS = new Set([
  // Commands
  'basculer', 'ajouter', 'supprimer', 'retirer',
  'afficher', 'montrer', 'cacher', 'masquer',
  'définir', 'incrémenter', 'décrémenter',
  // Events
  'cliquer', 'saisie', 'changement',
  // Control flow
  'si', 'sinon', 'répéter', 'attendre', 'pendant',
  // References
  'moi', 'cela', 'résultat',
  // Positional
  'premier', 'dernier', 'suivant', 'précédent',
]);

/**
 * German keywords (Latin script with umlauts).
 * Distinguished by specific German words.
 */
export const GERMAN_KEYWORDS = new Set([
  // Commands
  'umschalten', 'hinzufügen', 'entfernen', 'löschen',
  'anzeigen', 'zeigen', 'verbergen', 'verstecken',
  'setzen', 'festlegen', 'erhöhen', 'verringern',
  // Events
  'klick', 'eingabe', 'änderung',
  // Control flow
  'wenn', 'sonst', 'wiederholen', 'warten', 'während',
  // References
  'ich', 'es', 'ergebnis',
  // Positional
  'erste', 'letzte', 'nächste', 'vorherige',
]);

/**
 * Turkish keywords (Latin script with special chars).
 * Distinguished by Turkish-specific characters and words.
 */
export const TURKISH_KEYWORDS = new Set([
  // Commands
  'değiştir', 'değistir', 'ekle', 'kaldır', 'kaldir', 'sil',
  'göster', 'gizle', 'sakla',
  'ayarla', 'belirle', 'arttır', 'azalt',
  // Events
  'tıklama', 'tiklama', 'giriş', 'giris', 'değişim', 'degisim',
  // Control flow
  'eğer', 'eger', 'yoksa', 'tekrarla', 'bekle', 'süresince',
  // References
  'ben', 'o', 'sonuç', 'sonuc',
  // Positional
  'ilk', 'son', 'sonraki', 'önceki', 'onceki',
]);

/**
 * Indonesian keywords (Latin script).
 * Distinguished by specific Indonesian words.
 */
export const INDONESIAN_KEYWORDS = new Set([
  // Commands
  'alih', 'beralih', 'tambah', 'hapus', 'buang',
  'tampilkan', 'sembunyikan',
  'atur', 'tetapkan', 'tambahkan', 'kurangi',
  // Events
  'klik', 'masukan', 'perubahan',
  // Control flow
  'jika', 'kalau', 'ulangi', 'tunggu', 'selama',
  // References
  'saya', 'itu', 'hasil',
  // Positional
  'pertama', 'terakhir', 'berikutnya', 'sebelumnya',
]);

/**
 * Swahili keywords (Latin script).
 * Distinguished by specific Swahili words.
 */
export const SWAHILI_KEYWORDS = new Set([
  // Commands
  'badilisha', 'ongeza', 'ondoa', 'futa',
  'onyesha', 'ficha',
  'weka', 'sanidi', 'ongezea', 'punguza',
  // Events
  'bofya', 'ingizo', 'badiliko',
  // Control flow
  'ikiwa', 'kama', 'rudia', 'subiri', 'wakati',
  // References
  'mimi', 'hiyo', 'matokeo',
  // Positional
  'kwanza', 'mwisho', 'inayofuata', 'iliyotangulia',
]);

/**
 * Quechua keywords (Latin script).
 * Distinguished by specific Quechua words.
 */
export const QUECHUA_KEYWORDS = new Set([
  // Commands
  'tikray', 'yapay', 'qichuy', 'pichay',
  'rikuchiy', 'pakay',
  'churay', 'yapay', 'pisiyachiy',
  // Events
  'ñit\'iy', 'yaykuchiy', 'tikray',
  // Control flow
  'sichus', 'mana', 'kutipay', 'suyay', 'chaykama',
  // References
  'ñuqa', 'chay', 'lluqsisqa',
  // Positional
  'ñawpaq', 'qhipa', 'hamuq', 'ñawpaqnin',
]);

/**
 * Map of language code to keyword set.
 */
export const LANGUAGE_KEYWORDS: Record<SupportedLanguage, Set<string>> = {
  en: new Set(), // English is the default, no detection needed
  ja: JAPANESE_KEYWORDS,
  ko: KOREAN_KEYWORDS,
  zh: CHINESE_KEYWORDS,
  ar: ARABIC_KEYWORDS,
  es: SPANISH_KEYWORDS,
  pt: PORTUGUESE_KEYWORDS,
  fr: FRENCH_KEYWORDS,
  de: GERMAN_KEYWORDS,
  tr: TURKISH_KEYWORDS,
  id: INDONESIAN_KEYWORDS,
  sw: SWAHILI_KEYWORDS,
  qu: QUECHUA_KEYWORDS,
};

/**
 * Check if a script contains keywords from a specific language.
 * Returns true if any keyword from the language is found.
 *
 * Uses word boundary matching to avoid false positives from short keywords.
 * For non-Latin scripts (CJK, Arabic, etc.), simple includes is sufficient
 * since these characters don't appear in English/ASCII.
 */
export function containsLanguageKeywords(script: string, language: SupportedLanguage): boolean {
  const keywords = LANGUAGE_KEYWORDS[language];
  if (!keywords || keywords.size === 0) return false;

  // Non-Latin scripts can use simple includes (no risk of false positives)
  const nonLatinLangs: SupportedLanguage[] = ['ja', 'ko', 'zh', 'ar'];
  if (nonLatinLangs.includes(language)) {
    for (const keyword of keywords) {
      if (script.includes(keyword)) {
        return true;
      }
    }
    return false;
  }

  // Latin-script languages need word boundary matching to avoid false positives
  // from short keywords like 'es', 'o', 'si', etc.
  const lowerScript = script.toLowerCase();
  for (const keyword of keywords) {
    // Skip very short keywords (2 chars or less) - too many false positives
    if (keyword.length <= 2) continue;

    // Use word boundary matching
    const pattern = new RegExp(`\\b${escapeRegExp(keyword.toLowerCase())}\\b`);
    if (pattern.test(lowerScript)) {
      return true;
    }
  }
  return false;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detect all languages used in a hyperscript string.
 * Returns a Set of language codes found.
 *
 * Note: English is never detected (it's the default).
 * Only non-English languages are detected.
 */
export function detectLanguages(script: string): Set<SupportedLanguage> {
  const detected = new Set<SupportedLanguage>();

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === 'en') continue; // Skip English

    if (containsLanguageKeywords(script, lang)) {
      detected.add(lang);
    }
  }

  return detected;
}

/**
 * Get the optimal regional bundle for a set of detected languages.
 * Returns the smallest bundle that covers all detected languages.
 */
export function getOptimalRegion(
  languages: Set<SupportedLanguage>
): 'western' | 'east-asian' | 'priority' | 'all' | null {
  if (languages.size === 0) return null;

  const langArray = [...languages];

  // Check if all languages fit in western bundle
  if (langArray.every((l) => REGIONS.western.includes(l))) {
    return 'western';
  }

  // Check if all languages fit in east-asian bundle
  if (langArray.every((l) => REGIONS['east-asian'].includes(l))) {
    return 'east-asian';
  }

  // Check if all languages fit in priority bundle
  if (langArray.every((l) => REGIONS.priority.includes(l))) {
    return 'priority';
  }

  // Need full bundle
  return 'all';
}
