/**
 * Korean Toggle Patterns
 *
 * Tree-shakeable: Only included when Korean is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Korean toggle patterns.
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
    // Phase 6d: Word order flexibility - verb-first pattern
    {
      id: 'toggle-ko-verb-first',
      language: 'ko',
      command: 'toggle',
      priority: 75,
      template: {
        format: '토글 {patient} 를',
        tokens: [
          { type: 'literal', value: '토글', alternatives: ['토글하다'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    // Phase 6d: Object-before-destination scrambled order
    {
      id: 'toggle-ko-scrambled',
      language: 'ko',
      command: 'toggle',
      priority: 70,
      template: {
        format: '{patient} 를 {destination} 에서 토글',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에서' },
          { type: 'literal', value: '토글', alternatives: ['토글하다'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { marker: '에서' },
      },
    },
  ];
}
