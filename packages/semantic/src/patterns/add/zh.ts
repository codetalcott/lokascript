/**
 * Chinese Add Patterns
 *
 * Hand-crafted patterns for "add" command.
 * Chinese uses SVO order: 给 {target} 添加 {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Chinese add patterns.
 */
export function getAddPatternsZh(): LanguagePattern[] {
  return [
    {
      id: 'add-zh-full',
      language: 'zh',
      command: 'add',
      priority: 100,
      template: {
        format: '给 {destination} 添加 {patient}',
        tokens: [
          { type: 'literal', value: '给', alternatives: ['為', '为'] },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: '添加', alternatives: ['加', '增加', '加上'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        destination: { position: 1 },
        patient: { position: 3 },
      },
    },
    {
      id: 'add-zh-simple',
      language: 'zh',
      command: 'add',
      priority: 90,
      template: {
        format: '添加 {patient}',
        tokens: [
          { type: 'literal', value: '添加', alternatives: ['加', '增加'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'add-zh-ba',
      language: 'zh',
      command: 'add',
      priority: 95,
      template: {
        format: '把 {patient} 添加到 {destination}',
        tokens: [
          { type: 'literal', value: '把' },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: '添加到', alternatives: ['加到', '增加到'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: '添加到', markerAlternatives: ['加到', '增加到'] },
      },
    },
  ];
}
