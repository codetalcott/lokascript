#!/usr/bin/env node
/**
 * Verify Pattern Coverage Against Official _hyperscript Documentation
 *
 * Extracts hyperscript patterns from:
 * 1. /www/cookbook/*.md
 * 2. /www/comparison.md
 * 3. /www/index.md
 *
 * Compares against patterns-registry.mjs to find gaps.
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, basename } from 'path';
import { PATTERN_REGISTRY } from './patterns-registry.mjs';

const HYPERSCRIPT_ROOT = '/Users/williamtalcott/projects/3rd-party-clones/_hyperscript/www/';
const OUTPUT_FILE = 'pattern-coverage-report.json';

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

/**
 * Normalize whitespace in pattern
 */
function normalizePattern(pattern) {
  return pattern
    .replace(/\s+/g, ' ')  // Collapse whitespace
    .trim();
}

/**
 * Extract patterns from _="..." attributes (handles multi-line)
 */
function extractFromAttributes(content) {
  const patterns = [];

  // Match _="..." including multi-line (non-greedy)
  const attrRegex = /_="([^"]*(?:[^"\\]|\\.)*)"/gs;
  let match;

  while ((match = attrRegex.exec(content)) !== null) {
    let pattern = match[1];
    pattern = decodeHtmlEntities(pattern);
    pattern = normalizePattern(pattern);
    if (pattern && pattern.length > 2) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Extract patterns from ~~~hyperscript code blocks
 */
function extractFromCodeBlocks(content) {
  const patterns = [];

  // Match ~~~hyperscript ... ~~~ blocks
  const blockRegex = /~~~hyperscript\n([\s\S]*?)~~~/g;
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    let pattern = match[1];
    pattern = decodeHtmlEntities(pattern);
    pattern = normalizePattern(pattern);
    if (pattern && pattern.length > 2) {
      patterns.push(pattern);
    }
  }

  return patterns;
}

/**
 * Extract command keywords from a pattern
 */
function extractKeywords(pattern) {
  const lower = pattern.toLowerCase();
  const keywords = new Set();

  // Event handlers
  if (lower.includes('on ')) keywords.add('on');
  if (lower.includes('init')) keywords.add('init');

  // Commands
  const commands = [
    'set', 'add', 'remove', 'toggle', 'put', 'get', 'take',
    'show', 'hide', 'transition', 'wait', 'settle',
    'trigger', 'send', 'call', 'log', 'throw', 'return',
    'halt', 'fetch', 'make', 'append', 'increment', 'decrement',
    'repeat', 'for', 'if', 'else', 'end', 'then', 'tell',
    'go', 'focus', 'blur', 'scroll'
  ];

  for (const cmd of commands) {
    const regex = new RegExp(`\\b${cmd}\\b`, 'i');
    if (regex.test(pattern)) {
      keywords.add(cmd);
    }
  }

  // References
  if (/\bme\b/i.test(pattern)) keywords.add('me');
  if (/\bit\b/i.test(pattern)) keywords.add('it');
  if (/\byou\b/i.test(pattern)) keywords.add('you');
  if (/\bthe target\b/i.test(pattern)) keywords.add('target');
  if (/\bthe event\b/i.test(pattern)) keywords.add('event');

  // Operators
  if (/\buntil\b/i.test(pattern)) keywords.add('until');
  if (/\bwhile\b/i.test(pattern)) keywords.add('while');
  if (/\bfrom\b/i.test(pattern)) keywords.add('from');
  if (/\bto\b/i.test(pattern)) keywords.add('to');
  if (/\binto\b/i.test(pattern)) keywords.add('into');
  if (/\bas\b/i.test(pattern)) keywords.add('as');

  return Array.from(keywords);
}

/**
 * Get all patterns from the registry
 */
function getRegistryPatterns() {
  const registryPatterns = new Map();
  const registryKeywords = new Set();

  for (const [category, data] of Object.entries(PATTERN_REGISTRY)) {
    for (const pattern of data.patterns) {
      registryPatterns.set(pattern.syntax.toLowerCase(), {
        category,
        ...pattern
      });

      // Extract keywords from syntax
      const keywords = extractKeywords(pattern.syntax);
      keywords.forEach(k => registryKeywords.add(k));

      // Also from example if present
      if (pattern.example) {
        const exampleKeywords = extractKeywords(pattern.example);
        exampleKeywords.forEach(k => registryKeywords.add(k));
      }
    }
  }

  return { registryPatterns, registryKeywords };
}

async function verifyPatternCoverage() {
  console.log('🔍 Verifying pattern coverage against official documentation...\n');

  const sources = [
    { path: join(HYPERSCRIPT_ROOT, 'cookbook'), type: 'directory', name: 'Cookbook' },
    { path: join(HYPERSCRIPT_ROOT, 'comparison.md'), type: 'file', name: 'Comparison' },
    { path: join(HYPERSCRIPT_ROOT, 'index.md'), type: 'file', name: 'Landing Page' },
  ];

  const extractedPatterns = [];
  const patternsBySource = {};

  for (const source of sources) {
    if (!existsSync(source.path)) {
      console.warn(`⚠️  Source not found: ${source.path}`);
      continue;
    }

    const sourcePatterns = [];

    if (source.type === 'directory') {
      const files = await readdir(source.path);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      console.log(`📂 ${source.name}: ${mdFiles.length} files`);

      for (const file of mdFiles) {
        const content = await readFile(join(source.path, file), 'utf-8');
        const attrPatterns = extractFromAttributes(content);
        const blockPatterns = extractFromCodeBlocks(content);

        for (const p of [...attrPatterns, ...blockPatterns]) {
          sourcePatterns.push({ pattern: p, file });
        }
      }
    } else {
      const content = await readFile(source.path, 'utf-8');
      const attrPatterns = extractFromAttributes(content);
      const blockPatterns = extractFromCodeBlocks(content);

      console.log(`📄 ${source.name}: ${attrPatterns.length + blockPatterns.length} patterns`);

      for (const p of [...attrPatterns, ...blockPatterns]) {
        sourcePatterns.push({ pattern: p, file: basename(source.path) });
      }
    }

    patternsBySource[source.name] = sourcePatterns;
    extractedPatterns.push(...sourcePatterns);
  }

  // Deduplicate patterns
  const uniquePatterns = new Map();
  for (const { pattern, file } of extractedPatterns) {
    if (!uniquePatterns.has(pattern)) {
      uniquePatterns.set(pattern, { pattern, files: [file], keywords: extractKeywords(pattern) });
    } else {
      uniquePatterns.get(pattern).files.push(file);
    }
  }

  console.log(`\n📊 Total unique patterns extracted: ${uniquePatterns.size}`);

  // Get registry data
  const { registryPatterns, registryKeywords } = getRegistryPatterns();
  console.log(`📋 Registry patterns: ${registryPatterns.size}`);
  console.log(`🔤 Registry keywords: ${registryKeywords.size}`);

  // Analyze coverage
  const coveredKeywords = new Set();
  const uncoveredKeywords = new Set();
  const potentiallyMissing = [];

  for (const [patternText, data] of uniquePatterns) {
    const { keywords } = data;

    let allKeywordsCovered = true;
    for (const kw of keywords) {
      if (registryKeywords.has(kw)) {
        coveredKeywords.add(kw);
      } else {
        uncoveredKeywords.add(kw);
        allKeywordsCovered = false;
      }
    }

    // Check if this exact pattern or similar exists
    let hasMatch = false;
    for (const [syntax, regData] of registryPatterns) {
      // Check for keyword overlap
      const regKeywords = extractKeywords(syntax);
      const overlap = keywords.filter(k => regKeywords.includes(k));
      if (overlap.length >= Math.min(keywords.length, regKeywords.length) * 0.5) {
        hasMatch = true;
        break;
      }
    }

    if (!hasMatch && keywords.length > 0) {
      potentiallyMissing.push(data);
    }
  }

  // Generate report
  console.log('\n' + '='.repeat(70));
  console.log(' PATTERN COVERAGE REPORT');
  console.log('='.repeat(70));

  console.log(`\n✅ Keywords covered: ${coveredKeywords.size}`);
  console.log([...coveredKeywords].sort().join(', '));

  if (uncoveredKeywords.size > 0) {
    console.log(`\n⚠️  Keywords NOT in registry: ${uncoveredKeywords.size}`);
    console.log([...uncoveredKeywords].sort().join(', '));
  }

  console.log(`\n📝 Potentially missing patterns: ${potentiallyMissing.length}`);

  // Group by primary keyword
  const byKeyword = {};
  for (const data of potentiallyMissing) {
    const primary = data.keywords[0] || 'unknown';
    if (!byKeyword[primary]) byKeyword[primary] = [];
    byKeyword[primary].push(data);
  }

  for (const [kw, patterns] of Object.entries(byKeyword).sort()) {
    console.log(`\n  ${kw.toUpperCase()}:`);
    patterns.slice(0, 3).forEach(p => {
      const preview = p.pattern.length > 70
        ? p.pattern.substring(0, 67) + '...'
        : p.pattern;
      console.log(`    - ${preview}`);
      console.log(`      (${p.files.join(', ')})`);
    });
    if (patterns.length > 3) {
      console.log(`    ... and ${patterns.length - 3} more`);
    }
  }

  // Save detailed report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalExtracted: uniquePatterns.size,
      registryPatterns: registryPatterns.size,
      coveredKeywords: coveredKeywords.size,
      uncoveredKeywords: uncoveredKeywords.size,
      potentiallyMissing: potentiallyMissing.length
    },
    coveredKeywords: [...coveredKeywords].sort(),
    uncoveredKeywords: [...uncoveredKeywords].sort(),
    potentiallyMissing: potentiallyMissing.map(p => ({
      pattern: p.pattern,
      files: p.files,
      keywords: p.keywords
    })),
    bySource: Object.fromEntries(
      Object.entries(patternsBySource).map(([name, patterns]) => [
        name,
        patterns.length
      ])
    )
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n💾 Detailed report saved to: ${OUTPUT_FILE}`);
  console.log('='.repeat(70));
}

verifyPatternCoverage().catch(console.error);
