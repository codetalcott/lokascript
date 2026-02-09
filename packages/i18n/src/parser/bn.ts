import { bn } from '../dictionaries/bn';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const bnKeywords: KeywordProvider = createKeywordProvider(bn, 'bn', {
  allowEnglishFallback: true,
});

export { bn as bnDictionary } from '../dictionaries/bn';
