/**
 * Arabic Add Patterns
 *
 * Hand-crafted patterns for "add" command.
 * Arabic uses VSO order: أضف {patient} إلى {target}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic add patterns.
 */
export function getAddPatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'add-ar-full',
      language: 'ar',
      command: 'add',
      priority: 100,
      template: {
        format: 'أضف {patient} إلى {destination}',
        tokens: [
          { type: 'literal', value: 'أضف', alternatives: ['اضف', 'أضيف', 'اضافة'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'إلى', alternatives: ['الى', 'ل', 'لـ'] },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'إلى', markerAlternatives: ['الى', 'ل', 'لـ'] },
      },
    },
    {
      id: 'add-ar-simple',
      language: 'ar',
      command: 'add',
      priority: 90,
      template: {
        format: 'أضف {patient}',
        tokens: [
          { type: 'literal', value: 'أضف', alternatives: ['اضف', 'أضيف'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { default: { type: 'reference', value: 'me' } },
      },
    },
    {
      id: 'add-ar-with-على',
      language: 'ar',
      command: 'add',
      priority: 95,
      template: {
        format: 'أضف {patient} على {destination}',
        tokens: [
          { type: 'literal', value: 'أضف', alternatives: ['اضف'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'على' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'على' },
      },
    },
  ];
}
