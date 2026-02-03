/** Self-contained: English + Spanish */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/es';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'es'];
import { autoRegister } from './shared';
autoRegister();
