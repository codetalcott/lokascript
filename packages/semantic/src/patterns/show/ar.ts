/**
 * Arabic Show Patterns
 *
 * Hand-crafted patterns for "show" command.
 * Arabic: أظهر {patient}
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic show patterns.
 */
export function getShowPatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'show-ar-full',
      language: 'ar',
      command: 'show',
      priority: 100,
      template: {
        format: 'أظهر {patient}',
        tokens: [
          { type: 'literal', value: 'أظهر', alternatives: ['اظهر', 'اعرض', 'أعرض', 'عرض'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
    {
      id: 'show-ar-with-في',
      language: 'ar',
      command: 'show',
      priority: 95,
      template: {
        format: 'أظهر {patient} في {destination}',
        tokens: [
          { type: 'literal', value: 'أظهر', alternatives: ['اظهر', 'اعرض'] },
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'في' },
          { type: 'role', role: 'destination' },
        ],
      },
      extraction: {
        patient: { position: 1 },
        destination: { marker: 'في' },
      },
    },
    {
      id: 'show-ar-definite',
      language: 'ar',
      command: 'show',
      priority: 90,
      template: {
        format: 'اظهار {patient}',
        tokens: [
          { type: 'literal', value: 'اظهار', alternatives: ['إظهار', 'عرض'] },
          { type: 'role', role: 'patient' },
        ],
      },
      extraction: {
        patient: { position: 1 },
      },
    },
  ];
}
