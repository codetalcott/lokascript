/**
 * Slim Plugin
 *
 * Same plugin logic as plugin.ts but uses slim-preprocessor
 * (does not trigger all-language registration).
 */

import { resolveLanguage } from './language-resolver';
import { preprocessToEnglish } from './slim-preprocessor';
import type { PreprocessorConfig } from './preprocessor';
import type { PluginOptions } from './plugin';

export type { PluginOptions };

export function hyperscriptI18n(options: PluginOptions = {}) {
  return function plugin(hs: unknown): void {
    const { internals } = hs as {
      internals: { runtime: { getScript: (elt: Element) => string | null } };
    };
    const runtime = internals.runtime;
    const originalGetScript = runtime.getScript.bind(runtime);

    runtime.getScript = function (elt: Element): string | null {
      const src = originalGetScript(elt);
      if (!src) return null;

      const lang = resolveLanguageWithOptions(elt, options);
      if (!lang || lang === 'en') return src;

      const english = preprocessToEnglish(src, lang, options);

      if (options.debug && english !== src) {
        console.log(`[hyperscript-i18n] ${lang}: "${src}" → "${english}"`);
      }

      return english;
    };
  };
}

function resolveLanguageWithOptions(elt: Element, options: PluginOptions): string | null {
  if (options.languageAttribute) {
    const custom = elt.getAttribute(options.languageAttribute);
    if (custom) return custom.split('-')[0].toLowerCase();
  }

  const resolved = resolveLanguage(elt);
  if (resolved) return resolved;

  return options.defaultLanguage ?? null;
}

export function preprocess(
  src: string,
  lang: string,
  config: Partial<PreprocessorConfig> = {}
): string {
  if (lang === 'en') return src;
  return preprocessToEnglish(src, lang, config);
}
