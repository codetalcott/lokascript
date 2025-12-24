/**
 * JSX type extensions for hyperfixi attributes and missing.css elements.
 */

declare namespace JSX {
  // Extend intrinsic attributes to allow hyperscript `_` attribute on all elements
  interface IntrinsicAttributes {
    _?: string;
  }

  // Add the `chip` element from missing.css
  interface IntrinsicElements {
    chip: {
      class?: string;
      children?: unknown;
      _?: string;
    };
  }
}

export {};
