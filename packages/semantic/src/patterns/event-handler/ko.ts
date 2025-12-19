/**
 * Korean Event Handler Patterns
 *
 * Tree-shakeable: Only included when Korean is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Korean event handler patterns.
 */
export function getEventHandlerPatternsKo(): LanguagePattern[] {
  return [
    {
      id: 'event-ko-conditional-source',
      language: 'ko',
      command: 'on',
      priority: 115,
      template: {
        format: '{source} 에서 {event}하면 {body}',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: '에서' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: '하면', alternatives: ['으면'] },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { marker: '에서' },
      },
    },
    {
      id: 'event-ko-honorific-conditional',
      language: 'ko',
      command: 'on',
      priority: 106,
      template: {
        format: '{event}하시면 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '하시면', alternatives: ['으시면', '시면'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ko-conditional-myeon',
      language: 'ko',
      command: 'on',
      priority: 105,
      template: {
        format: '{event}하면 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '하면', alternatives: ['으면', '면'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ko-immediate',
      language: 'ko',
      command: 'on',
      priority: 104,
      template: {
        format: '{event}하자마자 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '하자마자', alternatives: ['자마자'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ko-sequential-after',
      language: 'ko',
      command: 'on',
      priority: 103,
      template: {
        format: '{event}하고 나서 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '하고 나서', alternatives: ['하고나서', '고 나서', '고나서'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ko-temporal-ttae',
      language: 'ko',
      command: 'on',
      priority: 102,
      template: {
        format: '{event}할때 {body}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: '할때', alternatives: ['할 때', '을때', '을 때'] },
        ],
      },
      extraction: {
        event: { position: 0 },
      },
    },
    {
      id: 'event-ko-source',
      language: 'ko',
      command: 'on',
      priority: 110,
      template: {
        format: '{source} 에서 {event} 에 {body}',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: '에서' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: '에' },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { marker: '에서' },
      },
    },
  ];
}
