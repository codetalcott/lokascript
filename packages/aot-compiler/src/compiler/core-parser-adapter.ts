/**
 * Core Parser Adapter
 *
 * Bridges @lokascript/core's parser output into AOT ASTNode types.
 * The core parser produces AST nodes with types like 'eventHandler', 'command',
 * 'contextReference', 'propertyAccess', etc. that need to be mapped to AOT types.
 */

import type {
  ASTNode,
  EventHandlerNode,
  CommandNode,
  IfNode,
  RepeatNode,
  ForEachNode,
  WhileNode,
  EventModifiers,
} from '../types/aot-types.js';

// =============================================================================
// CORE TYPES (imported dynamically)
// =============================================================================

// Locally-declared types to avoid requiring the peer dependency at compile time.

interface CoreCompileResult {
  ok: boolean;
  ast?: CoreASTNode;
  errors?: Array<{ message: string }>;
}

interface CoreASTNode {
  type: string;
  [key: string]: unknown;
}

interface CoreHyperscriptAPI {
  compileSync(
    code: string,
    options?: { language?: string; traditional?: boolean }
  ): CoreCompileResult;
}

// =============================================================================
// CORE PARSER ADAPTER
// =============================================================================

/**
 * Adapts @lokascript/core's compileSync() output into the Parser interface
 * expected by AOTCompiler.
 */
export class CoreParserAdapter {
  private api: CoreHyperscriptAPI;

  constructor(api: CoreHyperscriptAPI) {
    this.api = api;
  }

  /**
   * Parse hyperscript code to an AOT-compatible AST.
   */
  parse(code: string, language?: string): ASTNode {
    const result = this.api.compileSync(code, {
      language: language ?? 'en',
      traditional: true,
    });

    if (!result.ok || !result.ast) {
      throw new Error(result.errors?.[0]?.message ?? `Core parser failed for: ${code}`);
    }

    return convertCoreASTToAOT(result.ast);
  }
}

// =============================================================================
// AST CONVERSION: Core AST → AOT AST
// =============================================================================

/**
 * Convert a core parser AST node to an AOT AST node.
 * Core types:
 *   - 'eventHandler' → AOT 'event'
 *   - 'command' → AOT 'command' (with if/repeat special handling)
 *   - 'contextReference' → AOT 'identifier'
 *   - 'propertyAccess' / 'possessiveExpression' → AOT 'possessive'
 *   - 'memberExpression' → AOT 'member'
 *   - 'binaryExpression' → AOT 'binary'
 *   - 'callExpression' → AOT 'call'
 *   - 'CommandSequence' → flattened or wrapped
 */
export function convertCoreASTToAOT(node: CoreASTNode): ASTNode {
  if (!node) return { type: 'literal', value: null };

  switch (node.type) {
    case 'eventHandler':
      return convertEventHandler(node);
    case 'command':
      return convertCommand(node);
    case 'CommandSequence':
      return convertCommandSequence(node);
    case 'block':
      return convertBlock(node);

    // Expression types
    case 'literal':
      return { type: 'literal', value: node.value as string | number | boolean | null };
    case 'string':
      return { type: 'literal', value: node.value as string };
    case 'selector':
      return { type: 'selector', value: (node.value ?? node.selector ?? '') as string };
    case 'contextReference':
      return { type: 'identifier', value: (node.name ?? node.contextType ?? '') as string };
    case 'identifier':
      return {
        type: 'identifier',
        value: (node.name ?? node.value ?? '') as string,
        name: (node.name ?? '') as string,
      };
    case 'propertyAccess':
    case 'possessiveExpression':
      return convertPossessive(node);
    case 'memberExpression':
      return convertMember(node);
    case 'binaryExpression':
      return convertBinary(node);
    case 'callExpression':
      return convertCall(node);
    case 'unaryExpression':
      return {
        type: 'binary',
        operator: node.operator as string,
        left: { type: 'literal', value: 0 },
        right: convertCoreASTToAOT(node.operand as CoreASTNode),
      };
    case 'timeExpression':
      return { type: 'literal', value: node.value as number };
    case 'templateLiteral':
      return { type: 'literal', value: (node.raw ?? '') as string };
    case 'variable':
      return {
        type: 'variable',
        name: (node.name ?? '') as string,
        scope: (node.scope ?? 'local') as 'local' | 'global' | 'element',
      };
    case 'htmlSelector':
      return { type: 'selector', value: (node.value ?? node.selector ?? '') as string };

    default:
      return convertGeneric(node);
  }
}

