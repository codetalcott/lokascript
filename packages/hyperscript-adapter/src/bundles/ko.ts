/** Self-contained: English + Korean */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/ko';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'ko'];
import { autoRegister } from './shared';
autoRegister();
