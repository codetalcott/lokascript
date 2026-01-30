/**
 * Unit Tests for PersistCommand (Decorated Implementation)
 *
 * Comprehensive coverage of all persist command behaviors:
 * - Save values to localStorage/sessionStorage with optional TTL
 * - Restore values with TTL expiration checking
 * - Remove values from storage
 * - Custom event dispatching for all operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PersistCommand } from '../persist';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockStorage() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => store.clear()),
    get length() {
      return store.size;
    },
    key: vi.fn((index: number) => [...store.keys()][index] ?? null),
    _store: store,
  };
}

function createMockContext(
  overrides: Partial<ExecutionContext> = {}
): ExecutionContext & TypedExecutionContext {
  const meElement = document.createElement('div');
  meElement.id = 'test-element';

  return {
    me: meElement,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    globals: new Map(),
    target: meElement,
    detail: undefined,
    ...overrides,
  } as unknown as ExecutionContext & TypedExecutionContext;
}

function createMockEvaluator() {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as any).value;
      }
      return node;
    },
  } as ExpressionEvaluator;
}

// ========== Tests ==========

describe('PersistCommand (Decorated Implementation)', () => {
  let command: PersistCommand;
  let context: ExecutionContext & TypedExecutionContext;
  let evaluator: ExpressionEvaluator;
  let mockLocalStorage: ReturnType<typeof createMockStorage>;
  let mockSessionStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    command = new PersistCommand();
    context = createMockContext();
    evaluator = createMockEvaluator();

    mockLocalStorage = createMockStorage();
    mockSessionStorage = createMockStorage();
    vi.stubGlobal('localStorage', mockLocalStorage);
    vi.stubGlobal('sessionStorage', mockSessionStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ========== Metadata ==========

  describe('metadata', () => {
    it('should have correct command name', () => {
      expect(command.name).toBe('persist');
    });

    it('should have metadata with description containing storage', () => {
      expect(command.metadata).toBeDefined();
      expect(command.metadata.description.toLowerCase()).toContain('storage');
    });

    it('should have syntax array with multiple forms', () => {
      expect(command.metadata.syntax).toBeInstanceOf(Array);
      expect((command.metadata.syntax as string[]).length).toBeGreaterThan(0);
    });

    it('should have usage examples', () => {
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.length).toBeGreaterThan(0);
    });

    it('should have correct side effects', () => {
      expect(command.metadata.sideEffects).toContain('storage');
      expect(command.metadata.sideEffects).toContain('data-mutation');
    });
  });

  // ========== parseInput ==========

  describe('parseInput', () => {
    it('should parse save operation with to and as modifiers', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'myData' } as any],
          modifiers: {
            to: { type: 'literal', value: 'local' } as any,
            as: { type: 'literal', value: 'myKey' } as any,
          },
        },
        evaluator,
        context
      );

      expect(input.operation).toBe('save');
      expect(input.value).toBe('myData');
      expect(input.storage).toBe('local');
      expect(input.key).toBe('myKey');
    });

    it('should parse restore operation with from modifier', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'myKey' } as any],
          modifiers: {
            from: { type: 'literal', value: 'session' } as any,
          },
        },
        evaluator,
        context
      );

      expect(input.operation).toBe('restore');
      expect(input.key).toBe('myKey');
      expect(input.storage).toBe('session');
    });

    it('should throw when "as" modifier is missing for save operation', async () => {
      await expect(
        command.parseInput(
          {
            args: [{ type: 'literal', value: 'myData' } as any],
            modifiers: {
              to: { type: 'literal', value: 'local' } as any,
            },
          },
          evaluator,
          context
        )
      ).rejects.toThrow('persist command requires "as <key>" modifier');
    });

    it('should parse ttl modifier for save operation', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'data' } as any],
          modifiers: {
            to: { type: 'literal', value: 'local' } as any,
            as: { type: 'literal', value: 'key' } as any,
            ttl: { type: 'literal', value: 5000 } as any,
          },
        },
        evaluator,
        context
      );

      expect(input.ttl).toBe(5000);
    });

    it('should default storage to "local" when not specified', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'data' } as any],
          modifiers: {
            as: { type: 'literal', value: 'key' } as any,
          },
        },
        evaluator,
        context
      );

      expect(input.storage).toBe('local');
    });
  });

  // ========== execute - save ==========

  describe('execute - save', () => {
    it('should save value to localStorage', async () => {
      const result = await command.execute(
        {
          key: 'username',
          value: 'alice',
          storage: 'local',
          operation: 'save',
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.operation).toBe('save');
      expect(result.key).toBe('username');
      expect(result.value).toBe('alice');
      expect(result.storage).toBe('local');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('username', expect.any(String));
    });

    it('should save value to sessionStorage', async () => {
      const result = await command.execute(
        {
          key: 'draft',
          value: { text: 'hello' },
          storage: 'session',
          operation: 'save',
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.storage).toBe('session');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('draft', expect.any(String));
    });

    it('should JSON serialize with timestamp and optional ttl', async () => {
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      await command.execute(
        {
          key: 'data',
          value: 42,
          storage: 'local',
          operation: 'save',
          ttl: 5000,
        },
        context
      );

      const storedArg = mockLocalStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(storedArg);

      expect(parsed.value).toBe(42);
      expect(parsed.timestamp).toBe(1000);
      expect(parsed.ttl).toBe(5000);
    });

    it('should dispatch persist:save event', async () => {
      const events: CustomEvent[] = [];
      const element = context.me as HTMLElement;
      element.addEventListener('persist:save', ((e: CustomEvent) => {
        events.push(e);
      }) as EventListener);

      await command.execute(
        {
          key: 'myKey',
          value: 'myVal',
          storage: 'local',
          operation: 'save',
        },
        context
      );

      expect(events.length).toBe(1);
      expect(events[0].detail.key).toBe('myKey');
      expect(events[0].detail.value).toBe('myVal');
      expect(events[0].detail.storage).toBe('local');
    });
  });

  // ========== execute - restore ==========

  describe('execute - restore', () => {
    it('should restore a valid value from storage', async () => {
      const storedValue = JSON.stringify({
        value: 'restored-data',
        timestamp: Date.now(),
      });
      mockLocalStorage._store.set('myKey', storedValue);

      const result = await command.execute(
        {
          key: 'myKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.operation).toBe('restore');
      expect(result.value).toBe('restored-data');
    });

    it('should return success:false for missing key', async () => {
      const result = await command.execute(
        {
          key: 'nonexistent',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(result.success).toBe(false);
      expect(result.operation).toBe('restore');
      expect(result.value).toBeNull();
    });

    it('should detect TTL expiration, remove entry, and return expired:true', async () => {
      const ttl = 5000;
      const timestamp = 1000;

      // Store a value with TTL
      const storedValue = JSON.stringify({ value: 'old', timestamp, ttl });
      mockLocalStorage._store.set('expKey', storedValue);

      // Advance time past TTL
      vi.spyOn(Date, 'now').mockReturnValue(timestamp + ttl + 1);

      const result = await command.execute(
        {
          key: 'expKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(result.success).toBe(false);
      expect(result.expired).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expKey');
    });

    it('should set context.it with the restored value', async () => {
      const storedValue = JSON.stringify({
        value: 'context-val',
        timestamp: Date.now(),
      });
      mockLocalStorage._store.set('ctxKey', storedValue);

      await command.execute(
        {
          key: 'ctxKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(context.it).toBe('context-val');
    });

    it('should dispatch persist:restore event on success', async () => {
      const storedValue = JSON.stringify({
        value: 'event-val',
        timestamp: Date.now(),
      });
      mockLocalStorage._store.set('evtKey', storedValue);

      const events: CustomEvent[] = [];
      const element = context.me as HTMLElement;
      element.addEventListener('persist:restore', ((e: CustomEvent) => {
        events.push(e);
      }) as EventListener);

      await command.execute(
        {
          key: 'evtKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(events.length).toBe(1);
      expect(events[0].detail.key).toBe('evtKey');
      expect(events[0].detail.value).toBe('event-val');
    });
  });

  // ========== execute - remove ==========

  describe('execute - remove', () => {
    it('should remove key from storage', async () => {
      mockLocalStorage._store.set('rmKey', 'anything');

      await command.execute(
        {
          key: 'rmKey',
          storage: 'local',
          operation: 'remove',
        },
        context
      );

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('rmKey');
    });

    it('should dispatch persist:remove event', async () => {
      const events: CustomEvent[] = [];
      const element = context.me as HTMLElement;
      element.addEventListener('persist:remove', ((e: CustomEvent) => {
        events.push(e);
      }) as EventListener);

      await command.execute(
        {
          key: 'rmKey',
          storage: 'local',
          operation: 'remove',
        },
        context
      );

      expect(events.length).toBe(1);
      expect(events[0].detail.key).toBe('rmKey');
      expect(events[0].detail.storage).toBe('local');
    });

    it('should return success:true with operation "remove"', async () => {
      const result = await command.execute(
        {
          key: 'rmKey',
          storage: 'local',
          operation: 'remove',
        },
        context
      );

      expect(result.success).toBe(true);
      expect(result.operation).toBe('remove');
      expect(result.key).toBe('rmKey');
    });
  });

  // ========== execute - validation ==========

  describe('execute - validation', () => {
    it('should throw on empty key', async () => {
      await expect(
        command.execute(
          {
            key: '',
            value: 'data',
            storage: 'local',
            operation: 'save',
          },
          context
        )
      ).rejects.toThrow('persist command requires a valid storage key');
    });

    it('should throw when storage is unavailable', async () => {
      // Simulate no window (getStorage returns null)
      vi.stubGlobal('window', undefined);

      await expect(
        command.execute(
          {
            key: 'someKey',
            value: 'data',
            storage: 'local',
            operation: 'save',
          },
          context
        )
      ).rejects.toThrow('Storage not available');
    });
  });

  // ========== integration ==========

  describe('integration', () => {
    it('should save then restore a value end-to-end', async () => {
      const now = 1000;
      vi.spyOn(Date, 'now').mockReturnValue(now);

      // Save
      const saveResult = await command.execute(
        {
          key: 'e2eKey',
          value: { nested: 'object' },
          storage: 'local',
          operation: 'save',
        },
        context
      );

      expect(saveResult.success).toBe(true);
      expect(saveResult.operation).toBe('save');

      // Restore (same timestamp, no TTL expiration issue)
      const restoreResult = await command.execute(
        {
          key: 'e2eKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(restoreResult.success).toBe(true);
      expect(restoreResult.operation).toBe('restore');
      expect(restoreResult.value).toEqual({ nested: 'object' });
      expect(context.it).toEqual({ nested: 'object' });
    });

    it('should save with TTL, advance time, and restore shows expired', async () => {
      const ttl = 3000;
      const startTime = 10000;

      vi.spyOn(Date, 'now').mockReturnValue(startTime);

      // Save with TTL
      const saveResult = await command.execute(
        {
          key: 'ttlKey',
          value: 'temporary',
          storage: 'local',
          operation: 'save',
          ttl,
        },
        context
      );

      expect(saveResult.success).toBe(true);

      // Advance time past TTL
      vi.spyOn(Date, 'now').mockReturnValue(startTime + ttl + 1);

      // Attempt restore - should be expired
      const restoreResult = await command.execute(
        {
          key: 'ttlKey',
          storage: 'local',
          operation: 'restore',
        },
        context
      );

      expect(restoreResult.success).toBe(false);
      expect(restoreResult.expired).toBe(true);
      // Expired entry should be removed from storage
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('ttlKey');
    });
  });
});
