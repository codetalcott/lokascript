#!/usr/bin/env node
/**
 * LokaScript Language Server
 *
 * LSP implementation for hyperscript with 21 language support.
 * Reuses analysis infrastructure from @lokascript/semantic and @lokascript/ast-toolkit.
 */

import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  CompletionItemKind,
  Hover,
  Diagnostic,
  DiagnosticSeverity,
  DocumentSymbol,
  SymbolKind,
  CodeAction,
  CodeActionKind,
  TextDocumentPositionParams,
  DocumentSymbolParams,
  CodeActionParams,
  DidChangeConfigurationNotification,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// =============================================================================
// Optional Package Imports
// =============================================================================

let semanticPackage: any = null;
let astToolkit: any = null;
let parseFunction: any = null;

// Try to import semantic package for multilingual support
try {
  semanticPackage = await import('@lokascript/semantic');
} catch {
  // semantic not available - will use English-only fallback
}

// Try to import ast-toolkit for enhanced analysis
try {
  astToolkit = await import('@lokascript/ast-toolkit');
} catch {
  // ast-toolkit not available
}

// Try to import core package for parsing
try {
  const core = await import('@lokascript/core');
  parseFunction = core.parse;
} catch {
  // core not available
}

// =============================================================================
// Server Setup
// =============================================================================

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// Cached semantic analyzer (LRU cache built-in)
let cachedAnalyzer: any = null;

function getSemanticAnalyzer(): any {
  if (!semanticPackage) return null;
  if (!cachedAnalyzer) {
    cachedAnalyzer = semanticPackage.createSemanticAnalyzer();
  }
  return cachedAnalyzer;
}

// Server configuration
interface ServerSettings {
  language: string;
  maxDiagnostics: number;
}

const defaultSettings: ServerSettings = {
  language: 'en',
  maxDiagnostics: 100,
};

let globalSettings: ServerSettings = defaultSettings;

// =============================================================================
// Initialization
// =============================================================================

connection.onInitialize((params: InitializeParams): InitializeResult => {
  connection.console.log('LokaScript Language Server initializing...');

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        triggerCharacters: ['.', '#', '@', ' ', ':'],
        resolveProvider: false,
      },
      hoverProvider: true,
      documentSymbolProvider: true,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix],
      },
    },
  };
});

connection.onInitialized(() => {
  connection.client.register(DidChangeConfigurationNotification.type, undefined);
  connection.console.log('LokaScript Language Server initialized');
});

// =============================================================================
// Configuration
// =============================================================================

connection.onDidChangeConfiguration(change => {
  globalSettings = (change.settings?.lokascript as ServerSettings) || defaultSettings;
  documents.all().forEach(validateDocument);
});

// =============================================================================
// Document Validation (Diagnostics)
// =============================================================================

documents.onDidChangeContent(change => {
  validateDocument(change.document);
});

async function validateDocument(document: TextDocument): Promise<void> {
  const text = document.getText();
  const diagnostics = await getDiagnostics(text, globalSettings.language);
  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}

