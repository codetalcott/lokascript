/**
 * JSX type extensions for hyperfixi and missing.css.
 *
 * Adds:
 * 1. The `_` attribute (hyperscript) on all HTML elements
 * 2. The `<chip>` element from missing.css
 */

declare namespace JSX {
  // Extend HtmlTag to add hyperscript _ attribute
  interface HtmlTag {
    /** Hyperscript expression */
    _?: string;
  }

  // Add chip element from missing.css
  interface IntrinsicElements {
    chip: {
      class?: string;
      children?: unknown;
    };
  }
}
