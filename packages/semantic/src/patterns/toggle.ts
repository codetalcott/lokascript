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

/**
 * Japanese compact: ".activeを切り替え" (no spaces, more natural)
 * Accepts attached particles without whitespace, which is common in natural Japanese.
 * Note: The を particle is attached to the verb, not separated.
 */
const toggleJapaneseCompact: LanguagePattern = {
  id: 'toggle-ja-compact',
  language: 'ja',
  command: 'toggle',
  priority: 93,
  template: {
    format: '{patient}を切り替え',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を切り替え', alternatives: ['を切り替える', 'をトグル'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Japanese verb-ending: ".active 切り替える" (dictionary form verb ending)
 * Common when the verb is at sentence end with explicit る ending.
 */
const toggleJapaneseVerbEnding: LanguagePattern = {
  id: 'toggle-ja-verb-ending',
  language: 'ja',
  command: 'toggle',
  priority: 88,
  template: {
    format: '{patient} を 切り替える',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'を' },
      { type: 'literal', value: '切り替える', alternatives: ['トグルする'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { default: { type: 'reference', value: 'me' } },
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
// Korean Patterns (SOV)
// =============================================================================

/**
 * Korean: "#button 에서 .active 를 토글"
 * Word order: TARGET 에서 PATIENT 를 VERB
 * Particles: 에서 (location), 를/을 (object marker)
 *
 * Natural reading: "at button, active, toggle"
 */
const toggleKoreanFull: LanguagePattern = {
  id: 'toggle-ko-full',
  language: 'ko',
  command: 'toggle',
  priority: 100,
  template: {
    format: '{target} 에서 {patient} 를 토글',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: '에서', alternatives: ['에'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: '를', alternatives: ['을'] },
      { type: 'literal', value: '토글', alternatives: ['토글하다', '바꾸다', '전환'] },
    ],
  },
  extraction: {
    destination: { position: 0 },
    patient: { marker: '를', markerAlternatives: ['을'] },
  },
};

/**
 * Korean: ".active 를 토글" (implicit target: me)
 * Word order: PATIENT 를 VERB
 */
const toggleKoreanSimple: LanguagePattern = {
  id: 'toggle-ko-simple',
  language: 'ko',
  command: 'toggle',
  priority: 90,
  template: {
    format: '{patient} 를 토글',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: '를', alternatives: ['을'] },
      { type: 'literal', value: '토글', alternatives: ['토글하다', '바꾸다', '전환'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Korean alternative: "#button 의 .active 를 토글"
 * Using 의 (possession) similar to Japanese の
 */
const toggleKoreanPossessive: LanguagePattern = {
  id: 'toggle-ko-possessive',
  language: 'ko',
  command: 'toggle',
  priority: 95,
  template: {
    format: '{target} 의 {patient} 를 토글',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: '의' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: '를', alternatives: ['을'] },
      { type: 'literal', value: '토글', alternatives: ['토글하다', '바꾸다', '전환'] },
    ],
  },
  extraction: {
    destination: { position: 0 },
    patient: { marker: '를', markerAlternatives: ['을'] },
  },
};

// =============================================================================
// Chinese Patterns (SVO)
// =============================================================================

/**
 * Chinese: "切换 .active 在 #button"
 * Word order: VERB PATIENT [PREP TARGET]
 * SVO like English but with Chinese keywords.
 *
 * 切换 (qiēhuàn) = toggle/switch
 * 在 (zài) = at/on
 */
const toggleChineseFull: LanguagePattern = {
  id: 'toggle-zh-full',
  language: 'zh',
  command: 'toggle',
  priority: 100,
  template: {
    format: '切换 {patient} 在 {target}',
    tokens: [
      { type: 'literal', value: '切换' },
      { type: 'role', role: 'patient' },
      { type: 'group', optional: true, tokens: [
        { type: 'literal', value: '在', alternatives: ['到', '于'] },
        { type: 'role', role: 'destination' },
      ]},
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { marker: '在', markerAlternatives: ['到', '于'], default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Chinese: "切换 .active" (implicit target: me)
 */
const toggleChineseSimple: LanguagePattern = {
  id: 'toggle-zh-simple',
  language: 'zh',
  command: 'toggle',
  priority: 90,
  template: {
    format: '切换 {patient}',
    tokens: [
      { type: 'literal', value: '切换' },
      { type: 'role', role: 'patient' },
    ],
  },
  extraction: {
    patient: { position: 1 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Chinese: "把 .active 切换" (BA construction)
 * Word order: 把 PATIENT VERB
 * BA construction places object before verb.
 *
 * 把 (bǎ) = object marker (BA construction)
 */
const toggleChineseBA: LanguagePattern = {
  id: 'toggle-zh-ba',
  language: 'zh',
  command: 'toggle',
  priority: 95,
  template: {
    format: '把 {patient} 切换',
    tokens: [
      { type: 'literal', value: '把' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: '切换' },
    ],
  },
  extraction: {
    patient: { marker: '把' },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Chinese: "在 #button 把 .active 切换" (BA + location)
 * Word order: PREP TARGET 把 PATIENT VERB
 * Combines location and BA construction.
 */
const toggleChineseFullBA: LanguagePattern = {
  id: 'toggle-zh-full-ba',
  language: 'zh',
  command: 'toggle',
  priority: 98,
  template: {
    format: '在 {target} 把 {patient} 切换',
    tokens: [
      { type: 'literal', value: '在', alternatives: ['到', '于'] },
      { type: 'role', role: 'destination' },
      { type: 'literal', value: '把' },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: '切换' },
    ],
  },
  extraction: {
    destination: { marker: '在', markerAlternatives: ['到', '于'] },
    patient: { marker: '把' },
  },
};

// =============================================================================
// Turkish Patterns (SOV)
// =============================================================================

/**
 * Turkish: "#button üzerinde .active değiştir"
 * Word order: TARGET POSTPOSITION PATIENT VERB
 * Postpositions: üzerinde (on), için (for)
 *
 * Natural reading: "on button, active, toggle"
 */
const toggleTurkishFull: LanguagePattern = {
  id: 'toggle-tr-full',
  language: 'tr',
  command: 'toggle',
  priority: 100,
  template: {
    format: '{target} üzerinde {patient} değiştir',
    tokens: [
      { type: 'role', role: 'destination' },
      { type: 'literal', value: 'üzerinde', alternatives: ['üstünde', 'de', 'da'] },
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
    ],
  },
  extraction: {
    destination: { position: 0 },
    patient: { position: 2 },
  },
};

/**
 * Turkish: ".active değiştir" (implicit target: me)
 * Word order: PATIENT VERB (simple SOV)
 */
const toggleTurkishSimple: LanguagePattern = {
  id: 'toggle-tr-simple',
  language: 'tr',
  command: 'toggle',
  priority: 90,
  template: {
    format: '{patient} değiştir',
    tokens: [
      { type: 'role', role: 'patient' },
      { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
    ],
  },
  extraction: {
    patient: { position: 0 },
    destination: { default: { type: 'reference', value: 'me' } },
  },
};

/**
 * Turkish alternative: "değiştir .active" (verb-first, imperative style)
 * Some Turkish speakers prefer imperative-first for commands.
 */
const toggleTurkishImperative: LanguagePattern = {
  id: 'toggle-tr-imperative',
  language: 'tr',
  command: 'toggle',
  priority: 85,
  template: {
    format: 'değiştir {patient}',
    tokens: [
      { type: 'literal', value: 'değiştir', alternatives: ['değistir'] },
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
  // Japanese - standard and native idiom patterns
  toggleJapaneseFull,
  toggleJapaneseSimple,
  toggleJapaneseLocation,
  toggleJapaneseCompact,
  toggleJapaneseVerbEnding,
  // Arabic
  toggleArabicFull,
  toggleArabicSimple,
  // Spanish
  toggleSpanishFull,
  toggleSpanishSimple,
  // Korean
  toggleKoreanFull,
  toggleKoreanSimple,
  toggleKoreanPossessive,
  // Chinese
  toggleChineseFull,
  toggleChineseSimple,
  toggleChineseBA,
  toggleChineseFullBA,
  // Turkish
  toggleTurkishFull,
  toggleTurkishSimple,
  toggleTurkishImperative,
];

/**
 * Get toggle patterns for a specific language.
 */
export function getTogglePatternsForLanguage(language: string): LanguagePattern[] {
  return togglePatterns.filter(p => p.language === language);
}
