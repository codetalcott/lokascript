const fs = require('fs');
const dist = fs.readFileSync('./dist/hyperfixi-browser.js', 'utf8');
eval(dist);

async function testArrayMembership() {
  console.log('🎯 Testing Priority 3: Array Membership Operations\n');
  console.log('📋 TDD Phase 1: Current State Testing\n');
  
  const tests = [
    // Basic array membership tests from official hyperscript
    { expr: '1 is in [1, 2]', expected: true, desc: 'is in (true case)' },
    { expr: '2 is in [1, 2]', expected: true, desc: 'is in (true case 2)' },
    { expr: '3 is in [1, 2]', expected: false, desc: 'is in (false case)' },
    { expr: '3 is in null', expected: false, desc: 'is in null' },
    
    // Array exclusion tests
    { expr: '1 is not in [1, 2]', expected: false, desc: 'is not in (false case)' },
    { expr: '2 is not in [1, 2]', expected: false, desc: 'is not in (false case 2)' },
    { expr: '3 is not in [1, 2]', expected: true, desc: 'is not in (true case)' },
    { expr: '3 is not in null', expected: true, desc: 'is not in null' }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const result = await hyperfixi.evaluate(test.expr);
      if (result === test.expected) {
        console.log(`✅ ${test.desc}: ${test.expr} = ${result}`);
        passed++;
      } else {
        console.log(`❌ ${test.desc}: ${test.expr} = ${result} (expected ${test.expected})`);
      }
    } catch (e) {
      console.log(`❌ ${test.desc}: ${test.expr} FAILED - ${e.message}`);
    }
  }

  const percentage = Math.round(100 * passed / total);
  console.log(`\n📊 Array Membership: ${passed}/${total} passed (${percentage}%)`);
  console.log(passed === total ? '🎉 All array operations working\!' : '🚧 Implementation needed');
  
  return passed;
}

testArrayMembership();
