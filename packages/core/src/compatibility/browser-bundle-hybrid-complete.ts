/**
 * HyperFixi Hybrid Complete Browser Bundle
 *
 * Combines the best of both hybrid approaches:
 * - Full recursive descent parser with operator precedence (from Hybrid)
 * - Event modifiers: .once, .prevent, .stop, .debounce, .throttle (from Hybrid Lite)
 * - While loops, fetch blocks (from Hybrid Lite)
 * - i18n alias system (from Hybrid Lite)
 * - Smart hybrid detection for fast regex path (from Hybrid Lite)
 * - Positional expressions, function calls (from Hybrid)
 * - HTML selector syntax <button.class/> (from Hybrid)
 *
 * Target: ~7-8 KB gzipped (~85% hyperscript coverage)
 */

// ============== KEYWORD ALIASES (from Hybrid Lite) ==============

const COMMAND_ALIASES: Record<string, string> = {
  flip: 'toggle', switch: 'toggle', display: 'show', reveal: 'show',
  conceal: 'hide', increase: 'increment', decrease: 'decrement',
  fire: 'trigger', dispatch: 'send', navigate: 'go', goto: 'go',
};

const EVENT_ALIASES: Record<string, string> = {
  clicked: 'click', pressed: 'keydown', changed: 'change',
  submitted: 'submit', loaded: 'load',
};

function normalizeCommand(name: string): string {
  const lower = name.toLowerCase();
  return COMMAND_ALIASES[lower] || lower;
}

function normalizeEvent(name: string): string {
  const lower = name.toLowerCase();
  return EVENT_ALIASES[lower] || lower;
}

// ============== TOKENIZER ==============

