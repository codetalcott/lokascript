/**
 * Unit Tests for InstallCommand (Standalone V2)
 *
 * Tests behavior installation on elements with optional parameters,
 * PascalCase validation, target resolution, and registry integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InstallCommand } from '../install';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockContext(): ExecutionContext & TypedExecutionContext {
  const meElement = document.createElement('div');
  return {
    me: meElement,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    globals: new Map(),
    target: meElement,
    detail: undefined,
  } as unknown as ExecutionContext & TypedExecutionContext;
}

function createMockEvaluator(): ExpressionEvaluator {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as any).value;
      }
      if (typeof node === 'object' && node !== null && 'name' in node) {
        return (node as any).name;
      }
      return node;
    },
  } as unknown as ExpressionEvaluator;
}

function createMockBehaviorRegistry() {
  const behaviors = new Map<string, any>();
  return {
    has: (name: string) => behaviors.has(name),
    install: vi.fn(async (name: string, element: HTMLElement, params: any) => ({
      name,
      element,
      params,
    })),
    _behaviors: behaviors,
    register: (name: string, def: any) => behaviors.set(name, def),
  };
}

// ========== Tests ==========

describe('InstallCommand (Standalone V2)', () => {
  let command: InstallCommand;
  let registry: ReturnType<typeof createMockBehaviorRegistry>;

  beforeEach(() => {
    command = new InstallCommand();
    registry = createMockBehaviorRegistry();
    registry.register('TestBehavior', { init: vi.fn() });
  });

  // ---------- metadata ----------

  describe('metadata', () => {
    it('should have correct command name', () => {
      expect(command.name).toBe('install');
    });

    it('should have description mentioning behavior', () => {
      expect(command.metadata.description.toLowerCase()).toContain('behavior');
    });

    it('should have syntax examples', () => {
      expect(command.metadata.syntax).toBeInstanceOf(Array);
      expect(command.metadata.syntax.length).toBeGreaterThan(0);
    });

    it('should declare correct side effects', () => {
      expect(command.metadata.sideEffects).toContain('behavior-installation');
      expect(command.metadata.sideEffects).toContain('element-modification');
    });
  });

  // ---------- parseInput ----------

  describe('parseInput', () => {
    it('should throw when no arguments provided', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();

      await expect(
        command.parseInput({ args: [], modifiers: {} }, evaluator, context)
      ).rejects.toThrow('install command requires a behavior name');
    });

    it('should extract behavior name from identifier node without evaluating', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();

      const input = await command.parseInput(
        {
          args: [{ type: 'identifier', name: 'Draggable' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.behaviorName).toBe('Draggable');
    });

    it('should reject lowercase behavior names (non-PascalCase)', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();

      await expect(
        command.parseInput(
          {
            args: [{ type: 'literal', value: 'draggable' } as any],
            modifiers: {},
          },
          evaluator,
          context
        )
      ).rejects.toThrow('PascalCase');
    });

    it('should parse parameters from second arg', async () => {
      const context = createMockContext();
      const evaluator = {
        evaluate: async (node: ASTNode) => {
          const n = node as any;
          if (n.type === 'identifier') return n.name;
          return n.value;
        },
      } as unknown as ExpressionEvaluator;

      const input = await command.parseInput(
        {
          args: [
            { type: 'identifier', name: 'Tooltip' } as any,
            { type: 'literal', value: { text: 'Help', position: 'top' } } as any,
          ],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.behaviorName).toBe('Tooltip');
      expect(input.parameters).toBeDefined();
      expect(input.parameters!.text).toBe('Help');
      expect(input.parameters!.position).toBe('top');
    });

    it('should parse target from "on" modifier', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();
      const targetElement = document.createElement('span');

      const customEvaluator = {
        evaluate: async (node: ASTNode) => {
          const n = node as any;
          if (n.type === 'identifier') return n.name;
          if (n.type === 'target') return targetElement;
          return n.value;
        },
      } as unknown as ExpressionEvaluator;

      const input = await command.parseInput(
        {
          args: [{ type: 'identifier', name: 'Removable' } as any],
          modifiers: { on: { type: 'target', value: targetElement } as any },
        },
        customEvaluator,
        context
      );

      expect(input.behaviorName).toBe('Removable');
      expect(input.target).toBe(targetElement);
    });
  });

  // ---------- execute - target resolution ----------

  describe('execute - target resolution', () => {
    it('should default to context.me when no target specified', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const result = await command.execute({ behaviorName: 'TestBehavior' }, context);

      expect(result.success).toBe(true);
      expect(result.installedCount).toBe(1);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', context.me, {});
    });

    it('should resolve an HTMLElement directly', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);
      const target = document.createElement('section');

      const result = await command.execute({ behaviorName: 'TestBehavior', target }, context);

      expect(result.success).toBe(true);
      expect(result.installedCount).toBe(1);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', target, {});
    });

    it('should resolve a CSS selector via querySelectorAll', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const el = document.createElement('div');
      el.classList.add('install-target');
      document.body.appendChild(el);

      try {
        const result = await command.execute(
          { behaviorName: 'TestBehavior', target: '.install-target' },
          context
        );

        expect(result.success).toBe(true);
        expect(result.installedCount).toBe(1);
        expect(registry.install).toHaveBeenCalledWith('TestBehavior', el, {});
      } finally {
        document.body.removeChild(el);
      }
    });

    it('should throw when no elements are found for selector', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      await expect(
        command.execute({ behaviorName: 'TestBehavior', target: '.nonexistent-element' }, context)
      ).rejects.toThrow();
    });
  });

  // ---------- execute - behavior installation ----------

  describe('execute - behavior installation', () => {
    it('should call registry.install with correct arguments', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);
      const params = { axis: 'y', speed: 100 };

      await command.execute({ behaviorName: 'TestBehavior', parameters: params }, context);

      expect(registry.install).toHaveBeenCalledTimes(1);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', context.me, params);
    });

    it('should return success:true with correct installedCount', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const result = await command.execute({ behaviorName: 'TestBehavior' }, context);

      expect(result.success).toBe(true);
      expect(result.behaviorName).toBe('TestBehavior');
      expect(result.installedCount).toBe(1);
    });

    it('should return instances array from installation', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const result = await command.execute({ behaviorName: 'TestBehavior' }, context);

      expect(result.instances).toBeInstanceOf(Array);
      expect(result.instances).toHaveLength(1);
      expect((result.instances[0] as any).name).toBe('TestBehavior');
    });

    it('should throw when behavior is not defined in registry', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      await expect(command.execute({ behaviorName: 'UndefinedBehavior' }, context)).rejects.toThrow(
        'UndefinedBehavior'
      );
    });
  });

  // ---------- execute - multiple targets ----------

  describe('execute - multiple targets', () => {
    it('should install behavior on each target in array', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const el3 = document.createElement('div');

      const result = await command.execute(
        { behaviorName: 'TestBehavior', target: [el1, el2, el3] },
        context
      );

      expect(registry.install).toHaveBeenCalledTimes(3);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', el1, {});
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', el2, {});
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', el3, {});
    });

    it('should report installedCount matching number of targets', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const el1 = document.createElement('div');
      const el2 = document.createElement('div');

      const result = await command.execute(
        { behaviorName: 'TestBehavior', target: [el1, el2] },
        context
      );

      expect(result.installedCount).toBe(2);
      expect(result.instances).toHaveLength(2);
    });
  });

  // ---------- integration ----------

  describe('integration', () => {
    it('should work end-to-end with default target (context.me)', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);
      const evaluator = createMockEvaluator();

      // Parse
      const input = await command.parseInput(
        {
          args: [{ type: 'identifier', name: 'TestBehavior' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      // Execute
      const result = await command.execute(input, context);

      expect(result.success).toBe(true);
      expect(result.behaviorName).toBe('TestBehavior');
      expect(result.installedCount).toBe(1);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', context.me, {});
    });

    it('should work end-to-end with params and explicit target', async () => {
      const context = createMockContext();
      context.locals.set('_behaviors', registry);

      const targetElement = document.createElement('article');
      const params = { text: 'Help', position: 'top' };

      // Custom evaluator that returns concrete values for the param and target nodes
      const evaluator = {
        evaluate: async (node: ASTNode) => {
          const n = node as any;
          if (n.type === 'identifier') return n.name;
          if (n.type === 'params') return params;
          if (n.type === 'target-ref') return targetElement;
          return n.value;
        },
      } as unknown as ExpressionEvaluator;

      // Parse
      const input = await command.parseInput(
        {
          args: [
            { type: 'identifier', name: 'TestBehavior' } as any,
            { type: 'params', value: params } as any,
          ],
          modifiers: {
            on: { type: 'target-ref', value: targetElement } as any,
          },
        },
        evaluator,
        context
      );

      expect(input.behaviorName).toBe('TestBehavior');
      expect(input.parameters).toEqual(params);
      expect(input.target).toBe(targetElement);

      // Execute
      const result = await command.execute(input, context);

      expect(result.success).toBe(true);
      expect(result.behaviorName).toBe('TestBehavior');
      expect(result.installedCount).toBe(1);
      expect(registry.install).toHaveBeenCalledWith('TestBehavior', targetElement, params);
    });
  });
});
