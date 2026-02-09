import { tl } from '../dictionaries/tl';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const tlKeywords: KeywordProvider = createKeywordProvider(tl, 'tl', {
  allowEnglishFallback: true,
});

export { tl as tlDictionary } from '../dictionaries/tl';
