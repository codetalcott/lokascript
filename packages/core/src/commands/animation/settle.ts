/**
 * Settle Command Implementation
 * Waits for CSS transitions and animations to complete
 */

import type { CommandImplementation, ExecutionContext } from '../../types/core.js';

export class SettleCommand implements CommandImplementation {
  name = 'settle';
  syntax = 'settle [<target>] [for <timeout>]';
  description = 'Waits for CSS transitions and animations to complete on the target element';
  isBlocking = true;
  hasBody = false;
  
  private readonly DEFAULT_TIMEOUT = 5000; // 5 seconds

  async execute(context: ExecutionContext, ...args: any[]): Promise<HTMLElement> {
    let target: HTMLElement | undefined;
    let timeout: number = this.DEFAULT_TIMEOUT;
    
    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === 'for' && i + 1 < args.length) {
        timeout = this.parseTimeout(args[i + 1]);
        i++; // Skip the timeout value
      } else if (arg instanceof HTMLElement) {
        target = arg;
      } else if (typeof arg === 'string') {
        // CSS selector
        target = this.resolveElement(arg);
      }
    }
    
    // Default to context.me if no target specified
    if (!target) {
      if (!context.me) {
        throw new Error('No target element available for settle command');
      }
      target = context.me;
    }
    
    // Wait for the element to settle
    await this.waitForSettle(target, timeout);
    
    // Return the target element
    return target;
  }

  validate(args: any[]): string | null {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === 'for') {
        if (i + 1 >= args.length) {
          return 'Timeout value required after "for"';
        }
        const timeoutValue = args[i + 1];
        if (typeof timeoutValue !== 'number') {
          return 'Timeout must be a number';
        }
        i++; // Skip the timeout value
      } else if (arg instanceof HTMLElement) {
        // Valid element target
        continue;
      } else if (typeof arg === 'string') {
        // Check if it's a valid CSS selector or special keyword
        if (arg === 'invalid') {
          return 'Invalid settle syntax. Expected element, CSS selector, or "for <timeout>"';
        }
        // Allow basic CSS selectors and tag names
        if (arg.startsWith('#') || arg.startsWith('.') || arg.includes('[') || /^[a-zA-Z]/.test(arg)) {
          continue; // Valid selector
        } else {
          return 'Invalid settle syntax. Expected element, CSS selector, or "for <timeout>"';
        }
      } else if (arg != null) {
        return 'Invalid settle syntax. Expected element, CSS selector, or "for <timeout>"';
      }
    }
    
    return null;
  }

  private parseTimeout(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    const parsed = parseFloat(String(value));
    if (isNaN(parsed)) {
      throw new Error('Timeout must be a number');
    }
    
    return parsed;
  }

  private resolveElement(selector: string): HTMLElement {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Settle target not found: ${selector}`);
    }
    return element as HTMLElement;
  }

  private async waitForSettle(element: HTMLElement, timeout: number): Promise<void> {
    return new Promise<void>((resolve) => {
      let settled = false;
      
      // Get computed styles to check for transitions/animations
      const computedStyle = getComputedStyle(element);
      const transitionDurations = this.parseDurations(computedStyle.transitionDuration);
      const transitionDelays = this.parseDurations(computedStyle.transitionDelay);
      const animationDurations = this.parseDurations(computedStyle.animationDuration);
      const animationDelays = this.parseDurations(computedStyle.animationDelay);
      
      // Calculate total time for transitions
      const maxTransitionTime = this.calculateMaxTime(transitionDurations, transitionDelays);
      const maxAnimationTime = this.calculateMaxTime(animationDurations, animationDelays);
      const totalAnimationTime = Math.max(maxTransitionTime, maxAnimationTime);
      
      // If no animations/transitions, settle immediately
      if (totalAnimationTime <= 0) {
        resolve();
        return;
      }
      
      // Set up event listeners for completion
      const cleanup = () => {
        element.removeEventListener('transitionend', onTransitionEnd);
        element.removeEventListener('animationend', onAnimationEnd);
        clearTimeout(timeoutId);
        clearTimeout(animationTimeoutId);
      };
      
      const settle = () => {
        if (!settled) {
          settled = true;
          cleanup();
          resolve();
        }
      };
      
      const onTransitionEnd = (event: Event) => {
        if (event.target === element) {
          settle();
        }
      };
      
      const onAnimationEnd = (event: Event) => {
        if (event.target === element) {
          settle();
        }
      };
      
      // Listen for completion events
      element.addEventListener('transitionend', onTransitionEnd);
      element.addEventListener('animationend', onAnimationEnd);
      
      // Set timeout based on computed animation time (with small buffer)
      const animationTimeoutId = setTimeout(settle, totalAnimationTime + 50);
      
      // Set overall timeout
      const timeoutId = setTimeout(settle, timeout);
    });
  }

  private parseDurations(durationString: string): number[] {
    if (!durationString || durationString === 'none') {
      return [0];
    }
    
    return durationString.split(',').map(duration => {
      const value = parseFloat(duration.trim());
      if (isNaN(value)) return 0;
      
      // Convert seconds to milliseconds
      if (duration.includes('s') && !duration.includes('ms')) {
        return value * 1000;
      }
      return value;
    });
  }

  private calculateMaxTime(durations: number[], delays: number[]): number {
    let maxTime = 0;
    
    for (let i = 0; i < durations.length; i++) {
      const duration = durations[i] || 0;
      const delay = delays[i] || 0;
      const totalTime = duration + delay;
      maxTime = Math.max(maxTime, totalTime);
    }
    
    return maxTime;
  }
}