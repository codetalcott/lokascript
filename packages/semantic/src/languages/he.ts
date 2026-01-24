/**
 * Hebrew Language Module
 *
 * Self-registering module for Hebrew language support.
 * Importing this module registers Hebrew tokenizer and profile.
 */

import { registerLanguage } from '../registry';
import { hebrewTokenizer } from '../tokenizers/he';
import { hebrewProfile } from '../generators/profiles/hebrew';

export { hebrewTokenizer } from '../tokenizers/he';
export { hebrewProfile } from '../generators/profiles/hebrew';

registerLanguage('he', hebrewTokenizer, hebrewProfile);
