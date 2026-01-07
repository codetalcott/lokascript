/**
 * Thai Event Handler Patterns
 *
 * Patterns for parsing event handlers in Thai.
 */

import type { LanguagePattern } from '../../types';

export function getEventHandlerPatternsTh(): LanguagePattern[] {
  return [
    // SVO pattern: เมื่อ คลิก สลับ .active
    {
      id: 'event-handler-th-svo',
      language: 'th',
      command: 'on',
      priority: 100,
      template: {
        format: 'เมื่อ {event} {action}',
        tokens: [
          { type: 'literal', value: 'เมื่อ', alternatives: ['ตอน'] },
          { type: 'role', role: 'event' },
          { type: 'role', role: 'action' },
        ],
      },
      extraction: {
        event: { position: 1 },
        action: { position: 2 },
      },
    },
    // With source: เมื่อ คลิก จาก #button สลับ .active
    {
      id: 'event-handler-th-with-source',
      language: 'th',
      command: 'on',
      priority: 95,
      template: {
        format: 'เมื่อ {event} จาก {source} {action}',
        tokens: [
          { type: 'literal', value: 'เมื่อ', alternatives: ['ตอน'] },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'จาก' },
          { type: 'role', role: 'source' },
          { type: 'role', role: 'action' },
        ],
      },
      extraction: {
        event: { position: 1 },
        source: { marker: 'จาก', position: 3 },
        action: { position: 4 },
      },
    },
  ];
}
