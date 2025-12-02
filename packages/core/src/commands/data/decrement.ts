/**
 * DecrementCommand V2 - Standalone Implementation
 *
 * Decreases the value of a variable or element property by a specified amount.
 *
 * Syntax:
 * - decrement counter
 * - decrement counter by 5
 * - decrement global score by 10
 * - decrement element.value by 2
 * - decrement me.scrollTop by 100
 *
 * Uses shared helpers from commands/helpers/ for variable access.
 */

import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';
import {
  getCurrentNumericValue,
  setTargetValue,
} from '../helpers/variable-access';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface DecrementCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Typed input after parsing
 */
export interface DecrementCommandInput {
  target: string | HTMLElement | number;
  property?: string;
  scope?: 'global' | 'local';
  amount: number;
}

/**
 * DecrementCommand - Subtracts from variable/property values
 */
export class DecrementCommand {
  readonly name = 'decrement';

  /**
   * Parse raw AST input into structured input object
   */
  async parseInput(
    raw: DecrementCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<DecrementCommandInput> {
    if (!raw.args || raw.args.length === 0) {
      throw new Error('Decrement command requires a target');
    }

    // Helper to get node type
    const nodeType = (node: ASTNode): string => {
      if (!node || typeof node !== 'object') return 'unknown';
      return (node as any).type || 'unknown';
    };

    // Extract target from first argument
    const targetArg = raw.args[0];
    let target: string | number;
    let extractedScope: 'global' | 'local' | undefined;

    // Extract variable name AND scope from AST node without fully evaluating
    if (nodeType(targetArg) === 'identifier') {
      target = (targetArg as any).name;
      if ((targetArg as any).scope) {
        extractedScope = (targetArg as any).scope;
      }
    } else if (nodeType(targetArg) === 'literal') {
      target = (targetArg as any).value;
    } else {
      const evaluated = await evaluator.evaluate(targetArg, context);
      if (Array.isArray(evaluated) && evaluated.length > 0) {
        target = evaluated[0];
      } else {
        target = evaluated as string | number;
      }
    }

    // Check for "by <amount>" pattern and "global" scope marker
    let amount = 1;
    let scope: 'global' | 'local' | undefined = extractedScope;

    for (let i = 1; i < raw.args.length; i++) {
      const arg = raw.args[i];
      if (arg && (arg as any).type === 'literal') {
        const literalValue = (arg as any).value;
        if (literalValue === 'global') {
          scope = 'global';
        } else if (typeof literalValue === 'number') {
          amount = literalValue;
        }
      } else if (arg && (arg as any).type !== 'literal') {
        const evaluated = await evaluator.evaluate(arg, context);
        if (typeof evaluated === 'number') {
          amount = evaluated;
        }
      }
    }

    return {
      target,
      amount,
      ...(scope && { scope }),
    };
  }

  /**
   * Execute the decrement command
   */
  async execute(input: DecrementCommandInput, context: ExecutionContext): Promise<number> {
    const { target, property, scope, amount = 1 } = input;

    // Get current value using shared helper
    const currentValue = getCurrentNumericValue(target, property, scope, context);

    // Perform decrement (preserve NaN if current value is NaN)
    let newValue: number;
    if (isNaN(currentValue)) {
      newValue = NaN;
    } else {
      const decrementBy = isFinite(amount) ? amount : 1;
      newValue = currentValue - decrementBy;
    }

    // Set the new value using shared helper
    setTargetValue(target, property, scope, newValue, context);

    // Update context
    Object.assign(context, { it: newValue });

    return newValue;
  }

  static metadata = {
    description: 'Decrement a variable or property by a specified amount (default: 1)',
    syntax: 'decrement <target> [by <number>]',
    examples: ['decrement counter', 'decrement counter by 5', 'decrement me.scrollTop by 100'],
    category: 'data',
  };
}

/**
 * Factory function for creating DecrementCommand instances
 */
export function createDecrementCommand(): DecrementCommand {
  return new DecrementCommand();
}
