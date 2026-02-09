import { pl } from '../dictionaries/pl';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const plKeywords: KeywordProvider = createKeywordProvider(pl, 'pl', {
  allowEnglishFallback: true,
});

export { pl as plDictionary } from '../dictionaries/pl';
