/**
 * SQL Language Profiles
 *
 * Pattern generation profiles for each supported language.
 * These define keyword translations and word order for pattern generation.
 *
 * Note: Role markers are primarily specified via `markerOverride` on each
 * schema role (in schemas/index.ts). Profile-level roleMarkers are only
 * needed when the default position (SOV=after, else=before) is wrong.
 */

import type { PatternGenLanguageProfile } from '@lokascript/framework';

// =============================================================================
// English (SVO)
// =============================================================================

export const englishProfile: PatternGenLanguageProfile = {
  code: 'en',
  wordOrder: 'SVO',
  keywords: {
    select: { primary: 'select' },
    insert: { primary: 'insert' },
    update: { primary: 'update' },
    delete: { primary: 'delete' },
  },
  // No roleMarkers needed — all markers come from schema markerOverride,
  // and default position 'before' is correct for SVO English.
};

// =============================================================================
// Spanish (SVO)
// =============================================================================

export const spanishProfile: PatternGenLanguageProfile = {
  code: 'es',
  wordOrder: 'SVO',
  keywords: {
    select: { primary: 'seleccionar' },
    insert: { primary: 'insertar' },
    update: { primary: 'actualizar' },
    delete: { primary: 'eliminar' },
  },
};

// =============================================================================
// Japanese (SOV)
// =============================================================================

export const japaneseProfile: PatternGenLanguageProfile = {
  code: 'ja',
  wordOrder: 'SOV',
  keywords: {
    select: { primary: '選択' },
    insert: { primary: '挿入' },
    update: { primary: '更新' },
    delete: { primary: '削除' },
  },
  roleMarkers: {
    // Only condition needs explicit position override.
    // '条件' (WHERE) acts as a prefix, not a postposition.
    // source (から) and destination (に) use default SOV 'after' position.
    condition: { primary: '条件', position: 'before' },
  },
};

// =============================================================================
// Arabic (VSO)
// =============================================================================

export const arabicProfile: PatternGenLanguageProfile = {
  code: 'ar',
  wordOrder: 'VSO',
  keywords: {
    select: { primary: 'اختر' },
    insert: { primary: 'أدخل' },
    update: { primary: 'حدّث' },
    delete: { primary: 'احذف' },
  },
};

// =============================================================================
// All Profiles
// =============================================================================

export const allProfiles = [englishProfile, spanishProfile, japaneseProfile, arabicProfile];
