/**
 * Test Suite for Hybrid Parser Aliases
 *
 * Tests command and event normalization functions and
 * runtime alias registration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  COMMAND_ALIASES,
  EVENT_ALIASES,
  normalizeCommand,
  normalizeEvent,
  addCommandAliases,
  addEventAliases,
} from './aliases';

describe('aliases', () => {
  describe('COMMAND_ALIASES', () => {
    it('should have expected built-in aliases', () => {
      expect(COMMAND_ALIASES.flip).toBe('toggle');
      expect(COMMAND_ALIASES.switch).toBe('toggle');
      expect(COMMAND_ALIASES.display).toBe('show');
      expect(COMMAND_ALIASES.reveal).toBe('show');
      expect(COMMAND_ALIASES.conceal).toBe('hide');
      expect(COMMAND_ALIASES.increase).toBe('increment');
      expect(COMMAND_ALIASES.decrease).toBe('decrement');
      expect(COMMAND_ALIASES.fire).toBe('trigger');
      expect(COMMAND_ALIASES.dispatch).toBe('send');
      expect(COMMAND_ALIASES.navigate).toBe('go');
      expect(COMMAND_ALIASES.goto).toBe('go');
    });
  });

  describe('EVENT_ALIASES', () => {
    it('should have expected built-in aliases', () => {
      expect(EVENT_ALIASES.clicked).toBe('click');
      expect(EVENT_ALIASES.pressed).toBe('keydown');
      expect(EVENT_ALIASES.changed).toBe('change');
      expect(EVENT_ALIASES.submitted).toBe('submit');
      expect(EVENT_ALIASES.loaded).toBe('load');
    });
  });

  describe('normalizeCommand', () => {
    it('should resolve known aliases to canonical names', () => {
      expect(normalizeCommand('flip')).toBe('toggle');
      expect(normalizeCommand('switch')).toBe('toggle');
      expect(normalizeCommand('display')).toBe('show');
      expect(normalizeCommand('reveal')).toBe('show');
      expect(normalizeCommand('conceal')).toBe('hide');
      expect(normalizeCommand('increase')).toBe('increment');
      expect(normalizeCommand('decrease')).toBe('decrement');
      expect(normalizeCommand('fire')).toBe('trigger');
      expect(normalizeCommand('dispatch')).toBe('send');
      expect(normalizeCommand('navigate')).toBe('go');
      expect(normalizeCommand('goto')).toBe('go');
    });

    it('should pass through unknown commands as lowercase', () => {
      expect(normalizeCommand('toggle')).toBe('toggle');
      expect(normalizeCommand('add')).toBe('add');
      expect(normalizeCommand('remove')).toBe('remove');
      expect(normalizeCommand('unknownCommand')).toBe('unknowncommand');
    });

    it('should be case-insensitive', () => {
      expect(normalizeCommand('FLIP')).toBe('toggle');
      expect(normalizeCommand('Flip')).toBe('toggle');
      expect(normalizeCommand('Display')).toBe('show');
    });

    it('should lowercase unknown commands', () => {
      expect(normalizeCommand('Toggle')).toBe('toggle');
      expect(normalizeCommand('ADD')).toBe('add');
    });
  });

  describe('normalizeEvent', () => {
    it('should resolve known aliases to canonical names', () => {
      expect(normalizeEvent('clicked')).toBe('click');
      expect(normalizeEvent('pressed')).toBe('keydown');
      expect(normalizeEvent('changed')).toBe('change');
      expect(normalizeEvent('submitted')).toBe('submit');
      expect(normalizeEvent('loaded')).toBe('load');
    });

    it('should pass through unknown events as lowercase', () => {
      expect(normalizeEvent('click')).toBe('click');
      expect(normalizeEvent('submit')).toBe('submit');
      expect(normalizeEvent('customEvent')).toBe('customevent');
    });

    it('should be case-insensitive', () => {
      expect(normalizeEvent('CLICKED')).toBe('click');
      expect(normalizeEvent('Pressed')).toBe('keydown');
      expect(normalizeEvent('Changed')).toBe('change');
    });

    it('should lowercase unknown events', () => {
      expect(normalizeEvent('Click')).toBe('click');
      expect(normalizeEvent('SUBMIT')).toBe('submit');
    });
  });

  describe('addCommandAliases', () => {
    it('should add custom command aliases', () => {
      addCommandAliases({ activate: 'show' });

      expect(normalizeCommand('activate')).toBe('show');
    });

    it('should allow overriding existing aliases', () => {
      const originalValue = COMMAND_ALIASES.flip;
      addCommandAliases({ flip: 'add' });

      expect(normalizeCommand('flip')).toBe('add');

      // Restore for other tests
      COMMAND_ALIASES.flip = originalValue;
    });

    it('should add multiple aliases at once', () => {
      // Keys must be lowercase since normalizeCommand lowercases input before lookup
      addCommandAliases({
        mytoggle: 'toggle',
        myshow: 'show',
      });

      expect(normalizeCommand('myToggle')).toBe('toggle');
      expect(normalizeCommand('myShow')).toBe('show');
    });
  });

  describe('addEventAliases', () => {
    it('should add custom event aliases', () => {
      addEventAliases({ tapped: 'click' });

      expect(normalizeEvent('tapped')).toBe('click');
    });

    it('should allow overriding existing aliases', () => {
      const originalValue = EVENT_ALIASES.clicked;
      addEventAliases({ clicked: 'dblclick' });

      expect(normalizeEvent('clicked')).toBe('dblclick');

      // Restore for other tests
      EVENT_ALIASES.clicked = originalValue;
    });

    it('should add multiple aliases at once', () => {
      addEventAliases({
        hovered: 'mouseover',
        focused: 'focus',
      });

      expect(normalizeEvent('hovered')).toBe('mouseover');
      expect(normalizeEvent('focused')).toBe('focus');
    });
  });
});
