import type { CodeGenerator, SemanticNode } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';

export const todoCodeGenerator: CodeGenerator = {
  generate(node: SemanticNode): string {
    switch (node.action) {
      case 'add':
        return generateAdd(node);
      case 'complete':
        return generateComplete(node);
      case 'list':
        return generateList(node);
      default:
        return JSON.stringify({ error: `unknown command: ${node.action}` });
    }
  },
};

function generateAdd(node: SemanticNode): string {
  const item = extractRoleValue(node, 'item');
  if (!item) return JSON.stringify({ error: 'add: missing required role "item"' });
  const obj: Record<string, string> = { action: 'add', item };
  const list = extractRoleValue(node, 'list');
  if (list) obj.list = list;
  return JSON.stringify(obj);
}

function generateComplete(node: SemanticNode): string {
  const item = extractRoleValue(node, 'item');
  if (!item) return JSON.stringify({ error: 'complete: missing required role "item"' });
  return JSON.stringify({ action: 'complete', item });
}

function generateList(node: SemanticNode): string {
  const obj: Record<string, string> = { action: 'list' };
  const list = extractRoleValue(node, 'list');
  if (list) obj.list = list;
  return JSON.stringify(obj);
}
