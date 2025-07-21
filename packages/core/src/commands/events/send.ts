/**
 * Send Command Implementation
 * The send command sends an event to the given target. Arguments can optionally be provided
 * in a named argument list and will be passed in the event.detail object.
 * You can alternatively use the equivalent trigger syntax.
 * Generated from LSP data with TDD implementation
 */

import { CommandImplementation, ExecutionContext } from '../../types/core';

export class SendCommand implements CommandImplementation {
  name = 'send';
  syntax = 'send <event-name>[(<named arguments>)] [to <expression>]\ntrigger <event-name>[(<named arguments>)] [on <expression>]';
  description = 'The send command sends an event to the given target. Arguments can optionally be provided in a named argument list and will be passed in the event.detail object.\nYou can alternatively use the equivalent trigger syntax.';
  isBlocking = false;
  hasBody = false;

  async execute(context: ExecutionContext, ...args: any[]): Promise<any> {
    if (args.length === 0) {
      throw new Error('Send command requires an event name');
    }

    const [eventName, ...rest] = args;
    
    // Parse arguments for event details and target
    let eventDetail: any = {};
    let target: any = null;
    let targetKeyword: string | null = null;

    // Find target keyword position
    let targetKeywordIndex = -1;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === 'to' || rest[i] === 'on') {
        targetKeywordIndex = i;
        targetKeyword = rest[i];
        target = rest[i + 1];
        break;
      }
    }

    // Parse event detail arguments (everything before the target keyword)
    const detailArgs = targetKeywordIndex >= 0 ? rest.slice(0, targetKeywordIndex) : rest;
    
    for (const arg of detailArgs) {
      if (arg === null || arg === undefined) {
        continue; // Skip null/undefined arguments
      }
      
      if (typeof arg === 'object' && !Array.isArray(arg)) {
        eventDetail = { ...eventDetail, ...arg };
      } else if (typeof arg === 'string' && arg.includes(':')) {
        // Parse name:value pairs
        const [key, value] = arg.split(':');
        eventDetail[key] = this.parseValue(value);
      }
      // Skip other types of arguments that aren't event details
    }

    // Resolve the target element(s)
    let targetElements: HTMLElement[] = [];
    
    if (target) {
      targetElements = this.resolveTargets(target, context);
    } else {
      // Default to current element (me)
      if (context.me) {
        targetElements = [context.me];
      } else {
        throw new Error('No target element available for event dispatch');
      }
    }

    // Create and dispatch the event
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: Object.keys(eventDetail).length > 0 ? eventDetail : {}
    });

    let dispatchedCount = 0;
    for (const element of targetElements) {
      try {
        element.dispatchEvent(event);
        dispatchedCount++;
      } catch (error) {
        console.warn(`Failed to dispatch event ${eventName} to element:`, error);
      }
    }

    // Store result in context
    context.it = event;

    return event;
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Send command requires an event name';
    }

    const [eventName] = args;
    if (typeof eventName !== 'string' || !eventName.trim()) {
      return 'Event name must be a non-empty string';
    }

    // Check for proper keyword usage
    let toIndex = -1;
    let onIndex = -1;
    
    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'to') {
        toIndex = i;
      } else if (args[i] === 'on') {
        onIndex = i;
      }
    }

    // Can't have both 'to' and 'on'
    if (toIndex !== -1 && onIndex !== -1) {
      return 'Cannot use both "to" and "on" keywords in the same send command';
    }

    // If 'to' or 'on' is used, must have a target
    if ((toIndex !== -1 && toIndex === args.length - 1) || 
        (onIndex !== -1 && onIndex === args.length - 1)) {
      return 'Send command requires a target after "to" or "on" keyword';
    }

    return null;
  }

  private parseValue(value: string): any {
    // Try to parse as number
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^\d*\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    
    // Try to parse as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Try to parse as null/undefined
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    
    // Return as string (removing quotes if present)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    return value;
  }

  private resolveTargets(target: any, context: ExecutionContext): HTMLElement[] {
    // If target is already an element, return it
    if (target instanceof HTMLElement) {
      return [target];
    }

    // If target is a NodeList or array of elements
    if (target instanceof NodeList) {
      return Array.from(target) as HTMLElement[];
    }
    if (Array.isArray(target)) {
      return target.filter(item => item instanceof HTMLElement);
    }

    // If target is a string, resolve it
    if (typeof target === 'string') {
      // Handle context references
      if (target === 'me' && context.me) {
        return [context.me];
      } else if (target === 'you' && context.you) {
        return [context.you];
      } else if (target === 'it' && context.it instanceof HTMLElement) {
        return [context.it];
      }

      // Handle variable references
      const variable = this.getVariableValue(target, context);
      if (variable instanceof HTMLElement) {
        return [variable];
      }
      if (variable instanceof NodeList) {
        return Array.from(variable) as HTMLElement[];
      }
      if (Array.isArray(variable)) {
        return variable.filter(item => item instanceof HTMLElement);
      }

      // Handle CSS selectors
      if (this.isCSSSelector(target)) {
        const elements = this.querySelectorAll(target);
        if (elements.length === 0) {
          throw new Error(`Target element not found: ${target}`);
        }
        return elements;
      }

      // If it's a tag selector like <form />
      if (target.startsWith('<') && target.endsWith('/>')) {
        const tagName = target.slice(1, -2).split(/[\s\.#]/)[0];
        return this.querySelectorAll(tagName);
      }
    }

    throw new Error(`Unable to resolve target: ${target}`);
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

    // Check general variables
    if (context.variables && context.variables.has(name)) {
      return context.variables.get(name);
    }

    return undefined;
  }

  private isCSSSelector(selector: string): boolean {
    // Common patterns for CSS selectors
    return selector.startsWith('#') || 
           selector.startsWith('.') || 
           selector.includes('[') || 
           selector.includes(':') ||
           /^[a-zA-Z][a-zA-Z0-9]*$/.test(selector); // Simple tag selector
  }

  private querySelectorAll(selector: string): HTMLElement[] {
    try {
      if (typeof document !== 'undefined') {
        // For single element selectors like #id, use querySelector first
        if (selector.startsWith('#') && !selector.includes(' ')) {
          const element = document.querySelector(selector);
          return element ? [element as HTMLElement] : [];
        }
        
        const elements = document.querySelectorAll(selector);
        return Array.from(elements) as HTMLElement[];
      }
      
      // In test environment, try to use mock document
      if ((global as any).document) {
        if (selector.startsWith('#') && !selector.includes(' ') && (global as any).document.querySelector) {
          const element = (global as any).document.querySelector(selector);
          return element ? [element as HTMLElement] : [];
        }
        
        if ((global as any).document.querySelectorAll) {
          const elements = (global as any).document.querySelectorAll(selector);
          return Array.from(elements) as HTMLElement[];
        }
      }
      
      return [];
    } catch (error) {
      throw new Error(`Invalid CSS selector: ${selector}`);
    }
  }
}

export default SendCommand;