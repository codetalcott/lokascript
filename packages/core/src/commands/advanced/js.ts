/**
 * JS Command Implementation
 * Executes inline JavaScript code with parameter passing and return values
 * Syntax: js([param1, param2, ...]) <javascript_code> end
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class JSCommand implements CommandImplementation {
  name = 'js';
  syntax = 'js([param1, param2, ...]) <javascript_code> end';
  description = 'Execute inline JavaScript code with access to hyperscript context and parameters';
  isBlocking = false;
  hasBody = true;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length === 0) {
      throw new Error('JS command requires JavaScript code to execute');
    }

    let parameters: string[] = [];
    let jsCode: string;

    // Parse arguments: either js(code) or js([params], code)
    if (args.length === 1) {
      // Single argument: just the code
      jsCode = args[0];
    } else if (args.length === 2) {
      // Two arguments: parameters and code
      const [paramArg, codeArg] = args;
      
      if (Array.isArray(paramArg)) {
        parameters = paramArg;
      } else {
        throw new Error('First argument to JS command must be an array of parameter names');
      }
      
      jsCode = codeArg;
    } else {
      throw new Error('JS command accepts 1 or 2 arguments: [parameters], code');
    }

    if (typeof jsCode !== 'string') {
      throw new Error('JavaScript code must be a string');
    }

    // Skip execution if code is empty or only whitespace
    if (!jsCode.trim()) {
      return undefined;
    }

    return this.executeJavaScript(context, parameters, jsCode);
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'JS command requires JavaScript code to execute';
    }

    if (args.length === 1) {
      // Single argument: just code
      if (typeof args[0] !== 'string') {
        return 'JavaScript code must be a string';
      }
    } else if (args.length === 2) {
      // Two arguments: parameters and code
      const [paramArg, codeArg] = args;
      
      if (!Array.isArray(paramArg)) {
        return 'First argument to JS command must be an array of parameter names';
      }
      
      if (typeof codeArg !== 'string') {
        return 'JavaScript code must be a string';
      }
    } else {
      return 'JS command accepts 1 or 2 arguments: [parameters], code';
    }

    return null;
  }

  private async executeJavaScript(context: ExecutionContext, parameters: string[], jsCode: string): Promise<any> {
    try {
      // Resolve parameter values from context
      const parameterValues = parameters.map(paramName => {
        return this.resolveParameter(context, paramName);
      });

      // Create the function body
      const functionBody = this.createFunctionBody(jsCode);
      
      // Create parameter names for the function
      const paramNames = [...parameters, 'me', 'locals', 'context'];
      const paramValues = [...parameterValues, context.me, context.locals, context];

      // Create and execute the function
      const jsFunction = new Function(...paramNames, functionBody);
      const result = jsFunction(...paramValues);

      // Handle async results
      if (result && typeof result.then === 'function') {
        return await result;
      }

      return result;
    } catch (error: any) {
      throw new Error(`JavaScript execution error: ${error.message}`);
    }
  }

  private resolveParameter(context: ExecutionContext, paramName: string): any {
    // Try to resolve from locals first
    if (context.locals?.has(paramName)) {
      return context.locals.get(paramName);
    }

    // Try to resolve from globals
    if (context.globals?.has(paramName)) {
      return context.globals.get(paramName);
    }

    // Check for special context references
    switch (paramName) {
      case 'me':
        return context.me;
      case 'you':
        return context.you;
      case 'it':
        return context.it;
      case 'result':
        return context.result;
      default:
        return undefined;
    }
  }

  private createFunctionBody(jsCode: string): string {
    // Wrap the code to ensure proper return handling
    // If the code doesn't contain a return statement, we don't auto-return
    const trimmedCode = jsCode.trim();
    
    // If code already starts with 'return', use it as-is
    if (trimmedCode.startsWith('return ')) {
      return trimmedCode;
    }
    
    // If code contains 'return' somewhere, use as-is (might be in conditional)
    if (trimmedCode.includes('return ')) {
      return trimmedCode;
    }
    
    // For expression-like code, try to detect if it should auto-return
    // This is a simple heuristic - single line, no assignments, no function calls that look like statements
    const lines = trimmedCode.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 1 && 
        !trimmedCode.includes('=') && 
        !trimmedCode.includes(';') &&
        !trimmedCode.match(/^(if|for|while|function|var|let|const|throw)\s/)) {
      // Looks like a simple expression, auto-return it
      return `return ${trimmedCode}`;
    }
    
    // Otherwise, execute as-is (statements, multi-line, etc.)
    return trimmedCode;
  }
}