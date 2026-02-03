/**
 * Language Resolver
 *
 * Determines the language of hyperscript code on a given element
 * using a cascading resolution strategy.
 */

/**
 * Resolve the language for a hyperscript attribute on an element.
 *
 * Resolution order:
 * 1. `data-lang` attribute on the element itself
 * 2. `data-hyperscript-lang` attribute on the element or closest ancestor
 * 3. `lang` attribute on `<html>` element
 * 4. null (assume English, no preprocessing needed)
 */
export function resolveLanguage(elt: Element): string | null {
  // 1. Explicit per-element
  const dataLang = elt.getAttribute('data-lang');
  if (dataLang) return normalizeLangCode(dataLang);

  // 2. Inherited from ancestor
  const hsLang =
    elt.getAttribute('data-hyperscript-lang') ??
    elt.closest?.('[data-hyperscript-lang]')?.getAttribute('data-hyperscript-lang');
  if (hsLang) return normalizeLangCode(hsLang);

  // 3. Document-level lang
  const htmlLang = typeof document !== 'undefined' ? document.documentElement?.lang : null;
  if (htmlLang && htmlLang !== 'en') return normalizeLangCode(htmlLang);

  return null;
}

/**
 * Normalize a BCP-47 language tag to an ISO 639-1 code.
 * e.g., "ja-JP" → "ja", "zh-Hans" → "zh", "pt-BR" → "pt"
 */
function normalizeLangCode(lang: string): string {
  return lang.split('-')[0].toLowerCase();
}
