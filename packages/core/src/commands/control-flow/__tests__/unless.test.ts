/**
 * Unit Tests for UnlessCommand
 *
 * Tests the unless command which is a re-export of ConditionalCommand from if.ts.
 * The key behavior for "unless" mode:
 * - parseInput detects mode from raw.commandName: if commandName === 'unless' -> mode='unless'
 * - In unless mode: requires condition + at least one command (args.length >= 2),
 *   thenCommands = args.slice(1)
 * - execute: evaluateCondition gets rawConditionResult, then
 *   shouldExecuteThen = !rawConditionResult (inverted for unless)
 * - When shouldExecuteThen=true, executes the commands and sets context.it to result
 * - No else branch support for unless
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnlessCommand } from '../unless';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockContext(
  overrides: Partial<ExecutionContext> = {}
): ExecutionContext & TypedExecutionContext {
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
    halted: false,
    ...overrides,
  } as unknown as ExecutionContext & TypedExecutionContext;
}

function createMockEvaluator(returnValue?: unknown): ExpressionEvaluator {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (returnValue !== undefined) {
        return returnValue;
      }
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as unknown as { value: unknown }).value;
      }
      return node;
    },
  } as unknown as ExpressionEvaluator;
}

function createMockCommand(result: unknown) {
  return {
    execute: vi.fn().mockResolvedValue(result),
  };
}

// ========== Tests ==========

describe('UnlessCommand', () => {
  let command: UnlessCommand;

  beforeEach(() => {
    command = new UnlessCommand();
  });

  // ---------- 1. metadata ----------

  describe('metadata', () => {
    it('should have command name "if" (since it is a re-export of ConditionalCommand)', () => {
      expect(command.name).toBe('if');
    });

    it('should have metadata defined with description and examples', () => {
      expect(command.metadata).toBeDefined();
      expect(command.metadata.description).toBeTruthy();
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.length).toBeGreaterThan(0);
    });

    it('should include "unless" in aliases', () => {
      expect(command.metadata.aliases).toContain('unless');
    });

    it('should have conditional-execution in sideEffects', () => {
      expect(command.metadata.sideEffects).toContain('conditional-execution');
    });
  });

  // ---------- 2. parseInput - unless mode ----------

  describe('parseInput - unless mode', () => {
    it('should detect unless mode from commandName', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator(false);

      const conditionNode = { type: 'literal', value: false } as unknown as ASTNode;
      const commandNode = { type: 'command', name: 'log' } as unknown as ASTNode;

      const input = await command.parseInput(
        { args: [conditionNode, commandNode], modifiers: {}, commandName: 'unless' },
        evaluator,
        context
      );

      expect(input.mode).toBe('unless');
    });

    it('should require at least 2 args (condition + command)', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator(false);

      const conditionNode = { type: 'literal', value: false } as unknown as ASTNode;

      await expect(
        command.parseInput(
          { args: [conditionNode], modifiers: {}, commandName: 'unless' },
          evaluator,
          context
        )
      ).rejects.toThrow('unless command requires a condition and at least one command');
    });

    it('should extract thenCommands from args.slice(1)', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator(true);

      const conditionNode = { type: 'literal', value: true } as unknown as ASTNode;
      const cmd1 = { type: 'command', name: 'add' } as unknown as ASTNode;
      const cmd2 = { type: 'command', name: 'remove' } as unknown as ASTNode;

      const input = await command.parseInput(
        { args: [conditionNode, cmd1, cmd2], modifiers: {}, commandName: 'unless' },
        evaluator,
        context
      );

      expect(input.thenCommands).toEqual([cmd1, cmd2]);
    });

    it('should set condition from first arg evaluation', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator('evaluated-condition');

      const conditionNode = { type: 'literal', value: 'something' } as unknown as ASTNode;
      const commandNode = { type: 'command', name: 'log' } as unknown as ASTNode;

      const input = await command.parseInput(
        { args: [conditionNode, commandNode], modifiers: {}, commandName: 'unless' },
        evaluator,
        context
      );

      expect(input.condition).toBe('evaluated-condition');
    });
  });

  // ---------- 3. execute - condition inversion ----------

  describe('execute - condition inversion', () => {
    it('should execute commands when condition is FALSE (falsy)', async () => {
      const context = createMockContext();
      const mockCmd = createMockCommand('executed');

      const result = await command.execute(
        {
          mode: 'unless',
          condition: false,
          thenCommands: [mockCmd as unknown as ASTNode],
        },
        context
      );

      expect(result.executedBranch).toBe('then');
      expect(mockCmd.execute).toHaveBeenCalled();
    });

    it('should skip commands when condition is TRUE (truthy)', async () => {
      const context = createMockContext();
      const mockCmd = createMockCommand('should-not-run');

      const result = await command.execute(
        {
          mode: 'unless',
          condition: true,
          thenCommands: [mockCmd as unknown as ASTNode],
        },
        context
      );

      expect(result.executedBranch).toBe('none');
      expect(mockCmd.execute).not.toHaveBeenCalled();
    });

    it('should handle various falsy values (0, empty string, null, undefined, false)', async () => {
      const falsyValues = [0, '', null, undefined, false];

      for (const falsyValue of falsyValues) {
        const context = createMockContext();
        const mockCmd = createMockCommand(`ran-for-${falsyValue}`);

        const result = await command.execute(
          {
            mode: 'unless',
            condition: falsyValue,
            thenCommands: [mockCmd as unknown as ASTNode],
          },
          context
        );

        expect(result.executedBranch).toBe('then');
        expect(mockCmd.execute).toHaveBeenCalled();
      }
    });

    it('should handle various truthy values (non-zero, non-empty string, objects)', async () => {
      const truthyValues = [1, -1, 'hello', { key: 'value' }, [1, 2, 3], true];

      for (const truthyValue of truthyValues) {
        const context = createMockContext();
        const mockCmd = createMockCommand('should-not-run');

        const result = await command.execute(
          {
            mode: 'unless',
            condition: truthyValue,
            thenCommands: [mockCmd as unknown as ASTNode],
          },
          context
        );

        expect(result.executedBranch).toBe('none');
        expect(mockCmd.execute).not.toHaveBeenCalled();
      }
    });
  });

  // ---------- 4. execute - command execution ----------

  describe('execute - command execution', () => {
    it('should execute array of command objects', async () => {
      const context = createMockContext();
      const mockCmd1 = createMockCommand('result1');
      const mockCmd2 = createMockCommand('result2');

      const result = await command.execute(
        {
          mode: 'unless',
          condition: false,
          thenCommands: [mockCmd1 as unknown as ASTNode, mockCmd2 as unknown as ASTNode],
        },
        context
      );

      expect(mockCmd1.execute).toHaveBeenCalledWith(context);
      expect(mockCmd2.execute).toHaveBeenCalledWith(context);
      expect(result.result).toBe('result2');
    });

    it('should set context.it to last result', async () => {
      const context = createMockContext();
      const mockCmd = createMockCommand('final-result');

      await command.execute(
        {
          mode: 'unless',
          condition: false,
          thenCommands: [mockCmd as unknown as ASTNode],
        },
        context
      );

      expect((context as any).it).toBe('final-result');
    });

    it('should return mode "unless" and executedBranch "then" or "none"', async () => {
      const context = createMockContext();
      const mockCmd = createMockCommand('ok');

      // When condition is falsy: executedBranch = 'then'
      const resultExecuted = await command.execute(
        {
          mode: 'unless',
          condition: false,
          thenCommands: [mockCmd as unknown as ASTNode],
        },
        context
      );

      expect(resultExecuted.mode).toBe('unless');
      expect(resultExecuted.executedBranch).toBe('then');

      // When condition is truthy: executedBranch = 'none'
      const resultSkipped = await command.execute(
        {
          mode: 'unless',
          condition: true,
          thenCommands: [mockCmd as unknown as ASTNode],
        },
        context
      );

      expect(resultSkipped.mode).toBe('unless');
      expect(resultSkipped.executedBranch).toBe('none');
    });
  });

  // ---------- 5. execute - no else branch ----------

  describe('execute - no else branch', () => {
    it('should return executedBranch "none" when condition is truthy', async () => {
      const context = createMockContext();
      const mockCmd = createMockCommand('should-not-run');

      const result = await command.execute(
        {
          mode: 'unless',
          condition: true,
          thenCommands: [mockCmd as unknown as ASTNode],
          elseCommands: [{ type: 'command', name: 'elseCmd' } as unknown as ASTNode],
        },
        context
      );

      expect(result.executedBranch).toBe('none');
      expect(result.result).toBeUndefined();
    });

    it('should never execute else branch even if elseCommands provided', async () => {
      const context = createMockContext();
      const thenCmd = createMockCommand('then-result');
      const elseCmd = createMockCommand('else-result');

      // Condition truthy: unless skips, but should NOT fall through to else
      const resultTruthy = await command.execute(
        {
          mode: 'unless',
          condition: true,
          thenCommands: [thenCmd as unknown as ASTNode],
          elseCommands: [elseCmd as unknown as ASTNode],
        },
        context
      );

      expect(resultTruthy.executedBranch).toBe('none');
      expect(thenCmd.execute).not.toHaveBeenCalled();
      expect(elseCmd.execute).not.toHaveBeenCalled();

      // Condition falsy: unless executes thenCommands, still no else
      const resultFalsy = await command.execute(
        {
          mode: 'unless',
          condition: false,
          thenCommands: [thenCmd as unknown as ASTNode],
          elseCommands: [elseCmd as unknown as ASTNode],
        },
        context
      );

      expect(resultFalsy.executedBranch).toBe('then');
      expect(thenCmd.execute).toHaveBeenCalled();
      expect(elseCmd.execute).not.toHaveBeenCalled();
    });
  });

  // ---------- 6. integration ----------

  describe('integration', () => {
    it('should parse and execute end-to-end with falsy condition (commands run)', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator(false);

      const conditionNode = { type: 'literal', value: false } as unknown as ASTNode;
      const mockCmd = createMockCommand('integration-result');

      // Parse
      const input = await command.parseInput(
        {
          args: [conditionNode, mockCmd as unknown as ASTNode],
          modifiers: {},
          commandName: 'unless',
        },
        evaluator,
        context
      );

      expect(input.mode).toBe('unless');
      expect(input.condition).toBe(false);

      // Execute
      const result = await command.execute(input, context);

      expect(result.mode).toBe('unless');
      expect(result.executedBranch).toBe('then');
      expect(result.conditionResult).toBe(false);
      expect(mockCmd.execute).toHaveBeenCalled();
      expect((context as any).it).toBe('integration-result');
    });

    it('should parse and execute end-to-end with truthy condition (commands skipped)', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator(true);

      const conditionNode = { type: 'literal', value: true } as unknown as ASTNode;
      const mockCmd = createMockCommand('should-not-run');

      // Parse
      const input = await command.parseInput(
        {
          args: [conditionNode, mockCmd as unknown as ASTNode],
          modifiers: {},
          commandName: 'unless',
        },
        evaluator,
        context
      );

      expect(input.mode).toBe('unless');
      expect(input.condition).toBe(true);

      // Execute
      const result = await command.execute(input, context);

      expect(result.mode).toBe('unless');
      expect(result.executedBranch).toBe('none');
      expect(result.conditionResult).toBe(true);
      expect(mockCmd.execute).not.toHaveBeenCalled();
    });
  });
});
