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
}
