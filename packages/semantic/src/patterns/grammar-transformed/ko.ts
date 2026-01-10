/**
 * Korean Grammar-Transformed Patterns
 *
 * These patterns match the hybrid output from GrammarTransformer where
 * event and command are combined in SOV order:
 *   English: "on click toggle .active"
 *   Grammar output: ".active 를 클릭 토글"
 *
 * Format: {patient} 를 {event-word} {action-word}
 *
 * Tree-shakeable: Only included when Korean is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Korean grammar-transformed patterns.
 */
export function getGrammarTransformedPatternsKo(): LanguagePattern[] {
  return [
    // ==========================================================================
    // Click + Toggle
    // ==========================================================================
    {
      id: 'grammar-ko-click-toggle',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 토글',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '토글', alternatives: ['토글하다'] },
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
      id: 'grammar-ko-click-add',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 추가',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '추가', alternatives: ['추가하다', '더하다'] },
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
      id: 'grammar-ko-click-remove',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 제거',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '제거', alternatives: ['제거하다', '삭제', '빼다'] },
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
      id: 'grammar-ko-click-increment',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 증가',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '증가', alternatives: ['증가하다', '늘리다'] },
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
      id: 'grammar-ko-click-show',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 보이기',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '보이기', alternatives: ['보이다', '표시'] },
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
      id: 'grammar-ko-click-hide',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 숨기기',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '숨기기', alternatives: ['숨기다', '감추다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // ==========================================================================
    // Click + Set (for counters)
    // ==========================================================================
    {
      id: 'grammar-ko-click-set',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 설정',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '설정', alternatives: ['설정하다', '지정'] },
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
      id: 'grammar-ko-click-decrement',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 감소',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '감소', alternatives: ['감소하다', '줄이다'] },
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

    // Click + Set with destination: "{destination} 를 클릭 설정 {patient} 에"
    {
      id: 'grammar-ko-click-set-destination',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{destination} 를 클릭 설정 {patient} 에',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '설정', alternatives: ['설정하다'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: '에' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // Click + Put with destination: "{patient} 를 클릭 넣다 {destination} 에"
    {
      id: 'grammar-ko-click-put-destination',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} 를 클릭 넣다 {destination} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '넣다', alternatives: ['넣기'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: '에' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // Click + Add with destination: "{patient} 를 클릭 추가 {destination} 에"
    {
      id: 'grammar-ko-click-add-destination',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} 를 클릭 추가 {destination} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '추가', alternatives: ['추가하다'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: '에' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // Click + Remove from destination: "{patient} 를 클릭 제거 {destination} 에서"
    {
      id: 'grammar-ko-click-remove-destination',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} 를 클릭 제거 {destination} 에서',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '제거', alternatives: ['제거하다'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에서' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: '에서' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // Click + Show with style: "{patient} 를 클릭 보이다 {style} 로"
    {
      id: 'grammar-ko-click-show-style',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} 를 클릭 보이다 {style} 로',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '보이다', alternatives: ['보이기'] },
          { type: 'role', role: 'style' },
          { type: 'literal', value: '로' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        style: { marker: '로' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // Click + Hide with style: "{patient} 를 클릭 숨기다 {style} 로"
    {
      id: 'grammar-ko-click-hide-style',
      language: 'ko',
      command: 'on',
      priority: 80,
      template: {
        format: '{patient} 를 클릭 숨기다 {style} 로',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '숨기다', alternatives: ['숨기기'] },
          { type: 'role', role: 'style' },
          { type: 'literal', value: '로' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        style: { marker: '로' },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // ==========================================================================
    // THEN-CHAIN PATTERNS (with continuation marker)
    // These patterns match the first command and signal continuation
    // ==========================================================================

    // Click + Wait then: "{duration} 를 클릭 대기 그러면"
    {
      id: 'grammar-ko-click-wait-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{duration} 를 클릭 대기 그러면',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '대기', alternatives: ['대기하다', '기다리다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Toggle then: "{patient} 를 클릭 토글 그러면"
    {
      id: 'grammar-ko-click-toggle-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 토글 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '토글', alternatives: ['토글하다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'toggle' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Add then: "{patient} 를 클릭 추가 그러면"
    {
      id: 'grammar-ko-click-add-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 추가 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '추가', alternatives: ['추가하다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Remove then: "{patient} 를 클릭 제거 그러면"
    {
      id: 'grammar-ko-click-remove-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 제거 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '제거', alternatives: ['제거하다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Show then: "{patient} 를 클릭 보이기 그러면"
    {
      id: 'grammar-ko-click-show-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 보이기 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '보이기', alternatives: ['보이다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Hide then: "{patient} 를 클릭 숨기기 그러면"
    {
      id: 'grammar-ko-click-hide-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 숨기기 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '숨기기', alternatives: ['숨기다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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
    // These match commands that follow the "then" keyword
    // ==========================================================================

    // Remove continuation: "{patient} 를 제거"
    {
      id: 'grammar-ko-remove-continuation',
      language: 'ko',
      command: 'remove',
      priority: 70,
      template: {
        format: '{patient} 를 제거',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '제거', alternatives: ['제거하다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // Toggle continuation: "{patient} 를 토글"
    {
      id: 'grammar-ko-toggle-continuation',
      language: 'ko',
      command: 'toggle',
      priority: 70,
      template: {
        format: '{patient} 를 토글',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '토글', alternatives: ['토글하다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'toggle' } },
      },
    },

    // Add continuation: "{patient} 를 추가"
    {
      id: 'grammar-ko-add-continuation',
      language: 'ko',
      command: 'add',
      priority: 70,
      template: {
        format: '{patient} 를 추가',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '추가', alternatives: ['추가하다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // Show continuation: "{patient} 를 보이기"
    {
      id: 'grammar-ko-show-continuation',
      language: 'ko',
      command: 'show',
      priority: 70,
      template: {
        format: '{patient} 를 보이기',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '보이기', alternatives: ['보이다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // Hide continuation: "{patient} 를 숨기기"
    {
      id: 'grammar-ko-hide-continuation',
      language: 'ko',
      command: 'hide',
      priority: 70,
      template: {
        format: '{patient} 를 숨기기',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '숨기기', alternatives: ['숨기다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // Put into continuation: "{patient} 를 {destination} 에 넣다"
    {
      id: 'grammar-ko-put-continuation',
      language: 'ko',
      command: 'put',
      priority: 72,
      template: {
        format: '{patient} 를 {destination} 에 넣다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
          { type: 'literal', value: '넣다', alternatives: ['넣기'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: '에' },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // ==========================================================================
    // PUT BEFORE/AFTER PATTERNS
    // ==========================================================================

    // Click + Put before: "{value} 전에 {target} 를 클릭 넣다"
    {
      id: 'grammar-ko-click-put-before',
      language: 'ko',
      command: 'on',
      priority: 78,
      template: {
        format: '{patient} 전에 {destination} 를 클릭 넣다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '전에' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '넣다', alternatives: ['넣기'] },
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

    // Click + Put after: "{value} 후에 {target} 를 클릭 넣다"
    {
      id: 'grammar-ko-click-put-after',
      language: 'ko',
      command: 'on',
      priority: 78,
      template: {
        format: '{patient} 후에 {destination} 를 클릭 넣다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '후에' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '넣다', alternatives: ['넣기'] },
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

    // Click + Fetch: "{source} 를 클릭 가져오기"
    {
      id: 'grammar-ko-click-fetch',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{source} 를 클릭 가져오기',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '가져오기', alternatives: ['가져오다', '패치'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'fetch' } },
      },
    },

    // Click + Fetch then: "{source} 를 클릭 가져오기 그러면"
    {
      id: 'grammar-ko-click-fetch-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{source} 를 클릭 가져오기 그러면',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '가져오기', alternatives: ['가져오다', '패치'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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

    // Click + Transition: "{property} 를 클릭 전환 {value} 에 {duration}"
    {
      id: 'grammar-ko-click-transition',
      language: 'ko',
      command: 'on',
      priority: 77,
      template: {
        format: '{patient} 를 클릭 전환 {value} 에 {duration}',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '전환', alternatives: ['전환하다', '애니메이션'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: '에' },
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

    // Click + Transition then: "{property} 를 클릭 전환 {value} 에 {duration} 그러면"
    {
      id: 'grammar-ko-click-transition-then',
      language: 'ko',
      command: 'on',
      priority: 87,
      template: {
        format: '{patient} 를 클릭 전환 {value} 에 {duration} 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '전환', alternatives: ['전환하다', '애니메이션'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: '에' },
          { type: 'role', role: 'duration' },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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

    // Click + Send: "{message} 를 클릭 보내다 {target} 에"
    {
      id: 'grammar-ko-click-send',
      language: 'ko',
      command: 'on',
      priority: 77,
      template: {
        format: '{patient} 를 클릭 보내다 {destination} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '보내다', alternatives: ['보내기', '전송'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
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

    // Load + Trigger: "{event} 를 로드 트리거"
    {
      id: 'grammar-ko-load-trigger',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 로드 트리거',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '로드', alternatives: ['로딩'] },
          { type: 'literal', value: '트리거', alternatives: ['트리거하다', '발생'] },
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

    // Click + Focus: "{target} 를 클릭 포커스"
    {
      id: 'grammar-ko-click-focus',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 포커스',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '포커스', alternatives: ['포커스하다', '집중'] },
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

    // Click + Log: "{message} 를 클릭 로그"
    {
      id: 'grammar-ko-click-log',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 로그',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '로그', alternatives: ['로그하다', '기록'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'log' } },
      },
    },

    // ==========================================================================
    // INPUT EVENT PATTERNS
    // ==========================================================================

    // Input + Put: "{value} 를 입력 넣다 {destination} 에"
    {
      id: 'grammar-ko-input-put',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 입력 넣다 {destination} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '입력' },
          { type: 'literal', value: '넣다', alternatives: ['넣기'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        event: { default: { type: 'literal', value: 'input' } },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },

    // Input + Set: "{patient} 를 입력 설정 {goal} 에"
    {
      id: 'grammar-ko-input-set',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 입력 설정 {goal} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '입력' },
          { type: 'literal', value: '설정', alternatives: ['설정하다'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: '에' },
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
    // GO/NAVIGATE PATTERNS
    // ==========================================================================

    // Click + Go: "클릭 이동 url {destination} 에"
    {
      id: 'grammar-ko-click-go',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '클릭 이동 url {destination} 에',
        tokens: [
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '이동', alternatives: ['이동하다', '가다'] },
          { type: 'literal', value: 'url' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        destination: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'go' } },
      },
    },

    // Click + Go back: "back 를 클릭 이동"
    {
      id: 'grammar-ko-click-go-back',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: 'back 를 클릭 이동',
        tokens: [
          { type: 'literal', value: 'back' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '이동', alternatives: ['이동하다', '가다'] },
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

    // Click + Call: "{function} 를 클릭 호출"
    {
      id: 'grammar-ko-click-call',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 호출',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '호출', alternatives: ['호출하다', '부르다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'call' } },
      },
    },

    // ==========================================================================
    // WAIT FOR EVENT PATTERNS
    // ==========================================================================

    // Click + Wait for event: "클릭 대기 {event}"
    {
      id: 'grammar-ko-click-wait-event',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '클릭 대기 {patient}',
        tokens: [
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '대기', alternatives: ['대기하다', '기다리다'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
      },
    },

    // ==========================================================================
    // GET PATTERNS
    // ==========================================================================

    // Click + Get: "{target} 를 클릭 얻다"
    {
      id: 'grammar-ko-click-get',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 얻다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '얻다', alternatives: ['얻기', '가져오다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'get' } },
      },
    },

    // Click + Get then: "{target} 를 클릭 얻다 그러면"
    {
      id: 'grammar-ko-click-get-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 얻다 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '얻다', alternatives: ['얻기', '가져오다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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

    // Load + Default: "{patient} 를 로드 기본값 {goal} 에"
    {
      id: 'grammar-ko-load-default',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 로드 기본값 {goal} 에',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '로드', alternatives: ['로딩'] },
          { type: 'literal', value: '기본값', alternatives: ['기본', '디폴트'] },
          { type: 'role', role: 'goal' },
          { type: 'literal', value: '에' },
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
    // EXCHANGE/SWAP PATTERNS
    // ==========================================================================

    // Click + Exchange: "{source} 를 클릭 교환 {target} 로"
    {
      id: 'grammar-ko-click-exchange',
      language: 'ko',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} 를 클릭 교환 {destination} 로',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '교환', alternatives: ['교환하다', '바꾸다', '스왑'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '로', alternatives: ['으로'] },
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
    // MAKE/CREATE PATTERNS
    // ==========================================================================

    // Click + Make: "{target} 를 클릭 만들다"
    {
      id: 'grammar-ko-click-make',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} 를 클릭 만들다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '만들다', alternatives: ['만들기', '생성'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'make' } },
      },
    },

    // Click + Make then: "{target} 를 클릭 만들다 그러면"
    {
      id: 'grammar-ko-click-make-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} 를 클릭 만들다 그러면',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '만들다', alternatives: ['만들기', '생성'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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
    // SUBMIT EVENT PATTERNS
    // ==========================================================================

    // Submit + Fetch: "{source} 를 제출 가져오기"
    {
      id: 'grammar-ko-submit-fetch',
      language: 'ko',
      command: 'on',
      priority: 75,
      template: {
        format: '{source} 를 제출 가져오기',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '제출' },
          { type: 'literal', value: '가져오기', alternatives: ['가져오다', '패치'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { default: { type: 'literal', value: 'submit' } },
        action: { default: { type: 'literal', value: 'fetch' } },
      },
    },

    // ==========================================================================
    // BLUR PATTERNS
    // ==========================================================================

    // Keydown + Blur: "나 를 keydown[key=="Escape"] 블러"
    {
      id: 'grammar-ko-keydown-blur',
      language: 'ko',
      command: 'on',
      priority: 76,
      template: {
        format: '{patient} 를 {event} 블러',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: '블러', alternatives: ['흐리게', '포커스해제'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { position: 1 },
        action: { default: { type: 'literal', value: 'blur' } },
      },
    },

    // ==========================================================================
    // HIDE PATTERNS
    // ==========================================================================

    // Click + Hide closest then: "가장가까운 .modal 를 클릭 숨기다 그러면"
    {
      id: 'grammar-ko-click-hide-closest-then',
      language: 'ko',
      command: 'on',
      priority: 85,
      template: {
        format: '가장가까운 {patient} 를 클릭 숨기다 그러면',
        tokens: [
          { type: 'literal', value: '가장가까운', alternatives: ['가장 가까운', '제일가까운'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '클릭' },
          { type: 'literal', value: '숨기다', alternatives: ['숨기기', '감추다'] },
          { type: 'literal', value: '그러면', alternatives: ['그다음', '그리고'] },
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
  ];
}
