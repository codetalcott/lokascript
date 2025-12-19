/**
 * Global type declarations for HyperFixi browser bundles
 */

import type {
  HyperFixiCoreAPI,
  EvalHyperScriptFunction,
  EvalHyperScriptAsyncFunction,
  EvalHyperScriptSmartFunction,
} from './core-api'
import type { HyperFixiSemanticAPI } from './semantic-api'
import type { HyperFixiI18nAPI } from './i18n-api'

declare global {
  interface Window {
    /**
     * Main HyperFixi core API
     *
     * @example
     * ```html
     * <script src="hyperfixi-browser.js"></script>
     * <script>
     *   window.hyperfixi.execute('toggle .active')
     * </script>
     * ```
     */
    hyperfixi: HyperFixiCoreAPI

    /**
     * Shorthand: evaluate hyperscript code
     * @example window.evalHyperScript('toggle .active')
     */
    evalHyperScript: EvalHyperScriptFunction

    /**
     * Async version of evalHyperScript
     * @example await window.evalHyperScriptAsync('wait 1s then toggle .active')
     */
    evalHyperScriptAsync: EvalHyperScriptAsyncFunction

    /**
     * Smart evaluation: detects element context automatically
     */
    evalHyperScriptSmart: EvalHyperScriptSmartFunction

    /**
     * Semantic parser API (when semantic-parser bundle is loaded)
     *
     * @example
     * ```html
     * <script src="hyperfixi-semantic.browser.global.js"></script>
     * <script>
     *   const result = window.HyperFixiSemantic.parse('toggle .active', 'en')
     * </script>
     * ```
     */
    HyperFixiSemantic?: HyperFixiSemanticAPI

    /**
     * i18n/Grammar transformation API (when i18n bundle is loaded)
     *
     * @example
     * ```html
     * <script src="hyperfixi-i18n.min.js"></script>
     * <script>
     *   const result = window.HyperFixiI18n.translate('on click toggle .active', 'en', 'ja')
     * </script>
     * ```
     */
    HyperFixiI18n?: HyperFixiI18nAPI
  }

  /**
   * globalThis augmentation (Node.js/non-browser environments)
   */
  var hyperfixi: HyperFixiCoreAPI | undefined
  var HyperFixiSemantic: HyperFixiSemanticAPI | undefined
  var HyperFixiI18n: HyperFixiI18nAPI | undefined
}

export {}
