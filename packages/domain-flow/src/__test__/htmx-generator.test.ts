/**
 * HTMX Generator Tests
 *
 * Tests HTMX attribute generation from FlowSpec objects.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createFlowDSL, toFlowSpec, generateHTMX } from '../index.js';
import type { MultilingualDSL } from '@lokascript/framework';

describe('HTMX Generator', () => {
  let flow: MultilingualDSL;

  beforeAll(() => {
    flow = createFlowDSL();
  });

  describe('fetch → hx-get', () => {
    it('should generate hx-get for fetch', () => {
      const node = flow.parse('fetch /api/users as json into #user-list', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result).not.toBeNull();
      expect(result!.attrs['hx-get']).toBe('/api/users');
      expect(result!.attrs['hx-target']).toBe('#user-list');
      expect(result!.attrs['hx-swap']).toBe('innerHTML');
    });

    it('should add note about JSON responses', () => {
      const node = flow.parse('fetch /api/users as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result!.notes.length).toBeGreaterThan(0);
      expect(result!.notes[0]).toContain('JSON');
    });
  });

  describe('poll → hx-get + hx-trigger', () => {
    it('should generate hx-trigger every Ns for poll', () => {
      const node = flow.parse('poll /api/status every 5s into #dashboard', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result).not.toBeNull();
      expect(result!.attrs['hx-get']).toBe('/api/status');
      expect(result!.attrs['hx-trigger']).toBe('every 5s');
      expect(result!.attrs['hx-target']).toBe('#dashboard');
    });

    it('should convert ms interval to seconds', () => {
      const node = flow.parse('poll /api/status every 30s', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result!.attrs['hx-trigger']).toBe('every 30s');
    });
  });

  describe('stream → sse extension', () => {
    it('should generate SSE extension attributes', () => {
      const node = flow.parse('stream /api/events as sse into #event-log', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result).not.toBeNull();
      expect(result!.attrs['hx-ext']).toBe('sse');
      expect(result!.attrs['sse-connect']).toBe('/api/events');
    });

    it('should note SSE extension requirement', () => {
      const node = flow.parse('stream /api/events as sse', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result!.notes.some(n => n.includes('sse extension'))).toBe(true);
    });
  });

  describe('submit → hx-post', () => {
    it('should generate hx-post for submit', () => {
      const node = flow.parse('submit #checkout to /api/order as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result).not.toBeNull();
      expect(result!.attrs['hx-post']).toBe('/api/order');
    });

    it('should include json encoding for json submit', () => {
      const node = flow.parse('submit #checkout to /api/order as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result!.attrs['hx-encoding']).toBe('application/json');
    });
  });

  describe('transform → null', () => {
    it('should return null for transform (no HTMX equivalent)', () => {
      const node = flow.parse('transform data with uppercase', 'en');
      const spec = toFlowSpec(node, 'en');
      const result = generateHTMX(spec);
      expect(result).toBeNull();
    });
  });
});
