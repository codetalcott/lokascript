/**
 * Show Command Implementation
 * Shows elements by restoring display or removing CSS classes
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';

export interface ShowCommandOptions {
  useClass?: boolean;
  className?: string;
  defaultDisplay?: string;
}

export class ShowCommand implements CommandImplementation {
  public readonly name = 'show';
  public readonly syntax = 'show [<target-expression>]';
  public readonly isBlocking = false;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private options: ShowCommandOptions;

  constructor(options: ShowCommandOptions = {}) {
    this.options = {
      useClass: false,
      className: 'hyperscript-hidden',
      defaultDisplay: 'block',
      ...options,
    };
  }

  async execute(context: ExecutionContext, target?: any): Promise<void> {
    const elements = this.resolveTargets(context, target);
    
    for (const element of elements) {
      await this.showElement(element, context);
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

  private async showElement(element: HTMLElement, context: ExecutionContext): Promise<void> {
    if (!element) return;

    try {
      if (this.options.useClass) {
        this.showWithClass(element);
      } else {
        this.showWithDisplay(element);
      }

      // Dispatch show event
      dispatchCustomEvent(element, 'hyperscript:show', {
        element,
        context,
        command: 'show',
      });

    } catch (error) {
      console.warn('Error showing element:', error);
      
      // Dispatch error event
      dispatchCustomEvent(element, 'hyperscript:error', {
        element,
        context,
        command: 'show',
        error: error as Error,
      });
    }
  }

  private showWithDisplay(element: HTMLElement): void {
    // Restore original display value if available
    const originalDisplay = element.dataset.originalDisplay;
    
    if (originalDisplay !== undefined) {
      // Use original display or default if original was empty
      element.style.display = originalDisplay || this.options.defaultDisplay!;
      
      // Clean up the data attribute
      delete element.dataset.originalDisplay;
    } else {
      // No original display stored, use default if currently hidden
      if (element.style.display === 'none') {
        element.style.display = this.options.defaultDisplay!;
      }
    }
  }

  private showWithClass(element: HTMLElement): void {
    if (this.options.className) {
      element.classList.remove(this.options.className);
    }
  }

  validate(args: any[]): string | null {
    // Show command is very permissive - most arguments are valid
    if (args.length > 1) {
      return 'Show command accepts at most one target argument';
    }

    return null;
  }
}