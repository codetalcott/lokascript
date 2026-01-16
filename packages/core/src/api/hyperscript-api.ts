/**
 * Main Hyperscript API
 * Provides a clean, type-safe public interface for hyperscript compilation and execution
 */

import { parse as parseToResult } from '../parser/parser';
import { tokenize } from '../parser/tokenizer';
import { Runtime, type RuntimeOptions } from '../runtime/runtime';
import { createContext, createChildContext } from '../core/context';
import type { ASTNode, ExecutionContext, ParseError } from '../types/base-types';
import type { RuntimeHooks } from '../types/hooks';
import type { SemanticAnalyzerInterface } from '../parser/types';
import type { Token } from '../types/core';
import { debug } from '../utils/debug';
import {
  createSemanticAnalyzer,
  DEFAULT_CONFIDENCE_THRESHOLD,
  type SemanticAnalyzer,
} from '@hyperfixi/semantic';
import { registerHistorySwap, registerBoosted } from '../behaviors';

// =============================================================================
// Type Augmentations
// =============================================================================

/**
 * Augment globalThis with hyperscript runtime
 */
declare global {
  interface Window {
    _hyperscript?: {
      runtime?: Runtime;
      behaviors?: Runtime['behaviorAPI'];
    };
  }
}

/**
 * Custom error class for parse errors with line/column information
 */
class HyperscriptParseError extends Error {
  line?: number;
  column?: number;

  constructor(message: string, line?: number, column?: number) {
    super(message);
    this.name = 'HyperscriptParseError';
    this.line = line;
    this.column = column;
  }
}

// Singleton semantic analyzer instance (lazy-initialized)
let semanticAnalyzerInstance: SemanticAnalyzer | null = null;

// Singleton bridge instance for direct AST path (lazy-initialized)
let bridgeInstance: import('../multilingual/bridge').SemanticGrammarBridge | null = null;

// =============================================================================
// Global Configuration
// =============================================================================

/**
 * Global configuration for hyperscript parsing and execution.
 */
export interface HyperscriptConfig {
  /**
   * Enable/disable semantic parsing globally.
   * When false, uses traditional keyword-based parsing only.
   * Default: true (semantic parsing enabled)
   */
  semantic: boolean;

  /**
   * Default language for semantic parsing.
   * Default: 'en'
   */
  language: string;

  /**
   * Confidence threshold for semantic parsing (0-1).
   * Lower values accept more flexible syntax.
   * Default: 0.5
   */
  confidenceThreshold: number;
}

/**
 * Global configuration instance.
 * Modify this to change default parsing behavior.
 *
 * @example
 * ```javascript
 * // Disable semantic parsing globally (use traditional parser only)
 * hyperfixi.config.semantic = false;
 *
 * // Set default language
 * hyperfixi.config.language = 'ja';
 * ```
 */
export const config: HyperscriptConfig = {
  semantic: true,
  language: 'en',
  confidenceThreshold: DEFAULT_CONFIDENCE_THRESHOLD,
};

/**
 * Get or create the singleton bridge instance for direct AST path.
 * Lazy initialization to avoid overhead if not used.
 */
async function getOrCreateBridge(): Promise<
  import('../multilingual/bridge').SemanticGrammarBridge
> {
  if (!bridgeInstance) {
    const { SemanticGrammarBridge } = await import('../multilingual/bridge');
    bridgeInstance = new SemanticGrammarBridge();
    await bridgeInstance.initialize();
  }
  return bridgeInstance;
}

/**
 * Get or create the singleton semantic analyzer instance.
 * Lazy initialization to avoid overhead if not used.
 */
function getSemanticAnalyzer(): SemanticAnalyzerInterface {
  if (!semanticAnalyzerInstance) {
    semanticAnalyzerInstance = createSemanticAnalyzer();
  }
  return semanticAnalyzerInstance as unknown as SemanticAnalyzerInterface;
}

/**
 * Default parser options based on global config.
 * Returns semantic analyzer only if config.semantic is true.
 */
function getDefaultParserOptions() {
  if (!config.semantic) {
    // Traditional parsing only - no semantic analyzer
    return {};
  }

  return {
    semanticAnalyzer: getSemanticAnalyzer(),
    language: config.language as 'en',
    semanticConfidenceThreshold: config.confidenceThreshold,
  };
}

// ============================================================================
// API Types
// ============================================================================

/**
 * @deprecated Use CompileResult instead
 */
export interface CompilationResult {
  success: boolean;
  ast?: ASTNode;
  errors: ParseError[];
  tokens: import('../types/core').Token[];
  compilationTime: number;

  // Debug metadata (always included, minimal overhead <1%)
  metadata?: {
    parserUsed: 'semantic' | 'traditional' | 'expression-only';
    semanticConfidence?: number; // 0-1, only if semantic attempted
    semanticLanguage?: string; // e.g., 'en', 'ja'
    warnings?: string[]; // Non-fatal issues detected during compilation
  };
}

/**
 * @deprecated Use NewCompileOptions instead
 */
export interface CompileOptions {
  /** Disable semantic parsing (use traditional parser only). Useful for complex behaviors. */
  disableSemanticParsing?: boolean;
  /** Language code for multilingual input (e.g., 'en', 'ja', 'ar'). Defaults to 'en'. */
  language?: string;
}

/**
 * Extended compilation result with direct AST path metadata
 * @deprecated Use CompileResult instead
 */
export interface MultilingualCompilationResult extends CompilationResult {
  /** Whether the direct AST path was used (bypassing English text generation) */
  usedDirectPath?: boolean;
  /** Confidence score from semantic parsing (0-1) */
  confidence?: number;
  /** Language used for parsing */
  language?: string;
}

// ============================================================================
// New API Types (v2)
// ============================================================================

/**
 * Compilation error with location and optional suggestion
 */
export interface CompileError {
  message: string;
  line: number;
  column: number;
  /** Suggestion for fixing the error */
  suggestion?: string;
}

/**
 * Options for compile() and compileSync()
 */
export interface NewCompileOptions {
  /** Language code (default: 'en'). Auto-detected from element if using process() */
  language?: string;

  /** Confidence threshold for semantic parsing (0-1, default: 0.5) */
  confidenceThreshold?: number;

