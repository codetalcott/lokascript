const fs = require('fs');
const dist = fs.readFileSync('./dist/hyperfixi-browser.js', 'utf8');
eval(dist);

// Set up happy-dom for DOM testing
const { Window } = require('happy-dom');
global.window = new Window();
global.document = window.document;

async function testCSSMembership() {
  console.log('🎯 Testing Priority 3: CSS Selector Membership Operations\n');
  console.log('📋 TDD Phase 2: CSS Selector Testing\n');
  
  // Set up DOM as in official tests
  document.body.innerHTML = "<div id='d1' class='outer'><div id='d2'></div></div>";
  
  const tests = [
    // CSS selector membership tests from official hyperscript
    { expr: '.outer contains #d2', expected: true, desc: 'outer contains inner (CSS contains)' },
    { expr: '#d2 contains #d1', expected: false, desc: 'inner does not contain outer (CSS contains)' },
    { expr: '.outer includes #d2', expected: true, desc: 'outer includes inner (CSS includes)' },
    { expr: '#d2 includes #d1', expected: false, desc: 'inner does not include outer (CSS includes)' }
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
  console.log(`\n📊 CSS Selector Membership: ${passed}/${total} passed (${percentage}%)`);
  console.log(passed === total ? '🎉 All CSS membership operations working\!' : '🚧 Implementation needed');
  
  return passed;
}

testCSSMembership();
