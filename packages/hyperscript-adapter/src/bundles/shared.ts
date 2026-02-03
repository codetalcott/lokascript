/**
 * Shared bundle boilerplate.
 * Each per-language entry imports languages, then calls setup().
 */

import { hyperscriptI18n, preprocess } from '../slim-plugin';
import { resolveLanguage } from '../language-resolver';

export { hyperscriptI18n as plugin, preprocess, resolveLanguage };

declare const _hyperscript: { use: (plugin: unknown) => void } | undefined;

export function autoRegister(): void {
  if (typeof _hyperscript !== 'undefined' && _hyperscript.use) {
    _hyperscript.use(hyperscriptI18n());
  }
}
