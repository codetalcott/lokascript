/**
 * Tests for SYNTAX table derivation from command schemas.
 *
 * Verifies that:
 * 1. deriveEnglishSyntax() produces the expected output from schemas
 * 2. The renderer's SYNTAX table matches the derived output
 *
 * This ensures command schemas are the single source of truth for
 * English rendering — any schema change will fail this test until
 * the renderer's SYNTAX table is updated.
 */

import { describe, it, expect } from 'vitest';
import { deriveEnglishSyntax, type SyntaxTable } from '../src/derive-syntax';
import { SYNTAX as RENDERER_SYNTAX } from '../src/hyperscript-renderer';
import { commandSchemas, englishProfile } from '@lokascript/semantic';

// The canonical SYNTAX expected from derivation.
// This is what both the derivation and the renderer must match.
const EXPECTED_SYNTAX: SyntaxTable = {
  // Class/attribute
  toggle: [
    ['patient', ''],
    ['destination', 'on'],
  ],
  add: [
    ['patient', ''],
    ['destination', 'to'],
  ],
  remove: [
    ['patient', ''],
    ['source', 'from'],
  ],
  take: [
    ['patient', ''],
    ['source', 'from'],
  ],

  // Content
  put: [
    ['patient', ''],
    ['destination', 'into'],
  ],
  append: [
    ['patient', ''],
    ['destination', 'to'],
  ],
  prepend: [
    ['patient', ''],
    ['destination', 'to'],
  ],
  make: [['patient', '']],
  clone: [
    ['patient', ''],
    ['destination', 'into'],
  ],
  swap: [
    ['method', ''],
    ['destination', 'of'],
    ['patient', 'with'],
  ],
  morph: [
    ['destination', ''],
    ['patient', 'to'],
  ],

  // Variables
  set: [
    ['destination', ''],
    ['patient', 'to'],
  ],
  get: [
    ['source', ''],
    ['destination', 'on'],
  ],
  increment: [
    ['patient', ''],
    ['quantity', 'by'],
  ],
  decrement: [
    ['patient', ''],
    ['quantity', 'by'],
  ],
  log: [['patient', '']],
  default: [
    ['destination', ''],
    ['patient', 'to'],
  ],

  // Visibility
  show: [
    ['patient', ''],
    ['style', 'with'],
  ],
  hide: [
    ['patient', ''],
    ['style', 'with'],
  ],
  transition: [
    ['patient', ''],
    ['goal', 'to'],
    ['destination', 'on'],
    ['duration', 'over'],
    ['style', 'with'],
  ],

  // Events
  on: [
    ['event', ''],
    ['source', 'from'],
  ],
  trigger: [
    ['event', ''],
    ['destination', 'on'],
  ],
  send: [
    ['event', ''],
    ['destination', 'to'],
  ],

  // Focus
  focus: [['patient', '']],
  blur: [['patient', '']],

  // Navigation
  go: [['destination', '']],

  // Async
  wait: [['patient', '']],
  fetch: [
    ['source', ''],
    ['responseType', 'as'],
    ['method', 'via'],
    ['destination', 'on'],
  ],
  settle: [['patient', '']],

  // Behavior
  install: [
    ['patient', ''],
    ['destination', 'on'],
  ],
  measure: [
    ['patient', ''],
    ['source', 'of'],
  ],

  // Control flow
  call: [['patient', '']],
  return: [['patient', '']],
  throw: [['patient', '']],
  halt: [['patient', '']],
  continue: [],
  if: [['condition', '']],
  unless: [['condition', '']],
  else: [],
  repeat: [
    ['quantity', ''],
    ['condition', 'until'],
  ],
  for: [
    ['patient', ''],
    ['source', 'in'],
  ],
  while: [['condition', '']],

  // Structural / advanced
  tell: [['destination', '']],
  async: [],
  js: [['patient', '']],
  init: [],
  behavior: [['patient', '']],

  // Utility / misc
  beep: [['patient', '']],
  break: [],
  copy: [['patient', '']],
  exit: [],
  pick: [
    ['patient', ''],
    ['source', 'from'],
  ],
  render: [
    ['patient', ''],
    ['style', 'with'],
  ],

  // Meta
  compound: [],
};

describe('deriveEnglishSyntax', () => {
  const derived = deriveEnglishSyntax(commandSchemas, englishProfile);

  it('produces entries for every command schema', () => {
    const schemaKeys = Object.keys(commandSchemas).sort();
    const derivedKeys = Object.keys(derived).sort();
    expect(derivedKeys).toEqual(schemaKeys);
  });

  // Test each command individually for clear error messages
  for (const action of Object.keys(commandSchemas)) {
    it(`derives correct SYNTAX for "${action}"`, () => {
      const expected = EXPECTED_SYNTAX[action];
      expect(expected).toBeDefined();
      expect(derived[action]).toEqual(expected);
    });
  }

  it('has no extra entries beyond schemas', () => {
    const schemaActions = new Set(Object.keys(commandSchemas));
    for (const action of Object.keys(derived)) {
      expect(schemaActions.has(action)).toBe(true);
    }
  });
});

describe('renderer SYNTAX matches derived', () => {
  const derived = deriveEnglishSyntax(commandSchemas, englishProfile);

  for (const action of Object.keys(commandSchemas)) {
    it(`renderer SYNTAX for "${action}" matches derived`, () => {
      expect(RENDERER_SYNTAX[action]).toBeDefined();
      expect(RENDERER_SYNTAX[action]).toEqual(derived[action]);
    });
  }

  it('renderer has no stale entries beyond schemas', () => {
    const schemaActions = new Set(Object.keys(commandSchemas));
    for (const action of Object.keys(RENDERER_SYNTAX)) {
      expect(schemaActions.has(action)).toBe(true);
    }
  });
});
