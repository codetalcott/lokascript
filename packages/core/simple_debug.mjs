import { tokenize } from './dist/index.mjs';

const testExpression = "0 + 1 + 1 - 2 + 2 * 3 + 3 / 4 + 4 mod 0";
console.log("Testing expression:", testExpression);

const tokens = tokenize(testExpression);
console.log("Tokens:");
tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.type} = "${token.value}"`);
});
EOF < /dev/null