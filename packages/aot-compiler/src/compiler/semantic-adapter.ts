/**
 * Semantic Parser Adapter
 *
 * Bridges @lokascript/semantic's parse output into AOT ASTNode types.
 * Enables the AOT compiler to compile hyperscript from any of the 24
 * supported languages.
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
// SEMANTIC TYPES (imported dynamically)
// =============================================================================

// These mirror the types from @lokascript/semantic but are declared locally
// so the adapter can be compiled without the optional peer dependency.

interface SemanticAnalysisResult {
  confidence: number;
  node?: SemanticNodeLike;
  errors?: string[];
}

interface SemanticAnalyzerLike {
  analyze(input: string, language: string): SemanticAnalysisResult;
  supportsLanguage(language: string): boolean;
}

interface SemanticNodeLike {
  kind: string;
  action: string;
  roles: ReadonlyMap<string, SemanticValueLike>;
  metadata?: { confidence?: number };
  // Event handler fields
  body?: SemanticNodeLike[];
  eventModifiers?: {
    once?: boolean;
    debounce?: number;
    throttle?: number;
    from?: SemanticValueLike;
  };
  parameterNames?: readonly string[];
  // Conditional fields
  thenBranch?: SemanticNodeLike[];
  elseBranch?: SemanticNodeLike[];
  // Compound fields
  statements?: SemanticNodeLike[];
  // Loop fields
  loopVariant?: string;
  loopVariable?: string;
  indexVariable?: string;
}

interface SemanticValueLike {
  type: string;
  value?: string | number | boolean;
  raw?: string;
  object?: SemanticValueLike;
  property?: string;
  selectorKind?: string;
  dataType?: string;
}

interface ASTBuilderLike {
  build(node: SemanticNodeLike): SemanticASTNodeLike;
  warnings: string[];
}

interface SemanticASTNodeLike {
  type: string;
  [key: string]: unknown;
}

type ParseWithConfidenceFn = (
  code: string,
  language: string
) => { node: SemanticNodeLike | null; confidence: number; error: string | undefined };

// =============================================================================
// SEMANTIC PARSER ADAPTER
// =============================================================================

/**
 * Adapts @lokascript/semantic into the SemanticParser interface expected by
 * AOTCompiler.
 *
 * Uses `parseWithConfidence()` for analysis — this is the full semantic parser
 * (not just the pattern matcher), so it correctly handles event handlers with
 * body commands, compound statements, etc.
 */
export class SemanticParserAdapter {
  private analyzer: SemanticAnalyzerLike;
  private ASTBuilderClass: new () => ASTBuilderLike;
  private parseWithConfidenceFn: ParseWithConfidenceFn;

  constructor(
    analyzer: SemanticAnalyzerLike,
    ASTBuilderClass: new () => ASTBuilderLike,
    parseWithConfidenceFn: ParseWithConfidenceFn
  ) {
    this.analyzer = analyzer;
    this.ASTBuilderClass = ASTBuilderClass;
    this.parseWithConfidenceFn = parseWithConfidenceFn;
  }

