#!/usr/bin/env npx tsx
/**
 * Runtime Performance Benchmark
 *
 * Measures key performance metrics for the HyperFixi runtime:
 * - Command execution throughput (ops/sec)
 * - Context creation overhead (μs/op)
 * - Event handler latency simulation (μs/event)
 *
 * Usage:
 *   npx tsx scripts/benchmark-runtime.ts
 *   npx tsx scripts/benchmark-runtime.ts --json
 *   npx tsx scripts/benchmark-runtime.ts --save
 *
 * @module scripts/benchmark-runtime
 */

import { createContext, createChildContext } from '../src/core/context.js';
// Note: Context pooling was benchmarked and found to be slower than V8's
// optimized allocation. See benchmark results in plan file.

// ============================================================================
// Configuration
// ============================================================================

const WARMUP_ITERATIONS = 100;
const BENCHMARK_ITERATIONS = 10000;
const BENCHMARK_RUNS = 5;

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMicroseconds: number;
  opsPerSecond: number;
  minMicroseconds: number;
  maxMicroseconds: number;
}

interface BenchmarkSuite {
  timestamp: string;
  nodeVersion: string;
  platform: string;
  results: BenchmarkResult[];
}

// ============================================================================
// Benchmark Utilities
// ============================================================================

function microtime(): number {
  const [seconds, nanoseconds] = process.hrtime();
  return seconds * 1e6 + nanoseconds / 1e3;
}

async function runBenchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = BENCHMARK_ITERATIONS
): Promise<BenchmarkResult> {
  // Warmup
  for (let i = 0; i < WARMUP_ITERATIONS; i++) {
    await fn();
  }

  // Collect timing samples
  const samples: number[] = [];

  for (let run = 0; run < BENCHMARK_RUNS; run++) {
    const start = microtime();
    for (let i = 0; i < iterations; i++) {
      await fn();
    }
    const elapsed = microtime() - start;
    samples.push(elapsed);
  }

  // Calculate statistics
  const totalMs = samples.reduce((a, b) => a + b, 0) / 1000;
  const totalIterations = iterations * BENCHMARK_RUNS;
  const avgMicroseconds = (samples.reduce((a, b) => a + b, 0) / totalIterations);
  const opsPerSecond = Math.round(1e6 / avgMicroseconds);
  const minMicroseconds = Math.min(...samples) / iterations;
  const maxMicroseconds = Math.max(...samples) / iterations;

  return {
    name,
    iterations: totalIterations,
    totalMs,
    avgMicroseconds,
    opsPerSecond,
    minMicroseconds,
    maxMicroseconds,
  };
}

// ============================================================================
// Benchmark Tests
// ============================================================================

async function benchmarkContextCreation(): Promise<BenchmarkResult> {
  return runBenchmark('Context Creation', () => {
    const ctx = createContext(null);
    // Simulate minimal usage to prevent dead code elimination
    ctx.locals.set('test', 1);
  });
}

async function benchmarkChildContextCreation(): Promise<BenchmarkResult> {
  const parentCtx = createContext(null);
  parentCtx.locals.set('parent', 'value');

  return runBenchmark('Child Context Creation', () => {
    const childCtx = createChildContext(parentCtx, null);
    childCtx.locals.set('test', 1);
  });
}

async function benchmarkMapOperations(): Promise<BenchmarkResult> {
  const ctx = createContext(null);

  return runBenchmark('Map Set/Get/Delete Cycle', () => {
    ctx.locals.set('key1', 'value1');
    ctx.locals.set('key2', 'value2');
    ctx.locals.get('key1');
    ctx.locals.get('key2');
    ctx.locals.delete('key1');
    ctx.locals.delete('key2');
  });
}

async function benchmarkTryCatchOverhead(): Promise<BenchmarkResult> {
  // Simulates current exception-based control flow
  const throwRate = 0.01; // 1% throws (control flow signals)
  let counter = 0;

  return runBenchmark('Try-Catch Control Flow', () => {
    try {
      counter++;
      if (counter % 100 === 0) {
        throw { isHalt: true };
      }
    } catch (e: unknown) {
      const error = e as { isHalt?: boolean };
      if (error && error.isHalt) {
        // Handle halt
      }
    }
  });
}

async function benchmarkResultPattern(): Promise<BenchmarkResult> {
  // Simulates proposed Result-based control flow
  type Result<T> = { ok: true; value: T } | { ok: false; error: { type: string } };
  let counter = 0;

  const execute = (): Result<number> => {
    counter++;
    if (counter % 100 === 0) {
      return { ok: false, error: { type: 'halt' } };
    }
    return { ok: true, value: counter };
  };

  return runBenchmark('Result Pattern Control Flow', () => {
    const result = execute();
    if (!result.ok) {
      // Handle signal
      if (result.error.type === 'halt') {
        // Handle halt
      }
    }
  });
}

