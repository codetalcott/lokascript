/**
 * Dictionary Interface - Keyword Translation
 *
 * Provides keyword translations between languages.
 * DSLs implement this to provide their domain-specific translations.
 */

/**
 * Dictionary provides keyword translations between languages.
 */
export interface Dictionary {
  /**
   * Look up canonical form from localized keyword.
   *
   * @param localizedWord - Word in target language (e.g., 'トグル', 'alternar')
   * @param language - Language code
   * @returns Canonical form (e.g., 'toggle') or undefined
   *
   * @example
   * dictionary.lookup('トグル', 'ja') // → 'toggle'
   * dictionary.lookup('alternar', 'es') // → 'toggle'
   */
  lookup(localizedWord: string, language: string): string | undefined;

  /**
   * Translate canonical keyword to target language.
   *
   * @param canonical - Canonical form (e.g., 'toggle')
   * @param targetLanguage - Target language code
   * @returns Localized form or undefined
   *
   * @example
   * dictionary.translate('toggle', 'ja') // → 'トグル'
   * dictionary.translate('toggle', 'es') // → 'alternar'
   */
  translate(canonical: string, targetLanguage: string): string | undefined;

  /**
   * Get all translations of a word across all supported languages.
   *
   * @param word - Word to translate
   * @param sourceLanguage - Source language
   * @returns Map of language code to translation
   *
   * @example
   * dictionary.getAllTranslations('toggle', 'en')
   * // → { ja: 'トグル', es: 'alternar', ko: '토글', ... }
   */
  getAllTranslations(word: string, sourceLanguage: string): Record<string, string>;

  /**
   * Optional: Find what category a word belongs to.
   * Useful for organizing translations by domain (commands, modifiers, events, etc.).
   */
  getCategory?(word: string, language: string): string | undefined;
}

/**
 * Simple in-memory dictionary implementation.
 * Suitable for small DSLs or prototyping.
 */
export class InMemoryDictionary implements Dictionary {
  /**
   * @param translations - Map of language code to canonical→localized mappings
   *
   * @example
   * new InMemoryDictionary({
   *   en: { select: 'select', insert: 'insert' },
   *   es: { select: 'seleccionar', insert: 'insertar' },
   *   ja: { select: '選択', insert: '挿入' }
   * })
   */
  constructor(private translations: Record<string, Record<string, string>>) {}

  lookup(word: string, language: string): string | undefined {
    const langDict = this.translations[language];
    if (!langDict) return undefined;

    // Reverse lookup: find key where value = word
    const wordLower = word.toLowerCase();
    for (const [canonical, localized] of Object.entries(langDict)) {
      if (localized.toLowerCase() === wordLower) {
        return canonical;
      }
    }
    return undefined;
  }

  translate(canonical: string, targetLanguage: string): string | undefined {
    return this.translations[targetLanguage]?.[canonical];
  }

  getAllTranslations(word: string, sourceLanguage: string): Record<string, string> {
    const canonical = this.lookup(word, sourceLanguage);
    if (!canonical) return {};

    const result: Record<string, string> = {};
    for (const [lang, dict] of Object.entries(this.translations)) {
      const translation = dict[canonical];
      if (translation) {
        result[lang] = translation;
      }
    }
    return result;
  }
}

/**
 * Null dictionary - no translations (useful for single-language DSLs).
 */
export class NullDictionary implements Dictionary {
  lookup(word: string, _language: string): string | undefined {
    return word; // Identity: word is its own canonical form
  }

  translate(canonical: string, _targetLanguage: string): string | undefined {
    return canonical; // Identity: no translation
  }

  getAllTranslations(word: string, _sourceLanguage: string): Record<string, string> {
    return { en: word }; // Only source language
  }
}
