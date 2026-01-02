# Hybrid Bundle Architecture Plan

**Status:** ✅ Implemented (3 variants)

## Implemented Bundles

| Bundle | Size | Features |
|--------|------|----------|
| **Hybrid Lite** | 4.6 KB | Tiered regex/mini-parser, event modifiers |
| **Hybrid** | 5.5 KB | Full recursive descent parser, AST |
| **Hybrid Complete** | 6.0 KB | Best of both: full parser + event modifiers + i18n |

### Files

- `packages/core/src/compatibility/browser-bundle-hybrid-lite.ts` - Tiered approach
- `packages/core/src/compatibility/browser-bundle-hybrid.ts` - Full parser
- `packages/core/src/compatibility/browser-bundle-hybrid-complete.ts` - Combined best features

### Test Pages

- `packages/core/test-hybrid-lite.html` - Tests for hybrid-lite
- `packages/core/test-hybrid-complete.html` - Tests for hybrid-complete

---

**Original Target Size:** ~4.3 KB gzipped (Hybrid), ~4.8 KB (Hybrid Plus)
**Base:** Extends lite-plus bundle with mini-parser for complex features

## Design Philosophy

The hybrid bundle uses a tiered approach: fast regex matching for common patterns, falling back to a mini-parser only when needed.

```
┌──────────────────────────────────────────────────────────────────┐
│  INPUT: "repeat 3 times toggle .blink then wait 500ms"           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  TIER 1: REGEX FAST PATH (~80% of inputs)                        │
│  ✓ "on click toggle .active"                                     │
│  ✓ "add .highlight to #box"                                      │
│  ✗ Complex → falls through                                       │
└──────────────────────────────────────────────────────────────────┘
                              ↓ (if regex fails)
┌──────────────────────────────────────────────────────────────────┐
│  TIER 2: MINI-TOKENIZER + SIMPLE PARSER                          │
│  ✓ "repeat N times ... end"                                      │
│  ✓ "if condition ... else ... end"                               │
│  ✓ "fetch /url then put it into #target"                         │
└──────────────────────────────────────────────────────────────────┘
                              ↓ (for expressions)
┌──────────────────────────────────────────────────────────────────┐
│  TIER 3: EXPRESSION EVALUATOR (optional, lazy-loaded)            │
│  ✓ "(count + 1) * 2"                                             │
│  ✓ "first in items"                                              │
│  ✓ "element's textContent"                                       │
└──────────────────────────────────────────────────────────────────┘
```

## File Structure

```
packages/core/src/compatibility/
├── browser-bundle-hybrid.ts        # Main entry (~500 lines)
├── hybrid/
│   ├── tokenizer.ts               # Simple state machine (~100 lines)
│   ├── mini-parser.ts             # Recursive descent (~150 lines)
│   ├── expression-eval.ts         # Optional expressions (~100 lines)
│   └── commands/
│       ├── repeat.ts              # Loop command (~40 lines)
│       ├── fetch.ts               # Network command (~50 lines)
│       └── if-else.ts             # Conditional blocks (~40 lines)
```

## Estimated Sizes

| Component | Lines | Gzip |
|-----------|-------|------|
| Lite Plus base | 600 | 2.6 KB |
| Tokenizer | 100 | +0.4 KB |
| Mini-parser | 150 | +0.6 KB |
| repeat command | 40 | +0.2 KB |
| fetch command | 50 | +0.3 KB |
| if/else blocks | 40 | +0.2 KB |
| **Hybrid Total** | **~980** | **~4.3 KB** |
| Expression eval (opt) | 100 | +0.5 KB |
| **Hybrid Plus** | **~1080** | **~4.8 KB** |

## Token Types (Minimal Set)

```typescript
type TokenType =
  | 'keyword'    // on, repeat, if, else, end, fetch, then
  | 'command'    // toggle, add, remove, set, put, wait...
  | 'identifier' // variable names
  | 'selector'   // .class, #id, [attr]
  | 'string'     // "text", 'text'
  | 'number'     // 123, 500ms, 2s
  | 'localVar'   // :count, :result
  | 'operator'   // +, -, *, /, ==, !=, <, >
  | 'symbol'     // (, ), ,
  | 'eof';

const KEYWORDS = new Set([
  'on', 'from', 'repeat', 'times', 'if', 'else', 'end',
  'fetch', 'as', 'then', 'while', 'until', 'for', 'in'
]);

const COMMANDS = new Set([
  'toggle', 'add', 'remove', 'take', 'put', 'append',
  'set', 'increment', 'decrement', 'show', 'hide',
  'focus', 'blur', 'log', 'send', 'trigger', 'wait', 'go'
]);
```

