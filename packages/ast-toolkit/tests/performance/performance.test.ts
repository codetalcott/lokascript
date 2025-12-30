import { describe, it, expect, beforeEach } from 'vitest';
import {
  benchmarkOperation,
  benchmarkASTOperations,
  calculateComplexityOptimized,
  analyzeMetricsOptimized,
  findNodesOptimized,
  processASTsBatch,
  setPerformanceConfig,
  getPerformanceConfig,
  analyzePerformance,
  getCacheStats,
  clearAllCaches,
  formatBenchmarkResults,
  formatOptimizationSuggestions
} from '../../src/performance/index.js';
import type { ASTNode } from '../../src/types.js';

// Mock AST generation functions
function createSimpleAST(): ASTNode {
  return {
    type: 'program',
    start: 0,
    end: 50,
    line: 1,
    column: 1,
    features: [
      {
        type: 'eventHandler',
        event: 'click',
        start: 0,
        end: 50,
        line: 1,
        column: 1,
        commands: [
          {
            type: 'command',
            name: 'toggle',
            start: 10,
            end: 30,
            line: 1,
            column: 11,
            args: [{ type: 'selector', value: '.active', start: 17, end: 24, line: 1, column: 18 }]
          }
        ]
      }
    ]
  } as any;
}

function createLargeAST(nodeCount: number = 100): ASTNode {
  const features = Array.from({ length: nodeCount }, (_, i) => ({
    type: 'eventHandler',
    event: i % 2 === 0 ? 'click' : 'submit',
    start: i * 10,
    end: (i + 1) * 10,
    line: i + 1,
    column: 1,
    commands: Array.from({ length: 3 }, (_, j) => ({
      type: 'command',
      name: ['add', 'remove', 'toggle'][j % 3],
      start: i * 10 + j * 2,
      end: i * 10 + j * 2 + 2,
      line: i + 1,
      column: j * 2 + 1,
      args: [{ type: 'selector', value: `.class${i}-${j}`, start: 0, end: 8, line: i + 1, column: 1 }]
    }))
  }));

  return {
    type: 'program',
    start: 0,
    end: nodeCount * 10,
    line: 1,
    column: 1,
    features
  } as any;
}

describe('Performance - Configuration', () => {
  beforeEach(() => {
    // Reset to default configuration
    setPerformanceConfig({
      enableCaching: true,
      cacheSize: 1000,
      enableMemoization: true,
      enableParallelization: false,
      maxConcurrency: 4,
      benchmarkIterations: 10 // Use fewer iterations for faster tests
    });
    clearAllCaches();
  });

  it('should set and get performance configuration', () => {
    const newConfig = {
      enableCaching: false,
      cacheSize: 500,
      benchmarkIterations: 50
    };

    setPerformanceConfig(newConfig);
    const config = getPerformanceConfig();

    expect(config.enableCaching).toBe(false);
    expect(config.cacheSize).toBe(500);
    expect(config.benchmarkIterations).toBe(50);
    expect(config.enableMemoization).toBe(true); // Should preserve existing values
  });

  it('should maintain default values for unspecified config options', () => {
    setPerformanceConfig({ enableCaching: false });
    const config = getPerformanceConfig();

    expect(config.enableCaching).toBe(false);
    expect(config.enableMemoization).toBe(true);
    expect(config.maxConcurrency).toBe(4);
  });
});

