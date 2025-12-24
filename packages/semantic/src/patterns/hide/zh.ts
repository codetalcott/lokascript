/**
 * Chinese Hide Patterns
 *
 * Hand-crafted patterns for "hide" command.
 * Chinese: 隐藏 {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Chinese hide patterns.
 */
export function getHidePatternsZh(): LanguagePattern[] {
  return [
    {
      id: 'hide-zh-full',
      language: 'zh',
      command: 'hide',
      priority: 100,
      template: {
        format: '隐藏 {patient}',
        tokens: [
          { type: 'literal', value: '隐藏', alternatives: ['隱藏', '藏起', '藏'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'hide-zh-ba',
      language: 'zh',
      command: 'hide',
      priority: 95,
      template: {
        format: '把 {patient} 隐藏',
        tokens: [
          { type: 'literal', value: '把' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '隐藏', alternatives: ['隱藏', '藏起'] },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'hide-zh-from',
      language: 'zh',
      command: 'hide',
      priority: 90,
      template: {
        format: '从 {destination} 隐藏 {patient}',
        tokens: [
          { type: 'literal', value: '从', alternatives: ['從'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '隐藏', alternatives: ['隱藏'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        destination: { position: 1 },
        patient: { position: 3 },
      },
    },
  ];
}
