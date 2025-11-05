/**
 * Performance Utilities
 *
 * Optimized utilities for high-frequency DOM operations and event handling.
 * Designed to reduce layout thrashing and improve animation smoothness.
 */

// ============================================================================
// StyleBatcher - Batch DOM Style Updates
// ============================================================================

/**
 * StyleBatcher batches DOM style updates using requestAnimationFrame
 * to eliminate layout thrashing during high-frequency operations.
 *
 * Instead of applying styles immediately (causing reflows on every change),
 * styles are accumulated and applied once per frame (~16ms at 60fps).
 *
 * Example:
 * Without batching: 66 drag moves = 66 reflows = janky animation
 * With batching: 66 drag moves = ~4 reflows (at 60fps) = smooth animation
 */
export class StyleBatcher {
  private pending = new Map<HTMLElement, Record<string, string>>();
  private rafId: number | null = null;

  /**
   * Queue style updates for an element
   * Styles will be applied on the next animation frame
   */
  add(element: HTMLElement, styles: Record<string, string>): void {
    // Merge with existing pending styles for this element
    const existing = this.pending.get(element) || {};
    this.pending.set(element, { ...existing, ...styles });

    // Schedule flush if not already scheduled
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.flush());
    }
  }

  /**
   * Apply all pending style updates immediately
   * Called automatically on next animation frame
   */
  private flush(): void {
    // Apply all pending styles in a single batch
    for (const [element, styles] of this.pending) {
      // Apply each CSS property
      for (const [property, value] of Object.entries(styles)) {
        // CSS custom properties (--variables) must use setProperty()
        if (property.startsWith('--')) {
          element.style.setProperty(property, value);
        } else {
          // Convert hyphenated property names to camelCase
          const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          (element.style as any)[camelProperty] = value;
        }
      }
    }

    // Clear pending updates
    this.pending.clear();
    this.rafId = null;
  }

  /**
   * Cancel any pending style updates
   */
  cancel(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pending.clear();
  }

  /**
   * Get number of pending style updates
   * Useful for debugging and monitoring
   */
  getPendingCount(): number {
    return this.pending.size;
  }
}

// Singleton instance for global use
export const styleBatcher = new StyleBatcher();
