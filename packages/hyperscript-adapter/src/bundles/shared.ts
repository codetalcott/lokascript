/**
 * Shared bundle boilerplate.
 * Each per-language entry imports languages, then calls setup().
 *
 * Also wires up the pattern generator so that registered languages
 * can have their patterns generated on demand from their profiles.
 * Without this, getPatternsForLanguage() throws for non-English
 * languages that only register a tokenizer + profile.
 */

import {
  setPatternGenerator,
  generatePatternsForLanguage,
  type LanguageProfile,
} from '@lokascript/semantic/core';
import { hyperscriptI18n, preprocess } from '../slim-plugin';
import { resolveLanguage } from '../language-resolver';

// Enable on-demand pattern generation for registered languages.
setPatternGenerator((profile: LanguageProfile) => generatePatternsForLanguage(profile));

export { hyperscriptI18n as plugin, preprocess, resolveLanguage };

declare const _hyperscript: { use: (plugin: unknown) => void } | undefined;

export function autoRegister(): void {
  if (typeof _hyperscript !== 'undefined' && _hyperscript.use) {
    _hyperscript.use(hyperscriptI18n());
    reprocessInitializedElements();
  }
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
