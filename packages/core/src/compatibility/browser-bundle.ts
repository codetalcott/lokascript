/**
 * Browser Bundle for HyperFixi Compatibility Testing
 * Exports evalHyperScript for direct browser usage
 */

import { evalHyperScript, evalHyperScriptAsync, evalHyperScriptSmart, type HyperScriptContext } from './eval-hyperscript.js';

// Export to global scope for browser testing
declare global {
  interface Window {
    hyperfixi: {
      evalHyperScript: typeof evalHyperScript;
      evalHyperScriptAsync: typeof evalHyperScriptAsync;
      evalHyperScriptSmart: typeof evalHyperScriptSmart;
    };
  }
}

// Main browser API - matches _hyperscript signature
const hyperfixi = {
  evalHyperScript,
  evalHyperScriptAsync,
  evalHyperScriptSmart,
  
  // Convenience method that matches _hyperscript() function signature exactly
  evaluate: evalHyperScript,
  
  // Version info
  version: '1.0.0-compatibility'
};

// Export to global for browser testing
if (typeof window !== 'undefined') {
  window.hyperfixi = hyperfixi;
}

// Export as default for IIFE
export default hyperfixi;