  /** Force traditional parser (skip semantic analysis) */
  traditional?: boolean;
}

/**
 * Result of compilation - new cleaner API
 */
export interface CompileResult {
  /** Whether compilation succeeded */
  ok: boolean;

  /** Compiled AST (present if ok=true) */
  ast?: ASTNode;

  /** Compilation errors (present if ok=false) */
  errors?: CompileError[];

  /** Metadata about the compilation */
  meta: {
    /** Which parser was used */
    parser: 'semantic' | 'traditional';
    /** Confidence score if semantic parser was used */
    confidence?: number;
    /** Language detected/used */
    language: string;
    /** Compilation time in ms */
    timeMs: number;
    /** Whether the direct AST path was used (multilingual) */
    directPath?: boolean;
  };
}

/**
 * Result of validate()
 */
export interface ValidateResult {
  valid: boolean;
  errors?: CompileError[];
}

export interface HyperscriptAPI {
  // ─────────────────────────────────────────────────────────────
  // NEW API (v2)
  // ─────────────────────────────────────────────────────────────

  /**
   * Compile hyperscript code to AST (async, handles all languages).
   * This is the recommended compilation method.
   */
  compile(code: string, options?: NewCompileOptions): Promise<CompileResult>;

  /**
   * Compile hyperscript code to AST (sync, English only).
   * Use compile() unless you specifically need synchronous behavior.
   */
  compileSync(code: string, options?: NewCompileOptions): CompileResult;

  /**
   * Execute a compiled AST.
   */
  execute(ast: ASTNode, context?: ExecutionContext): Promise<unknown>;

  /**
   * Compile and execute in one step.
   * Convenience method equivalent to: compile() then execute()
   */
  eval(code: string, context?: ExecutionContext, options?: NewCompileOptions): Promise<unknown>;

  /**
   * Validate hyperscript syntax without executing.
   */
  validate(code: string, options?: NewCompileOptions): Promise<ValidateResult>;

  // ─────────────────────────────────────────────────────────────
  // DOM PROCESSING
  // ─────────────────────────────────────────────────────────────

  /**
   * Process element and descendants for hyperscript attributes.
   * Automatically detects language from element/document.
   */
  process(element: Element): void;

  // ─────────────────────────────────────────────────────────────
  // CONTEXT
  // ─────────────────────────────────────────────────────────────

  /**
   * Create an execution context.
   * @param element - Element to bind as 'me'
   * @param parent - Optional parent context for scope inheritance
   */
  createContext(element?: HTMLElement | null, parent?: ExecutionContext): ExecutionContext;

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  /** Version string */
  version: string;

  /** Global configuration */
  config: HyperscriptConfig;

  // ─────────────────────────────────────────────────────────────
  // ADVANCED
  // ─────────────────────────────────────────────────────────────

  /** Create a custom runtime instance */
  createRuntime(options?: RuntimeOptions): Runtime;

  /** Runtime Hooks */
  registerHooks(name: string, hooks: RuntimeHooks): void;
  unregisterHooks(name: string): boolean;
  getRegisteredHooks(): string[];

  // ─────────────────────────────────────────────────────────────
  // DEPRECATED (will be removed in next major version)
  // ─────────────────────────────────────────────────────────────

  /**
   * @deprecated Use compile() instead. compileMultilingual merges into unified compile().
   */
  compileMultilingual(
    code: string,
    options?: CompileOptions
  ): Promise<MultilingualCompilationResult>;

  /**
   * @deprecated Use eval() instead
   */
  run(code: string, context?: ExecutionContext): Promise<unknown>;

  /**
   * @deprecated Use eval() instead
   */
  evaluate(code: string, context?: ExecutionContext): Promise<unknown>;

  /**
   * @deprecated Use process() instead
   */
  processNode(element: Element): void;

  /**
   * @deprecated Use createContext(element, parent) instead
   */
  createChildContext(parent: ExecutionContext, element?: HTMLElement | null): ExecutionContext;

  /**
   * @deprecated Use validate() instead
   */
  isValidHyperscript(code: string): boolean;

  /**
   * @deprecated Use compile() or compileSync() instead
   */
  parse(code: string): ASTNode;
}

// ============================================================================
// Internal Runtime Instance (Lazy Initialization)
// ============================================================================

// Lazy initialization to avoid loading all 43 commands at import time
// Runtime is only created when first API call is made
let _defaultRuntime: Runtime | null = null;

/**
 * Get the default runtime instance, creating it lazily if needed
 * This defers command registration until actual usage
 */
function getDefaultRuntime(): Runtime {
  if (!_defaultRuntime) {
    // Browser runtime uses eager loading for maximum compatibility
    // Lazy loading causes race conditions since preloading is async but constructor is sync
    _defaultRuntime = new Runtime({
      lazyLoad: false, // Eager load all expressions synchronously
    });

    // Register built-in behaviors (HistorySwap, Boosted)
    registerHistorySwap(_defaultRuntime.behaviorRegistry);
    registerBoosted(_defaultRuntime.behaviorRegistry);

    // Expose default runtime globally for behavior registration/lookup
    // This allows behaviors defined in <script type="text/hyperscript"> to be found by install command
    if (typeof globalThis !== 'undefined') {
      const globalWithHyperscript = globalThis as typeof globalThis & {
        _hyperscript?: { runtime?: Runtime; behaviors?: Runtime['behaviorAPI'] };
      };
      globalWithHyperscript._hyperscript = globalWithHyperscript._hyperscript || {};
      globalWithHyperscript._hyperscript.runtime = _defaultRuntime;
      // Create a behaviors object with both Map-like has() and install() methods
      globalWithHyperscript._hyperscript.behaviors = _defaultRuntime!.behaviorAPI;
    }
  }
  return _defaultRuntime;
}

// ============================================================================
// API Implementation
// ============================================================================

/**
 * Wrap main parser AST output in program-style format for API compatibility
 * Transforms: { type: 'command', name: 'log', ... }
 * Into: { type: 'program', features: [{ type: 'feature', keyword: 'command', body: [...] }] }
 */