function convertEventHandler(node: CoreASTNode): EventHandlerNode {
  const event = (node.event ?? 'click') as string;
  const commands = (node.commands ?? node.body ?? []) as CoreASTNode[];
  const body = commands.map(cmd => convertCoreASTToAOT(cmd));

  const modifiers: EventModifiers = {};

  // Extract core event modifiers
  if (node.once) modifiers.once = true;
  if (node.debounce) modifiers.debounce = node.debounce as number;
  if (node.throttle) modifiers.throttle = node.throttle as number;
  if (node.prevent) modifiers.prevent = true;
  if (node.stop) modifiers.stop = true;
  if (node.capture) modifiers.capture = true;
  if (node.passive) modifiers.passive = true;
  if (node.from) modifiers.from = node.from as string;
  if (node.selector) modifiers.from = node.selector as string;

  return {
    type: 'event',
    event,
    modifiers,
    body,
  };
}

function convertCommand(node: CoreASTNode): ASTNode {
  const name = node.name as string;

  // Special handling for 'if' command
  if (name === 'if' || name === 'unless') {
    return convertIfCommand(node);
  }

  // Special handling for 'repeat' command
  if (name === 'repeat') {
    return convertRepeatCommand(node);
  }

  const args = ((node.args ?? []) as CoreASTNode[]).map(arg => convertCoreASTToAOT(arg));

  const target = node.target ? convertCoreASTToAOT(node.target as CoreASTNode) : undefined;

  const modifiers = node.modifiers
    ? convertModifiers(node.modifiers as Record<string, CoreASTNode>)
    : undefined;

  const result: CommandNode = {
    type: 'command',
    name,
    args,
  };

  if (target) {
    (result as Record<string, unknown>).target = target;
  }
  if (modifiers && Object.keys(modifiers).length > 0) {
    (result as Record<string, unknown>).modifiers = modifiers;
  }

  return result;
}

function convertIfCommand(node: CoreASTNode): IfNode {
  const args = (node.args ?? []) as CoreASTNode[];

  // The core parser's if command may have:
  // - args[0] = condition
  // - args[1] = then block
  // - args[2] = else block
  // OR it may have condition/thenBranch/elseBranch directly
  let condition: ASTNode;
  let thenBranch: ASTNode[];
  let elseBranch: ASTNode[] | undefined;

  if (node.condition) {
    condition = convertCoreASTToAOT(node.condition as CoreASTNode);
    thenBranch = ((node.thenBranch ?? node.then ?? []) as CoreASTNode[]).map(n =>
      convertCoreASTToAOT(n)
    );
    elseBranch = node.elseBranch
      ? (node.elseBranch as CoreASTNode[]).map(n => convertCoreASTToAOT(n))
      : node.else
        ? (node.else as CoreASTNode[]).map(n => convertCoreASTToAOT(n))
        : undefined;
  } else {
    condition = args[0] ? convertCoreASTToAOT(args[0]) : { type: 'literal', value: true };
    const thenBlock = args[1];
    const elseBlock = args[2];
    thenBranch = extractBlockCommands(thenBlock);
    elseBranch = elseBlock ? extractBlockCommands(elseBlock) : undefined;
  }

  // Handle 'unless' as negated 'if'
  if ((node.name as string) === 'unless') {
    condition = {
      type: 'binary',
      operator: 'not',
      left: condition,
      right: { type: 'literal', value: null },
    };
  }

  return {
    type: 'if',
    condition,
    thenBranch,
    elseBranch,
  };
}

function convertRepeatCommand(node: CoreASTNode): ASTNode {
  const args = (node.args ?? []) as CoreASTNode[];

  if (args.length === 0) {
    return { type: 'repeat', body: [] } as RepeatNode;
  }

  const loopTypeNode = args[0];
  const loopType = (loopTypeNode?.name ?? loopTypeNode?.value ?? 'forever') as string;
  const bodyBlock = args[args.length - 1];

  switch (loopType) {
    case 'times': {
      const count = args[1] ? convertCoreASTToAOT(args[1]) : undefined;
      return {
        type: 'repeat',
        count,
        body: extractBlockCommands(bodyBlock),
      } as RepeatNode;
    }
    case 'for': {
      const itemName = (args[1]?.value ?? 'item') as string;
      const collection = args[2]
        ? convertCoreASTToAOT(args[2])
        : { type: 'identifier', value: '[]' };
      return {
        type: 'foreach',
        itemName,
        collection,
        body: extractBlockCommands(bodyBlock),
      } as ForEachNode;
    }
    case 'while': {
      const condition = args[1] ? convertCoreASTToAOT(args[1]) : { type: 'literal', value: true };
      return {
        type: 'while',
        condition,
        body: extractBlockCommands(bodyBlock),
      } as WhileNode;
    }
    default: {
      return {
        type: 'repeat',
        body: extractBlockCommands(bodyBlock),
      } as RepeatNode;
    }
  }
}

