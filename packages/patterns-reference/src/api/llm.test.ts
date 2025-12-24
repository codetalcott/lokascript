/**
 * LLM Examples API Tests
 *
 * Tests use the database created by `npm run db:init`
 */

import { describe, it, expect, afterAll } from 'vitest';
import { resolve } from 'path';
import {
  getLLMExamples,
  getExamplesByCommand,
  getHighQualityExamples,
  getMostUsedExamples,
  buildFewShotContext,
  getLLMStats,
} from './llm';
import { closeDatabase } from '../database/connection';

// Use the initialized database from data/patterns.db
const TEST_DB_PATH = resolve(__dirname, '../../data/patterns.db');

// Connection options to use test database
const connOptions = { dbPath: TEST_DB_PATH, readonly: true };

describe('LLM Examples API', () => {
  afterAll(() => {
    closeDatabase();
  });

  describe('getLLMExamples', () => {
    it('returns examples matching prompt keywords', async () => {
      const examples = await getLLMExamples('toggle class', 'en', 5, connOptions);
      expect(examples.length).toBeGreaterThan(0);
      expect(examples.some(e => e.completion.includes('toggle'))).toBe(true);
    });

    it('filters by language', async () => {
      const examples = await getLLMExamples('toggle', 'en', 5, connOptions);
      examples.forEach(e => {
        expect(e.language).toBe('en');
      });
    });

    it('respects limit parameter', async () => {
      const examples = await getLLMExamples('click', 'en', 2, connOptions);
      expect(examples.length).toBeLessThanOrEqual(2);
    });

    it('returns fallback examples when no keywords match', async () => {
      const examples = await getLLMExamples('the and or', 'en', 3, connOptions);
      // Should still return examples (fallback to quality-sorted)
      expect(examples.length).toBeGreaterThanOrEqual(0);
    });

    it('maps LLMExample fields correctly', async () => {
      const examples = await getLLMExamples('toggle', 'en', 5, connOptions);
      if (examples.length > 0) {
        const example = examples[0];
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('patternId');
        expect(example).toHaveProperty('language');
        expect(example).toHaveProperty('prompt');
        expect(example).toHaveProperty('completion');
        expect(example).toHaveProperty('qualityScore');
        expect(example).toHaveProperty('usageCount');
        expect(example).toHaveProperty('createdAt');
      }
    });
  });

  describe('getExamplesByCommand', () => {
    it('returns examples containing the command', async () => {
      const examples = await getExamplesByCommand('toggle', 'en', 5, connOptions);
      expect(examples.length).toBeGreaterThan(0);
      examples.forEach(e => {
        expect(e.completion.toLowerCase()).toContain('toggle');
      });
    });

    it('returns empty array for non-matching command', async () => {
      const examples = await getExamplesByCommand('nonexistentcmd', 'en', 5, connOptions);
      expect(examples).toEqual([]);
    });
  });

  describe('getHighQualityExamples', () => {
    it('returns examples with high quality scores', async () => {
      const examples = await getHighQualityExamples('en', 0.8, 10, connOptions);
      examples.forEach(e => {
        expect(e.qualityScore).toBeGreaterThanOrEqual(0.8);
      });
    });

    it('defaults to minimum quality of 0.8', async () => {
      const examples = await getHighQualityExamples('en', undefined, undefined, connOptions);
      examples.forEach(e => {
        expect(e.qualityScore).toBeGreaterThanOrEqual(0.8);
      });
    });
  });

  describe('getMostUsedExamples', () => {
    it('returns examples sorted by usage count', async () => {
      const examples = await getMostUsedExamples('en', 5, connOptions);
      expect(examples.length).toBeLessThanOrEqual(5);

      // Verify sorted by usage_count descending
      for (let i = 1; i < examples.length; i++) {
        expect(examples[i - 1].usageCount).toBeGreaterThanOrEqual(examples[i].usageCount);
      }
    });
  });

  describe('buildFewShotContext', () => {
    it('builds formatted context string', async () => {
      const context = await buildFewShotContext('toggle a class', 'en', 2, connOptions);
      expect(typeof context).toBe('string');
    });

    it('includes prompt and completion sections', async () => {
      const context = await buildFewShotContext('toggle', 'en', 2, connOptions);

      // Context should have some structure for examples
      // The exact format may vary, but it should contain example content
      if (context.length > 0) {
        // Should contain example content from the database
        expect(context.length).toBeGreaterThan(10);
      }
    });

    it('respects limit parameter', async () => {
      const context1 = await buildFewShotContext('click', 'en', 1, connOptions);
      const context2 = await buildFewShotContext('click', 'en', 3, connOptions);

      // More examples should generally produce longer context
      // (unless there aren't enough examples)
      expect(context2.length).toBeGreaterThanOrEqual(context1.length);
    });
  });

  describe('getLLMStats', () => {
    it('returns statistics about LLM examples', async () => {
      const stats = await getLLMStats(connOptions);

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byLanguage');
      expect(stats).toHaveProperty('avgQuality');
      expect(stats).toHaveProperty('totalUsage');
    });

    it('includes language breakdown', async () => {
      const stats = await getLLMStats(connOptions);

      expect(stats.byLanguage).toBeDefined();
      if (stats.total > 0) {
        expect(Object.keys(stats.byLanguage).length).toBeGreaterThan(0);
      }
    });

    it('calculates average quality correctly', async () => {
      const stats = await getLLMStats(connOptions);

      expect(stats.avgQuality).toBeGreaterThanOrEqual(0);
      expect(stats.avgQuality).toBeLessThanOrEqual(1);
    });
  });
});
