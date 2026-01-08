/**
 * Phase 7: Fallback Behavior Tests
 *
 * Tests that analysis tools return useful data even when ast-toolkit is unavailable.
 * These tests verify the graceful degradation behavior added in Phase 7.
 */
import { describe, it, expect } from 'vitest';
import { handleAnalysisTool, analysisTools } from '../tools/analysis.js';

// Helper to safely extract text from MCP content
function getTextContent(result: { content: Array<{ type: string; text?: string }> }): string {
  const item = result.content[0];
  if (item.type === 'text' && item.text) {
    return item.text;
  }
  return '';
}

// =============================================================================
// Input Validation Tests
// =============================================================================

describe('Analysis tools input validation', () => {
  it('returns error for missing code parameter', async () => {
    const result = await handleAnalysisTool('analyze_complexity', {});

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(getTextContent(result));
    expect(parsed.error).toContain('Missing required parameter');
  });

  it('returns error for null code parameter', async () => {
    const result = await handleAnalysisTool('analyze_complexity', { code: null });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(getTextContent(result));
    expect(parsed.error).toContain('Missing required parameter');
  });

  it('returns error for non-string code parameter', async () => {
    const result = await handleAnalysisTool('analyze_complexity', { code: 123 });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(getTextContent(result));
    expect(parsed.error).toContain('Missing required parameter');
  });
});

// =============================================================================
// Fallback Behavior Tests
// =============================================================================

describe('analyze_complexity fallback', () => {
  it('returns simple metrics for valid code', async () => {
    const result = await handleAnalysisTool('analyze_complexity', {
      code: 'on click toggle .active',
    });

    // Should not be an error - should use fallback
    const parsed = JSON.parse(getTextContent(result));

    // Either ast-toolkit result or fallback result
    if (parsed.note) {
      // Fallback result
      expect(parsed.note).toContain('Simple analysis');
      expect(parsed).toHaveProperty('commandCount');
      expect(parsed).toHaveProperty('estimatedComplexity');
    } else {
      // ast-toolkit result
      expect(parsed).toHaveProperty('cyclomatic');
    }
  });

  it('counts commands in code', async () => {
    const result = await handleAnalysisTool('analyze_complexity', {
      code: 'on click toggle .active then add .highlight',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      // Fallback result
      expect(parsed.commandCount).toBeGreaterThanOrEqual(2);
      expect(parsed.commands).toContain('toggle');
      expect(parsed.commands).toContain('add');
    }
  });

  it('counts conditionals in code', async () => {
    const result = await handleAnalysisTool('analyze_complexity', {
      code: 'on click if .active toggle .active else add .active end',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      // Fallback result - should detect if/else
      expect(parsed.conditionalCount).toBeGreaterThanOrEqual(1);
      expect(parsed.estimatedComplexity).toBeGreaterThan(1);
    }
  });
});

describe('analyze_metrics fallback', () => {
  it('returns simple metrics for valid code', async () => {
    const result = await handleAnalysisTool('analyze_metrics', {
      code: 'on click toggle .active',
    });

    const parsed = JSON.parse(getTextContent(result));

    // Either ast-toolkit result or fallback result
    if (parsed.note) {
      expect(parsed.note).toContain('Simple analysis');
      expect(parsed).toHaveProperty('lines');
      expect(parsed).toHaveProperty('commandCount');
    } else {
      expect(parsed).toHaveProperty('complexity');
    }
  });
});

describe('explain_code fallback', () => {
  it('returns pattern-based explanation for valid code', async () => {
    const result = await handleAnalysisTool('explain_code', {
      code: 'on click toggle .active',
      audience: 'beginner',
    });

    const parsed = JSON.parse(getTextContent(result));
    expect(parsed).toHaveProperty('overview');

    // Should mention the event and command
    if (parsed.overview) {
      expect(parsed.overview.toLowerCase()).toMatch(/click|toggle/);
    }
  });

  it('detects event handlers in explanation', async () => {
    const result = await handleAnalysisTool('explain_code', {
      code: 'on submit validate form',
    });

    const parsed = JSON.parse(getTextContent(result));
    expect(parsed.overview).toContain('submit');
  });

  it('detects fetch commands in explanation', async () => {
    const result = await handleAnalysisTool('explain_code', {
      code: 'on click fetch /api/data',
    });

    const parsed = JSON.parse(getTextContent(result));
    expect(parsed.overview).toMatch(/fetch|data/i);
  });
});

describe('recognize_intent fallback', () => {
  it('returns pattern-based intent for event handling code', async () => {
    const result = await handleAnalysisTool('recognize_intent', {
      code: 'on click toggle .active',
    });

    const parsed = JSON.parse(getTextContent(result));

    // Either ast-toolkit result or fallback result
    if (parsed.note) {
      // Fallback result
      expect(parsed.note).toContain('Pattern-based analysis');
      expect(parsed.allIntents).toContain('event-handling');
      expect(parsed.allIntents).toContain('dom-manipulation');
    } else {
      // ast-toolkit result - may use different property name
      expect(parsed.intent || parsed.primaryIntent).toBeDefined();
    }
  });

  it('detects data fetching intent', async () => {
    const result = await handleAnalysisTool('recognize_intent', {
      code: 'on click fetch /api/users then put result into #list',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      expect(parsed.allIntents).toContain('data-fetching');
    }
  });

  it('detects form handling intent', async () => {
    const result = await handleAnalysisTool('recognize_intent', {
      code: 'on submit validate form then send data',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      expect(parsed.allIntents).toContain('form-handling');
    }
  });

  it('detects state management intent', async () => {
    const result = await handleAnalysisTool('recognize_intent', {
      code: 'on click set :count to :count + 1',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      expect(parsed.allIntents).toContain('state-management');
    }
  });

  it('returns general-interactivity for unknown patterns', async () => {
    const result = await handleAnalysisTool('recognize_intent', {
      code: 'call myCustomFunction()',
    });

    const parsed = JSON.parse(getTextContent(result));

    if (parsed.note) {
      expect(parsed.primaryIntent).toBe('general-interactivity');
    }
  });
});

// =============================================================================
// Tool Definition Tests
// =============================================================================

describe('Analysis tool definitions', () => {
  it('exports 4 analysis tools', () => {
    expect(analysisTools).toHaveLength(4);
  });

  it('all tools have required schema properties', () => {
    for (const tool of analysisTools) {
      expect(tool.name).toBeDefined();
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.properties).toHaveProperty('code');
      expect(tool.inputSchema.required).toContain('code');
    }
  });
});