async function benchmarkObjectAllocation(): Promise<BenchmarkResult> {
  // Measures object allocation overhead (context flags)
  return runBenchmark('Object Allocation (flags)', () => {
    const flags = {
      halted: false,
      breaking: false,
      continuing: false,
      returning: false,
      async: false,
    };
    flags.halted = true;
  });
}

async function benchmarkObjectReuse(): Promise<BenchmarkResult> {
  // Measures reusing objects vs allocating new ones
  const flagsPool: Array<{
    halted: boolean;
    breaking: boolean;
    continuing: boolean;
    returning: boolean;
    async: boolean;
  }> = [];

  // Pre-allocate pool
  for (let i = 0; i < 32; i++) {
    flagsPool.push({
      halted: false,
      breaking: false,
      continuing: false,
      returning: false,
      async: false,
    });
  }

  let poolIndex = 0;

  return runBenchmark('Object Reuse (pooled flags)', () => {
    const flags = flagsPool[poolIndex % 32];
    flags.halted = false;
    flags.breaking = false;
    flags.continuing = false;
    flags.returning = false;
    flags.async = false;
    flags.halted = true;
    poolIndex++;
  });
}

// Note: Map/Context pooling benchmarks removed - they were slower than allocation.
// See benchmark results showing:
// - Map Pooling: -24% slower
// - Context Pooling: -10% slower
// V8's allocation is highly optimized for small objects.

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const saveResults = args.includes('--save');

  if (!jsonOutput) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  HyperFixi Runtime Performance Benchmark');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`Node.js: ${process.version}`);
    console.log(`Platform: ${process.platform} ${process.arch}`);
    console.log(`Iterations per benchmark: ${BENCHMARK_ITERATIONS * BENCHMARK_RUNS}\n`);
    console.log('Running benchmarks...\n');
  }

  const results: BenchmarkResult[] = [];

  // Run all benchmarks
  results.push(await benchmarkContextCreation());
  results.push(await benchmarkChildContextCreation());
  results.push(await benchmarkMapOperations());
  results.push(await benchmarkTryCatchOverhead());
  results.push(await benchmarkResultPattern());
  results.push(await benchmarkObjectAllocation());
  results.push(await benchmarkObjectReuse());

  const suite: BenchmarkSuite = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: `${process.platform} ${process.arch}`,
    results,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(suite, null, 2));
  } else {
    // Pretty print results
    console.log('Results:');
    console.log('─────────────────────────────────────────────────────────────────\n');

    for (const result of results) {
      console.log(`  ${result.name}`);
      console.log(`    Avg: ${result.avgMicroseconds.toFixed(3)} μs/op`);
      console.log(`    Ops/sec: ${result.opsPerSecond.toLocaleString()}`);
      console.log(`    Range: ${result.minMicroseconds.toFixed(3)} - ${result.maxMicroseconds.toFixed(3)} μs\n`);
    }

    // Compare try-catch vs Result pattern
    const tryCatch = results.find(r => r.name.includes('Try-Catch'));
    const resultPattern = results.find(r => r.name.includes('Result Pattern'));

    if (tryCatch && resultPattern) {
      const improvement = ((tryCatch.avgMicroseconds - resultPattern.avgMicroseconds) / tryCatch.avgMicroseconds * 100);
      console.log('─────────────────────────────────────────────────────────────────');
      console.log(`\n  Result Pattern vs Try-Catch: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}% ${improvement > 0 ? 'faster' : 'slower'}\n`);
    }

    // Compare allocation vs reuse
    const allocation = results.find(r => r.name.includes('Object Allocation'));
    const reuse = results.find(r => r.name.includes('Object Reuse'));

    if (allocation && reuse) {
      const improvement = ((allocation.avgMicroseconds - reuse.avgMicroseconds) / allocation.avgMicroseconds * 100);
      console.log(`  Object Reuse vs Allocation: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}% ${improvement > 0 ? 'faster' : 'slower'}\n`);
    }
  }

  // Save results if requested
  if (saveResults) {
    const fs = await import('fs');
    const path = await import('path');
    const resultsDir = path.join(process.cwd(), 'benchmark-results');

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filename = `benchmark-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filepath = path.join(resultsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(suite, null, 2));

    if (!jsonOutput) {
      console.log(`Results saved to: ${filepath}`);
    }
  }
}

main().catch(console.error);
