#!/usr/bin/env node
/**
 * Language Bundle Generator
 *
 * Generates minimal language-specific bundles for HyperFixi Semantic.
 *
 * Usage:
 *   node scripts/generate-bundle.mjs es           # Spanish-only
 *   node scripts/generate-bundle.mjs es pt        # Spanish + Portuguese
 *   node scripts/generate-bundle.mjs ja ko zh     # East Asian languages
 *   node scripts/generate-bundle.mjs --list       # List all available languages
 *   node scripts/generate-bundle.mjs --dry-run es # Preview without writing files
 *
 * Output:
 *   - src/browser-{codes}.ts          Entry point
 *   - dist/browser-{codes}.{codes}.global.js   (after build)
 *
 * After generating, run `npm run build` to create the bundle.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = join(__dirname, '..');

// All supported languages with metadata
const LANGUAGES = {
  en: { name: 'English', profile: 'englishProfile', tokenizer: 'englishTokenizer' },
  es: { name: 'Spanish', profile: 'spanishProfile', tokenizer: 'spanishTokenizer' },
  ja: { name: 'Japanese', profile: 'japaneseProfile', tokenizer: 'japaneseTokenizer' },
  ar: { name: 'Arabic', profile: 'arabicProfile', tokenizer: 'arabicTokenizer' },
  ko: { name: 'Korean', profile: 'koreanProfile', tokenizer: 'koreanTokenizer' },
  zh: { name: 'Chinese', profile: 'chineseProfile', tokenizer: 'chineseTokenizer' },
  tr: { name: 'Turkish', profile: 'turkishProfile', tokenizer: 'turkishTokenizer' },
  pt: { name: 'Portuguese', profile: 'portugueseProfile', tokenizer: 'portugueseTokenizer' },
  fr: { name: 'French', profile: 'frenchProfile', tokenizer: 'frenchTokenizer' },
  de: { name: 'German', profile: 'germanProfile', tokenizer: 'germanTokenizer' },
  id: { name: 'Indonesian', profile: 'indonesianProfile', tokenizer: 'indonesianTokenizer' },
  qu: { name: 'Quechua', profile: 'quechuaProfile', tokenizer: 'quechuaTokenizer' },
  sw: { name: 'Swahili', profile: 'swahiliProfile', tokenizer: 'swahiliTokenizer' },
};

// Approximate bundle sizes (KB) for each language
const SIZES = {
  en: 80, es: 70, ja: 75, ar: 72, ko: 70, zh: 68,
  tr: 68, pt: 70, fr: 70, de: 72, id: 65, qu: 60, sw: 62,
  base: 45, // Core parsing infrastructure
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    list: false,
    languages: [],
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else if (LANGUAGES[arg]) {
      options.languages.push(arg);
    } else {
      console.error(`Unknown language: ${arg}`);
      console.error(`Available: ${Object.keys(LANGUAGES).join(', ')}`);
      process.exit(1);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Language Bundle Generator for HyperFixi Semantic

Usage:
  node scripts/generate-bundle.mjs <lang1> [lang2] [lang3] ...
  node scripts/generate-bundle.mjs --list
  node scripts/generate-bundle.mjs --dry-run <langs>

Options:
  --list      List all available languages with sizes
  --dry-run   Preview generated files without writing
  --help, -h  Show this help message

Examples:
  node scripts/generate-bundle.mjs es           # Spanish-only (~70 KB)
  node scripts/generate-bundle.mjs es pt        # Spanish + Portuguese (~95 KB)
  node scripts/generate-bundle.mjs ja ko zh     # East Asian (~120 KB)

Available Languages:
${Object.entries(LANGUAGES).map(([code, { name }]) => `  ${code.padEnd(4)} ${name}`).join('\n')}
`);
}

function printLanguageList() {
  console.log('\nAvailable Languages:\n');
  console.log('Code  Name          Est. Size');
  console.log('----  ----          ---------');
  for (const [code, { name }] of Object.entries(LANGUAGES)) {
    const size = SIZES[code] || 70;
    console.log(`${code.padEnd(6)}${name.padEnd(14)}~${size} KB`);
  }
  console.log('\nBase infrastructure: ~45 KB');
  console.log('Each additional language adds ~20-35 KB\n');
}

function generateBundleId(languages) {
  return languages.sort().join('-');
}

function generateGlobalName(languages) {
  const names = languages.map(lang =>
    lang.charAt(0).toUpperCase() + lang.slice(1)
  );
  return `HyperFixiSemantic${names.join('')}`;
}

function estimateSize(languages) {
  let size = SIZES.base;
  for (const lang of languages) {
    size += (SIZES[lang] || 70) - SIZES.base / languages.length;
  }
  return Math.round(size);
}

function generateEntryPoint(languages) {
  const bundleId = generateBundleId(languages);
  const langList = languages.join(', ');
  const langNames = languages.map(l => LANGUAGES[l].name).join(' + ');
  const isSingle = languages.length === 1;
  const lang = languages[0];

  // Generate imports
  const imports = languages.map(l => `import './languages/${l}';`).join('\n');

  // Generate tokenizer exports
  const tokenizerExports = languages
    .map(l => `export { ${LANGUAGES[l].tokenizer} } from './tokenizers/${l === 'en' ? 'english' : l === 'es' ? 'spanish' : l === 'ja' ? 'japanese' : l === 'ar' ? 'arabic' : l === 'ko' ? 'korean' : l === 'zh' ? 'chinese' : l === 'tr' ? 'turkish' : l === 'pt' ? 'portuguese' : l === 'fr' ? 'french' : l === 'de' ? 'german' : l === 'id' ? 'indonesian' : l === 'qu' ? 'quechua' : 'swahili'}';`)
    .join('\n');

  // Generate profile exports
  const profileExports = languages
    .map(l => `export { ${LANGUAGES[l].profile} } from './generators/language-profiles';`)
    .join('\n');

  // Generate validation logic
  const supportedArray = `['${languages.join("', '")}']`;
  const validationCondition = isSingle
    ? `language !== '${lang}'`
    : `!SUPPORTED_LANGUAGES.includes(language as typeof SUPPORTED_LANGUAGES[number])`;

  return `/**
 * ${langNames} Browser Bundle Entry Point
 *
 * ${isSingle ? 'Minimal single-language bundle' : `Minimal bundle supporting ${langNames}`}.
 * Estimated size: ~${estimateSize(languages)} KB
 *
 * @example
 * \`\`\`html
 * <script src="hyperfixi-semantic.${bundleId}.global.js"></script>
 * <script>
 *   const ast = ${generateGlobalName(languages)}.parse('${isSingle && lang === 'es' ? 'alternar .activo' : 'toggle .active'}', '${lang}');
 * </script>
 * \`\`\`
 */

