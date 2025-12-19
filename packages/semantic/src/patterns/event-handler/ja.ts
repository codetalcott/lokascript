/**
 * Japanese Event Handler Patterns
 *
 * Tree-shakeable: Only included when Japanese is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Japanese event handler patterns.
 */
export function getEventHandlerPatternsJa(): LanguagePattern[] {
  return [
    {
      id: 'event-ja-conditional-source',
      language: 'ja',
      command: 'on',
      priority: 115,
      template: {
        format: '{source} から {event}したら {body}',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'から', alternatives: ['の'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'したら', alternatives: ['すると'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { marker: 'から', markerAlternatives: ['の'] },
      },
    },
    {
      id: 'event-ja-conditional-tara',
      language: 'ja',
      command: 'on',
      priority: 105,
      template: {
        format: '{event}したら {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'したら', alternatives: ['すると', 'すれば'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ja-temporal-suffix',
      language: 'ja',
      command: 'on',
      priority: 102,
      template: {
        format: '{event}時に {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '時に', alternatives: ['時'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ja-standard',
      language: 'ja',
      command: 'on',
      priority: 100,
      template: {
        format: '{event} で {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'で', alternatives: ['のとき', 'の時', '時'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ja-source',
      language: 'ja',
      command: 'on',
      priority: 110,
      template: {
        format: '{source} から {event} で {body}',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'から', alternatives: ['の'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'で' },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { marker: 'から', markerAlternatives: ['の'] },
      },
    },
    {
      id: 'event-ja-when',
      language: 'ja',
      command: 'on',
      priority: 95,
      template: {
        format: '{event} の 時 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'の' },
          { type: 'literal', value: '時', alternatives: ['とき'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
  ];
}