async function getDiagnostics(code: string, language: string): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  // Try semantic analysis first (works for all 21 supported languages)
  const analyzer = getSemanticAnalyzer();
  if (analyzer) {
    try {
      const result = analyzer.analyze(code, language);

      // Add semantic-level errors
      if (result.errors && result.errors.length > 0) {
        for (const err of result.errors) {
          diagnostics.push({
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: code.split('\n')[0]?.length || code.length },
            },
            severity: DiagnosticSeverity.Error,
            code: 'semantic-error',
            source: 'lokascript',
            message: err,
          });
        }
      }

      // Low confidence warning
      if (result.confidence > 0 && result.confidence < 0.3) {
        diagnostics.push({
          range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: code.length },
          },
          severity: DiagnosticSeverity.Warning,
          code: 'low-confidence',
          source: 'lokascript',
          message: `Code could not be fully parsed (${(result.confidence * 100).toFixed(0)}% confidence)`,
        });
      }

      // Validate semantic roles
      if (result.confidence >= 0.5 && result.command) {
        const cmd = result.command.name;
        const roles = result.command.roles;

        if (cmd === 'toggle' && !roles.has('patient')) {
          diagnostics.push({
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: code.length } },
            severity: DiagnosticSeverity.Warning,
            code: 'missing-role',
            source: 'lokascript',
            message: 'toggle command missing target (add .class, @attr, or selector)',
          });
        }

        if (cmd === 'put' && !roles.has('destination')) {
          diagnostics.push({
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: code.length } },
            severity: DiagnosticSeverity.Warning,
            code: 'missing-role',
            source: 'lokascript',
            message: 'put command missing destination (add "into #element")',
          });
        }
      }
    } catch {
      // Semantic parsing failed - continue with other methods
    }
  }

  // Try AST-based analysis
  if (diagnostics.length === 0 && astToolkit && parseFunction) {
    try {
      const ast = parseFunction(code);
      if (ast && astToolkit.astToLSPDiagnostics) {
        const astDiagnostics = astToolkit.astToLSPDiagnostics(ast);
        diagnostics.push(...astDiagnostics);
      }
    } catch (parseError: any) {
      diagnostics.push({
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: code.length },
        },
        severity: DiagnosticSeverity.Error,
        code: 'parse-error',
        source: 'lokascript',
        message: parseError.message || 'Failed to parse hyperscript',
      });
    }
  }

  // Fallback: simple pattern-based analysis
  if (diagnostics.length === 0) {
    diagnostics.push(...runSimpleDiagnostics(code, language));
  }

  return diagnostics.slice(0, globalSettings.maxDiagnostics);
}

function runSimpleDiagnostics(code: string, _language: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Unmatched quotes
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      diagnostics.push({
        range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
        severity: DiagnosticSeverity.Error,
        code: 'unmatched-quote',
        source: 'lokascript',
        message: 'Unmatched single quote',
      });
    }

    if (doubleQuotes % 2 !== 0) {
      diagnostics.push({
        range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
        severity: DiagnosticSeverity.Error,
        code: 'unmatched-quote',
        source: 'lokascript',
        message: 'Unmatched double quote',
      });
    }
  }

  // Check for unbalanced parentheses/brackets
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    diagnostics.push({
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      severity: DiagnosticSeverity.Error,
      code: 'unbalanced-parens',
      source: 'lokascript',
      message: `Unbalanced parentheses: ${openParens} open, ${closeParens} close`,
    });
  }

  return diagnostics;
}

// =============================================================================
// Completions
// =============================================================================

connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const offset = document.offsetAt(params.position);
  const beforeCursor = text.slice(0, offset);
  const context = inferContext(beforeCursor);
  const language = globalSettings.language;

  return getContextualCompletions(context, language);
});

function inferContext(beforeCursor: string): string {
  const trimmed = beforeCursor.trim();

  if (/\bon\s*$/.test(trimmed)) return 'event';
  if (/\bthen\s*$/.test(trimmed)) return 'command';
  if (/^(on\s+\w+\s*)$/.test(trimmed)) return 'command';
  if (/(to|from|into|on)\s*$/.test(trimmed)) return 'selector';
  if (/\bif\s*$/.test(trimmed)) return 'expression';
  if (/\bset\s+:\w+\s+to\s*$/.test(trimmed)) return 'expression';

  return 'default';
}