  /**
   * Analyze code in the given language.
   * Uses the full semantic parser (parseWithConfidence) which correctly
   * returns event-handler nodes with body commands.
   */
  analyze(
    code: string,
    language: string
  ): { node?: unknown; confidence: number; errors?: string[] } {
    try {
      const result = this.parseWithConfidenceFn(code, language);
      return {
        node: result.node ?? undefined,
        confidence: result.confidence,
        errors: result.error ? [result.error] : undefined,
      };
    } catch (error) {
      return {
        confidence: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Build an AOT-compatible AST from the SemanticNode.
   * Converts the semantic package's AST format to AOT types.
   */
  buildAST(node: unknown): { ast: ASTNode; warnings: string[] } {
    const semanticNode = node as SemanticNodeLike;

    const builder = new this.ASTBuilderClass();
    const semanticAST = builder.build(semanticNode);
    const aotAST = convertSemanticASTToAOT(semanticAST);

    return { ast: aotAST, warnings: builder.warnings };
  }

  /**
   * Check if the given language is supported.
   */
  supportsLanguage(language: string): boolean {
    return this.analyzer.supportsLanguage(language);
  }
}

// =============================================================================
// AST CONVERSION: Semantic AST → AOT AST
// =============================================================================

/**
 * Convert a semantic package AST node to an AOT AST node.
 * The semantic package produces nodes with types like 'eventHandler', 'command',
 * 'contextReference', 'propertyAccess', etc. AOT expects 'event', 'command',
 * 'identifier', 'possessive'/'member', etc.
 */
function convertSemanticASTToAOT(node: SemanticASTNodeLike): ASTNode {
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
    case 'if':
      return convertIfNode(node);

    // Expression types
    case 'literal':
      return { type: 'literal', value: node.value as string | number | boolean | null };
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
      return convertPropertyAccess(node);
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
        right: convertSemanticASTToAOT(node.operand as SemanticASTNodeLike),
      };
    case 'string':
      return { type: 'literal', value: node.value as string };
    case 'timeExpression':
      return { type: 'literal', value: node.value as number };
    case 'templateLiteral':
      return { type: 'literal', value: (node.raw ?? '') as string };

    default:
      // Attempt generic conversion for unknown types
      return convertGeneric(node);
  }
}

function convertEventHandler(node: SemanticASTNodeLike): EventHandlerNode {
  const event = (node.event ?? 'click') as string;
  const commands = (node.commands ?? []) as SemanticASTNodeLike[];
  const body = commands.map(cmd => convertSemanticASTToAOT(cmd));

  const modifiers: EventModifiers = {};
  // Copy modifiers if present
  if (node.selector) {
    modifiers.from = node.selector as string;
  }

  return {
    type: 'event',
    event,
    modifiers,
    body,
  };
}

function convertCommand(node: SemanticASTNodeLike): ASTNode {
  const name = node.name as string;

  // Special handling for 'if' command from semantic builder
  if (name === 'if') {
    return convertIfCommand(node);
  }

  // Special handling for 'repeat' command from semantic builder
  if (name === 'repeat') {
    return convertRepeatCommand(node);
  }

  const args = ((node.args ?? []) as SemanticASTNodeLike[]).map(arg =>
    convertSemanticASTToAOT(arg)
  );

  const target = node.target
    ? convertSemanticASTToAOT(node.target as SemanticASTNodeLike)
    : undefined;

  const modifiers = node.modifiers
    ? convertModifiers(node.modifiers as Record<string, SemanticASTNodeLike>)
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

function convertIfCommand(node: SemanticASTNodeLike): IfNode {
  const args = (node.args ?? []) as SemanticASTNodeLike[];

  // args[0] = condition, args[1] = then block, args[2] = else block (optional)
  const condition = args[0] ? convertSemanticASTToAOT(args[0]) : { type: 'literal', value: true };
  const thenBlock = args[1] as SemanticASTNodeLike | undefined;
  const elseBlock = args[2] as SemanticASTNodeLike | undefined;

  const thenBranch = extractBlockCommands(thenBlock);
  const elseBranch = elseBlock ? extractBlockCommands(elseBlock) : undefined;

  return {
    type: 'if',
    condition,
    thenBranch,
    elseBranch,
  };
}

function convertRepeatCommand(node: SemanticASTNodeLike): ASTNode {
  const args = (node.args ?? []) as SemanticASTNodeLike[];

  // args[0] = loop type identifier, args[1+] vary, args[last] = body block
  if (args.length === 0) {
    return { type: 'repeat', body: [] } as RepeatNode;
  }

  const loopTypeNode = args[0];
  const loopType = (loopTypeNode?.name ?? loopTypeNode?.value ?? 'forever') as string;
  const bodyBlock = args[args.length - 1];

  switch (loopType) {
    case 'times': {
      const count = args[1] ? convertSemanticASTToAOT(args[1]) : undefined;
      return {
        type: 'repeat',
        count,
        body: extractBlockCommands(bodyBlock),
      } as RepeatNode;
    }
    case 'for': {
      const itemName = (args[1]?.value ?? 'item') as string;
      const collection = args[2]
        ? convertSemanticASTToAOT(args[2])
        : { type: 'identifier', value: '[]' };
      return {
        type: 'foreach',
        itemName,
        collection,
        body: extractBlockCommands(bodyBlock),
      } as ForEachNode;
    }
    case 'while': {
      const condition = args[1]
        ? convertSemanticASTToAOT(args[1])
        : { type: 'literal', value: true };
      return {
        type: 'while',
        condition,
        body: extractBlockCommands(bodyBlock),
      } as WhileNode;
    }
    case 'until': {
      // "until" is "while NOT condition"
      const condition = args[1]
        ? convertSemanticASTToAOT(args[1])
        : { type: 'literal', value: false };
      return {
        type: 'while',
        condition: {
          type: 'binary',
          operator: 'not',
          left: condition,
          right: { type: 'literal', value: null },
        },
        body: extractBlockCommands(bodyBlock),
      } as WhileNode;
    }
    default: {
      // 'forever' or unknown → repeat forever
      return {
        type: 'repeat',
        body: extractBlockCommands(bodyBlock),
      } as RepeatNode;
    }
  }
}

function convertCommandSequence(node: SemanticASTNodeLike): ASTNode {
  const commands = (node.commands ?? []) as SemanticASTNodeLike[];
  if (commands.length === 1) {
    return convertSemanticASTToAOT(commands[0]);
  }

  // Wrap as event handler with default click event if standalone
  return {
    type: 'event',
    event: 'click',
    body: commands.map(cmd => convertSemanticASTToAOT(cmd)),
  } as EventHandlerNode;
}

function convertBlock(node: SemanticASTNodeLike): ASTNode {
  const commands = (node.commands ?? []) as SemanticASTNodeLike[];
  if (commands.length === 1) {
    return convertSemanticASTToAOT(commands[0]);
  }
  // Return as a sequence
  return {
    type: 'event',
    event: 'click',
    body: commands.map(cmd => convertSemanticASTToAOT(cmd)),
  } as EventHandlerNode;
}

function convertIfNode(node: SemanticASTNodeLike): IfNode {
  const condition = node.condition
    ? convertSemanticASTToAOT(node.condition as SemanticASTNodeLike)
    : { type: 'literal', value: true };

  const thenBranch = ((node.thenBranch ?? []) as SemanticASTNodeLike[]).map(n =>
    convertSemanticASTToAOT(n)
  );
  const elseBranch = node.elseBranch
    ? (node.elseBranch as SemanticASTNodeLike[]).map(n => convertSemanticASTToAOT(n))
    : undefined;

  return {
    type: 'if',
    condition,
    thenBranch,
    elseBranch,
  };
}

function convertPropertyAccess(node: SemanticASTNodeLike): ASTNode {
  const object = node.object
    ? convertSemanticASTToAOT(node.object as SemanticASTNodeLike)
    : { type: 'identifier', value: 'me' };
  const property = (node.property ?? '') as string;

  return {
    type: 'possessive',
    object,
    property,
  };
}

function convertPossessive(node: SemanticASTNodeLike): ASTNode {
  const object = node.object
    ? convertSemanticASTToAOT(node.object as SemanticASTNodeLike)
    : { type: 'identifier', value: 'me' };
  const property =
    typeof node.property === 'string'
      ? node.property
      : ((node.property as SemanticASTNodeLike)?.name ??
        (node.property as SemanticASTNodeLike)?.value ??
        '');

  return {
    type: 'possessive',
    object,
    property: property as string,
  };
}

function convertMember(node: SemanticASTNodeLike): ASTNode {
  const object = node.object
    ? convertSemanticASTToAOT(node.object as SemanticASTNodeLike)
    : { type: 'identifier', value: 'me' };
  const property = node.property
    ? convertSemanticASTToAOT(node.property as SemanticASTNodeLike)
    : { type: 'literal', value: '' };

  return {
    type: 'member',
    object,
    property,
    computed: (node.computed ?? false) as boolean,
  };
}

function convertBinary(node: SemanticASTNodeLike): ASTNode {
  return {
    type: 'binary',
    operator: (node.operator ?? '') as string,
    left: convertSemanticASTToAOT(node.left as SemanticASTNodeLike),
    right: convertSemanticASTToAOT(node.right as SemanticASTNodeLike),
  };
}

function convertCall(node: SemanticASTNodeLike): ASTNode {
  const callee =
    typeof node.callee === 'string'
      ? { type: 'identifier', value: node.callee, name: node.callee }
      : convertSemanticASTToAOT(node.callee as SemanticASTNodeLike);
  const args = ((node.arguments ?? node.args ?? []) as SemanticASTNodeLike[]).map(a =>
    convertSemanticASTToAOT(a)
  );

  return {
    type: 'call',
    callee,
    args,
  };
}

function convertModifiers(modifiers: Record<string, SemanticASTNodeLike>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(modifiers)) {
    result[key] = convertSemanticASTToAOT(value);
  }
  return result;
}

function convertGeneric(node: SemanticASTNodeLike): ASTNode {
  // For unknown node types, try to preserve the structure
  return {
    type: node.type || 'literal',
    value: node.value ?? null,
  };
}

/**
 * Extract commands from a block or single node.
 */
function extractBlockCommands(block: SemanticASTNodeLike | undefined): ASTNode[] {
  if (!block) return [];

  if (block.type === 'block') {
    return ((block.commands ?? []) as SemanticASTNodeLike[]).map(cmd =>
      convertSemanticASTToAOT(cmd)
    );
  }

  // Single node — wrap in array
  return [convertSemanticASTToAOT(block)];
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a SemanticParserAdapter by dynamically importing @lokascript/semantic.
 * Returns null if the package is not available.
 */
export async function createSemanticAdapter(): Promise<SemanticParserAdapter> {
  const semantic = await import('@lokascript/semantic');
  const analyzer = semantic.createSemanticAnalyzer();
  const ASTBuilderClass = semantic.ASTBuilder;
  const parseWithConfidence = semantic.parseWithConfidence;

  return new SemanticParserAdapter(
    analyzer as unknown as SemanticAnalyzerLike,
    ASTBuilderClass as unknown as new () => ASTBuilderLike,
    parseWithConfidence as unknown as ParseWithConfidenceFn
  );
}
