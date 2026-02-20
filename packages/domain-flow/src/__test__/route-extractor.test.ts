/**
 * Route Extractor Tests
 *
 * Tests extraction of server route descriptors from FlowSpec objects.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createFlowDSL, toFlowSpec, extractRoute, extractRoutes } from '../index.js';
import type { MultilingualDSL } from '@lokascript/framework';

describe('Route Extractor', () => {
  let flow: MultilingualDSL;

  beforeAll(() => {
    flow = createFlowDSL();
  });

  describe('Single route extraction', () => {
    it('should extract GET route from fetch', () => {
      const node = flow.parse('fetch /api/users as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route).not.toBeNull();
      expect(route!.path).toBe('/api/users');
      expect(route!.method).toBe('GET');
      expect(route!.responseFormat).toBe('json');
    });

    it('should extract POST route from submit', () => {
      const node = flow.parse('submit #checkout to /api/order as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.path).toBe('/api/order');
      expect(route!.method).toBe('POST');
    });

    it('should extract path params from {param} syntax', () => {
      const node = flow.parse('fetch /api/users/{id}', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.pathParams).toContain('id');
    });

    it('should extract path params from :param syntax', () => {
      const node = flow.parse('fetch /api/users/:id', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.pathParams).toContain('id');
    });

    it('should generate handler name from URL', () => {
      const node = flow.parse('fetch /api/users as json', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.handlerName).toBe('getUsers');
    });

    it('should generate create prefix for POST', () => {
      const node = flow.parse('submit #form to /api/users', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.handlerName).toBe('createUsers');
    });

    it('should return null for transform (no URL)', () => {
      const node = flow.parse('transform data with uppercase', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route).toBeNull();
    });

    it('should mark stream as SSE response format', () => {
      const node = flow.parse('stream /api/events as sse', 'en');
      const spec = toFlowSpec(node, 'en');
      const route = extractRoute(spec);
      expect(route!.responseFormat).toBe('sse');
      expect(route!.sourceCommand).toBe('stream');
    });
  });

  describe('Batch route extraction', () => {
    it('should extract multiple routes', () => {
      const specs = [
        toFlowSpec(flow.parse('fetch /api/users as json', 'en'), 'en'),
        toFlowSpec(flow.parse('submit #form to /api/orders', 'en'), 'en'),
        toFlowSpec(flow.parse('transform data with uppercase', 'en'), 'en'),
      ];
      const routes = extractRoutes(specs);
      expect(routes).toHaveLength(2); // transform has no route
      expect(routes[0].path).toBe('/api/users');
      expect(routes[1].path).toBe('/api/orders');
    });
  });
});
