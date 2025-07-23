const fs = require('fs');
const dist = fs.readFileSync('./dist/hyperfixi-browser.js', 'utf8');
eval(dist);

async function testNullStandalone() {
  console.log('🔍 Testing null/undefined as standalone expressions\n');
  
  const tests = [
    'null',
    'undefined', 
    'true',
    'false'
  ];

  for (const test of tests) {
    try {
      const result = await hyperfixi.evaluate(test);
      const resultType = typeof result;
      console.log(`✅ ${test} = ${result} (type: ${resultType})`);
    } catch (e) {
      console.log(`❌ ${test} FAILED - ${e.message}`);
    }
  }
}

testNullStandalone();
