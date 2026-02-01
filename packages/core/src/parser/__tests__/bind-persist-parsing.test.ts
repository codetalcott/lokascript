/**
 * Integration tests for bind and persist command parsing
 *
 * These commands are LokaScript extensions (NOT part of official _hyperscript).
 * Tests verify that the compound command parsers correctly extract modifiers
 * from the hyperscript syntax into the expected AST structure.
 *
 * @module parser/__tests__/bind-persist-parsing
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../parser';

// Convenience helper: parse and assert success
function parseOk(input: string) {
  const result = parse(input);
  expect(
    result.success,
    `Expected parse to succeed for: "${input}"\nError: ${result.error?.message}`
  ).toBe(true);
  expect(result.node).toBeDefined();
  return result.node!;
}

// Type-safe accessors
function getArgs(node: any): any[] {
  return node.args ?? [];
}

function getModifiers(node: any): Record<string, any> {
  return node.modifiers ?? {};
}

function getCommands(node: any): any[] {
  return node.commands ?? [];
}

describe('Bind Command Parsing (LokaScript Extension)', () => {
  describe('Basic bind syntax', () => {
    it('should parse bind with local variable and to direction', () => {
      const node = parseOk('bind :username to #input.value');
      expect(node.type).toBe('command');
      expect(node.name).toBe('bind');

      const args = getArgs(node);
      expect(args.length).toBeGreaterThanOrEqual(1);
      // First arg should be the colon variable
      expect(args[0]).toMatchObject({
        type: 'identifier',
        name: 'username',
        scope: 'local',
      });

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
    });

    it('should parse bind with from direction', () => {
      const node = parseOk('bind :count from #display.textContent');
      expect(node.type).toBe('command');
      expect(node.name).toBe('bind');

      const args = getArgs(node);
      expect(args[0]).toMatchObject({
        type: 'identifier',
        name: 'count',
        scope: 'local',
      });

      const modifiers = getModifiers(node);
      expect(modifiers.from).toBeDefined();
      // Should not have 'to' modifier
      expect(modifiers.to).toBeUndefined();
    });

    it('should parse bind with bidirectional keyword', () => {
      const node = parseOk('bind :msg to #input.value bidirectional');
      expect(node.type).toBe('command');
      expect(node.name).toBe('bind');

      const args = getArgs(node);
      expect(args[0]).toMatchObject({
        type: 'identifier',
        name: 'msg',
        scope: 'local',
      });

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
      expect(modifiers.bidirectional).toBeDefined();
      // bidirectional modifier should be a literal true
      expect(modifiers.bidirectional.value).toBe(true);
    });

    it('should parse bind with global variable (::)', () => {
      const node = parseOk('bind ::theme to #selector.value');
      expect(node.type).toBe('command');
      expect(node.name).toBe('bind');

      const args = getArgs(node);
      expect(args[0]).toMatchObject({
        type: 'identifier',
        name: 'theme',
        scope: 'global',
      });

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
    });
  });

  describe('Bind in event handlers', () => {
    it('should parse bind inside on click handler', () => {
      const node = parseOk('on click bind :val to #input.value');
      expect(node.type).toBe('eventHandler');
      expect(node.event).toBe('click');
      const commands = getCommands(node);
      expect(commands.length).toBeGreaterThanOrEqual(1);
      expect(commands[0].name).toBe('bind');
    });

    it('should parse bind chained with then', () => {
      const node = parseOk('bind :val to #input.value then log :val');
      expect(node.type).toBe('CommandSequence');
      const cmds = getCommands(node);
      expect(cmds.length).toBe(2);
      expect(cmds[0].name).toBe('bind');
      expect(cmds[1].name).toBe('log');
    });
  });

  describe('Position tracking', () => {
    it('should have valid start/end positions', () => {
      const node = parseOk('bind :x to #input.value');
      expect(node.start ?? 0).toBeGreaterThanOrEqual(0);
      expect(node.end ?? 0).toBeGreaterThan(node.start ?? 0);
    });
  });
});

describe('Persist Command Parsing (LokaScript Extension)', () => {
  describe('Save operations', () => {
    it('should parse persist with to and as modifiers', () => {
      const node = parseOk('persist myValue to local as "username"');
      expect(node.type).toBe('command');
      expect(node.name).toBe('persist');

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
      expect(modifiers.as).toBeDefined();
    });

    it('should parse persist to session storage', () => {
      const node = parseOk('persist formData to session as "draft"');
      expect(node.type).toBe('command');
      expect(node.name).toBe('persist');

      const args = getArgs(node);
      expect(args.length).toBeGreaterThanOrEqual(1);

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
      expect(modifiers.as).toBeDefined();
    });

    it('should parse persist with ttl modifier', () => {
      const node = parseOk('persist data to session as "draft" ttl 5000');
      expect(node.type).toBe('command');
      expect(node.name).toBe('persist');

      const modifiers = getModifiers(node);
      expect(modifiers.to).toBeDefined();
      expect(modifiers.as).toBeDefined();
      expect(modifiers.ttl).toBeDefined();
      // TTL should be a numeric literal
      expect(modifiers.ttl.value).toBe(5000);
    });
  });

  describe('Restore operations', () => {
    it('should parse persist with from modifier (restore)', () => {
      const node = parseOk('persist "username" from local');
      expect(node.type).toBe('command');
      expect(node.name).toBe('persist');

      const args = getArgs(node);
      expect(args.length).toBeGreaterThanOrEqual(1);
      // First arg should be the key string
      expect(args[0]).toMatchObject({
        type: 'literal',
        value: 'username',
      });

      const modifiers = getModifiers(node);
      expect(modifiers.from).toBeDefined();
      // Should not have 'to' or 'as' modifiers
      expect(modifiers.to).toBeUndefined();
      expect(modifiers.as).toBeUndefined();
    });
  });

  describe('Remove operations', () => {
    it('should parse persist remove syntax', () => {
      const node = parseOk('persist remove "username" from local');
      expect(node.type).toBe('command');
      expect(node.name).toBe('persist');

      const modifiers = getModifiers(node);
      // Should have operation modifier set to 'remove'
      expect(modifiers.operation).toBeDefined();
      expect(modifiers.operation.value).toBe('remove');
      // Should have from modifier
      expect(modifiers.from).toBeDefined();
    });
  });

  describe('Persist in event handlers', () => {
    it('should parse persist inside on click handler', () => {
      const node = parseOk('on click persist "hello" to local as "greeting"');
      expect(node.type).toBe('eventHandler');
      expect(node.event).toBe('click');
      const commands = getCommands(node);
      expect(commands.length).toBeGreaterThanOrEqual(1);
      expect(commands[0].name).toBe('persist');
    });

    it('should parse persist chained with then', () => {
      const node = parseOk('persist myData to local as "key" then log "saved"');
      expect(node.type).toBe('CommandSequence');
      const cmds = getCommands(node);
      expect(cmds.length).toBe(2);
      expect(cmds[0].name).toBe('persist');
      expect(cmds[1].name).toBe('log');
    });
  });

  describe('Position tracking', () => {
    it('should have valid start/end positions', () => {
      const node = parseOk('persist "key" from local');
      expect(node.start ?? 0).toBeGreaterThanOrEqual(0);
      expect(node.end ?? 0).toBeGreaterThan(node.start ?? 0);
    });
  });
});

describe('Bind and Persist combined', () => {
  it('should parse bind then persist chain', () => {
    const node = parseOk('bind :name to #input.value then persist :name to local as "name"');
    expect(node.type).toBe('CommandSequence');
    const cmds = getCommands(node);
    expect(cmds.length).toBe(2);
    expect(cmds[0].name).toBe('bind');
    expect(cmds[1].name).toBe('persist');
  });

  it('should parse event handler with both bind and persist', () => {
    const input = `on click
      bind :val to #input.value
      then persist :val to local as "saved"`;
    const node = parseOk(input);
    expect(node.type).toBe('eventHandler');
    expect(node.event).toBe('click');
    const commands = getCommands(node);
    expect(commands.length).toBeGreaterThanOrEqual(2);
    expect(commands[0].name).toBe('bind');
    expect(commands[1].name).toBe('persist');
  });
});
