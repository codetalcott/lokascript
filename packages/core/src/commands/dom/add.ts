/**
 * Add Command Implementation
 * Adds CSS classes to elements
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';
import { queryAllWithCache, batchDOMOperation } from '../../performance/integration.js';

export interface AddCommandOptions {
  delimiter?: string;
}

export class AddCommand implements CommandImplementation {
  public readonly name = 'add';
  public readonly syntax = 'add <class-expression> [to <target-expression>]';
  public readonly isBlocking = false;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private options: AddCommandOptions;

  constructor(options: AddCommandOptions = {}) {
    this.options = {
      delimiter: ' ',
      ...options,
    };
  }

  async execute(context: ExecutionContext, classExpression?: any, target?: any): Promise<void> {
    // Parse arguments - add command can be called as:
    // add("class-name", target) or add("class-name") 
    // add("[@attr=value]", target) for attributes
    
    const elements = this.resolveTargets(context, target);
    
    if (!elements.length) {
      console.warn('Add command: No target elements found');
      return;
    }
    
    // Check if this is attribute syntax
    if (typeof classExpression === 'string' && this.isAttributeSyntax(classExpression)) {
      await this.addAttributes(elements, classExpression, context);
    } else {
      // Handle as CSS classes
      const classes = this.parseClasses(classExpression);
      if (!classes.length) {
        console.warn('Add command: No classes provided to add');
        return;
      }
      
      for (const element of elements) {
        await this.addClass(element, classes, context);
      }
    }
  }

  private parseClasses(classExpression: any): string[] {
    if (!classExpression) {
      return [];
    }

    if (typeof classExpression === 'string') {
      // Handle hyperscript class syntax like '.class-name'
      const cleanExpression = classExpression.trim();
      
      // Check if this is an attribute syntax like [@data-test="value"]
      if (cleanExpression.startsWith('[@') && cleanExpression.endsWith(']')) {
        // This is attribute syntax, not class syntax - return empty for now
        // TODO: Handle attribute syntax in a separate method
        return [];
      }
      
      // Split by various delimiters and clean up class names
      return cleanExpression
        .split(/[\s,]+/)
        .map(cls => {
          // Remove leading dot from CSS class selectors
          const trimmed = cls.trim();
          return trimmed.startsWith('.') ? trimmed.substring(1) : trimmed;
        })
        .filter(cls => cls.length > 0 && this.isValidClassName(cls));
    }

    if (Array.isArray(classExpression)) {
      return classExpression
        .map(cls => {
          const trimmed = String(cls).trim();
          return trimmed.startsWith('.') ? trimmed.substring(1) : trimmed;
        })
        .filter(cls => cls.length > 0 && this.isValidClassName(cls));
    }

    // Convert other types to string
    const str = String(classExpression).trim();
    const cleanStr = str.startsWith('.') ? str.substring(1) : str;
    return cleanStr.length > 0 && this.isValidClassName(cleanStr) ? [cleanStr] : [];
  }

  private resolveTargets(context: ExecutionContext, target?: any): HTMLElement[] {
    // If no target specified, use implicit target (me)
    if (target === undefined || target === null) {
      return context.me ? [context.me] : [];
    }

    // Handle HTMLElement
    if (target instanceof HTMLElement) {
      return [target];
    }

    // Handle NodeList or HTMLCollection
    if (target instanceof NodeList || target instanceof HTMLCollection) {
      return Array.from(target) as HTMLElement[];
    }

    // Handle Array of elements
    if (Array.isArray(target)) {
      return target.filter(item => item instanceof HTMLElement) as HTMLElement[];
    }

    // Handle CSS selector string with caching
    if (typeof target === 'string') {
      const elements = queryAllWithCache(target);
      return elements as HTMLElement[];
    }

    // Fallback to context.me for invalid targets
    return context.me ? [context.me] : [];
  }

  private async addClass(element: HTMLElement, classes: string[], context: ExecutionContext): Promise<void> {
    if (!element || !classes.length) return;

    try {
      const addedClasses: string[] = [];
      
      // Add classes directly (DOM classList operations are already efficient)
      for (const className of classes) {
        if (this.isValidClassName(className)) {
          if (!element.classList.contains(className)) {
            element.classList.add(className);
            addedClasses.push(className);
          }
        } else {
          console.warn(`Add command: Invalid class name "${className}"`);
        }
      }

      // Only dispatch event if classes were actually added
      if (addedClasses.length > 0) {
        // Dispatch add event
        dispatchCustomEvent(element, 'hyperscript:add', {
          element,
          context,
          command: 'add',
          classes: addedClasses,
          allClasses: classes,
        });
      }

    } catch (error) {
      console.warn('Error adding classes to element:', error);
      
      // Dispatch error event
      dispatchCustomEvent(element, 'hyperscript:error', {
        element,
        context,
        command: 'add',
        error: error as Error,
        classes,
      });
    }
  }

  private isAttributeSyntax(expression: string): boolean {
    const trimmed = expression.trim();
    return trimmed.startsWith('[@') && trimmed.endsWith(']');
  }

  private async addAttributes(elements: HTMLElement[], attributeExpression: string, context: ExecutionContext): Promise<void> {
    const attributes = this.parseAttributes(attributeExpression);
    
    for (const element of elements) {
      for (const [name, value] of attributes) {
        try {
          element.setAttribute(name, value);
          
          // Dispatch add attribute event
          dispatchCustomEvent(element, 'hyperscript:add', {
            element,
            context,
            command: 'add',
            type: 'attribute',
            attribute: { name, value },
          });
        } catch (error) {
          console.warn(`Error setting attribute ${name}="${value}":`, error);
          
          // Dispatch error event
          dispatchCustomEvent(element, 'hyperscript:error', {
            element,
            context,
            command: 'add',
            error: error as Error,
            attribute: { name, value },
          });
        }
      }
    }
  }

  private parseAttributes(attributeExpression: string): Array<[string, string]> {
    // Parse [@data-test="value"] or [@data-test=value] syntax
    const trimmed = attributeExpression.trim();
    
    // Remove [@ and ] brackets
    const inner = trimmed.slice(2, -1);
    
    // Split on = to get name and value
    const equalIndex = inner.indexOf('=');
    if (equalIndex === -1) {
      // No value, treat as boolean attribute
      return [[inner.trim(), '']];
    }
    
    const name = inner.slice(0, equalIndex).trim();
    let value = inner.slice(equalIndex + 1).trim();
    
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    return [[name, value]];
  }

  private isValidClassName(className: string): boolean {
    // CSS class names must not be empty and must not contain invalid characters
    if (!className || className.trim().length === 0) {
      return false;
    }

    // Check for basic CSS class name validity
    // Class names cannot start with a digit or contain certain special characters
    const cssClassNameRegex = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/;
    return cssClassNameRegex.test(className.trim());
  }

  validate(args: any[]): string | null {
    if (args.length === 0) {
      return 'Add command requires at least one class name';
    }

    if (args.length > 2) {
      return 'Add command accepts at most two arguments: classes and target';
    }

    // First argument should be class expression
    const classExpression = args[0];
    if (classExpression === null || classExpression === undefined) {
      return 'Add command requires a class expression';
    }

    return null;
  }
}