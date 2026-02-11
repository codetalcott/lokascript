/**
 * Simple SQL DSL Example - Debug Version
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
// 1. Define SQL Commands (Domain-Specific)
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
      expectedTypes: ['expression', 'literal'],
      svoPosition: 1,
      sovPosition: 2,
    }),
    defineRole({
      role: 'source',
      description: 'Table to select from',
      required: true,
      expectedTypes: ['selector', 'literal'],
      svoPosition: 2,
      sovPosition: 1,
      markerOverride: { en: 'from', es: 'de', ja: 'から' },
    }),
    defineRole({
      role: 'condition',
      description: 'WHERE clause condition',
      required: false,
      expectedTypes: ['expression'],
      svoPosition: 3,
      sovPosition: 3,
      markerOverride: { en: 'where', es: 'donde', ja: 'で' },
    }),
  ],
});

// =============================================================================
// 2. Create Tokenizers (Language-Specific)
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
        position += word.length + 1; // +1 for space
      }
    }

    return new TokenStreamImpl(tokens, this.language);
  }

  classifyToken(token: string): 'keyword' | 'identifier' | 'literal' | 'operator' {
    const keywords = ['select', 'from', 'where', 'insert', 'update', 'delete'];
    if (keywords.includes(token.toLowerCase())) {
      return 'keyword';
    }
    if (/^\d+$/.test(token)) {
      return 'literal';
    }
    if (['>', '<', '=', '>=', '<=', '!='].includes(token)) {
      return 'operator';
    }
    return 'identifier';
  }
}

// =============================================================================
// 3. Create Language Profiles
// =============================================================================

const englishProfile = {
  code: 'en',
  wordOrder: 'SVO' as const,
  keywords: {
    select: { primary: 'select' },
    insert: { primary: 'insert' },
    update: { primary: 'update' },
    delete: { primary: 'delete' },
  },
  roleMarkers: {
    source: { primary: 'from', position: 'before' as const },
    condition: { primary: 'where', position: 'before' as const },
  },
};

// =============================================================================
// 4. Create Code Generator (Optional)
// =============================================================================

function generateSQL(node: SemanticNode): string {
  if (node.action === 'select') {
    const columns = node.roles.get('columns');
    const source = node.roles.get('source');
    const condition = node.roles.get('condition');

    // Extract the actual value from SemanticValue union types
    const columnsValue = columns?.value || '*';
    const sourceValue = source?.value || 'table';
    
    let sql = `SELECT ${columnsValue} FROM ${sourceValue}`;

    if (condition) {
      sql += ` WHERE ${condition.value}`;
    }

    return sql;
  }

  throw new Error(`Unknown SQL command: ${node.action}`);
}

// =============================================================================
// 5. Create SQL DSL Instance
// =============================================================================

export const sqlDSL = createMultilingualDSL({
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
// 6. Debug
// =============================================================================

console.log('Supported languages:', sqlDSL.getSupportedLanguages());
console.log('\nCommand schemas:', JSON.stringify(selectCommand, null, 2));

try {
  console.log('\nAttempting to parse: "select name from users"');
  const result = sqlDSL.parse('select name from users', 'en');
  console.log('Success:', result);
} catch (error) {
  console.error('Parse failed:', error);
}
