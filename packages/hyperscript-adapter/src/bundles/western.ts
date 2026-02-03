/** Self-contained: Western/European languages (en, es, pt, fr, de) */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/es';
import '@lokascript/semantic/languages/pt';
import '@lokascript/semantic/languages/fr';
import '@lokascript/semantic/languages/de';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'es', 'pt', 'fr', 'de'];
import { autoRegister } from './shared';
autoRegister();
