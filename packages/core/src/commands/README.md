# HyperFixi Commands

This directory contains all command implementations for the HyperFixi runtime. Commands are the core building blocks of HyperFixi's hyperscript-like syntax, enabling declarative HTML behaviors.

## Table of Contents

- [Overview](#overview)
- [Command Architecture](#command-architecture)
  - [Class-based Pattern (Legacy)](#class-based-pattern-legacy)
  - [Builder Pattern (Preferred)](#builder-pattern-preferred)
  - [When to Use Each Pattern](#when-to-use-each-pattern)
- [Command Categories](#command-categories)
- [Creating New Commands](#creating-new-commands)
- [Migration Plan](#migration-plan)
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

HyperFixi supports two command implementation patterns. Both patterns produce the same runtime interface but differ in their implementation approach.

### Class-based Pattern (Legacy)

**Used by:** 40 commands (most existing commands)

The Class-based pattern defines commands as TypeScript classes with static metadata and instance methods.

**Structure:**

```typescript
export class GoCommand {
  readonly name = 'go';

  async parseInput(
    raw: GoCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<any[]> {
    // Parse and evaluate AST nodes
    const evaluatedArgs = await Promise.all(
      raw.args.map((arg: ASTNode) => evaluator.evaluate(arg, context))
    );
    return evaluatedArgs;
  }

  async execute(
    args: any[],
    context: ExecutionContext
  ): Promise<string | HTMLElement> {
    // Execute command logic
    if (args[0] === 'back') {
      return await this.goBack(context);
    }
    // ... more logic
  }

  static readonly metadata = {
    description: 'Provides navigation functionality',
    syntax: 'go [to] url <url> | go back',
    examples: ['go to url "https://example.com"', 'go back'],
    category: 'navigation',
  } as const;

  get metadata() {
    return GoCommand.metadata;
  }
}

export function createGoCommand(): GoCommand {
  return new GoCommand();
}
```

**Characteristics:**

- **Class-based**: Commands are defined as ES6 classes
- **Instance methods**: `parseInput()` and `execute()` are instance methods
- **Static metadata**: Command metadata is a static readonly property
- **Manual wiring**: Metadata and methods are manually connected
- **Factory function**: `createXCommand()` factory for instantiation
- **Private helpers**: Complex logic organized in private methods
- **Type parameters**: Input/output types defined via generics or return types

**Advantages:**

- **Familiar OOP patterns**: Developers comfortable with classes
- **Encapsulation**: Private methods for complex internal logic
- **Flexibility**: Easy to add custom instance state if needed
- **Proven pattern**: Used successfully by 40+ commands

**File structure:**

```
packages/core/src/commands/navigation/go.ts
```

```typescript
export class GoCommand { /* ... */ }
export function createGoCommand() { return new GoCommand(); }
```

---

### Builder Pattern (Preferred)

**Used by:** 3 commands (swap, morph, push-url, replace-url)

The Builder pattern uses a fluent API to define commands with zero boilerplate and full type inference.

**Structure:**

```typescript
import { defineCommand, type RawCommandArgs } from '../command-builder';

export interface PushUrlCommandInput {
  url: string;
  title?: string;
  state?: Record<string, unknown>;
}

export const pushUrlCommand = defineCommand('push')
  .category('navigation')
  .description('Push URL to browser history without page reload')
  .syntax([
    'push url <url>',
    'push url <url> with title <title>',
  ])
  .examples([
    'push url "/page/2"',
    'push url location.pathname',
    'push url "/search" with title "Search Results"',
  ])
  .sideEffects(['navigation'])
  .relatedCommands(['replace', 'go'])

  .parseInput<PushUrlCommandInput>(async (
    raw: RawCommandArgs,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<PushUrlCommandInput> => {
    const args = raw.args;
    // ... parsing logic
    return { url, title };
  })

  .execute(async (
    input: PushUrlCommandInput,
    context: TypedExecutionContext
  ): Promise<void> => {
    window.history.pushState(input.state || null, '', input.url);
    if (input.title) {
      document.title = input.title;
    }
  })

  .build();

export default pushUrlCommand;

export function createPushUrlCommand() {
  return pushUrlCommand;
}
```

**Characteristics:**

- **Fluent API**: Chainable method calls for configuration
- **Declarative**: Metadata and implementation in one definition
- **Type inference**: Full TypeScript inference from input to output
- **No decorators**: Works without experimental TC39 decorators
- **Build validation**: `.build()` validates all required fields are set
- **Functional style**: Arrow functions for parseInput/execute
- **Self-documenting**: Clear, linear flow from top to bottom

**Advantages:**

- **Zero boilerplate**: No manual metadata wiring
- **Type safety**: Compiler catches missing required fields
- **Consistency**: All commands follow same structure
- **Readability**: Single definition file, top-to-bottom flow
- **Modern patterns**: Inspired by napi-rs and modern builder patterns
- **Easy migration**: Can switch to decorators later if desired

**Builder API:**

```typescript
defineCommand(name: string)
  .category(cat: CommandCategory)          // required
  .description(desc: string)               // required
  .syntax(syn: string | string[])          // required
  .examples(ex: string[])                  // required (at least 1)
  .sideEffects(effects: CommandSideEffect[])  // optional
  .deprecated(message: string)             // optional
  .aliases(names: string[])                // optional
  .relatedCommands(names: string[])        // optional
  .blocking(isBlocking?: boolean)          // optional
  .hasBody(hasBody?: boolean)              // optional
  .parseInput<TInput>(fn: ParseInputFn<TInput>)  // required
  .execute<TOutput>(fn: ExecuteFn<TInput, TOutput>)  // required
  .validate(fn: ValidateFn<TInput>)        // optional
  .build()                                 // validates and builds
```

**File structure:**

```
packages/core/src/commands/navigation/push-url.ts
```

```typescript
export const pushUrlCommand = defineCommand('push')
  .category(...)
  .parseInput(...)
  .execute(...)
  .build();

export function createPushUrlCommand() { return pushUrlCommand; }
```

---

### When to Use Each Pattern

#### Use Builder Pattern (Preferred) when:

✅ **Creating new commands** - Default choice for all new development
✅ **Stateless commands** - Commands without instance-specific state
✅ **Simple to moderate complexity** - Most hyperscript commands
✅ **Clear input/output types** - Well-defined TypeScript interfaces
✅ **Standard command structure** - Follows typical parseInput/execute flow

**Examples:** swap, morph, push-url, replace-url

#### Use Class-based Pattern when:

✅ **Existing commands** - 40 commands already use this pattern (no need to migrate)
✅ **Complex internal state** - Commands needing instance variables
✅ **Many private helpers** - Complex logic split across many methods
✅ **Special requirements** - Unusual command patterns or edge cases

**Examples:** go, fetch, if, repeat, render

#### Migration Not Required

**Important:** There is **no need to migrate** existing Class-based commands to the Builder pattern. Both patterns:

- Produce identical runtime interfaces
- Support tree-shaking equally well
- Provide full TypeScript type safety
- Work seamlessly together in the same codebase

The Builder pattern is **preferred for new commands** due to reduced boilerplate and better consistency, but existing commands can remain as-is unless there's a specific reason to refactor.

---

## Command Categories

### DOM Commands (12)

Manipulate DOM elements, attributes, classes, and content.

| Command | Description | Pattern |
|---------|-------------|---------|
| `add` | Add classes or attributes | Class-based |
| `remove` | Remove classes or attributes | Class-based |
| `toggle` | Toggle classes or attributes | Class-based |
| `put` | Insert content at specific position | Class-based |
| `swap` | Swap content with morphing support | **Builder** |
| `morph` | Morph content (alias for swap) | **Builder** |
| `hide` | Hide elements | Class-based |
| `show` | Show elements | Class-based |
| `make` | Create new elements | Class-based |
| `process-partials` | Process HTML partials | Class-based |

### Navigation Commands (3)

Manage browser history and URLs.

| Command | Description | Pattern |
|---------|-------------|---------|
| `go` | Navigate to URLs or scroll to elements | Class-based |
| `push` | Push URL to history | **Builder** |
| `replace` | Replace URL in history | **Builder** |

### Control Flow Commands (9)

Control program flow with conditionals, loops, and flow control.

| Command | Description | Pattern |
|---------|-------------|---------|
| `if` | Conditional execution | Class-based |
| `unless` | Inverted conditional | Class-based |
| `repeat` | Repeat commands for collections | Class-based |
| `break` | Break out of loops | Class-based |
| `continue` | Continue to next iteration | Class-based |
| `halt` | Halt execution | Class-based |
| `return` | Return from function | Class-based |
| `exit` | Exit from behavior | Class-based |
| `throw` | Throw exceptions | Class-based |

### Async Commands (2)

Handle asynchronous operations.

| Command | Description | Pattern |
|---------|-------------|---------|
| `wait` | Wait for duration or event | Class-based |
| `fetch` | Fetch data from URLs | Class-based |

### Data Commands (6)

Manage variables and data persistence.

| Command | Description | Pattern |
|---------|-------------|---------|
| `set` | Set variable values | Class-based |
| `increment` | Increment numeric variables | Class-based |
| `decrement` | Decrement numeric variables | Class-based |
| `bind` | Bind values to elements | Class-based |
| `default` | Set default values | Class-based |
| `persist` | Persist data to localStorage | Class-based |

### Event Commands (2)

Trigger and dispatch events.

| Command | Description | Pattern |
|---------|-------------|---------|
| `trigger` | Trigger events on elements | Class-based |
| `send` | Send custom events | Class-based |

### Execution Commands (2)

Execute functions and pseudo-commands.

| Command | Description | Pattern |
|---------|-------------|---------|
| `call` | Call functions | Class-based |
| `pseudo-command` | Execute pseudo-commands | Class-based |

### Content Commands (1)

Insert and manipulate content.

| Command | Description | Pattern |
|---------|-------------|---------|
| `append` | Append content to elements | Class-based |

### Animation Commands (3)

Handle transitions and animations.

| Command | Description | Pattern |
|---------|-------------|---------|
| `transition` | Apply CSS transitions | Class-based |
| `measure` | Measure element properties | Class-based |
| `settle` | Wait for animations to complete | Class-based |
| `take` | Transfer properties between elements | Class-based |

### Utility Commands (4)

General utility functions.

| Command | Description | Pattern |
|---------|-------------|---------|
| `log` | Log values to console | Class-based |
| `tell` | Tell messages to elements | Class-based |
| `copy` | Copy text to clipboard | Class-based |
| `pick` | Pick random values | Class-based |
| `beep` | Play notification sound | Class-based |

### Templates Commands (1)

Render templates with directives.

| Command | Description | Pattern |
|---------|-------------|---------|
| `render` | Render templates with @if/@else/@repeat | Class-based |

### Behaviors Commands (1)

Install behaviors on elements.

| Command | Description | Pattern |
|---------|-------------|---------|
| `install` | Install behaviors | Class-based |

---

## Creating New Commands

### Step 1: Choose a Pattern

For new commands, **use the Builder pattern** unless you have specific requirements that demand the Class-based pattern.

### Step 2: Define Input/Output Types

Create TypeScript interfaces for your command's input and output:

```typescript
export interface MyCommandInput {
  target: HTMLElement;
  value: string;
  options?: {
    animate?: boolean;
    duration?: number;
  };
}
```

### Step 3: Implement Command (Builder Pattern)

```typescript
import { defineCommand, type RawCommandArgs } from '../command-builder';
import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

export const myCommand = defineCommand('my-command')
  .category('dom')
  .description('Does something useful')
  .syntax(['my-command <target> with <value>'])
  .examples(['my-command #element with "hello"'])
  .sideEffects(['dom-mutation'])

  .parseInput<MyCommandInput>(async (
    raw: RawCommandArgs,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<MyCommandInput> => {
    // Parse arguments
    const target = await evaluator.evaluate(raw.args[0], context);
    const value = await evaluator.evaluate(raw.args[1], context);

    return { target, value };
  })

  .execute(async (
    input: MyCommandInput,
    context: TypedExecutionContext
  ): Promise<void> => {
    // Execute command logic
    input.target.textContent = input.value;
  })

  .build();

export function createMyCommand() {
  return myCommand;
}
```

### Step 4: Register Command

Add your command to `index.ts`:

```typescript
export { myCommand, createMyCommand } from './dom/my-command';
export type { MyCommandInput } from './dom/my-command';
```

### Step 5: Add Tests

Create tests in `__tests__/my-command.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myCommand } from '../dom/my-command';

describe('myCommand', () => {
  it('should have correct metadata', () => {
    expect(myCommand.name).toBe('my-command');
    expect(myCommand.metadata.category).toBe('dom');
  });
});
```

---

## Migration Plan

### Current Status

- **Builder Pattern:** 3 commands (swap, morph, push-url, replace-url)
- **Class-based Pattern:** 40 commands (all others)

### Future Direction

**No mass migration planned.** Both patterns coexist successfully and provide identical runtime functionality.

**Migration criteria** (only if beneficial):

1. **Refactoring opportunity** - Command already being heavily modified
2. **Consistency improvement** - Related commands in same category
3. **Complexity reduction** - Command has excessive boilerplate
4. **Developer preference** - Team decides to standardize

**Migration is NOT required for:**

- ✅ Commands working correctly as-is
- ✅ Commands with complex private method hierarchies
- ✅ Commands with unique instance state requirements
- ✅ Commands without maintenance needs

---

## Examples

### Example 1: Simple Command (Builder Pattern)

**beep-v2.ts** (hypothetical Builder version):

```typescript
export const beepCommand = defineCommand('beep')
  .category('utility')
  .description('Play a notification beep sound')
  .syntax(['beep', 'beep <frequency>', 'beep <frequency> for <duration>'])
  .examples(['beep', 'beep 440', 'beep 880 for 200'])
  .sideEffects(['audio'])

  .parseInput<{ frequency?: number; duration?: number }>(async (
    raw, evaluator, context
  ) => {
    const args = await Promise.all(
      raw.args.map(arg => evaluator.evaluate(arg, context))
    );
    return {
      frequency: args[0] ? Number(args[0]) : 440,
      duration: args[1] ? Number(args[1]) : 100,
    };
  })

  .execute(async (input) => {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    oscillator.frequency.value = input.frequency;
    oscillator.connect(audio.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), input.duration);
  })

  .build();
```

### Example 2: Complex Command (Class-based Pattern)

**go.ts** (existing):

```typescript
export class GoCommand {
  readonly name = 'go';

  async parseInput(raw, evaluator, context): Promise<any[]> {
    return await Promise.all(
      raw.args.map(arg => evaluator.evaluate(arg, context))
    );
  }

  async execute(args, context): Promise<string | HTMLElement> {
    if (args[0] === 'back') {
      return await this.goBack(context);
    }
    if (this.isUrlNavigation(args)) {
      return await this.navigateToUrl(args, context);
    }
    return await this.scrollToElement(args, context);
  }

  // 10+ private helper methods...
  private isUrlNavigation(args: any[]): boolean { /* ... */ }
  private navigateToUrl(args: any[], context): Promise<string> { /* ... */ }
  private scrollToElement(args: any[], context): Promise<HTMLElement> { /* ... */ }
  // ... etc
}
```

**Why it stays Class-based:**

- ✅ Complex logic split across many private methods
- ✅ Three distinct execution paths with different logic
- ✅ Already working well, no maintenance issues
- ✅ OOP encapsulation benefits outweigh Builder pattern benefits

### Example 3: Migration Example

**Before (Class-based):**

```typescript
export class PushUrlCommand {
  readonly name = 'push';

  async parseInput(raw, evaluator, context) {
    const url = await evaluator.evaluate(raw.args[0], context);
    const title = await evaluator.evaluate(raw.args[1], context);
    return { url, title };
  }

  async execute(input) {
    window.history.pushState(null, '', input.url);
    if (input.title) document.title = input.title;
  }

  static metadata = { /* ... */ };
}
```

**After (Builder):**

```typescript
export const pushUrlCommand = defineCommand('push')
  .category('navigation')
  .description('Push URL to browser history')
  .syntax(['push url <url>', 'push url <url> with title <title>'])
  .examples(['push url "/page/2"'])
  .sideEffects(['navigation'])

  .parseInput<PushUrlCommandInput>(async (raw, evaluator, context) => {
    const url = await evaluator.evaluate(raw.args[0], context);
    const title = await evaluator.evaluate(raw.args[1], context);
    return { url, title };
  })

  .execute(async (input) => {
    window.history.pushState(null, '', input.url);
    if (input.title) document.title = input.title;
  })

  .build();
```

**Benefits:**

- ✅ Less boilerplate (no class definition, static metadata getter)
- ✅ Metadata co-located with implementation
- ✅ Type inference from parseInput to execute
- ✅ Build-time validation of required fields

---

## Best Practices

### General Guidelines

1. **Type safety first**: Always define TypeScript interfaces for input/output
2. **Single responsibility**: Each command should do one thing well
3. **Error handling**: Provide clear error messages with context
4. **Documentation**: Include JSDoc comments explaining syntax and behavior
5. **Examples**: Provide at least 2-3 usage examples in metadata
6. **Testing**: Write unit tests for parseInput and execute separately

### Builder Pattern Guidelines

1. **Call `.build()` last**: Always end with `.build()` to validate
2. **Type parameters**: Use `.parseInput<T>()` and `.execute<O>()` for inference
3. **Required fields**: Category, description, syntax, examples, parseInput, execute
4. **Keyword handling**: Extract keywords from AST before evaluation (see swap.ts)
5. **Selector handling**: Check for selector nodes before evaluation (see swap.ts)

### Class-based Pattern Guidelines

1. **Static metadata**: Always use `static readonly metadata` for tree-shaking
2. **Factory functions**: Export `createXCommand()` factory for consistency
3. **Private methods**: Use private methods for complex internal logic
4. **Instance getter**: Provide `get metadata()` for backward compatibility

---

## Resources

- **Builder Implementation**: `command-builder.ts`
- **Class-based Examples**: `navigation/go.ts`, `control-flow/if.ts`
- **Builder Examples**: `dom/swap.ts`, `navigation/push-url.ts`
- **Command Registry**: `runtime.ts` (command registration)
- **Test Examples**: `__tests__/` directory

---

## Summary

HyperFixi supports two command patterns:

1. **Builder Pattern** (preferred for new commands)
   - Zero boilerplate, full type inference
   - Self-documenting, declarative syntax
   - Used by 3 commands: swap, morph, push-url, replace-url

2. **Class-based Pattern** (existing commands)
   - Traditional OOP approach
   - Good for complex logic with many helpers
   - Used by 40 commands: go, if, repeat, fetch, etc.

**Both patterns produce identical runtime interfaces and support tree-shaking equally well.**

When creating new commands, prefer the Builder pattern for consistency and reduced boilerplate. Existing Class-based commands do not need migration unless there's a specific maintenance or refactoring benefit.
