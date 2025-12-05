/**
 * IncrementCommand V2 - Standalone Implementation
 *
 * Increases the value of a variable or element property by a specified amount.
 *
 * Syntax:
 * - increment counter
 * - increment counter by 5
 * - increment global score by 10
 * - increment element.value by 2
 * - increment me.scrollTop by 100
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
export interface IncrementCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Typed input after parsing
 */
export interface IncrementCommandInput {
  target: string | HTMLElement | number;
  property?: string;
  scope?: 'global' | 'local';
  amount: number;
}

/**
 * IncrementCommand - Adds to variable/property values
 */
export class IncrementCommand {
  readonly name = 'increment';

  /**
   * Parse raw AST input into structured input object
   */
  async parseInput(
    raw: IncrementCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<IncrementCommandInput> {
    if (!raw.args || raw.args.length === 0) {
      throw new Error('Increment command requires a target');
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
   * Execute the increment command
   */
  async execute(input: IncrementCommandInput, context: ExecutionContext): Promise<number> {
    const { target, property, scope, amount = 1 } = input;

    // Get current value using shared helper
    const currentValue = getCurrentNumericValue(target, property, scope, context);

    // Perform increment (preserve NaN if current value is NaN)
    let newValue: number;
    if (isNaN(currentValue)) {
      newValue = NaN;
    } else {
      const incrementBy = isFinite(amount) ? amount : 1;
      newValue = currentValue + incrementBy;
    }

    // Set the new value using shared helper
    setTargetValue(target, property, scope, newValue, context);

    // Update context
    Object.assign(context, { it: newValue });

    return newValue;
  }

  static readonly metadata = {
    description: 'Increment a variable or property by a specified amount (default: 1)',
    syntax: 'increment <target> [by <number>]',
    examples: ['increment counter', 'increment counter by 5', 'increment me.scrollTop by 100'],
    category: 'data',
  } as const;

  /**
   * Instance accessor for metadata (backward compatibility)
   */
  get metadata() {
    return IncrementCommand.metadata;
  }
}

/**
 * Factory function for creating IncrementCommand instances
 */
export function createIncrementCommand(): IncrementCommand {
  return new IncrementCommand();
}