## Mini-Parser Grammar

```
program     → eventHandler | commandList
eventHandler → 'on' EVENT ['from' SELECTOR] commandList

commandList → command (('then' | 'and') command)*
command     → simpleCmd | repeatCmd | ifCmd | fetchCmd

simpleCmd   → COMMAND args*                    // regex handles
repeatCmd   → 'repeat' NUMBER 'times' commandList 'end'
ifCmd       → 'if' condition commandList ['else' commandList] 'end'
fetchCmd    → 'fetch' URL ['as' TYPE] 'then' commandList

condition   → value COMPARATOR value | value
value       → STRING | NUMBER | SELECTOR | LOCAL_VAR | property
property    → value "'s" IDENTIFIER | value '.' IDENTIFIER
```

## Implementation Details

### 1. Tokenizer (state machine)

```typescript
interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    // Skip whitespace
    if (/\s/.test(code[pos])) { pos++; continue; }

    // Comments: -- to end of line
    if (code.slice(pos, pos + 2) === '--') {
      while (pos < code.length && code[pos] !== '\n') pos++;
      continue;
    }

    // String literals
    if (code[pos] === '"' || code[pos] === "'") {
      const quote = code[pos++];
      const start = pos;
      while (pos < code.length && code[pos] !== quote) {
        if (code[pos] === '\\') pos++; // escape
        pos++;
      }
      tokens.push({ type: 'string', value: code.slice(start, pos++), pos: start });
      continue;
    }

    // Selectors: .class, #id
    if (code[pos] === '.' || code[pos] === '#') {
      const start = pos++;
      while (pos < code.length && /[\w-]/.test(code[pos])) pos++;
      tokens.push({ type: 'selector', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Attribute selectors: [attr=value]
    if (code[pos] === '[') {
      const start = pos++;
      while (pos < code.length && code[pos] !== ']') pos++;
      pos++; // include ]
      tokens.push({ type: 'selector', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Local variables: :name
    if (code[pos] === ':') {
      const start = pos++;
      while (pos < code.length && /\w/.test(code[pos])) pos++;
      tokens.push({ type: 'localVar', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Numbers (with units): 500ms, 2s, 100px
    if (/\d/.test(code[pos])) {
      const start = pos;
      while (pos < code.length && /[\d.]/.test(code[pos])) pos++;
      // Handle units
      if (code.slice(pos, pos + 2) === 'ms') pos += 2;
      else if (code[pos] === 's' && !/[a-zA-Z]/.test(code[pos + 1] || '')) pos++;
      else if (code.slice(pos, pos + 2) === 'px') pos += 2;
      tokens.push({ type: 'number', value: code.slice(start, pos), pos: start });
      continue;
    }

    // URLs: /path or https://...
    if (code[pos] === '/' || code.slice(pos, pos + 4) === 'http') {
      const start = pos;
      while (pos < code.length && !/\s/.test(code[pos])) pos++;
      tokens.push({ type: 'string', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Keywords and identifiers
    if (/[a-zA-Z_]/.test(code[pos])) {
      const start = pos;
      while (pos < code.length && /\w/.test(code[pos])) pos++;
      const value = code.slice(start, pos);
      const lower = value.toLowerCase();
      const type = KEYWORDS.has(lower) ? 'keyword' :
                   COMMANDS.has(lower) ? 'command' : 'identifier';
      tokens.push({ type, value, pos: start });
      continue;
    }

    // Operators: ==, !=, <=, >=, 's (possessive)
    if (code.slice(pos, pos + 2) === "'s") {
      tokens.push({ type: 'operator', value: "'s", pos });
      pos += 2;
      continue;
    }
    const twoChar = code.slice(pos, pos + 2);
    if (['==', '!=', '<=', '>='].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar, pos });
      pos += 2;
      continue;
    }
    if (['+', '-', '*', '/', '<', '>', '='].includes(code[pos])) {
      tokens.push({ type: 'operator', value: code[pos], pos });
      pos++;
      continue;
    }

    // Symbols
    if ('()[]{},.'.includes(code[pos])) {
      tokens.push({ type: 'symbol', value: code[pos], pos });
      pos++;
      continue;
    }

    // Unknown - skip
    pos++;
  }

  tokens.push({ type: 'eof', value: '', pos });
  return tokens;
}
```

