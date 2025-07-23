#!/usr/bin/env node

// Test function calls in template context
import { hyperscript } from './dist/index.mjs';
import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <template id="test-template">
        @repeat in items
            @set value to it
            @set processed to processItem(it)
            <div>Item: \${value}, Processed: \${processed}</div>
        @end
    </template>
    <div id="result"></div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Define test function
function processItem(item) {
    console.log('processItem called with:', item);
    return `processed_${item}`;
}

async function testTemplateFunctions() {
    try {
        console.log('=== Testing Template Function Calls ===');
        
        const template = document.getElementById('test-template');
        const items = ['a', 'b', 'c'];
        
        // Create context with function in globals
        const context = {
            me: document.getElementById('result'),
            it: null,
            you: null,
            result: null,
            locals: new Map([['items', items]]),
            globals: new Map([['processItem', processItem]])
        };
        
        console.log('Context globals:', Array.from(context.globals.keys()));
        
        const api = hyperscript();
        const result = await api.eval(`render #test-template with (items: items)`, context);
        
        console.log('Template render result:', result);
        console.log('Rendered HTML:', result.innerHTML || result.textContent);
        
        console.log('✅ Template function calls test completed');
        
    } catch (error) {
        console.error('❌ Template function calls test failed:', error);
        console.error('Stack:', error.stack);
    }
}

testTemplateFunctions();