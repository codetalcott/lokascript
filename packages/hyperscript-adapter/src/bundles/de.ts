/** Self-contained: English + German */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/de';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'de'];
import { autoRegister } from './shared';
autoRegister();
