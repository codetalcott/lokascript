# @hyperfixi/fixi

🔧 **Utility functions and helpers for hyperscript expressions**

This package provides a comprehensive set of utility functions that extend hyperscript expressions with common operations for strings, arrays, dates, DOM manipulation, and more.

## Features

- 🔤 **String Utilities** - Formatting, validation, transformation
- 📅 **Date Helpers** - Formatting, parsing, manipulation
- 📊 **Array Operations** - Filtering, mapping, sorting, grouping
- 🌐 **DOM Utilities** - Advanced DOM manipulation and traversal
- ⚡ **Performance Utilities** - Debouncing, throttling, memoization
- 🎯 **Type-Safe** - Full TypeScript support with intelligent autocompletion

## Installation

```bash
npm install @hyperfixi/fixi @hyperfixi/core
# or
yarn add @hyperfixi/fixi @hyperfixi/core
```

## Quick Start

```typescript
import { hyperscript } from '@hyperfixi/core';
import { stringUtils, dateUtils } from '@hyperfixi/fixi';

// Add utilities to hyperscript context
const context = hyperscript.createContext(element);
context.variables?.set('string', stringUtils);
context.variables?.set('date', dateUtils);

// Use in hyperscript expressions
await hyperscript.run('string.capitalize(name)', context);
await hyperscript.run('date.format(now, "YYYY-MM-DD")', context);
```

## Utility Categories

### String Utilities

```typescript
import { stringUtils } from '@hyperfixi/fixi/string';

// String formatting
string.capitalize('hello world') // 'Hello World'
string.camelCase('hello-world')  // 'helloWorld'
string.kebabCase('HelloWorld')   // 'hello-world'

// String validation
string.isEmail('test@example.com') // true
string.isEmpty('')                 // true
string.contains('hello', 'ell')    // true
```

### Date Utilities

```typescript
import { dateUtils } from '@hyperfixi/fixi/date';

// Date formatting
date.format(new Date(), 'YYYY-MM-DD')     // '2024-01-15'
date.relative(new Date() - 3600000)       // '1 hour ago'
date.isValid('2024-01-15')                // true
```

### Array Utilities

```typescript
import { arrayUtils } from '@hyperfixi/fixi/array';

// Array operations
array.unique([1, 2, 2, 3])              // [1, 2, 3]
array.groupBy(items, 'category')         // { cat1: [...], cat2: [...] }
array.sortBy(items, 'name')              // Sorted array
```

### DOM Utilities

```typescript
import { domUtils } from '@hyperfixi/fixi/dom';

// Advanced DOM operations
dom.findParent(element, '.container')     // Closest parent with class
dom.siblings(element)                     // All sibling elements
dom.isVisible(element)                    // Check visibility
```

## Integration with Hyperscript

### Automatic Integration

When using the integrated package, utilities are automatically available:

```typescript
import { hyperscript } from 'hyperfixi'; // Integrated package

// Utilities automatically available in expressions
await hyperscript.run('capitalize(name)', context);
await hyperscript.run('format(date, "MM/DD/YYYY")', context);
```

### Manual Integration

For custom setups with `@hyperfixi/core`:

```typescript
import { hyperscript } from '@hyperfixi/core';
import { createFixiContext } from '@hyperfixi/fixi';

// Create enhanced context with all utilities
const context = createFixiContext(element);

// Or add specific utilities
const context = hyperscript.createContext(element);
context.variables?.set('string', stringUtils);
context.variables?.set('date', dateUtils);
```

## Performance Features

### Debouncing and Throttling

```typescript
// Debounced search
await hyperscript.run('debounce(search, 300)', context);

// Throttled scroll handler
await hyperscript.run('throttle(updateUI, 100)', context);
```

### Memoization

```typescript
// Cache expensive computations
await hyperscript.run('memoize(expensiveFunction)', context);
```

## API Reference

For complete API documentation, see the individual utility documentation:

- [String Utilities](./docs/string.md)
- [Date Utilities](./docs/date.md)
- [Array Utilities](./docs/array.md)
- [DOM Utilities](./docs/dom.md)
- [Performance Utilities](./docs/performance.md)

## License

MIT - see [LICENSE](../../LICENSE) file for details.