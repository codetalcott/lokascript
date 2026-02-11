import { PatternMatcher } from '../../src/core/pattern-matching';
import { defineCommand, defineRole } from '../../src';
import { generatePattern } from '../../src/generation/pattern-generator';
import { BaseTokenizer, TokenStreamImpl, createToken, createPosition } from '../../src/core/tokenization';

// Define schema
const selectCommand = defineCommand({
  action: 'select',
  description: 'Retrieve data from a table',
  category: 'query',
  primaryRole: 'columns',
  roles: [
    defineRole({
      role: 'columns',
      description: 'Columns to select',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 2, 
      sovPosition: 1,
    }),
    defineRole({
      role: 'source',
      description: 'Table to select from',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 2,
      markerOverride: { en: 'from' },
    }),
  ],
});

// English profile
const englishProfile = {
  code: 'en',
  wordOrder: 'SVO' as const,
  keywords: {
    select: { primary: 'select' },
  },
  roleMarkers: {
    source: { primary: 'from', position: 'before' as const },
  },
};

// Generate pattern
const pattern = generatePattern(selectCommand, englishProfile);
console.log('Pattern:', JSON.stringify(pattern, null, 2));

// Create tokenizer
class EnglishSQLTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  tokenize(input: string) {
    const tokens = [];
    const words = input.split(/\s+/);

    let position = 0;
    for (const word of words) {
      if (word) {
        const kind = this.classifyToken(word);
        tokens.push(createToken(word, kind, createPosition(position, position + word.length)));
        position += word.length + 1;
      }
    }

    return new TokenStreamImpl(tokens, this.language);
  }

  classifyToken(token: string): 'keyword' | 'identifier' | 'literal' | 'operator' {
    const keywords = ['select', 'from'];
    if (keywords.includes(token.toLowerCase())) {
      return 'keyword';
    }
    if (/^\d+$/.test(token)) {
      return 'literal';
    }
    return 'identifier';
  }
}

// Tokenize input
const tokenizer = new EnglishSQLTokenizer();
const input = 'select name from users';
const tokenStream = tokenizer.tokenize(input);

console.log('\nTokens:');
tokenStream.tokens.forEach(t => {
  console.log(`  ${t.value} -> ${t.kind}`);
});

// Try to match
const matcher = new PatternMatcher();
const profile = { code: 'en' };
const result = matcher.matchPattern(tokenStream, pattern, profile);

console.log('\nMatch result:', result);
if (result) {
  console.log('Captured roles:');
  result.captured.forEach((value, role) => {
    console.log(`  ${role}:`, value);
  });
} else {
  console.log('NO MATCH');
}
