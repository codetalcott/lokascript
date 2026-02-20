/**
 * FlowScript Language Profiles
 *
 * Pattern generation profiles for 4 supported languages (EN, ES, JA, AR).
 * Covers SVO (English, Spanish), SOV (Japanese), and VSO (Arabic) word orders.
 *
 * Role markers are specified via markerOverride on each schema role.
 * Profile roleMarkers are used only when positional defaults need overriding.
 */

import type { PatternGenLanguageProfile } from '@lokascript/framework';

// =============================================================================
// English (SVO)
// =============================================================================

export const englishProfile: PatternGenLanguageProfile = {
  code: 'en',
  wordOrder: 'SVO',
  keywords: {
    fetch: { primary: 'fetch' },
    poll: { primary: 'poll' },
    stream: { primary: 'stream' },
    submit: { primary: 'submit' },
    transform: { primary: 'transform' },
  },
};

// =============================================================================
// Spanish (SVO)
// =============================================================================

export const spanishProfile: PatternGenLanguageProfile = {
  code: 'es',
  wordOrder: 'SVO',
  keywords: {
    fetch: { primary: 'obtener' },
    poll: { primary: 'sondear' },
    stream: { primary: 'transmitir' },
    submit: { primary: 'enviar' },
    transform: { primary: 'transformar' },
  },
};

// =============================================================================
// Japanese (SOV)
// =============================================================================

export const japaneseProfile: PatternGenLanguageProfile = {
  code: 'ja',
  wordOrder: 'SOV',
  keywords: {
    fetch: { primary: '取得' },
    poll: { primary: 'ポーリング' },
    stream: { primary: 'ストリーム' },
    submit: { primary: '送信' },
    transform: { primary: '変換' },
  },
};

// =============================================================================
// Arabic (VSO)
// =============================================================================

export const arabicProfile: PatternGenLanguageProfile = {
  code: 'ar',
  wordOrder: 'VSO',
  keywords: {
    fetch: { primary: 'جلب' },
    poll: { primary: 'استطلع' },
    stream: { primary: 'بث' },
    submit: { primary: 'أرسل' },
    transform: { primary: 'حوّل' },
  },
};

// =============================================================================
// All Profiles
// =============================================================================

export const allProfiles = [englishProfile, spanishProfile, japaneseProfile, arabicProfile];
