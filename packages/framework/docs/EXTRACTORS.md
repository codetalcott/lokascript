# Value Extractors Guide

## Overview

Value extractors are pluggable components that enable domain-specific tokenization in the LokaScript framework. Instead of hardcoding syntax assumptions into the tokenizer, extractors allow DSLs to define their own syntax rules.

## Why Extractors?

**Problem**: The original BaseTokenizer had hardcoded methods for CSS selectors, URLs, and property access. This prevented DSLs like GraphQL, Terraform, or YAML from working with the framework.

**Solution**: A pluggable extractor registry that lets each DSL register only the extractors it needs.

## Architecture

### ValueExtractor Interface

```typescript
interface ValueExtractor {
  /** Name of this extractor (for debugging) */
  readonly name: string;

  /**
   * Check if this extractor can handle input at position.
   * Fast check - should not perform full extraction.
   */
  canExtract(input: string, position: number): boolean;

  /**
   * Extract value from input at position.
   * Returns extraction result or null if extraction failed.
   */
  extract(input: string, position: number): ExtractionResult | null;
}

interface ExtractionResult {
  /** The extracted value */
  readonly value: string;

  /** Number of characters consumed */
  readonly length: number;

  /** Optional metadata about the extraction */
  readonly metadata?: Record<string, unknown>;
}
```

### How It Works

1. **Registration**: Tokenizers register extractors in their constructor
2. **Tokenization**: BaseTokenizer tries each extractor in order
3. **Fallback**: If no extractor matches, treats character as punctuation/operator
4. **Classification**: Tokenizer classifies extracted values by calling `classifyToken()`

## Available Extractors

### Generic Extractors (Framework)

These work for most programming-language-style DSLs:

#### StringLiteralExtractor

- **Handles**: `"double quotes"`, `'single quotes'`, `` `backticks` ``
- **Supports**: Escape sequences (`\"`, `\'`, `\\`)
- **Use case**: String literals in SQL, JavaScript, config files

#### NumberExtractor

- **Handles**: Integers (`123`) and floats (`45.67`)
- **Use case**: Numeric literals in any DSL

#### OperatorExtractor

- **Handles**: `+`, `-`, `*`, `/`, `=`, `==`, `!=`, `>=`, `<=`, `&&`, `||`, etc.
- **Configurable**: Pass custom operator list
- **Priority**: Longest match first (`===` before `==`)

#### PunctuationExtractor

- **Handles**: `(`, `)`, `[`, `]`, `{`, `}`, `,`, `:`, `;`
- **Configurable**: Pass custom punctuation set

#### IdentifierExtractor

- **Handles**: Variable names (`userName`, `table_name`)
- **Pattern**: Starts with letter/underscore, contains letters/digits/underscores

### Hyperscript Extractors (Semantic Package)

Domain-specific extractors for hyperscript:

#### CssSelectorExtractor

- **Handles**: `#id`, `.class`, `[attr]`, `<tag/>`
- **Use case**: DOM element selectors

#### EventModifierExtractor

- **Handles**: `.once`, `.debounce(300)`, `.throttle(100)`, `.queue(first)`
- **Metadata**: Includes modifier name and value

#### UrlExtractor

- **Handles**: `/path`, `./relative`, `../parent`, `http://`, `https://`
- **Use case**: Fetch commands, API endpoints

#### PropertyAccessExtractor

- **Handles**: `.` in `obj.prop` or standalone `.method()`
- **Note**: Complex - may need tokenizer-level support

## Usage

### Basic Usage (Generic DSL)

```typescript
import { BaseTokenizer, getDefaultExtractors } from '@lokascript/framework';

class MySQLTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    // Register default extractors - handles all common syntax
    this.registerExtractors(getDefaultExtractors());
  }

  classifyToken(token: string): TokenKind {
    const keywords = ['select', 'from', 'where'];
    if (keywords.includes(token.toLowerCase())) {
      return 'keyword';
    }
    return 'identifier';
  }
}
```

**That's it!** No need to implement `tokenize()` - BaseTokenizer handles it automatically.

### Advanced Usage (Hyperscript)