function getContextualCompletions(context: string, language: string): CompletionItem[] {
  const completions: CompletionItem[] = [];

  // Helper for multilingual keyword lookup
  const getKeyword = (eng: string): string => {
    if (!semanticPackage || language === 'en') return eng;
    try {
      const profile = semanticPackage.getProfile(language);
      if (profile?.keywords?.[eng]?.primary) {
        return profile.keywords[eng].primary;
      }
    } catch {}
    return eng;
  };

  switch (context) {
    case 'event':
      completions.push(
        { label: 'click', kind: CompletionItemKind.Event, detail: 'Mouse click event' },
        { label: 'dblclick', kind: CompletionItemKind.Event, detail: 'Double click event' },
        { label: 'mouseenter', kind: CompletionItemKind.Event, detail: 'Mouse enter event' },
        { label: 'mouseleave', kind: CompletionItemKind.Event, detail: 'Mouse leave event' },
        { label: 'keydown', kind: CompletionItemKind.Event, detail: 'Key down event' },
        { label: 'keyup', kind: CompletionItemKind.Event, detail: 'Key up event' },
        { label: 'input', kind: CompletionItemKind.Event, detail: 'Input change event' },
        { label: 'change', kind: CompletionItemKind.Event, detail: 'Value change event' },
        { label: 'submit', kind: CompletionItemKind.Event, detail: 'Form submit event' },
        { label: 'load', kind: CompletionItemKind.Event, detail: 'Element load event' },
        { label: 'focus', kind: CompletionItemKind.Event, detail: 'Focus event' },
        { label: 'blur', kind: CompletionItemKind.Event, detail: 'Blur event' }
      );
      break;

    case 'command':
      completions.push(
        {
          label: getKeyword('toggle'),
          kind: CompletionItemKind.Method,
          detail: 'Toggle class/visibility',
          insertText: `${getKeyword('toggle')} .\${1:class}`,
        },
        {
          label: getKeyword('add'),
          kind: CompletionItemKind.Method,
          detail: 'Add class/attribute',
          insertText: `${getKeyword('add')} .\${1:class} to \${2:me}`,
        },
        {
          label: getKeyword('remove'),
          kind: CompletionItemKind.Method,
          detail: 'Remove class/element',
          insertText: `${getKeyword('remove')} .\${1:class} from \${2:me}`,
        },
        { label: getKeyword('show'), kind: CompletionItemKind.Method, detail: 'Show element' },
        { label: getKeyword('hide'), kind: CompletionItemKind.Method, detail: 'Hide element' },
        {
          label: getKeyword('put'),
          kind: CompletionItemKind.Method,
          detail: 'Set content',
          insertText: `${getKeyword('put')} \${1:value} into \${2:target}`,
        },
        {
          label: getKeyword('set'),
          kind: CompletionItemKind.Method,
          detail: 'Set variable',
          insertText: `${getKeyword('set')} \${1:variable} to \${2:value}`,
        },
        {
          label: getKeyword('fetch'),
          kind: CompletionItemKind.Method,
          detail: 'HTTP request',
          insertText: `${getKeyword('fetch')} \${1:/api/endpoint}`,
        },
        {
          label: getKeyword('wait'),
          kind: CompletionItemKind.Method,
          detail: 'Pause execution',
          insertText: `${getKeyword('wait')} \${1:1s}`,
        },
        {
          label: getKeyword('send'),
          kind: CompletionItemKind.Method,
          detail: 'Dispatch event',
          insertText: `${getKeyword('send')} \${1:eventName} to \${2:target}`,
        },
        { label: getKeyword('trigger'), kind: CompletionItemKind.Method, detail: 'Trigger event' },
        { label: getKeyword('log'), kind: CompletionItemKind.Method, detail: 'Console log' },
        { label: getKeyword('if'), kind: CompletionItemKind.Keyword, detail: 'Conditional' },
        { label: getKeyword('repeat'), kind: CompletionItemKind.Keyword, detail: 'Loop' }
      );
      break;

    case 'expression':
      completions.push(
        { label: 'me', kind: CompletionItemKind.Variable, detail: 'Current element' },
        { label: 'you', kind: CompletionItemKind.Variable, detail: 'Event target' },
        { label: 'it', kind: CompletionItemKind.Variable, detail: 'Last result' },
        { label: 'result', kind: CompletionItemKind.Variable, detail: 'Last result (alias)' },
        { label: 'first', kind: CompletionItemKind.Keyword, detail: 'First in collection' },
        { label: 'last', kind: CompletionItemKind.Keyword, detail: 'Last in collection' },
        { label: 'next', kind: CompletionItemKind.Keyword, detail: 'Next sibling' },
        { label: 'previous', kind: CompletionItemKind.Keyword, detail: 'Previous sibling' },
        { label: 'closest', kind: CompletionItemKind.Keyword, detail: 'Closest ancestor' },
        { label: 'parent', kind: CompletionItemKind.Keyword, detail: 'Parent element' }
      );
      break;

    case 'selector':
      completions.push(
        {
          label: '#',
          kind: CompletionItemKind.Snippet,
          detail: 'ID selector',
          insertText: '#${1:id}',
        },
        {
          label: '.',
          kind: CompletionItemKind.Snippet,
          detail: 'Class selector',
          insertText: '.${1:class}',
        },
        {
          label: '<',
          kind: CompletionItemKind.Snippet,
          detail: 'Tag selector',
          insertText: '<${1:tag}/>',
        }
      );
      break;

    default:
      completions.push(
        { label: getKeyword('on'), kind: CompletionItemKind.Keyword, detail: 'Event handler' },
        { label: getKeyword('init'), kind: CompletionItemKind.Keyword, detail: 'Initialization' },
        {
          label: getKeyword('behavior'),
          kind: CompletionItemKind.Class,
          detail: 'Define behavior',
        },
        { label: getKeyword('def'), kind: CompletionItemKind.Function, detail: 'Define function' }
      );
  }

  return completions;
}

