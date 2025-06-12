/**
 * Add Command Implementation
 * Adds CSS classes to elements
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';

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
    const classes = this.parseClasses(classExpression);
    const elements = this.resolveTargets(context, target);
    
    if (!classes.length) {
      console.warn('Add command: No classes provided to add');
      return;
    }
    
    for (const element of elements) {
      await this.addClass(element, classes, context);
    }
  }

  private parseClasses(classExpression: any): string[] {
    if (!classExpression) {
      return [];
    }

    if (typeof classExpression === 'string') {
      // Split by various delimiters and filter out empty strings
      return classExpression
        .split(/[\s,]+/)
        .map(cls => cls.trim())
        .filter(cls => cls.length > 0);
    }

    if (Array.isArray(classExpression)) {
      return classExpression
        .map(cls => String(cls).trim())
        .filter(cls => cls.length > 0);
    }

    // Convert other types to string
    return [String(classExpression).trim()].filter(cls => cls.length > 0);
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

    // Handle CSS selector string
    if (typeof target === 'string') {
      const elements = document.querySelectorAll(target);
      return Array.from(elements) as HTMLElement[];
    }

    // Fallback to context.me for invalid targets
    return context.me ? [context.me] : [];
  }

  private async addClass(element: HTMLElement, classes: string[], context: ExecutionContext): Promise<void> {
    if (!element || !classes.length) return;

    try {
      const addedClasses: string[] = [];
      
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