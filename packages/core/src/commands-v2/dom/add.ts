/**
 * AddCommand V2 - Enhanced with parseInput() for RuntimeBase
 * Non-destructive wrapper that extends the original AddCommand
 */

import { AddCommand as AddCommandV1 } from '../../commands/dom/add';
import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface AddCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Enhanced AddCommand with parseInput() method for tree-shakable RuntimeBase
 *
 * This wrapper extends the original AddCommand and adds argument parsing
 * logic that was previously in Runtime.executeCommand().
 */
export class AddCommand extends AddCommandV1 {
  /**
   * Parse raw AST input into class name strings
   *
   * Unlike hide/show, add command does NOT evaluate args to elements.
   * Instead, it extracts class names from selector/class_reference nodes.
   *
   * This method moves the argument parsing logic from Runtime to the command,
   * enabling RuntimeBase to be generic and tree-shakable.
   *
   * @param raw - Raw AST nodes and modifiers from the parser
   * @param evaluator - Expression evaluator (not used for add - we extract strings)
   * @param context - Execution context
   * @returns Array of class name strings ready for execute()
   */
  async parseInput(
    raw: AddCommandRawInput,
    _evaluator: ExpressionEvaluator,
    _context: ExecutionContext
  ): Promise<any[]> {
    // Add command syntax: "add .className [to <target>]"
    // Extract class names from selector nodes without evaluating to elements
    //
    // This mirrors Runtime.executeCommand() logic (lines 1704-1713):
    //   case 'add': {
    //     const addArgs = rawArgs.map((arg: any) => {
    //       if (arg.type === 'selector' || arg.type === 'class_reference') {
    //         return arg.value; // Return the class name string
    //       }
    //       return arg.value || arg.name || arg;
    //     });
    //     return this.executeAddCommand(addArgs, context);
    //   }

    if (!raw.args || raw.args.length === 0) {
      return [];
    }

    const addArgs = raw.args.map((arg: any) => {
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

    return addArgs;
  }

  // execute() is inherited from AddCommandV1 - no changes needed!
}

/**
 * Factory function for creating AddCommand instances
 * Maintains compatibility with existing command registration
 */
export function createAddCommand(): AddCommand {
  return new AddCommand();
}
