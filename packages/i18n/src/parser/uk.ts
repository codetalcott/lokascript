import { ukrainianDictionary } from '../dictionaries/uk';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const ukKeywords: KeywordProvider = createKeywordProvider(ukrainianDictionary, 'uk', {
  allowEnglishFallback: true,
});

export { ukrainianDictionary as ukDictionary } from '../dictionaries/uk';
