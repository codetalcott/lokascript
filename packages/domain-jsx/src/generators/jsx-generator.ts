/**
 * JSX Code Generator
 *
 * Transforms semantic AST nodes into JSX/React code output.
 * Always generates standard JSX/React syntax regardless of the input language.
 *
 * Supports two modes:
 *  - JavaScript (default): standard JSX/React output
 *  - TypeScript: adds type annotations (useState<number>, interface Props, etc.)
 *
 * Generated output examples:
 *  - element   → <div className="app" />
 *  - component → function Button({ text, onClick }) { }
 *  - render    → createRoot(document.getElementById("root")).render(<App />)
 *  - state     → const [count, setCount] = useState(0)
 *  - effect    → useEffect(() => { fetchData(); }, [count])
 *  - fragment  → <><Header /><Footer /></>
 */

import type { SemanticNode, SemanticValue, CodeGenerator } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';

/** Escape characters for safe interpolation into JS string literals */
function escapeForString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Capitalize first letter for setter name: count → setCount
 */
function toSetterName(name: string): string {
  return 'set' + name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Capitalize first letter for component tags: header → <Header />
 */
function toPascalCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Split a props string into tokens, respecting quoted strings as single tokens.
 * e.g. 'className "my app" disabled' → ['className', '"my app"', 'disabled']
 */
function tokenizeProps(propsStr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < propsStr.length) {
    // Skip whitespace
    if (/\s/.test(propsStr[i])) {
      i++;
      continue;
    }
    // Quoted string — consume until matching close quote
    if (propsStr[i] === '"' || propsStr[i] === "'") {
      const quote = propsStr[i];
      let end = i + 1;
      while (end < propsStr.length && propsStr[end] !== quote) {
        if (propsStr[end] === '\\') end++; // skip escaped char
        end++;
      }
      tokens.push(propsStr.slice(i, end + 1));
      i = end + 1;
      continue;
    }
    // Unquoted token — consume until whitespace
    let end = i;
    while (end < propsStr.length && !/\s/.test(propsStr[end])) end++;
    tokens.push(propsStr.slice(i, end));
    i = end;
  }
  return tokens;
}

/**
 * Parse a props string into JSX attribute format.
 * e.g. 'className "my app"' → 'className="my app"'
 */
