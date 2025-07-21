import { parse } from './dist/index.mjs';

const testExpression = "0 + 1 + 1 - 2 + 2 * 3 + 3 / 4 + 4 mod 0";
console.log("Testing expression:", testExpression);

const result = parse(testExpression);
console.log("Success:", result.success);
if (result.error) {
  console.log("Error:", result.error.message);
  console.log("Position:", result.error.position);
  console.log("Line/Column:", result.error.line, result.error.column);
}
console.log("Node type:", result.node?.type);

console.log("\nAll Tokens:");
result.tokens.forEach((token, i) => {
  console.log(`  ${i}: ${token.type} = "${token.value}"`);
});