function convertCommandSequence(node: CoreASTNode): ASTNode {
  const commands = (node.commands ?? []) as CoreASTNode[];
  if (commands.length === 1) {
    return convertCoreASTToAOT(commands[0]);
  }
  // Wrap as event handler body
  return {
    type: 'event',
    event: 'click',
    body: commands.map(cmd => convertCoreASTToAOT(cmd)),
  } as EventHandlerNode;
}

function convertBlock(node: CoreASTNode): ASTNode {
  const commands = (node.commands ?? []) as CoreASTNode[];
  if (commands.length === 1) {
    return convertCoreASTToAOT(commands[0]);
  }
  return {
    type: 'event',
    event: 'click',
    body: commands.map(cmd => convertCoreASTToAOT(cmd)),
  } as EventHandlerNode;
}

function convertPossessive(node: CoreASTNode): ASTNode {
  const object = node.object
    ? convertCoreASTToAOT(node.object as CoreASTNode)
    : { type: 'identifier', value: 'me' };
  const property =
    typeof node.property === 'string'
      ? node.property
      : ((node.property as CoreASTNode)?.name ?? (node.property as CoreASTNode)?.value ?? '');

  return {
    type: 'possessive',
    object,
    property: property as string,
  };
}

function convertMember(node: CoreASTNode): ASTNode {
  const object = node.object
    ? convertCoreASTToAOT(node.object as CoreASTNode)
    : { type: 'identifier', value: 'me' };
  const property = node.property
    ? convertCoreASTToAOT(node.property as CoreASTNode)
    : { type: 'literal', value: '' };

  return {
    type: 'member',
    object,
    property,
    computed: (node.computed ?? false) as boolean,
  };
}

function convertBinary(node: CoreASTNode): ASTNode {
  return {
    type: 'binary',
    operator: (node.operator ?? '') as string,
    left: convertCoreASTToAOT(node.left as CoreASTNode),
    right: convertCoreASTToAOT(node.right as CoreASTNode),
  };
}

function convertCall(node: CoreASTNode): ASTNode {
  const callee =
    typeof node.callee === 'string'
      ? { type: 'identifier', value: node.callee, name: node.callee }
      : convertCoreASTToAOT(node.callee as CoreASTNode);
  const args = ((node.arguments ?? node.args ?? []) as CoreASTNode[]).map(a =>
    convertCoreASTToAOT(a)
  );

  return {
    type: 'call',
    callee,
    args,
  };
}

function convertModifiers(modifiers: Record<string, CoreASTNode>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(modifiers)) {
    result[key] = convertCoreASTToAOT(value);
  }
  return result;
}

function convertGeneric(node: CoreASTNode): ASTNode {
  return {
    type: node.type || 'literal',
    value: node.value ?? null,
  };
}

function extractBlockCommands(block: CoreASTNode | undefined): ASTNode[] {
  if (!block) return [];

  if (block.type === 'block') {
    return ((block.commands ?? []) as CoreASTNode[]).map(cmd => convertCoreASTToAOT(cmd));
  }

  return [convertCoreASTToAOT(block)];
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a CoreParserAdapter by dynamically importing @lokascript/core.
 * Throws if the package is not available.
 */
export async function createCoreParserAdapter(): Promise<CoreParserAdapter> {
  const core = await import('@lokascript/core');
  // The core package exports `hyperscript` with compileSync
  const api = core.hyperscript ?? core.default ?? core;

  if (!api?.compileSync) {
    throw new Error(
      '@lokascript/core does not export compileSync. ' +
        'Ensure @lokascript/core >= 1.0.0 is installed.'
    );
  }

  return new CoreParserAdapter(api as unknown as CoreHyperscriptAPI);
}
