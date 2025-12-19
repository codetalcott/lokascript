/**
 * Spanish Event Handler Patterns
 *
 * Tree-shakeable: Only included when Spanish is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Spanish event handler patterns.
 */
export function getEventHandlerPatternsEs(): LanguagePattern[] {
  return [
    {
      id: 'event-es-native-al-source',
      language: 'es',
      command: 'on',
      priority: 115,
      template: {
        format: 'al {event} en {source} {body}',
        tokens: [
          { type: 'literal', value: 'al' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'en', alternatives: ['de'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'en', markerAlternatives: ['de'] },
      },
    },
    {
      id: 'event-es-cuando-source',
      language: 'es',
      command: 'on',
      priority: 112,
      template: {
        format: 'cuando {event} en {source} {body}',
        tokens: [
          { type: 'literal', value: 'cuando' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'en', alternatives: ['de'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'en', markerAlternatives: ['de'] },
      },
    },
    {
      id: 'event-es-native-al',
      language: 'es',
      command: 'on',
      priority: 108,
      template: {
        format: 'al {event} {body}',
        tokens: [
          { type: 'literal', value: 'al' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-es-standard',
      language: 'es',
      command: 'on',
      priority: 100,
      template: {
        format: 'en {event} {body}',
        tokens: [
          { type: 'literal', value: 'en', alternatives: ['al', 'cuando'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-es-source',
      language: 'es',
      command: 'on',
      priority: 110,
      template: {
        format: 'en {event} desde {source} {body}',
        tokens: [
          { type: 'literal', value: 'en', alternatives: ['al'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'desde', alternatives: ['de'] },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'desde', markerAlternatives: ['de'] },
      },
    },
    {
      id: 'event-es-when',
      language: 'es',
      command: 'on',
      priority: 95,
      template: {
        format: 'cuando {event} {body}',
        tokens: [
          { type: 'literal', value: 'cuando' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-es-conditional-si',
      language: 'es',
      command: 'on',
      priority: 85,
      template: {
        format: 'si {event} {body}',
        tokens: [
          { type: 'literal', value: 'si' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
