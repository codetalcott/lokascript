/**
 * Toggle Command Patterns
 *
 * Patterns for the toggle command across supported languages.
 * Toggle adds a class/attribute if absent, removes if present.
 *
 * Tree-shaking: Each language's patterns are in separate getter functions
 * that esbuild can eliminate when unused.
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
 * Get English toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsEn(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Japanese Patterns (SOV)
// =============================================================================

/**
 * Get Japanese toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsJa(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Arabic Patterns (VSO)
// =============================================================================

/**
 * Get Arabic toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsAr(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Spanish Patterns (SVO)
// =============================================================================

/**
 * Get Spanish toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsEs(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Korean Patterns (SOV)
// =============================================================================

/**
 * Get Korean toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsKo(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Chinese Patterns (SVO)
// =============================================================================

/**
 * Get Chinese toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsZh(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Turkish Patterns (SOV)
// =============================================================================

/**
 * Get Turkish toggle patterns.
 * Exported separately for tree-shaking.
 */
export function getTogglePatternsTr(): LanguagePattern[] {
  return [
    {
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
    },
    {
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
    },
    {
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
    },
  ];
}

// =============================================================================
// Language Getter Map (for dynamic lookup)
// =============================================================================

/**
 * Get toggle patterns for a specific language.
 * Returns empty array if language has no hand-crafted patterns.
 *
 * NOTE: Uses switch statement instead of map for tree-shaking.
 * esbuild can eliminate unused case branches.
 */
export function getTogglePatternsForLanguage(language: string): LanguagePattern[] {
  switch (language) {
    case 'en': return getTogglePatternsEn();
    case 'ja': return getTogglePatternsJa();
    case 'ar': return getTogglePatternsAr();
    case 'es': return getTogglePatternsEs();
    case 'ko': return getTogglePatternsKo();
    case 'zh': return getTogglePatternsZh();
    case 'tr': return getTogglePatternsTr();
    default: return [];
  }
}

// =============================================================================
// Backwards Compatibility (for imports that use togglePatterns array)
// =============================================================================

/**
 * All toggle patterns across all languages.
 * @deprecated Use getTogglePatternsForLanguage() for tree-shaking.
 */
export const togglePatterns: LanguagePattern[] = [
  ...getTogglePatternsEn(),
  ...getTogglePatternsJa(),
  ...getTogglePatternsAr(),
  ...getTogglePatternsEs(),
  ...getTogglePatternsKo(),
  ...getTogglePatternsZh(),
  ...getTogglePatternsTr(),
];

/**
 * Languages that have hand-crafted toggle patterns.
 */
export const togglePatternLanguages = ['en', 'ja', 'ar', 'es', 'ko', 'zh', 'tr'];
