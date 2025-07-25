/**
 * Performance Optimization Example
 * Demonstrates benchmarking, caching, and optimization strategies
 */

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
  formatOptimizationSuggestions,
  calculateComplexity,
  analyzeMetrics,
  findNodes
} from '@hyperfixi/ast-toolkit';
import { 
  generateSimpleAST, 
  generateComplexAST, 
  generateMassiveAST,
  generateRealisticCodebase 
} from './sample-data.js';

console.log('⚡ HyperFixi AST Toolkit - Performance Optimization Example');
console.log('========================================================\n');

// Configure performance settings for demonstrations
setPerformanceConfig({
  enableCaching: true,
  cacheSize: 1000,
  enableMemoization: true,
  benchmarkIterations: 20
});

console.log('📊 BASELINE PERFORMANCE MEASUREMENT');
console.log('-----------------------------------');

// Test different AST sizes to understand scalability
const astSizes = [
  { name: 'Small AST (10 nodes)', ast: generateSimpleAST() },
  { name: 'Medium AST (100 nodes)', ast: generateComplexAST() },
  { name: 'Large AST (500 nodes)', ast: generateMassiveAST(500) }
];

const baselineResults = new Map<string, any[]>();

for (const { name, ast } of astSizes) {
  console.log(`\n🔍 Benchmarking: ${name}`);
  console.log('─'.repeat(40));
  
  const results = benchmarkASTOperations(ast);
  baselineResults.set(name, results);
  
  // Show key metrics
  console.log('Key Performance Metrics:');
  for (const result of results.slice(0, 4)) { // Show first 4 operations
    console.log(`  ${result.operation}:`);
    console.log(`    Time: ${result.averageTime.toFixed(3)}ms`);
    console.log(`    Throughput: ${result.throughput.toFixed(1)} ops/sec`);
    console.log(`    Memory: ${(result.memoryUsed / 1024).toFixed(1)}KB`);
  }
}

console.log('\n\n🚀 CACHE EFFECTIVENESS DEMONSTRATION');
console.log('------------------------------------');

// Clear caches and demonstrate cache effectiveness
clearAllCaches();
const testAST = generateComplexAST();

console.log('Testing complexity calculation performance...\n');

// Without cache (first run)
console.log('1️⃣ First run (no cache):');
const time1Start = performance.now();
const result1 = calculateComplexity(testAST);
const time1 = performance.now() - time1Start;
console.log(`   Time: ${time1.toFixed(3)}ms`);
console.log(`   Cyclomatic Complexity: ${result1.cyclomatic}`);

// With cache (second run using optimized function)
console.log('\n2️⃣ Second run (with cache):');
const time2Start = performance.now();
const result2 = calculateComplexityOptimized(testAST);
const time2 = performance.now() - time2Start;
console.log(`   Time: ${time2.toFixed(3)}ms`);
console.log(`   Cyclomatic Complexity: ${result2.cyclomatic}`);

// Third run (cache hit)
console.log('\n3️⃣ Third run (cache hit):');
const time3Start = performance.now();
const result3 = calculateComplexityOptimized(testAST);
const time3 = performance.now() - time3Start;
console.log(`   Time: ${time3.toFixed(3)}ms`);
console.log(`   Cyclomatic Complexity: ${result3.cyclomatic}`);

const speedupFromCache = time1 / time3;
console.log(`\n🎯 Cache Performance:`);
console.log(`   Speedup: ${speedupFromCache.toFixed(1)}x faster with cache`);
console.log(`   Time Reduction: ${((1 - time3/time1) * 100).toFixed(1)}%`);

console.log('\n\n📈 SCALABILITY ANALYSIS');
console.log('-----------------------');

// Test how performance scales with AST size
const scalabilitySizes = [50, 100, 200, 500];
console.log('Testing scalability across different AST sizes...\n');

const scalabilityResults: Array<{size: number; complexity: number; analysis: number; find: number}> = [];

