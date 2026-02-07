/**
 * Semantic Diff Engine Tests
 *
 * Unit tests for diffBehaviors() — pure function tests, no service initialization needed.
 */

import { describe, it, expect } from 'vitest';
import { diffBehaviors, canonicalizeOp } from './diff.js';
import type { BehaviorSpec, AbstractOperation } from '../operations/types.js';

// =============================================================================
// Test Helpers
// =============================================================================

function makeSpec(
  operations: AbstractOperation[],
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

// =============================================================================
// diffBehaviors() Tests
// =============================================================================

describe('diffBehaviors', () => {
  // --- Identical ---

  it('reports identical for same spec', () => {
    const spec = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = diffBehaviors(spec, spec);
    expect(result.identical).toBe(true);
    expect(result.trigger).toBeNull();
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].kind).toBe('unchanged');
    expect(result.summary).toBe('No semantic change');
  });

  it('reports identical for two equivalent specs', () => {
    const a = makeSpec([
      { op: 'addClass', className: 'highlight', target: { kind: 'selector', value: '#el' } },
    ]);
    const b = makeSpec([
      { op: 'addClass', className: 'highlight', target: { kind: 'selector', value: '#el' } },
    ]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(true);
  });

  it('reports identical for empty operations', () => {
    const a = makeSpec([]);
    const b = makeSpec([]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(true);
    expect(result.operations).toHaveLength(0);
  });

  // --- Trigger diffs ---

  it('detects trigger event change', () => {
    const a = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }], {
      trigger: { event: 'click' },
    });
    const b = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }], {
      trigger: { event: 'hover' },
    });

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.trigger).not.toBeNull();
    expect(result.trigger!.changes).toContain('event: click → hover');
    expect(result.summary).toContain('Trigger');
  });

  it('detects added modifier', () => {
    const a = makeSpec([], { trigger: { event: 'click' } });
    const b = makeSpec([], { trigger: { event: 'click', modifiers: { once: true } } });

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.trigger!.changes).toContain('added modifier: once');
  });

  it('detects removed modifier', () => {
    const a = makeSpec([], { trigger: { event: 'click', modifiers: { once: true } } });
    const b = makeSpec([], { trigger: { event: 'click' } });

    const result = diffBehaviors(a, b);
    expect(result.trigger!.changes).toContain('removed modifier: once');
  });

  // --- Operation added ---

  it('detects added operation', () => {
    const a = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);
    const b = makeSpec([
      { op: 'toggleClass', className: 'active', target: { kind: 'self' } },
      { op: 'log', values: ['toggled'] },
    ]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.operations.some(d => d.kind === 'added')).toBe(true);
    const added = result.operations.find(d => d.kind === 'added');
    expect(added!.b!.op).toBe('log');
    expect(result.summary).toContain('1 added');
  });

  // --- Operation removed ---

  it('detects removed operation', () => {
    const a = makeSpec([
      { op: 'toggleClass', className: 'active', target: { kind: 'self' } },
      { op: 'log', values: ['toggled'] },
    ]);
    const b = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    const removed = result.operations.find(d => d.kind === 'removed');
    expect(removed!.a!.op).toBe('log');
    expect(result.summary).toContain('1 removed');
  });

  // --- Operation changed ---

  it('detects changed operation (same type, different field)', () => {
    const a = makeSpec([{ op: 'toggleClass', className: 'active', target: { kind: 'self' } }]);
    const b = makeSpec([{ op: 'toggleClass', className: 'highlight', target: { kind: 'self' } }]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    const changed = result.operations.find(d => d.kind === 'changed');
    expect(changed).toBeDefined();
    expect(changed!.changes).toBeDefined();
    expect(changed!.changes!.some(c => c.includes('className'))).toBe(true);
    expect(result.summary).toContain('1 changed');
  });

  it('detects target change', () => {
    const a = makeSpec([{ op: 'show', target: { kind: 'self' } }]);
    const b = makeSpec([{ op: 'show', target: { kind: 'selector', value: '#modal' } }]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    const changed = result.operations.find(d => d.kind === 'changed');
    expect(changed!.changes!.some(c => c.includes('target'))).toBe(true);
  });

  // --- Operation reordered ---

  it('detects reordered operations', () => {
    const opA: AbstractOperation = {
      op: 'addClass',
      className: 'loading',
      target: { kind: 'self' },
    };
    const opB: AbstractOperation = {
      op: 'addClass',
      className: 'active',
      target: { kind: 'selector', value: '#btn' },
    };

    const a = makeSpec([opA, opB]);
    const b = makeSpec([opB, opA]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    const reordered = result.operations.filter(d => d.kind === 'reordered');
    expect(reordered.length).toBeGreaterThan(0);
    expect(result.summary).toContain('reordered');
  });

  // --- Multiple changes ---

  it('handles multiple changes at once', () => {
    const a = makeSpec(
      [
        { op: 'toggleClass', className: 'active', target: { kind: 'self' } },
        { op: 'log', values: ['old'] },
      ],
      { trigger: { event: 'click' } }
    );
    const b = makeSpec(
      [
        { op: 'toggleClass', className: 'highlight', target: { kind: 'self' } },
        { op: 'navigate', url: '/home' },
      ],
      { trigger: { event: 'hover' } }
    );

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.trigger).not.toBeNull();
    expect(result.operations.length).toBeGreaterThan(0);
  });

  // --- Edge cases ---

  it('handles a empty, b non-empty', () => {
    const a = makeSpec([]);
    const b = makeSpec([{ op: 'show', target: { kind: 'self' } }]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].kind).toBe('added');
  });

  it('handles a non-empty, b empty', () => {
    const a = makeSpec([{ op: 'show', target: { kind: 'self' } }]);
    const b = makeSpec([]);

    const result = diffBehaviors(a, b);
    expect(result.identical).toBe(false);
    expect(result.operations).toHaveLength(1);
    expect(result.operations[0].kind).toBe('removed');
  });

  it('handles many unchanged with one change in middle', () => {
    const ops: AbstractOperation[] = [
      { op: 'addClass', className: 'a', target: { kind: 'self' } },
      { op: 'addClass', className: 'b', target: { kind: 'self' } },
      { op: 'addClass', className: 'c', target: { kind: 'self' } },
    ];

    const bOps = [...ops];
    bOps[1] = { op: 'addClass', className: 'x', target: { kind: 'self' } };

    const result = diffBehaviors(makeSpec(ops), makeSpec(bOps));
    expect(result.identical).toBe(false);
    const unchanged = result.operations.filter(d => d.kind === 'unchanged');
    expect(unchanged.length).toBe(2);
  });
});

