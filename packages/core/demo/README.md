# HyperFixi Enhanced Expressions Demo

An interactive demonstration of our enhanced TypeScript hyperscript expressions.

## Features Demonstrated

- **Enhanced 'not' Expression** - JavaScript-compatible truthiness evaluation
- **Enhanced 'some' Expression** - Existence checking with DOM selector support  
- **Enhanced 'possessive' Expression** - Property, attribute, and style access
- **Enhanced 'as' Expression** - Comprehensive type conversion system

## Running the Demo

### Option 1: Python Server
```bash
npm run serve
# Opens on http://localhost:8080
```

### Option 2: Node.js Server  
```bash
npm run serve-node
# Opens on http://localhost:3000
```

### Option 3: Direct File
Simply open `index.html` in your browser.

## Expression Examples

### Not Expression
- `not true` → `false`
- `not 0` → `true` (0 is falsy)
- `not []` → `false` (arrays are truthy)

### Some Expression  
- `some null` → `false`
- `some [1,2,3]` → `true`
- `some 'div'` → checks DOM for div elements

### Possessive Expression
- `element's value` → property access
- `element's @data-foo` → attribute access
- `element's *color` → style property access

### As Expression
- `"42" as Int` → `42`
- `42 as String` → `"42"`
- `123.456 as Fixed:2` → `"123.46"`

## Technical Features

✅ Full TypeScript Integration  
✅ Comprehensive Error Handling  
✅ Security Validation Warnings  
✅ Performance Tracking  
✅ LLM Documentation  
✅ Official Hyperscript Compatibility
