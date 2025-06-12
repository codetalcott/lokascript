# HyperFixi

🚀 **Complete hyperscript expression engine with utilities - batteries included**

HyperFixi combines the power of a modern hyperscript parser and runtime with a comprehensive set of utility functions. Get everything you need for hyperscript expressions in one package.

## What's Included

- 🚀 **@hyperfixi/core** - High-performance hyperscript parser and runtime
- 🔧 **@hyperfixi/fixi** - Comprehensive utility functions
- 🎯 **Pre-configured** - All utilities automatically available in expressions
- 📦 **Batteries Included** - No additional setup required

## Installation

```bash
npm install hyperfixi
# or
yarn add hyperfixi
```

## Quick Start

```typescript
import { hyperscript } from 'hyperfixi';

// All utilities are automatically available
const context = hyperscript.createContext(element);

// String utilities
await hyperscript.run('capitalize(userName)', context);

// Date formatting
await hyperscript.run('format(date, "MM/DD/YYYY")', context);

// Performance utilities
await hyperscript.run('debounce(search, 300)', context);

// DOM manipulation with utilities
await hyperscript.run('hide me then wait 1s then show me', context);
```

## Included Utilities

### String Operations
```typescript
await hyperscript.run('capitalize("hello world")', context);     // "Hello World"
await hyperscript.run('string.kebabCase("HelloWorld")', context); // "hello-world"
await hyperscript.run('string.isEmail(email)', context);          // validation
```

### Date Formatting
```typescript
await hyperscript.run('format(now, "YYYY-MM-DD")', context);      // "2024-01-15"
await hyperscript.run('date.relative(timestamp)', context);       // "2 hours ago"
await hyperscript.run('date.isValid(dateString)', context);       // validation
```

### Array Operations
```typescript
await hyperscript.run('array.unique(items)', context);            // remove duplicates
await hyperscript.run('array.groupBy(data, "category")', context); // group objects
await hyperscript.run('array.sortBy(items, "name")', context);    // sort by property
```

### Performance Helpers
```typescript
await hyperscript.run('debounce(handleInput, 300)', context);     // debouncing
await hyperscript.run('throttle(onScroll, 100)', context);        // throttling
await hyperscript.run('performance.memoize(fn)', context);        // memoization
```

### Advanced DOM
```typescript
await hyperscript.run('dom.findParent(me, ".container")', context);  // find ancestor
await hyperscript.run('dom.siblings(me)', context);                  // get siblings
await hyperscript.run('dom.isVisible(element)', context);            // visibility check
```

## Modular Usage

If you prefer to use individual packages:

```typescript
// Core only (minimal)
import { hyperscript } from '@hyperfixi/core';

// Core + specific utilities
import { hyperscript } from '@hyperfixi/core';
import { stringUtils } from '@hyperfixi/fixi/string';

const context = hyperscript.createContext(element);
context.variables?.set('string', stringUtils);
```

## Features

- 🚀 **High Performance** - Optimized parser handles 1000+ token expressions
- 🔧 **TypeScript First** - Complete type safety and autocompletion
- 🎯 **Excellent DX** - Enhanced error messages with suggestions
- 🧪 **Thoroughly Tested** - 400+ tests with 100% reliability
- 🌊 **DOM Manipulation** - Complete CSS selector and DOM manipulation support
- ⚡ **Event Handling** - Seamless integration with DOM events
- 🛡️ **Error Recovery** - Graceful error handling with helpful guidance
- 📦 **Tree Shakable** - Only bundle what you use

## Performance

| Bundle | Size (gzipped) | Features |
|--------|----------------|----------|
| `@hyperfixi/core` | ~12KB | Pure hyperscript engine |
| `@hyperfixi/fixi` | ~8KB | Utility functions only |
| `hyperfixi` (integrated) | ~20KB | Complete solution |

## Examples

### Form Processing
```typescript
const form = document.getElementById('contactForm');
const context = hyperscript.createContext(form);

// Validate and process form
await hyperscript.run(`
  if string.isEmail(email) 
    then format(date.now(), "YYYY-MM-DD") 
    else "Invalid email"
`, context);
```

### Interactive UI
```typescript
const button = document.getElementById('actionButton');
button.addEventListener('click', async () => {
  const context = hyperscript.createContext(button);
  
  await hyperscript.run(`
    add ".loading" then 
    debounce(submitForm, 500) then
    wait 2s then
    remove ".loading" then
    add ".success"
  `, context);
});
```

### Data Processing
```typescript
const dataContext = hyperscript.createContext();
dataContext.variables?.set('items', apiResponse.items);

await hyperscript.run(`
  array.groupBy(items, "category") 
  then array.sortBy(it, "name")
  then array.unique(it)
`, dataContext);
```

## Documentation

- [API Reference](https://github.com/hyperfixi/hyperfixi/tree/main/packages/core/docs/API.md)
- [Examples](https://github.com/hyperfixi/hyperfixi/tree/main/packages/core/docs/EXAMPLES.md)
- [Core Package](https://github.com/hyperfixi/hyperfixi/tree/main/packages/core)
- [Fixi Utilities](https://github.com/hyperfixi/hyperfixi/tree/main/packages/fixi)

## License

MIT - see [LICENSE](../../LICENSE) file for details.