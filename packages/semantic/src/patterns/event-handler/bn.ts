/**
 * Bengali Event Handler Patterns
 *
 * Patterns for parsing event handlers in Bengali.
 */

import type { LanguagePattern } from '../../types';

export function getEventHandlerPatternsBn(): LanguagePattern[] {
  return [
    // SOV pattern: ক্লিক তে .active কে টগল করুন
    {
      id: 'event-handler-bn-sov',
      language: 'bn',
      command: 'on',
      priority: 100,
      template: {
        format: '{event} তে {action}',
        tokens: [
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'তে', alternatives: ['এ'] },
          { type: 'role', role: 'action' },
        ],
      },
      extraction: {
        event: { position: 0 },
        action: { position: 2 },
      },
    },
    // With source: #button থেকে ক্লিক তে .active কে টগল করুন
    {
      id: 'event-handler-bn-with-source',
      language: 'bn',
      command: 'on',
      priority: 95,
      template: {
        format: '{source} থেকে {event} তে {action}',
        tokens: [
          { type: 'role', role: 'source' },
          { type: 'literal', value: 'থেকে' },
          { type: 'role', role: 'event' },
          { type: 'literal', value: 'তে', alternatives: ['এ'] },
          { type: 'role', role: 'action' },
        ],
      },
      extraction: {
        source: { position: 0 },
        event: { marker: 'তে', position: 2 },
        action: { position: 4 },
      },
    },
    // যখন pattern: যখন ক্লিক .active কে টগল করুন
    {
      id: 'event-handler-bn-when',
      language: 'bn',
      command: 'on',
      priority: 90,
      template: {
        format: 'যখন {event} {action}',
        tokens: [
          { type: 'literal', value: 'যখন' },
          { type: 'role', role: 'event' },
          { type: 'role', role: 'action' },
        ],
      },
      extraction: {
        event: { position: 1 },
        action: { position: 2 },
      },
    },
  ];
}
