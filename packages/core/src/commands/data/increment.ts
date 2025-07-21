/**
 * Increment Command Implementation  
 * Increases the value of a variable or element property by a specified amount
 * 
 * Syntax: increment <target> [by <number>]
 * 
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class IncrementCommand implements CommandImplementation {
  name = 'increment';
  syntax = 'increment <target> [by <number>]';
  description = 'The increment command adds to an existing variable, property, or attribute. It defaults to adding the value 1, but this can be changed using the by modifier. If the target variable is null, then it is assumed to be 0, and then incremented by the specified amount. The increment command is the opposite of the decrement command command.';
  isBlocking = false;
  hasBody = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length === 0) {
      throw new Error('Increment command requires a target');
    }

    // Check for null target
    if (args[0] === null || args[0] === undefined) {
      throw new Error('Cannot increment null or undefined target');
    }

    // Parse arguments to handle different syntaxes
    const parsedArgs = this.parseArguments(args);
    
    // Get current value
    const currentValue = this.getCurrentValue(parsedArgs.target, parsedArgs.property, parsedArgs.scope, context);
    const newValue = this.performIncrement(currentValue, parsedArgs.amount);
    
    // Set the new value
    this.setTargetValue(parsedArgs.target, parsedArgs.property, parsedArgs.scope, newValue, context);
    
    // Set result in context
    context.it = newValue;
    
    return newValue;
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Increment command requires a target';
    }

    if (args.length === 1) {
      // Just target, this is valid (increment by 1)
      return null;
    }

    if (args.length >= 2) {
      // Should have "by" keyword if more than one argument
      if (args[1] !== 'by') {
        return 'Increment command requires "by" keyword when specifying amount';
      }
      
      if (args.length === 2) {
        return 'Increment command requires amount after "by" keyword';
      }
      
      // Validate the amount is numeric
      const amount = args[2];
      if (typeof amount !== 'number' && (typeof amount !== 'string' || isNaN(parseFloat(amount)))) {
        return 'Increment command requires numeric amount after "by" keyword';
      }
    }

    return null;
  }

  private parseArguments(args: any[]): { target: any; property?: string; scope?: string; amount: number } {
    let target: any;
    let property: string | undefined;
    let scope: string | undefined;
    let amount = 1; // Default increment
    
    // Handle different argument patterns
    if (args[0] === 'global') {
      // Pattern: increment global variableName [by amount]
      scope = 'global';
      target = args[1];
      
      // Look for "by" keyword
      const byIndex = args.indexOf('by');
      if (byIndex !== -1 && byIndex + 1 < args.length) {
        amount = this.parseAmount(args[byIndex + 1]);
      }
    } else if (args[0] && typeof args[0] === 'object') {
      // Pattern: increment element/object property/attribute [by amount]
      target = args[0]; // HTMLElement or object
      property = args[1]; // property/attribute name
      
      // Look for "by" keyword  
      const byIndex = args.indexOf('by');
      if (byIndex !== -1 && byIndex + 1 < args.length) {
        amount = this.parseAmount(args[byIndex + 1]);
      }
    } else {
      // Pattern: increment variableName [by amount]
      target = args[0];
      
      // Look for "by" keyword
      const byIndex = args.indexOf('by');
      if (byIndex !== -1 && byIndex + 1 < args.length) {
        amount = this.parseAmount(args[byIndex + 1]);
      }
    }
    
    return { target, property, scope, amount };
  }
  
  private parseAmount(amountArg: any): number {
    if (typeof amountArg === 'number') {
      return amountArg;
    }
    
    if (typeof amountArg === 'string') {
      const parsed = parseFloat(amountArg);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    
    return 1; // Default fallback
  }

  private getCurrentValue(target: any, property: string | undefined, scope: string | undefined, context: ExecutionContext): number {
    // Handle direct values
    if (typeof target === 'number') {
      return target;
    }
    
    // Handle element/object property/attribute access
    if (target && typeof target === 'object' && property) {
      // Check if it's an HTMLElement with attributes
      if (target.nodeType && (property.startsWith('data-') || ['id', 'class', 'title', 'alt', 'src', 'href'].includes(property))) {
        const value = target.getAttribute(property);
        return this.convertToNumber(value);
      } else {
        // It's a property (on element or regular object)
        const value = target[property];
        return this.convertToNumber(value);
      }
    }
    
    if (typeof target === 'string') {
      // Handle scoped variables
      if (scope === 'global') {
        const value = this.getVariableValue(target, context, 'global');
        return this.convertToNumber(value);
      }
      
      // Check for element property references (e.g., "me.value", "element.scrollTop")
      if (target.includes('.')) {
        return this.getElementProperty(target, context);
      }
      
      // Check context references
      if (target === 'me' && context.me) {
        return this.convertToNumber((context.me as any).value || 0);
      } else if (target === 'it') {
        return this.convertToNumber(context.it || 0);
      } else if (target === 'you' && context.you) {
        return this.convertToNumber((context.you as any).value || 0);
      }
      
      // Try to get variable value
      const value = this.getVariableValue(target, context);
      return this.convertToNumber(value);
    }
    
    // Handle object/element references  
    if (target && typeof target === 'object') {
      if (target instanceof HTMLElement) {
        return this.convertToNumber(target.textContent || '0');
      }
      // For objects, try to convert to number
      return this.convertToNumber(target);
    }
    
    return this.convertToNumber(target);
  }

  private performIncrement(currentValue: number, incrementBy: number): number {
    // If current value is NaN, preserve NaN (tests expect this)
    if (isNaN(currentValue)) {
      return NaN;
    }
    
    // Handle special cases for incrementBy
    if (!isFinite(incrementBy)) {
      incrementBy = 1;
    }
    
    return currentValue + incrementBy;
  }

  private setTargetValue(target: any, property: string | undefined, scope: string | undefined, newValue: number, context: ExecutionContext): void {
    // Handle element/object property/attribute updates
    if (target && typeof target === 'object' && property) {
      // Check if it's an HTMLElement with attributes
      if (target.nodeType && (property.startsWith('data-') || ['id', 'class', 'title', 'alt', 'src', 'href'].includes(property))) {
        target.setAttribute(property, String(newValue));
      } else {
        // It's a property (on element or regular object)
        target[property] = newValue;
      }
      return;
    }
    
    if (typeof target === 'string') {
      // Handle scoped variables
      if (scope === 'global') {
        this.setVariableValue(target, newValue, context, 'global');
        return;
      }
      
      // Handle element property references
      if (target.includes('.')) {
        this.setElementProperty(target, newValue, context);
        return;
      }
      
      // Handle context references
      if (target === 'me' && context.me) {
        (context.me as any).value = newValue;
        return;
      } else if (target === 'it') {
        context.it = newValue;
        return;
      } else if (target === 'you' && context.you) {
        (context.you as any).value = newValue;
        return;
      }
      
      // Set variable value
      this.setVariableValue(target, newValue, context);
    } else if (target instanceof HTMLElement) {
      target.textContent = String(newValue);
    }
  }

  private getElementProperty(propertyPath: string, context: ExecutionContext): number {
    const parts = propertyPath.split('.');
    const elementRef = parts[0];
    const property = parts[1];
    
    let element: any = null;
    
    // Resolve element reference
    if (elementRef === 'me') {
      element = context.me;
    } else if (elementRef === 'it') {
      element = context.it;
    } else if (elementRef === 'you') {
      element = context.you;
    } else {
      // Try to resolve as variable
      element = this.getVariableValue(elementRef, context);
    }
    
    if (!element) {
      return 0;
    }
    
    // Get property value
    const value = element[property];
    return this.convertToNumber(value);
  }

  private setElementProperty(propertyPath: string, value: number, context: ExecutionContext): void {
    const parts = propertyPath.split('.');
    const elementRef = parts[0];
    const property = parts[1];
    
    let element: any = null;
    
    // Resolve element reference
    if (elementRef === 'me') {
      element = context.me;
    } else if (elementRef === 'it') {
      element = context.it;
    } else if (elementRef === 'you') {
      element = context.you;
    } else {
      // Try to resolve as variable
      element = this.getVariableValue(elementRef, context);
    }
    
    if (element) {
      element[property] = value;
    }
  }

  private convertToNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    
    if (typeof value === 'number') {
      return isFinite(value) ? value : 0;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      // If it's NaN (invalid string), return NaN to preserve the test expectation
      return parsed;
    }
    
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    
    if (Array.isArray(value)) {
      return value.length;
    }
    
    if (typeof value === 'object') {
      // Try to get length or valueOf
      if ('length' in value && typeof value.length === 'number') {
        return value.length;
      }
      if (typeof value.valueOf === 'function') {
        const result = value.valueOf();
        if (typeof result === 'number') {
          return result;
        }
      }
      // Return NaN for objects that can't be converted, to match test expectations
      return NaN;
    }
    
    return 0;
  }

  private getVariableValue(name: string, context: ExecutionContext, preferredScope?: string): any {
    // If preferred scope is specified, check that first
    if (preferredScope === 'global' && context.globals && context.globals.has(name)) {
      return context.globals.get(name);
    }
    
    // Check local variables first (unless global is preferred)
    if (preferredScope !== 'global' && context.locals && context.locals.has(name)) {
      return context.locals.get(name);
    }
    
    // Check element scope
    if ((context as any).elementScope && (context as any).elementScope.has(name)) {
      return (context as any).elementScope.get(name);
    }
    
    // Check global variables
    if (context.globals && context.globals.has(name)) {
      return context.globals.get(name);
    }
    
    // Check general variables  
    if (context.variables && context.variables.has(name)) {
      return context.variables.get(name);
    }
    
    // Check local variables as fallback
    if (preferredScope === 'global' && context.locals && context.locals.has(name)) {
      return context.locals.get(name);
    }
    
    // Return undefined if not found (will be converted to 0)
    return undefined;
  }

  private setVariableValue(name: string, value: number, context: ExecutionContext, preferredScope?: string): void {
    // If preferred scope is specified, handle it
    if (preferredScope === 'global') {
      if (!context.globals) {
        context.globals = new Map();
      }
      context.globals.set(name, value);
      return;
    }
    
    // If variable exists in local scope, update it
    if (context.locals && context.locals.has(name)) {
      context.locals.set(name, value);
      return;
    }
    
    // If variable exists in element scope, update it
    if ((context as any).elementScope && (context as any).elementScope.has(name)) {
      (context as any).elementScope.set(name, value);
      return;
    }
    
    // If variable exists in global scope, update it
    if (context.globals && context.globals.has(name)) {
      context.globals.set(name, value);
      return;
    }
    
    // If variable exists in general variables, update it
    if (context.variables && context.variables.has(name)) {
      context.variables.set(name, value);
      return;
    }
    
    // Create new local variable
    if (!context.locals) {
      context.locals = new Map();
    }
    context.locals.set(name, value);
  }

  private resolveValue(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      return this.getVariableValue(value, context);
    }
    return value;
  }
}

export default IncrementCommand;