/**
 * Toggle Command Patterns
 *
 * Patterns for the toggle command across supported languages.
 * Toggle adds a class/attribute if absent, removes if present.
 *
 * Semantic structure:
 * - action: 'toggle'
 * - patient: what to toggle (class, attribute)
 * - target: where to toggle (element, defaults to 'me')
 */

import type { LanguagePattern } from '../types';

// =============================================================================
// English Patterns (SVO)
// =============================================================================

/**
 * English: "toggle .active on #button"
 * Word order: VERB PATIENT [PREP TARGET]
 */
const toggleEnglishFull: LanguagePattern = {
  id: 'toggle-en-full',
  language: 'en',
  command: 'toggle',
  priority: 100,
  template: {
    format: 'toggle {patient} on {target}',
    tokens: [
      { type: 'literal', value: 'toggle' },
      { type: 'role', role: 'patient' },
      { type: 'group', optional: true, tokens: [
        { type: 'literal', value: 'on', alternatives: ['from'] },
        { type: 'role', role: 'destination' },
      ]},
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'on', markerAlternatives: ['from'], default: { type: 'reference', value: 'me' } },
  },
};

/**
 * English: "toggle .active" (implicit target: me)
 */
const toggleEnglishSimple: LanguagePattern = {
  id: 'toggle-en-simple',
  language: 'en',
  command: 'toggle',
  priority: 90,
  template: {
    format: 'toggle {patient}',
    tokens: [
      { type: 'literal', value: 'toggle' },
      { type: 'role', role: 'patient' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

// =============================================================================
// Japanese Patterns (SOV)
// =============================================================================

/**
 * Japanese: "#button の .active を 切り替え"
 * Word order: TARGET の PATIENT を VERB
 * Particles: の (possession), を (object marker)
 *
 * Natural reading: "button's active, toggle"
 */
const toggleJapaneseFull: LanguagePattern = {
  id: 'toggle-ja-full',
  language: 'ja',
  command: 'toggle',
  priority: 100,
  template: {
    format: '{target} の {patient} を 切り替え',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'の' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'literal', value: '切り替え', alternatives: ['切り替える', 'トグル', 'トグルする'] },
    ],
  },
  extraction: {
    destination: { position: 0 },
    patient: { marker: 'を' },
  },
};

/**
 * Japanese: ".active を 切り替え" (implicit target: me)
 * Word order: PATIENT を VERB
 */
const toggleJapaneseSimple: LanguagePattern = {
  id: 'toggle-ja-simple',
  language: 'ja',
  command: 'toggle',
  priority: 90,
  template: {
    format: '{patient} を 切り替え',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'literal', value: '切り替え', alternatives: ['切り替える', 'トグル', 'トグルする'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Japanese alternative: "#button で .active を 切り替える"
 * Using で (location particle) instead of の (possession)
 * This might feel more natural to some speakers.
 */
const toggleJapaneseLocation: LanguagePattern = {
  id: 'toggle-ja-location',
  language: 'ja',
  command: 'toggle',
  priority: 95,
  template: {
    format: '{target} で {patient} を 切り替え',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'で' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'literal', value: '切り替え', alternatives: ['切り替える', 'トグル'] },
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
 * Arabic: "بدّل .active على #button"
 * Word order: VERB PATIENT [PREP TARGET]
 * VSO but similar to English surface form for this command.
 *
 * بدّل (baddil) = toggle/switch
 * على (ʿalā) = on/upon
 */
const toggleArabicFull: LanguagePattern = {
  id: 'toggle-ar-full',
  language: 'ar',
  command: 'toggle',
  priority: 100,
  template: {
    format: 'بدّل {patient} على {target}',
    tokens: [
      { type: 'literal', value: 'بدّل', alternatives: ['بدل', 'غيّر', 'غير'] },
      { type: 'role', role: 'patient' },
      { type: 'group', optional: true, tokens: [
        { type: 'literal', value: 'على', alternatives: ['في', 'ب'] },
        { type: 'role', role: 'destination' },
      ]},
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'على', markerAlternatives: ['في', 'ب'], default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Arabic: "بدّل .active" (implicit target: me)
 */
const toggleArabicSimple: LanguagePattern = {
  id: 'toggle-ar-simple',
  language: 'ar',
  command: 'toggle',
  priority: 90,
  template: {
    format: 'بدّل {patient}',
    tokens: [
      { type: 'literal', value: 'بدّل', alternatives: ['بدل', 'غيّر', 'غير'] },
      { type: 'role', role: 'patient' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

// =============================================================================
// Spanish Patterns (SVO)
// =============================================================================

/**
 * Spanish: "alternar .active en #button"
 * Word order: VERB PATIENT [PREP TARGET]
 *
 * alternar = toggle/alternate
 * en = in/on
 */
const toggleSpanishFull: LanguagePattern = {
  id: 'toggle-es-full',
  language: 'es',
  command: 'toggle',
  priority: 100,
  template: {
    format: 'alternar {patient} en {target}',
    tokens: [
      { type: 'literal', value: 'alternar', alternatives: ['cambiar', 'toggle'] },
      { type: 'role', role: 'patient' },
      { type: 'group', optional: true, tokens: [
        { type: 'literal', value: 'en', alternatives: ['sobre', 'de'] },
        { type: 'role', role: 'destination' },
      ]},
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: 'en', markerAlternatives: ['sobre', 'de'], default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Spanish: "alternar .active" (implicit target: me)
 */
const toggleSpanishSimple: LanguagePattern = {
  id: 'toggle-es-simple',
  language: 'es',
  command: 'toggle',
  priority: 90,
  template: {
    format: 'alternar {patient}',
    tokens: [
      { type: 'literal', value: 'alternar', alternatives: ['cambiar', 'toggle'] },
      { type: 'role', role: 'patient' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

// =============================================================================
// Export All Toggle Patterns
// =============================================================================

export const togglePatterns: LanguagePattern[] = [
  // English
  toggleEnglishFull,
  toggleEnglishSimple,
  // Japanese
  toggleJapaneseFull,
  toggleJapaneseSimple,
  toggleJapaneseLocation,
  // Arabic
  toggleArabicFull,
  toggleArabicSimple,
  // Spanish
  toggleSpanishFull,
  toggleSpanishSimple,
];

/**
 * Get toggle patterns for a specific language.
 */
export function getTogglePatternsForLanguage(language: string): LanguagePattern[] {
  return togglePatterns.filter(p => p.language === language);
}
