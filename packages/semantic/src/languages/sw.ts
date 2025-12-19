/**
 * Swahili Language Module
 *
 * Self-registering module for Swahili language support.
 * Importing this module registers Swahili tokenizer and profile.
 */

import { registerLanguage } from '../registry';
import { swahiliTokenizer } from '../tokenizers/swahili';
import { swahiliProfile } from '../generators/profiles/swahili';

export { swahiliTokenizer } from '../tokenizers/swahili';
export { swahiliProfile } from '../generators/profiles/swahili';

registerLanguage('sw', swahiliTokenizer, swahiliProfile);
