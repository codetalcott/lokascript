/**
 * Call Command Implementation
 * The call command allows you evaluate an expression.
 * The value of this expression will be put into the it variable.
 * get is an alias for call and can be used if it more clearly expresses the meaning of the code.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class CallCommand implements CommandImplementation {
  name = 'call';
  syntax = 'call <expression>\nget <expression>';
  description = 'The call command allows you evaluate an expression.\nThe value of this expression will be put into the it variable.\nget is an alias for call and can be used if it more clearly expresses the meaning of the code.';
  isBlocking = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length === 0) {
      throw new Error('Call command requires an expression to evaluate');
    }

    const [expression] = args;
    
    try {
      let result: any;

      // Handle function expressions
      if (typeof expression === 'function') {
        result = expression();
        
        // Handle async functions and promises
        if (result instanceof Promise) {
          result = await result;
        }
      }
      // Handle Promise objects directly
      else if (expression instanceof Promise) {
        result = await expression;
      }
      // Handle literal values (strings, numbers, booleans, objects, etc.)
      else {
        result = expression;
      }

      // Set the result in the 'it' context variable
      context.it = result;
      
      return result;
    } catch (error) {
      // Re-throw the error without modifying the it variable
      throw error;
    }
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Call command requires an expression to evaluate';
    }
    
    // Accept any type of expression
    return null;
  }
}

export default CallCommand;