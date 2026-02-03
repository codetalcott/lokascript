/** Self-contained: English + Chinese */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/zh';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'zh'];
import { autoRegister } from './shared';
autoRegister();