function wrapAsProgramNode(node: ASTNode, source: string): ASTNode {
  // Determine the feature keyword based on node type
  let keyword: string;
  let body: ASTNode[];

  if (node.type === 'eventHandler') {
    keyword = 'on';
    // Extract commands from event handler
    body = (node as { commands?: ASTNode[] }).commands || [node];
  } else if (node.type === 'command') {
    keyword = 'command';
    body = [node];
  } else if (node.type === 'def' || node.type === 'function') {
    keyword = 'def';
    body = [node];
  } else if (node.type === 'init') {
    keyword = 'init';
    body = [node];
  } else if (node.type === 'behavior') {
    keyword = 'behavior';
    body = [node];
  } else {
    // Default: wrap as command feature
    keyword = 'command';
    body = [node];
  }

  const feature: ASTNode = {
    type: 'feature',
    keyword,
    body,
    children: body,
    source: '',
    start: node.start || 0,
    end: node.end || 0,
    line: node.line || 1,
    column: node.column || 1,
  };

  return {
    type: 'program',
    features: [feature],
    source,
    children: [feature],
    start: 0,
    end: source.length,
    line: 1,
    column: 1,
  } as ASTNode;
}

/**
 * Parse hyperscript code and return AST directly
 * Compatible with official _hyperscript.parse() API
 * Throws an error if parsing fails
 *
 * Uses semantic-first parsing with confidence-based fallback by default.
 */
function parse(code: string): ASTNode {
  if (typeof code !== 'string') {
    throw new TypeError('Code must be a string');
  }

  // Use main parser with semantic analysis enabled and wrap result in program-style format
  const result = parseToResult(code, getDefaultParserOptions());

  if (result.success && result.node) {
    return wrapAsProgramNode(result.node, code);
  }

  // Throw error with details if parsing failed
  const errorMsg = result.error?.message || 'Unknown parse error';
  const error = new HyperscriptParseError(
    `Parse error: ${errorMsg}`,
    result.error?.line,
    result.error?.column
  );
  throw error;
}

/**
 * Compile hyperscript code into an Abstract Syntax Tree (AST)
 *
 * Uses semantic-first parsing with confidence-based fallback by default.
 * Pass { disableSemanticParsing: true } for complex behaviors that need traditional parsing.
 */
function compile(code: string, options?: CompileOptions): CompilationResult {
  debug.runtime('COMPILE: hyperscript-api compile() called', {
    code,
    codeLength: code.length,
    codeType: typeof code,
  });

  // Input validation
  if (typeof code !== 'string') {
    throw new TypeError('Code must be a string');
  }

  const startTime = performance.now();

  try {
    // Determine parser configuration
    const disableSemantic = options?.disableSemanticParsing ?? false;
    const parserOptions = disableSemantic ? {} : getDefaultParserOptions();
    const usesSemanticParser = !disableSemantic;

    debug.runtime('COMPILE: about to call parse()', { disableSemanticParsing: disableSemantic });
    const parseResult = parseToResult(code, parserOptions);
    debug.runtime('COMPILE: parse() returned', {
      success: parseResult.success,
      hasNode: !!parseResult.node,
      hasError: !!parseResult.error,
    });
    const compilationTime = performance.now() - startTime;

    // Create metadata about the compilation
    const metadata: CompilationResult['metadata'] = {
      parserUsed: usesSemanticParser ? 'semantic' : 'traditional',
      semanticLanguage: usesSemanticParser ? options?.language || 'en' : undefined,
      warnings: [],
    };

    if (parseResult.success && parseResult.node) {
      return {
        success: true,
        ast: parseResult.node,
        errors: [],
        tokens: parseResult.tokens,
        compilationTime,
        metadata,
      };
    } else {
      return {
        success: false,
        errors: parseResult.error ? [parseResult.error] : [],
        tokens: parseResult.tokens,
        compilationTime,
        metadata,
      };
    }
  } catch (error) {
    const compilationTime = performance.now() - startTime;

    return {
      success: false,
      errors: [
        {
          name: 'CompilationError',
          message: error instanceof Error ? error.message : 'Unknown compilation error',
          line: 1,
          column: 1,
        },
      ],
      tokens: [],
      compilationTime,
      metadata: {
        parserUsed: 'traditional',
        warnings: [],
      },
    };
  }
}

/**
 * Compile hyperscript code using the direct AST path for non-English input.
 *
 * This uses the semantic parser's buildAST() to go directly from
 * SemanticNode to AST, bypassing English text generation and re-parsing.
 *
 * Flow: Input → Semantic Parser → AST Builder → AST
 * (vs traditional: Input → Semantic Parser → English → Core Parser → AST)
 *
 * Falls back to traditional compilation if:
 * - Language is 'en' (use traditional parser for best accuracy)
 * - Semantic parsing confidence is too low
 * - Direct AST building fails
 */
async function compileMultilingual(
  code: string,
  options?: CompileOptions
): Promise<MultilingualCompilationResult> {
  const lang = options?.language || 'en';
  const startTime = performance.now();

  debug.runtime('COMPILE_MULTILINGUAL: called', { code, lang });

  // For English or when semantic parsing is disabled, use traditional path
  if (lang === 'en' || options?.disableSemanticParsing) {
    const result = compile(code, options);
    return {
      ...result,
      usedDirectPath: false,
      language: lang,
    };
  }

  // Try direct AST path for non-English
  try {
    const bridge = await getOrCreateBridge();
    const astResult = await bridge.parseToASTWithDetails(code, lang);

    debug.runtime('COMPILE_MULTILINGUAL: bridge result', {
      usedDirectPath: astResult.usedDirectPath,
      confidence: astResult.confidence,
      hasAST: !!astResult.ast,
    });

    if (astResult.usedDirectPath && astResult.ast) {
      const compilationTime = performance.now() - startTime;
      return {
        success: true,
        ast: astResult.ast,
        errors: [],
        tokens: [], // Direct path doesn't produce tokens
        compilationTime,
        usedDirectPath: true,
        confidence: astResult.confidence,
        language: lang,
        metadata: {
          parserUsed: 'semantic',
          semanticConfidence: astResult.confidence,
          semanticLanguage: lang,
          warnings: [],
        },
      };
    }

    // Direct path failed, fall back to traditional
    debug.runtime('COMPILE_MULTILINGUAL: falling back to traditional path');
    // Use the bridge's English fallback text if available, otherwise original code
    const fallbackCode = astResult.fallbackText || code;
    const result = compile(fallbackCode, options);
    return {
      ...result,
      usedDirectPath: false,
      confidence: astResult.confidence,
      language: lang,
      // metadata already set by compile()
    };
  } catch (error) {
    debug.runtime('COMPILE_MULTILINGUAL: error, falling back', { error });
    // Fall back to traditional compilation on any error
    const result = compile(code, options);
    return {
      ...result,
      usedDirectPath: false,
      language: lang,
      // metadata already set by compile()
    };
  }
}