### 2. Repeat Command

```typescript
interface RepeatNode {
  type: 'repeat';
  count: number;
  body: Command[];
}

function parseRepeat(tokens: Token[], pos: number): [RepeatNode, number] {
  // repeat N times ... end
  pos++; // skip 'repeat'

  const countToken = tokens[pos++];
  const count = parseInt(countToken.value);

  // skip 'times'
  if (tokens[pos].value.toLowerCase() === 'times') pos++;

  const body: Command[] = [];
  while (pos < tokens.length && tokens[pos].value.toLowerCase() !== 'end') {
    if (tokens[pos].type === 'eof') {
      throw new Error('Missing "end" for repeat block');
    }
    const [cmd, newPos] = parseCommand(tokens, pos);
    body.push(cmd);
    pos = newPos;

    // Skip 'then' or 'and' between commands
    if (['then', 'and'].includes(tokens[pos]?.value?.toLowerCase())) {
      pos++;
    }
  }
  pos++; // skip 'end'

  return [{ type: 'repeat', count, body }, pos];
}

async function executeRepeat(node: RepeatNode, ctx: Context): Promise<void> {
  for (let i = 0; i < node.count; i++) {
    ctx.locals.set('index', i);
    ctx.locals.set('count', i + 1);
    for (const cmd of node.body) {
      await executeCommand(cmd, ctx);
    }
  }
}
```

### 3. Fetch Command

```typescript
interface FetchNode {
  type: 'fetch';
  url: string;
  responseType: 'text' | 'json' | 'html';
  then: Command[];
}

function parseFetch(tokens: Token[], pos: number): [FetchNode, number] {
  // fetch /url [as json|text|html] then ...
  pos++; // skip 'fetch'

  const urlToken = tokens[pos++];
  const url = urlToken.value;

  let responseType: 'text' | 'json' | 'html' = 'text';
  if (tokens[pos]?.value?.toLowerCase() === 'as') {
    pos++;
    responseType = tokens[pos++].value.toLowerCase() as any;
  }

  // skip 'then'
  if (tokens[pos]?.value?.toLowerCase() === 'then') pos++;

  // Parse commands until end of input or block terminator
  const thenCmds: Command[] = [];
  while (pos < tokens.length &&
         tokens[pos].type !== 'eof' &&
         !['end', 'else'].includes(tokens[pos].value?.toLowerCase())) {
    const [cmd, newPos] = parseCommand(tokens, pos);
    thenCmds.push(cmd);
    pos = newPos;

    if (['then', 'and'].includes(tokens[pos]?.value?.toLowerCase())) {
      pos++;
    }
  }

  return [{ type: 'fetch', url, responseType, then: thenCmds }, pos];
}

async function executeFetch(node: FetchNode, ctx: Context): Promise<void> {
  try {
    const response = await fetch(node.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let data: any;
    switch (node.responseType) {
      case 'json':
        data = await response.json();
        break;
      case 'html':
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        data = doc.body;
        break;
      default:
        data = await response.text();
    }

    // Store result in context
    ctx.locals.set('it', data);
    ctx.locals.set('result', data);
    ctx.locals.set('response', response);

    // Execute then commands
    for (const cmd of node.then) {
      await executeCommand(cmd, ctx);
    }
  } catch (error) {
    ctx.locals.set('error', error);
    console.error('Fetch error:', error);
  }
}
```

### 4. If/Else Blocks