for (const size of scalabilitySizes) {
  console.log(`📊 Testing ${size} nodes...`);
  const ast = generateMassiveAST(size);
  
  // Benchmark key operations
  const complexityTime = benchmarkOperation('Complexity', () => calculateComplexity(ast), 5);
  const analysisTime = benchmarkOperation('Analysis', () => analyzeMetrics(ast), 5);
  const findTime = benchmarkOperation('Node Finding', () => findNodes(ast, n => n.type === 'command'), 5);
  
  scalabilityResults.push({
    size,
    complexity: complexityTime.averageTime,
    analysis: analysisTime.averageTime,
    find: findTime.averageTime
  });
  
  console.log(`   Complexity: ${complexityTime.averageTime.toFixed(3)}ms`);
  console.log(`   Analysis: ${analysisTime.averageTime.toFixed(3)}ms`);
  console.log(`   Node Finding: ${findTime.averageTime.toFixed(3)}ms`);
}

// Analyze scaling characteristics
console.log('\n📊 Scaling Analysis:');
const firstResult = scalabilityResults[0];
const lastResult = scalabilityResults[scalabilityResults.length - 1];
const sizeRatio = lastResult.size / firstResult.size;

console.log(`   Size increased: ${sizeRatio}x (${firstResult.size} → ${lastResult.size} nodes)`);
console.log(`   Complexity time increased: ${(lastResult.complexity / firstResult.complexity).toFixed(1)}x`);
console.log(`   Analysis time increased: ${(lastResult.analysis / firstResult.analysis).toFixed(1)}x`);
console.log(`   Finding time increased: ${(lastResult.find / firstResult.find).toFixed(1)}x`);

// Determine scaling efficiency
const averageScaling = (
  (lastResult.complexity / firstResult.complexity) +
  (lastResult.analysis / firstResult.analysis) +
  (lastResult.find / firstResult.find)
) / 3;

if (averageScaling < sizeRatio * 1.5) {
  console.log(`   🟢 Scaling: Good (${averageScaling.toFixed(1)}x vs ${sizeRatio}x size increase)`);
} else if (averageScaling < sizeRatio * 2.5) {
  console.log(`   🟡 Scaling: Fair (${averageScaling.toFixed(1)}x vs ${sizeRatio}x size increase)`);
} else {
  console.log(`   🔴 Scaling: Poor (${averageScaling.toFixed(1)}x vs ${sizeRatio}x size increase)`);
}

console.log('\n\n🧠 INTELLIGENT OPTIMIZATION ANALYSIS');
console.log('------------------------------------');

// Analyze performance patterns and generate suggestions
console.log('Analyzing performance patterns...\n');

const allResults = Array.from(baselineResults.values()).flat();
const suggestions = analyzePerformance(allResults);

if (suggestions.length === 0) {
  console.log('✅ Performance looks optimal - no specific optimizations needed!');
} else {
  console.log('🔍 Optimization Opportunities Identified:\n');
  
  // Group suggestions by priority
  const priorityGroups = {
    high: suggestions.filter(s => s.priority === 'high'),
    medium: suggestions.filter(s => s.priority === 'medium'),
    low: suggestions.filter(s => s.priority === 'low')
  };
  
  for (const [priority, prioritySuggestions] of Object.entries(priorityGroups)) {
    if (prioritySuggestions.length === 0) continue;
    
    console.log(`🎯 ${priority.toUpperCase()} PRIORITY (${prioritySuggestions.length} suggestion${prioritySuggestions.length > 1 ? 's' : ''}):`);
    
    prioritySuggestions.forEach((suggestion, i) => {
      console.log(`\n${i + 1}. ${suggestion.description}`);
      console.log(`   Type: ${suggestion.type}`);
      console.log(`   Expected Improvement: ${suggestion.expectedImprovement}`);
      console.log(`   Implementation: ${suggestion.implementation}`);
    });
    
    console.log('');
  }
}

console.log('\n💾 CACHE STATISTICS AND ANALYSIS');
console.log('--------------------------------');

// Demonstrate cache usage and statistics
console.log('Testing cache effectiveness with repeated operations...\n');

const cacheTestAST = generateComplexAST();

// Populate caches with various operations
console.log('1️⃣ Populating caches...');
for (let i = 0; i < 5; i++) {
  calculateComplexityOptimized(cacheTestAST);
  analyzeMetricsOptimized(cacheTestAST);
  findNodesOptimized(cacheTestAST, node => node.type === 'eventHandler');
  findNodesOptimized(cacheTestAST, node => node.type === 'command');
}

