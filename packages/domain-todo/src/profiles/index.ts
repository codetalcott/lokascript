/**
 * Todo Language Profiles
 *
 * Pattern generation profiles for each supported language (8 total).
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

export const enProfile: PatternGenLanguageProfile = {
  code: 'en',
  wordOrder: 'SVO',
  keywords: {
    add: { primary: 'add' },
    complete: { primary: 'complete', alternatives: ['done', 'finish'] },
    list: { primary: 'list', alternatives: ['show'] },
  },
  roleMarkers: {},
};

// =============================================================================
// Spanish (SVO)
// =============================================================================

export const esProfile: PatternGenLanguageProfile = {
  code: 'es',
  wordOrder: 'SVO',
  keywords: {
    add: { primary: 'agregar', alternatives: ['añadir'] },
    complete: { primary: 'completar', alternatives: ['terminar'] },
    list: { primary: 'listar', alternatives: ['mostrar'] },
  },
  roleMarkers: {},
};

// =============================================================================
// Japanese (SOV)
// =============================================================================

export const jaProfile: PatternGenLanguageProfile = {
  code: 'ja',
  wordOrder: 'SOV',
  keywords: {
    add: { primary: '追加' },
    complete: { primary: '完了' },
    list: { primary: '一覧' },
  },
  roleMarkers: {},
};

// =============================================================================
// Arabic (VSO)
// =============================================================================

export const arProfile: PatternGenLanguageProfile = {
  code: 'ar',
  wordOrder: 'VSO',
  keywords: {
    add: { primary: 'أضف' },
    complete: { primary: 'أكمل' },
    list: { primary: 'اعرض' },
  },
  roleMarkers: {},
};

// =============================================================================
// Korean (SOV)
// =============================================================================

export const koProfile: PatternGenLanguageProfile = {
  code: 'ko',
  wordOrder: 'SOV',
  keywords: {
    add: { primary: '추가' },
    complete: { primary: '완료' },
    list: { primary: '목록' },
  },
  roleMarkers: {},
};

// =============================================================================
// Chinese (SVO)
// =============================================================================

export const zhProfile: PatternGenLanguageProfile = {
  code: 'zh',
  wordOrder: 'SVO',
  keywords: {
    add: { primary: '添加' },
    complete: { primary: '完成' },
    list: { primary: '列出' },
  },
  roleMarkers: {},
};

// =============================================================================
// Turkish (SOV)
// =============================================================================

export const trProfile: PatternGenLanguageProfile = {
  code: 'tr',
  wordOrder: 'SOV',
  keywords: {
    add: { primary: 'ekle' },
    complete: { primary: 'tamamla' },
    list: { primary: 'listele' },
  },
  roleMarkers: {},
};

// =============================================================================
// French (SVO)
// =============================================================================

export const frProfile: PatternGenLanguageProfile = {
  code: 'fr',
  wordOrder: 'SVO',
  keywords: {
    add: { primary: 'ajouter' },
    complete: { primary: 'terminer' },
    list: { primary: 'lister', alternatives: ['afficher'] },
  },
  roleMarkers: {},
};

// =============================================================================
// All Profiles
// =============================================================================

export const allProfiles = [
  enProfile,
  esProfile,
  jaProfile,
  arProfile,
  koProfile,
  zhProfile,
  trProfile,
  frProfile,
];
