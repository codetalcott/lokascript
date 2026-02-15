/**
 * BDD Language Profiles
 *
 * Pattern generation profiles for each supported language.
 * These define keyword translations and word order for pattern generation.
 *
 * Role markers are specified via `markerOverride` on each schema role
 * (in schemas/index.ts). Profile-level roleMarkers are only needed when
 * the default position (SOV=after, else=before) is wrong.
 */

import type { PatternGenLanguageProfile } from '@lokascript/framework';

// =============================================================================
// English (SVO)
// =============================================================================

export const englishProfile: PatternGenLanguageProfile = {
  code: 'en',
  wordOrder: 'SVO',
  keywords: {
    given: { primary: 'given' },
    when: { primary: 'when' },
    then: { primary: 'then' },
    and: { primary: 'and' },
  },
};

// =============================================================================
// Spanish (SVO)
// =============================================================================

export const spanishProfile: PatternGenLanguageProfile = {
  code: 'es',
  wordOrder: 'SVO',
  keywords: {
    given: { primary: 'dado' },
    when: { primary: 'cuando' },
    then: { primary: 'entonces' },
    and: { primary: 'y' },
  },
};

// =============================================================================
// Japanese (SOV)
// =============================================================================

export const japaneseProfile: PatternGenLanguageProfile = {
  code: 'ja',
  wordOrder: 'SOV',
  keywords: {
    given: { primary: '前提' },
    when: { primary: 'したら' },
    then: { primary: 'ならば' },
    and: { primary: 'かつ' },
  },
};

// =============================================================================
// Arabic (VSO)
// =============================================================================

export const arabicProfile: PatternGenLanguageProfile = {
  code: 'ar',
  wordOrder: 'VSO',
  keywords: {
    given: { primary: 'بافتراض' },
    when: { primary: 'عند' },
    then: { primary: 'فإن' },
    and: { primary: 'و' },
  },
};

// =============================================================================
// Korean (SOV)
// =============================================================================

export const koreanProfile: PatternGenLanguageProfile = {
  code: 'ko',
  wordOrder: 'SOV',
  keywords: {
    given: { primary: '전제' },
    when: { primary: '만약' },
    then: { primary: '그러면' },
    and: { primary: '그리고' },
  },
};

// =============================================================================
// Chinese (SVO)
// =============================================================================

export const chineseProfile: PatternGenLanguageProfile = {
  code: 'zh',
  wordOrder: 'SVO',
  keywords: {
    given: { primary: '假设' },
    when: { primary: '当' },
    then: { primary: '那么' },
    and: { primary: '并且' },
  },
};

// =============================================================================
// Turkish (SOV)
// =============================================================================

export const turkishProfile: PatternGenLanguageProfile = {
  code: 'tr',
  wordOrder: 'SOV',
  keywords: {
    given: { primary: 'varsayalım' },
    when: { primary: 'olduğunda' },
    then: { primary: 'sonra' },
    and: { primary: 've' },
  },
};

// =============================================================================
// French (SVO)
// =============================================================================

export const frenchProfile: PatternGenLanguageProfile = {
  code: 'fr',
  wordOrder: 'SVO',
  keywords: {
    given: { primary: 'soit' },
    when: { primary: 'quand' },
    then: { primary: 'alors' },
    and: { primary: 'et' },
  },
};

// =============================================================================
// All Profiles
// =============================================================================

export const allProfiles = [
  englishProfile,
  spanishProfile,
  japaneseProfile,
  arabicProfile,
  koreanProfile,
  chineseProfile,
  turkishProfile,
  frenchProfile,
];
