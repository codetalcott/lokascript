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

    // ==========================================================================
    // EXCHANGE/SWAP PATTERNS
    // ==========================================================================

    // Click + Exchange: "{source} を クリック で 交換 {target} で"
    {
      id: 'grammar-ja-click-exchange',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を クリック で 交換 {destination} で',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '交換', alternatives: ['スワップ', '入れ替え'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'で' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'swap' } },
      },
    },

    // ==========================================================================
    // PUT BEFORE/AFTER PATTERNS
    // ==========================================================================

    // Click + Put before: "{content} 前に {target} を クリック で 置く"
    {
      id: 'grammar-ja-click-put-before',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} 前に {destination} を クリック で 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '前に', alternatives: ['前'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '置く', alternatives: ['入れる', 'プット'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
        modifier: { default: { type: 'literal', value: 'before' } },
      },
    },

    // Click + Put after: "{content} 後に {target} を クリック で 置く"
    {
      id: 'grammar-ja-click-put-after',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} 後に {destination} を クリック で 置く',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '後に', alternatives: ['後'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '置く', alternatives: ['入れる', 'プット'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
        modifier: { default: { type: 'literal', value: 'after' } },
      },
    },

    // ==========================================================================
    // POSSESSIVE PATTERNS
    // ==========================================================================

    // Click + Set possessive: "私の {property} を クリック で 設定 {value} に"
    {
      id: 'grammar-ja-click-set-possessive',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '私の {patient} を クリック で 設定 {goal} に',
        tokens: [
          { type: 'literal', value: '私の', alternatives: ['あなたの', 'その'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['セット'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // WAIT THEN REMOVE PATTERNS
    // ==========================================================================

    // Click + Wait then remove: "{duration} を クリック で 待つ それから 私 を 削除"
    {
      id: 'grammar-ja-click-wait-then-remove',
      language: 'ja',
      command: 'on',
      priority: 86,
      template: {
        format: '{duration} を クリック で 待つ それから 私 を 削除',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '待つ', alternatives: ['ウェイト', '待機'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
          { type: 'literal', value: '私', alternatives: ['me'] },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '削除', alternatives: ['取り除く', '消す'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        patient: { default: { type: 'literal', value: 'me' } },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // KEYDOWN/BLUR PATTERNS
    // ==========================================================================

    // Keydown + Blur: "私 を keydown[key=="Escape"] で ぼかし"
    {
      id: 'grammar-ja-keydown-blur',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を {event} で ぼかし',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: 'ぼかし', alternatives: ['ブラー', 'フォーカス解除'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { position: 1 },
        action: { default: { type: 'literal', value: 'blur' } },
      },
    },

    // ==========================================================================
    // INPUT EVENT PATTERNS
    // ==========================================================================

    // Input + Put value: "私の 値 を {destination} に 置く 入力 で"
    {
      id: 'grammar-ja-input-put-value',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '私の 値 を {destination} に 置く 入力 で',
        tokens: [
          { type: 'literal', value: '私の', alternatives: ['あなたの', 'その'] },
          { type: 'literal', value: '値', alternatives: ['価値'] },
          { type: 'literal', value: 'を' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'に' },
          { type: 'literal', value: '置く', alternatives: ['入れる', 'プット'] },
          { type: 'literal', value: '入力', alternatives: ['インプット'] },
          { type: 'literal', value: 'で' },
        ],
      },
      extraction: {
        patient: { default: { type: 'literal', value: 'my value' } },
        destination: { position: 0 },
        event: { default: { type: 'literal', value: 'input' } },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // Input + Set: "{property} を 入力 で 設定 {value} に"
    {
      id: 'grammar-ja-input-set',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を 入力 で 設定 {goal} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '入力', alternatives: ['インプット'] },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['セット'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        event: { default: { type: 'literal', value: 'input' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // SET PREVIOUS PATTERNS
    // ==========================================================================

    // Click + Set previous: "前 <input/>.value を クリック で 設定 "" に"
    {
      id: 'grammar-ja-click-set-previous',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '前 {patient} を クリック で 設定 {goal} に',
        tokens: [
          { type: 'literal', value: '前', alternatives: ['前の', '以前'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['セット'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        modifier: { default: { type: 'literal', value: 'previous' } },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // HIDE CLOSEST THEN PATTERNS
    // ==========================================================================

    // Click + Hide closest then: "最も近い .modal を クリック で 隠す それから"
    {
      id: 'grammar-ja-click-hide-closest-then',
      language: 'ja',
      command: 'on',
      priority: 85,
      template: {
        format: '最も近い {patient} を クリック で 隠す それから',
        tokens: [
          { type: 'literal', value: '最も近い', alternatives: ['一番近い', '最寄りの'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '隠す', alternatives: ['ハイド', '非表示'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
        modifier: { default: { type: 'literal', value: 'closest' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // LOAD EVENT PATTERNS
    // ==========================================================================

    // Load + Call: "{function} を 読み込み で 呼び出し"
    {
      id: 'grammar-ja-load-call',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を 読み込み で 呼び出し',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '読み込み', alternatives: ['ロード'] },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '呼び出し', alternatives: ['コール', '実行'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'load' } },
        action: { default: { type: 'literal', value: 'call' } },
      },
    },

    // ==========================================================================
    // STYLE PROPERTY SET PATTERNS
    // ==========================================================================

    // Click + Set my *opacity: "私の *opacity を クリック で 設定 0.5 に"
    {
      id: 'grammar-ja-click-set-my-style',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '私の {patient} を クリック で 設定 {goal} に',
        tokens: [
          { type: 'literal', value: '私の', alternatives: ['あなたの', 'その'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '設定', alternatives: ['セット'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { position: 1 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // DEFAULT ON LOAD PATTERNS
    // ==========================================================================

    // Load + Default: "私の @data-count を 読み込み で 既定 "0" に"
    {
      id: 'grammar-ja-load-default',
      language: 'ja',
      command: 'on',
      priority: 77,
      template: {
        format: '私の {patient} を 読み込み で 既定 {goal} に',
        tokens: [
          { type: 'literal', value: '私の', alternatives: ['あなたの', 'その'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '読み込み', alternatives: ['ロード'] },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '既定', alternatives: ['デフォルト', '初期値'] },
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
    // TELL/SHOW PATTERNS
    // ==========================================================================

    // Click + Tell show: "#modal を クリック で 伝える 表示 に"
    {
      id: 'grammar-ja-click-tell-show',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を クリック で 伝える 表示 に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '伝える', alternatives: ['テル', '告げる'] },
          { type: 'literal', value: '表示', alternatives: ['ショー', '見せる'] },
          { type: 'literal', value: 'に' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        goal: { default: { type: 'literal', value: 'show' } },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'tell' } },
      },
    },

    // ==========================================================================
    // STOP EVENT THEN TOGGLE PATTERNS
    // ==========================================================================

    // Click + Stop event then toggle: "the イベント を クリック で 停止 それから .active を 切り替え"
    {
      id: 'grammar-ja-click-stop-then-toggle',
      language: 'ja',
      command: 'on',
      priority: 86,
      template: {
        format: 'the イベント を クリック で 停止 それから {patient} を 切り替え',
        tokens: [
          { type: 'literal', value: 'the' },
          { type: 'literal', value: 'イベント', alternatives: ['event'] },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '停止', alternatives: ['ストップ', '止める'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: '切り替え', alternatives: ['トグル', '切替'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'halt' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // MAKE THEN PUT PATTERNS
    // ==========================================================================

    // Click + Make then put: "a <div.card/> を クリック で 作る それから それ を #container に 置く"
    {
      id: 'grammar-ja-click-make-then-put',
      language: 'ja',
      command: 'on',
      priority: 86,
      template: {
        format: 'a {patient} を クリック で 作る それから',
        tokens: [
          { type: 'literal', value: 'a' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '作る', alternatives: ['メイク', '作成'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'make' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // WAIT THEN REMOVE PATTERNS (simpler)
    // ==========================================================================

    // Click + Wait duration then: "{duration} を クリック で 待つ それから"
    {
      id: 'grammar-ja-click-wait-duration-then',
      language: 'ja',
      command: 'on',
      priority: 86,
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

    // ==========================================================================
    // REPEAT TIMES THEN PATTERNS
    // ==========================================================================

    // Click + Repeat times then: "3 times を クリック で 繰り返し それから"
    {
      id: 'grammar-ja-click-repeat-times-then',
      language: 'ja',
      command: 'on',
      priority: 86,
      template: {
        format: '{duration} times を クリック で 繰り返し それから',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'times', alternatives: ['回'] },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '繰り返し', alternatives: ['リピート', '反復'] },
          { type: 'literal', value: 'それから', alternatives: ['次に', 'そして'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'repeat' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // SEND PATTERNS
    // ==========================================================================

    // Click + Send: "{event} を クリック で 送る {target} に"
    {
      id: 'grammar-ja-click-send',
      language: 'ja',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} を クリック で 送る {destination} に',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '送る', alternatives: ['センド', '送信'] },
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
    // ASYNC FETCH THEN PUT PATTERNS
    // ==========================================================================

    // Click + Async fetch then: "取得 {source} を クリック で 非同期 それから"
    {
      id: 'grammar-ja-click-async-fetch-then',
      language: 'ja',
      command: 'on',
      priority: 86,
      template: {
        format: '取得 {source} を クリック で 非同期 それから',
        tokens: [
          { type: 'literal', value: '取得', alternatives: ['フェッチ', 'ゲット'] },
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'を' },
          { type: 'literal', value: 'クリック' },
          { type: 'literal', value: 'で' },
          { type: 'literal', value: '非同期', alternatives: ['アシンク', 'async'] },
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
  ];
}
