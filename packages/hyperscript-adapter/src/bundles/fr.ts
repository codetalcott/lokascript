/** Self-contained: English + French */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/fr';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'fr'];
import { autoRegister } from './shared';
autoRegister();
