import { hindiDictionary } from '../dictionaries/hi';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const hiKeywords: KeywordProvider = createKeywordProvider(hindiDictionary, 'hi', {
  allowEnglishFallback: true,
});

export { hindiDictionary as hiDictionary } from '../dictionaries/hi';
