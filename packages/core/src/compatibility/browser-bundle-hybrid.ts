/**
 * HyperFixi Hybrid Browser Bundle
 *
 * A mid-size bundle with a minimal recursive descent parser.
 * Significantly more capable than lite, much smaller than full.
 *
 * Target: ~8-12 KB gzipped (~60-70% hyperscript coverage)
 *
 * Features:
 * - Expression parsing with operator precedence
 * - Hyperscript selector syntax: <button.primary/>
 * - Control flow: if/else/end, repeat, for
 * - Function calls: call foo(), greet("world")
 * - Property chains: element's style.opacity
 * - 15+ commands (vs 8 in lite, 43 in full)
 */

// ============== TOKENIZER ==============

type TokenType =
  | 'identifier'
  | 'number'
  | 'string'
  | 'operator'
  | 'selector' // CSS selectors and <button/> syntax (normalized)
  | 'localVar' // :name
  | 'globalVar' // $name
  | 'symbol' // ( ) [ ] { } , .
  | 'keyword'
  | 'eof';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

const KEYWORDS = new Set([
  'on', 'from', 'to', 'into', 'before', 'after', 'in', 'of', 'at', 'with',
  'if', 'else', 'unless', 'end', 'then', 'and', 'or', 'not',
  'repeat', 'times', 'for', 'while', 'until',
  'toggle', 'add', 'remove', 'put', 'set', 'get', 'call', 'return',
  'log', 'send', 'trigger', 'wait', 'settle', 'fetch',
  'show', 'hide', 'take', 'increment', 'decrement',
  'the', 'a', 'an', 'my', 'its', 'me', 'it', 'you',
  'first', 'last', 'next', 'previous', 'closest', 'parent',
  'true', 'false', 'null', 'undefined',
  'as', 'is', 'matches', 'contains', 'includes', 'exists',
  'init', 'every', 'behavior', 'def',
]);


