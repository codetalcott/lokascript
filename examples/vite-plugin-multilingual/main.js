import 'hyperfixi';

console.log('=== Vite Plugin Multilingual Test ===');
console.log('hyperfixi loaded:', window.lokascript);
console.log('Commands in bundle:', window.lokascript?.commands);
console.log('Parser:', window.lokascript?.parserName);

// Check if semantic parser is available
if (window.lokascript?.parseWithSemantic) {
  console.log('Semantic parser: ENABLED');
} else {
  console.log('Semantic parser: not loaded (base bundle)');
}
