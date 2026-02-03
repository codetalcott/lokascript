/** Self-contained: English + Turkish */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/tr';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'tr'];
import { autoRegister } from './shared';
autoRegister();
