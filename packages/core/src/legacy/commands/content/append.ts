/**
 * Append Command Implementation
 * The append command adds a string value to the end of another string, array, or HTML Element.
 * If no target variable is defined, then the standard result variable is used by default.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class AppendCommand implements CommandImplementation {
  name = 'append';
  syntax = 'append <string> [to <string> | <array> | <HTML Element>]';
  description = 'The append command adds a string value to the end of another string, array, or HTML Element. If no target variable is defined, then the standard result variable is used by default.';
  isBlocking = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length === 0) {
      throw new Error('Append command requires content to append');
    }

    const [content, toKeyword, targetRef] = args;

    // Convert content to string
    const contentStr = content == null ? String(content) : String(content);

    // If no target specified, append to result variable (it)
    if (args.length === 1) {
      if (context.it === undefined) {
        context.it = contentStr;
      } else {
        context.it = String(context.it) + contentStr;
      }
      return context.it;
    }

    // Validate "to" keyword
    if (toKeyword !== 'to') {
      throw new Error('Append command requires "to" keyword when specifying target');
    }

    if (args.length < 3) {
      throw new Error('Append command requires target after "to" keyword');
    }

    // Handle different target types based on targetRef type first
    if (typeof targetRef === 'string') {
      // Check if this is a CSS selector  
      if (targetRef.startsWith('#') || targetRef.startsWith('.') || targetRef.includes('[')) {
        // Resolve DOM element
        const element = this.resolveDOMElement(targetRef, context);
        element.innerHTML += contentStr;
        return element;
      }
      
      // Check if this is a context reference
      if (targetRef === 'me' || targetRef === 'it' || targetRef === 'you') {
        const contextTarget = this.resolveContextReference(targetRef, context);
        if (contextTarget instanceof HTMLElement) {
          contextTarget.innerHTML += contentStr;
          return contextTarget;
        }
        // Handle other context types...
      }
      
      // Check if this is a variable name or literal
      const variableExists = this.variableExists(targetRef, context);
      
      if (variableExists) {
        // Handle existing variable assignment
        const currentValue = this.getVariableValue(targetRef, context);
        
        // Special handling for arrays
        if (Array.isArray(currentValue)) {
          currentValue.push(content);
          return currentValue;
        }
        
        // Handle strings and other types
        const newValue = (currentValue == null ? '' : String(currentValue)) + contentStr;
        this.setVariableValue(targetRef, newValue, context);
        return newValue;
      } else if (this.isVariableName(targetRef)) {
        // Create new variable
        this.setVariableValue(targetRef, contentStr, context);
        return contentStr;
      } else {
        // Handle literal string - append and set result
        const newValue = String(targetRef) + contentStr;
        context.it = newValue;
        return newValue;
      }
    } else {
      // Direct object target (array, element, etc.)
      const target = targetRef;
      
      if (Array.isArray(target)) {
        target.push(content);
        return target;
      } else if (target instanceof HTMLElement) {
        target.innerHTML += contentStr;
        return target;
      } else {
        // Convert to string and return
        const newValue = String(target) + contentStr;
        return newValue;
      }
    }
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Append command requires content to append';
    }

    // Single argument (content only) is valid
    if (args.length === 1) {
      return null;
    }

    // If more than one argument, must have "to" keyword
    if (args.length >= 2 && args[1] !== 'to') {
      return 'Append command requires "to" keyword when specifying target';
    }

    // Must have target after "to"
    if (args.length === 2) {
      return 'Append command requires target after "to" keyword';
    }

    return null;
  }

  private resolveTarget(targetRef: any, context: ExecutionContext): any {
    // If target is already an object (element, array, etc.), return it directly
    if (typeof targetRef === 'object' && targetRef !== null) {
      return targetRef;
    }

    // If target is a string, resolve it
    if (typeof targetRef === 'string') {
      // Handle context references
      if (targetRef === 'me' && context.me) {
        return context.me;
      } else if (targetRef === 'it' && context.it) {
        return context.it;
      } else if (targetRef === 'you' && context.you) {
        return context.you;
      }

      // Handle CSS selectors
      if (targetRef.startsWith('#') || targetRef.startsWith('.') || targetRef.includes('[')) {
        if (typeof document !== 'undefined') {
          const element = document.querySelector(targetRef);
          if (!element) {
            throw new Error(`Target element not found: ${targetRef}`);
          }
          return element;
        }
        // In test environment, try to find from global mock
        if ((global as any).document && (global as any).document.querySelector) {
          const element = (global as any).document.querySelector(targetRef);
          if (!element) {
            throw new Error(`Target element not found: ${targetRef}`);
          }
          return element;
        }
        throw new Error(`Target element not found: ${targetRef}`);
      }

      // Get variable value for manipulation
      return this.getVariableValue(targetRef, context);
    }

    return targetRef;
  }

  private getVariableValue(name: string, context: ExecutionContext): any {
    // Check local variables first
    if (context.locals && context.locals.has(name)) {
      return context.locals.get(name);
    }

    // Check global variables
    if (context.globals && context.globals.has(name)) {
      return context.globals.get(name);
    }

    // Check element scope
    if (context.elementScope && context.elementScope.has(name)) {
      return context.elementScope.get(name);
    }

    // Variable doesn't exist yet
    return undefined;
  }

  private setVariableValue(name: string, value: any, context: ExecutionContext): void {
    // If variable exists in local scope, update it
    if (context.locals && context.locals.has(name)) {
      context.locals.set(name, value);
      return;
    }

    // If variable exists in global scope, update it  
    if (context.globals && context.globals.has(name)) {
      context.globals.set(name, value);
      return;
    }

    // If variable exists in element scope, update it
    if (context.elementScope && context.elementScope.has(name)) {
      context.elementScope.set(name, value);
      return;
    }

    // Create new local variable
    if (!context.locals) {
      context.locals = new Map();
    }
    context.locals.set(name, value);
  }

  private variableExists(name: string, context: ExecutionContext): boolean {
    return (
      (context.locals && context.locals.has(name)) ||
      (context.globals && context.globals.has(name)) ||
      (context.elementScope && context.elementScope.has(name))
    );
  }

  private isVariableName(name: string): boolean {
    // Simple heuristic: if it doesn't look like a CSS selector or literal string,
    // treat it as a potential variable name
    if (name.startsWith('#') || name.startsWith('.') || name.includes('[')) {
      return false;
    }
    
    // If it contains spaces or special characters, it's likely a literal
    if (/\s|[<>{}()"]/.test(name)) {
      return false;
    }
    
    // Simple variable name pattern
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
  }

  private resolveDOMElement(selector: string, context: ExecutionContext): HTMLElement {
    if (typeof document !== 'undefined') {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Target element not found: ${selector}`);
      }
      return element as HTMLElement;
    }
    
    // In test environment
    if ((global as any).document && (global as any).document.querySelector) {
      const element = (global as any).document.querySelector(selector);
      if (!element) {
        throw new Error(`Target element not found: ${selector}`);
      }
      return element as HTMLElement;
    }
    
    throw new Error(`Target element not found: ${selector}`);
  }

  private resolveContextReference(ref: string, context: ExecutionContext): any {
    switch (ref) {
      case 'me':
        return context.me;
      case 'it':
        return context.it;
      case 'you':
        return context.you;
      default:
        return undefined;
    }
  }
}

export default AppendCommand;