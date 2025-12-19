/**
 * Indonesian Event Handler Patterns
 *
 * Tree-shakeable: Only included when Indonesian is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Indonesian event handler patterns.
 */
export function getEventHandlerPatternsId(): LanguagePattern[] {
  return [
    {
      id: 'event-id-source',
      language: 'id',
      command: 'on',
      priority: 110,
      template: {
        format: 'pada {event} dari {source} {body}',
        tokens: [
          { type: 'literal', value: 'pada', alternatives: ['ketika', 'saat'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'dari' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'dari' },
      },
    },
    {
      id: 'event-id-ketika',
      language: 'id',
      command: 'on',
      priority: 105,
      template: {
        format: 'ketika {event} {body}',
        tokens: [
          { type: 'literal', value: 'ketika', alternatives: ['saat', 'waktu'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-id-standard',
      language: 'id',
      command: 'on',
      priority: 100,
      template: {
        format: 'pada {event} {body}',
        tokens: [
          { type: 'literal', value: 'pada' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