// Get cache statistics
const cacheStats = getCacheStats();
console.log('\n📊 Cache Performance Statistics:');

console.log('\n   Complexity Cache:');
console.log(`     Entries: ${cacheStats.complexity.totalEntries}`);
console.log(`     Hit Rate: ${(cacheStats.complexity.hitRate * 100).toFixed(1)}%`);
console.log(`     Avg Computation Time: ${cacheStats.complexity.avgComputationTime.toFixed(3)}ms`);

console.log('\n   Analysis Cache:');
console.log(`     Entries: ${cacheStats.analysis.totalEntries}`);
console.log(`     Hit Rate: ${(cacheStats.analysis.hitRate * 100).toFixed(1)}%`);
console.log(`     Avg Computation Time: ${cacheStats.analysis.avgComputationTime.toFixed(3)}ms`);

console.log('\n   Node Query Cache:');
console.log(`     Entries: ${cacheStats.nodeQuery.totalEntries}`);
console.log(`     Hit Rate: ${(cacheStats.nodeQuery.hitRate * 100).toFixed(1)}%`);
console.log(`     Avg Computation Time: ${cacheStats.nodeQuery.avgComputationTime.toFixed(3)}ms`);

// Calculate cache efficiency
const totalEntries = cacheStats.complexity.totalEntries + 
                    cacheStats.analysis.totalEntries + 
                    cacheStats.nodeQuery.totalEntries;
const averageHitRate = (cacheStats.complexity.hitRate + 
                       cacheStats.analysis.hitRate + 
                       cacheStats.nodeQuery.hitRate) / 3;

console.log(`\n🎯 Overall Cache Efficiency:`);
console.log(`   Total Cached Items: ${totalEntries}`);
console.log(`   Average Hit Rate: ${(averageHitRate * 100).toFixed(1)}%`);

if (averageHitRate > 0.8) {
  console.log(`   Status: 🟢 Excellent cache performance`);
} else if (averageHitRate > 0.6) {
  console.log(`   Status: 🟡 Good cache performance`);
} else {
  console.log(`   Status: 🔴 Poor cache performance - consider tuning`);
}

console.log('\n\n🏭 BATCH PROCESSING DEMONSTRATION');
console.log('---------------------------------');

// Demonstrate batch processing for multiple ASTs
console.log('Testing batch processing efficiency...\n');

const batchASTs = Array.from({ length: 20 }, (_, i) => 
  i % 2 === 0 ? generateSimpleAST() : generateComplexAST()
);

console.log(`Processing ${batchASTs.length} ASTs...`);

// Sequential processing
console.log('\n1️⃣ Sequential Processing:');
const sequentialStart = performance.now();
const sequentialResults = batchASTs.map(ast => calculateComplexity(ast));
const sequentialTime = performance.now() - sequentialStart;
console.log(`   Time: ${sequentialTime.toFixed(3)}ms`);
console.log(`   Throughput: ${(batchASTs.length / sequentialTime * 1000).toFixed(1)} ASTs/sec`);

// Batch processing
console.log('\n2️⃣ Batch Processing:');
const batchStart = performance.now();
const batchResults = processASTsBatch(batchASTs, ast => calculateComplexity(ast), {
  batchSize: 5
});
const batchTime = performance.now() - batchStart;
console.log(`   Time: ${batchTime.toFixed(3)}ms`);
console.log(`   Throughput: ${(batchASTs.length / batchTime * 1000).toFixed(1)} ASTs/sec`);

// Compare results
const batchSpeedup = sequentialTime / batchTime;
console.log(`\n🎯 Batch Processing Results:`);
console.log(`   Speedup: ${batchSpeedup.toFixed(2)}x faster`);
console.log(`   Time Saved: ${(sequentialTime - batchTime).toFixed(3)}ms`);
console.log(`   Efficiency: ${((batchSpeedup - 1) * 100).toFixed(1)}% improvement`);

// Verify results are identical
const resultsMatch = sequentialResults.every((result, i) => 
  result.cyclomatic === batchResults[i].cyclomatic
);
console.log(`   Data Integrity: ${resultsMatch ? '✅ Perfect' : '❌ Issues detected'}`);

