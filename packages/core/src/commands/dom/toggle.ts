/**
 * Toggle Command Implementation
 * Toggles element visibility using hide/show functionality
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core';
import { dispatchCustomEvent } from '../../core/events';
import { HideCommand } from './hide';
import { ShowCommand } from './show';

export interface ToggleCommandOptions {
  useClass?: boolean;
  className?: string;
  defaultDisplay?: string;
}

export class ToggleCommand implements CommandImplementation {
  public readonly name = 'toggle';
  public readonly syntax = 'toggle [<target-expression>]';
  public readonly isBlocking = false;
  public readonly hasBody = false;
  public readonly implicitTarget = 'me';
  
  private hideCommand: HideCommand;
  private showCommand: ShowCommand;

  constructor(options: ToggleCommandOptions = {}) {
    const resolvedOptions = {
      useClass: false,
      className: 'hyperscript-hidden',
      defaultDisplay: 'block',
      ...options,
    };

    this.hideCommand = new HideCommand({
      useClass: resolvedOptions.useClass,
      className: resolvedOptions.className,
    });

    this.showCommand = new ShowCommand({
      useClass: resolvedOptions.useClass,
      className: resolvedOptions.className,
      defaultDisplay: resolvedOptions.defaultDisplay,
    });
  }

  async execute(context: ExecutionContext, target?: any): Promise<void> {
    const elements = this.resolveTargets(context, target);
    
    for (const element of elements) {
      await this.toggleElement(element, context);
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

  private async toggleElement(element: HTMLElement, context: ExecutionContext): Promise<void> {
    if (!element) return;

    try {
      const isVisible = this.isElementVisible(element);
      
      if (isVisible) {
        await this.hideCommand.execute(context, element);
      } else {
        await this.showCommand.execute(context, element);
      }

      // Dispatch toggle event
      dispatchCustomEvent(element, 'hyperscript:toggle', {
        element,
        context,
        command: 'toggle',
        action: isVisible ? 'hide' : 'show',
        visible: !isVisible,
      });

    } catch (error) {
      console.warn('Error toggling element:', error);
      
      // Dispatch error event
      dispatchCustomEvent(element, 'hyperscript:error', {
        element,
        context,
        command: 'toggle',
        error: error as Error,
      });
    }
  }

  private isElementVisible(element: HTMLElement): boolean {
    // Check for class-based hiding first
    if (this.hideCommand['options'].useClass && this.hideCommand['options'].className) {
      if (element.classList.contains(this.hideCommand['options'].className)) {
        return false;
      }
    }

    // Check for display-based hiding
    if (element.style.display === 'none') {
      return false;
    }

    // Check computed styles for completely hidden elements
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      return false;
    }

    return true;
  }

  validate(args: any[]): string | null {
    // Toggle command is very permissive - most arguments are valid
    if (args.length > 1) {
      return 'Toggle command accepts at most one target argument';
    }

    return null;
  }
}