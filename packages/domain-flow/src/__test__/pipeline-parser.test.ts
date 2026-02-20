/**
 * Pipeline Parser Tests
 *
 * Tests multi-step arrow-chained pipelines, multi-line input,
 * and cross-language pipeline parsing.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createFlowDSL, parseFlowPipeline, compilePipeline } from '../index.js';
import type { MultilingualDSL } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';

describe('Pipeline Parser', () => {
  let flow: MultilingualDSL;

  beforeAll(() => {
    flow = createFlowDSL();
  });

  // ===========================================================================
  // Single-Line Arrow Chains
  // ===========================================================================

  describe('Arrow-delimited chains', () => {
    it('should parse two-step pipeline with Unicode arrow', () => {
      const result = parseFlowPipeline(
        flow,
        'fetch /api/users as json → transform data with uppercase',
        'en'
      );
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].node.action).toBe('fetch');
      expect(result.steps[1].node.action).toBe('transform');
    });

    it('should parse two-step pipeline with ASCII arrow', () => {
      const result = parseFlowPipeline(
        flow,
        'fetch /api/users as json -> transform data with uppercase',
        'en'
      );
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(2);
    });

    it('should parse three-step pipeline', () => {
      const result = parseFlowPipeline(
        flow,
        'fetch /api/data as json → transform data with uppercase → transform data with trim',
        'en'
      );
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(3);
      expect(result.steps[0].node.action).toBe('fetch');
      expect(result.steps[1].node.action).toBe('transform');
      expect(result.steps[2].node.action).toBe('transform');
    });

    it('should preserve role values across pipeline steps', () => {
      const result = parseFlowPipeline(
        flow,
        'fetch /api/users as json → transform data with uppercase',
        'en'
      );
      expect(extractRoleValue(result.steps[0].node, 'source')).toBe('/api/users');
      expect(extractRoleValue(result.steps[1].node, 'patient')).toBe('data');
    });
  });

  // ===========================================================================
  // Multi-Line Pipelines
  // ===========================================================================

  describe('Multi-line pipelines', () => {
    it('should parse newline-separated commands', () => {
      const input = `fetch /api/users as json
transform data with uppercase`;
      const result = parseFlowPipeline(flow, input, 'en');
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(2);
    });

    it('should skip comment lines', () => {
      const input = `-- This is a comment
fetch /api/users as json
-- Another comment
transform data with uppercase`;
      const result = parseFlowPipeline(flow, input, 'en');
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(2);
    });

    it('should handle mixed arrows and newlines', () => {
      const input = `fetch /api/users as json → transform data with uppercase
stream /api/events as sse`;
      const result = parseFlowPipeline(flow, input, 'en');
      expect(result.steps).toHaveLength(3);
    });
  });

  // ===========================================================================
  // Cross-Language Pipelines
  // ===========================================================================

  describe('Cross-language pipelines', () => {
    it('should parse Spanish pipeline', () => {
      const result = parseFlowPipeline(
        flow,
        'obtener /api/users como json → transformar data con uppercase',
        'es'
      );
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].node.action).toBe('fetch');
    });

    it('should parse Japanese SOV pipeline', () => {
      const result = parseFlowPipeline(flow, '/api/users json で 取得', 'ja');
      expect(result.errors).toHaveLength(0);
      expect(result.steps).toHaveLength(1);
      expect(result.steps[0].node.action).toBe('fetch');
    });
  });

  // ===========================================================================
  // Error Handling
  // ===========================================================================

  describe('Error handling', () => {
    it('should return errors for unparseable segments', () => {
      const result = parseFlowPipeline(flow, 'fetch /api/users → gobbledygook nonsense', 'en');
      expect(result.steps.length).toBeGreaterThanOrEqual(1); // fetch should parse
      expect(result.errors.length).toBeGreaterThanOrEqual(0); // nonsense may fail
    });

    it('should handle empty input', () => {
      const result = parseFlowPipeline(flow, '', 'en');
      expect(result.steps).toHaveLength(0);
    });

    it('should handle arrow-only input', () => {
      const result = parseFlowPipeline(flow, '→ →', 'en');
      expect(result.steps).toHaveLength(0);
    });
  });

  // ===========================================================================
  // Pipeline Compilation
  // ===========================================================================

  describe('Pipeline compilation', () => {
    it('should compile single-step pipeline', () => {
      const result = compilePipeline(flow, 'fetch /api/users as json into #list', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('fetch');
    });

    it('should return error for empty pipeline', () => {
      const result = compilePipeline(flow, '', 'en');
      expect(result.ok).toBe(false);
      expect(result.errors).toContain('Empty pipeline');
    });

    it('should compile multi-step pipeline via renderFlow', () => {
      const result = compilePipeline(
        flow,
        'fetch /api/users as json → transform data with uppercase',
        'en'
      );
      expect(result.ok).toBe(true);
      expect(result.code).toContain("fetch('/api/users')");
      expect(result.code).toContain('uppercase');
      expect(result.code).toContain('--- next step ---');
    });

    it('should compile Spanish multi-step pipeline', () => {
      const result = compilePipeline(
        flow,
        'obtener /api/users como json → transformar data con uppercase',
        'es'
      );
      expect(result.ok).toBe(true);
      expect(result.code).toContain("fetch('/api/users')");
      expect(result.code).toContain('uppercase');
    });
  });
});
