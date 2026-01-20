# execute()

Execute hyperscript code or a pre-compiled AST.

## Methods

### `eval(code, context?, options?)`

**Recommended.** Compile and execute in one call.

```javascript
import { hyperscript } from '@lokascript/core';

// Simple expression
const sum = await hyperscript.eval('5 + 3'); // 8

// With element context
const button = document.getElementById('btn');
await hyperscript.eval('add .active to me', button);

// With full context
const ctx = hyperscript.createContext(element);
await hyperscript.eval('toggle .visible', ctx);
```

### `execute(ast, context?)`

Execute a pre-compiled AST. Use when you've already compiled and want to reuse.

```javascript
const result = hyperscript.compileSync('hide me then wait 1s then show me');

if (result.ok) {
  const ctx = hyperscript.createContext(element);
  await hyperscript.execute(result.ast, ctx);
}
```

## Context

The execution context provides variables and element references.

### Creating Context

```javascript
// From element
const ctx = hyperscript.createContext(element);

// Empty context
const ctx = hyperscript.createContext();

// Child context (inherits from parent)
const parent = hyperscript.createContext();
parent.globals.set('appName', 'MyApp');

const child = hyperscript.createContext(element, parent);
// child can access appName
```

### Context Variables

```javascript
const ctx = hyperscript.createContext(element);

ctx.me; // The element passed to createContext
ctx.it; // Result of previous operation
ctx.you; // Target element (for delegated events)
ctx.result; // Explicit result storage
ctx.event; // Current DOM event
```

### Local Variables

Variables prefixed with `:` are stored in `ctx.locals`:

```javascript
await hyperscript.eval('set :count to 5', ctx);
console.log(ctx.locals.get('count')); // 5
```

### Setting Variables Before Execution

```javascript
const ctx = hyperscript.createContext(element);
ctx.locals.set('userName', 'Alice');
ctx.globals.set('apiUrl', '/api');

await hyperscript.eval('put :userName into #name', ctx);
```

## Return Values

The `eval()` function returns the result of the last expression:

```javascript
const sum = await hyperscript.eval('5 + 3'); // 8
const str = await hyperscript.eval('"hello world"'); // "hello world"
const el = await hyperscript.eval('#my-element'); // Element
```

For commands that don't return values:

```javascript
const result = await hyperscript.eval('toggle .active on me', element);
// result is undefined (toggle doesn't return a value)
```

## Error Handling

```javascript
try {
  await hyperscript.eval('invalid code @@', element);
} catch (error) {
  console.error('Execution failed:', error.message);
}
```

### Graceful Recovery

```javascript
try {
  await hyperscript.eval('me.nonExistentMethod()', ctx);
} catch (error) {
  // Handle gracefully
  await hyperscript.eval('add .error to me', ctx);
}
```

## Performance

### Compile Once, Execute Many

```javascript
// Pre-compile
const result = hyperscript.compileSync('add .processed to me');

if (result.ok) {
  // Execute on many elements
  const elements = document.querySelectorAll('.item');
  for (const el of elements) {
    await hyperscript.execute(result.ast, hyperscript.createContext(el));
  }
}
```

### Batch Processing

```javascript
// Process all _="..." attributes in a container
hyperscript.processNode(container);
```

## Event Integration

When hyperscript runs from a `_="..."` attribute in response to an event, the context automatically includes:

```javascript
// In _="on click ..." handler:
ctx.event; // The click Event object
ctx.event.target; // The clicked element
ctx.me; // The element with the _="..." attribute
```

Access these in your code:

```html
<button _="on click log event.type">
  Click me
  <!-- Logs "click" -->
</button>

<button _="on click put event.target.tagName into #output">
  Click me
  <!-- Puts "BUTTON" into #output -->
</button>
```

## Next Steps

- [hyperscript Object](/en/api/hyperscript) - Full API reference
- [Context & Variables](/en/guide/context) - Detailed context guide
- [Commands](/en/api/commands/dom) - Command reference