```typescript
interface IfNode {
  type: 'if';
  condition: Condition;
  then: Command[];
  else: Command[];
}

interface Condition {
  left: string;
  operator?: string;
  right?: string;
}

function parseIf(tokens: Token[], pos: number): [IfNode, number] {
  // if condition ... [else ...] end
  pos++; // skip 'if'

  // Parse condition (simplified: just read until a command keyword)
  const conditionParts: string[] = [];
  while (pos < tokens.length &&
         tokens[pos].type !== 'command' &&
         tokens[pos].value.toLowerCase() !== 'then') {
    conditionParts.push(tokens[pos].value);
    pos++;
  }

  // Skip optional 'then'
  if (tokens[pos]?.value?.toLowerCase() === 'then') pos++;

  const condition = parseCondition(conditionParts.join(' '));

  // Parse then body
  const thenBody: Command[] = [];
  while (pos < tokens.length &&
         !['else', 'end'].includes(tokens[pos].value?.toLowerCase()) &&
         tokens[pos].type !== 'eof') {
    const [cmd, newPos] = parseCommand(tokens, pos);
    thenBody.push(cmd);
    pos = newPos;

    if (['then', 'and'].includes(tokens[pos]?.value?.toLowerCase())) {
      pos++;
    }
  }

  // Parse else body (optional)
  let elseBody: Command[] = [];
  if (tokens[pos]?.value?.toLowerCase() === 'else') {
    pos++; // skip 'else'

    while (pos < tokens.length &&
           tokens[pos].value?.toLowerCase() !== 'end' &&
           tokens[pos].type !== 'eof') {
      const [cmd, newPos] = parseCommand(tokens, pos);
      elseBody.push(cmd);
      pos = newPos;

      if (['then', 'and'].includes(tokens[pos]?.value?.toLowerCase())) {
        pos++;
      }
    }
  }

  // Skip 'end'
  if (tokens[pos]?.value?.toLowerCase() === 'end') pos++;

  return [{ type: 'if', condition, then: thenBody, else: elseBody }, pos];
}

function parseCondition(expr: string): Condition {
  // Simple patterns:
  // "me has .active"
  // ":count > 5"
  // "my.checked"
  // ":enabled"

  const hasMatch = expr.match(/^(.+?)\s+has\s+(.+)$/i);
  if (hasMatch) {
    return { left: hasMatch[1], operator: 'has', right: hasMatch[2] };
  }

  const compMatch = expr.match(/^(.+?)\s*(==|!=|<=|>=|<|>|is|is not)\s*(.+)$/i);
  if (compMatch) {
    return { left: compMatch[1], operator: compMatch[2], right: compMatch[3] };
  }

  // Simple truthy check
  return { left: expr.trim() };
}

async function executeIf(node: IfNode, ctx: Context): Promise<void> {
  const result = evaluateCondition(node.condition, ctx);

  const body = result ? node.then : node.else;
  for (const cmd of body) {
    await executeCommand(cmd, ctx);
  }
}

function evaluateCondition(cond: Condition, ctx: Context): boolean {
  const leftVal = evaluateValue(cond.left, ctx);

  if (!cond.operator) {
    return Boolean(leftVal);
  }

  const rightVal = cond.right ? evaluateValue(cond.right, ctx) : undefined;

  switch (cond.operator.toLowerCase()) {
    case 'has':
      if (leftVal instanceof Element && typeof rightVal === 'string') {
        if (rightVal.startsWith('.')) {
          return leftVal.classList.contains(rightVal.slice(1));
        }
      }
      return false;
    case '==':
    case 'is':
      return leftVal == rightVal;
    case '!=':
    case 'is not':
      return leftVal != rightVal;
    case '<':
      return Number(leftVal) < Number(rightVal);
    case '>':
      return Number(leftVal) > Number(rightVal);
    case '<=':
      return Number(leftVal) <= Number(rightVal);
    case '>=':
      return Number(leftVal) >= Number(rightVal);
    default:
      return Boolean(leftVal);
  }
}
```

### 5. Main Parser Integration

```typescript
function parseHybrid(code: string): ParsedResult {
  const trimmed = code.trim();

  // TIER 1: Try regex fast path for simple patterns
  const regexResult = tryRegexParse(trimmed);
  if (regexResult) {
    return regexResult;
  }

  // TIER 2: Fall back to tokenizer + mini-parser
  const tokens = tokenize(trimmed);
  return parseTokens(tokens);
}

function parseTokens(tokens: Token[]): ParsedResult {
  let pos = 0;

  // Check for event handler: "on click ..."
  if (tokens[pos]?.value?.toLowerCase() === 'on') {
    return parseEventHandler(tokens, pos);
  }

  // Parse as command list
  const commands: Command[] = [];
  while (pos < tokens.length && tokens[pos].type !== 'eof') {
    const [cmd, newPos] = parseCommand(tokens, pos);
    commands.push(cmd);
    pos = newPos;

    // Skip connectors
    if (['then', 'and'].includes(tokens[pos]?.value?.toLowerCase())) {
      pos++;
    }
  }

  return { type: 'commands', commands };
}

function parseCommand(tokens: Token[], pos: number): [Command, number] {
  const token = tokens[pos];

  // Block commands
  switch (token.value?.toLowerCase()) {
    case 'repeat':
      return parseRepeat(tokens, pos);
    case 'if':
      return parseIf(tokens, pos);
    case 'fetch':
      return parseFetch(tokens, pos);
  }

  // Simple commands - collect until connector or end
  const parts: string[] = [];
  while (pos < tokens.length &&
         tokens[pos].type !== 'eof' &&
         !['then', 'and', 'end', 'else'].includes(tokens[pos].value?.toLowerCase())) {
    parts.push(tokens[pos].value);
    pos++;
  }

  // Use lite-plus regex parser for simple commands
  const simpleResult = parseSimpleCommand(parts.join(' '));
  return [simpleResult, pos];
}
```

