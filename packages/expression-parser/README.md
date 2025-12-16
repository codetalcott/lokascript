# @hyperfixi/expression-parser

Shared expression parser for HyperFixi. Parses hyperscript expressions into AST nodes that can be used by both the semantic package (AST building) and core package (runtime).

## Installation

```bash
npm install @hyperfixi/expression-parser
```

## Usage

```typescript
import { parseExpression } from '@hyperfixi/expression-parser';

// Parse a CSS selector
const result = parseExpression('#button.active');
if (result.success) {
  console.log(result.node);
  // { type: 'selector', value: '#button.active', selectorType: 'complex' }
}

// Parse a property access
const prop = parseExpression("element's value");
// { type: 'propertyAccess', object: {...}, property: 'value' }

// Parse a literal
const lit = parseExpression('"hello world"');
// { type: 'literal', value: 'hello world', dataType: 'string' }

// Parse a context reference
const ref = parseExpression('me');
// { type: 'contextReference', contextType: 'me', name: 'me' }
```

## Supported Expression Types

### Selectors

| Type | Example | Result |
|------|---------|--------|
| ID | `#button` | `{ type: 'selector', selectorType: 'id' }` |
| Class | `.active` | `{ type: 'selector', selectorType: 'class' }` |
| Element | `<div/>` | `{ type: 'selector', selectorType: 'element' }` |
| Attribute | `[data-id]` | `{ type: 'selector', selectorType: 'attribute' }` |
| Complex | `#btn.active` | `{ type: 'selector', selectorType: 'complex' }` |

### Literals

| Type | Example | Result |
|------|---------|--------|
| String | `"hello"` or `'hello'` | `{ type: 'literal', dataType: 'string' }` |
| Number | `42` or `3.14` | `{ type: 'literal', dataType: 'number' }` |
| Boolean | `true` or `false` | `{ type: 'literal', dataType: 'boolean' }` |
| Duration | `500ms` or `2s` | `{ type: 'literal', dataType: 'duration' }` |
| Null | `null` | `{ type: 'literal', dataType: 'null' }` |

### Context References

Built-in hyperscript context variables:

| Reference | Description |
|-----------|-------------|
| `me` | Current element |
| `you` | Target element |
| `it` | Last result |
| `my` | Property of current element |
| `its` | Property of last result |
| `event` | Current event object |
| `target` | Event target |
| `result` | Previous command result |
| `body` | Document body |
| `detail` | Event detail |

### Property Access

```typescript
// Possessive syntax
parseExpression("element's value")
// { type: 'propertyAccess', object: {...}, property: 'value' }

// My/its shortcuts
parseExpression("my innerHTML")
// { type: 'propertyAccess', object: { contextType: 'me' }, property: 'innerHTML' }
```

### Binary Expressions

```typescript
parseExpression("x > 5")
// { type: 'binaryExpression', operator: '>', left: {...}, right: {...} }
```

Supported operators: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `>`, `<=`, `>=`, `and`, `or`, `is`, `is not`, `contains`, `matches`

### Unary Expressions

```typescript
parseExpression("not active")
// { type: 'unaryExpression', operator: 'not', argument: {...} }
```

Supported operators: `not`, `no`, `-` (negation)

### Call Expressions

```typescript
parseExpression("Math.random()")
// { type: 'callExpression', callee: {...}, arguments: [] }
```

## API Reference

### `parseExpression(input: string): ExpressionParseResult`

Parse an expression string into an AST node.

```typescript
interface ExpressionParseResult {
  success: boolean;
  node: ExpressionNode | null;
  error?: string;
  remaining?: string;
}
```

### `tokenize(input: string): Token[]`

Tokenize an expression string into tokens.

```typescript
interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}
```

### `ExpressionParser`

Low-level parser class for advanced usage:

```typescript
import { ExpressionParser } from '@hyperfixi/expression-parser';

const parser = new ExpressionParser(input);
const node = parser.parseExpression();
```

## Node Types

All node types extend `ExpressionNode`:

```typescript
interface ExpressionNode {
  readonly type: string;
  readonly start?: number;
  readonly end?: number;
  readonly line?: number;
  readonly column?: number;
}
```

Available node types:
- `LiteralNode` - String, number, boolean, null, duration
- `SelectorNode` - CSS selectors
- `ContextReferenceNode` - me, you, it, event, etc.
- `IdentifierNode` - Variable names
- `PropertyAccessNode` - Possessive property access
- `BinaryExpressionNode` - Binary operations
- `UnaryExpressionNode` - Unary operations
- `CallExpressionNode` - Function calls
- `ArrayLiteralNode` - Array literals
- `ObjectLiteralNode` - Object literals
- `TimeExpressionNode` - Duration expressions
- `ErrorNode` - Parse errors

## Integration

This package is used by:
- `@hyperfixi/semantic` - AST builder converts semantic values to expression nodes
- `@hyperfixi/core` - Runtime evaluates expression nodes

## License

MIT
