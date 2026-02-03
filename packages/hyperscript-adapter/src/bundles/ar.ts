/** Self-contained: English + Arabic */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/ar';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'ar'];
import { autoRegister } from './shared';
autoRegister();