// =============================================================================
// canonicalizeOp() Tests
// =============================================================================

describe('canonicalizeOp', () => {
  it('produces same key for identical operations', () => {
    const op: AbstractOperation = {
      op: 'toggleClass',
      className: 'active',
      target: { kind: 'self' },
    };
    expect(canonicalizeOp(op)).toBe(canonicalizeOp({ ...op }));
  });

  it('produces different keys for different classNames', () => {
    const a: AbstractOperation = {
      op: 'toggleClass',
      className: 'active',
      target: { kind: 'self' },
    };
    const b: AbstractOperation = {
      op: 'toggleClass',
      className: 'highlight',
      target: { kind: 'self' },
    };
    expect(canonicalizeOp(a)).not.toBe(canonicalizeOp(b));
  });

  it('produces different keys for different targets', () => {
    const a: AbstractOperation = { op: 'show', target: { kind: 'self' } };
    const b: AbstractOperation = { op: 'show', target: { kind: 'selector', value: '#modal' } };
    expect(canonicalizeOp(a)).not.toBe(canonicalizeOp(b));
  });

  it('produces different keys for different op types', () => {
    const a: AbstractOperation = { op: 'show', target: { kind: 'self' } };
    const b: AbstractOperation = { op: 'hide', target: { kind: 'self' } };
    expect(canonicalizeOp(a)).not.toBe(canonicalizeOp(b));
  });

  it('handles all operation types without error', () => {
    const ops: AbstractOperation[] = [
      { op: 'toggleClass', className: 'a', target: { kind: 'self' } },
      { op: 'addClass', className: 'a', target: { kind: 'self' } },
      { op: 'removeClass', className: 'a', target: { kind: 'self' } },
      { op: 'setContent', content: 'hi', target: { kind: 'self' }, position: 'into' },
      { op: 'appendContent', content: 'hi', target: { kind: 'self' } },
      { op: 'show', target: { kind: 'self' } },
      { op: 'hide', target: { kind: 'self' } },
      { op: 'setVariable', name: 'x', value: '1', scope: 'local' },
      { op: 'increment', target: { kind: 'self' }, amount: 1 },
      { op: 'decrement', target: { kind: 'self' }, amount: 1 },
      { op: 'navigate', url: '/home' },
      { op: 'historyBack' },
      { op: 'historyForward' },
      { op: 'fetch', url: '/api', format: 'json' },
      { op: 'wait', durationMs: 100 },
      { op: 'triggerEvent', eventName: 'custom', target: { kind: 'self' } },
      { op: 'focus', target: { kind: 'self' } },
      { op: 'blur', target: { kind: 'self' } },
      { op: 'log', values: ['msg'] },
    ];

    for (const op of ops) {
      expect(() => canonicalizeOp(op)).not.toThrow();
      expect(canonicalizeOp(op).length).toBeGreaterThan(0);
    }
  });
});
