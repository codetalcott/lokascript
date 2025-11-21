/**
 * RemoveCommand V2 - Enhanced with parseInput() for RuntimeBase
 * Non-destructive wrapper that extends the original RemoveCommand
 */

import { RemoveCommand as RemoveCommandV1 } from '../../commands/dom/remove';
import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface RemoveCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Enhanced RemoveCommand with parseInput() method for tree-shakable RuntimeBase
 *
 * This wrapper extends the original RemoveCommand and adds argument parsing
 * logic that was previously in Runtime.executeCommand().
 */
export class RemoveCommand extends RemoveCommandV1 {
  /**
   * Parse raw AST input into class name strings
   *
   * Like add command, remove command does NOT evaluate args to elements.
   * Instead, it extracts class names from selector/class_reference nodes.
   *
   * This method moves the argument parsing logic from Runtime to the command,
   * enabling RuntimeBase to be generic and tree-shakable.
   *
   * @param raw - Raw AST nodes and modifiers from the parser
   * @param evaluator - Expression evaluator (not used for remove - we extract strings)
   * @param context - Execution context
   * @returns Array of class name strings ready for execute()
   */
  async parseInput(
    raw: RemoveCommandRawInput,
    _evaluator: ExpressionEvaluator,
    _context: ExecutionContext
  ): Promise<any[]> {
    // Remove command syntax: "remove .className [from <target>]"
    // Extract class names from selector nodes without evaluating to elements
    //
    // This mirrors Runtime.executeCommand() logic (lines 1715-1724):
    //   case 'remove': {
    //     const removeArgs = rawArgs.map((arg: any) => {
    //       if (arg.type === 'selector' || arg.type === 'class_reference') {
    //         return arg.value; // Return the class name string
    //       }
    //       return arg.value || arg.name || arg;
    //     });
    //     return this.executeRemoveCommand(removeArgs, context);
    //   }

    if (!raw.args || raw.args.length === 0) {
      return [];
    }

    const removeArgs = raw.args.map((arg: any) => {
      // Handle selector nodes (e.g., .className)
      if (arg.type === 'selector' || arg.type === 'class_reference') {
        // Return the class name string (strip leading . if present)
        const className = arg.value;
        return className.startsWith('.') ? className.slice(1) : className;
      }

      // Handle literal values
      if (arg.type === 'literal') {
        const value = arg.value;
        return typeof value === 'string' && value.startsWith('.')
          ? value.slice(1)
          : value;
      }

      // Fallback: try to extract a string value
      return arg.value || arg.name || arg;
    });

    return removeArgs;
  }

  // execute() is inherited from RemoveCommandV1 - no changes needed!
}

/**
 * Factory function for creating RemoveCommand instances
 * Maintains compatibility with existing command registration
 */
export function createRemoveCommand(): RemoveCommand {
  return new RemoveCommand();
}
