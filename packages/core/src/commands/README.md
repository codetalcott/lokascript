# HyperFixi Commands

This directory contains all command implementations for the HyperFixi runtime. Commands are the core building blocks of HyperFixi's hyperscript-like syntax, enabling declarative HTML behaviors.

## Table of Contents

- [Overview](#overview)
- [Command Architecture](#command-architecture)
  - [Decorator Pattern (Standard)](#decorator-pattern-standard)
  - [When to Customize](#when-to-customize)
- [Command Categories](#command-categories)
- [Creating New Commands](#creating-new-commands)
- [Examples](#examples)

---

## Overview

HyperFixi currently has **43 user-facing commands** organized into the following categories:

- **DOM** (12): Manipulate elements, attributes, and classes
- **Navigation** (3): Browser history and URL management
- **Control Flow** (9): Conditionals, loops, and flow control
- **Async** (2): Asynchronous operations and network requests
- **Data** (6): Variable management and data persistence
- **Events** (2): Event triggering and dispatching
- **Execution** (2): Function calls and pseudo-commands
- **Content** (1): Content insertion and manipulation
- **Animation** (3): Transitions, measurements, and property transfers
- **Utility** (4): Logging, copying, picking, and beeping
- **Templates** (1): Template rendering with directives
- **Behaviors** (1): Behavior installation

All commands implement a unified interface with two key methods:

1. **`parseInput(raw, evaluator, context)`** - Parse raw AST nodes into typed input
2. **`execute(input, context)`** - Execute the command with typed input

This separation enables:
- **Tree-shaking**: Only bundle commands your application uses
- **Type safety**: Full TypeScript inference from input to output
- **Testability**: Commands can be tested independently

---

## Command Architecture

### Decorator Pattern (Standard)

**Used by:** All 43 commands

All commands use TypeScript 5.0+ Stage 3 decorators for clean, consistent implementation.

**Structure:**

```typescript
import { command, meta, createFactory } from '../decorators';
import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ASTNode, ExpressionNode } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

export interface SwapCommandInput {
  targets: HTMLElement[];
  content: string | HTMLElement | null;
  strategy: SwapStrategy;
  morphOptions?: MorphOptions;
  useViewTransition?: boolean;
}

@meta({
  description: 'Swap content into target elements with intelligent morphing support',
  syntax: [
    'swap <target> with <content>',
    'swap [strategy] of <target> with <content>',
    'swap delete <target>',
  ],
  examples: [
    'swap #target with it',
    'swap innerHTML of #target with it',
    'swap delete #notification',
  ],
  sideEffects: ['dom-mutation'],
})
@command({ name: 'swap', category: 'dom' })
export class SwapCommand {
  async parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> },
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<SwapCommandInput> {
    // Parse and evaluate AST nodes
    const args = raw.args;
    // ... parsing logic
    return { targets, content, strategy, morphOptions, useViewTransition };
  }

  async execute(
    input: SwapCommandInput,
    context: TypedExecutionContext
  ): Promise<void> {
    // Execute command logic
    const { targets, content, strategy, morphOptions, useViewTransition } = input;
    await executeSwapWithTransition(targets, content, strategy, {
      morphOptions,
      useViewTransition,
    });
  }
}

export const createSwapCommand = createFactory(SwapCommand);

// Optional: Legacy export for compatibility
export const swapCommand = createSwapCommand();

export default SwapCommand;
```

**Characteristics:**

- **Stage 3 decorators**: Uses TypeScript 5.0+ standard decorators (no `experimentalDecorators`)
- **Declarative metadata**: `@meta` decorator defines description, syntax, examples, side effects
- **Auto-registration**: `@command` decorator handles category and name registration
- **Factory generation**: `createFactory()` generates type-safe factory functions
- **Class-based**: Clean OOP structure with instance methods
- **Type safety**: Full TypeScript inference from input to output

**Decorator API:**

```typescript
// @meta decorator - command documentation and metadata
@meta({
  description: string,           // Required: What the command does
  syntax: string[],              // Required: Valid syntax patterns
  examples: string[],            // Required: Usage examples
  sideEffects?: CommandSideEffect[], // Optional: ['dom-mutation', 'navigation', etc.]
  deprecated?: string,           // Optional: Deprecation message
  aliases?: string[],            // Optional: Alternative command names
  relatedCommands?: string[],    // Optional: Related commands
})

// @command decorator - registration and categorization
@command({
  name: string,                  // Required: Command name (e.g., 'swap')
  category: CommandCategory,     // Required: 'dom' | 'data' | 'navigation' | etc.
})

// createFactory - generate factory function
export const createCommand = createFactory(CommandClass);
```

**File structure:**

```
packages/core/src/commands/dom/swap.ts
```

```typescript
@meta({ ... })
@command({ name: 'swap', category: 'dom' })
export class SwapCommand { ... }

export const createSwapCommand = createFactory(SwapCommand);
```

---

### When to Customize

The decorator pattern handles most cases. Customize when you need:

- **Shared parsing logic**: Use helper functions in `commands/helpers/`
- **Complex internal state**: Add private methods to the class
- **Multiple related commands**: Define multiple classes in one file (see `swap.ts` with SwapCommand + MorphCommand)

---

## Command Categories

### DOM Commands (12)

Manipulate DOM elements, attributes, classes, and content.

| Command | Description |
|---------|-------------|
| `add` | Add classes or attributes |
| `remove` | Remove classes or attributes |
| `toggle` | Toggle classes or attributes |
| `put` | Insert content at specific position |
| `swap` | Swap content with morphing support |
| `morph` | Morph content (alias for swap with morph strategy) |
| `process` | Process `<hx-partial>` elements for multi-target swaps |
| `show` | Make element visible |
| `hide` | Hide element |
| `take` | Transfer class/attribute from siblings |
| `make` | Create DOM elements or class instances |
| `settle` | Wait for CSS transitions to complete |

### Navigation Commands (3)

Browser history and URL management.

| Command | Description |
|---------|-------------|
| `go` | Navigate to URL or go back/forward |
| `push` | Push URL to browser history |
| `replace` | Replace current history entry |

### Control Flow Commands (9)

Conditionals, loops, and execution flow.

| Command | Description |
|---------|-------------|
| `if` | Conditional execution |
| `unless` | Inverted conditional |
| `else` | Else branch for conditionals |
| `repeat` | Loop with various modes (for-in, counted, forever) |
| `continue` | Skip to next iteration |
| `break` | Exit loop early |
| `return` | Return value from function |
| `throw` | Throw an error |
| `halt` | Stop execution chain |

### Async Commands (2)

Asynchronous operations.

| Command | Description |
|---------|-------------|
| `fetch` | HTTP requests with response handling |
| `async` | Execute commands asynchronously |

### Data Commands (6)

Variable and data management.

| Command | Description |
|---------|-------------|
| `set` | Set variables, properties, attributes |
| `get` | Get values from variables or DOM |
| `default` | Set value only if undefined |
| `increment` | Increment numeric value |
| `decrement` | Decrement numeric value |
| `persist` | Browser storage (localStorage/sessionStorage) |

### Events Commands (2)

Event triggering and handling.

| Command | Description |
|---------|-------------|
| `trigger` | Dispatch custom events |
| `send` | Send events to specific targets |

### Execution Commands (2)

Function calls and pseudo-commands.

| Command | Description |
|---------|-------------|
| `call` | Call JavaScript functions |
| `js` | Execute inline JavaScript |

### Content Commands (1)

Content manipulation.

| Command | Description |
|---------|-------------|
| `render` | Render templates with directives |

### Animation Commands (3)

Transitions and measurements.

| Command | Description |
|---------|-------------|
| `transition` | Animate property changes |
| `measure` | Get element dimensions |
| `transfer` | Transfer computed properties |

### Utility Commands (4)

Miscellaneous utilities.

| Command | Description |
|---------|-------------|
| `log` | Console logging |
| `copy` | Copy to clipboard |
| `pick` | Random selection |
| `beep` | Audio feedback |

### Template Commands (1)

Template rendering.

| Command | Description |
|---------|-------------|
| `render` | Render templates with data binding |

### Behavior Commands (1)

Behavior management.

| Command | Description |
|---------|-------------|
| `install` | Install behavior on element |

---

## Creating New Commands

### Step-by-Step Guide

1. **Create the command file:**

```typescript
// packages/core/src/commands/[category]/my-command.ts

import { command, meta, createFactory } from '../decorators';
import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ASTNode, ExpressionNode } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

export interface MyCommandInput {
  target: string;
  value: any;
}

@meta({
  description: 'What this command does',
  syntax: ['my <target> to <value>'],
  examples: ['my counter to 42', 'my message to "hello"'],
  sideEffects: ['data-mutation'],
})
@command({ name: 'my', category: 'data' })
export class MyCommand {
  async parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> },
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<MyCommandInput> {
    // Parse raw AST nodes into typed input
    const target = await evaluator.evaluate(raw.args[0], context);
    const value = raw.modifiers.to
      ? await evaluator.evaluate(raw.modifiers.to, context)
      : undefined;

    return { target: String(target), value };
  }

  async execute(
    input: MyCommandInput,
    context: TypedExecutionContext
  ): Promise<void> {
    // Execute the command
    context.locals.set(input.target, input.value);
    (context as any).it = input.value;
  }
}

export const createMyCommand = createFactory(MyCommand);
export default MyCommand;
```

2. **Register in the command index:**

```typescript
// packages/core/src/commands/[category]/index.ts
export * from './my-command';
```

3. **Add parser support** (if needed for special syntax):

```typescript
// packages/core/src/parser/commands/my-command-parser.ts
```

4. **Write tests:**

```typescript
// packages/core/src/commands/[category]/my-command.test.ts
```

### Best Practices

- **Single responsibility**: Each command does one thing well
- **Clear error messages**: Include command name in errors: `[HyperFixi] my: error message`
- **Set `context.it`**: Commands should set the result in `context.it`
- **Use helpers**: Share parsing logic via `commands/helpers/`
- **Document thoroughly**: `@meta` decorator should have clear syntax and examples

---

## Examples

### Simple Data Command

```typescript
@meta({
  description: 'Increment a variable or property',
  syntax: ['increment <target>', 'increment <target> by <amount>'],
  examples: ['increment counter', 'increment count by 5'],
  sideEffects: ['data-mutation'],
})
@command({ name: 'increment', category: 'data' })
export class IncrementCommand {
  async parseInput(raw, evaluator, context) {
    const target = await evaluator.evaluate(raw.args[0], context);
    const amount = raw.modifiers.by
      ? await evaluator.evaluate(raw.modifiers.by, context)
      : 1;
    return { target, amount };
  }

  async execute(input, context) {
    const current = context.locals.get(input.target) || 0;
    const newValue = Number(current) + input.amount;
    context.locals.set(input.target, newValue);
    context.it = newValue;
    return newValue;
  }
}
```

### DOM Command with Multiple Strategies

```typescript
@meta({
  description: 'Toggle classes or attributes on elements',
  syntax: [
    'toggle .class on <target>',
    'toggle [@attr] on <target>',
    'toggle between .class1 and .class2 on <target>',
  ],
  examples: [
    'toggle .active on me',
    'toggle [@hidden] on #panel',
    'toggle between .dark and .light on body',
  ],
  sideEffects: ['dom-mutation'],
})
@command({ name: 'toggle', category: 'dom' })
export class ToggleCommand {
  // Implementation with strategy pattern
}
```

### Command with View Transitions

```typescript
@meta({
  description: 'Swap content with view transition support',
  syntax: [
    'swap <target> with <content>',
    'swap <target> with <content> using view transition',
  ],
  examples: ['swap #main with it using view transition'],
  sideEffects: ['dom-mutation'],
})
@command({ name: 'swap', category: 'dom' })
export class SwapCommand {
  async execute(input, context) {
    if (input.useViewTransition && isViewTransitionsSupported()) {
      await withViewTransition(() => {
        executeSwap(input.targets, input.content, input.strategy);
      });
    } else {
      executeSwap(input.targets, input.content, input.strategy);
    }
  }
}
```
