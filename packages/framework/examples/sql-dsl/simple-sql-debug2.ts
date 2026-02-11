/**
 * Simple SQL DSL Example - Deep Debug
 */

import {
  createMultilingualDSL,
  defineCommand,
  defineRole,
  BaseTokenizer,
  type TokenStream,
  type SemanticNode,
} from '../../src';
import { TokenStreamImpl, createToken, createPosition } from '../../src/core/tokenization';

// =============================================================================
// 1. Define SQL Commands
// =============================================================================

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
      expectedTypes: ['literal', 'selector'],
      svoPosition: 1,
      sovPosition: 2,
    }),
    defineRole({
      role: 'source',
      description: 'Table to select from',
      required: true,
      expectedTypes: ['literal', 'selector'],
      svoPosition: 2,
      sovPosition: 1,
      markerOverride: { en: 'from', es: 'de' },
    }),
  ],
});

// =============================================================================
// 2. Create Tokenizer
// =============================================================================

class EnglishSQLTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  tokenize(input: string): TokenStream {
    const tokens = [];
    const words = input.split(/\s+/);

    let position = 0;
    for (const word of words) {
      if (word) {
        tokens.push(
          createToken(
            word,
            this.classifyToken(word),
            createPosition(position, position + word.length)
          )
        );
        position += word.length + 1;
      }
    }

    return new TokenStreamImpl(tokens, this.language);
  }

  classifyToken(token: string): 'keyword' | 'identifier' | 'literal' | 'operator' {
    const keywords = ['select', 'from', 'where'];
    if (keywords.includes(token.toLowerCase())) {
      return 'keyword';
    }
    if (/^\d+$/.test(token)) {
      return 'literal';
    }
    return 'identifier';
  }
}

// =============================================================================
// 3. Create Language Profile
// =============================================================================

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

// =============================================================================
// 4. Create Code Generator
// =============================================================================

function generateSQL(node: SemanticNode): string {
  if (node.action === 'select') {
    const columns = node.roles.get('columns');
    const source = node.roles.get('source');
    
    const columnsValue = columns?.value || '*';
    const sourceValue = source?.value || 'table';
    
    return `SELECT ${columnsValue} FROM ${sourceValue}`;
  }

  throw new Error(`Unknown SQL command: ${node.action}`);
}

// =============================================================================
// 5. Create SQL DSL Instance
// =============================================================================

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
  codeGenerator: {
    generate: generateSQL,
  },
});

// =============================================================================
// 6. Deep Debug
// =============================================================================

console.log('=== SQL DSL Debug ===\n');
console.log('Supported languages:', sqlDSL.getSupportedLanguages());

// Get patterns (accessing internal method)
const patterns = (sqlDSL as any).getPatterns('en');
console.log('\nGenerated patterns:', JSON.stringify(patterns, null, 2));

// Tokenize input
const tokenizer = (sqlDSL as any).getTokenizer('en');
if (tokenizer) {
  const input = 'select name from users';
  console.log('\nInput:', input);
  const tokenStream = tokenizer.tokenize(input);
  console.log('Tokens:', tokenStream.getTokens().map(t => ({ 
    text: t.text, 
    type: t.type 
  })));
}

// Try parsing
try {
  console.log('\n=== Attempting parse ===');
  const result = sqlDSL.parse('select name from users', 'en');
  console.log('Success:', result);
} catch (error: any) {
  console.error('Parse failed:', error.message);
}
