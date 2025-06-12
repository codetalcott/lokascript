/**
 * Hide Command Implementation
 * Hides elements by setting display: none or adding CSS classes
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';

export interface HideCommandOptions {
  useClass?: boolean;
  className?: string;
}

export class HideCommand implements CommandImplementation {
  public readonly name = 'hide';
  public readonly syntax = 'hide [<target-expression>]';
  public readonly isBlocking = false;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private options: HideCommandOptions;

  constructor(options: HideCommandOptions = {}) {
    this.options = {
      useClass: false,
      className: 'hyperscript-hidden',
      ...options,
    };
  }

  async execute(context: ExecutionContext, target?: any): Promise<void> {
    const elements = this.resolveTargets(context, target);
    
    for (const element of elements) {
      await this.hideElement(element, context);
    }
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

  private async hideElement(element: HTMLElement, context: ExecutionContext): Promise<void> {
    if (!element) return;

    try {
      if (this.options.useClass) {
        this.hideWithClass(element);
      } else {
        this.hideWithDisplay(element);
      }

      // Dispatch hide event
      dispatchCustomEvent(element, 'hyperscript:hide', {
        element,
        context,
        command: 'hide',
      });

    } catch (error) {
      console.warn('Error hiding element:', error);
      
      // Dispatch error event
      dispatchCustomEvent(element, 'hyperscript:error', {
        element,
        context,
        command: 'hide',
        error: error as Error,
      });
    }
  }

  private hideWithDisplay(element: HTMLElement): void {
    // Preserve original display value if not already stored
    if (!element.dataset.originalDisplay) {
      const currentDisplay = element.style.display;
      element.dataset.originalDisplay = currentDisplay === 'none' ? '' : currentDisplay;
    }

    // Hide the element
    element.style.display = 'none';
  }

  private hideWithClass(element: HTMLElement): void {
    if (this.options.className) {
      element.classList.add(this.options.className);
    }
  }

  validate(args: any[]): string | null {
    // Hide command is very permissive - most arguments are valid
    if (args.length > 1) {
      return 'Hide command accepts at most one target argument';
    }

    return null;
  }
}