console.log('\n\n🎯 REAL-WORLD OPTIMIZATION SCENARIO');
console.log('----------------------------------');

// Simulate a real-world codebase analysis
console.log('Simulating large codebase analysis...\n');

const realisticCodebase = generateRealisticCodebase();
console.log(`📁 Codebase: ${realisticCodebase.files.length} files, ${realisticCodebase.totalNodes} total nodes`);

// Analyze the entire codebase
console.log('\n🔍 Running comprehensive analysis...');

const codebaseStart = performance.now();
const codebaseResults = realisticCodebase.files.map(ast => ({
  complexity: calculateComplexityOptimized(ast),
  analysis: analyzeMetricsOptimized(ast),
  eventHandlers: findNodesOptimized(ast, node => node.type === 'eventHandler').length,
  commands: findNodesOptimized(ast, node => node.type === 'command').length
}));
const codebaseTime = performance.now() - codebaseStart;

// Aggregate results
const totalComplexity = codebaseResults.reduce((sum, r) => sum + r.complexity.cyclomatic, 0);
const totalEventHandlers = codebaseResults.reduce((sum, r) => sum + r.eventHandlers, 0);
const totalCommands = codebaseResults.reduce((sum, r) => sum + r.commands, 0);
const avgMaintainability = codebaseResults.reduce((sum, r) => sum + r.analysis.maintainabilityIndex, 0) / codebaseResults.length;

console.log(`\n📊 Codebase Analysis Results:`);
console.log(`   Analysis Time: ${codebaseTime.toFixed(1)}ms`);
console.log(`   Processing Rate: ${(realisticCodebase.totalNodes / codebaseTime * 1000).toFixed(0)} nodes/sec`);
console.log(`   Total Complexity: ${totalComplexity}`);
console.log(`   Event Handlers: ${totalEventHandlers}`);
console.log(`   Commands: ${totalCommands}`);
console.log(`   Avg Maintainability: ${avgMaintainability.toFixed(1)}/100`);

// Performance assessment
const nodeProcessingRate = realisticCodebase.totalNodes / codebaseTime * 1000;
console.log(`\n🎯 Performance Assessment:`);
if (nodeProcessingRate > 10000) {
  console.log(`   🟢 Excellent: ${nodeProcessingRate.toFixed(0)} nodes/sec`);
} else if (nodeProcessingRate > 5000) {
  console.log(`   🟡 Good: ${nodeProcessingRate.toFixed(0)} nodes/sec`);
} else {
  console.log(`   🔴 Needs optimization: ${nodeProcessingRate.toFixed(0)} nodes/sec`);
}

// Final cache statistics
const finalCacheStats = getCacheStats();
console.log(`\n💾 Final Cache Status:`);
console.log(`   Total Cache Entries: ${finalCacheStats.complexity.totalEntries + finalCacheStats.analysis.totalEntries + finalCacheStats.nodeQuery.totalEntries}`);
console.log(`   Memory Efficiency: High (detailed statistics available via getCacheStats())`);

console.log('\n✨ PERFORMANCE OPTIMIZATION COMPLETE!');
console.log('=====================================');
console.log('This example demonstrated:');
console.log('• Comprehensive performance benchmarking');
console.log('• Intelligent caching with significant speedups');
console.log('• Scalability analysis across different AST sizes');
console.log('• Automated optimization suggestion generation');
console.log('• Batch processing for improved throughput');
console.log('• Real-world codebase analysis optimization');

console.log('\n🚀 Production Recommendations:');
console.log('• Enable caching for repeated AST operations');
console.log('• Monitor cache hit rates and adjust cache sizes');
console.log('• Use batch processing for large datasets');
console.log('• Implement performance monitoring in CI/CD');
console.log('• Regularly analyze performance patterns');

const config = getPerformanceConfig();
console.log(`\n⚙️  Current Configuration:`);
console.log(`   Caching: ${config.enableCaching ? 'Enabled' : 'Disabled'}`);
console.log(`   Cache Size: ${config.cacheSize}`);
console.log(`   Memoization: ${config.enableMemoization ? 'Enabled' : 'Disabled'}`);
console.log(`   Benchmark Iterations: ${config.benchmarkIterations}`);