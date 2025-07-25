# Hyperscript Internationalization Analysis

## Overview

Hyperscript is a highly readable scripting language that uses English keywords like "on", "click", "toggle", "wait", etc. To make it accessible to non-English developers, we need to consider several approaches.

## Key Components for I18n

### 1. Lexer/Parser Architecture
- Hyperscript has a Lexer class that tokenizes input
- Parser that processes tokens into AST nodes
- Keywords are matched using `matchToken()` and `matchAnyToken()` methods

### 2. Keyword Categories

Based on initial analysis, hyperscript uses several categories of keywords:

**Commands**: on, tell, take, put, set, if, repeat, for, wait, send, trigger, throw, log, call, get, fetch, go, add, remove, toggle, hide, show, make

**Modifiers**: to, from, into, before, after, with, at, in, of, as, by

**Control Flow**: then, else, otherwise, when, unless, end, return, halt, catch, finally

**Logical**: and, or, not, is, exists, matches, contains

**Temporal**: seconds, milliseconds, minutes, hours

**Values**: true, false, null, it, me, myself, element, target

## Implementation Approaches

### Approach 1: Preprocessing Translation Layer
Create a preprocessor that translates non-English keywords to English before the lexer:

```javascript
class HyperscriptTranslator {
  constructor(locale) {
    this.dictionary = loadDictionary(locale);
  }
  
  translate(source) {
    // Replace non-English keywords with English equivalents
    return source.replace(/\b(\w+)\b/g, (match) => {
      return this.dictionary[match] || match;
    });
  }
}
```

### Approach 2: Extended Lexer
Modify the Lexer to recognize multiple keyword variations:

```javascript
class I18nLexer extends Lexer {
  constructor(locale) {
    super();
    this.keywordMap = loadKeywordMap(locale);
  }
  
  matchToken(expectedToken) {
    const currentValue = this.currentToken().value;
    const englishEquivalent = this.keywordMap[currentValue];
    
    if (englishEquivalent === expectedToken || currentValue === expectedToken) {
      return this.consumeToken();
    }
    return null;
  }
}
```

### Approach 3: AST-Level Translation
Build AST with original keywords, then provide translation at the IDE/tooling level.

## Recommended Solution

A hybrid approach combining preprocessing and IDE support:

1. **Build Phase**: Create locale-specific keyword mappings
2. **Development Phase**: LSP provides autocompletion and hints in developer's language
3. **Execution Phase**: Transparent translation before parsing

## Example Implementation

```javascript
// Spanish keyword mapping
const spanishKeywords = {
  'en': 'on',
  'cuando': 'when',
  'hacer clic': 'click',
  'alternar': 'toggle',
  'esperar': 'wait',
  'segundos': 'seconds',
  'entonces': 'then',
  'si': 'if',
  'sino': 'else',
  'para': 'for',
  'de': 'from',
  'hasta': 'to',
  'con': 'with',
  'verdadero': 'true',
  'falso': 'false',
  'yo': 'me',
  'elemento': 'element'
};

// Example Spanish hyperscript
// <button _="en hacer clic alternar .clicked">
//   Alternar la clase "clicked" en mí
// </button>
```

## Next Steps

1. Create keyword dictionaries for target languages
2. Build translation layer as a plugin
3. Extend LSP for multi-language support
4. Create documentation in multiple languages
