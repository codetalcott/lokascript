/**
 * Analysis Tools
 *
 * Code analysis capabilities from @hyperfixi/ast-toolkit.
 * These tools help LLMs understand hyperscript code structure and quality.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// =============================================================================
// Tool Definitions
// =============================================================================

export const analysisTools: Tool[] = [
  {
    name: 'analyze_complexity',
    description: 'Calculate code complexity metrics (cyclomatic, cognitive, Halstead) for hyperscript',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The hyperscript code to analyze',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'analyze_metrics',
    description: 'Perform comprehensive code analysis including patterns, code smells, and quality metrics',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The hyperscript code to analyze',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'explain_code',
    description: 'Generate natural language explanation of hyperscript code',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The hyperscript code to explain',
        },
        audience: {
          type: 'string',
          enum: ['beginner', 'intermediate', 'expert'],
          description: 'Target audience level',
        },
        detail: {
          type: 'string',
          enum: ['brief', 'detailed', 'comprehensive'],
          description: 'Level of detail',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'recognize_intent',
    description: 'Analyze hyperscript code to understand its purpose and classify common patterns',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The hyperscript code to analyze',
        },
      },
      required: ['code'],
    },
  },
];

// =============================================================================
// Tool Handlers
// =============================================================================

export async function handleAnalysisTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  // Phase 7: Validate required parameters first
  const code = args.code as string;
  if (!code || typeof code !== 'string') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Missing required parameter: code',
              received: args,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }

  // Phase 7: Try to import ast-toolkit, but don't fail if unavailable
  let astToolkit: any = null;
  try {
    astToolkit = await import('@hyperfixi/ast-toolkit');
  } catch {
    // ast-toolkit not available - will use fallback functions
  }

  try {
    switch (name) {
      case 'analyze_complexity': {
        // Use fallback if ast-toolkit unavailable
        if (!astToolkit) {
          return simpleAnalysis(code, 'complexity');
        }
        // Parse code to AST first
        const ast = await parseHyperscript(code);
        if (!ast) {
          return simpleAnalysis(code, 'complexity');
        }
        const complexity = astToolkit.calculateComplexity(ast);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  cyclomatic: complexity.cyclomatic,
                  cognitive: complexity.cognitive,
                  halstead: complexity.halstead,
                  summary: `Cyclomatic: ${complexity.cyclomatic}, Cognitive: ${complexity.cognitive}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'analyze_metrics': {
        // Use fallback if ast-toolkit unavailable
        if (!astToolkit) {
          return simpleAnalysis(code, 'metrics');
        }
        const ast = await parseHyperscript(code);
        if (!ast) {
          return simpleAnalysis(code, 'metrics');
        }
        const metrics = astToolkit.analyzeMetrics(ast);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  complexity: metrics.complexity,
                  patterns: metrics.patterns,
                  smells: metrics.smells,
                  summary: `Found ${metrics.patterns?.length || 0} patterns, ${metrics.smells?.length || 0} code smells`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'explain_code': {
        const audience = (args.audience as string) || 'intermediate';
        const detail = (args.detail as string) || 'detailed';
        // Use fallback if ast-toolkit unavailable
        if (!astToolkit) {
          return simpleExplanation(code, audience, detail);
        }
        const ast = await parseHyperscript(code);
        if (!ast) {
          return simpleExplanation(code, audience, detail);
        }
        const explanation = astToolkit.explainCode(ast, { audience, detail });
        return {
          content: [{ type: 'text', text: JSON.stringify(explanation, null, 2) }],
        };
      }

      case 'recognize_intent': {
        // Phase 7: Use fallback if ast-toolkit unavailable
        if (!astToolkit) {
          return simpleIntentRecognition(code);
        }
        const intent = astToolkit.recognizeIntent(code);
        return {
          content: [{ type: 'text', text: JSON.stringify(intent, null, 2) }],
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown analysis tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: `Error in ${name}`,
              message: error instanceof Error ? error.message : String(error),
              code,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

async function parseHyperscript(code: string): Promise<any> {
  try {
    const core = await import('@hyperfixi/core');
    if (core.parse) {
      return await core.parse(code);
    }
  } catch {
    // Core not available, fall back to simple analysis
  }
  return null;
}

function simpleAnalysis(
  code: string,
  type: 'complexity' | 'metrics'
): { content: Array<{ type: string; text: string }> } {
  // Simple regex-based analysis when ast-toolkit isn't available
  const lines = code.split('\n').length;
  const commands = code.match(/\b(toggle|add|remove|show|hide|set|put|fetch|wait|send)\b/gi) || [];
  const conditionals = code.match(/\b(if|else|unless)\b/gi) || [];
  const loops = code.match(/\b(repeat|for|while)\b/gi) || [];

  const result = {
    lines,
    commandCount: commands.length,
    commands: [...new Set(commands.map((c) => c.toLowerCase()))],
    conditionalCount: conditionals.length,
    loopCount: loops.length,
    estimatedComplexity: 1 + conditionals.length + loops.length,
    note: 'Simple analysis (full AST analysis requires @hyperfixi/ast-toolkit)',
  };

  return {
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
}

function simpleExplanation(
  code: string,
  audience: string,
  detail: string
): { content: Array<{ type: string; text: string }> } {
  // Generate a simple explanation based on pattern matching
  const parts: string[] = [];

  // Detect event handler
  const eventMatch = code.match(/on\s+(\w+)/i);
  if (eventMatch) {
    parts.push(`This code runs when a ${eventMatch[1]} event occurs.`);
  }

  // Detect commands
  const toggleMatch = code.match(/toggle\s+([.\w#-]+)/i);
  if (toggleMatch) {
    parts.push(`It toggles the ${toggleMatch[1]} class/attribute.`);
  }

  const addMatch = code.match(/add\s+([.\w#-]+)/i);
  if (addMatch) {
    parts.push(`It adds ${addMatch[1]}.`);
  }

  const removeMatch = code.match(/remove\s+([.\w#-]+)/i);
  if (removeMatch) {
    parts.push(`It removes ${removeMatch[1]}.`);
  }

  const fetchMatch = code.match(/fetch\s+([^\s]+)/i);
  if (fetchMatch) {
    parts.push(`It fetches data from ${fetchMatch[1]}.`);
  }

  if (parts.length === 0) {
    parts.push('This is hyperscript code that adds interactivity to an element.');
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            overview: parts.join(' '),
            audience,
            detail,
            code,
          },
          null,
          2
        ),
      },
    ],
  };
}

/**
 * Phase 7: Simple pattern-based intent recognition as fallback.
 * Detects common hyperscript patterns without full AST analysis.
 */
