// Quick debug test for compound syntax
const fs = require('fs');

// Read the parser source directly and manually execute the parsing logic
const parserSource = fs.readFileSync('./packages/core/src/parser/parser.ts', 'utf8');
const tokenizerSource = fs.readFileSync('./packages/core/src/parser/tokenizer.ts', 'utf8');

console.log('Testing compound syntax parsing in HyperFixi...');

// First let's see what the tokenizer produces for a put command
const testInput = 'put "hello" into #content';
console.log('\nInput:', testInput);

// The issue appears to be that "into" is being tokenized as a literal instead of being recognized properly
// Let's analyze what happens in the parsePutCommand method

console.log('\nThe issue is likely in parsePutCommand in parser.ts:');
console.log('- Line 456-462: The parser looks for operation keywords like "into" in allArgs');
console.log('- It checks both arg.name and arg.value for the keyword');
console.log('- But the tokenizer may be classifying "into" incorrectly');

console.log('\nFrom tokenizer.ts line 62: "into" is in the KEYWORDS set');
console.log('From tokenizer.ts line 811: Keywords are classified as TokenType.KEYWORD');

console.log('\nBut in parsePutCommand (line 456), it checks for:');
console.log('  (arg.type === "identifier" || arg.type === "literal")');
console.log('This excludes "keyword" type!');

console.log('\n🔍 FOUND THE BUG:');
console.log('The parsePutCommand method is not checking for TokenType.KEYWORD in the operation detection logic!');
console.log('It should check for (arg.type === "identifier" || arg.type === "literal" || arg.type === "keyword")');