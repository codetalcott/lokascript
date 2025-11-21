/**
 * HideCommand V2 - Enhanced with parseInput() for RuntimeBase
 * Non-destructive wrapper that extends the original HideCommand
 */

import { HideCommand as HideCommandV1 } from '../../commands/dom/hide';
import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface HideCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Enhanced HideCommand with parseInput() method for tree-shakable RuntimeBase
 *
 * This wrapper extends the original HideCommand and adds argument parsing
 * logic that was previously in Runtime.executeCommand().
 */
export class HideCommand extends HideCommandV1 {
  /**
   * Parse raw AST input into evaluated arguments
   *
   * This method moves the argument evaluation logic from Runtime to the command,
   * enabling RuntimeBase to be generic and tree-shakable.
   *
   * @param raw - Raw AST nodes and modifiers from the parser
   * @param evaluator - Expression evaluator for resolving AST nodes
   * @param context - Execution context
   * @returns Evaluated arguments ready for execute()
   */
  async parseInput(
    raw: HideCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<any[]> {
    // Hide command syntax: "hide [<target-expression>]"
    // If no args provided, hide defaults to 'me' (handled by resolveTargets)

    if (!raw.args || raw.args.length === 0) {
      // No arguments - command will use context.me as default
      return [undefined];
    }

    // Evaluate each argument using the expression evaluator
    // This mirrors Runtime.executeCommand() logic (lines 1684-1686):
    //   const hideArgs = await Promise.all(
    //     rawArgs.map((arg: ASTNode) => this.execute(arg, context))
    //   );
    const evaluatedArgs = await Promise.all(
      raw.args.map((arg: ASTNode) => evaluator.evaluate(arg, context))
    );

    return evaluatedArgs;
  }

  // execute() is inherited from HideCommandV1 - no changes needed!
}

/**
 * Factory function for creating HideCommand instances
 * Maintains compatibility with existing command registration
 */
export function createHideCommand(): HideCommand {
  return new HideCommand();
}
