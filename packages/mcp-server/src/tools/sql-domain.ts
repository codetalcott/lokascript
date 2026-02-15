/**
 * SQL Domain MCP Tools
 *
 * Provides multilingual SQL parsing, compilation, and validation via the
 * @lokascript/domain-sql package. Demonstrates the framework's generality
 * by exposing SQL DSL capabilities through the same MCP protocol.
 */

import { validateRequired, getString, jsonResponse, errorResponse } from './utils.js';
import type { ValidationError } from './utils.js';

// Lazy-loaded SQL DSL instance and renderer
let sqlDSL: any = null;
let sqlRenderer: ((node: any, language: string) => string) | null = null;

async function getSQL() {
  if (sqlDSL) return sqlDSL;

  try {
    const mod = await import('@lokascript/domain-sql');
    sqlDSL = mod.createSQLDSL();
    sqlRenderer = mod.renderSQL;
    return sqlDSL;
  } catch {
    throw new Error('@lokascript/domain-sql not available. Install it to use SQL domain tools.');
  }
}

// =============================================================================
// Tool Definitions
// =============================================================================

export const sqlDomainTools = [
  {
    name: 'parse_sql',
    description:
      'Parse a natural-language SQL query into a semantic representation. ' +
      'Supports English (SVO), Spanish (SVO), Japanese (SOV), Arabic (VSO), ' +
      'Korean (SOV), Chinese (SVO), Turkish (SOV), and French (SVO).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'SQL query in natural language (e.g., "select name from users")',
        },
        language: {
          type: 'string',
          description: 'Language code: en, es, ja, ar, ko, zh, tr, fr',
          default: 'en',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'compile_sql',
    description:
      'Compile a natural-language SQL query to standard SQL. ' +
      'Input can be in English, Spanish, Japanese, Arabic, Korean, Chinese, Turkish, or French.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'SQL query in natural language',
        },
        language: {
          type: 'string',
          description: 'Language code: en, es, ja, ar, ko, zh, tr, fr',
          default: 'en',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'validate_sql',
    description:
      'Validate a natural-language SQL query. Returns whether it parses successfully ' +
      'and any errors. Supports 8 languages.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to validate',
        },
        language: {
          type: 'string',
          description: 'Language code: en, es, ja, ar, ko, zh, tr, fr',
          default: 'en',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'translate_sql',
    description:
      'Translate a SQL query between natural languages. ' +
      'Parses in the source language and renders in the target language.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'SQL query to translate',
        },
        from: {
          type: 'string',
          description: 'Source language code: en, es, ja, ar, ko, zh, tr, fr',
        },
        to: {
          type: 'string',
          description: 'Target language code: en, es, ja, ar, ko, zh, tr, fr',
        },
      },
      required: ['query', 'from', 'to'],
    },
  },
];

// =============================================================================
// Handler
// =============================================================================

type ToolResponse = { content: Array<{ type: string; text: string }>; isError?: boolean };

export async function handleSQLDomainTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResponse> {
  try {
    switch (name) {
      case 'parse_sql':
        return await parseSql(args);
      case 'compile_sql':
        return await compileSql(args);
      case 'validate_sql':
        return await validateSql(args);
      case 'translate_sql':
        return await translateSql(args);
      default:
        return errorResponse(`Unknown SQL tool: ${name}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(`SQL tool error: ${message}`);
  }
}

// =============================================================================
// Tool Implementations
// =============================================================================

async function parseSql(args: Record<string, unknown>): Promise<ToolResponse> {
  const error = validateRequired(args, ['query']);
  if (error) return error;

  const query = getString(args, 'query');
  const language = getString(args, 'language', 'en');

  const sql = await getSQL();
  const node = sql.parse(query, language);

  // Convert roles Map to plain object for JSON serialization
  const roles: Record<string, unknown> = {};
  for (const [key, value] of node.roles) {
    roles[key] = value;
  }

  return jsonResponse({
    action: node.action,
    roles,
    language,
    query,
  });
}

async function compileSql(args: Record<string, unknown>): Promise<ToolResponse> {
  const error = validateRequired(args, ['query']);
  if (error) return error;

  const query = getString(args, 'query');
  const language = getString(args, 'language', 'en');

  const sql = await getSQL();
  const result = sql.compile(query, language);

  return jsonResponse({
    ok: result.ok,
    sql: result.code,
    errors: result.errors,
    language,
    input: query,
  });
}

async function validateSql(args: Record<string, unknown>): Promise<ToolResponse> {
  const error = validateRequired(args, ['query']);
  if (error) return error;

  const query = getString(args, 'query');
  const language = getString(args, 'language', 'en');

  const sql = await getSQL();
  const result = sql.validate(query, language);

  return jsonResponse({
    valid: result.valid,
    errors: result.errors,
    language,
    query,
  });
}

async function translateSql(args: Record<string, unknown>): Promise<ToolResponse> {
  const error = validateRequired(args, ['query', 'from', 'to']);
  if (error) return error;

  const query = getString(args, 'query');
  const from = getString(args, 'from');
  const to = getString(args, 'to');

  const sql = await getSQL();

  // Parse in source language
  const node = sql.parse(query, from);

  // Compile to standard SQL (language-neutral output)
  const compiled = sql.compile(query, from);

  // Render to target natural language
  let rendered: string | null = null;
  if (sqlRenderer) {
    try {
      rendered = sqlRenderer(node, to);
    } catch {
      // Fall through with rendered = null
    }
  }

  // Semantic representation
  const roles: Record<string, unknown> = {};
  for (const [key, value] of node.roles) {
    roles[key] = value;
  }

  return jsonResponse({
    input: { query, language: from },
    rendered: rendered ? { code: rendered, language: to } : null,
    semantic: { action: node.action, roles },
    sql: compiled.ok ? compiled.code : null,
  });
}
