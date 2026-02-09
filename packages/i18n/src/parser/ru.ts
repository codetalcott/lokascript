import { russianDictionary } from '../dictionaries/ru';
import { createKeywordProvider } from './create-provider';
import type { KeywordProvider } from './types';

export const ruKeywords: KeywordProvider = createKeywordProvider(russianDictionary, 'ru', {
  allowEnglishFallback: true,
});

export { russianDictionary as ruDictionary } from '../dictionaries/ru';