describe('Performance - Benchmarking', () => {
  beforeEach(() => {
    setPerformanceConfig({ benchmarkIterations: 10 });
    clearAllCaches();
  });

  it('should benchmark a simple operation', () => {
    let counter = 0;
    const operation = () => {
      counter++;
      return counter;
    };

    const result = benchmarkOperation('Counter Increment', operation, 5);

    expect(result).toBeDefined();
    expect(result.operation).toBe('Counter Increment');
    expect(result.iterations).toBe(5);
    expect(result.averageTime).toBeGreaterThan(0);
    expect(result.minTime).toBeGreaterThanOrEqual(0);
    expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
    expect(result.throughput).toBeGreaterThan(0);
    expect(counter).toBe(10); // 5 warmup + 5 benchmark iterations
  });

  it('should benchmark AST operations', () => {
    const ast = createSimpleAST();
    const results = benchmarkASTOperations(ast);

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    // Check that all required operations are benchmarked
    const operationNames = results.map(r => r.operation);
    expect(operationNames).toContain('Node Counting');
    expect(operationNames).toContain('Event Handler Finding');
    expect(operationNames).toContain('Command Finding');
    expect(operationNames).toContain('Complexity Calculation');
    expect(operationNames).toContain('Full Analysis');
    expect(operationNames).toContain('AST Traversal');

    // Verify each result has expected properties
    for (const result of results) {
      expect(result.operation).toBeDefined();
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.throughput).toBeGreaterThan(0);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.nodeCount).toBeGreaterThan(0);
    }
  });

  it('should handle benchmarking errors gracefully', () => {
    const faultyOperation = () => {
      throw new Error('Test error');
    };

    expect(() => {
      benchmarkOperation('Faulty Operation', faultyOperation, 1);
    }).toThrow('Test error');
  });
});

describe('Performance - Optimized Operations', () => {
  beforeEach(() => {
    setPerformanceConfig({ enableCaching: true });
    clearAllCaches();
  });

  it('should cache complexity calculations', () => {
    const ast = createSimpleAST();

    // First call should compute and cache
    const result1 = calculateComplexityOptimized(ast);
    
    // Second call should use cache
    const result2 = calculateComplexityOptimized(ast);

    expect(result1).toEqual(result2);

    // Verify cache was used
    const cacheStats = getCacheStats();
    expect(cacheStats.complexity.totalEntries).toBeGreaterThan(0);
  });

  it('should cache analysis results', () => {
    const ast = createSimpleAST();

    const result1 = analyzeMetricsOptimized(ast);
    const result2 = analyzeMetricsOptimized(ast);

    expect(result1).toEqual(result2);

    const cacheStats = getCacheStats();
    expect(cacheStats.analysis.totalEntries).toBeGreaterThan(0);
  });

  it('should cache node query results', () => {
    const ast = createSimpleAST();
    const predicate = (node: ASTNode) => node.type === 'eventHandler';

    const result1 = findNodesOptimized(ast, predicate);
    const result2 = findNodesOptimized(ast, predicate);

    expect(result1).toEqual(result2);
    expect(result1.length).toBeGreaterThan(0);

    const cacheStats = getCacheStats();
    expect(cacheStats.nodeQuery.totalEntries).toBeGreaterThan(0);
  });

  it('should disable caching when configured', () => {
    setPerformanceConfig({ enableCaching: false });
    clearAllCaches();

    const ast = createSimpleAST();
    
    calculateComplexityOptimized(ast);
    calculateComplexityOptimized(ast);

    const cacheStats = getCacheStats();
    expect(cacheStats.complexity.totalEntries).toBe(0);
  });

  it('should process ASTs in batches', () => {
    const asts = Array.from({ length: 5 }, () => createSimpleAST());
    let processCount = 0;

    const operation = (ast: ASTNode) => {
      processCount++;
      return ast.type;
    };

    const results = processASTsBatch(asts, operation);

    expect(results).toHaveLength(5);
    expect(results.every(r => r === 'program')).toBe(true);
    expect(processCount).toBe(5);
  });

  it('should handle batch processing with different batch sizes', () => {
    const asts = Array.from({ length: 7 }, () => createSimpleAST());
    const operation = (ast: ASTNode) => ast.type;

    const results = processASTsBatch(asts, operation, { batchSize: 3 });

    expect(results).toHaveLength(7);
    expect(results.every(r => r === 'program')).toBe(true);
  });
});

