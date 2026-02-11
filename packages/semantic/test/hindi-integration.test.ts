/**
 * Hindi Tokenizer Integration Test
 *
 * Verifies that the Hindi morphological normalizer is properly integrated
 * with the Hindi tokenizer.
 */

import { describe, it, expect } from 'vitest';
import { hindiTokenizer } from '../src/tokenizers/hindi';

describe('Hindi Tokenizer Integration', () => {
  it('should have a normalizer attached', () => {
    expect(hindiTokenizer.normalizer).toBeDefined();
    expect(hindiTokenizer.normalizer?.language).toBe('hi');
  });

  it('should normalize Hindi verb conjugations during keyword lookup', () => {
    // The tokenizer should use the normalizer when looking up keywords
    const normalizer = hindiTokenizer.normalizer;
    expect(normalizer).toBeDefined();

    if (normalizer) {
      // Test that normalizer can handle infinitive forms
      const result1 = normalizer.normalize('करना');
      expect(result1.stem).toBe('कर');
      expect(result1.confidence).toBe(0.90);

      // Test habitual present forms
      const result2 = normalizer.normalize('करता');
      expect(result2.stem).toBe('कर');
      expect(result2.confidence).toBe(0.85);

      // Test future forms
      const result3 = normalizer.normalize('करेगा');
      expect(result3.stem).toBe('कर');
      expect(result3.confidence).toBe(0.85);
    }
  });
});
