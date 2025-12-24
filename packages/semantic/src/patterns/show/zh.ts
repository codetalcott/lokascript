/**
 * Chinese Show Patterns
 *
 * Hand-crafted patterns for "show" command.
 * Chinese: 显示 {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Chinese show patterns.
 */
export function getShowPatternsZh(): LanguagePattern[] {
  return [
    {
      id: 'show-zh-full',
      language: 'zh',
      command: 'show',
      priority: 100,
      template: {
        format: '显示 {patient}',
        tokens: [
          { type: 'literal', value: '显示', alternatives: ['顯示', '展示', '呈现', '呈現'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'show-zh-ba',
      language: 'zh',
      command: 'show',
      priority: 95,
      template: {
        format: '把 {patient} 显示',
        tokens: [
          { type: 'literal', value: '把' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '显示', alternatives: ['顯示', '展示'] },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'show-zh-with-给',
      language: 'zh',
      command: 'show',
      priority: 90,
      template: {
        format: '给 {destination} 显示 {patient}',
        tokens: [
          { type: 'literal', value: '给', alternatives: ['給'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '显示', alternatives: ['顯示'] },
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
