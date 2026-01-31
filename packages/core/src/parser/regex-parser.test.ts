/**
 * Test Suite for Regex Parser
 *
 * Tests the RegexParserImpl which wraps the lite bundle's regex-based parser.
 */

import { describe, it, expect } from 'vitest';
import { regexParser, createRegexParser } from './regex-parser';

describe('RegexParser', () => {
  describe('name', () => {
    it('should return "regex"', () => {
      expect(regexParser.name).toBe('regex');
    });
  });

  describe('supportedCommands', () => {
    it('should include the 8 basic commands', () => {
      const cmds = regexParser.supportedCommands!;
      expect(cmds).toContain('add');
      expect(cmds).toContain('remove');
      expect(cmds).toContain('toggle');
      expect(cmds).toContain('put');
      expect(cmds).toContain('set');
      expect(cmds).toContain('log');
      expect(cmds).toContain('send');
      expect(cmds).toContain('wait');
    });

    it('should have exactly 8 commands', () => {
      expect(regexParser.supportedCommands!.length).toBe(8);
    });
  });

  describe('supports', () => {
    it('should return true for supported commands', () => {
      expect(regexParser.supports!('toggle .active')).toBe(true);
      expect(regexParser.supports!('add .class to #el')).toBe(true);
      expect(regexParser.supports!('remove .class')).toBe(true);
      expect(regexParser.supports!('set :count to 0')).toBe(true);
      expect(regexParser.supports!('put "text" into #el')).toBe(true);
      expect(regexParser.supports!('log "hello"')).toBe(true);
      expect(regexParser.supports!('send myEvent')).toBe(true);
      expect(regexParser.supports!('wait 1s')).toBe(true);
    });

    it('should return true for event handlers', () => {
      expect(regexParser.supports!('on click toggle .active')).toBe(true);
      expect(regexParser.supports!('every 1s log "tick"')).toBe(true);
      expect(regexParser.supports!('init set :count to 0')).toBe(true);
    });

    it('should return false for unsupported commands', () => {
      expect(regexParser.supports!('transition opacity to 1')).toBe(false);
      expect(regexParser.supports!('fetch "/api"')).toBe(false);
      expect(regexParser.supports!('js console.log("hi") end')).toBe(false);
    });
  });

  describe('parse', () => {
    it('should parse a simple toggle command', () => {
      const result = regexParser.parse('toggle .active on me');
      expect(result).toBeDefined();
    });

    it('should parse event handler syntax', () => {
      const result = regexParser.parse('on click toggle .active');
      expect(result).toBeDefined();
    });
  });

  describe('parseCommands', () => {
    it('should return an array', () => {
      const result = regexParser.parseCommands!('toggle .active');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createRegexParser', () => {
    it('should create a new parser instance', () => {
      const parser = createRegexParser();
      expect(parser).toBeDefined();
      expect(parser.name).toBe('regex');
    });

    it('should create independent instances', () => {
      const p1 = createRegexParser();
      const p2 = createRegexParser();
      expect(p1).not.toBe(p2);
    });
  });
});