function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    // Skip whitespace
    if (/\s/.test(code[pos])) {
      pos++;
      continue;
    }

    // Skip comments
    if (code.slice(pos, pos + 2) === '--') {
      while (pos < code.length && code[pos] !== '\n') pos++;
      continue;
    }

    const start = pos;

    // Hyperscript selector: <button.class#id/> - normalize to CSS selector
    if (code[pos] === '<') {
      pos++;
      while (pos < code.length && code[pos] !== '>') pos++;
      if (code[pos] === '>') pos++;
      const val = code.slice(start, pos);
      if (val.endsWith('/>') || val.endsWith('>')) {
        // Normalize: <button.class/> -> button.class
        const normalized = val.slice(1).replace(/\/?>$/, '');
        tokens.push({ type: 'selector', value: normalized, pos: start });
        continue;
      }
    }

    // String literals
    if (code[pos] === '"' || code[pos] === "'") {
      const quote = code[pos++];
      while (pos < code.length && code[pos] !== quote) {
        if (code[pos] === '\\') pos++;
        pos++;
      }
      pos++; // closing quote
      tokens.push({ type: 'string', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Numbers
    if (/\d/.test(code[pos]) || (code[pos] === '-' && /\d/.test(code[pos + 1] || ''))) {
      if (code[pos] === '-') pos++;
      while (pos < code.length && /[\d.]/.test(code[pos])) pos++;
      // Handle time units: 500ms, 2s
      if (code.slice(pos, pos + 2) === 'ms') pos += 2;
      else if (code[pos] === 's' && !/[a-zA-Z]/.test(code[pos + 1] || '')) pos++;
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

    // CSS selectors: #id, .class, [attr]
    if (code[pos] === '#' || code[pos] === '.') {
      pos++;
      while (pos < code.length && /[\w-]/.test(code[pos])) pos++;
      tokens.push({ type: 'selector', value: code.slice(start, pos), pos: start });
      continue;
    }

    // Attribute selector [...]
    if (code[pos] === '[') {
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

    // Possessive 's
    if (code.slice(pos, pos + 2) === "'s") {
      tokens.push({ type: 'operator', value: "'s", pos: start });
      pos += 2;
      continue;
    }

    // Multi-char operators
    const twoChar = code.slice(pos, pos + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '===', '!=='].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar, pos: start });
      pos += 2;
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

    // Unknown character - skip
    pos++;
  }

  tokens.push({ type: 'eof', value: '', pos: code.length });
  return tokens;
}

// ============== AST TYPES ==============

interface ASTNode {
  type: string;
  [key: string]: any;
}

interface ExprNode extends ASTNode {
  type: 'literal' | 'identifier' | 'selector' | 'variable' |
        'binary' | 'unary' | 'member' | 'call' | 'possessive' | 'positional';
}

interface CommandNode extends ASTNode {
  type: 'command';
  name: string;
  args: ASTNode[];
  target?: ASTNode;
  modifier?: string;
}

interface BlockNode extends ASTNode {
  type: 'if' | 'repeat' | 'for';
  condition?: ASTNode;
  body: ASTNode[];
  elseBody?: ASTNode[];
}

interface EventNode extends ASTNode {
  type: 'event';
  event: string;
  filter?: ASTNode;
  modifiers: string[];
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
    if (!this.match(value)) {
      throw new Error(`Expected '${value}', got '${this.peek().value}'`);
    }
    return this.advance();
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'eof';
  }

  // Entry point
  parse(): ASTNode {
    const token = this.peek();

    // Event handler: on click ...
    if (this.match('on')) {
      return this.parseEventHandler();
    }

    // Init handler: init ...
    if (this.match('init')) {
      this.advance();
      return { type: 'event', event: 'init', modifiers: [], body: this.parseCommandSequence() };
    }

    // Every interval: every 500ms ...
    if (this.match('every')) {
      return this.parseEveryHandler();
    }

    // Otherwise, parse as command sequence
    return { type: 'sequence', commands: this.parseCommandSequence() };
  }

  private parseEventHandler(): EventNode {
    this.expect('on');
    const event = this.advance().value;
    const modifiers: string[] = [];
    let filter: ASTNode | undefined;

    // Parse event modifiers and from clause
    while (!this.isAtEnd()) {
      if (this.match('from')) {
        this.advance();
        filter = this.parseExpression();
      } else if (this.match('debounced', 'throttled')) {
        modifiers.push(this.advance().value);
        if (this.match('at')) {
          this.advance();
          modifiers.push('at:' + this.advance().value);
        }
      } else {
        break;
      }
    }

    return {
      type: 'event',
      event,
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
      modifiers: [],
      body: this.parseCommandSequence(),
    };
  }

  private parseCommandSequence(): ASTNode[] {
    const commands: ASTNode[] = [];

    while (!this.isAtEnd() && !this.match('end', 'else')) {
      const cmd = this.parseCommand();
      if (cmd) commands.push(cmd);

      // Handle 'then' and 'and' connectors
      if (this.match('then', 'and')) {
        this.advance();
      }
    }

    return commands;
  }

  private parseCommand(): ASTNode | null {
    const token = this.peek();

    // Control flow
    if (this.match('if', 'unless')) return this.parseIf();
    if (this.match('repeat')) return this.parseRepeat();
    if (this.match('for')) return this.parseFor();

    // Commands
    if (this.match('toggle')) return this.parseToggle();
    if (this.match('add')) return this.parseAdd();
    if (this.match('remove')) return this.parseRemove();
    if (this.match('put')) return this.parsePut();
    if (this.match('set')) return this.parseSet();
    if (this.match('get')) return this.parseGet();
    if (this.match('call')) return this.parseCall();
    if (this.match('log')) return this.parseLog();
    if (this.match('send', 'trigger')) return this.parseSend();
    if (this.match('wait')) return this.parseWait();
    if (this.match('show')) return this.parseShow();
    if (this.match('hide')) return this.parseHide();
    if (this.match('take')) return this.parseTake();
    if (this.match('increment')) return this.parseIncDec('increment');
    if (this.match('decrement')) return this.parseIncDec('decrement');
    if (this.match('fetch')) return this.parseFetch();
    if (this.match('return')) return this.parseReturn();

    // Unknown - skip token
    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      this.advance();
    }
    return null;
  }

  // Control flow parsing

  private parseIf(): BlockNode {
    const isUnless = this.match('unless');
    this.advance(); // if/unless

    const condition = this.parseExpression();
    const body = this.parseCommandSequence();
    let elseBody: ASTNode[] | undefined;

    if (this.match('else')) {
      this.advance();
      elseBody = this.parseCommandSequence();
    }

    if (this.match('end')) {
      this.advance();
    }

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

    return {
      type: 'repeat',
      condition: count,
      body,
    };
  }

  private parseFor(): BlockNode {
    this.expect('for');
    const variable = this.advance().value;
    this.expect('in');
    const iterable = this.parseExpression();
    const body = this.parseCommandSequence();
    if (this.match('end')) this.advance();

    return {
      type: 'for',
      condition: { type: 'forCondition', variable, iterable } as ASTNode,
      body,
    };
  }

  // Command parsing

  private parseToggle(): CommandNode {
    this.expect('toggle');
    const what = this.parseExpression();
    let target: ASTNode | undefined;

    if (this.match('on')) {
      this.advance();
      target = this.parseExpression();
    }

    return { type: 'command', name: 'toggle', args: [what], target };
  }

  private parseAdd(): CommandNode {
    this.expect('add');
    const what = this.parseExpression();
    let target: ASTNode | undefined;

    if (this.match('to')) {
      this.advance();
      target = this.parseExpression();
    }

    return { type: 'command', name: 'add', args: [what], target };
  }

  private parseRemove(): CommandNode {
    this.expect('remove');

    // Check if removing a class or an element
    if (this.matchType('selector')) {
      const what = this.parseExpression();
      let target: ASTNode | undefined;

      if (this.match('from')) {
        this.advance();
        target = this.parseExpression();
      }

      return { type: 'command', name: 'removeClass', args: [what], target };
    }

    // Remove element
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
        // at start of, at end of
        const pos = this.advance().value;
        this.expect('of');
        modifier = `at ${pos} of`;
      }
    }

    const target = this.parseExpression();
    return { type: 'command', name: 'put', args: [content], target, modifier };
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
    const target = this.parseExpression();
    return { type: 'command', name: 'get', args: [target] };
  }

  private parseCall(): CommandNode {
    this.expect('call');
    const func = this.parseExpression();
    return { type: 'command', name: 'call', args: [func] };
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
    const cmd = this.advance().value; // send or trigger
    const event = this.advance().value;
    let target: ASTNode | undefined;

    if (this.match('to')) {
      this.advance();
      target = this.parseExpression();
    }

    return { type: 'command', name: 'send', args: [{ type: 'literal', value: event }], target };
  }

  private parseWait(): CommandNode {
    this.expect('wait');

    if (this.match('for')) {
      this.advance();
      const event = this.advance().value;
      let target: ASTNode | undefined;

      if (this.match('from')) {
        this.advance();
        target = this.parseExpression();
      }

      return { type: 'command', name: 'waitFor', args: [{ type: 'literal', value: event }], target };
    }

    const duration = this.parseExpression();
    return { type: 'command', name: 'wait', args: [duration] };
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

    if (this.match('from')) {
      this.advance();
      from = this.parseExpression();
    }

    return { type: 'command', name: 'take', args: [what], target: from };
  }

  private parseIncDec(name: string): CommandNode {
    this.advance();
    const target = this.parseExpression();

    let amount: ASTNode = { type: 'literal', value: 1 };
    if (this.match('by')) {
      this.advance();
      amount = this.parseExpression();
    }

    return { type: 'command', name, args: [target, amount] };
  }

  private parseFetch(): CommandNode {
    this.expect('fetch');
    const url = this.parseExpression();
    const options: Record<string, ASTNode> = {};

    // Parse options: as json, with {headers: ...}
    while (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      if (this.match('as')) {
        this.advance();
        options.as = this.parseExpression();
      } else if (this.match('with')) {
        this.advance();
        options.with = this.parseExpression();
      } else {
        break;
      }
    }

    return { type: 'command', name: 'fetch', args: [url], options } as any;
  }

  private parseReturn(): CommandNode {
    this.expect('return');
    let value: ASTNode | undefined;

    if (!this.isAtEnd() && !this.match('then', 'and', 'end', 'else')) {
      value = this.parseExpression();
    }

    return { type: 'command', name: 'return', args: value ? [value] : [] };
  }

  // Expression parsing with precedence

  private parseExpression(): ASTNode {
    return this.parseOr();
  }

  private parseOr(): ASTNode {
    let left = this.parseAnd();

    while (this.match('or', '||')) {
      const op = this.advance().value;
      const right = this.parseAnd();
      left = { type: 'binary', operator: 'or', left, right };
    }

    return left;
  }

  private parseAnd(): ASTNode {
    let left = this.parseEquality();

    while (this.match('and', '&&') && !this.peek(1).value.match(/toggle|add|remove|set|put|log|send|wait|show|hide/i)) {
      const op = this.advance().value;
      const right = this.parseEquality();
      left = { type: 'binary', operator: 'and', left, right };
    }

    return left;
  }

  private parseEquality(): ASTNode {
    let left = this.parseComparison();

    while (this.match('==', '!=', '===', '!==', 'is', 'is not', 'matches', 'contains', 'includes')) {
      const op = this.advance().value;
      const right = this.parseComparison();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private parseComparison(): ASTNode {
    let left = this.parseAdditive();

    while (this.match('<', '>', '<=', '>=')) {
      const op = this.advance().value;
      const right = this.parseAdditive();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private parseAdditive(): ASTNode {
    let left = this.parseMultiplicative();

    while (this.match('+', '-')) {
      const op = this.advance().value;
      const right = this.parseMultiplicative();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private parseMultiplicative(): ASTNode {
    let left = this.parseUnary();

    while (this.match('*', '/', '%')) {
      const op = this.advance().value;
      const right = this.parseUnary();
      left = { type: 'binary', operator: op, left, right };
    }

    return left;
  }

  private parseUnary(): ASTNode {
    if (this.match('not', '!')) {
      const op = this.advance().value;
      const operand = this.parseUnary();
      return { type: 'unary', operator: 'not', operand };
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
      // Possessive: element's property
      if (this.match("'s")) {
        this.advance();
        const prop = this.advance().value;
        left = { type: 'possessive', object: left, property: prop };
      }
      // Member access: element.property
      else if (this.peek().value === '.') {
        this.advance();
        const prop = this.advance().value;
        left = { type: 'member', object: left, property: prop };
      }
      // Function call: func(args)
      else if (this.peek().value === '(') {
        this.advance();
        const args: ASTNode[] = [];
        while (!this.match(')')) {
          args.push(this.parseExpression());
          if (this.match(',')) this.advance();
        }
        this.expect(')');
        left = { type: 'call', callee: left, args };
      }
      // Array index: arr[0]
      else if (this.peek().value === '[' && left.type !== 'selector') {
        this.advance();
        const index = this.parseExpression();
        this.expect(']');
        left = { type: 'member', object: left, property: index, computed: true };
      }
      else {
        break;
      }
    }

    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    // Parenthesized expression
    if (token.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.expect(')');
      return expr;
    }

    // Object literal
    if (token.value === '{') {
      return this.parseObjectLiteral();
    }

    // Array literal
    if (token.value === '[') {
      return this.parseArrayLiteral();
    }

    // Literals
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

    // Booleans and null
    if (this.match('true')) { this.advance(); return { type: 'literal', value: true }; }
    if (this.match('false')) { this.advance(); return { type: 'literal', value: false }; }
    if (this.match('null')) { this.advance(); return { type: 'literal', value: null }; }
    if (this.match('undefined')) { this.advance(); return { type: 'literal', value: undefined }; }

    // Variables
    if (token.type === 'localVar') {
      this.advance();
      return { type: 'variable', name: token.value, scope: 'local' };
    }

    if (token.type === 'globalVar') {
      this.advance();
      return { type: 'variable', name: token.value, scope: 'global' };
    }

    // CSS Selectors (including normalized <button/> syntax)
    if (token.type === 'selector') {
      this.advance();
      return { type: 'selector', value: token.value };
    }

    // References: me, my, it, you
    if (this.match('me', 'my')) {
      this.advance();
      return { type: 'identifier', value: 'me' };
    }
    if (this.match('it', 'its')) {
      this.advance();
      return { type: 'identifier', value: 'it' };
    }
    if (this.match('you')) {
      this.advance();
      return { type: 'identifier', value: 'you' };
    }

    // Positional expressions: the first <li/>
    if (this.match('the', 'a', 'an')) {
      this.advance();
      if (this.match('first', 'last', 'next', 'previous', 'closest', 'parent')) {
        const position = this.advance().value;
        const target = this.parseExpression();
        return { type: 'positional', position, target };
      }
      // Just "the", continue to next token
      return this.parsePrimary();
    }

    // Positional without "the"
    if (this.match('first', 'last', 'next', 'previous', 'closest', 'parent')) {
      const position = this.advance().value;
      const target = this.parseExpression();
      return { type: 'positional', position, target };
    }

    // Regular identifier
    if (token.type === 'identifier' || token.type === 'keyword') {
      this.advance();
      return { type: 'identifier', value: token.value };
    }

    // Fallback
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

async function evaluate(node: ASTNode, ctx: Context): Promise<any> {
  switch (node.type) {
    case 'literal':
      return node.value;

    case 'identifier':
      if (node.value === 'me' || node.value === 'my') return ctx.me;
      if (node.value === 'it') return ctx.it;
      if (node.value === 'you') return ctx.you;
      if (node.value === 'event') return ctx.event;
      if (node.value === 'body') return document.body;
      if (node.value === 'document') return document;
      if (node.value === 'window') return window;
      // Check if it's a property of me
      if (node.value in (ctx.me as any)) return (ctx.me as any)[node.value];
      return node.value;

    case 'variable':
      if (node.scope === 'local') {
        return ctx.locals.get(node.name.slice(1));
      } else {
        return globalVars.get(node.name.slice(1));
      }

    case 'selector':
      // Values already normalized (including <button/> syntax)
      const elements = document.querySelectorAll(node.value);
      return elements.length === 1 ? elements[0] : Array.from(elements);

    case 'binary':
      return evaluateBinary(node, ctx);

    case 'unary':
      const operand = await evaluate(node.operand, ctx);
      return node.operator === 'not' ? !operand : operand;

    case 'possessive':
    case 'member':
      const obj = await evaluate(node.object, ctx);
      if (obj == null) return undefined;
      const prop = node.computed ? await evaluate(node.property, ctx) : node.property;
      return obj[prop];

    case 'call':
      const callee = await evaluate(node.callee, ctx);
      const args = await Promise.all(node.args.map((a: ASTNode) => evaluate(a, ctx)));
      if (typeof callee === 'function') {
        return callee.apply(null, args);
      }
      return undefined;

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

    default:
      return undefined;
  }
}

async function evaluateBinary(node: ASTNode, ctx: Context): Promise<any> {
  const left = await evaluate(node.left, ctx);
  const right = await evaluate(node.right, ctx);

  switch (node.operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '==':
    case 'is': return left == right;
    case '!=':
    case 'is not': return left != right;
    case '===': return left === right;
    case '!==': return left !== right;
    case '<': return left < right;
    case '>': return left > right;
    case '<=': return left <= right;
    case '>=': return left >= right;
    case 'and':
    case '&&': return left && right;
    case 'or':
    case '||': return left || right;
    case 'contains':
    case 'includes':
      if (typeof left === 'string') return left.includes(right);
      if (Array.isArray(left)) return left.includes(right);
      if (left instanceof Element) return left.contains(right);
      return false;
    case 'matches':
      if (left instanceof Element) return left.matches(right);
      if (typeof left === 'string') return new RegExp(right).test(left);
      return false;
    default:
      return undefined;
  }
}

function evaluatePositional(node: ASTNode, ctx: Context): Element | null {
  const target = node.target;
  const position = node.position;

  // Evaluate target to get element(s) - values already normalized
  let elements: Element[];
  if (target.type === 'selector') {
    elements = Array.from(document.querySelectorAll(target.value));
  } else {
    return null;
  }

  switch (position) {
    case 'first': return elements[0] || null;
    case 'last': return elements[elements.length - 1] || null;
    case 'next':
      if (ctx.me.nextElementSibling?.matches(target.value)) {
        return ctx.me.nextElementSibling;
      }
      return ctx.me.parentElement?.querySelector(target.value + ':has(+ *)') || null;
    case 'previous':
      return ctx.me.previousElementSibling;
    case 'closest':
      return ctx.me.closest(target.value);
    case 'parent':
      return ctx.me.parentElement;
    default:
      return elements[0] || null;
  }
}

async function executeCommand(cmd: CommandNode, ctx: Context): Promise<any> {
  const getTarget = async (): Promise<Element[]> => {
    if (!cmd.target) return [ctx.me];
    const t = await evaluate(cmd.target, ctx);
    if (Array.isArray(t)) return t;
    if (t instanceof Element) return [t];
    if (typeof t === 'string') {
      const els = document.querySelectorAll(t);
      return Array.from(els);
    }
    return [ctx.me];
  };

  const getClassName = (val: any): string => {
    if (typeof val === 'string') return val.startsWith('.') ? val.slice(1) : val;
    if (val?.type === 'selector') return val.value.slice(1);
    return String(val);
  };

  switch (cmd.name) {
    case 'toggle': {
      const className = getClassName(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) {
        el.classList.toggle(className);
      }
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'add': {
      const className = getClassName(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) {
        el.classList.add(className);
      }
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'removeClass': {
      const className = getClassName(await evaluate(cmd.args[0], ctx));
      const targets = await getTarget();
      for (const el of targets) {
        el.classList.remove(className);
      }
      ctx.it = targets.length === 1 ? targets[0] : targets;
      return ctx.it;
    }

    case 'remove': {
      const targets = await getTarget();
      for (const el of targets) {
        el.remove();
      }
      return null;
    }

    case 'put': {
      const content = await evaluate(cmd.args[0], ctx);
      const targets = await getTarget();
      const modifier = cmd.modifier || 'into';

      for (const el of targets) {
        const html = String(content);
        if (modifier === 'into') {
          el.innerHTML = html;
        } else if (modifier === 'before') {
          el.insertAdjacentHTML('beforebegin', html);
        } else if (modifier === 'after') {
          el.insertAdjacentHTML('afterend', html);
        } else if (modifier === 'at start of') {
          el.insertAdjacentHTML('afterbegin', html);
        } else if (modifier === 'at end of') {
          el.insertAdjacentHTML('beforeend', html);
        }
      }
      ctx.it = content;
      return content;
    }

    case 'set': {
      const target = cmd.args[0];
      const value = await evaluate(cmd.args[1], ctx);

      // Local variable
      if (target.type === 'variable' && target.scope === 'local') {
        ctx.locals.set(target.name.slice(1), value);
        ctx.it = value;
        return value;
      }

      // Global variable
      if (target.type === 'variable' && target.scope === 'global') {
        globalVars.set(target.name.slice(1), value);
        ctx.it = value;
        return value;
      }

      // Property assignment: element's property or element.property
      if (target.type === 'possessive' || target.type === 'member') {
        const obj = await evaluate(target.object, ctx);
        if (obj) {
          const prop = target.property;
          (obj as any)[prop] = value;
          ctx.it = value;
          return value;
        }
      }

      // Element attribute/property
      if (target.type === 'selector' || target.type === 'identifier') {
        const el = await evaluate(target, ctx);
        if (el instanceof Element) {
          // Try as property first, then attribute
          const propName = target.value || target.property;
          if (propName in el) {
            (el as any)[propName] = value;
          } else {
            el.setAttribute(propName, String(value));
          }
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

      for (const el of targets) {
        el.dispatchEvent(event);
      }
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
      for (const el of targets) {
        (el as HTMLElement).style.display = 'none';
      }
      return targets;
    }

    case 'take': {
      const className = getClassName(await evaluate(cmd.args[0], ctx));
      const from = cmd.target ? await getTarget() : [ctx.me.parentElement!];

      // Remove from all siblings/specified elements
      for (const container of from) {
        const siblings = container.querySelectorAll('.' + className);
        siblings.forEach(el => el.classList.remove(className));
      }
      // Add to me
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

      return null;
    }

    case 'fetch': {
      const url = await evaluate(cmd.args[0], ctx);
      const options = (cmd as any).options || {};

      const fetchOpts: RequestInit = {};
      if (options.with) {
        Object.assign(fetchOpts, await evaluate(options.with, ctx));
      }

      const response = await fetch(String(url), fetchOpts);

      let result: any = response;
      if (options.as) {
        const format = await evaluate(options.as, ctx);
        if (format === 'json' || String(format).toLowerCase() === 'json') {
          result = await response.json();
        } else if (format === 'text') {
          result = await response.text();
        } else if (format === 'html') {
          result = await response.text();
        }
      } else {
        // Default to json for API calls, text otherwise
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          result = await response.json();
        } else {
          result = await response.text();
        }
      }

      ctx.it = result;
      return result;
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

async function executeBlock(block: BlockNode, ctx: Context): Promise<any> {
  switch (block.type) {
    case 'if': {
      const condition = await evaluate(block.condition!, ctx);
      if (condition) {
        return executeSequence(block.body, ctx);
      } else if (block.elseBody) {
        return executeSequence(block.elseBody, ctx);
      }
      return null;
    }

    case 'repeat': {
      const count = await evaluate(block.condition!, ctx);
      const n = typeof count === 'number' ? count : parseInt(String(count));

      for (let i = 0; i < n; i++) {
        ctx.locals.set('index', i);
        await executeSequence(block.body, ctx);
      }
      return null;
    }

    case 'for': {
      const { variable, iterable } = block.condition as any;
      const items = await evaluate(iterable, ctx);
      const arr = Array.isArray(items) ? items : [items];

      for (let i = 0; i < arr.length; i++) {
        ctx.locals.set(variable, arr[i]);
        ctx.locals.set('index', i);
        await executeSequence(block.body, ctx);
      }
      return null;
    }

    default:
      return null;
  }
}

async function executeSequence(nodes: ASTNode[], ctx: Context): Promise<any> {
  let result: any;

  for (const node of nodes) {
    try {
      if (node.type === 'command') {
        result = await executeCommand(node as CommandNode, ctx);
      } else if (node.type === 'if' || node.type === 'repeat' || node.type === 'for') {
        result = await executeBlock(node as BlockNode, ctx);
      }
    } catch (e: any) {
      if (e?.type === 'return') {
        return e.value;
      }
      throw e;
    }
  }

  return result;
}

async function executeAST(ast: ASTNode, me: Element, event?: Event): Promise<any> {
  const ctx: Context = {
    me,
    event,
    locals: new Map(),
    globals: globalVars,
  };

  if (ast.type === 'sequence') {
    return executeSequence(ast.commands, ctx);
  }

  if (ast.type === 'event') {
    const eventNode = ast as EventNode;
    const eventName = eventNode.event;

    // Interval events
    if (eventName.startsWith('interval:')) {
      const interval = eventName.split(':')[1];
      const ms = interval.endsWith('ms')
        ? parseInt(interval)
        : interval.endsWith('s')
        ? parseFloat(interval) * 1000
        : parseInt(interval);

      setInterval(async () => {
        const intervalCtx: Context = { me, locals: new Map(), globals: globalVars };
        await executeSequence(eventNode.body, intervalCtx);
      }, ms);
      return;
    }

    // Init event - execute immediately
    if (eventName === 'init') {
      await executeSequence(eventNode.body, ctx);
      return;
    }

    // Standard DOM event
    const target = eventNode.filter ? await evaluate(eventNode.filter, ctx) : me;
    const targetEl = target instanceof Element ? target : me;

    // Parse debounce/throttle modifiers
    let debounceMs = 0;
    let throttleMs = 0;
    for (const mod of eventNode.modifiers) {
      if (mod.startsWith('at:')) {
        const time = mod.slice(3);
        const ms = time.endsWith('ms') ? parseInt(time) : parseFloat(time) * 1000;
        if (eventNode.modifiers.includes('debounced')) debounceMs = ms;
        if (eventNode.modifiers.includes('throttled')) throttleMs = ms;
      }
    }

    let handler = async (e: Event) => {
      const handlerCtx: Context = {
        me,
        event: e,
        you: e.target instanceof Element ? e.target : undefined,
        locals: new Map(),
        globals: globalVars,
      };
      await executeSequence(eventNode.body, handlerCtx);
    };

    // Apply debounce
    if (debounceMs > 0) {
      let timeout: any;
      const original = handler;
      handler = async (e: Event) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => original(e), debounceMs);
      };
    }

    // Apply throttle
    if (throttleMs > 0) {
      let lastCall = 0;
      const original = handler;
      handler = async (e: Event) => {
        const now = Date.now();
        if (now - lastCall >= throttleMs) {
          lastCall = now;
          await original(e);
        }
      };
    }

    targetEl.addEventListener(eventName, handler);
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
    executeAST(ast, el);
  } catch (err) {
    console.error('HyperFixi Hybrid error:', err, 'Code:', code);
  }
}

function processElements(root: Element | Document = document): void {
  const elements = root.querySelectorAll('[_]');
  elements.forEach(processElement);
}

// ============== PUBLIC API ==============

const api = {
  version: '1.0.0-hybrid',

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

  // Expose for debugging
  tokenize,
  evaluate,

  commands: [
    'toggle', 'add', 'remove', 'put', 'set', 'get', 'call',
    'log', 'send', 'trigger', 'wait', 'show', 'hide', 'take',
    'increment', 'decrement', 'fetch', 'return',
    'if', 'else', 'repeat', 'for',
  ],
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
