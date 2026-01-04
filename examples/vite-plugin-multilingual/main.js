import 'hyperfixi';

console.log('=== Vite Plugin Multilingual Test ===');
console.log('hyperfixi loaded:', window.hyperfixi);
console.log('Commands in bundle:', window.hyperfixi?.commands);
console.log('Parser:', window.hyperfixi?.parserName);

// Check if semantic parser is available
if (window.hyperfixi?.parseWithSemantic) {
  console.log('Semantic parser: ENABLED');
} else {
  console.log('Semantic parser: not loaded (base bundle)');
}
