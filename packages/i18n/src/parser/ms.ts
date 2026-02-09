import { ms } from '../dictionaries/ms';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const msKeywords: KeywordProvider = createKeywordProvider(ms, 'ms', {
  allowEnglishFallback: true,
});

export { ms as msDictionary } from '../dictionaries/ms';
