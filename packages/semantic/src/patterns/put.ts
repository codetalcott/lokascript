/**
 * Put Command Patterns
 *
 * Patterns for the put command across supported languages.
 * Put inserts content into a target location.
 *
 * Semantic structure:
 * - action: 'put'
 * - patient: content to insert
 * - destination: where to insert
 * - (position modifiers: into, before, after, at start, at end)
 */

import type { LanguagePattern } from '../types';

// =============================================================================
// English Patterns (SVO)
// =============================================================================

/**
 * English: "put {value} into {target}"
 * The most common form - replaces content.
 */
const putEnglishInto: LanguagePattern = {
  id: 'put-en-into',
  language: 'en',
  command: 'put',
  priority: 100,
  template: {
    format: 'put {patient} into {destination}',
    tokens: [
      { type: 'literal', value: 'put' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'into', alternatives: ['in', 'to'] },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'into', markerAlternatives: ['in', 'to'] },
  },
};

/**
 * English: "put {value} before {target}"
 * Insert before the target element.
 */
const putEnglishBefore: LanguagePattern = {
  id: 'put-en-before',
  language: 'en',
  command: 'put',
  priority: 95,
  template: {
    format: 'put {patient} before {destination}',
    tokens: [
      { type: 'literal', value: 'put' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'before' },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'before' },
    manner: { default: { type: 'literal', value: 'before' } },
  },
};

/**
 * English: "put {value} after {target}"
 * Insert after the target element.
 */
const putEnglishAfter: LanguagePattern = {
  id: 'put-en-after',
  language: 'en',
  command: 'put',
  priority: 95,
  template: {
    format: 'put {patient} after {destination}',
    tokens: [
      { type: 'literal', value: 'put' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'after' },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'after' },
    manner: { default: { type: 'literal', value: 'after' } },
  },
};

// =============================================================================
// Japanese Patterns (SOV)
// =============================================================================

/**
 * Japanese: "{value} を {target} に 置く"
 * Word order: PATIENT を DESTINATION に VERB
 *
 * を (wo) = object marker
 * に (ni) = destination marker
 * 置く (oku) = put/place
 */
const putJapaneseFull: LanguagePattern = {
  id: 'put-ja-full',
  language: 'ja',
  command: 'put',
  priority: 100,
  template: {
    format: '{patient} を {destination} に 置く',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'に', alternatives: ['へ'] },
      { type: 'literal', value: '置く', alternatives: ['入れる', 'セット', 'セットする'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { marker: 'に', markerAlternatives: ['へ'] },
  },
};

/**
 * Japanese: "{value} を {target} に 入れる"
 * Alternative verb - feels more like "insert into"
 *
 * 入れる (ireru) = put in, insert
 */
const putJapaneseInsert: LanguagePattern = {
  id: 'put-ja-insert',
  language: 'ja',
  command: 'put',
  priority: 95,
  template: {
    format: '{patient} を {destination} に 入れる',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'に' },
      { type: 'literal', value: '入れる' },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { marker: 'に' },
  },
};

/**
 * Japanese: "{target} に {value} を 置く"
 * Alternative word order - destination first (topic-prominent)
 */
const putJapaneseTopicFirst: LanguagePattern = {
  id: 'put-ja-topic',
  language: 'ja',
  command: 'put',
  priority: 90,
  template: {
    format: '{destination} に {patient} を 置く',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'に' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'literal', value: '置く', alternatives: ['入れる'] },
    ],
  },
  extraction: {
    destination: { position: 0 },
    patient: { marker: 'を' },
  },
};

// =============================================================================
// Arabic Patterns (VSO)
// =============================================================================

/**
 * Arabic: "ضع {value} في {target}"
 * Word order: VERB PATIENT PREP DESTINATION
 *
 * ضع (ḍaʿ) = put (imperative)
 * في (fī) = in
 */
const putArabicFull: LanguagePattern = {
  id: 'put-ar-full',
  language: 'ar',
  command: 'put',
  priority: 100,
  template: {
    format: 'ضع {patient} في {destination}',
    tokens: [
      { type: 'literal', value: 'ضع', alternatives: ['اضع', 'يضع'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'في', alternatives: ['إلى', 'الى'] },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'في', markerAlternatives: ['إلى', 'الى'] },
  },
};

/**
 * Arabic: "ضع {value} قبل {target}"
 * Put before target.
 *
 * قبل (qabl) = before
 */
const putArabicBefore: LanguagePattern = {
  id: 'put-ar-before',
  language: 'ar',
  command: 'put',
  priority: 95,
  template: {
    format: 'ضع {patient} قبل {destination}',
    tokens: [
      { type: 'literal', value: 'ضع' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'قبل' },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'قبل' },
    manner: { default: { type: 'literal', value: 'before' } },
  },
};

/**
 * Arabic: "ضع {value} بعد {target}"
 * Put after target.
 *
 * بعد (baʿd) = after
 */
const putArabicAfter: LanguagePattern = {
  id: 'put-ar-after',
  language: 'ar',
  command: 'put',
  priority: 95,
  template: {
    format: 'ضع {patient} بعد {destination}',
    tokens: [
      { type: 'literal', value: 'ضع' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'بعد' },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'بعد' },
    manner: { default: { type: 'literal', value: 'after' } },
  },
};

// =============================================================================
// Spanish Patterns (SVO)
// =============================================================================

/**
 * Spanish: "poner {value} en {target}"
 * Word order: VERB PATIENT PREP DESTINATION
 *
 * poner = to put
 * en = in/on
 */
const putSpanishFull: LanguagePattern = {
  id: 'put-es-full',
  language: 'es',
  command: 'put',
  priority: 100,
  template: {
    format: 'poner {patient} en {destination}',
    tokens: [
      { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar', 'put'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'en', alternatives: ['dentro de', 'a'] },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'en', markerAlternatives: ['dentro de', 'a'] },
  },
};

/**
 * Spanish: "poner {value} antes de {target}"
 * Put before target.
 */
const putSpanishBefore: LanguagePattern = {
  id: 'put-es-before',
  language: 'es',
  command: 'put',
  priority: 95,
  template: {
    format: 'poner {patient} antes de {destination}',
    tokens: [
      { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'antes de', alternatives: ['antes'] },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'antes de', markerAlternatives: ['antes'] },
    manner: { default: { type: 'literal', value: 'before' } },
  },
};

/**
 * Spanish: "poner {value} después de {target}"
 * Put after target.
 */
const putSpanishAfter: LanguagePattern = {
  id: 'put-es-after',
  language: 'es',
  command: 'put',
  priority: 95,
  template: {
    format: 'poner {patient} después de {destination}',
    tokens: [
      { type: 'literal', value: 'poner', alternatives: ['pon', 'colocar'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'después de', alternatives: ['despues de', 'después'] },
      { type: 'role', role: 'destination' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'después de', markerAlternatives: ['despues de', 'después'] },
    manner: { default: { type: 'literal', value: 'after' } },
  },
};

// =============================================================================
// Export All Put Patterns
// =============================================================================

export const putPatterns: LanguagePattern[] = [
  // English
  putEnglishInto,
  putEnglishBefore,
  putEnglishAfter,
  // Japanese
  putJapaneseFull,
  putJapaneseInsert,
  putJapaneseTopicFirst,
  // Arabic
  putArabicFull,
  putArabicBefore,
  putArabicAfter,
  // Spanish
  putSpanishFull,
  putSpanishBefore,
  putSpanishAfter,
];

/**
 * Get put patterns for a specific language.
 */
export function getPutPatternsForLanguage(language: string): LanguagePattern[] {
  return putPatterns.filter(p => p.language === language);
}
