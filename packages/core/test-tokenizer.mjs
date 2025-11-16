import { tokenize } from './src/parser/tokenizer.js';

const input = "#test-box's *opacity";
console.log('Input:', input);
console.log('\nTokens:');

try {
  const tokens = tokenize(input);
  tokens.forEach((token, i) => {
    console.log(`${i}: ${token.type} = "${token.value}" (pos ${token.start}-${token.end})`);
  });
} catch (error) {
  console.error('Tokenization error:', error.message);
}