// =============================================================================
// Hover
// =============================================================================

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const position = params.position;
  const lines = text.split('\n');
  const currentLine = lines[position.line];
  if (!currentLine) return null;

  // Find word at cursor position
  const word = getWordAtPosition(currentLine, position.character);
  if (!word) return null;

  const doc = getHoverDocumentation(word.text, globalSettings.language);
  if (!doc) return null;

  return {
    contents: { kind: 'markdown', value: doc },
    range: {
      start: { line: position.line, character: word.start },
      end: { line: position.line, character: word.end },
    },
  };
});

function getWordAtPosition(
  line: string,
  character: number
): { text: string; start: number; end: number } | null {
  let start = character;
  let end = character;

  while (start > 0 && /[\w.-]/.test(line[start - 1])) {
    start--;
  }
  while (end < line.length && /[\w.-]/.test(line[end])) {
    end++;
  }

  if (start === end) return null;
  return { text: line.slice(start, end), start, end };
}

function getHoverDocumentation(word: string, language: string): string | null {
  const wordLower = word.toLowerCase();

  // Normalize to English for lookup
  const engWord = normalizeToEnglish(wordLower, language);

  const docs: Record<string, string> = {
    toggle:
      '**toggle**\n\nToggles a class, attribute, or visibility state.\n\n```hyperscript\ntoggle .active on me\ntoggle @disabled on #btn\n```',
    add: '**add**\n\nAdds a class or attribute to an element.\n\n```hyperscript\nadd .highlight to me\nadd @disabled to #btn\n```',
    remove:
      '**remove**\n\nRemoves a class, attribute, or element.\n\n```hyperscript\nremove .highlight from me\nremove #temp\n```',
    show: '**show**\n\nMakes an element visible.\n\n```hyperscript\nshow #modal\nshow me with *opacity\n```',
    hide: '**hide**\n\nHides an element.\n\n```hyperscript\nhide #modal\nhide me with *opacity\n```',
    put: '**put**\n\nSets the content of an element.\n\n```hyperscript\nput "Hello" into #message\nput response into #results\n```',
    set: '**set**\n\nSets a variable or property.\n\n```hyperscript\nset :count to 0\nset $globalVar to "value"\n```',
    fetch:
      '**fetch**\n\nMakes an HTTP request.\n\n```hyperscript\nfetch /api/data as json\nfetch /api/users then put it into #list\n```',
    wait: '**wait**\n\nPauses execution for a duration.\n\n```hyperscript\nwait 1s\nwait 500ms then remove .loading\n```',
    send: '**send**\n\nDispatches a custom event.\n\n```hyperscript\nsend myEvent to #target\nsend refresh to <body/>\n```',
    trigger:
      '**trigger**\n\nTriggers an event on an element.\n\n```hyperscript\ntrigger click on #btn\ntrigger submit on closest <form/>\n```',
    on: '**on**\n\nDefines an event handler.\n\n```hyperscript\non click toggle .active\non keydown[key=="Enter"] submit()\n```',
    me: '**me**\n\nReferences the current element (the element with this hyperscript).',
    you: '**you**\n\nReferences the element that triggered the event.',
    it: '**it**\n\nReferences the result of the last expression.',
    result: '**result**\n\nAlias for `it` - the result of the last expression.',
  };

  return docs[engWord] || null;
}

function normalizeToEnglish(word: string, language: string): string {
  if (!semanticPackage || language === 'en') return word;

  try {
    const profile = semanticPackage.getProfile(language);
    if (profile?.keywords) {
      for (const [engKey, translation] of Object.entries(profile.keywords)) {
        const trans = translation as { primary?: string; alternatives?: string[] };
        if (trans.primary?.toLowerCase() === word) return engKey;
        if (trans.alternatives?.some((a: string) => a.toLowerCase() === word)) return engKey;
      }
    }
    if (profile?.references) {
      for (const [engRef, translatedRef] of Object.entries(profile.references)) {
        if ((translatedRef as string).toLowerCase() === word) return engRef;
      }
    }
  } catch {}

  return word;
}

