/**
 * Reference expressions for hyperscript
 * Handles me, you, it, CSS selectors, and element references
 */

import type { ExecutionContext, ExpressionImplementation, EvaluationType } from '../../types/core.js';

// ============================================================================
// Core Reference Variables
// ============================================================================

export const meExpression: ExpressionImplementation = {
  name: 'me',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext): Promise<HTMLElement | null> {
    return context.me;
  },
  
  validate() {
    return null; // 'me' requires no arguments
  }
};

export const youExpression: ExpressionImplementation = {
  name: 'you',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext): Promise<HTMLElement | null> {
    return context.you;
  },
  
  validate() {
    return null; // 'you' requires no arguments
  }
};

export const itExpression: ExpressionImplementation = {
  name: 'it',
  category: 'Reference',
  evaluatesTo: 'Any',
  
  async evaluate(context: ExecutionContext): Promise<any> {
    return context.it;
  },
  
  validate() {
    return null; // 'it' requires no arguments
  }
};

export const resultExpression: ExpressionImplementation = {
  name: 'result',
  category: 'Reference',
  evaluatesTo: 'Any',
  
  async evaluate(context: ExecutionContext): Promise<any> {
    return context.result;
  },
  
  validate() {
    return null; // 'result' requires no arguments
  }
};

// ============================================================================
// CSS Selector Expressions
// ============================================================================

export const querySelectorExpression: ExpressionImplementation = {
  name: 'querySelector',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext, selector: string): Promise<HTMLElement | null> {
    if (typeof selector !== 'string') {
      throw new Error('querySelector requires a string selector');
    }
    
    // Always search from document to find any element
    // This matches hyperscript's behavior where selectors are global by default
    return document.querySelector(selector) as HTMLElement | null;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'querySelector requires exactly one argument (selector)';
    }
    if (typeof args[0] !== 'string') {
      return 'querySelector selector must be a string';
    }
    return null;
  }
};

export const querySelectorAllExpression: ExpressionImplementation = {
  name: 'querySelectorAll',
  category: 'Reference',
  evaluatesTo: 'Array',
  
  async evaluate(context: ExecutionContext, selector: string): Promise<HTMLElement[]> {
    if (typeof selector !== 'string') {
      throw new Error('querySelectorAll requires a string selector');
    }
    
    // Always search from document to find any elements
    // This matches hyperscript's behavior where selectors are global by default
    const nodeList = document.querySelectorAll(selector);
    return Array.from(nodeList) as HTMLElement[];
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'querySelectorAll requires exactly one argument (selector)';
    }
    if (typeof args[0] !== 'string') {
      return 'querySelectorAll selector must be a string';
    }
    return null;
  }
};

// ============================================================================
// ID and Class Reference Expressions
// ============================================================================

export const idExpression: ExpressionImplementation = {
  name: 'getElementById',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext, id: string): Promise<HTMLElement | null> {
    if (typeof id !== 'string') {
      throw new Error('getElementById requires a string ID');
    }
    
    return document.getElementById(id);
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'getElementById requires exactly one argument (ID)';
    }
    if (typeof args[0] !== 'string') {
      return 'getElementById ID must be a string';
    }
    return null;
  }
};

export const classExpression: ExpressionImplementation = {
  name: 'getElementsByClassName',
  category: 'Reference',
  evaluatesTo: 'Array',
  
  async evaluate(context: ExecutionContext, className: string): Promise<HTMLElement[]> {
    if (typeof className !== 'string') {
      throw new Error('getElementsByClassName requires a string class name');
    }
    
    // Always search from document to find any elements
    // This matches hyperscript's behavior where selectors are global by default
    const collection = document.getElementsByClassName(className);
    return Array.from(collection) as HTMLElement[];
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'getElementsByClassName requires exactly one argument (className)';
    }
    if (typeof args[0] !== 'string') {
      return 'getElementsByClassName className must be a string';
    }
    return null;
  }
};

// ============================================================================
// Traversal Expressions (closest, parent, etc.)
// ============================================================================

export const closestExpression: ExpressionImplementation = {
  name: 'closest',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext, selector: string): Promise<HTMLElement | null> {
    if (typeof selector !== 'string') {
      throw new Error('closest requires a string selector');
    }
    
    if (!context.me) {
      return null;
    }
    
    return context.me.closest(selector) as HTMLElement | null;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'closest requires exactly one argument (selector)';
    }
    if (typeof args[0] !== 'string') {
      return 'closest selector must be a string';
    }
    return null;
  }
};

export const parentExpression: ExpressionImplementation = {
  name: 'parent',
  category: 'Reference',
  evaluatesTo: 'Element',
  
  async evaluate(context: ExecutionContext): Promise<HTMLElement | null> {
    if (!context.me) {
      return null;
    }
    
    return context.me.parentElement;
  },
  
  validate(): string | null {
    return null; // parent requires no arguments
  }
};

// ============================================================================
// Export all reference expressions
// ============================================================================

export const referenceExpressions = {
  me: meExpression,
  you: youExpression,
  it: itExpression,
  result: resultExpression,
  querySelector: querySelectorExpression,
  querySelectorAll: querySelectorAllExpression,
  getElementById: idExpression,
  getElementsByClassName: classExpression,
  closest: closestExpression,
  parent: parentExpression,
} as const;

export type ReferenceExpressionName = keyof typeof referenceExpressions;