function parseProps(propsStr: string): string {
  const parts = tokenizeProps(propsStr);
  const pairs: string[] = [];
  let i = 0;
  while (i < parts.length) {
    const key = parts[i];
    // If next part looks like a value (quoted or numeric), pair them
    if (i + 1 < parts.length) {
      const val = parts[i + 1];
      if (/^["']/.test(val) || /^\d/.test(val)) {
        // Ensure value is quoted for JSX
        const quoted = /^["']/.test(val) ? val : `{${val}}`;
        pairs.push(`${key}=${quoted}`);
        i += 2;
        continue;
      }
    }
    // Standalone prop (boolean attribute)
    pairs.push(key);
    i++;
  }
  return pairs.join(' ');
}

/**
 * Infer a TypeScript type from an initial value string.
 */
function inferType(value: string): string {
  if (value === 'true' || value === 'false') return 'boolean';
  if (/^\d+(\\.\\d+)?$/.test(value)) return 'number';
  if (/^["']/.test(value)) return 'string';
  if (value === 'null' || value === 'undefined') return 'unknown';
  return 'unknown';
}

/**
 * Infer a TypeScript type from a SemanticValue, falling back to string heuristics.
 */
function inferTypeFromValue(sv: SemanticValue | undefined, strValue: string): string {
  if (sv && sv.type === 'literal' && 'dataType' in sv && sv.dataType) {
    return sv.dataType;
  }
  return inferType(strValue);
}

/**
 * Infer a TypeScript type for a component prop by name.
 */
function inferPropType(propName: string): string {
  if (/^on[A-Z]/.test(propName)) return '() => void';
  if (propName === 'disabled' || propName === 'checked' || propName === 'hidden') return 'boolean';
  if (propName === 'children') return 'React.ReactNode';
  return 'string';
}

// ---------------------------------------------------------------------------
// Command generators
// ---------------------------------------------------------------------------

function generateElement(node: SemanticNode): string {
  const tagStr = extractRoleValue(node, 'tag') || 'div';
  const propsRaw = extractRoleValue(node, 'props');
  const propsStr = propsRaw ? ' ' + parseProps(propsRaw) : '';
  const childStr = extractRoleValue(node, 'children');

  if (childStr) {
    return `<${tagStr}${propsStr}>${childStr}</${tagStr}>`;
  }
  return `<${tagStr}${propsStr} />`;
}

function generateComponent(node: SemanticNode, typescript: boolean): string {
  const nameStr = extractRoleValue(node, 'name') || 'Component';
  const propsStr = extractRoleValue(node, 'props');
  const bodyStr = extractRoleValue(node, 'children') || 'null';

  if (!propsStr) {
    if (typescript) {
      return `function ${nameStr}(): JSX.Element {\n  return ${bodyStr};\n}`;
    }
    return `function ${nameStr}() {\n  return ${bodyStr};\n}`;
  }

  const propNames = propsStr.split(/\s+/);
  const propsList = `{ ${propNames.join(', ')} }`;

  if (typescript) {
    const propsTypeName = `${nameStr}Props`;
    const typeFields = propNames.map(p => `  ${p}: ${inferPropType(p)};`).join('\n');
    return `interface ${propsTypeName} {\n${typeFields}\n}\n\nfunction ${nameStr}(${propsList}: ${propsTypeName}): JSX.Element {\n  return ${bodyStr};\n}`;
  }

  return `function ${nameStr}(${propsList}) {\n  return ${bodyStr};\n}`;
}

function generateRender(node: SemanticNode): string {
  const componentStr = extractRoleValue(node, 'source') || 'App';
  const targetStr = extractRoleValue(node, 'destination') || 'root';

  return `createRoot(document.getElementById("${escapeForString(targetStr)}")).render(<${escapeForString(componentStr)} />)`;
}

function formatInitialValue(sv: SemanticValue | undefined, strValue: string): string {
  // Re-quote string literals that had quotes stripped by the tokenizer
  if (sv && sv.type === 'literal' && 'dataType' in sv && sv.dataType === 'string') {
    if (!/^["']/.test(strValue)) {
      return `"${escapeForString(strValue)}"`;
    }
  }
  return strValue;
}

function generateState(node: SemanticNode, typescript: boolean): string {
  const nameStr = extractRoleValue(node, 'name') || 'value';
  const initialSV = node.roles.get('initial');
  const rawStr = initialSV ? extractRoleValue(node, 'initial') : 'null';
  const initialStr = formatInitialValue(initialSV, rawStr);

  if (typescript) {
    const tsType = inferTypeFromValue(initialSV, initialStr);
    return `const [${nameStr}, ${toSetterName(nameStr)}] = useState<${tsType}>(${initialStr})`;
  }

  return `const [${nameStr}, ${toSetterName(nameStr)}] = useState(${initialStr})`;
}

function generateEffect(node: SemanticNode, typescript: boolean): string {
  const callbackStr = extractRoleValue(node, 'callback') || '() => {}';
  const depsStr = extractRoleValue(node, 'deps');

  // Build deps array
  const depsArray = depsStr ? `[${depsStr.split(/\s+/).join(', ')}]` : '[]';

  if (typescript) {
    return `useEffect((): void => { ${callbackStr}(); }, ${depsArray})`;
  }

  return `useEffect(() => { ${callbackStr}(); }, ${depsArray})`;
}

function generateFragment(node: SemanticNode): string {
  const childStr = extractRoleValue(node, 'children');

  if (!childStr) {
    return '<></>';
  }

  // Convert space-separated names to JSX component tags
  const components = childStr
    .split(/\s+/)
    .map(name => `<${toPascalCase(name)} />`)
    .join('');

  return `<>${components}</>`;
}

// ---------------------------------------------------------------------------
// Public generators
// ---------------------------------------------------------------------------

/**
 * JSX code generator implementation (JavaScript mode).
 */
export const jsxCodeGenerator: CodeGenerator = {
  generate(node: SemanticNode): string {
    switch (node.action) {
      case 'element':
        return generateElement(node);
      case 'component':
        return generateComponent(node, false);
      case 'render':
        return generateRender(node);
      case 'state':
        return generateState(node, false);
      case 'effect':
        return generateEffect(node, false);
      case 'fragment':
        return generateFragment(node);
      default:
        throw new Error(`Unknown JSX command: ${node.action}`);
    }
  },
};

/**
 * Create a JSX code generator with optional TypeScript output.
 */
export function createJSXCodeGenerator(options?: { typescript?: boolean }): CodeGenerator {
  const ts = options?.typescript ?? false;

  if (!ts) return jsxCodeGenerator;

  return {
    generate(node: SemanticNode): string {
      switch (node.action) {
        case 'element':
          return generateElement(node);
        case 'component':
          return generateComponent(node, true);
        case 'render':
          return generateRender(node);
        case 'state':
          return generateState(node, true);
        case 'effect':
          return generateEffect(node, true);
        case 'fragment':
          return generateFragment(node);
        default:
          throw new Error(`Unknown JSX command: ${node.action}`);
      }
    },
  };
}
