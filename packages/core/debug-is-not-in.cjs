const fs = require('fs');
const dist = fs.readFileSync('./dist/hyperfixi-browser.js', 'utf8');
eval(dist);

async function debugIsNotIn() {
  console.log('🔍 Debugging "is not in" with null\n');
  
  const tests = [
    '3 is not in [1, 2]',  // This works
    '3 is not in undefined', // Test undefined
    '3 is not in null'     // This fails
  ];

  for (const test of tests) {
    try {
      const result = await hyperfixi.evaluate(test);
      console.log(`✅ ${test} = ${result}`);
    } catch (e) {
      console.log(`❌ ${test} FAILED - ${e.message}`);
    }
  }
}

debugIsNotIn();
