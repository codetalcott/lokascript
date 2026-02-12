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
export { createRussianExtractors, createUkrainianExtractors } from './cyrillic-keyword';
export { HindiKeywordExtractor, createHindiExtractors } from './hindi-keyword';
export { HindiParticleExtractor } from './hindi-particle';
export { BengaliKeywordExtractor, createBengaliExtractors } from './bengali-keyword';
export { BengaliParticleExtractor } from './bengali-particle';
export { ThaiKeywordExtractor, createThaiExtractors } from './thai-keyword';
export { MalayKeywordExtractor, createMalayExtractors } from './malay-keyword';
export { TagalogKeywordExtractor, createTagalogExtractors } from './tagalog-keyword';
export { PolishKeywordExtractor, createPolishExtractors } from './polish-keyword';
export { IndonesianKeywordExtractor, createIndonesianExtractors } from './indonesian-keyword';
export { SwahiliKeywordExtractor, createSwahiliExtractors } from './swahili-keyword';
export { TurkishKeywordExtractor, createTurkishKeywordExtractor } from './turkish-keyword';
export { QuechuaKeywordExtractor, createQuechuaKeywordExtractor } from './quechua-keyword';
export { HebrewKeywordExtractor, createHebrewExtractors } from './hebrew-keyword';
export { HebrewProcliticExtractor, createHebrewProcliticExtractor } from './hebrew-proclitic';
export { AsciiIdentifierExtractor, createAsciiIdentifierExtractor } from './ascii-identifier';