/**
 * Execute a compiled AST with the given execution context
 */
async function execute(ast: ASTNode, context?: ExecutionContext): Promise<unknown> {
  if (!ast) {
    throw new Error('AST is required for execution');
  }

  const executionContext = context || createContext();
  return await getDefaultRuntime().execute(ast, executionContext);
}

/**
 * Enhanced run/evaluate function that seamlessly handles all existing hyperscript code
 * Makes hyperscript.evaluate() equivalent to traditional _="" attribute processing
 */
async function run(code: string, context?: ExecutionContext | Element): Promise<unknown> {
  // Input validation and normalization
  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('Code must be a non-empty string');
  }

  const normalizedCode = code.trim();

  // Create default context if none provided
  // Also handle case where user passes an Element directly (common mistake)
  let executionContext: ExecutionContext;
  if (!context) {
    executionContext = createContext();
  } else if (context instanceof Element) {
    // User passed an Element - wrap it in a proper context
    executionContext = createContext(context as HTMLElement);
  } else if (context.locals instanceof Map) {
    // Already a proper ExecutionContext
    executionContext = context;
  } else {
    // Partial context object - create proper context with element
    const partialContext = context as unknown as { me?: HTMLElement };
    executionContext = createContext(partialContext.me);
  }

  debug.runtime('HyperFixi Enhanced Evaluate:', {
    code: normalizedCode,
    hasContext: !!context,
    contextElement: executionContext.me?.tagName || 'none',
  });

  try {
    // Compile the hyperscript code
    const compiled = compile(normalizedCode);

    if (!compiled.success) {
      const errorMsg =
        compiled.errors.length > 0 ? compiled.errors[0].message : 'Unknown compilation error';
      throw new Error(`Compilation failed: ${errorMsg}`);
    }

    debug.runtime('Compilation successful:', {
      astType: compiled.ast?.type,
      tokenCount: compiled.tokens?.length || 0,
    });

    // Enhanced execution with pattern-specific handling
    const result = await executeWithCompatibility(compiled.ast!, executionContext, normalizedCode);

    debug.runtime('Execution completed:', { result: typeof result, value: result });
    return result;
  } catch (error) {
    console.error('❌ HyperFixi execution error:', error);
    throw error;
  }
}

/**
 * Enhanced execution that handles different hyperscript patterns seamlessly
 * This makes evaluate() work exactly like traditional _="" attribute processing
 */
async function executeWithCompatibility(
  ast: ASTNode,
  context: ExecutionContext,
  originalCode: string
): Promise<unknown> {
  // Pattern 1: Event handlers (on click, on submit, etc.)
  if (isEventHandlerPattern(originalCode)) {
    debug.runtime('Detected event handler pattern');
    return await handleEventHandlerPattern(ast, context, originalCode);
  }

  // Pattern 2: Direct commands (hide me, show #element, toggle .class, etc.)
  if (isDirectCommandPattern(originalCode)) {
    debug.runtime('Detected direct command pattern');
    return await getDefaultRuntime().execute(ast, context);
  }

  // Pattern 3: Expression evaluation (5 + 3, my.value, etc.)
  if (isExpressionPattern(originalCode)) {
    debug.runtime('Detected expression pattern');
    return await getDefaultRuntime().execute(ast, context);
  }

  // Pattern 4: Complex hyperscript (if/then, fetch, etc.)
  if (isComplexPattern(originalCode)) {
    debug.runtime('Detected complex hyperscript pattern');
    return await getDefaultRuntime().execute(ast, context);
  }

  // Default: Execute normally
  debug.runtime('Using default execution');
  return await getDefaultRuntime().execute(ast, context);
}

/**
 * Detect if code is an event handler pattern (starts with "on")
 */
function isEventHandlerPattern(code: string): boolean {
  return /^\s*on\s+\w+/.test(code);
}

/**
 * Detect if code is a direct command pattern
 */
function isDirectCommandPattern(code: string): boolean {
  const directCommands = [
    'hide',
    'show',
    'toggle',
    'add',
    'remove',
    'set',
    'put',
    'take',
    'make',
    'call',
    'send',
    'fetch',
    'wait',
    'go',
  ];

  const firstWord = code.trim().split(/\s+/)[0];
  return directCommands.includes(firstWord);
}

/**
 * Detect if code is a pure expression pattern
 */
function isExpressionPattern(code: string): boolean {
  // Simple heuristic: no commands, likely an expression
  const hasCommands =
    /\b(hide|show|toggle|add|remove|set|put|take|make|call|send|fetch|wait|go|on)\b/.test(code);
  return !hasCommands;
}

/**
 * Detect if code is a complex hyperscript pattern
 */
function isComplexPattern(code: string): boolean {
  return /\b(if|then|else|repeat|for|while|until|def|behavior)\b/.test(code);
}

/**
 * Enhanced event handler processing that seamlessly handles traditional patterns
 */
async function handleEventHandlerPattern(
  ast: ASTNode,
  context: ExecutionContext,
  _originalCode: string
): Promise<unknown> {
  try {
    // If context has an element, set up the event handler on it
    if (context.me && typeof context.me.addEventListener === 'function') {
      debug.event('Setting up event handler on element:', context.me);

      // Process the event handler AST to set up listeners
      await getDefaultRuntime().execute(ast, context);

      // Event handlers return undefined (they set up listeners)
      return undefined;
    }

    // If no element context, this might be a standalone evaluation
    // Execute normally and let the runtime handle it
    return await getDefaultRuntime().execute(ast, context);
  } catch (error) {
    console.error('Error in event handler setup:', error);
    throw error;
  }
}

