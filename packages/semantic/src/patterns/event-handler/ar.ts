/**
 * Arabic Event Handler Patterns
 *
 * Tree-shakeable: Only included when Arabic is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Arabic event handler patterns.
 */
export function getEventHandlerPatternsAr(): LanguagePattern[] {
  return [
    {
      id: 'event-ar-temporal-source',
      language: 'ar',
      command: 'on',
      priority: 115,
      template: {
        format: 'عندما {event} من {source} {body}',
        tokens: [
          { type: 'literal', value: 'عندما', alternatives: ['حين', 'لمّا'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'من' },
      },
    },
    {
      id: 'event-ar-temporal-indama',
      language: 'ar',
      command: 'on',
      priority: 105,
      template: {
        format: 'عندما {event} {body}',
        tokens: [
          { type: 'literal', value: 'عندما' },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-ar-temporal-lamma',
      language: 'ar',
      command: 'on',
      priority: 103,
      template: {
        format: 'لمّا {event} {body}',
        tokens: [
          { type: 'literal', value: 'لمّا', alternatives: ['لما'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-ar-temporal-hina',
      language: 'ar',
      command: 'on',
      priority: 102,
      template: {
        format: 'حين {event} {body}',
        tokens: [
          { type: 'literal', value: 'حين', alternatives: ['حينما'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-ar-standard',
      language: 'ar',
      command: 'on',
      priority: 100,
      template: {
        format: 'عند {event} {body}',
        tokens: [
          { type: 'literal', value: 'عند', alternatives: ['على', 'لدى'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-ar-source',
      language: 'ar',
      command: 'on',
      priority: 110,
      template: {
        format: 'عند {event} من {source} {body}',
        tokens: [
          { type: 'literal', value: 'عند' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'من' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'من' },
      },
    },
    {
      id: 'event-ar-conditional',
      language: 'ar',
      command: 'on',
      priority: 95,
      template: {
        format: 'إذا {event} {body}',
        tokens: [
          { type: 'literal', value: 'إذا', alternatives: ['اذا', 'لو'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
