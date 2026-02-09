import { it } from '../dictionaries/it';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const itKeywords: KeywordProvider = createKeywordProvider(it, 'it', {
  allowEnglishFallback: true,
});

export { it as itDictionary } from '../dictionaries/it';
