/**
 * Test Generator — end-to-end tests.
 *
 * Tests the full pipeline: input → parse → extract operations → render tests.
 * Also unit-tests operation extraction and fixture generation independently.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { CompilationService } from './service.js';
import { extractOperations } from './operations/extract.js';
import { generateFixture } from './renderers/html-fixture.js';
import { PlaywrightRenderer } from './renderers/playwright.js';
import type { BehaviorSpec } from './operations/types.js';

// =============================================================================
// Operation Extraction (unit tests — works without CompilationService)
// =============================================================================

describe('extractOperations', () => {
  describe('DOM class commands', () => {
    it('extracts toggle class operation', () => {
      const node = makeNode('toggle', {
        patient: { type: 'selector', value: '.active' },
        destination: { type: 'selector', value: '#btn' },
      });

      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(1);
      expect(spec.operations[0]).toEqual({
        op: 'toggleClass',
        className: 'active',
        target: { kind: 'selector', value: '#btn' },
      });
    });

    it('extracts add class operation', () => {
      const node = makeNode('add', {
        patient: { type: 'selector', value: '.highlight' },
        destination: { type: 'selector', value: '#panel' },
      });

      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(1);
      expect(spec.operations[0]).toEqual({
        op: 'addClass',
        className: 'highlight',
        target: { kind: 'selector', value: '#panel' },
      });
    });

    it('extracts remove class operation', () => {
      const node = makeNode('remove', {
        patient: { type: 'selector', value: '.loading' },
        source: { type: 'reference', value: 'me' },
      });

      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(1);
      expect(spec.operations[0]).toEqual({
        op: 'removeClass',
        className: 'loading',
        target: { kind: 'self' },
      });
    });

    it('defaults target to self when destination is missing', () => {
      const node = makeNode('toggle', {
        patient: { type: 'selector', value: '.active' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'toggleClass',
        target: { kind: 'self' },
      });
    });
  });

  describe('DOM content commands', () => {
    it('extracts put operation', () => {
      const node = makeNode('put', {
        patient: { type: 'literal', value: 'hello' },
        destination: { type: 'selector', value: '#output' },
      });

      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(1);
      expect(spec.operations[0]).toEqual({
        op: 'setContent',
        content: 'hello',
        target: { kind: 'selector', value: '#output' },
        position: 'into',
      });
    });

    it('extracts append operation', () => {
      const node = makeNode('append', {
        patient: { type: 'literal', value: '<li>item</li>' },
        destination: { type: 'selector', value: '#list' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({
        op: 'appendContent',
        content: '<li>item</li>',
        target: { kind: 'selector', value: '#list' },
      });
    });
  });

  describe('DOM visibility commands', () => {
    it('extracts show operation', () => {
      const node = makeNode('show', {
        patient: { type: 'selector', value: '#modal' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({
        op: 'show',
        target: { kind: 'selector', value: '#modal' },
      });
    });

    it('extracts hide operation', () => {
      const node = makeNode('hide', {
        patient: { type: 'selector', value: '#modal' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({
        op: 'hide',
        target: { kind: 'selector', value: '#modal' },
      });
    });
  });

  describe('variable commands', () => {
    it('extracts set variable operation', () => {
      const node = makeNode('set', {
        destination: { type: 'reference', value: ':count', scope: 'local' },
        patient: { type: 'literal', value: '5' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'setVariable',
        name: ':count',
        value: '5',
      });
    });

    it('extracts increment operation', () => {
      const node = makeNode('increment', {
        patient: { type: 'selector', value: '#count' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'increment',
        amount: 1,
      });
    });

    it('extracts decrement operation', () => {
      const node = makeNode('decrement', {
        patient: { type: 'selector', value: '#count' },
        quantity: { type: 'literal', value: 2 },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'decrement',
        amount: 2,
      });
    });
  });

  describe('navigation commands', () => {
    it('extracts navigate operation', () => {
      const node = makeNode('go', {
        destination: { type: 'literal', value: '/home' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({ op: 'navigate', url: '/home' });
    });

    it('extracts history back', () => {
      const node = makeNode('go', {
        destination: { type: 'literal', value: 'back' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({ op: 'historyBack' });
    });
  });

  describe('async commands', () => {
    it('extracts fetch operation', () => {
      const node = makeNode('fetch', {
        source: { type: 'literal', value: '/api/data' },
        responseType: { type: 'literal', value: 'json' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'fetch',
        url: '/api/data',
        format: 'json',
      });
      expect(spec.async).toBe(true);
    });

    it('extracts wait operation', () => {
      const node = makeNode('wait', {
        duration: { type: 'literal', value: 500 },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({ op: 'wait', durationMs: 500 });
      expect(spec.async).toBe(true);
    });

    it('parses string durations', () => {
      const node = makeNode('wait', {
        duration: { type: 'literal', value: '2s' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({ op: 'wait', durationMs: 2000 });
    });
  });

  describe('event commands', () => {
    it('extracts trigger event operation', () => {
      const node = makeNode('send', {
        patient: { type: 'literal', value: 'custom:update' },
        destination: { type: 'selector', value: '#target' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toMatchObject({
        op: 'triggerEvent',
        eventName: 'custom:update',
        target: { kind: 'selector', value: '#target' },
      });
    });
  });

  describe('focus commands', () => {
    it('extracts focus operation', () => {
      const node = makeNode('focus', {
        patient: { type: 'selector', value: '#input' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({
        op: 'focus',
        target: { kind: 'selector', value: '#input' },
      });
    });

    it('extracts blur operation', () => {
      const node = makeNode('blur', {
        patient: { type: 'selector', value: '#input' },
      });

      const spec = extractOperations(node);
      expect(spec.operations[0]).toEqual({
        op: 'blur',
        target: { kind: 'selector', value: '#input' },
      });
    });
  });

  describe('event handlers', () => {
    it('extracts trigger from event handler', () => {
      const node = makeEventHandler('click', [
        makeNode('toggle', {
          patient: { type: 'selector', value: '.active' },
        }),
      ]);

      const spec = extractOperations(node);
      expect(spec.trigger.event).toBe('click');
      expect(spec.operations).toHaveLength(1);
      expect(spec.operations[0]).toMatchObject({ op: 'toggleClass' });
    });

    it('extracts multiple body commands', () => {
      const node = makeEventHandler('click', [
        makeNode('add', {
          patient: { type: 'selector', value: '.loading' },
        }),
        makeNode('fetch', {
          source: { type: 'literal', value: '/api' },
        }),
        makeNode('remove', {
          patient: { type: 'selector', value: '.loading' },
        }),
      ]);

      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(3);
      expect(spec.operations[0]).toMatchObject({ op: 'addClass' });
      expect(spec.operations[1]).toMatchObject({ op: 'fetch' });
      expect(spec.operations[2]).toMatchObject({ op: 'removeClass' });
      expect(spec.async).toBe(true); // fetch is async
    });

    it('extracts event modifiers', () => {
      const node = makeEventHandler(
        'click',
        [
          makeNode('toggle', {
            patient: { type: 'selector', value: '.active' },
          }),
        ],
        { once: true }
      );

      const spec = extractOperations(node);
      expect(spec.trigger.modifiers).toEqual({ once: true });
    });
  });

  describe('edge cases', () => {
    it('returns empty spec for null node', () => {
      const spec = extractOperations(null);
      expect(spec.operations).toHaveLength(0);
    });

    it('returns empty ops for unknown command', () => {
      const node = makeNode('morph', {
        patient: { type: 'literal', value: 'something' },
      });
      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(0);
    });

    it('returns empty ops for missing patient', () => {
      const node = makeNode('toggle', {});
      const spec = extractOperations(node);
      expect(spec.operations).toHaveLength(0);
    });
  });
});

// =============================================================================
// HTML Fixture Generation (unit tests)
// =============================================================================

describe('generateFixture', () => {
  it('generates elements for selector targets', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        { op: 'toggleClass', className: 'active', target: { kind: 'selector', value: '#btn' } },
      ],
      async: false,
    };

    const html = generateFixture(spec, 'on click toggle .active on #btn');
    expect(html).toContain('id="btn"');
    expect(html).toContain('_=');
  });

  it('generates button for button-like IDs', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        { op: 'toggleClass', className: 'active', target: { kind: 'selector', value: '#btn' } },
      ],
      async: false,
    };

    const html = generateFixture(spec);
    expect(html).toContain('<button');
  });

  it('generates styles for visibility operations', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'hide', target: { kind: 'selector', value: '#modal' } }],
      async: false,
    };

    const html = generateFixture(spec);
    expect(html).toContain('<style>');
    expect(html).toContain('display: block');
  });

  it('deduplicates elements', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        { op: 'addClass', className: 'a', target: { kind: 'selector', value: '#el' } },
        { op: 'addClass', className: 'b', target: { kind: 'selector', value: '#el' } },
      ],
      async: false,
    };

    const html = generateFixture(spec);
    const idCount = (html.match(/id="el"/g) ?? []).length;
    expect(idCount).toBe(1);
  });
});

// =============================================================================
// Playwright Renderer (unit tests)
// =============================================================================

describe('PlaywrightRenderer', () => {
  const renderer = new PlaywrightRenderer();

  it('generates toggle test with 2-click pattern', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        { op: 'toggleClass', className: 'active', target: { kind: 'selector', value: '#btn' } },
      ],
      async: false,
      source: 'on click toggle .active on #btn',
    };

    const test = renderer.render(spec, { hyperscript: 'on click toggle .active on #btn' });
    expect(test.framework).toBe('playwright');
    expect(test.code).toContain("import { test, expect } from '@playwright/test'");
    expect(test.code).toContain('toHaveClass');
    expect(test.code).toContain('not.toHaveClass'); // 2nd click
    expect(test.code).toContain('.click()');
  });

  it('generates add class test', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        { op: 'addClass', className: 'highlight', target: { kind: 'selector', value: '#panel' } },
      ],
      async: false,
    };

    const test = renderer.render(spec);
    expect(test.code).toContain('toHaveClass');
    expect(test.code).not.toContain('not.toHaveClass');
  });

  it('generates hide test with initial visibility check', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'hide', target: { kind: 'selector', value: '#modal' } }],
      async: false,
    };

    const test = renderer.render(spec);
    expect(test.code).toContain('toBeVisible()');
    expect(test.code).toContain('not.toBeVisible()');
  });

  it('generates fetch test with route mock', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'fetch', url: '/api/data', format: 'json' }],
      async: true,
    };

    const test = renderer.render(spec);
    expect(test.code).toContain('page.route');
    expect(test.code).toContain('application/json');
    expect(test.code).toContain('route.fulfill');
  });

  it('generates navigate test', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'navigate', url: '/home' }],
      async: false,
    };

    const test = renderer.render(spec);
    expect(test.code).toContain('waitForURL');
    expect(test.code).toContain('/home');
  });

  it('respects custom test name', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }],
      async: false,
    };

    const test = renderer.render(spec, { testName: 'my custom test' });
    expect(test.name).toBe('my custom test');
    expect(test.code).toContain('my custom test');
  });

  it('generates content assertion for put', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        {
          op: 'setContent',
          content: 'hello world',
          target: { kind: 'selector', value: '#output' },
          position: 'into',
        },
      ],
      async: false,
    };

    const test = renderer.render(spec);
    expect(test.code).toContain('toContainText');
    expect(test.code).toContain('hello world');
  });
});

// =============================================================================
// Full Service Integration Tests
// =============================================================================

describe('CompilationService.generateTests()', () => {
  let service: CompilationService;

  beforeAll(async () => {
    service = await CompilationService.create();
  }, 30000);

  it('generates toggle test from English hyperscript', () => {
    const result = service.generateTests({
      code: 'on click toggle .active',
      language: 'en',
    });

    expect(result.ok).toBe(true);
    expect(result.tests).toHaveLength(1);
    expect(result.tests[0].code).toContain('toHaveClass');
    expect(result.tests[0].code).toContain('not.toHaveClass');
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0]).toMatchObject({ op: 'toggleClass', className: 'active' });
  });

  it('generates test from explicit syntax', () => {
    const result = service.generateTests({
      explicit: '[toggle patient:.active]',
    });

    expect(result.ok).toBe(true);
    expect(result.tests).toHaveLength(1);
    expect(result.operations[0]).toMatchObject({ op: 'toggleClass' });
  });

  it('generates test from LLM JSON', () => {
    const result = service.generateTests({
      semantic: {
        action: 'toggle',
        roles: {
          patient: { type: 'selector', value: '.active' },
          destination: { type: 'selector', value: '#btn' },
        },
        trigger: { event: 'click' },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.tests).toHaveLength(1);
    expect(result.operations[0]).toMatchObject({
      op: 'toggleClass',
      className: 'active',
      target: { kind: 'selector', value: '#btn' },
    });
  });

  it('generates add class test', () => {
    const result = service.generateTests({
      code: 'on click add .highlight to #panel',
      language: 'en',
    });

    expect(result.ok).toBe(true);
    expect(result.tests[0].code).toContain('toHaveClass');
    expect(result.tests[0].code).toContain('highlight');
  });

  it('generates hide test', () => {
    const result = service.generateTests({
      explicit: '[hide patient:#modal]',
    });

    expect(result.ok).toBe(true);
    expect(result.tests[0].code).toContain('toBeVisible');
    expect(result.tests[0].code).toContain('not.toBeVisible');
  });

  it('generates put content test', () => {
    const result = service.generateTests({
      semantic: {
        action: 'put',
        roles: {
          patient: { type: 'literal', value: 'hello' },
          destination: { type: 'selector', value: '#output' },
        },
        trigger: { event: 'click' },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.tests[0].code).toContain('hello');
    expect(result.tests[0].code).toContain('toContainText');
  });

  it('returns operations for introspection', () => {
    const result = service.generateTests({
      explicit: '[add patient:.loading destination:#spinner]',
    });

    expect(result.ok).toBe(true);
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0]).toEqual({
      op: 'addClass',
      className: 'loading',
      target: { kind: 'selector', value: '#spinner' },
    });
  });

  it('returns semantic JSON in response', () => {
    const result = service.generateTests({
      explicit: '[toggle patient:.active]',
    });

    expect(result.ok).toBe(true);
    expect(result.semantic).toBeDefined();
    expect(result.semantic?.action).toBe('toggle');
  });

  it('handles Japanese input', () => {
    const result = service.generateTests({
      code: 'クリック で .active を 切り替え',
      language: 'ja',
    });

    expect(result.ok).toBe(true);
    expect(result.tests).toHaveLength(1);
    expect(result.operations.length).toBeGreaterThan(0);
  });

  it('rejects invalid input with diagnostics', () => {
    const result = service.generateTests({
      code: 'xyzzy blorp grunk',
      language: 'en',
      confidence: 0.9,
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const result = service.generateTests({});
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some(d => d.code === 'NO_INPUT')).toBe(true);
  });
});

// =============================================================================
// Test Helpers
// =============================================================================

function makeNode(
  action: string,
  roles: Record<string, { type?: string; value?: unknown; raw?: string; scope?: string }>
): unknown {
  const rolesMap = new Map(Object.entries(roles));
  return {
    kind: 'command',
    action,
    roles: rolesMap,
  };
}

function makeEventHandler(
  event: string,
  body: unknown[],
  modifiers?: Record<string, unknown>
): unknown {
  const roles = new Map([['event', { type: 'literal', value: event }]]);
  return {
    kind: 'event-handler',
    action: 'on',
    roles,
    body,
    eventModifiers: modifiers,
  };
}
