/**
 * Return Command Implementation
 * The return command returns a value from a function in hyperscript or stops an event handler from continuing.
 * You may use the exit form to return no value.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class ReturnCommand implements CommandImplementation {
  name = 'return';
  syntax = 'return <expression> | exit';
  description = 'The return command returns a value from a function in hyperscript or stops an event handler from continuing. You may use the exit form to return no value.';
  isBlocking = true; // Control flow command that exits execution

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    // Initialize flags if not present
    if (!context.flags) {
      context.flags = {
        halted: false,
        breaking: false,
        continuing: false,
        returning: false,
        async: false
      };
    }

    let returnValue: any;

    // Handle different argument patterns
    if (args.length === 0) {
      // Form: return (exit form - return undefined)
      returnValue = undefined;
    } else if (args.length === 1) {
      const arg = args[0];
      if (arg === 'exit') {
        // Explicit exit form
        returnValue = undefined;
      } else {
        // Form: return <expression>
        returnValue = arg;
      }
    } else {
      // Invalid: too many arguments
      throw new Error(`Return command accepts at most one argument, got ${args.length}`);
    }

    // Set the return flag to indicate execution should stop
    context.flags.returning = true;
    
    // Store the return value in the context for the runtime to handle
    context.returnValue = returnValue;

    // Return the value for immediate use
    return returnValue;
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      // Exit form is valid
      return null;
    }

    if (args.length === 1) {
      // Single argument (return value or 'exit') is valid
      return null;
    }

    // More than one argument is invalid
    return 'Return command accepts at most one argument';
  }
}

export default ReturnCommand;