function simpleIntentRecognition(
  code: string
): { content: Array<{ type: string; text: string }> } {
  const intents: string[] = [];
  const confidence: Record<string, number> = {};

  // Event handling
  if (/on\s+(click|submit|change|input|keydown|keyup|keypress|load|scroll|mouseenter|mouseleave|focus|blur)/i.test(code)) {
    intents.push('event-handling');
    confidence['event-handling'] = 0.9;
  }

  // DOM manipulation
  if (/\b(toggle|add|remove|show|hide)\b/i.test(code)) {
    intents.push('dom-manipulation');
    confidence['dom-manipulation'] = 0.85;
  }

  // Data fetching
  if (/\b(fetch|get|post)\b/i.test(code)) {
    intents.push('data-fetching');
    confidence['data-fetching'] = 0.85;
  }

  // Form handling
  if (/\b(submit|validate|form|input)\b/i.test(code)) {
    intents.push('form-handling');
    confidence['form-handling'] = 0.7;
  }

  // Animation
  if (/\b(transition|animate|settle|wait)\b/i.test(code)) {
    intents.push('animation');
    confidence['animation'] = 0.75;
  }

  // State management
  if (/\b(set|put|increment|decrement)\b/i.test(code)) {
    intents.push('state-management');
    confidence['state-management'] = 0.8;
  }

  // Navigation
  if (/\b(go\s+to|navigate|redirect)\b/i.test(code)) {
    intents.push('navigation');
    confidence['navigation'] = 0.8;
  }

  // Default if no patterns matched
  if (intents.length === 0) {
    intents.push('general-interactivity');
    confidence['general-interactivity'] = 0.5;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            primaryIntent: intents[0],
            allIntents: intents,
            confidence,
            code,
            note: 'Pattern-based analysis (full intent recognition requires @hyperfixi/ast-toolkit)',
          },
          null,
          2
        ),
      },
    ],
  };
}