/**
 * Check if the given code is valid hyperscript syntax
 */
function isValidHyperscript(code: string): boolean {
  try {
    const result = compile(code);
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Create a new runtime instance with custom options
 */
function createRuntimeInstance(options?: RuntimeOptions): Runtime {
  return new Runtime(options);
}

/**
 * Get the current version of hyperfixi
 */
function getVersion(): string {
  // In a real implementation, this would be injected during build
  return '0.1.0';
}

// ============================================================================
// Public API Object
// ============================================================================

/**
 * Process DOM elements to initialize hyperscript behaviors
 */
function processNode(element: Element): void {
  try {
    // Process the element itself if it has hyperscript
    const hyperscriptAttr = element.getAttribute('_');
    if (hyperscriptAttr) {
      processHyperscriptAttribute(element, hyperscriptAttr);
    }

    // Process all child elements with hyperscript attributes
    const hyperscriptElements = element.querySelectorAll('[_]');
    hyperscriptElements.forEach(child => {
      const childHyperscriptAttr = child.getAttribute('_');
      if (childHyperscriptAttr) {
        processHyperscriptAttribute(child, childHyperscriptAttr);
      }
    });
  } catch (error) {
    console.error('Error processing hyperscript node:', error);
  }
}

/**
 * Detect language from element attributes or document.
 * Checks: data-lang, lang attribute, closest parent with lang, document lang.
 */
function detectLanguage(element: Element): string {
  // Check data-lang attribute on element (explicit hyperscript language)
  const dataLang = element.getAttribute('data-lang');
  if (dataLang) return dataLang;

  // Check lang attribute (HTML standard) on element or closest parent
  const langAttr = element.closest('[lang]')?.getAttribute('lang');
  if (langAttr) return langAttr.split('-')[0]; // 'en-US' → 'en'

  // Check document language
  if (typeof document !== 'undefined') {
    const docLang = document.documentElement?.lang;
    if (docLang) return docLang.split('-')[0];
  }

  // Default to English
  return 'en';
}

/**
 * Process a single hyperscript attribute on an element
 */
function processHyperscriptAttribute(element: Element, hyperscriptCode: string): void {
  // Detect language from element
  const lang = detectLanguage(element);

  // For non-English, use async multilingual path
  if (lang !== 'en') {
    void processHyperscriptAttributeAsync(element, hyperscriptCode, lang);
    return;
  }

  // For English, use synchronous path
  processHyperscriptAttributeSync(element, hyperscriptCode);
}

/**
 * Async processing for multilingual hyperscript (uses direct AST path)
 */
async function processHyperscriptAttributeAsync(
  element: Element,
  hyperscriptCode: string,
  lang: string
): Promise<void> {
  try {
    debug.runtime('Processing multilingual hyperscript:', { code: hyperscriptCode, lang });

    // Use direct AST path
    const compileResult = await compileMultilingual(hyperscriptCode, { language: lang });

    if (!compileResult.success) {
      console.error(`❌ Failed to compile ${lang} hyperscript on element:`, element);
      console.error(`❌ Hyperscript code: "${hyperscriptCode}"`);
      console.error(`❌ Parse errors:`, compileResult.errors);
      return;
    }

    if (!compileResult.ast) {
      console.warn('⚠️ No AST generated for hyperscript:', hyperscriptCode);
      return;
    }

    debug.runtime('Successfully compiled multilingual hyperscript:', {
      code: hyperscriptCode,
      lang,
      usedDirectPath: compileResult.usedDirectPath,
      confidence: compileResult.confidence,
    });

    // Create execution context for this element
    const context = createHyperscriptContext(element as HTMLElement);

    // Check if this is an event handler (starts with "on ")
    if (hyperscriptCode.trim().startsWith('on ') || compileResult.ast.type === 'eventHandler') {
      debug.event('Setting up multilingual event handler:', { code: hyperscriptCode, lang });
      setupEventHandler(element, compileResult.ast, context);
    } else {
      debug.runtime('Executing immediate multilingual hyperscript:', hyperscriptCode);
      void executeHyperscriptAST(compileResult.ast, context);
    }
  } catch (error) {
    console.error('❌ Error processing multilingual hyperscript:', error, 'on element:', element);
  }
}

/**
 * Synchronous processing for English hyperscript (traditional path)
 */
function processHyperscriptAttributeSync(element: Element, hyperscriptCode: string): void {
  try {
    debug.runtime('Processing hyperscript:', hyperscriptCode);

    // Compile the hyperscript code
    const compileResult = compile(hyperscriptCode);

    if (!compileResult.success) {
      console.error(`❌ Failed to compile hyperscript on element:`, element);
      console.error(`❌ Hyperscript code: "${hyperscriptCode}"`);
      console.error(
        `❌ Parse errors (count: ${compileResult.errors.length}):`,
        compileResult.errors
      );

      // Enhanced error logging
      if (compileResult.errors.length === 0) {
        console.error(`❌ No specific error details available - compilation failed without errors`);
      } else {
        compileResult.errors.forEach((error, index) => {
          console.error(`❌ Error ${index + 1}:`);
          console.error(`   Message: ${error.message || 'No message'}`);
          console.error(
            `   Line: ${error.line || 'Unknown'}, Column: ${error.column || 'Unknown'}`
          );
          console.error(`   Name: ${error.name || 'Unknown'}`);
          console.error(`   Full error object:`, JSON.stringify(error, null, 2));
        });
      }

      // Try to identify the specific syntax issue
      const lines = hyperscriptCode.split('\n');
      lines.forEach((line, lineIndex) => {
        console.error(`❌ Line ${lineIndex + 1}: "${line.trim()}"`);
      });

      // Test tokenization of the failing code
      try {
        const tokens = tokenize(hyperscriptCode);
        console.error(
          `🔍 Tokens generated:`,
          tokens.map((t: Token) => `${t.kind}:"${t.value}"`).join(', ')
        );
        console.error(`🔍 Token count: ${tokens.length}`);
      } catch (tokenError) {
        console.error(`❌ Tokenization failed:`, tokenError);
      }

      // Also try to parse manually to get more details
      try {
        console.error(`🔧 Attempting manual parse for debugging...`);
        const parseResult = parseToResult(hyperscriptCode, getDefaultParserOptions());
        console.error(`🔧 Manual parse result:`, {
          success: parseResult.success,
          errorCount: parseResult.error ? 1 : 0,
          error: parseResult.error,
          nodeType: parseResult.node?.type || 'none',
        });
      } catch (manualError) {
        console.error(`❌ Manual parse also failed:`, manualError);
      }

      return;
    }

    if (!compileResult.ast) {
      console.warn('⚠️ No AST generated for hyperscript:', hyperscriptCode);
      return;
    }

    debug.runtime('Successfully compiled hyperscript:', hyperscriptCode);
    debug.runtime('Generated AST:', compileResult.ast);

    // Create execution context for this element
    const context = createHyperscriptContext(element as HTMLElement);

    // Check if this is an event handler (starts with "on ")
    if (hyperscriptCode.trim().startsWith('on ')) {
      debug.event('Setting up event handler for:', hyperscriptCode);
      debug.event('Element for event handler:', element);
      debug.event('AST for event handler:', compileResult.ast);

      try {
        debug.event('About to call setupEventHandler...');
        setupEventHandler(element, compileResult.ast, context);
        debug.event('setupEventHandler completed successfully');
      } catch (setupError) {
        console.error('❌ Error in setupEventHandler:', setupError);
        console.error(
          '❌ setupError stack:',
          setupError instanceof Error ? setupError.stack : 'No stack trace'
        );
        throw setupError; // Re-throw to see it in outer catch
      }
    } else {
      debug.runtime('Executing immediate hyperscript:', hyperscriptCode);
      // Execute immediately for non-event code
      void executeHyperscriptAST(compileResult.ast, context);
    }
  } catch (error) {
    console.error('❌ Error processing hyperscript attribute:', error, 'on element:', element);
  }
}

/**
 * Set up event handler for hyperscript "on" statements
 */
function setupEventHandler(element: Element, ast: ASTNode, context: ExecutionContext): void {
  try {
    debug.event('setupEventHandler called with:');
    debug.event('Element:', element);
    debug.event('AST:', ast);
    debug.event('Context:', context);

    // Parse the event from the AST (simplified - assumes "on eventName" structure)
    const eventInfo = extractEventInfo(ast);
    debug.event('extractEventInfo returned:', eventInfo);

    if (!eventInfo) {
      console.error('❌ Could not extract event information from AST:', ast);
      return;
    }

    // Add event listener
    const eventHandler = async (event: Event) => {
      debug.event(`Event handler triggered: ${eventInfo.eventType} on element:`, element);
      debug.event(`Event object:`, event);
      debug.event(`Event target:`, event.target);
      debug.event(`Current element:`, element);

      try {
        // Set event context
        context.locals.set('event', event);
        context.locals.set('target', event.target);

        debug.event('About to execute hyperscript AST:', eventInfo.body);
        debug.event('Context:', context);

        // Execute the event handler body
        const result = await executeHyperscriptAST(eventInfo.body, context);
        debug.event('Hyperscript AST execution completed, result:', result);
      } catch (error) {
        console.error('❌ Error executing hyperscript event handler:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('❌ Event info body:', eventInfo.body);
        console.error('❌ Context:', context);
      }
    };

    element.addEventListener(eventInfo.eventType, eventHandler);
    debug.event(`Event listener attached: ${eventInfo.eventType} on element:`, element);
    debug.event(`Event handler function:`, eventHandler);

    debug.event(`Set up ${eventInfo.eventType} event handler on element:`, element);
  } catch (error) {
    console.error('Error setting up event handler:', error);
  }
}

/**
 * Extract event information from AST
 */
function extractEventInfo(ast: ASTNode): { eventType: string; body: ASTNode } | null {
  try {
    debug.event('Extracting event info from AST:', ast);
    debug.event('AST type:', ast.type);
    debug.event('AST keys:', Object.keys(ast));
    debug.event('Full AST structure:', JSON.stringify(ast, null, 2));

    // Handle the actual HyperFixi AST structure
    if (ast.type === 'eventHandler') {
      const eventType = (ast as { event?: string }).event || 'click';
      const commands = (ast as { commands?: ASTNode[] }).commands;

      debug.event(`Found event handler: ${eventType} with ${commands?.length || 0} commands`);

      // Create a body node from the commands
      const body: ASTNode = {
        type: 'CommandSequence',
        commands: commands || [],
        start: ast.start || 0,
        end: ast.end || 0,
        line: ast.line || 1,
        column: ast.column || 1,
      };

      return { eventType, body };
    }

    // Handle legacy AST structures
    if (ast.type === 'FeatureNode' && (ast as { name?: string }).name === 'on') {
      const eventType = (ast as { args?: Array<{ value?: string }> }).args?.[0]?.value || 'click';
      const body = (ast as { body?: ASTNode }).body || ast;
      return { eventType, body };
    }

    // Handle direct command sequences
    if (ast.type === 'CommandSequence' || ast.type === 'Block') {
      return { eventType: 'click', body: ast }; // Default to click
    }

    console.warn('⚠️ Unknown AST structure for event extraction:', ast.type);
    return null;
  } catch (error) {
    console.error('❌ Error extracting event info:', error);
    return null;
  }
}

/**
 * Execute hyperscript AST
 */
async function executeHyperscriptAST(ast: ASTNode, context: ExecutionContext): Promise<unknown> {
  try {
    return await getDefaultRuntime().execute(ast, context);
  } catch (error) {
    console.error('Error executing hyperscript AST:', error);
    throw error;
  }
}

/**
 * Create hyperscript execution context for an element
 */
function createHyperscriptContext(element?: HTMLElement | null): ExecutionContext {
  return createContext(element);
}

/**
 * Alias for processNode for HTMX API compatibility
 */
function process(element: Element): void {
  return processNode(element);
}

// ============================================================================
// New API Implementation (v2)
// ============================================================================

// Track whether deprecation warnings have been shown (avoid spam)
const deprecationWarnings = new Set<string>();

/**
 * Show a deprecation warning once per method
 */
function warnDeprecated(oldMethod: string, newMethod: string): void {
  if (deprecationWarnings.has(oldMethod)) return;
  deprecationWarnings.add(oldMethod);
  console.warn(
    `[hyperfixi] ${oldMethod}() is deprecated and will be removed in the next major version. ` +
      `Use ${newMethod}() instead.`
  );
}

/**
 * Convert old CompileOptions to NewCompileOptions
 */
function convertCompileOptions(options?: CompileOptions): NewCompileOptions {
  if (!options) return {};
  return {
    language: options.language,
    traditional: options.disableSemanticParsing,
  };
}

/**
 * Convert ParseError to CompileError
 */
function toCompileError(error: ParseError): CompileError {
  return {
    message: error.message,
    line: error.line ?? 1,
    column: error.column ?? 1,
  };
}

/**
 * Synchronously compiles hyperscript code to an Abstract Syntax Tree (AST).
 *
 * This is the recommended method for English-only code that needs synchronous compilation.
 * For multilingual support or when async compilation is acceptable, use `compileAsync()`.
 *
 * @param code - The hyperscript code to compile
 * @param options - Compilation options
 * @param options.language - Language code (default: 'en')
 * @param options.confidenceThreshold - Min confidence for semantic parsing (0-1, default: 0.5)
 * @param options.traditional - Force traditional parser, skip semantic analysis
 *
 * @returns CompileResult with ok/errors/meta structure
 *
 * @example
 * ```typescript
 * const result = hyperscript.compileSync('toggle .active');
 * if (result.ok) {
 *   console.log('Parser used:', result.meta.parser);
 *   // Use result.ast
 * } else {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 *
 * @since API v2
 */
function compileSync(code: string, options?: NewCompileOptions): CompileResult {
  if (typeof code !== 'string') {
    throw new TypeError('Code must be a string');
  }

  const startTime = performance.now();
  const lang = options?.language || 'en';

  try {
    const disableSemantic = options?.traditional ?? false;
    const parserOptions = disableSemantic ? {} : getDefaultParserOptions();
    const usesSemanticParser = !disableSemantic;

    const parseResult = parseToResult(code, parserOptions);
    const timeMs = performance.now() - startTime;

    if (parseResult.success && parseResult.node) {
      return {
        ok: true,
        ast: parseResult.node,
        meta: {
          parser: usesSemanticParser ? 'semantic' : 'traditional',
          language: lang,
          timeMs,
        },
      };
    } else {
      return {
        ok: false,
        errors: parseResult.error ? [toCompileError(parseResult.error)] : [],
        meta: {
          parser: usesSemanticParser ? 'semantic' : 'traditional',
          language: lang,
          timeMs,
        },
      };
    }
  } catch (error) {
    const timeMs = performance.now() - startTime;
    return {
      ok: false,
      errors: [
        {
          message: error instanceof Error ? error.message : 'Unknown compilation error',
          line: 1,
          column: 1,
        },
      ],
      meta: {
        parser: 'traditional',
        language: lang,
        timeMs,
      },
    };
  }
}

/**
 * Asynchronously compiles hyperscript code to an Abstract Syntax Tree (AST).
 *
 * This method handles all languages and is the recommended compilation method for multilingual
 * code. For English-only code that requires synchronous compilation, use `compileSync()`.
 *
 * @param code - The hyperscript code to compile
 * @param options - Compilation options
 * @param options.language - Language code (e.g., 'en', 'ja', 'es'). Auto-detected if not specified
 * @param options.confidenceThreshold - Min confidence for semantic parsing (0-1, default: 0.5)
 * @param options.traditional - Force traditional parser, skip semantic analysis
 *
 * @returns Promise<CompileResult> with ok/errors/meta structure
 *
 * @example
 * ```typescript
 * // English code
 * const result = await hyperscript.compileAsync('toggle .active');
 *
 * // Japanese code
 * const result = await hyperscript.compileAsync('.active を 切り替え', {
 *   language: 'ja'
 * });
 *
 * if (result.ok) {
 *   console.log('Confidence:', result.meta.confidence);
 * }
 * ```
 *
 * @since API v2
 */
async function compileAsync(code: string, options?: NewCompileOptions): Promise<CompileResult> {
  if (typeof code !== 'string') {
    throw new TypeError('Code must be a string');
  }

  const lang = options?.language || 'en';
  const startTime = performance.now();

  // For English or when traditional parsing is requested, use sync path
  if (lang === 'en' || options?.traditional) {
    return compileSync(code, options);
  }

  // For non-English, try direct AST path
  try {
    const bridge = await getOrCreateBridge();
    const astResult = await bridge.parseToASTWithDetails(code, lang);

    if (astResult.usedDirectPath && astResult.ast) {
      const timeMs = performance.now() - startTime;
      return {
        ok: true,
        ast: astResult.ast,
        meta: {
          parser: 'semantic',
          confidence: astResult.confidence,
          language: lang,
          timeMs,
          directPath: true,
        },
      };
    }

    // Direct path failed, fall back to traditional
    const fallbackCode = astResult.fallbackText || code;
    const result = compileSync(fallbackCode, { ...options, language: 'en' });
    return {
      ...result,
      meta: {
        ...result.meta,
        language: lang,
        confidence: astResult.confidence,
        directPath: false,
      },
    };
  } catch {
    // Fall back to sync compilation on any error
    return compileSync(code, { ...options, language: 'en' });
  }
}

/**
 * Compiles and executes hyperscript code in a single call.
 *
 * This is the recommended method for most use cases where you want to run hyperscript code
 * immediately. Combines compilation and execution for convenience.
 *
 * @param code - The hyperscript code to compile and execute
 * @param context - Execution context or element. If an Element is provided, a context will be
 *                  created with that element as 'me'. If omitted, a basic context is created.
 * @param options - Compilation options
 * @param options.language - Language code (e.g., 'en', 'ja', 'es')
 * @param options.confidenceThreshold - Min confidence for semantic parsing (0-1)
 * @param options.traditional - Force traditional parser
 *
 * @returns Promise<unknown> - The result of execution
 *
 * @throws Error if compilation or execution fails
 *
 * @example
 * ```typescript
 * // Simple expression
 * const sum = await hyperscript.eval('5 + 3');
 *
 * // With element context
 * const button = document.getElementById('btn');
 * await hyperscript.eval('add .active to me', button);
 *
 * // With full context
 * const ctx = hyperscript.createContext(element);
 * await hyperscript.eval('toggle .visible', ctx);
 *
 * // Multilingual
 * await hyperscript.eval('.active を 切り替え', element, { language: 'ja' });
 * ```
 *
 * @since API v2
 */
async function evalCode(
  code: string,
  context?: ExecutionContext | Element,
  options?: NewCompileOptions
): Promise<unknown> {
  if (typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('Code must be a non-empty string');
  }

  // Normalize context (handle Element passed directly)
  let executionContext: ExecutionContext;
  if (!context) {
    executionContext = createContext();
  } else if (context instanceof Element) {
    executionContext = createContext(context as HTMLElement);
  } else if ((context as ExecutionContext).locals instanceof Map) {
    executionContext = context as ExecutionContext;
  } else {
    const partialContext = context as unknown as { me?: HTMLElement };
    executionContext = createContext(partialContext.me);
  }

  const compiled = await compileAsync(code.trim(), options);

  if (!compiled.ok) {
    const errorMsg = compiled.errors?.[0]?.message || 'Unknown compilation error';
    throw new Error(`Compilation failed: ${errorMsg}`);
  }

  return execute(compiled.ast!, executionContext);
}

/**
 * Validates hyperscript syntax without executing the code.
 *
 * Use this method to check syntax before execution, or to provide validation feedback
 * in development tools and editors.
 *
 * @param code - The hyperscript code to validate
 * @param options - Validation options (same as compilation options)
 * @param options.language - Language code (e.g., 'en', 'ja', 'es')
 * @param options.confidenceThreshold - Min confidence for semantic parsing (0-1)
 * @param options.traditional - Force traditional parser
 *
 * @returns Promise<ValidateResult> with valid flag and optional errors
 *
 * @example
 * ```typescript
 * const result = await hyperscript.validate('toggle .active on me');
 * if (result.valid) {
 *   console.log('Syntax is valid');
 * } else {
 *   result.errors?.forEach(err => {
 *     console.error(`Line ${err.line}:${err.column}: ${err.message}`);
 *     if (err.suggestion) {
 *       console.log('Suggestion:', err.suggestion);
 *     }
 *   });
 * }
 * ```
 *
 * @since API v2
 */
async function validate(code: string, options?: NewCompileOptions): Promise<ValidateResult> {
  const result = await compileAsync(code, options);
  return {
    valid: result.ok,
    errors: result.errors,
  };
}

/**
 * Creates an execution context, optionally inheriting from a parent context.
 *
 * Child contexts inherit globals from their parent but maintain separate local variables.
 * This is useful for implementing nested scopes or component hierarchies.
 *
 * @param element - Element to bind as 'me' in the context (optional)
 * @param parent - Parent context to inherit from (optional)
 *
 * @returns ExecutionContext for executing hyperscript
 *
 * @example
 * ```typescript
 * // Basic context
 * const ctx = hyperscript.createContext(element);
 *
 * // Child context inheriting from parent
 * const parent = hyperscript.createContext();
 * parent.globals?.set('theme', 'dark');
 * parent.globals?.set('lang', 'en');
 *
 * const child = hyperscript.createContext(element, parent);
 * // child can access parent.globals but has separate locals
 * console.log(child.globals?.get('theme')); // 'dark'
 * ```
 *
 * @since API v2
 */
function createContextWithParent(
  element?: HTMLElement | null,
  parent?: ExecutionContext
): ExecutionContext {
  if (parent) {
    return createChildContext(parent, element);
  }
  return createContext(element);
}

// ============================================================================
// Public API Object
// ============================================================================

export const hyperscript: HyperscriptAPI = {
  // ─────────────────────────────────────────────────────────────
  // NEW API (v2)
  // ─────────────────────────────────────────────────────────────

  // Async compile (handles all languages)
  compile: compileAsync,

  // Sync compile (English-optimized)
  compileSync,

  // Execute compiled AST
  execute,

  // Compile and execute
  eval: evalCode,

  // Validate syntax
  validate,

  // Process DOM elements
  process,

  // Create context (with optional parent)
  createContext: createContextWithParent,

  // Configuration
  config,
  version: getVersion(),

  // Advanced
  createRuntime: createRuntimeInstance,

  // Runtime Hooks
  registerHooks: (name: string, hooks: RuntimeHooks) => {
    getDefaultRuntime().registerHooks(name, hooks);
  },
  unregisterHooks: (name: string) => {
    return getDefaultRuntime().unregisterHooks(name);
  },
  getRegisteredHooks: () => {
    return getDefaultRuntime().getRegisteredHooks();
  },

  // ─────────────────────────────────────────────────────────────
  // DEPRECATED (with warnings)
  // ─────────────────────────────────────────────────────────────

  compileMultilingual: async (code: string, options?: CompileOptions) => {
    warnDeprecated('compileMultilingual', 'compile');
    return compileMultilingual(code, options);
  },

  run: async (code: string, context?: ExecutionContext) => {
    warnDeprecated('run', 'eval');
    return run(code, context);
  },

  evaluate: async (code: string, context?: ExecutionContext) => {
    warnDeprecated('evaluate', 'eval');
    return run(code, context);
  },

  processNode: (element: Element) => {
    warnDeprecated('processNode', 'process');
    return processNode(element);
  },

  createChildContext: (parent: ExecutionContext, element?: HTMLElement | null) => {
    warnDeprecated('createChildContext', 'createContext');
    return createChildContext(parent, element);
  },

  isValidHyperscript: (code: string) => {
    warnDeprecated('isValidHyperscript', 'validate');
    return isValidHyperscript(code);
  },

  parse: (code: string) => {
    warnDeprecated('parse', 'compile or compileSync');
    return parse(code);
  },
};

// Export as _hyperscript for official _hyperscript API compatibility
export const _hyperscript = hyperscript;

// Note: Default export removed in favor of named exports for better tree-shaking
// Migration: import { hyperscript } from '@hyperfixi/core' instead of import hyperfixi from '@hyperfixi/core'
