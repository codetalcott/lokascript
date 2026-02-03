/**
 * Browser bundle entry point.
 *
 * Exposes the plugin as a global `HyperscriptI18n` object for use
 * with a <script> tag alongside the original _hyperscript.
 *
 * Usage (self-contained — bundles semantic parser):
 *   <script src="_hyperscript.js"></script>
 *   <script src="hyperscript-i18n.global.js"></script>
 *   <!-- Auto-registers on load -->
 *
 * Usage (manual registration):
 *   <script src="_hyperscript.js"></script>
 *   <script src="hyperscript-i18n.global.js"></script>
 *   <script>
 *     // Already auto-registered, or manually:
 *     _hyperscript.use(HyperscriptI18n.plugin({ debug: true }));
 *   </script>
 */

// Import semantic package — exports reference ensures languages get registered
import { getSupportedLanguages, VERSION } from '@lokascript/semantic';

import { hyperscriptI18n, preprocess } from './plugin';
import { preprocessToEnglish } from './preprocessor';
import { resolveLanguage } from './language-resolver';

// Re-export to prevent tree-shaking the semantic import
export const semanticVersion = VERSION;
export const supportedLanguages = getSupportedLanguages();

export { hyperscriptI18n as plugin, preprocess, preprocessToEnglish, resolveLanguage };

// Auto-register if _hyperscript is available globally
declare const _hyperscript: { use: (plugin: unknown) => void } | undefined;

if (typeof _hyperscript !== 'undefined' && _hyperscript.use) {
  _hyperscript.use(hyperscriptI18n());
  reprocessInitializedElements();
}

/**
 * _hyperscript processes the DOM immediately on load (via browserInit()),
 * so elements are already marked as initialized with unparsed multilingual
 * text by the time the adapter registers. Clear the initialized flag on
 * all script-bearing elements and re-process them through the patched
 * getScript() pipeline.
 */
function reprocessInitializedElements(): void {
  if (typeof document === 'undefined') return;

  const hs = _hyperscript as unknown as {
    internals?: {
      runtime?: {
        getInternalData: (el: Element) => { initialized?: boolean };
        processNode: (el: Element) => void;
        getScriptSelector: () => string;
      };
    };
  };

  const runtime = hs?.internals?.runtime;
  if (!runtime?.processNode || !runtime?.getInternalData) return;

  const selector = runtime.getScriptSelector?.() ?? '[_], [script], [data-script]';
  document.querySelectorAll(selector).forEach(el => {
    const data = runtime.getInternalData(el);
    if (data.initialized) {
      data.initialized = false;
    }
  });

  runtime.processNode(document.body);
}
