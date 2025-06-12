/**
 * HyperFixi - Complete hyperscript expression engine with utilities
 * 
 * This is the batteries-included version that combines @hyperfixi/core
 * with @hyperfixi/fixi utilities for a complete hyperscript solution.
 */

import { hyperscript as coreHyperscript, type ExecutionContext } from '@hyperfixi/core';
import { 
  stringUtils, 
  dateUtils, 
  arrayUtils, 
  domUtils, 
  performanceUtils,
  createFixiContext 
} from '@hyperfixi/fixi';

/**
 * Enhanced hyperscript with all utilities pre-loaded
 */
export const hyperscript = {
  ...coreHyperscript,
  
  /**
   * Create context with all fixi utilities pre-loaded
   */
  createContext(element?: HTMLElement | null): ExecutionContext {
    const context = coreHyperscript.createContext(element);
    
    // Add all utility functions to context
    context.variables?.set('string', stringUtils);
    context.variables?.set('date', dateUtils);
    context.variables?.set('array', arrayUtils);
    context.variables?.set('dom', domUtils);
    context.variables?.set('performance', performanceUtils);
    
    // Add individual utilities for convenience
    context.variables?.set('capitalize', stringUtils.capitalize);
    context.variables?.set('format', dateUtils.format);
    context.variables?.set('debounce', performanceUtils.debounce);
    context.variables?.set('throttle', performanceUtils.throttle);
    
    return context;
  },
  
  /**
   * Create enhanced context using fixi's context creator
   */
  createFixiContext
};

// Re-export everything from core and fixi for convenience
export * from '@hyperfixi/core';
export * from '@hyperfixi/fixi';

// Default export for convenience
export default hyperscript;