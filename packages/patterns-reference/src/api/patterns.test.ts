/**
 * Pattern Queries API Tests
 *
 * Tests use the database created by `npm run db:init`
 */

import { describe, it, expect, afterAll } from 'vitest';
import { resolve } from 'path';
import {
  getPatternById,
  getPatternsByCategory,
  getPatternsByCommand,
  searchPatterns,
  getAllPatterns,
  getPatternStats,
} from './patterns';
import { closeDatabase } from '../database/connection';

// Use the initialized database from data/patterns.db
const TEST_DB_PATH = resolve(__dirname, '../../data/patterns.db');

// Connection options to use test database
const connOptions = { dbPath: TEST_DB_PATH, readonly: true };

describe('Pattern Queries API', () => {
  afterAll(() => {
    closeDatabase();
  });

  describe('getPatternById', () => {
    it('returns a pattern by ID', async () => {
      const pattern = await getPatternById('toggle-class-basic', connOptions);
      expect(pattern).not.toBeNull();
      expect(pattern?.id).toBe('toggle-class-basic');
      expect(pattern?.title).toBe('Toggle Class');
      expect(pattern?.rawCode).toBe('on click toggle .active');
    });

    it('returns null for non-existent ID', async () => {
      const pattern = await getPatternById('does-not-exist', connOptions);
      expect(pattern).toBeNull();
    });

    it('extracts primary command correctly', async () => {
      const pattern = await getPatternById('toggle-class-basic', connOptions);
      expect(pattern?.primaryCommand).toBe('on');
    });

    it('extracts tags correctly', async () => {
      const pattern = await getPatternById('toggle-class-basic', connOptions);
      expect(pattern?.tags).toContain('class');
      expect(pattern?.tags).toContain('event');
    });

    it('infers difficulty correctly', async () => {
      const pattern = await getPatternById('toggle-class-basic', connOptions);
      // Single line without 'then' = beginner
      expect(pattern?.difficulty).toBe('beginner');
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns patterns filtered by category', async () => {
      const patterns = await getPatternsByCategory('class-manipulation', connOptions);
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(p => {
        expect(p.category).toBe('class-manipulation');
      });
    });

    it('returns empty array for non-existent category', async () => {
      const patterns = await getPatternsByCategory('non-existent-category', connOptions);
      expect(patterns).toEqual([]);
    });
  });

  describe('getPatternsByCommand', () => {
    it('returns patterns containing the command', async () => {
      const patterns = await getPatternsByCommand('toggle', connOptions);
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(p => {
        expect(p.rawCode.toLowerCase()).toContain('toggle');
      });
    });

    it('matches word boundaries', async () => {
      const patterns = await getPatternsByCommand('show', connOptions);
      expect(patterns.length).toBeGreaterThan(0);
      // Should match 'show' but not 'shows' or 'showing'
      patterns.forEach(p => {
        expect(p.rawCode).toMatch(/\bshow\b/i);
      });
    });

    it('returns empty array for non-matching command', async () => {
      const patterns = await getPatternsByCommand('nonexistentcommand', connOptions);
      expect(patterns).toEqual([]);
    });
  });

  describe('searchPatterns', () => {
    it('searches in title', async () => {
      const patterns = await searchPatterns('Toggle', {}, connOptions);
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.title.includes('Toggle'))).toBe(true);
    });

    it('searches in raw code', async () => {
      const patterns = await searchPatterns('.active', {}, connOptions);
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.rawCode.includes('.active'))).toBe(true);
    });

    it('searches in description', async () => {
      const patterns = await searchPatterns('CSS class', {}, connOptions);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('respects limit option', async () => {
      const patterns = await searchPatterns('click', { limit: 2 }, connOptions);
      expect(patterns.length).toBeLessThanOrEqual(2);
    });

    it('respects offset option', async () => {
      const allPatterns = await searchPatterns('click', {}, connOptions);
      const offsetPatterns = await searchPatterns('click', { offset: 1 }, connOptions);
      if (allPatterns.length > 1) {
        expect(offsetPatterns[0].id).toBe(allPatterns[1].id);
      }
    });

    it('returns empty array for no matches', async () => {
      const patterns = await searchPatterns('xyznonexistent', {}, connOptions);
      expect(patterns).toEqual([]);
    });
  });

  describe('getAllPatterns', () => {
    it('returns all patterns', async () => {
      const patterns = await getAllPatterns({}, connOptions);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('respects limit option', async () => {
      const patterns = await getAllPatterns({ limit: 2 }, connOptions);
      expect(patterns.length).toBeLessThanOrEqual(2);
    });

    it('respects offset option', async () => {
      const allPatterns = await getAllPatterns({}, connOptions);
      const offsetPatterns = await getAllPatterns({ offset: 1, limit: 10 }, connOptions);
      if (allPatterns.length > 1) {
        expect(offsetPatterns[0].id).toBe(allPatterns[1].id);
      }
    });
  });

  describe('getPatternStats', () => {
    it('returns pattern statistics', async () => {
      const stats = await getPatternStats(connOptions);

      expect(stats.totalPatterns).toBeGreaterThan(0);
      expect(stats.totalTranslations).toBeGreaterThan(0);
      expect(typeof stats.avgConfidence).toBe('number');
    });

    it('includes language breakdown', async () => {
      const stats = await getPatternStats(connOptions);

      expect(stats.byLanguage).toBeDefined();
      expect(stats.byLanguage['en']).toBeDefined();
      expect(stats.byLanguage['en'].count).toBeGreaterThan(0);
    });

    it('includes category breakdown', async () => {
      const stats = await getPatternStats(connOptions);

      expect(stats.byCategory).toBeDefined();
      expect(stats.byCategory['class-manipulation']).toBeGreaterThan(0);
    });
  });
});