type TokenType =
  | 'identifier' | 'number' | 'string' | 'operator' | 'styleProperty'
  | 'selector' | 'localVar' | 'globalVar' | 'symbol' | 'keyword' | 'eof';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS = new Set([
  'on', 'from', 'to', 'into', 'before', 'after', 'in', 'of', 'at', 'with',
  'if', 'else', 'unless', 'end', 'then', 'and', 'or', 'not',
  'repeat', 'times', 'for', 'each', 'while', 'until',
  'toggle', 'add', 'remove', 'put', 'set', 'get', 'call', 'return', 'append',
  'log', 'send', 'trigger', 'wait', 'settle', 'fetch', 'as',
  'show', 'hide', 'take', 'increment', 'decrement', 'focus', 'blur', 'go',
  'the', 'a', 'an', 'my', 'its', 'me', 'it', 'you',
  'first', 'last', 'next', 'previous', 'closest', 'parent',
  'true', 'false', 'null', 'undefined',
  'is', 'matches', 'contains', 'includes', 'exists', 'has',
  'init', 'every', 'by',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    if (/\s/.test(code[pos])) { pos++; continue; }

    // Comments
    if (code.slice(pos, pos + 2) === '--') {
      while (pos < code.length && code[pos] !== '\n') pos++;
      continue;
    }

    const start = pos;

    // HTML selector: <button.class/> - only if followed by a letter (tag name)
    // If followed by space, number, or '=' it's a comparison operator instead
    if (code[pos] === '<' && /[a-zA-Z]/.test(code[pos + 1] || '')) {
      pos++;
      while (pos < code.length && code[pos] !== '>') pos++;
      if (code[pos] === '>') pos++;
      const val = code.slice(start, pos);
      if (val.endsWith('/>') || val.endsWith('>')) {
        const normalized = val.slice(1).replace(/\/?>$/, '');
        tokens.push({ type: 'selector', value: normalized, pos: start });
        continue;
      }
    }

    // Possessive 's - check BEFORE string literals to avoid treating as unclosed string
    if (code.slice(pos, pos + 2) === "'s" && !/[a-zA-Z]/.test(code[pos + 2] || '')) {
      tokens.push({ type: 'operator', value: "'s", pos: start });
      pos += 2;
      continue;
    }

    // String literals
    if (code[pos] === '"' || code[pos] === "'") {
      const quote = code[pos++];
      while (pos < code.length && code[pos] !== quote) {
        if (code[pos] === '\\') pos++;
        pos++;
      }
      pos++;
      tokens.push({ type: 'string', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Numbers with units
    if (/\d/.test(code[pos]) || (code[pos] === '-' && /\d/.test(code[pos + 1] || ''))) {
      if (code[pos] === '-') pos++;
      while (pos < code.length && /[\d.]/.test(code[pos])) pos++;
      if (code.slice(pos, pos + 2) === 'ms') pos += 2;
      else if (code[pos] === 's' && !/[a-zA-Z]/.test(code[pos + 1] || '')) pos++;
      else if (code.slice(pos, pos + 2) === 'px') pos += 2;
      tokens.push({ type: 'number', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Local variable :name
    if (code[pos] === ':') {
      pos++;
      while (pos < code.length && /[\w]/.test(code[pos])) pos++;
      tokens.push({ type: 'localVar', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Global variable $name
    if (code[pos] === '$') {
      pos++;
      while (pos < code.length && /[\w]/.test(code[pos])) pos++;
      tokens.push({ type: 'globalVar', value: code.slice(start, pos), pos: start });
      continue;
    }

    // CSS selectors: #id, .class (but NOT event modifiers like .once, .prevent, .stop, .debounce, .throttle)
    if (code[pos] === '#' || code[pos] === '.') {
      // Check if this is an event modifier (. followed by modifier keyword)
      if (code[pos] === '.') {
        const afterDot = code.slice(pos + 1).match(/^(once|prevent|stop|debounce|throttle)\b/i);
        if (afterDot) {
          // Emit . as a symbol, let the keyword be parsed next
          tokens.push({ type: 'symbol', value: '.', pos: start });
          pos++;
          continue;
        }
      }
      pos++;
      while (pos < code.length && /[\w-]/.test(code[pos])) pos++;
      tokens.push({ type: 'selector', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Array literal vs Attribute selector
    // Array literals start with [ followed by quote, number, :, $, [, or ]
    // Attribute selectors start with [ followed by identifier
    if (code[pos] === '[') {
      // Look ahead to determine if this is an array literal
      let lookahead = pos + 1;
      while (lookahead < code.length && /\s/.test(code[lookahead])) lookahead++;
      const nextChar = code[lookahead] || '';
      const isArrayLiteral = /['"\d\[\]:\$\-]/.test(nextChar) || nextChar === '';

      if (isArrayLiteral) {
        // Emit [ as a symbol for array literal
        tokens.push({ type: 'symbol', value: '[', pos: start });
        pos++;
        continue;
      } else {
        // Attribute selector [attr=value]
        pos++;
        let depth = 1;
        while (pos < code.length && depth > 0) {
          if (code[pos] === '[') depth++;
          if (code[pos] === ']') depth--;
          pos++;
        }
        tokens.push({ type: 'selector', value: code.slice(start, pos), pos: start });
        continue;
      }
    }

    // Closing bracket for array literals
    if (code[pos] === ']') {
      tokens.push({ type: 'symbol', value: ']', pos: start });
      pos++;
      continue;
    }

    // Possessive 's
    if (code.slice(pos, pos + 2) === "'s") {
      tokens.push({ type: 'operator', value: "'s", pos: start });
      pos += 2;
      continue;
    }

    // Multi-char operators
    const twoChar = code.slice(pos, pos + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar, pos: start });
      pos += 2;
      continue;
    }

    // CSS style property: *opacity, *background-color, *display
    if (code[pos] === '*' && /[a-zA-Z]/.test(code[pos + 1] || '')) {
      pos++;
      while (pos < code.length && /[\w-]/.test(code[pos])) pos++;
      tokens.push({ type: 'styleProperty', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Single-char operators and symbols
    if ('+-*/%<>!'.includes(code[pos])) {
      tokens.push({ type: 'operator', value: code[pos], pos: start });
      pos++;
      continue;
    }

    if ('()[]{},.'.includes(code[pos])) {
      tokens.push({ type: 'symbol', value: code[pos], pos: start });
      pos++;
      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(code[pos])) {
      while (pos < code.length && /[\w-]/.test(code[pos])) pos++;
      const value = code.slice(start, pos);
      const type = KEYWORDS.has(value.toLowerCase()) ? 'keyword' : 'identifier';
      tokens.push({ type, value, pos: start });
      continue;
    }

    pos++;
  }

  tokens.push({ type: 'eof', value: '', pos: code.length });
  return tokens;
}

// ============== AST TYPES ==============

interface ASTNode { type: string; [key: string]: any; }

interface CommandNode extends ASTNode {
  type: 'command';
  name: string;
  args: ASTNode[];
  target?: ASTNode;
  modifier?: string;
}

interface BlockNode extends ASTNode {
  type: 'if' | 'repeat' | 'for' | 'while' | 'fetch';
  condition?: ASTNode;
  body: ASTNode[];
  elseBody?: ASTNode[];
}

interface EventModifiers {
  once?: boolean;
  prevent?: boolean;
  stop?: boolean;
  debounce?: number;
  throttle?: number;
}

interface EventNode extends ASTNode {
  type: 'event';
  event: string;
  filter?: ASTNode;
  modifiers: EventModifiers;
  body: ASTNode[];
}

// ============== PARSER ==============

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(code: string) {
    this.tokens = tokenize(code);
  }

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private match(...values: string[]): boolean {
    const token = this.peek();
    return values.some(v => token.value.toLowerCase() === v.toLowerCase());
  }

  private matchType(...types: TokenType[]): boolean {
    return types.includes(this.peek().type);
  }

  private expect(value: string): Token {
    // Accept exact match or alias that normalizes to the expected value
    if (!this.match(value) && normalizeCommand(this.peek().value) !== value) {
      throw new Error(`Expected '${value}', got '${this.peek().value}'`);
    }
    return this.advance();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'eof';
  }

  parse(): ASTNode {
    if (this.match('on')) return this.parseEventHandler();
    if (this.match('init')) {
      this.advance();
      return { type: 'event', event: 'init', modifiers: {}, body: this.parseCommandSequence() };
    }
    if (this.match('every')) return this.parseEveryHandler();
    return { type: 'sequence', commands: this.parseCommandSequence() };
  }

  private parseEventHandler(): EventNode {
    this.expect('on');
    let eventName = this.advance().value;
    const modifiers: EventModifiers = {};
    let filter: ASTNode | undefined;

    // Parse event modifiers: .once, .prevent, .stop, .debounce(N), .throttle(N)
    while (this.peek().value === '.') {
      this.advance();
      const mod = this.advance().value.toLowerCase();
      if (mod === 'once') modifiers.once = true as true;  // Ensure literal true
      else if (mod === 'prevent') modifiers.prevent = true as true;
      else if (mod === 'stop') modifiers.stop = true as true;
      else if (mod === 'debounce' || mod === 'throttle') {
        if (this.peek().value === '(') {
          this.advance();
          const num = this.advance().value;
          this.expect(')');
          if (mod === 'debounce') modifiers.debounce = parseInt(num) || 100;
          else modifiers.throttle = parseInt(num) || 100;
        }
      }
    }

    // Parse from clause
    if (this.match('from')) {
      this.advance();
      filter = this.parseExpression();
    }

    return {
      type: 'event',
      event: normalizeEvent(eventName),
      filter,
      modifiers,
      body: this.parseCommandSequence(),
    };
  }

  private parseEveryHandler(): EventNode {
    this.expect('every');
    const interval = this.advance().value;
    return {
      type: 'event',
      event: `interval:${interval}`,
      modifiers: {},
      body: this.parseCommandSequence(),
    };
  }

  private parseCommandSequence(): ASTNode[] {
    const commands: ASTNode[] = [];
    while (!this.isAtEnd() && !this.match('end', 'else')) {
      const cmd = this.parseCommand();
      if (cmd) commands.push(cmd);
      if (this.match('then', 'and')) this.advance();
    }
    return commands;
  }

  private parseCommand(): ASTNode | null {
    // Control flow blocks
    if (this.match('if', 'unless')) return this.parseIf();
    if (this.match('repeat')) return this.parseRepeat();
    if (this.match('for')) return this.parseFor();
    if (this.match('while')) return this.parseWhile();
    if (this.match('fetch')) return this.parseFetchBlock();

    // Commands
    const cmdMap: Record<string, () => CommandNode> = {
      toggle: () => this.parseToggle(),
      add: () => this.parseAdd(),
      remove: () => this.parseRemove(),
      put: () => this.parsePut(),
      append: () => this.parseAppend(),
      set: () => this.parseSet(),
      get: () => this.parseGet(),
      call: () => this.parseCall(),
      log: () => this.parseLog(),
      send: () => this.parseSend(),
      trigger: () => this.parseSend(),
      wait: () => this.parseWait(),
      show: () => this.parseShow(),
      hide: () => this.parseHide(),
      take: () => this.parseTake(),
      increment: () => this.parseIncDec('increment'),
      decrement: () => this.parseIncDec('decrement'),
      focus: () => this.parseFocusBlur('focus'),
      blur: () => this.parseFocusBlur('blur'),
      go: () => this.parseGo(),
      return: () => this.parseReturn(),
    };

    const normalized = normalizeCommand(this.peek().value);
    if (cmdMap[normalized]) {
      // expect() now handles aliases, no need to pre-advance
      return cmdMap[normalized]();
    }

    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      this.advance();
    }
    return null;
  }

  // Control flow parsing
  private parseIf(): BlockNode {
    const isUnless = this.match('unless');
    this.advance();
    const condition = this.parseExpression();
    const body = this.parseCommandSequence();
    let elseBody: ASTNode[] | undefined;

    if (this.match('else')) {
      this.advance();
      elseBody = this.parseCommandSequence();
    }
    if (this.match('end')) this.advance();

    return {
      type: 'if',
      condition: isUnless ? { type: 'unary', operator: 'not', operand: condition } : condition,
      body,
      elseBody,
    };
  }

  private parseRepeat(): BlockNode {
    this.expect('repeat');
    let count: ASTNode | undefined;
    if (!this.match('until', 'while', 'forever')) {
      count = this.parseExpression();
      if (this.match('times')) this.advance();
    }
    const body = this.parseCommandSequence();
    if (this.match('end')) this.advance();
    return { type: 'repeat', condition: count, body };
  }

  private parseFor(): BlockNode {
    this.expect('for');
    if (this.match('each')) this.advance();
    const variable = this.advance().value;
    this.expect('in');
    const iterable = this.parseExpression();
    const body = this.parseCommandSequence();
    if (this.match('end')) this.advance();
    return { type: 'for', condition: { type: 'forCondition', variable, iterable }, body };
  }

  private parseWhile(): BlockNode {
    this.expect('while');
    const condition = this.parseExpression();
    const body = this.parseCommandSequence();
    if (this.match('end')) this.advance();
    return { type: 'while', condition, body };
  }

  private parseFetchBlock(): BlockNode {
    this.expect('fetch');
    const url = this.parseExpression();
    let responseType: ASTNode = { type: 'literal', value: 'text' };

    if (this.match('as')) {
      this.advance();
      responseType = this.parseExpression();
    }
    if (this.match('then')) this.advance();

    const body = this.parseCommandSequence();
    return { type: 'fetch', condition: { url, responseType }, body };
  }

  // Command parsing
  private parseToggle(): CommandNode {
    this.expect('toggle');
    const what = this.parseExpression();
    let target: ASTNode | undefined;
    if (this.match('on')) { this.advance(); target = this.parseExpression(); }
    return { type: 'command', name: 'toggle', args: [what], target };
  }

  private parseAdd(): CommandNode {
    this.expect('add');
    const what = this.parseExpression();
    let target: ASTNode | undefined;
    if (this.match('to')) { this.advance(); target = this.parseExpression(); }
    return { type: 'command', name: 'add', args: [what], target };
  }

  private parseRemove(): CommandNode {
    this.expect('remove');
    if (this.matchType('selector')) {
      const what = this.parseExpression();
      let target: ASTNode | undefined;
      if (this.match('from')) { this.advance(); target = this.parseExpression(); }
      return { type: 'command', name: 'removeClass', args: [what], target };
    }
    const target = this.parseExpression();
    return { type: 'command', name: 'remove', args: [], target };
  }

  private parsePut(): CommandNode {
    this.expect('put');
    const content = this.parseExpression();
    let modifier = 'into';
    if (this.match('into', 'before', 'after', 'at')) {
      modifier = this.advance().value;
      if (modifier === 'at') {
        const pos = this.advance().value;
        this.expect('of');
        modifier = `at ${pos} of`;
      }
    }
    const target = this.parseExpression();
    return { type: 'command', name: 'put', args: [content], target, modifier };
  }

  private parseAppend(): CommandNode {
    this.expect('append');
    const content = this.parseExpression();
    let target: ASTNode | undefined;
    if (this.match('to')) { this.advance(); target = this.parseExpression(); }
    return { type: 'command', name: 'append', args: [content], target };
  }

  private parseSet(): CommandNode {
    this.expect('set');
    const target = this.parseExpression();
    if (this.match('to')) {
      this.advance();
      const value = this.parseExpression();
      return { type: 'command', name: 'set', args: [target, value] };
    }
    return { type: 'command', name: 'set', args: [target] };
  }

  private parseGet(): CommandNode {
    this.expect('get');
    return { type: 'command', name: 'get', args: [this.parseExpression()] };
  }

  private parseCall(): CommandNode {
    this.expect('call');
    return { type: 'command', name: 'call', args: [this.parseExpression()] };
  }

  private parseLog(): CommandNode {
    this.expect('log');
    const args: ASTNode[] = [];
    while (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      args.push(this.parseExpression());
      if (this.match(',')) this.advance();
      else break;
    }
    return { type: 'command', name: 'log', args };
  }

  private parseSend(): CommandNode {
    this.advance();
    const event = this.advance().value;
    let target: ASTNode | undefined;
    if (this.match('to')) { this.advance(); target = this.parseExpression(); }
    return { type: 'command', name: 'send', args: [{ type: 'literal', value: event }], target };
  }

  private parseWait(): CommandNode {
    this.expect('wait');
    if (this.match('for')) {
      this.advance();
      const event = this.advance().value;
      let target: ASTNode | undefined;
      if (this.match('from')) { this.advance(); target = this.parseExpression(); }
      return { type: 'command', name: 'waitFor', args: [{ type: 'literal', value: event }], target };
    }
    return { type: 'command', name: 'wait', args: [this.parseExpression()] };
  }

  private parseShow(): CommandNode {
    this.expect('show');
    let target: ASTNode | undefined;
    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      target = this.parseExpression();
    }
    return { type: 'command', name: 'show', args: [], target };
  }

  private parseHide(): CommandNode {
    this.expect('hide');
    let target: ASTNode | undefined;
    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      target = this.parseExpression();
    }
    return { type: 'command', name: 'hide', args: [], target };
  }

  private parseTake(): CommandNode {
    this.expect('take');
    const what = this.parseExpression();
    let from: ASTNode | undefined;
    if (this.match('from')) { this.advance(); from = this.parseExpression(); }
    return { type: 'command', name: 'take', args: [what], target: from };
  }

  private parseIncDec(name: string): CommandNode {
    this.advance();
    const target = this.parseExpression();
    let amount: ASTNode = { type: 'literal', value: 1 };
    if (this.match('by')) { this.advance(); amount = this.parseExpression(); }
    return { type: 'command', name, args: [target, amount] };
  }

  private parseFocusBlur(name: string): CommandNode {
    this.advance();
    let target: ASTNode | undefined;
    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      target = this.parseExpression();
    }
    return { type: 'command', name, args: [], target };
  }

  private parseGo(): CommandNode {
    this.expect('go');
    if (this.match('to')) this.advance();
    if (this.match('url')) this.advance();
    const dest = this.parseExpression();
    return { type: 'command', name: 'go', args: [dest] };
  }

  private parseReturn(): CommandNode {
    this.expect('return');
    let value: ASTNode | undefined;
    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      value = this.parseExpression();
    }
    return { type: 'command', name: 'return', args: value ? [value] : [] };
  }

  // Expression parsing with operator precedence
  private parseExpression(): ASTNode { return this.parseOr(); }

  private parseOr(): ASTNode {
    let left = this.parseAnd();
    while (this.match('or', '||')) {
      this.advance();
      left = { type: 'binary', operator: 'or', left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseEquality();
    while (this.match('and', '&&') && !this.isCommandKeyword(this.peek(1))) {
      this.advance();
      left = { type: 'binary', operator: 'and', left, right: this.parseEquality() };
    }
    return left;
  }

  private isCommandKeyword(token: Token): boolean {
    const cmds = ['toggle', 'add', 'remove', 'set', 'put', 'log', 'send', 'wait', 'show', 'hide', 'increment', 'decrement', 'focus', 'blur', 'go'];
    return cmds.includes(normalizeCommand(token.value));
  }

  private parseEquality(): ASTNode {
    let left = this.parseComparison();
    while (this.match('==', '!=', 'is', 'matches', 'contains', 'includes', 'has')) {
      const op = this.advance().value;
      if (op.toLowerCase() === 'is' && this.match('not')) {
        this.advance();
        left = { type: 'binary', operator: 'is not', left, right: this.parseComparison() };
      } else {
        left = { type: 'binary', operator: op, left, right: this.parseComparison() };
      }
    }
    return left;
  }

  private parseComparison(): ASTNode {
    let left = this.parseAdditive();
    while (this.match('<', '>', '<=', '>=')) {
      const op = this.advance().value;
      left = { type: 'binary', operator: op, left, right: this.parseAdditive() };
    }
    return left;
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();
    while (this.match('+', '-')) {
      const op = this.advance().value;
      left = { type: 'binary', operator: op, left, right: this.parseMultiplicative() };
    }
    return left;
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parseUnary();
    while (this.match('*', '/', '%')) {
      const op = this.advance().value;
      left = { type: 'binary', operator: op, left, right: this.parseUnary() };
    }
    return left;
  }

  private parseUnary(): ASTNode {
    if (this.match('not', '!')) {
      this.advance();
      return { type: 'unary', operator: 'not', operand: this.parseUnary() };
    }
    if (this.match('-') && this.peek(1).type === 'number') {
      this.advance();
      const num = this.advance();
      return { type: 'literal', value: -parseFloat(num.value) };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): ASTNode {
    let left = this.parsePrimary();

    while (true) {
      if (this.match("'s")) {
        this.advance();
        // Handle style property (*opacity) or regular property
        const next = this.peek();
        const prop = next.type === 'styleProperty' ? this.advance().value : this.advance().value;
        left = { type: 'possessive', object: left, property: prop };
      } else if (this.peek().type === 'styleProperty') {
        // Direct style property access: #el *opacity (without 's)
        const prop = this.advance().value;
        left = { type: 'possessive', object: left, property: prop };
      } else if (this.peek().value === '.') {
        this.advance();
        const prop = this.advance().value;
        left = { type: 'member', object: left, property: prop };
      } else if (this.peek().type === 'selector' && this.peek().value.startsWith('.')) {
        // Handle .property tokenized as selector (e.g., my.value where .value is a selector)
        const prop = this.advance().value.slice(1); // Remove leading .
        left = { type: 'member', object: left, property: prop };
      } else if (this.peek().value === '(') {
        this.advance();
        const args: ASTNode[] = [];
        while (!this.match(')')) {
          args.push(this.parseExpression());
          if (this.match(',')) this.advance();
        }
        this.expect(')');
        left = { type: 'call', callee: left, args };
      } else if (this.peek().value === '[' && left.type !== 'selector') {
        this.advance();
        const index = this.parseExpression();
        this.expect(']');
        left = { type: 'member', object: left, property: index, computed: true };
      } else {
        break;
      }
    }
    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    if (token.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.expect(')');
      return expr;
    }

    if (token.value === '{') return this.parseObjectLiteral();
    if (token.value === '[') return this.parseArrayLiteral();

    if (token.type === 'number') {
      this.advance();
      const val = token.value;
      if (val.endsWith('ms')) return { type: 'literal', value: parseInt(val), unit: 'ms' };
      if (val.endsWith('s')) return { type: 'literal', value: parseFloat(val) * 1000, unit: 'ms' };
      return { type: 'literal', value: parseFloat(val) };
    }

    if (token.type === 'string') {
      this.advance();
      return { type: 'literal', value: token.value.slice(1, -1) };
    }

    if (this.match('true')) { this.advance(); return { type: 'literal', value: true }; }
    if (this.match('false')) { this.advance(); return { type: 'literal', value: false }; }
    if (this.match('null')) { this.advance(); return { type: 'literal', value: null }; }
    if (this.match('undefined')) { this.advance(); return { type: 'literal', value: undefined }; }

    if (token.type === 'localVar') { this.advance(); return { type: 'variable', name: token.value, scope: 'local' }; }
    if (token.type === 'globalVar') { this.advance(); return { type: 'variable', name: token.value, scope: 'global' }; }
    if (token.type === 'selector') { this.advance(); return { type: 'selector', value: token.value }; }

    // Handle implicit possessive: my value, its value (no 's or . needed)
    if (this.match('my')) {
      this.advance();
      const next = this.peek();
      if ((next.type === 'identifier' || next.type === 'keyword') && !this.isCommandKeyword(next)) {
        const prop = this.advance().value;
        return { type: 'possessive', object: { type: 'identifier', value: 'me' }, property: prop };
      }
      return { type: 'identifier', value: 'me' };
    }
    if (this.match('its')) {
      this.advance();
      const next = this.peek();
      if ((next.type === 'identifier' || next.type === 'keyword') && !this.isCommandKeyword(next)) {
        const prop = this.advance().value;
        return { type: 'possessive', object: { type: 'identifier', value: 'it' }, property: prop };
      }
      return { type: 'identifier', value: 'it' };
    }
    if (this.match('me')) { this.advance(); return { type: 'identifier', value: 'me' }; }
    if (this.match('it')) { this.advance(); return { type: 'identifier', value: 'it' }; }
    if (this.match('you')) { this.advance(); return { type: 'identifier', value: 'you' }; }

    // Positional: the first <li/> or first li
    // Only consume the selector/identifier, not possessive/member access
    if (this.match('the', 'a', 'an')) {
      this.advance();
      if (this.match('first', 'last', 'next', 'previous', 'closest', 'parent')) {
        const position = this.advance().value;
        const target = this.parsePositionalTarget();
        return { type: 'positional', position, target };
      }
      return this.parsePrimary();
    }

    if (this.match('first', 'last', 'next', 'previous', 'closest', 'parent')) {
      const position = this.advance().value;
      const target = this.parsePositionalTarget();
      return { type: 'positional', position, target };
    }

    if (token.type === 'identifier' || token.type === 'keyword') {
      this.advance();
      return { type: 'identifier', value: token.value };
    }

    this.advance();
    return { type: 'identifier', value: token.value };
  }

  private parseObjectLiteral(): ASTNode {
    this.expect('{');
    const properties: Array<{ key: string; value: ASTNode }> = [];
    while (!this.match('}')) {
      const key = this.advance().value;
      this.expect(':');
      const value = this.parseExpression();
      properties.push({ key, value });
      if (this.match(',')) this.advance();
    }
    this.expect('}');
    return { type: 'object', properties };
  }

  private parseArrayLiteral(): ASTNode {
    this.expect('[');
    const elements: ASTNode[] = [];
    while (!this.match(']')) {
      elements.push(this.parseExpression());
      if (this.match(',')) this.advance();
    }
    this.expect(']');
    return { type: 'array', elements };
  }

  // Parse just the target for positional expressions (selector or identifier only)
  private parsePositionalTarget(): ASTNode {
    const token = this.peek();
    if (token.type === 'selector') {
      return { type: 'selector', value: this.advance().value };
    }
    if (token.type === 'identifier' || token.type === 'keyword') {
      return { type: 'identifier', value: this.advance().value };
    }
    // Fallback to full expression if neither selector nor identifier
    return this.parseExpression();
  }
}

// ============== RUNTIME ==============

interface Context {
  me: Element;
  event?: Event;
  it?: any;
  you?: Element;
  locals: Map<string, any>;
  globals: Map<string, any>;
}

const globalVars = new Map<string, any>();
const MAX_LOOP_ITERATIONS = 1000;

async function evaluate(node: ASTNode, ctx: Context): Promise<any> {
  switch (node.type) {
    case 'literal': return node.value;

    case 'identifier':
      if (node.value === 'me' || node.value === 'my') return ctx.me;
      if (node.value === 'it') return ctx.it;
      if (node.value === 'you') return ctx.you;
      if (node.value === 'event') return ctx.event;
      if (node.value === 'body') return document.body;
      if (node.value === 'document') return document;
      if (node.value === 'window') return window;
      // Check locals (for loop variables like 'item' in for-each)
      if (ctx.locals.has(node.value)) return ctx.locals.get(node.value);
      if (node.value in (ctx.me as any)) return (ctx.me as any)[node.value];
      // Check window globals (for Number, String, Math, etc.)
      if (node.value in (window as any)) return (window as any)[node.value];
      return node.value;

    case 'variable':
      if (node.scope === 'local') return ctx.locals.get(node.name.slice(1));
      // Global variable: check our Map first, then window
      const gName = node.name.slice(1);
      if (globalVars.has(gName)) return globalVars.get(gName);
      return (window as any)[node.name];  // Fall back to window.$varname

    case 'selector':
      const elements = document.querySelectorAll(node.value);
      return elements.length === 1 ? elements[0] : Array.from(elements);

    case 'binary': return evaluateBinary(node, ctx);

    case 'unary':
      const operand = await evaluate(node.operand, ctx);
      return node.operator === 'not' ? !operand : operand;

    case 'possessive':
    case 'member':
      const obj = await evaluate(node.object, ctx);
      if (obj == null) return undefined;
      const prop = node.computed ? await evaluate(node.property, ctx) : node.property;
      return obj[prop];

    case 'call': {
      let callContext: any = null;
      let callee: any;

      // For member/possessive calls, preserve the object as 'this'
      if (node.callee.type === 'member' || node.callee.type === 'possessive') {
        callContext = await evaluate(node.callee.object, ctx);
        const prop = node.callee.computed
          ? await evaluate(node.callee.property, ctx)
          : node.callee.property;
        callee = callContext?.[prop];
      } else {
        callee = await evaluate(node.callee, ctx);
      }

      const args = await Promise.all(node.args.map((a: ASTNode) => evaluate(a, ctx)));
      if (typeof callee === 'function') return callee.apply(callContext, args);
      return undefined;
    }

    case 'positional':
      return evaluatePositional(node, ctx);

    case 'object':
      const result: Record<string, any> = {};
      for (const prop of node.properties) {
        result[prop.key] = await evaluate(prop.value, ctx);
      }
      return result;

    case 'array':
      return Promise.all(node.elements.map((e: ASTNode) => evaluate(e, ctx)));

    default: return undefined;
  }
}

async function evaluateBinary(node: ASTNode, ctx: Context): Promise<any> {
  // Special handling for 'has' operator - don't evaluate right side for class selectors
  if (node.operator === 'has') {
    const left = await evaluate(node.left, ctx);
    if (left instanceof Element) {
      // Check raw AST node for selector value
      if (node.right.type === 'selector' && node.right.value.startsWith('.')) {
        return left.classList.contains(node.right.value.slice(1));
      }
    }
    return false;
  }

  const left = await evaluate(node.left, ctx);
  const right = await evaluate(node.right, ctx);

  switch (node.operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '==': case 'is': return left == right;
    case '!=': case 'is not': return left != right;
    case '<': return left < right;
    case '>': return left > right;
    case '<=': return left <= right;
    case '>=': return left >= right;
    case 'and': case '&&': return left && right;
    case 'or': case '||': return left || right;
    case 'has':
      if (left instanceof Element) {
        const selector = typeof right === 'string' ? right : right?.value;
        if (typeof selector === 'string' && selector.startsWith('.')) {
          return left.classList.contains(selector.slice(1));
        }
      }
      return false;
    case 'contains': case 'includes':
      if (typeof left === 'string') return left.includes(right);
      if (Array.isArray(left)) return left.includes(right);
      if (left instanceof Element) return left.contains(right);
      return false;
    case 'matches':
      if (left instanceof Element) return left.matches(right);
      if (typeof left === 'string') return new RegExp(right).test(left);
      return false;
    default: return undefined;
  }
}

function evaluatePositional(node: ASTNode, ctx: Context): Element | null {
  const target = node.target;
  let elements: Element[] = [];

  let selector: string | null = null;
  if (target.type === 'selector') {
    selector = target.value;
  } else if (target.type === 'identifier') {
    selector = target.value; // Tag name like 'li'
  } else if (target.type === 'htmlSelector') {
    selector = target.value;
  }
  if (selector) {
    elements = Array.from(document.querySelectorAll(selector));
  }

  switch (node.position) {
    case 'first': return elements[0] || null;
    case 'last': return elements[elements.length - 1] || null;
    case 'next': return ctx.me.nextElementSibling;
    case 'previous': return ctx.me.previousElementSibling;
    case 'closest': return target.value ? ctx.me.closest(target.value) : null;
    case 'parent': return ctx.me.parentElement;
    default: return elements[0] || null;
  }
}

async function executeCommand(cmd: CommandNode, ctx: Context): Promise<any> {
  const getTarget = async (): Promise<Element[]> => {
    if (!cmd.target) return [ctx.me];
    const t = await evaluate(cmd.target, ctx);
    if (Array.isArray(t)) return t;
    if (t instanceof Element) return [t];
    if (typeof t === 'string') return Array.from(document.querySelectorAll(t));
    return [ctx.me];
  };

  // Extract class name from AST node WITHOUT evaluating (selectors would be queried otherwise)
  const getClassName = (node: any): string => {
    if (!node) return '';
    // For selector nodes, extract the value directly (e.g., '.active' -> 'active')
    if (node.type === 'selector') return node.value.slice(1);
    // For string literals or identifiers
    if (node.type === 'string' || node.type === 'literal') {
      const val = node.value;
      return typeof val === 'string' && val.startsWith('.') ? val.slice(1) : String(val);
    }
    if (node.type === 'identifier') return node.value;
    // Fallback: evaluate and convert to string
    return '';
  };

  // Normalize any value to an array of Elements (for commands that target elements)
  const toElementArray = (val: any): Element[] => {
    if (Array.isArray(val)) return val.filter(e => e instanceof Element);
    if (val instanceof Element) return [val];
    if (typeof val === 'string') return Array.from(document.querySelectorAll(val));
    return [];
  };

  // CSS style property helpers (*opacity, *display, *background-color)
  const isStyleProp = (prop: string) => prop.startsWith('*');
  const getStyleName = (prop: string) => prop.substring(1);
  const setStyleProp = (el: Element, prop: string, value: any): boolean => {
    if (!isStyleProp(prop)) return false;
    (el as HTMLElement).style.setProperty(getStyleName(prop), String(value));
    return true;
  };
  const getStyleProp = (el: Element, prop: string): string | undefined => {
    if (!isStyleProp(prop)) return undefined;
    return getComputedStyle(el as HTMLElement).getPropertyValue(getStyleName(prop));
  };

  switch (cmd.name) {
    case 'toggle': {
      const className = getClassName(cmd.args[0]) || String(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) el.classList.toggle(className);
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'add': {
      const className = getClassName(cmd.args[0]) || String(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) el.classList.add(className);
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'removeClass': {
      const className = getClassName(cmd.args[0]) || String(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) el.classList.remove(className);
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'remove': {
      const targets = await getTarget();
      for (const el of targets) el.remove();
      return null;
    }

    case 'put': {
      const content = await evaluate(cmd.args[0], ctx);
      const modifier = cmd.modifier || 'into';

      // Handle possessive target with style property: put 0.5 into #el's *opacity
      if (cmd.target?.type === 'possessive' && isStyleProp(cmd.target.property)) {
        const obj = await evaluate(cmd.target.object, ctx);
        const elements = toElementArray(obj);
        for (const el of elements) {
          setStyleProp(el, cmd.target.property, content);
        }
        ctx.it = content;
        return content;
      }

      const targets = await getTarget();
      for (const el of targets) {
        const html = String(content);
        if (modifier === 'into') el.innerHTML = html;
        else if (modifier === 'before') el.insertAdjacentHTML('beforebegin', html);
        else if (modifier === 'after') el.insertAdjacentHTML('afterend', html);
        else if (modifier === 'at start of') el.insertAdjacentHTML('afterbegin', html);
        else if (modifier === 'at end of') el.insertAdjacentHTML('beforeend', html);
      }
      ctx.it = content;
      return content;
    }

    case 'append': {
      const content = await evaluate(cmd.args[0], ctx);
      const targets = await getTarget();
      for (const el of targets) el.insertAdjacentHTML('beforeend', String(content));
      ctx.it = content;
      return content;
    }

    case 'set': {
      const target = cmd.args[0];
      const value = await evaluate(cmd.args[1], ctx);

      if (target.type === 'variable') {
        const varName = target.name.slice(1);
        const map = target.scope === 'local' ? ctx.locals : globalVars;
        map.set(varName, value);
        ctx.it = value;
        return value;
      }

      if (target.type === 'possessive' || target.type === 'member') {
        const obj = await evaluate(target.object, ctx);
        if (obj) {
          // Check for CSS style property (*opacity, *display, etc.)
          if (obj instanceof Element && setStyleProp(obj, target.property, value)) {
            ctx.it = value;
            return value;
          }
          (obj as any)[target.property] = value;
          ctx.it = value;
          return value;
        }
      }

      ctx.it = value;
      return value;
    }

    case 'get': {
      const value = await evaluate(cmd.args[0], ctx);
      ctx.it = value;
      return value;
    }

    case 'call': {
      const result = await evaluate(cmd.args[0], ctx);
      ctx.it = result;
      return result;
    }

    case 'log': {
      const values = await Promise.all(cmd.args.map(a => evaluate(a, ctx)));
      console.log(...values);
      return values[0];
    }

    case 'send': {
      const eventName = await evaluate(cmd.args[0], ctx);
      const targets = await getTarget();
      const event = new CustomEvent(String(eventName), { bubbles: true, detail: ctx.it });
      for (const el of targets) el.dispatchEvent(event);
      ctx.it = event;
      return event;
    }

    case 'wait': {
      const duration = await evaluate(cmd.args[0], ctx);
      const ms = typeof duration === 'number' ? duration : parseInt(String(duration));
      await new Promise(resolve => setTimeout(resolve, ms));
      return ms;
    }

    case 'waitFor': {
      const eventName = await evaluate(cmd.args[0], ctx);
      const targets = await getTarget();
      const target = targets[0] || ctx.me;
      return new Promise(resolve => {
        target.addEventListener(String(eventName), (e) => {
          ctx.it = e;
          resolve(e);
        }, { once: true });
      });
    }

    case 'show': {
      const targets = await getTarget();
      for (const el of targets) {
        (el as HTMLElement).style.display = '';
        el.classList.remove('hidden');
      }
      return targets;
    }

    case 'hide': {
      const targets = await getTarget();
      for (const el of targets) (el as HTMLElement).style.display = 'none';
      return targets;
    }

    case 'take': {
      const className = getClassName(await evaluate(cmd.args[0], ctx));
      const from = cmd.target ? await getTarget() : [ctx.me.parentElement!];
      for (const container of from) {
        const siblings = container.querySelectorAll('.' + className);
        siblings.forEach(el => el.classList.remove(className));
      }
      ctx.me.classList.add(className);
      return ctx.me;
    }

    case 'increment':
    case 'decrement': {
      const target = cmd.args[0];
      const amount = await evaluate(cmd.args[1], ctx);
      const delta = cmd.name === 'increment' ? amount : -amount;

      if (target.type === 'variable') {
        const varName = target.name.slice(1);
        const map = target.scope === 'local' ? ctx.locals : globalVars;
        const current = map.get(varName) || 0;
        const newVal = current + delta;
        map.set(varName, newVal);
        ctx.it = newVal;
        return newVal;
      }

      // Handle possessive with style property: increment #el's *opacity by 0.1
      if (target.type === 'possessive' && isStyleProp(target.property)) {
        const obj = await evaluate(target.object, ctx);
        const elements = toElementArray(obj);
        for (const el of elements) {
          const current = parseFloat(getStyleProp(el, target.property) || '0') || 0;
          const newVal = current + delta;
          setStyleProp(el, target.property, newVal);
          ctx.it = newVal;
        }
        return ctx.it;
      }

      // Handle element selectors (e.g., increment #count)
      const elements = toElementArray(await evaluate(target, ctx));
      for (const el of elements) {
        const current = parseFloat(el.textContent || '0') || 0;
        const newVal = current + delta;
        el.textContent = String(newVal);
        ctx.it = newVal;
      }
      return ctx.it;
    }

    case 'focus': {
      const targets = await getTarget();
      for (const el of targets) (el as HTMLElement).focus();
      return targets;
    }

    case 'blur': {
      const targets = await getTarget();
      for (const el of targets) (el as HTMLElement).blur();
      return targets;
    }

    case 'go': {
      const dest = await evaluate(cmd.args[0], ctx);
      const d = String(dest).toLowerCase();
      if (d === 'back') history.back();
      else if (d === 'forward') history.forward();
      else window.location.href = String(dest);
      return null;
    }

    case 'return': {
      const value = cmd.args[0] ? await evaluate(cmd.args[0], ctx) : ctx.it;
      throw { type: 'return', value };
    }

    default:
      console.warn(`Unknown command: ${cmd.name}`);
      return null;
  }
}

// Helper to execute sequence with return propagation
async function executeSeqPropagateReturn(nodes: ASTNode[], ctx: Context): Promise<any> {
  try {
    return await executeSequence(nodes, ctx);
  } catch (e: any) {
    if (e?.type === 'return') throw e; // Propagate return up
    throw e;
  }
}

async function executeBlock(block: BlockNode, ctx: Context): Promise<any> {
  switch (block.type) {
    case 'if': {
      const condition = await evaluate(block.condition!, ctx);
      if (condition) return executeSeqPropagateReturn(block.body, ctx);
      else if (block.elseBody) return executeSeqPropagateReturn(block.elseBody, ctx);
      return null;
    }

    case 'repeat': {
      const count = await evaluate(block.condition!, ctx);
      const n = typeof count === 'number' ? count : parseInt(String(count));
      for (let i = 0; i < n && i < MAX_LOOP_ITERATIONS; i++) {
        ctx.locals.set('__loop_index__', i);
        ctx.locals.set('__loop_count__', i + 1);
        await executeSeqPropagateReturn(block.body, ctx);
      }
      return null;
    }

    case 'for': {
      const { variable, iterable } = block.condition as any;
      const items = await evaluate(iterable, ctx);
      const arr = Array.isArray(items) ? items : items instanceof NodeList ? Array.from(items) : [items];
      const varName = variable.startsWith(':') ? variable.slice(1) : variable;
      for (let i = 0; i < arr.length && i < MAX_LOOP_ITERATIONS; i++) {
        ctx.locals.set(varName, arr[i]);
        ctx.locals.set('__loop_index__', i);
        ctx.locals.set('__loop_count__', i + 1);
        await executeSeqPropagateReturn(block.body, ctx);
      }
      return null;
    }

    case 'while': {
      let iterations = 0;
      while (await evaluate(block.condition!, ctx) && iterations < MAX_LOOP_ITERATIONS) {
        ctx.locals.set('__loop_index__', iterations);
        await executeSeqPropagateReturn(block.body, ctx);
        iterations++;
      }
      return null;
    }

    case 'fetch': {
      const { url, responseType } = block.condition as any;
      try {
        const urlVal = await evaluate(url, ctx);
        const response = await fetch(String(urlVal));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const resType = await evaluate(responseType, ctx);
        let data: any;
        if (resType === 'json') data = await response.json();
        else if (resType === 'html') {
          const text = await response.text();
          const doc = new DOMParser().parseFromString(text, 'text/html');
          data = doc.body.innerHTML;
        } else data = await response.text();

        ctx.it = data;
        ctx.locals.set('it', data);
        ctx.locals.set('result', data);
        ctx.locals.set('response', response);

        await executeSeqPropagateReturn(block.body, ctx);
      } catch (error: any) {
        if (error?.type === 'return') throw error; // Propagate return
        ctx.locals.set('error', error);
        console.error('Fetch error:', error);
      }
      return null;
    }

    default: return null;
  }
}

async function executeSequence(nodes: ASTNode[], ctx: Context): Promise<any> {
  let result: any;
  for (const node of nodes) {
    if (node.type === 'command') result = await executeCommand(node as CommandNode, ctx);
    else if (['if', 'repeat', 'for', 'while', 'fetch'].includes(node.type)) {
      result = await executeBlock(node as BlockNode, ctx);
    }
    // Return exceptions propagate up - they're not caught here
  }
  return result;
}

async function executeAST(ast: ASTNode, me: Element, event?: Event): Promise<any> {
  const ctx: Context = { me, event, locals: new Map(), globals: globalVars };

  if (ast.type === 'sequence') return executeSequence(ast.commands, ctx);

  if (ast.type === 'event') {
    const eventNode = ast as EventNode;
    const eventName = eventNode.event;

    if (eventName.startsWith('interval:')) {
      const interval = eventName.split(':')[1];
      const ms = interval.endsWith('ms') ? parseInt(interval) :
                 interval.endsWith('s') ? parseFloat(interval) * 1000 : parseInt(interval);
      setInterval(async () => {
        const intervalCtx: Context = { me, locals: new Map(), globals: globalVars };
        try {
          await executeSequence(eventNode.body, intervalCtx);
        } catch (err: any) {
          if (err?.type !== 'return') throw err;
        }
      }, ms);
      return;
    }

    if (eventName === 'init') {
      try {
        await executeSequence(eventNode.body, ctx);
      } catch (err: any) {
        if (err?.type !== 'return') throw err;
      }
      return;
    }

    const target = eventNode.filter ? await evaluate(eventNode.filter, ctx) : me;
    const targetEl = target instanceof Element ? target : me;
    const mods = eventNode.modifiers;

    let handler = async (e: Event) => {
      if (mods.prevent) e.preventDefault();
      if (mods.stop) e.stopPropagation();

      const handlerCtx: Context = {
        me, event: e,
        you: e.target instanceof Element ? e.target : undefined,
        locals: new Map(), globals: globalVars,
      };
      try {
        await executeSequence(eventNode.body, handlerCtx);
      } catch (err: any) {
        if (err?.type === 'return') return err.value; // Handle return at top level
        throw err;
      }
    };

    // Debounce wrapper
    if (mods.debounce) {
      let timeout: any;
      const orig = handler;
      handler = async (e: Event) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => orig(e), mods.debounce);
      };
    }

    // Throttle wrapper
    if (mods.throttle) {
      let lastCall = 0;
      const orig = handler;
      handler = async (e: Event) => {
        const now = Date.now();
        if (now - lastCall >= mods.throttle!) {
          lastCall = now;
          await orig(e);
        }
      };
    }

    targetEl.addEventListener(eventName, handler, { once: !!mods.once });
    return;
  }

  return null;
}

// ============== DOM PROCESSOR ==============

function processElement(el: Element): void {
  const code = el.getAttribute('_');
  if (!code) return;

  try {
    const parser = new Parser(code);
    const ast = parser.parse();
    console.log('HyperFixi AST:', JSON.stringify(ast, null, 2).slice(0, 500));
    executeAST(ast, el);
  } catch (err) {
    console.error('HyperFixi Hybrid Complete error:', err, 'Code:', code);
  }
}

function processElements(root: Element | Document = document): void {
  const elements = root.querySelectorAll('[_]');
  elements.forEach(processElement);
}

// ============== PUBLIC API ==============

const api = {
  version: '1.0.0-hybrid-complete',

  parse(code: string): ASTNode {
    const parser = new Parser(code);
    return parser.parse();
  },

  async execute(code: string, element?: Element): Promise<any> {
    const me = element || document.body;
    const parser = new Parser(code);
    const ast = parser.parse();
    return executeAST(ast, me);
  },

  init: processElements,
  process: processElements,

  addAliases: (aliases: Record<string, string>) => {
    Object.assign(COMMAND_ALIASES, aliases);
  },

  addEventAliases: (aliases: Record<string, string>) => {
    Object.assign(EVENT_ALIASES, aliases);
  },

  tokenize,
  evaluate,

  commands: [
    'toggle', 'add', 'remove', 'put', 'append', 'set', 'get', 'call',
    'log', 'send', 'trigger', 'wait', 'show', 'hide', 'take',
    'increment', 'decrement', 'focus', 'blur', 'go', 'return',
  ],

  blocks: ['if', 'else', 'unless', 'repeat', 'for', 'while', 'fetch'],
};

// Auto-initialize
if (typeof window !== 'undefined') {
  (window as any).hyperfixi = api;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => processElements());
  } else {
    processElements();
  }
}

export default api;
