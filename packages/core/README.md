# @hyperfixi/core

🚀 **Pure hyperscript expression evaluation engine with TypeScript support**

This is the core hyperscript engine that provides fast parsing, execution, and comprehensive error handling for web applications. Built with performance and developer experience in mind.

## Features

- 🚀 **High Performance** - Optimized tokenizer and parser for large expressions
- 🔧 **TypeScript First** - Complete type safety with comprehensive type definitions
- 🎯 **Excellent DX** - Enhanced error messages with suggestions and recovery strategies
- 🧪 **Thoroughly Tested** - 400+ tests with 100% reliability
- 🌊 **DOM Manipulation** - Full support for element hiding, showing, class management
- ⚡ **Event Handling** - Seamless integration with DOM events
- 🛡️ **Error Recovery** - Graceful handling of syntax errors with helpful guidance

## Installation

```bash
npm install @hyperfixi/core
# or
yarn add @hyperfixi/core
```

## Quick Start

```typescript
import { hyperscript } from '@hyperfixi/core';

// Simple expression evaluation
const result = await hyperscript.run('5 + 3 * 2'); // Returns 11

// DOM manipulation
const button = document.getElementById('myButton');
const context = hyperscript.createContext(button);

await hyperscript.run('hide me', context); // Hides the button
await hyperscript.run('show me', context); // Shows the button
```

## API Reference

For complete API documentation, see [API.md](./docs/API.md).

### Main Methods

- `hyperscript.compile(code)` - Compile hyperscript to AST
- `hyperscript.execute(ast, context)` - Execute compiled AST
- `hyperscript.run(code, context)` - Compile and execute in one step
- `hyperscript.createContext(element)` - Create execution context
- `hyperscript.isValidHyperscript(code)` - Validate syntax

## Supported Features

### DOM Manipulation
- `hide me` / `show me` - Element visibility
- `add ".class"` / `remove ".class"` - CSS class management  
- `put "text" into me` - Content manipulation

### Expressions
- **Arithmetic**: `5 + 3 * 2`, `value / 2`
- **Logical**: `true and false`, `value > 10`
- **Member Access**: `element.property`, `object.method()`
- **Context Variables**: `me`, `it`, `you`, `result`

### Timing
- `wait 500` - Wait in milliseconds
- `wait 2s` - Wait in seconds

## Examples

See [EXAMPLES.md](./docs/EXAMPLES.md) for comprehensive usage examples.

## Compatibility Testing

This package includes compatibility tests that validate HyperFixi against the official _hyperscript library:

```bash
# Run compatibility tests with official hyperscript test suite  
npm run test:browser

# Run only command compatibility tests
npx playwright test --grep "Command Tests"

# Run only expression compatibility tests  
npx playwright test --grep "Expression Tests"
```

The compatibility tests measure:
- **Expression compatibility**: Currently **100%** (15/15 tests passing)
- **Command compatibility**: Currently **60%** (9/15 tests passing) 
- **Overall compatibility**: **80%** across all hyperscript features

View detailed test results at `http://localhost:9323` after running browser tests.

## License

MIT - see [LICENSE](../../LICENSE) file for details.