// =============================================================================
// Document Symbols
// =============================================================================

connection.onDocumentSymbol((params: DocumentSymbolParams): DocumentSymbol[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  return extractSymbols(text, globalSettings.language);
});

function extractSymbols(code: string, language: string): DocumentSymbol[] {
  const symbols: DocumentSymbol[] = [];
  const lines = code.split('\n');

  // Get multilingual keyword variants
  const getVariants = (eng: string): string[] => {
    const variants = [eng];
    if (!semanticPackage || language === 'en') return variants;
    try {
      const profile = semanticPackage.getProfile(language);
      if (profile?.keywords?.[eng]) {
        const trans = profile.keywords[eng] as { primary?: string; alternatives?: string[] };
        if (trans.primary) variants.push(trans.primary);
        if (trans.alternatives) variants.push(...trans.alternatives);
      }
    } catch {}
    return variants;
  };

  const onVariants = getVariants('on');
  const behaviorVariants = getVariants('behavior');
  const defVariants = getVariants('def');
  const initVariants = getVariants('init');

  const onPattern = new RegExp(`\\b(${onVariants.join('|')})\\s+(\\w+(?:\\[.*?\\])?)`, 'gi');
  const behaviorPattern = new RegExp(`\\b(${behaviorVariants.join('|')})\\s+(\\w+)`, 'gi');
  const defPattern = new RegExp(`\\b(${defVariants.join('|')})\\s+(\\w+)`, 'gi');
  const initPattern = new RegExp(`\\b(${initVariants.join('|')})\\b`, 'gi');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Event handlers
    for (const match of line.matchAll(onPattern)) {
      const matchIndex = match.index ?? 0;
      symbols.push({
        name: `${match[1]} ${match[2]}`,
        detail: 'Event Handler',
        kind: SymbolKind.Event,
        range: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
        selectionRange: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
      });
    }

    // Behaviors
    for (const match of line.matchAll(behaviorPattern)) {
      const matchIndex = match.index ?? 0;
      symbols.push({
        name: `${match[1]} ${match[2]}`,
        detail: 'Behavior Definition',
        kind: SymbolKind.Class,
        range: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
        selectionRange: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
      });
    }

    // Functions
    for (const match of line.matchAll(defPattern)) {
      const matchIndex = match.index ?? 0;
      symbols.push({
        name: `${match[1]} ${match[2]}`,
        detail: 'Function Definition',
        kind: SymbolKind.Function,
        range: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
        selectionRange: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[0].length },
        },
      });
    }

    // Init blocks
    for (const match of line.matchAll(initPattern)) {
      const matchIndex = match.index ?? 0;
      symbols.push({
        name: match[1],
        detail: 'Initialization',
        kind: SymbolKind.Constructor,
        range: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[1].length },
        },
        selectionRange: {
          start: { line: i, character: matchIndex },
          end: { line: i, character: matchIndex + match[1].length },
        },
      });
    }
  }

  return symbols;
}

// =============================================================================
// Code Actions
// =============================================================================

connection.onCodeAction((params: CodeActionParams): CodeAction[] => {
  const diagnostics = params.context.diagnostics;
  const actions: CodeAction[] = [];

  for (const diagnostic of diagnostics) {
    if (diagnostic.code === 'missing-role' && diagnostic.message.includes('toggle')) {
      actions.push({
        title: 'Add class target to toggle',
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [params.textDocument.uri]: [
              {
                range: diagnostic.range,
                newText: 'toggle .${1:classname}',
              },
            ],
          },
        },
      });
    }

    if (diagnostic.code === 'missing-role' && diagnostic.message.includes('put')) {
      actions.push({
        title: 'Add destination to put command',
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [params.textDocument.uri]: [
              {
                range: diagnostic.range,
                newText: 'put ${1:value} into ${2:#element}',
              },
            ],
          },
        },
      });
    }
  }

  return actions;
});

// =============================================================================
// Start Server
// =============================================================================

documents.listen(connection);
connection.listen();
