/** Self-contained: English + Japanese */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/ja';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'ja'];
import { autoRegister } from './shared';
autoRegister();
