/** Self-contained: English + Indonesian */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/id';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'id'];
import { autoRegister } from './shared';
autoRegister();