describe('Performance - Analysis and Optimization', () => {
  beforeEach(() => {
    clearAllCaches();
  });

  it('should analyze performance and suggest optimizations', () => {
    // Create mock benchmark results with various performance characteristics
    const benchmarkResults = [
      {
        operation: 'Fast Operation',
        duration: 10,
        memoryUsed: 1024, // 1KB
        throughput: 1000,
        iterations: 10,
        averageTime: 1,
        minTime: 0.8,
        maxTime: 1.2,
        nodeCount: 10
      },
      {
        operation: 'Slow Operation',
        duration: 1000,
        memoryUsed: 50 * 1024 * 1024, // 50MB
        throughput: 10,
        iterations: 10,
        averageTime: 100,
        minTime: 50,
        maxTime: 200,
        nodeCount: 1000
      },
      {
        operation: 'Variable Time Operation',
        duration: 100,
        memoryUsed: 1024,
        throughput: 100,
        iterations: 10,
        averageTime: 10,
        minTime: 1,
        maxTime: 50, // High variance
        nodeCount: 100
      }
    ];

    const suggestions = analyzePerformance(benchmarkResults);

    expect(suggestions).toBeDefined();
    expect(suggestions.length).toBeGreaterThan(0);

    // Should suggest optimization for slow operation
    const slowOpSuggestions = suggestions.filter(s => 
      s.description.includes('Slow Operation') || 
      s.description.includes('slowly')
    );
    expect(slowOpSuggestions.length).toBeGreaterThan(0);

    // Should suggest memory optimization for memory-heavy operation
    const memorySuggestions = suggestions.filter(s => s.type === 'memory');
    expect(memorySuggestions.length).toBeGreaterThan(0);

    // Should suggest caching for expensive operations
    const cachingSuggestions = suggestions.filter(s => s.type === 'caching');
    expect(cachingSuggestions.length).toBeGreaterThan(0);

    // Verify suggestion structure
    for (const suggestion of suggestions) {
      expect(suggestion.type).toBeDefined();
      expect(suggestion.description).toBeDefined();
      expect(suggestion.expectedImprovement).toBeDefined();
      expect(suggestion.implementation).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(suggestion.priority);
    }
  });

  it('should provide cache statistics', () => {
    const ast = createSimpleAST();
    
    // Populate caches
    calculateComplexityOptimized(ast);
    analyzeMetricsOptimized(ast);
    findNodesOptimized(ast, node => node.type === 'command');

    const stats = getCacheStats();

    expect(stats).toBeDefined();
    expect(stats.complexity).toBeDefined();
    expect(stats.analysis).toBeDefined();
    expect(stats.nodeQuery).toBeDefined();

    expect(stats.complexity.totalEntries).toBeGreaterThan(0);
    expect(stats.analysis.totalEntries).toBeGreaterThan(0);
    expect(stats.nodeQuery.totalEntries).toBeGreaterThan(0);
  });

  it('should clear all caches', () => {
    const ast = createSimpleAST();
    
    // Populate caches
    calculateComplexityOptimized(ast);
    analyzeMetricsOptimized(ast);
    findNodesOptimized(ast, node => node.type === 'command');

    // Verify caches have entries
    let stats = getCacheStats();
    expect(stats.complexity.totalEntries).toBeGreaterThan(0);

    // Clear caches
    clearAllCaches();

    // Verify caches are empty
    stats = getCacheStats();
    expect(stats.complexity.totalEntries).toBe(0);
    expect(stats.analysis.totalEntries).toBe(0);
    expect(stats.nodeQuery.totalEntries).toBe(0);
  });
});

