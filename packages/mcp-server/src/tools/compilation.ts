/**
 * Compilation Tools
 *
 * MCP tools for the LokaScript compilation service.
 * Compile, validate, translate, generate tests, and generate components.
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// Lazy-import compilation service (resolved at first call)
let servicePromise: Promise<any> | null = null;

async function getService() {
  if (!servicePromise) {
    servicePromise = import('@lokascript/compilation-service').then(async mod => {
      return mod.CompilationService.create();
    });
  }
  return servicePromise;
}

// =============================================================================
// Tool Definitions
// =============================================================================

export const compilationTools: Tool[] = [
  {
    name: 'compile_hyperscript',
    description:
      'Compile hyperscript to optimized JavaScript. Accepts natural language (24 languages), explicit syntax ([command role:value]), or LLM JSON ({ action, roles, trigger }).',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Natural language hyperscript (requires language)',
        },
        explicit: {
          type: 'string',
          description: 'Explicit syntax: [command role:value ...]',
        },
        semantic: {
          type: 'object',
          description: 'LLM JSON: { action, roles, trigger }',
          properties: {
            action: { type: 'string' },
            roles: { type: 'object' },
            trigger: { type: 'object' },
          },
        },
        language: {
          type: 'string',
          description: 'ISO 639-1 language code (required for code input)',
        },
        confidence: {
          type: 'number',
          description: 'Minimum confidence threshold (default 0.7)',
        },
      },
    },
  },
  {
    name: 'validate_and_compile',
    description:
      'Validate hyperscript without compiling. Returns semantic representation and diagnostics. Same input format as compile_hyperscript.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Natural language hyperscript' },
        explicit: { type: 'string', description: 'Explicit syntax' },
        semantic: { type: 'object', description: 'LLM JSON' },
        language: { type: 'string', description: 'Language code' },
        confidence: { type: 'number', description: 'Minimum confidence' },
      },
    },
  },
  {
    name: 'translate_code',
    description: 'Translate hyperscript between any of 24 supported languages.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Hyperscript code to translate' },
        from: { type: 'string', description: 'Source language code' },
        to: { type: 'string', description: 'Target language code' },
      },
      required: ['code', 'from', 'to'],
    },
  },
  {
    name: 'generate_tests',
    description:
      'Generate Playwright behavior tests from hyperscript. Extracts abstract operations and renders them as test assertions.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Natural language hyperscript' },
        explicit: { type: 'string', description: 'Explicit syntax' },
        semantic: { type: 'object', description: 'LLM JSON' },
        language: { type: 'string', description: 'Language code' },
        testName: { type: 'string', description: 'Custom test name' },
        executionMode: {
          type: 'string',
          enum: ['runtime', 'compiled'],
          description: 'How to load hyperscript in test (default runtime)',
        },
      },
    },
  },
  {
    name: 'generate_component',
    description:
      'Generate a React component from hyperscript. Maps semantic operations to React hooks and JSX.',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Natural language hyperscript' },
        explicit: { type: 'string', description: 'Explicit syntax' },
        semantic: { type: 'object', description: 'LLM JSON' },
        language: { type: 'string', description: 'Language code' },
        componentName: { type: 'string', description: 'Custom component name' },
        typescript: {
          type: 'boolean',
          description: 'TypeScript output (default true)',
        },
      },
    },
  },
];

// =============================================================================
// Tool Handler
// =============================================================================

export async function handleCompilationTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  try {
    const service = await getService();

    switch (name) {
      case 'compile_hyperscript': {
        const result = service.compile({
          code: args.code as string | undefined,
          explicit: args.explicit as string | undefined,
          semantic: args.semantic as any,
          language: args.language as string | undefined,
          confidence: args.confidence as number | undefined,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.ok,
        };
      }

      case 'validate_and_compile': {
        const result = service.validate({
          code: args.code as string | undefined,
          explicit: args.explicit as string | undefined,
          semantic: args.semantic as any,
          language: args.language as string | undefined,
          confidence: args.confidence as number | undefined,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.ok,
        };
      }

      case 'translate_code': {
        const result = service.translate({
          code: args.code as string,
          from: args.from as string,
          to: args.to as string,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.ok,
        };
      }

      case 'generate_tests': {
        const result = service.generateTests({
          code: args.code as string | undefined,
          explicit: args.explicit as string | undefined,
          semantic: args.semantic as any,
          language: args.language as string | undefined,
          testName: args.testName as string | undefined,
          executionMode: args.executionMode as 'runtime' | 'compiled' | undefined,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.ok,
        };
      }

      case 'generate_component': {
        const result = service.generateComponent({
          code: args.code as string | undefined,
          explicit: args.explicit as string | undefined,
          semantic: args.semantic as any,
          language: args.language as string | undefined,
          componentName: args.componentName as string | undefined,
          typescript: args.typescript as boolean | undefined,
        });
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
          isError: !result.ok,
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown compilation tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error in ${name}: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