## Feature Comparison

| Feature | Lite+ | Hybrid | Hybrid+ |
|---------|-------|--------|---------|
| Size (gzip) | 2.6 KB | 4.3 KB | 4.8 KB |
| `toggle .active` | ✅ | ✅ | ✅ |
| `wait 500ms` | ✅ | ✅ | ✅ |
| `increment #counter` | ✅ | ✅ | ✅ |
| `repeat 3 times ... end` | ❌ | ✅ | ✅ |
| `fetch /api then ...` | ❌ | ✅ | ✅ |
| `if condition ... end` | ❌ | ✅ | ✅ |
| `if ... else ... end` | ❌ | ✅ | ✅ |
| `element's property` | ❌ | ❌ | ✅ |
| `(a + b) * c` | ❌ | ❌ | ✅ |
| `first in items` | ❌ | ❌ | ✅ |
| Language aliases | ✅ | ✅ | ✅ |

## Example Usage

```html
<!-- Lite Plus: Simple interactions -->
<button _="on click toggle .active">Toggle</button>
<button _="on click increment #counter">+1</button>

<!-- Hybrid: Loops and conditionals -->
<button _="on click repeat 3 times toggle .blink then wait 200ms end">
  Blink 3x
</button>

<button _="on click
  if me has .loading
    remove .loading
  else
    add .loading then
    fetch /api/data as json then
    put it into #result then
    remove .loading
  end">
  Load Data
</button>

<!-- Hybrid Plus: Expressions -->
<button _="on click
  set :total to #price's textContent
  set :tax to (:total * 0.1)
  put (:total + :tax) into #total">
  Calculate
</button>
```

## Implementation Steps

1. **Create `browser-bundle-hybrid.ts`**
   - Copy lite-plus as base
   - Add detection for block commands
   - Integrate tokenizer

2. **Add `hybrid/tokenizer.ts`**
   - Simple state machine
   - Handle all token types
   - ~100 lines

3. **Add `hybrid/mini-parser.ts`**
   - Recursive descent parser
   - Handle repeat, if/else, fetch
   - ~150 lines

4. **Add block commands**
   - `hybrid/commands/repeat.ts` (~40 lines)
   - `hybrid/commands/fetch.ts` (~50 lines)
   - `hybrid/commands/if-else.ts` (~40 lines)

5. **Create rollup config**
   - `rollup.browser-hybrid.config.mjs`
   - Same terser settings as lite-plus

6. **Test and verify size**
   - Target: ~4.3 KB gzipped
   - Test all new features

7. **Optional: Expression evaluator**
   - `hybrid/expression-eval.ts` (~100 lines)
   - Arithmetic, property access, positional
   - Creates Hybrid Plus bundle

## Related Files

- `packages/core/src/compatibility/browser-bundle-lite-plus.ts` - Base bundle
- `packages/core/src/compatibility/aliases/README.md` - i18n pattern
- `packages/core/rollup.browser-lite-plus.config.mjs` - Build config reference

## Bundle Size Targets

| Bundle | Commands | Target Size |
|--------|----------|-------------|
| Lite | 8 | 1.9 KB |
| Lite Plus | 14 | 2.6 KB |
| **Hybrid** | 14 + blocks | **4.3 KB** |
| Hybrid Plus | 14 + blocks + expr | 4.8 KB |
| Standard | 25 | 65 KB |
| Full | 43 | 85 KB |
