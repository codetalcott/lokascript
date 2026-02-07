/**
 * React Component Renderer Tests
 *
 * Unit tests for ReactRenderer + integration tests via CompilationService.generateComponent().
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { ReactRenderer } from './react.js';
import { CompilationService } from '../service.js';
import type { BehaviorSpec } from '../operations/types.js';

// =============================================================================
// ReactRenderer Unit Tests
// =============================================================================

describe('ReactRenderer', () => {
  const renderer = new ReactRenderer();

  it('has framework = react', () => {
    expect(renderer.framework).toBe('react');
  });

  // --- Class operations ---

  it('generates toggleClass with useState', () => {
    const spec = makeSpec([
      { op: 'toggleClass', className: 'active', target: { kind: 'selector', value: '#btn' } },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain("import { useCallback, useState } from 'react';");
    expect(result.code).toContain('useState<boolean>(false)');
    expect(result.code).toContain('prev => !prev');
    expect(result.hooks).toContain('useState');
    expect(result.hooks).toContain('useCallback');
  });

  it('generates addClass with state set true', () => {
    const spec = makeSpec([
      { op: 'addClass', className: 'highlight', target: { kind: 'selector', value: '#panel' } },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useState<boolean>(false)');
    expect(result.code).toContain('(true)');
  });

  it('generates removeClass with state set false', () => {
    const spec = makeSpec([{ op: 'removeClass', className: 'loading', target: { kind: 'self' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useState<boolean>(true)');
    expect(result.code).toContain('(false)');
  });

  // --- Visibility ---

  it('generates show with visibility state', () => {
    const spec = makeSpec([{ op: 'show', target: { kind: 'selector', value: '#modal' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useState<boolean>');
    expect(result.code).toContain('(true)');
  });

  it('generates hide with conditional rendering', () => {
    const spec = makeSpec([{ op: 'hide', target: { kind: 'selector', value: '#modal' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useState<boolean>(true)');
    expect(result.code).toContain('(false)');
    // Conditional render pattern
    expect(result.code).toContain('&&');
  });

  // --- Content ---

  it('generates setContent with content state', () => {
    const spec = makeSpec([
      {
        op: 'setContent',
        content: 'hello world',
        target: { kind: 'selector', value: '#output' },
        position: 'into' as const,
      },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain("useState<string>('')");
    expect(result.code).toContain('hello world');
  });

  // --- Numeric ---

  it('generates increment with prev + N', () => {
    const spec = makeSpec([
      { op: 'increment', target: { kind: 'selector', value: '#count' }, amount: 1 },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useState<number>(0)');
    expect(result.code).toContain('prev => prev + 1');
  });

  it('generates decrement with prev - N', () => {
    const spec = makeSpec([
      { op: 'decrement', target: { kind: 'selector', value: '#count' }, amount: 1 },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain('prev => prev - 1');
  });

  // --- Navigation ---

  it('generates navigate with window.location', () => {
    const spec = makeSpec([{ op: 'navigate', url: '/home' }]);

    const result = renderer.render(spec);
    expect(result.code).toContain("window.location.href = '/home'");
  });

  // --- Fetch ---

  it('generates fetch with async handler', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'click' },
      triggerTarget: { kind: 'self' },
      operations: [
        {
          op: 'fetch',
          url: '/api/data',
          format: 'json',
          target: { kind: 'selector', value: '#output' },
        },
      ],
      async: true,
    };

    const result = renderer.render(spec);
    expect(result.code).toContain('async');
    expect(result.code).toContain("fetch('/api/data')");
    expect(result.code).toContain('response.json()');
  });

  // --- Focus / Blur ---

  it('generates focus with useRef', () => {
    const spec = makeSpec([{ op: 'focus', target: { kind: 'selector', value: '#input' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('useRef<HTMLElement>(null)');
    expect(result.code).toContain('.current?.focus()');
    expect(result.hooks).toContain('useRef');
  });

  it('generates blur with useRef', () => {
    const spec = makeSpec([{ op: 'blur', target: { kind: 'selector', value: '#input' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('.current?.blur()');
  });

  // --- Utility ---

  it('generates log with console.log', () => {
    const spec = makeSpec([{ op: 'log', values: ['clicked'] }]);

    const result = renderer.render(spec);
    expect(result.code).toContain("console.log('clicked')");
  });

  it('generates wait with setTimeout promise', () => {
    const spec = makeSpec([{ op: 'wait', durationMs: 500 }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('setTimeout(resolve, 500)');
  });

  it('generates triggerEvent with dispatchEvent', () => {
    const spec = makeSpec([
      { op: 'triggerEvent', eventName: 'custom-event', target: { kind: 'selector', value: '#el' } },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain("new CustomEvent('custom-event'");
    expect(result.code).toContain('dispatchEvent');
  });

  // --- Component naming ---

  it('auto-generates name from toggle operation', () => {
    const spec = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = renderer.render(spec);
    expect(result.name).toBe('ToggleActive');
  });

  it('uses custom componentName when provided', () => {
    const spec = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = renderer.render(spec, { componentName: 'MyButton' });
    expect(result.name).toBe('MyButton');
    expect(result.code).toContain('export function MyButton');
  });

  it('includes non-click event in name', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'mouseenter' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'addClass', className: 'hover', target: { kind: 'self' } }],
      async: false,
    };

    const result = renderer.render(spec);
    expect(result.name).toContain('OnMouseenter');
  });

  // --- JSX structure ---

  it('generates valid React component structure', () => {
    const spec = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain("from 'react'");
    expect(result.code).toContain('export function');
    expect(result.code).toContain('return (');
    expect(result.code).toContain('onClick={');
    expect(result.framework).toBe('react');
  });

  it('uses correct React event prop for dblclick', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'dblclick' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }],
      async: false,
    };

    const result = renderer.render(spec);
    expect(result.code).toContain('onDoubleClick=');
  });

  it('infers button tag for click events', () => {
    const spec = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = renderer.render(spec);
    expect(result.code).toContain('<button');
  });

  it('infers form tag for submit events', () => {
    const spec: BehaviorSpec = {
      trigger: { event: 'submit' },
      triggerTarget: { kind: 'self' },
      operations: [{ op: 'navigate', url: '/success' }],
      async: false,
    };

    const result = renderer.render(spec);
    expect(result.code).toContain('<form');
    expect(result.code).toContain('onSubmit=');
  });

  // --- Multiple operations ---

  it('handles multiple operations in one handler', () => {
    const spec = makeSpec([
      { op: 'addClass', className: 'loading', target: { kind: 'self' } },
      {
        op: 'fetch',
        url: '/api/data',
        format: 'json',
        target: { kind: 'selector', value: '#output' },
      },
    ]);

    const result = renderer.render(spec);
    expect(result.code).toContain('(true)');
    expect(result.code).toContain("fetch('/api/data')");
    expect(result.operations).toHaveLength(2);
  });
});

// =============================================================================
// CompilationService.generateComponent() Integration Tests
// =============================================================================

describe('CompilationService.generateComponent()', () => {
  let service: CompilationService;

  beforeAll(async () => {
    service = await CompilationService.create();
  }, 30000);

  it('generates component from explicit syntax', () => {
    const result = service.generateComponent({
      explicit: '[toggle patient:.active destination:#btn]',
    });

    expect(result.ok).toBe(true);
    expect(result.component).toBeDefined();
    expect(result.component!.framework).toBe('react');
    expect(result.component!.code).toContain("from 'react'");
    expect(result.component!.hooks).toContain('useState');
    expect(result.operations.length).toBeGreaterThan(0);
  });

  it('generates component from English NL', () => {
    const result = service.generateComponent({
      code: 'on click toggle .active',
      language: 'en',
    });

    expect(result.ok).toBe(true);
    expect(result.component).toBeDefined();
    expect(result.component!.code).toContain('useState');
    expect(result.component!.code).toContain('prev => !prev');
  });

  it('generates component from LLM JSON', () => {
    const result = service.generateComponent({
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
    expect(result.component).toBeDefined();
    expect(result.component!.code).toContain('onClick=');
    expect(result.semantic).toBeDefined();
    expect(result.semantic?.action).toBe('toggle');
  });

  it('respects custom component name', () => {
    const result = service.generateComponent({
      explicit: '[toggle patient:.active]',
      componentName: 'ActiveToggler',
    });

    expect(result.ok).toBe(true);
    expect(result.component!.name).toBe('ActiveToggler');
    expect(result.component!.code).toContain('export function ActiveToggler');
  });

  it('rejects invalid input with diagnostics', () => {
    const result = service.generateComponent({
      code: 'xyzzy blorp grunk',
      language: 'en',
      confidence: 0.9,
    });

    expect(result.ok).toBe(false);
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it('handles empty input', () => {
    const result = service.generateComponent({});
    expect(result.ok).toBe(false);
    expect(result.diagnostics.some(d => d.code === 'NO_INPUT')).toBe(true);
  });
});

// =============================================================================
// Test Helpers
// =============================================================================

function makeSpec(
  operations: BehaviorSpec['operations'],
  overrides: Partial<BehaviorSpec> = {}
): BehaviorSpec {
  return {
    trigger: { event: 'click' },
    triggerTarget: { kind: 'self' },
    operations,
    async: false,
    ...overrides,
  };
}
