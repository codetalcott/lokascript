/**
 * Swahili Event Handler Patterns
 *
 * Tree-shakeable: Only included when Swahili is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Swahili event handler patterns.
 */
export function getEventHandlerPatternsSw(): LanguagePattern[] {
  return [
    {
      id: 'event-sw-source',
      language: 'sw',
      command: 'on',
      priority: 110,
      template: {
        format: 'wakati {event} kutoka {source} {body}',
        tokens: [
          { type: 'literal', value: 'wakati', alternatives: ['kwenye'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'kutoka' },
          { type: 'role', role: 'source' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'kutoka' },
      },
    },
    {
      id: 'event-sw-unapo',
      language: 'sw',
      command: 'on',
      priority: 105,
      template: {
        format: 'unapo {event} {body}',
        tokens: [
          { type: 'literal', value: 'unapo', alternatives: ['anapo', 'tunapo', 'mnapo', 'wanapo'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    {
      id: 'event-sw-standard',
      language: 'sw',
      command: 'on',
      priority: 100,
      template: {
        format: 'wakati {event} {body}',
        tokens: [
          { type: 'literal', value: 'wakati', alternatives: ['kwenye', 'kwa'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
  ];
}
