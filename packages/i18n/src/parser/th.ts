import { th } from '../dictionaries/th';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const thKeywords: KeywordProvider = createKeywordProvider(th, 'th', {
  allowEnglishFallback: true,
});

export { th as thDictionary } from '../dictionaries/th';
