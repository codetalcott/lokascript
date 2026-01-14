/**
 * Tests for Possessive Keywords Utility
 */

import { describe, it, expect } from 'vitest';
import {
  getPossessiveReference,
  isPossessiveKeyword,
  getAllPossessiveKeywords,
} from '../../../src/parser/utils/possessive-keywords';
import { englishProfile } from '../../../src/generators/profiles/english';
import { frenchProfile } from '../../../src/generators/profiles/french';
import { germanProfile } from '../../../src/generators/profiles/german';
import { japaneseProfile } from '../../../src/generators/profiles/japanese';
import { koreanProfile } from '../../../src/generators/profiles/korean';

describe('Possessive Keywords Utility', () => {
  describe('getPossessiveReference', () => {
    it('should return reference for English possessives', () => {
      expect(getPossessiveReference(englishProfile, 'my')).toBe('me');
      expect(getPossessiveReference(englishProfile, 'your')).toBe('you');
      expect(getPossessiveReference(englishProfile, 'its')).toBe('it');
    });

    it('should return reference for French possessives', () => {
      expect(getPossessiveReference(frenchProfile, 'mon')).toBe('me');
      expect(getPossessiveReference(frenchProfile, 'ma')).toBe('me');
      expect(getPossessiveReference(frenchProfile, 'mes')).toBe('me');
      expect(getPossessiveReference(frenchProfile, 'ton')).toBe('you');
      expect(getPossessiveReference(frenchProfile, 'son')).toBe('it');
    });

    it('should return reference for German possessives', () => {
      expect(getPossessiveReference(germanProfile, 'mein')).toBe('me');
      expect(getPossessiveReference(germanProfile, 'meine')).toBe('me');
      expect(getPossessiveReference(germanProfile, 'dein')).toBe('you');
      expect(getPossessiveReference(germanProfile, 'sein')).toBe('it');
    });

    it('should return reference for Japanese possessives', () => {
      expect(getPossessiveReference(japaneseProfile, '私の')).toBe('me');
      expect(getPossessiveReference(japaneseProfile, 'あなたの')).toBe('you');
      expect(getPossessiveReference(japaneseProfile, 'その')).toBe('it');
    });

    it('should return reference for Korean possessives', () => {
      expect(getPossessiveReference(koreanProfile, '내')).toBe('me');
      expect(getPossessiveReference(koreanProfile, '네')).toBe('you');
      expect(getPossessiveReference(koreanProfile, '그의')).toBe('it');
    });

    it('should return undefined for unknown keywords', () => {
      expect(getPossessiveReference(englishProfile, 'unknown')).toBeUndefined();
      expect(getPossessiveReference(englishProfile, 'her')).toBeUndefined();
    });
  });

  describe('isPossessiveKeyword', () => {
    it('should return true for possessive keywords', () => {
      expect(isPossessiveKeyword(englishProfile, 'my')).toBe(true);
      expect(isPossessiveKeyword(frenchProfile, 'mon')).toBe(true);
      expect(isPossessiveKeyword(germanProfile, 'mein')).toBe(true);
    });

    it('should return false for non-possessive keywords', () => {
      expect(isPossessiveKeyword(englishProfile, 'toggle')).toBe(false);
      expect(isPossessiveKeyword(englishProfile, 'value')).toBe(false);
    });
  });

  describe('getAllPossessiveKeywords', () => {
    it('should return all possessive keywords for English', () => {
      const keywords = getAllPossessiveKeywords(englishProfile);
      expect(keywords).toEqual({
        my: 'me',
        your: 'you',
        its: 'it',
      });
    });

    it('should return all possessive keywords for French', () => {
      const keywords = getAllPossessiveKeywords(frenchProfile);
      expect(Object.keys(keywords)).toHaveLength(9);
      expect(keywords.mon).toBe('me');
      expect(keywords.ton).toBe('you');
      expect(keywords.son).toBe('it');
    });

    it('should return empty object for profile without possessive keywords', () => {
      const emptyProfile = {
        ...englishProfile,
        possessive: undefined,
      };
      expect(getAllPossessiveKeywords(emptyProfile)).toEqual({});
    });
  });
});
