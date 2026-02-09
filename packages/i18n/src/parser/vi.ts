import { vi } from '../dictionaries/vi';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const viKeywords: KeywordProvider = createKeywordProvider(vi, 'vi', {
  allowEnglishFallback: true,
});

export { vi as viDictionary } from '../dictionaries/vi';
