/**
 * Korean Add Patterns
 *
 * Hand-crafted patterns for "add" command.
 * Korean uses SOV order: {target} 에 {patient} 를 추가
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Korean add patterns.
 */
export function getAddPatternsKo(): LanguagePattern[] {
  return [
    {
      id: 'add-ko-full',
      language: 'ko',
      command: 'add',
      priority: 100,
      template: {
        format: '{destination} 에 {patient} 를 추가',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '에' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '추가', alternatives: ['추가하다', '추가해', '더하다'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: '를', markerAlternatives: ['을'] },
      },
    },
    {
      id: 'add-ko-simple',
      language: 'ko',
      command: 'add',
      priority: 90,
      template: {
        format: '{patient} 를 추가',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '추가', alternatives: ['추가하다', '추가해'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'add-ko-possessive',
      language: 'ko',
      command: 'add',
      priority: 95,
      template: {
        format: '{destination} 의 {patient} 를 추가',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '의' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '추가', alternatives: ['추가하다'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: '를', markerAlternatives: ['을'] },
      },
    },
  ];
}
