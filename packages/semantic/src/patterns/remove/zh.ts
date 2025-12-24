/**
 * Chinese Remove Patterns
 *
 * Hand-crafted patterns for "remove" command.
 * Chinese uses SVO order: 从 {target} 删除 {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Chinese remove patterns.
 */
export function getRemovePatternsZh(): LanguagePattern[] {
  return [
    {
      id: 'remove-zh-full',
      language: 'zh',
      command: 'remove',
      priority: 100,
      template: {
        format: '从 {destination} 删除 {patient}',
        tokens: [
          { type: 'literal', value: '从', alternatives: ['從'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '删除', alternatives: ['刪除', '移除', '去掉'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        destination: { position: 1 },
        patient: { position: 3 },
      },
    },
    {
      id: 'remove-zh-simple',
      language: 'zh',
      command: 'remove',
      priority: 90,
      template: {
        format: '删除 {patient}',
        tokens: [
          { type: 'literal', value: '删除', alternatives: ['刪除', '移除', '去掉'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'remove-zh-ba',
      language: 'zh',
      command: 'remove',
      priority: 95,
      template: {
        format: '把 {patient} 从 {destination} 删除',
        tokens: [
          { type: 'literal', value: '把' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '从', alternatives: ['從'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '删除', alternatives: ['刪除', '移除'] },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { position: 3 },
      },
    },
  ];
}
