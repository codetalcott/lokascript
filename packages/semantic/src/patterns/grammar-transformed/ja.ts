/**
 * Japanese Grammar-Transformed Patterns
 *
 * These patterns match the hybrid output from GrammarTransformer where
 * event and command are combined in SOV order:
 *   English: "on click toggle .active"
 *   Grammar output: ".active を クリック で 切り替え"
 *
 * Format: {patient} を {event-word} で {action-word}
 *
 * Tree-shakeable: Only included when Japanese is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese grammar-transformed patterns.
 */
export function getGrammarTransformedPatternsJa(): LanguagePattern[] {
  return [
    // ==========================================================================
    // Click + Toggle
    // ==========================================================================
    {
      id: 'grammar-ja-click-toggle',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 切り替え',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '切り替え', alternatives: ['切り替える', 'トグル'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'toggle' } },
      },
    },

    // ==========================================================================
    // Click + Add
    // ==========================================================================
    {
      id: 'grammar-ja-click-add',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 追加',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '追加', alternatives: ['追加する', '付ける'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // ==========================================================================
    // Click + Remove
    // ==========================================================================
    {
      id: 'grammar-ja-click-remove',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 削除',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '削除', alternatives: ['削除する', '外す', '取る'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // ==========================================================================
    // Click + Increment
    // ==========================================================================
    {
      id: 'grammar-ja-click-increment',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 増加',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '増加', alternatives: ['増加する', '増やす'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'increment' } },
      },
    },

    // ==========================================================================
    // Click + Show
    // ==========================================================================
    {
      id: 'grammar-ja-click-show',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 表示',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '表示', alternatives: ['表示する', '見せる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // ==========================================================================
    // Click + Hide
    // ==========================================================================
    {
      id: 'grammar-ja-click-hide',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 隠す',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '隠す', alternatives: ['非表示', '隠れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // ==========================================================================
    // Click + Set
    // ==========================================================================
    {
      id: 'grammar-ja-click-set',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 設定',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['設定する', 'セット'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // Click + Decrement
    // ==========================================================================
    {
      id: 'grammar-ja-click-decrement',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 減少',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '減少', alternatives: ['減少する', '減らす'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'decrement' } },
      },
    },

    // ==========================================================================
    // DESTINATION PATTERNS (higher priority)
    // ==========================================================================

    // Click + Set with destination: "{destination} を クリック で 設定 {patient} に"
    {
      id: 'grammar-ja-click-set-destination',
      language: 'ja',
      command: 'on',
      priority: 80,
      template: {
        format: '{destination} を クリック で 設定 {patient} に',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['設定する'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: 'に' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // Click + Put with destination: "{patient} を クリック で 置く {destination} に"
    {
      id: 'grammar-ja-click-put-destination',
      language: 'ja',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} を クリック で 置く {destination} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '置く', alternatives: ['入れる'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'に' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // Click + Add with destination: "{patient} を クリック で 追加 {destination} に"
    {
      id: 'grammar-ja-click-add-destination',
      language: 'ja',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} を クリック で 追加 {destination} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '追加', alternatives: ['末尾追加'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'に' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // Click + Show with style: "{patient} を クリック で 表示 {style} で"
    {
      id: 'grammar-ja-click-show-style',
      language: 'ja',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} を クリック で 表示 {style} で',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '表示', alternatives: ['見せる'] },
          { type: 'role', role: 'style' },
          { type: 'literal', value: 'で' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        style: { position: 5 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // Click + Hide with style: "{patient} を クリック で 隠す {style} で"
    {
      id: 'grammar-ja-click-hide-style',
      language: 'ja',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} を クリック で 隠す {style} で',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '隠す', alternatives: ['非表示'] },
          { type: 'role', role: 'style' },
          { type: 'literal', value: 'で' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        style: { position: 5 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // ==========================================================================
    // THEN-CHAIN PATTERNS (with continuation marker)
    // Japanese uses "それから" (sorekara) for "then"
    // ==========================================================================

    // Click + Wait then: "{duration} を クリック で 待つ それから"
    {
      id: 'grammar-ja-click-wait-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{duration} を クリック で 待つ それから',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '待つ', alternatives: ['待ち'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Toggle then: "{patient} を クリック で 切り替え それから"
    {
      id: 'grammar-ja-click-toggle-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 切り替え それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '切り替え', alternatives: ['トグル'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'toggle' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Add then: "{patient} を クリック で 追加 それから"
    {
      id: 'grammar-ja-click-add-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 追加 それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '追加', alternatives: ['追加する'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Remove then: "{patient} を クリック で 削除 それから"
    {
      id: 'grammar-ja-click-remove-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 削除 それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '削除', alternatives: ['削除する'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Show then: "{patient} を クリック で 表示 それから"
    {
      id: 'grammar-ja-click-show-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 表示 それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '表示', alternatives: ['見せる'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Hide then: "{patient} を クリック で 隠す それから"
    {
      id: 'grammar-ja-click-hide-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 隠す それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '隠す', alternatives: ['非表示'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // CONTINUATION PATTERNS (for body after then)
    // These match commands that follow the "それから" keyword
    // ==========================================================================

    // Remove continuation: "{patient} を 削除"
    {
      id: 'grammar-ja-remove-continuation',
      language: 'ja',
      command: 'remove',
      priority: 70,
      template: {
        format: '{patient} を 削除',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '削除', alternatives: ['削除する', '外す', '取る'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // Toggle continuation: "{patient} を 切り替え"
    {
      id: 'grammar-ja-toggle-continuation',
      language: 'ja',
      command: 'toggle',
      priority: 70,
      template: {
        format: '{patient} を 切り替え',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '切り替え', alternatives: ['切り替える', 'トグル'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'toggle' } },
      },
    },

    // Add continuation: "{patient} を 追加"
    {
      id: 'grammar-ja-add-continuation',
      language: 'ja',
      command: 'add',
      priority: 70,
      template: {
        format: '{patient} を 追加',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '追加', alternatives: ['追加する'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // Show continuation: "{patient} を 表示"
    {
      id: 'grammar-ja-show-continuation',
      language: 'ja',
      command: 'show',
      priority: 70,
      template: {
        format: '{patient} を 表示',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '表示', alternatives: ['表示する', '見せる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // Hide continuation: "{patient} を 隠す"
    {
      id: 'grammar-ja-hide-continuation',
      language: 'ja',
      command: 'hide',
      priority: 70,
      template: {
        format: '{patient} を 隠す',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '隠す', alternatives: ['非表示', '隠れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // Put into continuation: "{patient} を {destination} に 置く"
    {
      id: 'grammar-ja-put-continuation',
      language: 'ja',
      command: 'put',
      priority: 72,
      template: {
        format: '{patient} を {destination} に 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
          { type: 'literal', value: '置く', alternatives: ['入れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: 'に' },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // ==========================================================================
    // PUT BEFORE/AFTER PATTERNS
    // ==========================================================================

    // Click + Put before: "{value} 前に {target} を クリック で 置く"
    {
      id: 'grammar-ja-click-put-before',
      language: 'ja',
      command: 'on',
      priority: 78,
      template: {
        format: '{patient} 前に {destination} を クリック で 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '前に' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '置く', alternatives: ['入れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
        position: { default: { type: 'literal', value: 'before' } },
      },
    },

    // Click + Put after: "{value} 後に {target} を クリック で 置く"
    {
      id: 'grammar-ja-click-put-after',
      language: 'ja',
      command: 'on',
      priority: 78,
      template: {
        format: '{patient} 後に {destination} を クリック で 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '後に' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '置く', alternatives: ['入れる'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
        position: { default: { type: 'literal', value: 'after' } },
      },
    },

    // ==========================================================================
    // FETCH PATTERNS
    // ==========================================================================

    // Click + Fetch: "{source} を クリック で 取得"
    {
      id: 'grammar-ja-click-fetch',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{source} を クリック で 取得',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '取得', alternatives: ['フェッチ', '取る'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'fetch' } },
      },
    },

    // Click + Fetch then: "{source} を クリック で 取得 それから"
    {
      id: 'grammar-ja-click-fetch-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{source} を クリック で 取得 それから',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '取得', alternatives: ['フェッチ', '取る'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'fetch' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // TRANSITION PATTERNS
    // ==========================================================================

    // Click + Transition: "{property} を クリック で 遷移 {value} に {duration}"
    {
      id: 'grammar-ja-click-transition',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '{patient} を クリック で 遷移 {value} に {duration}',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '遷移', alternatives: ['アニメーション', '推移'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
          { type: 'role', role: 'duration' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        duration: { position: 2 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'transition' } },
      },
    },

    // Click + Transition then: "{property} を クリック で 遷移 {value} に {duration} それから"
    {
      id: 'grammar-ja-click-transition-then',
      language: 'ja',
      command: 'on',
      priority: 87,
      template: {
        format: '{patient} を クリック で 遷移 {value} に {duration} それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '遷移', alternatives: ['アニメーション', '推移'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        duration: { position: 2 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'transition' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // SEND PATTERNS
    // ==========================================================================

    // Click + Send: "{message} を クリック で 送る {target} に"
    {
      id: 'grammar-ja-click-send',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '{patient} を クリック で 送る {destination} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '送る', alternatives: ['送信', '送り'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'send' } },
      },
    },

    // ==========================================================================
    // TRIGGER PATTERNS
    // ==========================================================================

    // Load + Trigger: "{event} を 読み込み で 引き金"
    {
      id: 'grammar-ja-load-trigger',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を 読み込み で 引き金',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '読み込み', alternatives: ['ロード'] },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '引き金', alternatives: ['トリガー', '発動'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'load' } },
        action: { default: { type: 'literal', value: 'trigger' } },
      },
    },

    // ==========================================================================
    // FOCUS PATTERNS
    // ==========================================================================

    // Click + Focus: "{target} を クリック で フォーカス"
    {
      id: 'grammar-ja-click-focus',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で フォーカス',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: 'フォーカス', alternatives: ['集中', '焦点'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'focus' } },
      },
    },

    // ==========================================================================
    // LOG PATTERNS
    // ==========================================================================

    // Click + Log: "{message} を クリック で 記録"
    {
      id: 'grammar-ja-click-log',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 記録',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '記録', alternatives: ['ログ', '出力'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'log' } },
      },
    },

    // ==========================================================================
    // GO/NAVIGATE PATTERNS
    // ==========================================================================

    // Click + Go back: "back を クリック で 移動"
    {
      id: 'grammar-ja-click-go-back',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: 'back を クリック で 移動',
        tokens: [
          { type: 'literal', value: 'back' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '移動', alternatives: ['いく', 'ナビゲート'] },
        ],
      },
      extraction: {
        destination: { default: { type: 'literal', value: 'back' } },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'go' } },
      },
    },

    // ==========================================================================
    // CALL PATTERNS
    // ==========================================================================

    // Click + Call: "{function} を クリック で 呼び出し"
    {
      id: 'grammar-ja-click-call',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 呼び出し',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '呼び出し', alternatives: ['コール', '呼ぶ'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'call' } },
      },
    },

    // ==========================================================================
    // BLUR PATTERNS
    // ==========================================================================

    // Keydown + Blur: "{target} を {event} で ぼかし"
    {
      id: 'grammar-ja-keydown-blur',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を {event} で ぼかし',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: 'ぼかし', alternatives: ['ブラー', 'ぼかす'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { position: 1 },
        action: { default: { type: 'literal', value: 'blur' } },
      },
    },

    // ==========================================================================
    // GET PATTERNS
    // ==========================================================================

    // Click + Get: "{target} を クリック で 取得"
    {
      id: 'grammar-ja-click-get',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を クリック で 取得',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '取得', alternatives: ['ゲット', '得る'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'get' } },
      },
    },

    // Click + Get then: "{target} を クリック で 取得 それから"
    {
      id: 'grammar-ja-click-get-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} を クリック で 取得 それから',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '取得', alternatives: ['ゲット', '得る'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'get' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // DEFAULT PATTERNS (load event)
    // ==========================================================================

    // Load + Default: "{patient} を 読み込み で 既定 {goal} に"
    {
      id: 'grammar-ja-load-default',
      language: 'ja',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} を 読み込み で 既定 {goal} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '読み込み', alternatives: ['ロード'] },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '既定', alternatives: ['デフォルト', '規定'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        event: { default: { type: 'literal', value: 'load' } },
        action: { default: { type: 'literal', value: 'default' } },
      },
    },

    // ==========================================================================
    // WAIT FOR EVENT PATTERNS
    // ==========================================================================

    // Click + Wait for event: "2s を クリック で 待つ それから"
    {
      id: 'grammar-ja-click-wait-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '{duration} を クリック で 待つ それから',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '待つ', alternatives: ['ウェイト', '待機'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },
  ];
}
