/**
 * ShowCommand V2 - Enhanced with parseInput() for RuntimeBase
 * Non-destructive wrapper that extends the original ShowCommand
 */

import { ShowCommand as ShowCommandV1 } from '../../commands/dom/show';
import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface ShowCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Enhanced ShowCommand with parseInput() method for tree-shakable RuntimeBase
 *
 * This wrapper extends the original ShowCommand and adds argument parsing
 * logic that was previously in Runtime.executeCommand().
 */
export class ShowCommand extends ShowCommandV1 {
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
    raw: ShowCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<any[]> {
    // Show command syntax: "show [<target-expression>]"
    // If no args provided, show defaults to 'me' (handled by resolveTargets)

    if (!raw.args || raw.args.length === 0) {
      // No arguments - command will use context.me as default
      return [undefined];
    }

    // Evaluate each argument using the expression evaluator
    // This mirrors Runtime.executeCommand() logic for show (lines 1690-1694):
    //   const showArgs = await Promise.all(
    //     rawArgs.map((arg: ASTNode) => this.execute(arg, context))
    //   );
    const evaluatedArgs = await Promise.all(
      raw.args.map((arg: ASTNode) => evaluator.evaluate(arg, context))
    );

    return evaluatedArgs;
  }

  // execute() is inherited from ShowCommandV1 - no changes needed!
}

/**
 * Factory function for creating ShowCommand instances
 * Maintains compatibility with existing command registration
 */
export function createShowCommand(): ShowCommand {
  return new ShowCommand();
}
