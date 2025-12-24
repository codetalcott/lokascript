/**
 * Korean Hide Patterns
 *
 * Hand-crafted patterns for "hide" command.
 * Korean: {patient} 를 숨기다
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Korean hide patterns.
 */
export function getHidePatternsKo(): LanguagePattern[] {
  return [
    {
      id: 'hide-ko-full',
      language: 'ko',
      command: 'hide',
      priority: 100,
      template: {
        format: '{patient} 를 숨기다',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '숨기다', alternatives: ['숨겨', '감추다', '숨김', '숨기기'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
      },
    },
    {
      id: 'hide-ko-simple',
      language: 'ko',
      command: 'hide',
      priority: 90,
      template: {
        format: '숨기다 {patient}',
        tokens: [
          { type: 'literal', value: '숨기다', alternatives: ['숨겨', '숨기기'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'hide-ko-possessive',
      language: 'ko',
      command: 'hide',
      priority: 95,
      template: {
        format: '{destination} 의 {patient} 를 숨기다',
        tokens: [
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '의' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '를', alternatives: ['을'] },
          { type: 'literal', value: '숨기다', alternatives: ['숨겨', '감추다'] },
        ],
      },
      extraction: {
        destination: { position: 0 },
        patient: { marker: '를', markerAlternatives: ['을'] },
      },
    },
  ];
}
