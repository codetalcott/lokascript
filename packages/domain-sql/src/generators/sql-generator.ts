/**
 * SQL Code Generator
 *
 * Transforms semantic AST nodes into standard SQL output.
 * Always generates English SQL keywords (SELECT, FROM, WHERE, etc.)
 * regardless of the input language.
 */

import type { SemanticNode, CodeGenerator } from '@lokascript/framework';

function extractValue(value: {
  type: string;
  raw?: string;
  value?: string | number | boolean;
}): string {
  if ('raw' in value && value.raw !== undefined) return String(value.raw);
  if ('value' in value && value.value !== undefined) return String(value.value);
  return '*';
}

function generateSelect(node: SemanticNode): string {
  const columns = node.roles.get('columns');
  const source = node.roles.get('source');
  const condition = node.roles.get('condition');

  const columnsStr = columns ? extractValue(columns as any) : '*';
  const sourceStr = source ? extractValue(source as any) : 'table';

  let sql = `SELECT ${columnsStr} FROM ${sourceStr}`;

  if (condition) {
    sql += ` WHERE ${extractValue(condition as any)}`;
  }

  return sql;
}

function generateInsert(node: SemanticNode): string {
  const values = node.roles.get('values');
  const destination = node.roles.get('destination');

  const valuesStr = values ? extractValue(values as any) : '()';
  const destStr = destination ? extractValue(destination as any) : 'table';

  return `INSERT INTO ${destStr} VALUES (${valuesStr})`;
}

function generateUpdate(node: SemanticNode): string {
  const source = node.roles.get('source');
  const values = node.roles.get('values');
  const condition = node.roles.get('condition');

  const sourceStr = source ? extractValue(source as any) : 'table';
  const valuesStr = values ? extractValue(values as any) : '';

  let sql = `UPDATE ${sourceStr} SET ${valuesStr}`;

  if (condition) {
    sql += ` WHERE ${extractValue(condition as any)}`;
  }

  return sql;
}

function generateDelete(node: SemanticNode): string {
  const source = node.roles.get('source');
  const condition = node.roles.get('condition');

  const sourceStr = source ? extractValue(source as any) : 'table';

  let sql = `DELETE FROM ${sourceStr}`;

  if (condition) {
    sql += ` WHERE ${extractValue(condition as any)}`;
  }

  return sql;
}

/**
 * SQL code generator implementation.
 */
export const sqlCodeGenerator: CodeGenerator = {
  generate(node: SemanticNode): string {
    switch (node.action) {
      case 'select':
        return generateSelect(node);
      case 'insert':
        return generateInsert(node);
      case 'update':
        return generateUpdate(node);
      case 'delete':
        return generateDelete(node);
      default:
        throw new Error(`Unknown SQL command: ${node.action}`);
    }
  },
};
