import { createMultilingualDSL, defineCommand, defineRole, BaseTokenizer, TokenStreamImpl, createToken, createPosition } from '../../src';

// Simpler command: just "select name" with one role, no markers
const selectCommand = defineCommand({
  action: 'select',
  description: 'Select command',
  category: 'query',
  primaryRole: 'columns',
  roles: [
    defineRole({
      role: 'columns',
      description: 'Columns to select',
      required: true,
      expectedTypes: ['expression'],
      svoPosition: 1,
      sovPosition: 1,
    }),
  ],
});

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

  classifyToken(token: string): 'keyword' | 'identifier' {
    if (token.toLowerCase() === 'select') {
      return 'keyword';
    }
    return 'identifier';
  }
}

const englishProfile = {
  code: 'en',
  wordOrder: 'SVO' as const,
  keywords: {
    select: { primary: 'select' },
  },
};

const sqlDSL = createMultilingualDSL({
  name: 'Simple SQL DSL',
  schemas: [selectCommand],
  languages: [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      tokenizer: new EnglishSQLTokenizer(),
      patternProfile: englishProfile,
    },
  ],
});

try {
  console.log('Attempting to parse: "select name"');
  const result = sqlDSL.parse('select name', 'en');
  console.log('SUCCESS!', result);
} catch (error: any) {
  console.error('FAILED:', error.message);
}
