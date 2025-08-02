// Simple test script to verify compound syntax parsing  
const { hyperscript } = require('./packages/core/dist/index.js');

console.log('🧪 Testing compound syntax parsing...');

const context = hyperscript.createContext();

async function testBasicPut() {
  console.log('\n📝 Testing: put "hello" into #target');
  
  try {
    // Test compilation first
    const compileResult = hyperscript.compile('put "hello" into #target');
    console.log('📊 Compile result:', compileResult);
    
    if (compileResult.success) {
      console.log('✅ Compilation successful');
      console.log('📋 AST:', JSON.stringify(compileResult.ast, null, 2));
    } else {
      console.log('❌ Compilation failed');
      console.log('📋 Errors:', compileResult.errors);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

async function testBasicSet() {
  console.log('\n📝 Testing: set x to 42');
  
  try {
    const compileResult = hyperscript.compile('set x to 42');
    console.log('📊 Compile result:', compileResult);
    
    if (compileResult.success) {
      console.log('✅ Compilation successful');
      console.log('📋 AST:', JSON.stringify(compileResult.ast, null, 2));
    } else {
      console.log('❌ Compilation failed');
      console.log('📋 Errors:', compileResult.errors);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run tests
testBasicPut();
testBasicSet();