// =============================================================================
// Register Languages: ${langList}
// =============================================================================

${imports}

// =============================================================================
// Version
// =============================================================================

export const VERSION = '1.0.0-${bundleId}';

// =============================================================================
// Supported Languages
// =============================================================================

const SUPPORTED_LANGUAGES = ${supportedArray} as const;

/**
 * Get all supported languages in this bundle.
 */
export function getSupportedLanguages(): string[] {
  return [...SUPPORTED_LANGUAGES];
}

/**
 * Validate that a language is supported by this bundle.
 */
function validateLanguage(language: string): void {
  if (${validationCondition}) {
    throw new Error(
      \`Language not supported in this bundle: \${language}. \` +
      \`Supported: ${langList}\`
    );
  }
}

// =============================================================================
// Tokenizers (from registry)
// =============================================================================

export {
  getTokenizer,
  isLanguageSupported,
} from './registry';

import type { LanguageToken } from './types';
import { tokenize as tokenizeInternal } from './tokenizers';

/**
 * Tokenize input and return array of tokens (browser-friendly wrapper).
 */
export function tokenize(input: string, language: string): LanguageToken[] {
  validateLanguage(language);
  const stream = tokenizeInternal(input, language);
  return [...stream.tokens];
}

// Re-export tokenizers
${tokenizerExports}

// =============================================================================
// Patterns (from registry - lazy generation)
// =============================================================================

import { getPatternsForLanguage as getPatternsFromRegistry } from './registry';
import type { LanguagePattern, ActionType } from './types';

/**
 * Get all patterns for a language.
 */
export function getPatternsForLanguage(language: string): LanguagePattern[] {
  validateLanguage(language);
  return getPatternsFromRegistry(language);
}

/**
 * Get patterns for a language and specific command.
 */
export function getPatternsForLanguageAndCommand(
  language: string,
  command: ActionType
): LanguagePattern[] {
  return getPatternsForLanguage(language)
    .filter(p => p.command === command)
    .sort((a, b) => b.priority - a.priority);
}

// =============================================================================
// Language Profiles (from registry)
// =============================================================================

export { getProfile } from './registry';
${profileExports}

// =============================================================================
// Parsing
// =============================================================================

export { parse, canParse } from './parser';
export { parseAny, parseExplicit, isExplicitSyntax } from './explicit';

// =============================================================================
// Rendering
// =============================================================================

export { render, renderExplicit, toExplicit, fromExplicit } from './explicit';

// =============================================================================
// AST Builder
// =============================================================================

export { buildAST, ASTBuilder, getCommandMapper, registerCommandMapper } from './ast-builder';

// =============================================================================
// Semantic Analyzer (for core parser integration)
// =============================================================================

export {
  createSemanticAnalyzer,
  SemanticAnalyzerImpl,
  shouldUseSemanticResult,
  DEFAULT_CONFIDENCE_THRESHOLD,
  HIGH_CONFIDENCE_THRESHOLD,
} from './core-bridge';

export type { SemanticAnalyzer, SemanticAnalysisResult } from './core-bridge';

// =============================================================================
// Type Helpers
// =============================================================================

export {
  createSelector,
  createLiteral,
  createReference,
  createPropertyPath,
  createCommandNode,
  createEventHandler,
} from './types';

// =============================================================================
// Types
// =============================================================================

export type {
  ActionType,
  SemanticRole,
  SemanticValue,
  SemanticNode,
  LanguageToken,
  TokenStream,
} from './types';
`;
}

function generateTsupConfig(languages) {
  const bundleId = generateBundleId(languages);
  const globalName = generateGlobalName(languages);
  const langNames = languages.map(l => LANGUAGES[l].name).join(' + ');

  return `
  // ${langNames} browser bundle (IIFE)
  // Output: hyperfixi-semantic.browser-${bundleId}.${bundleId}.global.js
  // Generated by: node scripts/generate-bundle.mjs ${languages.join(' ')}
  {
    entry: ['src/browser-${bundleId}.ts'],
    outDir: 'dist',
    format: ['iife'],
    globalName: '${globalName}',
    minify: true,
    sourcemap: false,
    platform: 'browser',
    noExternal: ['@hyperfixi/i18n'],
    outExtension() {
      return { js: '.${bundleId}.global.js' };
    },
    esbuildOptions(options) {
      options.target = 'es2020';
      options.treeShaking = true;
    },
  },`;
}

function generatePackageExport(languages) {
  const bundleId = generateBundleId(languages);
  return `    "./browser/${bundleId}": {
      "default": "./dist/browser-${bundleId}.${bundleId}.global.js"
    },`;
}

function main() {
  const options = parseArgs();

  if (options.list) {
    printLanguageList();
    return;
  }

  if (options.languages.length === 0) {
    console.error('Error: Please specify at least one language code.');
    console.error('Use --list to see available languages or --help for usage.');
    process.exit(1);
  }

  const languages = [...new Set(options.languages)]; // Remove duplicates
  const bundleId = generateBundleId(languages);
  const entryPath = join(PACKAGE_ROOT, 'src', `browser-${bundleId}.ts`);

  console.log(`\n📦 Generating ${languages.map(l => LANGUAGES[l].name).join(' + ')} bundle\n`);
  console.log(`   Bundle ID: ${bundleId}`);
  console.log(`   Global name: ${generateGlobalName(languages)}`);
  console.log(`   Estimated size: ~${estimateSize(languages)} KB`);
  console.log(`   Entry point: src/browser-${bundleId}.ts`);
  console.log(`   Output: dist/browser-${bundleId}.${bundleId}.global.js\n`);

  // Check if already exists
  if (existsSync(entryPath) && !options.dryRun) {
    console.log(`⚠️  Entry point already exists: src/browser-${bundleId}.ts`);
    console.log('   To regenerate, delete the file first.\n');
    return;
  }

  // Generate entry point
  const entryContent = generateEntryPoint(languages);

  if (options.dryRun) {
    console.log('--- Entry Point (src/browser-' + bundleId + '.ts) ---\n');
    console.log(entryContent);
    console.log('\n--- tsup.config.ts addition ---');
    console.log(generateTsupConfig(languages));
    console.log('\n--- package.json export addition ---');
    console.log(generatePackageExport(languages));
    console.log('\n[Dry run - no files written]\n');
    return;
  }

  // Write entry point
  writeFileSync(entryPath, entryContent);
  console.log(`✅ Created: src/browser-${bundleId}.ts`);

  // Show manual steps
  console.log(`
📋 Next steps:

1. Add to tsup.config.ts (before the last config entry):
${generateTsupConfig(languages)}

2. Add to package.json exports:
${generatePackageExport(languages)}

3. Build the bundle:
   npm run build

4. Verify bundle size:
   ls -la dist/browser-${bundleId}.${bundleId}.global.js
`);
}

main();
