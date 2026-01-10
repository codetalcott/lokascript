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
      id: 'event-id-ketika-source',
      language: 'id',
      command: 'on',
      priority: 115,
      template: {
        format: 'ketika {event} dari {source} {body}',
        tokens: [
          { type: 'literal', value: 'ketika', alternatives: ['saat', 'waktu'] },
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
      id: 'event-id-pada-source',
      language: 'id',
      command: 'on',
      priority: 110,
      template: {
        format: 'pada {event} dari {source} {body}',
        tokens: [
          { type: 'literal', value: 'pada' },
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
      id: 'event-id-pada',
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
    {
      id: 'event-id-jika',
      language: 'id',
      command: 'on',
      priority: 95,
      template: {
        format: 'jika {event} {body}',
        tokens: [
          { type: 'literal', value: 'jika', alternatives: ['kalau', 'apabila'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-id-bila',
      language: 'id',
      command: 'on',
      priority: 90,
      template: {
        format: 'bila {event} {body}',
        tokens: [
          { type: 'literal', value: 'bila' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
