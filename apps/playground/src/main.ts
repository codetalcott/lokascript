import { hyperscript } from 'hyperfixi';

// Get DOM elements
const editor = document.getElementById('editor') as HTMLTextAreaElement;
const output = document.getElementById('output') as HTMLDivElement;
const executeBtn = document.getElementById('execute') as HTMLButtonElement;
const compileBtn = document.getElementById('compile') as HTMLButtonElement;
const validateBtn = document.getElementById('validate') as HTMLButtonElement;
const examples = document.querySelectorAll('.example');

// Create a context for the playground
const context = hyperscript.createContext();

// Add some sample data to the context
context.variables?.set('items', [1, 2, 2, 3, 4, 5]);
context.variables?.set('name', 'john doe');
context.variables?.set('users', [
  { name: 'Alice', age: 25, category: 'admin' },
  { name: 'Bob', age: 30, category: 'user' },
  { name: 'Charlie', age: 35, category: 'admin' }
]);

function displayOutput(content: string, type: 'success' | 'error' | 'info' = 'info') {
  output.textContent = content;
  output.className = `output ${type}`;
}

function formatResult(result: any): string {
  if (result === null) return 'null';
  if (result === undefined) return 'undefined';
  if (typeof result === 'object') {
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return String(result);
    }
  }
  return String(result);
}

// Execute expression
executeBtn.addEventListener('click', async () => {
  const expression = editor.value.trim();
  if (!expression) {
    displayOutput('Please enter an expression', 'error');
    return;
  }

  try {
    const startTime = performance.now();
    const result = await hyperscript.run(expression, context);
    const endTime = performance.now();
    
    const output = [
      `✅ Execution successful`,
      `Result: ${formatResult(result)}`,
      `Execution time: ${(endTime - startTime).toFixed(2)}ms`
    ].join('\n');
    
    displayOutput(output, 'success');
  } catch (error) {
    const errorOutput = [
      `❌ Execution failed`,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    ].join('\n');
    
    displayOutput(errorOutput, 'error');
  }
});

// Compile expression
compileBtn.addEventListener('click', () => {
  const expression = editor.value.trim();
  if (!expression) {
    displayOutput('Please enter an expression', 'error');
    return;
  }

  try {
    const startTime = performance.now();
    const result = hyperscript.compile(expression);
    const endTime = performance.now();
    
    if (result.success) {
      const output = [
        `✅ Compilation successful`,
        `Tokens: ${result.tokens.length}`,
        `Compilation time: ${(endTime - startTime).toFixed(2)}ms`,
        `AST: ${JSON.stringify(result.ast, null, 2)}`
      ].join('\n');
      
      displayOutput(output, 'success');
    } else {
      const errorOutput = [
        `❌ Compilation failed`,
        `Errors: ${result.errors.map(e => e.message).join(', ')}`
      ].join('\n');
      
      displayOutput(errorOutput, 'error');
    }
  } catch (error) {
    const errorOutput = [
      `❌ Compilation failed`,
      `Error: ${error instanceof Error ? error.message : String(error)}`
    ].join('\n');
    
    displayOutput(errorOutput, 'error');
  }
});

// Validate syntax
validateBtn.addEventListener('click', () => {
  const expression = editor.value.trim();
  if (!expression) {
    displayOutput('Please enter an expression', 'error');
    return;
  }

  const isValid = hyperscript.isValidHyperscript(expression);
  
  if (isValid) {
    displayOutput('✅ Syntax is valid', 'success');
  } else {
    displayOutput('❌ Invalid syntax', 'error');
  }
});

// Handle example clicks
examples.forEach(example => {
  example.addEventListener('click', () => {
    const expression = example.getAttribute('data-expression');
    if (expression) {
      editor.value = expression;
      editor.focus();
    }
  });
});

// Initial setup
displayOutput('Welcome to HyperFixi Playground!\n\nTry executing some expressions or click on the examples below.', 'info');

// Add context information to help users
const contextInfo = [
  'Available context variables:',
  '• items: [1, 2, 2, 3, 4, 5]',
  '• name: "john doe"',
  '• users: [{ name, age, category }, ...]',
  '',
  'Available utilities:',
  '• string.* (capitalize, camelCase, etc.)',
  '• date.* (format, relative, etc.)', 
  '• array.* (unique, groupBy, sortBy, etc.)',
  '• dom.* (findParent, siblings, etc.)',
  '• performance.* (debounce, throttle, etc.)'
].join('\n');

console.log(contextInfo);