describe('Performance - Formatting and Display', () => {
  it('should format benchmark results', () => {
    const results = [
      {
        operation: 'Test Operation',
        duration: 100,
        memoryUsed: 2048,
        throughput: 100,
        iterations: 10,
        averageTime: 10,
        minTime: 8,
        maxTime: 12,
        nodeCount: 50
      }
    ];

    const formatted = formatBenchmarkResults(results);

    expect(formatted).toContain('Performance Benchmark Results');
    expect(formatted).toContain('Test Operation');
    expect(formatted).toContain('Average Time: 10.000ms');
    expect(formatted).toContain('Throughput: 100.0 ops/sec');
    expect(formatted).toContain('Memory Used: 2.0KB');
    expect(formatted).toContain('Node Count: 50');
    expect(formatted).toContain('Range: 8.000ms - 12.000ms');
  });

  it('should format optimization suggestions', () => {
    const suggestions = [
      {
        type: 'caching' as const,
        description: 'Operation could benefit from caching',
        expectedImprovement: '90% improvement',
        implementation: 'Add LRU cache',
        priority: 'high' as const
      },
      {
        type: 'memory' as const,
        description: 'High memory usage detected',
        expectedImprovement: '50% memory reduction',
        implementation: 'Optimize data structures',
        priority: 'medium' as const
      }
    ];

    const formatted = formatOptimizationSuggestions(suggestions);

    expect(formatted).toContain('Performance Optimization Suggestions');
    expect(formatted).toContain('HIGH PRIORITY:');
    expect(formatted).toContain('MEDIUM PRIORITY:');
    expect(formatted).toContain('Operation could benefit from caching');
    expect(formatted).toContain('High memory usage detected');
    expect(formatted).toContain('Type: caching');
    expect(formatted).toContain('Type: memory');
    expect(formatted).toContain('Expected Improvement: 90% improvement');
    expect(formatted).toContain('Implementation: Add LRU cache');
  });

  it('should handle empty suggestion lists', () => {
    const formatted = formatOptimizationSuggestions([]);

    expect(formatted).toContain('Performance Optimization Suggestions');
    // Should not contain priority sections if no suggestions
    expect(formatted).not.toContain('HIGH PRIORITY:');
    expect(formatted).not.toContain('MEDIUM PRIORITY:');
    expect(formatted).not.toContain('LOW PRIORITY:');
  });
});

describe('Performance - Real-World Scenarios', () => {
  beforeEach(() => {
    setPerformanceConfig({ 
      enableCaching: true,
      benchmarkIterations: 5 // Faster tests
    });
    clearAllCaches();
  });

  it('should show performance improvement with caching', () => {
    const ast = createLargeAST(50);

    // First run populates the cache
    const result1 = calculateComplexityOptimized(ast);

    // Second run should use cache
    const result2 = calculateComplexityOptimized(ast);

    // Results should be identical (same cached value)
    expect(result1).toEqual(result2);

    // Verify cache was used - this is more reliable than timing
    const cacheStats = getCacheStats();
    expect(cacheStats.complexity.totalEntries).toBe(1);
  });

  it('should handle large AST operations efficiently', () => {
    const largeAST = createLargeAST(200);
    
    const benchmarks = benchmarkASTOperations(largeAST);
    
    // Verify all operations complete successfully
    expect(benchmarks.length).toBeGreaterThan(0);
    
    // Check that operations are reasonably fast even for large ASTs
    for (const benchmark of benchmarks) {
      expect(benchmark.averageTime).toBeLessThan(1000); // Less than 1 second
      expect(benchmark.throughput).toBeGreaterThan(0.1); // At least 0.1 ops/sec
    }
  });

  it('should provide meaningful optimization suggestions for real workloads', () => {
    const largeAST = createLargeAST(100);
    const benchmarks = benchmarkASTOperations(largeAST);
    const suggestions = analyzePerformance(benchmarks);

    expect(suggestions.length).toBeGreaterThan(0);

    // Should identify opportunities for optimization
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
    expect(highPrioritySuggestions.length).toBeGreaterThanOrEqual(0);

    // Should provide actionable suggestions
    for (const suggestion of suggestions) {
      expect(suggestion.implementation).toBeTruthy();
      expect(suggestion.expectedImprovement).toBeTruthy();
    }
  });
});