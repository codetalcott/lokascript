/**
 * Malay Event Handler Patterns
 *
 * Malay uses SVO word order with "apabila" (when) as the primary event keyword.
 * Structure: apabila {event} {command} {patient} [pada {destination}]
 *
 * Examples:
 * - "apabila klik togol .active" - on click toggle .active
 * - "apabila klik togol .active pada #button" - on click toggle .active on #button
 * - "apabila hantar togol .loading" - on submit toggle .loading
 */

import type { LanguagePattern } from '../../types';

export function getEventHandlerPatternsMs(): LanguagePattern[] {
  return [
    // Pattern: apabila {event} {body} - simple event handler
    {
      id: 'event-ms-apabila',
      language: 'ms',
      command: 'on',
      priority: 100,
      template: {
        format: 'apabila {event} {body}',
        tokens: [
          { type: 'literal', value: 'apabila', alternatives: ['bila', 'ketika'] },
          { type: 'role', role: 'event' },
        ],
      },
      extraction: {
        event: { position: 1 },
      },
    },
    // Pattern: apabila {event} dari {source} - with source
    {
      id: 'event-ms-apabila-source',
      language: 'ms',
      command: 'on',
      priority: 110,
      template: {
        format: 'apabila {event} dari {source} {body}',
        tokens: [
          { type: 'literal', value: 'apabila', alternatives: ['bila', 'ketika'] },
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
  ];
}
