/**
 * JSX Language Profiles
 *
 * Pattern generation profiles for each supported language.
 * These define keyword translations and word order for pattern generation.
 *
 * Role markers are primarily specified via `markerOverride` on each
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
    element: { primary: 'element' },
    component: { primary: 'component' },
    render: { primary: 'render' },
    state: { primary: 'state' },
    effect: { primary: 'effect' },
    fragment: { primary: 'fragment' },
  },
};

// =============================================================================
// Spanish (SVO)
// =============================================================================

export const spanishProfile: PatternGenLanguageProfile = {
  code: 'es',
  wordOrder: 'SVO',
  keywords: {
    element: { primary: 'elemento' },
    component: { primary: 'componente' },
    render: { primary: 'renderizar' },
    state: { primary: 'estado' },
    effect: { primary: 'efecto' },
    fragment: { primary: 'fragmento' },
  },
};

// =============================================================================
// Japanese (SOV)
// =============================================================================

export const japaneseProfile: PatternGenLanguageProfile = {
  code: 'ja',
  wordOrder: 'SOV',
  keywords: {
    element: { primary: '要素' },
    component: { primary: 'コンポーネント' },
    render: { primary: '描画' },
    state: { primary: '状態' },
    effect: { primary: 'エフェクト' },
    fragment: { primary: 'フラグメント' },
  },
};

// =============================================================================
// Arabic (VSO)
// =============================================================================

export const arabicProfile: PatternGenLanguageProfile = {
  code: 'ar',
  wordOrder: 'VSO',
  keywords: {
    element: { primary: 'عنصر' },
    component: { primary: 'مكوّن' },
    render: { primary: 'ارسم' },
    state: { primary: 'حالة' },
    effect: { primary: 'تأثير' },
    fragment: { primary: 'جزء' },
  },
};

// =============================================================================
// Korean (SOV)
// =============================================================================

export const koreanProfile: PatternGenLanguageProfile = {
  code: 'ko',
  wordOrder: 'SOV',
  keywords: {
    element: { primary: '요소' },
    component: { primary: '컴포넌트' },
    render: { primary: '렌더링' },
    state: { primary: '상태' },
    effect: { primary: '효과' },
    fragment: { primary: '프래그먼트' },
  },
};

// =============================================================================
// Chinese (SVO)
// =============================================================================

export const chineseProfile: PatternGenLanguageProfile = {
  code: 'zh',
  wordOrder: 'SVO',
  keywords: {
    element: { primary: '元素' },
    component: { primary: '组件' },
    render: { primary: '渲染' },
    state: { primary: '状态' },
    effect: { primary: '效果' },
    fragment: { primary: '片段' },
  },
};

// =============================================================================
// Turkish (SOV)
// =============================================================================

export const turkishProfile: PatternGenLanguageProfile = {
  code: 'tr',
  wordOrder: 'SOV',
  keywords: {
    element: { primary: 'oge' },
    component: { primary: 'bilesen' },
    render: { primary: 'isle' },
    state: { primary: 'durum' },
    effect: { primary: 'etki' },
    fragment: { primary: 'parca' },
  },
};

// =============================================================================
// French (SVO)
// =============================================================================

export const frenchProfile: PatternGenLanguageProfile = {
  code: 'fr',
  wordOrder: 'SVO',
  keywords: {
    element: { primary: 'element' },
    component: { primary: 'composant' },
    render: { primary: 'afficher' },
    state: { primary: 'etat' },
    effect: { primary: 'effet' },
    fragment: { primary: 'fragment' },
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