```typescript
import { BaseTokenizer, getDefaultExtractors } from '@lokascript/framework';
import {
  CssSelectorExtractor,
  EventModifierExtractor,
  UrlExtractor,
} from '@lokascript/semantic/tokenizers/extractors';

class HyperscriptTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  constructor() {
    super();

    // Start with generic extractors
    this.registerExtractors(getDefaultExtractors());

    // Add hyperscript-specific extractors
    this.registerExtractor(new CssSelectorExtractor());
    this.registerExtractor(new EventModifierExtractor());
    this.registerExtractor(new UrlExtractor());
  }

  classifyToken(token: string): TokenKind {
    if (token.startsWith('#') || token.startsWith('.')) return 'selector';
    if (token.startsWith('.') && /\.(once|prevent|stop)/.test(token)) return 'event-modifier';
    // ... hyperscript-specific classification
  }
}
```

### Custom Extractors

```typescript
import type { ValueExtractor, ExtractionResult } from '@lokascript/framework';

class GraphQLQueryExtractor implements ValueExtractor {
  readonly name = 'graphql-query';

  canExtract(input: string, position: number): boolean {
    return input[position] === '{';
  }

  extract(input: string, position: number): ExtractionResult | null {
    let depth = 0;
    let length = 0;

    while (position + length < input.length) {
      const char = input[position + length];
      if (char === '{') depth++;
      if (char === '}') {
        depth--;
        length++;
        if (depth === 0) {
          return {
            value: input.substring(position, position + length),
            length,
            metadata: { type: 'graphql-query' },
          };
        }
      }
      length++;
    }

    return null; // Unclosed brace
  }
}

// Usage
class GraphQLTokenizer extends BaseTokenizer {
  constructor() {
    super();
    this.registerExtractors([...getDefaultExtractors(), new GraphQLQueryExtractor()]);
  }
}
```

## Extractor Ordering

Extractors are tried in **registration order**. Order matters for ambiguous syntax:

```typescript
constructor() {
  super();

  // CORRECT: Try CSS selectors before property access
  this.registerExtractor(new CssSelectorExtractor());
  this.registerExtractor(new PropertyAccessExtractor());

  // WRONG: Property access would capture '.active' before CSS
  this.registerExtractor(new PropertyAccessExtractor());
  this.registerExtractor(new CssSelectorExtractor());
}
```

**Best practice**: Register more specific extractors before generic ones.

## Metadata

Extractors can include metadata in their results:

```typescript
extract(input: string, position: number): ExtractionResult | null {
  const match = input.slice(position).match(/^\.debounce\((\d+)\)/);
  if (match) {
    return {
      value: match[0],
      length: match[0].length,
      metadata: {
        modifierName: 'debounce',
        value: parseInt(match[1], 10),
      },
    };
  }
  return null;
}
```

Metadata is passed through to the token:

```typescript
{
  value: '.debounce(300)',
  kind: 'event-modifier',
  metadata: {
    modifierName: 'debounce',
    value: 300,
  },
}
```

## Performance Tips

1. **Fast `canExtract()`**: This is called for every extractor at every position. Keep it simple.

   ```typescript
   // GOOD: O(1) check
   canExtract(input: string, position: number): boolean {
     return input[position] === '"';
   }

   // BAD: Complex regex check
   canExtract(input: string, position: number): boolean {
     return /^"(?:[^"\\]|\\.)*"/.test(input.slice(position));
   }
   ```

2. **Minimize Extractors**: Only register extractors your DSL needs.

3. **Order by Frequency**: Put common extractors first (strings, numbers, identifiers).

## Backward Compatibility

If no extractors are registered, BaseTokenizer throws an error:

```
BaseTokenizer: tokenize() not implemented and no extractors registered.
Either register extractors or override tokenize() method.
```

This preserves backward compatibility for legacy tokenizers that override `tokenize()`.

## Migration Guide

### From Legacy Tokenizer

**Before** (manual tokenization):

```typescript
class MyTokenizer extends BaseTokenizer {
  tokenize(input: string): TokenStream {
    // 50+ lines of manual tokenization logic
    const tokens = [];
    let pos = 0;
    while (pos < input.length) {
      // ... complex tokenization
    }
    return new TokenStreamImpl(tokens, this.language);
  }
}
```

**After** (extractor-based):

```typescript
class MyTokenizer extends BaseTokenizer {
  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
  }

  // No tokenize() needed - BaseTokenizer handles it
}
```

**Benefits**:

