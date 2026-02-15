/**
 * BDD Command Schemas
 *
 * Defines the semantic structure of BDD specification steps using the
 * framework's defineCommand/defineRole helpers. Each step type (given, when,
 * then) has distinct roles matching its BDD purpose.
 */

import { defineCommand, defineRole } from '@lokascript/framework';

// =============================================================================
// GIVEN — Precondition
// =============================================================================

export const givenSchema = defineCommand({
  action: 'given',
  description: 'Define a precondition for the scenario',
  category: 'precondition',
  primaryRole: 'target',
  roles: [
    defineRole({
      role: 'target',
      description: 'Element or page subject (e.g., "the button", "#submit")',
      required: true,
      expectedTypes: ['expression', 'selector'],
      svoPosition: 2,
      sovPosition: 2,
      markerOverride: { ja: 'が', ko: '이' },
    }),
    defineRole({
      role: 'state',
      description: 'Expected state (exists, visible, hidden, loaded)',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 1,
      markerOverride: { en: 'is', es: 'es', ar: 'هو', zh: '是', tr: 'dir', fr: 'est' },
    }),
  ],
});

// =============================================================================
// WHEN — Action
// =============================================================================

export const whenSchema = defineCommand({
  action: 'when',
  description: 'Define an action to perform',
  category: 'action',
  primaryRole: 'action_type',
  roles: [
    defineRole({
      role: 'action_type',
      description: 'Action to perform (click, type, hover, navigate, submit)',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 2,
      sovPosition: 1,
    }),
    defineRole({
      role: 'target',
      description: 'Element to act on',
      required: false,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 1,
      sovPosition: 2,
      markerOverride: {
        en: 'on',
        es: 'en',
        ja: 'を',
        ar: 'على',
        ko: '를',
        zh: '在',
        tr: 'üzerinde',
        fr: 'sur',
      },
    }),
    defineRole({
      role: 'value',
      description: 'Value for input actions (text to type, URL to navigate)',
      required: false,
      expectedTypes: ['literal', 'expression'],
      svoPosition: 0,
      sovPosition: 0,
      markerOverride: {
        en: 'with',
        es: 'con',
        ja: 'で',
        ar: 'ب',
        ko: '로',
        zh: '用',
        tr: 'ile',
        fr: 'avec',
      },
    }),
  ],
});

// =============================================================================
// THEN — Assertion
// =============================================================================

export const thenSchema = defineCommand({
  action: 'then',
  description: 'Define an expected outcome',
  category: 'assertion',
  primaryRole: 'target',
  roles: [
    defineRole({
      role: 'target',
      description: 'Element to assert on',
      required: true,
      expectedTypes: ['selector', 'expression'],
      svoPosition: 2,
      sovPosition: 2,
      markerOverride: { ja: 'に', ko: '에', tr: 'de' },
    }),
    defineRole({
      role: 'assertion',
      description: 'Assertion type (e.g., .active, visible, hidden, text, count)',
      required: true,
      expectedTypes: ['expression', 'selector'],
      svoPosition: 1,
      sovPosition: 1,
      markerOverride: { en: 'has', es: 'tiene', ar: 'يحتوي', zh: '有', tr: 'sahip', fr: 'a' },
    }),
    defineRole({
      role: 'expected_value',
      description: 'Expected value for comparison assertions',
      required: false,
      expectedTypes: ['literal', 'expression'],
      svoPosition: 0,
      sovPosition: 0,
      markerOverride: {
        en: 'of',
        es: 'de',
        ja: 'の',
        ar: 'من',
        ko: '의',
        zh: '的',
        tr: 'nin',
        fr: 'de',
      },
    }),
  ],
});

// =============================================================================
// AND — Continuation
// =============================================================================

export const andSchema = defineCommand({
  action: 'and',
  description: 'Continue with another step of the same type as the previous step',
  category: 'continuation',
  primaryRole: 'content',
  roles: [
    defineRole({
      role: 'content',
      description: 'The step content to be resolved as the previous step type',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 1,
    }),
  ],
});

// =============================================================================
// All Schemas
// =============================================================================

export const allSchemas = [givenSchema, whenSchema, thenSchema, andSchema];
