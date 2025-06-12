/**
 * Remove Command Implementation
 * Removes CSS classes from elements
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';

export interface RemoveCommandOptions {
  delimiter?: string;
}

export class RemoveCommand implements CommandImplementation {
  public readonly name = 'remove';
  public readonly syntax = 'remove <class-expression> [from <target-expression>]';
  public readonly isBlocking = false;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private options: RemoveCommandOptions;

  constructor(options: RemoveCommandOptions = {}) {
    this.options = {
      delimiter: ' ',
      ...options,
    };
  }

  async execute(context: ExecutionContext, classExpression?: any, target?: any): Promise<void> {
    // Parse arguments - remove command can be called as:
    // remove("class-name", target) or remove("class-name") 
    const classes = this.parseClasses(classExpression);
    const elements = this.resolveTargets(context, target);
    
    if (!classes.length) {
      console.warn('Remove command: No classes provided to remove');
      return;
    }
    
    for (const element of elements) {
      await this.removeClass(element, classes, context);
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

  private async removeClass(element: HTMLElement, classes: string[], context: ExecutionContext): Promise<void> {
    if (!element || !classes.length) return;

    try {
      const removedClasses: string[] = [];
      
      for (const className of classes) {
        if (this.isValidClassName(className)) {
          if (element.classList.contains(className)) {
            element.classList.remove(className);
            removedClasses.push(className);
          }
        } else {
          console.warn(`Remove command: Invalid class name "${className}"`);
        }
      }

      // Only dispatch event if classes were actually removed
      if (removedClasses.length > 0) {
        // Dispatch remove event
        dispatchCustomEvent(element, 'hyperscript:remove', {
          element,
          context,
          command: 'remove',
          classes: removedClasses,
          allClasses: classes,
        });
      }

    } catch (error) {
      console.warn('Error removing classes from element:', error);
      
      // Dispatch error event
      dispatchCustomEvent(element, 'hyperscript:error', {
        element,
        context,
        command: 'remove',
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
      return 'Remove command requires at least one class name';
    }

    if (args.length > 2) {
      return 'Remove command accepts at most two arguments: classes and target';
    }

    // First argument should be class expression
    const classExpression = args[0];
    if (classExpression === null || classExpression === undefined) {
      return 'Remove command requires a class expression';
    }

    return null;
  }
}