- ✅ 95% less code
- ✅ Reusable extractors
- ✅ Easier to test
- ✅ More maintainable

## Examples

### Minimal SQL DSL

```typescript
import { BaseTokenizer, getDefaultExtractors } from '@lokascript/framework';

class SQLTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
  }

  classifyToken(token: string): TokenKind {
    const keywords = ['select', 'from', 'where', 'insert', 'update'];
    return keywords.includes(token.toLowerCase()) ? 'keyword' : 'identifier';
  }
}
```

### YAML DSL (Indentation-Based)

```typescript
class IndentationExtractor implements ValueExtractor {
  readonly name = 'indentation';

  canExtract(input: string, position: number): boolean {
    return input[position] === ' ' || input[position] === '\t';
  }

  extract(input: string, position: number): ExtractionResult | null {
    let length = 0;
    while (position + length < input.length) {
      const char = input[position + length];
      if (char !== ' ' && char !== '\t') break;
      length++;
    }
    return { value: input.substring(position, position + length), length };
  }
}

class YAMLTokenizer extends BaseTokenizer {
  constructor() {
    super();
    this.registerExtractors([new IndentationExtractor(), ...getDefaultExtractors()]);
  }
}
```

### Terraform HCL DSL

```typescript
class HCLBlockExtractor implements ValueExtractor {
  readonly name = 'hcl-block';

  canExtract(input: string, position: number): boolean {
    return /^[a-z_]+\s*{/.test(input.slice(position));
  }

  extract(input: string, position: number): ExtractionResult | null {
    const match = input.slice(position).match(/^([a-z_]+)\s*\{/);
    if (!match) return null;

    return {
      value: match[1],
      length: match[1].length,
      metadata: { type: 'block-type' },
    };
  }
}
```

## Debugging

Enable debug logging to see extractor execution:

```typescript
// In browser console or Node
localStorage.setItem('lokascript:debug', 'tokenization');

// Then reload page or restart process
```

Output:

```
[TOKENIZATION] Position 0: trying StringLiteralExtractor
[TOKENIZATION] Position 0: trying NumberExtractor
[TOKENIZATION] Position 0: IdentifierExtractor matched 'select' (6 chars)
```

## Testing Extractors

```typescript
import { describe, it, expect } from 'vitest';
import { StringLiteralExtractor } from '@lokascript/framework';

describe('StringLiteralExtractor', () => {
  it('extracts double-quoted strings', () => {
    const extractor = new StringLiteralExtractor();
    const result = extractor.extract('"hello world" rest', 0);

    expect(result).toEqual({
      value: '"hello world"',
      length: 13,
    });
  });

  it('handles escaped quotes', () => {
    const extractor = new StringLiteralExtractor();
    const result = extractor.extract('"say \\"hi\\"" rest', 0);

    expect(result).toEqual({
      value: '"say \\"hi\\""',
      length: 12,
    });
  });

  it('returns null for non-strings', () => {
    const extractor = new StringLiteralExtractor();
    const result = extractor.extract('hello', 0);

    expect(result).toBeNull();
  });
});
```

## FAQ

### Q: Can I use multiple extractors for the same syntax?

**A**: No. The first matching extractor wins. Order extractors from most-specific to least-specific.

### Q: Can extractors be stateful?

**A**: Extractors should be stateless. State belongs in the tokenizer.

### Q: How do I handle whitespace?

**A**: BaseTokenizer skips whitespace automatically before trying extractors. If you need to preserve whitespace, use `WhitespaceExtractor`.

### Q: Can I modify extractors after registration?

**A**: No. Register all extractors in the constructor. Use `clearExtractors()` to reset.

### Q: Performance impact of many extractors?

**A**: Minimal. `canExtract()` is fast (O(1) checks). Only matched extractors call `extract()`.

## Next Steps

- **Tutorial**: See `examples/custom-extractor/` for a complete walkthrough
- **Reference**: Read `src/interfaces/value-extractor.ts` for full API
- **Examples**: Check `examples/sql-dsl/simple-sql.ts` for a working DSL

## Resources

- [ValueExtractor Interface](../src/interfaces/value-extractor.ts)
- [Default Extractors](../src/core/tokenization/default-extractors.ts)
- [SQL Example](../examples/sql-dsl/simple-sql.ts)
- [Hyperscript Extractors](../../semantic/src/tokenizers/extractors/)
