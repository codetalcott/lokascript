/** Self-contained: English + Portuguese */
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/pt';
export { plugin, preprocess, resolveLanguage } from './shared';
export const supportedLanguages = ['en', 'pt'];
import { autoRegister } from './shared';
autoRegister();
