/**
 * Hyperscript-Specific Value Extractors
 *
 * These extractors handle hyperscript's domain-specific syntax:
 * - CSS selectors (#id, .class, [attr])
 * - Event modifiers (.once, .debounce(300), .throttle(100))
 * - URLs and paths (/api/data, http://example.com)
 * - Property access (obj.prop, element.classList)
 *
 * These should be used in combination with generic extractors from @lokascript/framework.
 */

export { CssSelectorExtractor, extractCssSelector } from './css-selector';
export { EventModifierExtractor } from './event-modifier';
export { UrlExtractor, extractUrl } from './url';
export { PropertyAccessExtractor } from './property-access';
export { VariableRefExtractor } from './variable-ref';
export { JapaneseKeywordExtractor } from './japanese-keyword';
export { JapaneseParticleExtractor } from './japanese-particle';
export { KoreanKeywordExtractor } from './korean-keyword';
export { KoreanParticleExtractor } from './korean-particle';
export { ChineseKeywordExtractor } from './chinese-keyword';
export { ChineseParticleExtractor } from './chinese-particle';
export { VietnameseKeywordExtractor, createVietnameseExtractors } from './vietnamese-keyword';
export { ArabicKeywordExtractor, createArabicExtractors } from './arabic-keyword';
export { ArabicProcliticExtractor, createArabicProcliticExtractor } from './arabic-proclitic';
export { ArabicTemporalExtractor, createArabicTemporalExtractor } from './arabic-temporal';
