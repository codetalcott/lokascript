#!/usr/bin/env npx tsx
/**
 * Comprehensive Performance Benchmark
 *
 * Benchmarks all tokenizers and parser operations with CI-friendly JSON output.
 * Use this for regression tracking in CI pipelines.
 *
 * Usage:
 *   npx tsx scripts/benchmark-all.ts              # Human-readable output
 *   npx tsx scripts/benchmark-all.ts --json       # JSON output for CI
 *   npx tsx scripts/benchmark-all.ts --save       # Save results to benchmarks/
 *   npx tsx scripts/benchmark-all.ts --compare    # Compare with previous run
 *
 * Run: npx tsx scripts/benchmark-all.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

// Import all tokenizers
import { englishTokenizer } from '../src/tokenizers/english';
import { japaneseTokenizer } from '../src/tokenizers/japanese';
import { koreanTokenizer } from '../src/tokenizers/korean';
import { chineseTokenizer } from '../src/tokenizers/chinese';
import { spanishTokenizer } from '../src/tokenizers/spanish';
import { arabicTokenizer } from '../src/tokenizers/arabic';
import { turkishTokenizer } from '../src/tokenizers/turkish';
import { vietnameseTokenizer } from '../src/tokenizers/vietnamese';
import { hindiTokenizer } from '../src/tokenizers/hindi';
import { russianTokenizer } from '../src/tokenizers/russian';
import { germanTokenizer } from '../src/tokenizers/german';
import { frenchTokenizer } from '../src/tokenizers/french';
import { portugueseTokenizer } from '../src/tokenizers/portuguese';
import { italianTokenizer } from '../src/tokenizers/italian';
import { polishTokenizer } from '../src/tokenizers/polish';
import { ukrainianTokenizer } from '../src/tokenizers/ukrainian';
import { indonesianTokenizer } from '../src/tokenizers/indonesian';
import { swahiliTokenizer } from '../src/tokenizers/swahili';
import { quechuaTokenizer } from '../src/tokenizers/quechua';
import { thaiTokenizer } from '../src/tokenizers/thai';
import { malayTokenizer } from '../src/tokenizers/ms';
import { tagalogTokenizer } from '../src/tokenizers/tl';
import { bengaliTokenizer } from '../src/tokenizers/bengali';

// Import parser
import { parse } from '../src';

// =============================================================================
// Configuration
// =============================================================================

const BENCHMARK_DIR = path.join(__dirname, '..', 'benchmarks');
const ITERATIONS = {
  tokenize: 5000,
  lookup: 10000,
  parse: 1000,
};

// Regression threshold (fail if slower by this percentage)
const REGRESSION_THRESHOLD = 0.20; // 20%

// =============================================================================
// Test Data
// =============================================================================

interface LanguageTestData {
  code: string;
  name: string;
  tokenizer: { tokenize: (input: string) => unknown; profileKeywords: unknown[] };
  inputs: string[];
  keywords: string[];
}

const TEST_DATA: LanguageTestData[] = [
  {
    code: 'en',
    name: 'English',
    tokenizer: englishTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['toggle .active on #button', 'add .highlight to #element', 'show #modal'],
    keywords: ['toggle', 'add', 'remove', 'show', 'hide', 'set'],
  },
  {
    code: 'ja',
    name: 'Japanese',
    tokenizer: japaneseTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['#button の .active を 切り替え', '.highlight を 追加', '#modal を 表示'],
    keywords: ['切り替え', 'トグル', '追加', '削除', '表示', '非表示'],
  },
  {
    code: 'ko',
    name: 'Korean',
    tokenizer: koreanTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['#button 에서 .active 를 토글', '#element 에 .highlight 를 추가', '#modal 표시'],
    keywords: ['토글', '추가', '제거', '표시', '숨기기', '설정'],
  },
  {
    code: 'zh',
    name: 'Chinese',
    tokenizer: chineseTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['切换 .active 在 #button', '添加 .highlight 到 #element', '显示 #modal'],
    keywords: ['切换', '添加', '删除', '显示', '隐藏', '设置'],
  },
  {
    code: 'es',
    name: 'Spanish',
    tokenizer: spanishTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['alternar .active en #button', 'agregar .highlight a #element', 'mostrar #modal'],
    keywords: ['alternar', 'agregar', 'eliminar', 'mostrar', 'ocultar', 'establecer'],
  },
  {
    code: 'ar',
    name: 'Arabic',
    tokenizer: arabicTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['بدّل .active على #button', 'أضف .highlight إلى #element', 'أظهر #modal'],
    keywords: ['بدّل', 'أضف', 'احذف', 'أظهر', 'أخفِ', 'عيّن'],
  },
  {
    code: 'tr',
    name: 'Turkish',
    tokenizer: turkishTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['#button üzerinde .active değiştir', '#element için .highlight ekle', '#modal göster'],
    keywords: ['değiştir', 'ekle', 'kaldır', 'göster', 'gizle', 'ayarla'],
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    tokenizer: vietnameseTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['bật tắt .active trên #button', 'thêm .highlight vào #element', 'hiển thị #modal'],
    keywords: ['bật tắt', 'thêm', 'xóa', 'hiển thị', 'ẩn', 'đặt'],
  },
  {
    code: 'hi',
    name: 'Hindi',
    tokenizer: hindiTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['#button पर .active टॉगल करें', '#element में .highlight जोड़ें', '#modal दिखाएं'],
    keywords: ['टॉगल', 'जोड़ें', 'हटाएं', 'दिखाएं', 'छुपाएं', 'सेट'],
  },
  {
    code: 'ru',
    name: 'Russian',
    tokenizer: russianTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['переключить .active на #button', 'добавить .highlight в #element', 'показать #modal'],
    keywords: ['переключить', 'добавить', 'удалить', 'показать', 'скрыть', 'установить'],
  },
  {
    code: 'de',
    name: 'German',
    tokenizer: germanTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['umschalten .active auf #button', 'hinzufügen .highlight zu #element', 'zeigen #modal'],
    keywords: ['umschalten', 'hinzufügen', 'entfernen', 'zeigen', 'verbergen', 'setzen'],
  },
  {
    code: 'fr',
    name: 'French',
    tokenizer: frenchTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['basculer .active sur #button', 'ajouter .highlight à #element', 'afficher #modal'],
    keywords: ['basculer', 'ajouter', 'supprimer', 'afficher', 'masquer', 'définir'],
  },
  {
    code: 'pt',
    name: 'Portuguese',
    tokenizer: portugueseTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['alternar .active em #button', 'adicionar .highlight a #element', 'mostrar #modal'],
    keywords: ['alternar', 'adicionar', 'remover', 'mostrar', 'ocultar', 'definir'],
  },
  {
    code: 'it',
    name: 'Italian',
    tokenizer: italianTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['alternare .active su #button', 'aggiungere .highlight a #element', 'mostrare #modal'],
    keywords: ['alternare', 'aggiungere', 'rimuovere', 'mostrare', 'nascondere', 'impostare'],
  },
  {
    code: 'pl',
    name: 'Polish',
    tokenizer: polishTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['przełącz .active na #button', 'dodaj .highlight do #element', 'pokaż #modal'],
    keywords: ['przełącz', 'dodaj', 'usuń', 'pokaż', 'ukryj', 'ustaw'],
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    tokenizer: ukrainianTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['перемкнути .active на #button', 'додати .highlight до #element', 'показати #modal'],
    keywords: ['перемкнути', 'додати', 'видалити', 'показати', 'сховати', 'встановити'],
  },
  {
    code: 'id',
    name: 'Indonesian',
    tokenizer: indonesianTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['alihkan .active pada #button', 'tambahkan .highlight ke #element', 'tampilkan #modal'],
    keywords: ['alihkan', 'tambahkan', 'hapus', 'tampilkan', 'sembunyikan', 'atur'],
  },
  {
    code: 'sw',
    name: 'Swahili',
    tokenizer: swahiliTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['badilisha .active kwenye #button', 'ongeza .highlight kwa #element', 'onyesha #modal'],
    keywords: ['badilisha', 'ongeza', 'ondoa', 'onyesha', 'ficha', 'weka'],
  },
  {
    code: 'qu',
    name: 'Quechua',
    tokenizer: quechuaTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['tikray .active #button-pi', 'yapay .highlight #element-man', 'rikuchiy #modal'],
    keywords: ['tikray', 'yapay', 'qichuy', 'rikuchiy', 'pakay', 'churay'],
  },
  {
    code: 'th',
    name: 'Thai',
    tokenizer: thaiTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['สลับ .active บน #button', 'เพิ่ม .highlight ไปยัง #element', 'แสดง #modal'],
    keywords: ['สลับ', 'เพิ่ม', 'ลบ', 'แสดง', 'ซ่อน', 'ตั้งค่า'],
  },
  {
    code: 'ms',
    name: 'Malay',
    tokenizer: malayTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['togol .active pada #button', 'tambah .highlight ke #element', 'tunjuk #modal'],
    keywords: ['togol', 'tambah', 'buang', 'tunjuk', 'sembunyi', 'tetap'],
  },
  {
    code: 'tl',
    name: 'Tagalog',
    tokenizer: tagalogTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['itoggle ang .active sa #button', 'idagdag ang .highlight sa #element', 'ipakita ang #modal'],
    keywords: ['itoggle', 'idagdag', 'alisin', 'ipakita', 'itago', 'itakda'],
  },
  {
    code: 'bn',
    name: 'Bengali',
    tokenizer: bengaliTokenizer as unknown as LanguageTestData['tokenizer'],
    inputs: ['#button এ .active টগল করুন', '#element এ .highlight যোগ করুন', '#modal দেখান'],
    keywords: ['টগল', 'যোগ', 'মুছুন', 'দেখান', 'লুকান', 'সেট'],
  },
];

// =============================================================================
// Benchmark Infrastructure
// =============================================================================

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  stdDev: number;
  opsPerSecond: number;
}

interface LanguageResult {
  code: string;
  name: string;
  keywordCount: number;
  tokenize: BenchmarkResult;
  lookupPositive: BenchmarkResult;
  lookupNegative: BenchmarkResult;
}

interface FullBenchmarkResults {
  timestamp: string;
  version: string;
  nodeVersion: string;
  platform: string;
  languages: LanguageResult[];
  parse: BenchmarkResult[];
  summary: {
    totalLanguages: number;
    avgTokenizeMs: number;
    avgLookupMs: number;
    avgParseMs: number;
    totalKeywords: number;
  };
}

function benchmark(name: string, fn: () => void, iterations: number): BenchmarkResult {
  // Warm up
  for (let i = 0; i < Math.min(100, iterations / 10); i++) {
    fn();
  }

  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  const totalMs = times.reduce((a, b) => a + b, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);

  // Standard deviation
  const variance = times.reduce((sum, t) => sum + Math.pow(t - avgMs, 2), 0) / iterations;
  const stdDev = Math.sqrt(variance);

  const opsPerSecond = avgMs > 0 ? Math.round(1000 / avgMs) : Infinity;

  return { name, iterations, totalMs, avgMs, minMs, maxMs, stdDev, opsPerSecond };
}

function formatResult(result: BenchmarkResult, indent: string = ''): string {
  return `${indent}${result.name.padEnd(40)} ${result.avgMs.toFixed(4)}ms avg (±${result.stdDev.toFixed(4)}ms) | ${result.opsPerSecond.toLocaleString()} ops/sec`;
}

// =============================================================================
// Benchmark Functions
// =============================================================================

function benchmarkLanguage(data: LanguageTestData): LanguageResult {
  const { code, name, tokenizer, inputs, keywords } = data;

  // Tokenize benchmark
  const tokenizeResult = benchmark(`${name} tokenize`, () => {
    for (const input of inputs) {
      tokenizer.tokenize(input);
    }
  }, ITERATIONS.tokenize);

  // Lookup benchmark - positive (keywords found)
  const lookupPositive = benchmark(`${name} lookup (found)`, () => {
    for (const kw of keywords) {
      tokenizer.profileKeywords.find(
        (k: { native: string }) => k.native.toLowerCase() === kw.toLowerCase()
      );
    }
  }, ITERATIONS.lookup);

  // Lookup benchmark - negative (keywords not found - worst case)
  const nonKeywords = ['xyz123', 'notakeyword', 'random', 'test', 'foo', 'bar'];
  const lookupNegative = benchmark(`${name} lookup (not found)`, () => {
    for (const kw of nonKeywords) {
      tokenizer.profileKeywords.find(
        (k: { native: string }) => k.native.toLowerCase() === kw.toLowerCase()
      );
    }
  }, ITERATIONS.lookup);

  return {
    code,
    name,
    keywordCount: tokenizer.profileKeywords.length,
    tokenize: tokenizeResult,
    lookupPositive,
    lookupNegative,
  };
}

function benchmarkParse(): BenchmarkResult[] {
  const parseInputs = [
    { lang: 'en', input: 'toggle .active on #button' },
    { lang: 'ja', input: '#button の .active を 切り替え' },
    { lang: 'es', input: 'alternar .active en #button' },
    { lang: 'ar', input: 'بدّل .active على #button' },
    { lang: 'ko', input: '#button 에서 .active 를 토글' },
  ];

  const results: BenchmarkResult[] = [];

  for (const { lang, input } of parseInputs) {
    const result = benchmark(`parse (${lang})`, () => {
      parse(input, lang);
    }, ITERATIONS.parse);
    results.push(result);
  }

  return results;
}

// =============================================================================
// Results Comparison
// =============================================================================

function loadPreviousResults(): FullBenchmarkResults | null {
  const resultsFile = path.join(BENCHMARK_DIR, 'latest.json');
  if (fs.existsSync(resultsFile)) {
    try {
      return JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function compareResults(current: FullBenchmarkResults, previous: FullBenchmarkResults): {
  regressions: string[];
  improvements: string[];
} {
  const regressions: string[] = [];
  const improvements: string[] = [];

  // Compare language results
  for (const curr of current.languages) {
    const prev = previous.languages.find(l => l.code === curr.code);
    if (!prev) continue;

    const tokenizeDiff = (curr.tokenize.avgMs - prev.tokenize.avgMs) / prev.tokenize.avgMs;
    if (tokenizeDiff > REGRESSION_THRESHOLD) {
      regressions.push(`${curr.name} tokenize: ${(tokenizeDiff * 100).toFixed(1)}% slower`);
    } else if (tokenizeDiff < -REGRESSION_THRESHOLD) {
      improvements.push(`${curr.name} tokenize: ${(-tokenizeDiff * 100).toFixed(1)}% faster`);
    }
  }

  // Compare parse results
  for (let i = 0; i < current.parse.length; i++) {
    const curr = current.parse[i];
    const prev = previous.parse[i];
    if (!prev) continue;

    const parseDiff = (curr.avgMs - prev.avgMs) / prev.avgMs;
    if (parseDiff > REGRESSION_THRESHOLD) {
      regressions.push(`${curr.name}: ${(parseDiff * 100).toFixed(1)}% slower`);
    } else if (parseDiff < -REGRESSION_THRESHOLD) {
      improvements.push(`${curr.name}: ${(-parseDiff * 100).toFixed(1)}% faster`);
    }
  }

  return { regressions, improvements };
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const saveResults = args.includes('--save');
  const compareWithPrevious = args.includes('--compare');

  const results: FullBenchmarkResults = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    languages: [],
    parse: [],
    summary: {
      totalLanguages: 0,
      avgTokenizeMs: 0,
      avgLookupMs: 0,
      avgParseMs: 0,
      totalKeywords: 0,
    },
  };

  if (!jsonOutput) {
    console.log('='.repeat(80));
    console.log('Comprehensive Semantic Parser Benchmark');
    console.log('='.repeat(80));
    console.log(`Date: ${results.timestamp}`);
    console.log(`Node: ${results.nodeVersion}`);
    console.log(`Platform: ${results.platform}`);
    console.log();
  }

  // Benchmark all languages
  if (!jsonOutput) {
    console.log('Language Tokenization Benchmarks');
    console.log('-'.repeat(80));
  }

  for (const data of TEST_DATA) {
    const langResult = benchmarkLanguage(data);
    results.languages.push(langResult);

    if (!jsonOutput) {
      console.log(`\n${data.name} (${langResult.keywordCount} keywords)`);
      console.log(formatResult(langResult.tokenize, '  '));
    }
  }

  // Benchmark parsing
  if (!jsonOutput) {
    console.log('\n' + '-'.repeat(80));
    console.log('Parse Benchmarks');
    console.log('-'.repeat(80));
  }

  results.parse = benchmarkParse();

  if (!jsonOutput) {
    for (const parseResult of results.parse) {
      console.log(formatResult(parseResult, '  '));
    }
  }

  // Calculate summary
  results.summary.totalLanguages = results.languages.length;
  results.summary.avgTokenizeMs =
    results.languages.reduce((sum, l) => sum + l.tokenize.avgMs, 0) / results.languages.length;
  results.summary.avgLookupMs =
    results.languages.reduce((sum, l) => sum + l.lookupPositive.avgMs, 0) / results.languages.length;
  results.summary.avgParseMs =
    results.parse.reduce((sum, p) => sum + p.avgMs, 0) / results.parse.length;
  results.summary.totalKeywords =
    results.languages.reduce((sum, l) => sum + l.keywordCount, 0);

  // Summary output
  if (!jsonOutput) {
    console.log('\n' + '='.repeat(80));
    console.log('Summary');
    console.log('='.repeat(80));
    console.log(`Total languages: ${results.summary.totalLanguages}`);
    console.log(`Total keywords: ${results.summary.totalKeywords}`);
    console.log(`Average tokenize time: ${results.summary.avgTokenizeMs.toFixed(4)}ms`);
    console.log(`Average lookup time: ${results.summary.avgLookupMs.toFixed(4)}ms`);
    console.log(`Average parse time: ${results.summary.avgParseMs.toFixed(4)}ms`);
  }

  // Compare with previous results
  if (compareWithPrevious) {
    const previous = loadPreviousResults();
    if (previous) {
      const { regressions, improvements } = compareResults(results, previous);

      if (!jsonOutput) {
        console.log('\n' + '-'.repeat(80));
        console.log('Comparison with Previous Run');
        console.log('-'.repeat(80));

        if (regressions.length > 0) {
          console.log('\n⚠️  Regressions detected:');
          for (const r of regressions) {
            console.log(`  - ${r}`);
          }
        }

        if (improvements.length > 0) {
          console.log('\n✅ Improvements:');
          for (const i of improvements) {
            console.log(`  - ${i}`);
          }
        }

        if (regressions.length === 0 && improvements.length === 0) {
          console.log('\n✅ No significant changes from previous run');
        }
      }

      // Exit with error code if regressions detected
      if (regressions.length > 0) {
        process.exitCode = 1;
      }
    } else if (!jsonOutput) {
      console.log('\nNo previous results found for comparison');
    }
  }

  // Save results
  if (saveResults) {
    if (!fs.existsSync(BENCHMARK_DIR)) {
      fs.mkdirSync(BENCHMARK_DIR, { recursive: true });
    }

    // Save as latest
    const latestFile = path.join(BENCHMARK_DIR, 'latest.json');
    fs.writeFileSync(latestFile, JSON.stringify(results, null, 2));

    // Save with timestamp
    const timestampFile = path.join(
      BENCHMARK_DIR,
      `benchmark-${results.timestamp.replace(/[:.]/g, '-')}.json`
    );
    fs.writeFileSync(timestampFile, JSON.stringify(results, null, 2));

    if (!jsonOutput) {
      console.log(`\n✅ Results saved to ${latestFile}`);
    }
  }

  // JSON output
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  }
}

main().catch(console.error);
