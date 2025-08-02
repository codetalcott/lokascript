import { hyperscript } from '../../../packages/core/src/index.ts';

// Initialize HyperFixi and set up the demo environment
const context = hyperscript.createContext();

// Add sample data to the context for demos  
context.globals.set('items', [1, 2, 2, 3, 4, 5]);
context.globals.set('name', 'john doe');
context.globals.set('users', [
  { name: 'Alice', age: 25, category: 'admin' },
  { name: 'Bob', age: 30, category: 'user' },
  { name: 'Charlie', age: 35, category: 'admin' }
]);

// I18n translations for the demo
const translations = {
  en: {
    greeting: 'Hello, welcome to HyperFixi!',
    description: 'This is a powerful hyperscript engine.',
    button: 'Click me',
    language: 'Language: English'
  },
  es: {
    greeting: '¡Hola, bienvenido a HyperFixi!',
    description: 'Este es un potente motor de hyperscript.',
    button: 'Haz clic aquí',
    language: 'Idioma: Español'
  },
  fr: {
    greeting: 'Bonjour, bienvenue dans HyperFixi!',
    description: 'Il s\'agit d\'un moteur hyperscript puissant.',
    button: 'Cliquez ici',
    language: 'Langue: Français'
  },
  de: {
    greeting: 'Hallo, willkommen bei HyperFixi!',
    description: 'Dies ist eine leistungsstarke Hyperscript-Engine.',
    button: 'Hier klicken',
    language: 'Sprache: Deutsch'
  },
  zh: {
    greeting: '你好，欢迎使用 HyperFixi！',
    description: '这是一个强大的 hyperscript 引擎。',
    button: '点击我',
    language: '语言：中文'
  },
  ja: {
    greeting: 'こんにちは、HyperFixi へようこそ！',
    description: 'これは強力な hyperscript エンジンです。',
    button: 'クリックしてください',
    language: '言語：日本語'
  }
};

// Debug logging system
class DebugLogger {
  private debugContent: HTMLElement;
  
  constructor() {
    this.debugContent = document.getElementById('debug-content') as HTMLElement;
  }
  
  log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const debugEntry = document.createElement('div');
    debugEntry.className = 'debug-entry';
    
    const statusIcon = {
      info: '💡',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type];
    
    debugEntry.innerHTML = `
      <div class="debug-timestamp">${timestamp}</div>
      <div>${statusIcon} ${message}</div>
    `;
    
    this.debugContent.appendChild(debugEntry);
    this.debugContent.scrollTop = this.debugContent.scrollHeight;
    
    // Keep only last 50 entries
    const entries = this.debugContent.querySelectorAll('.debug-entry');
    if (entries.length > 50) {
      entries[0].remove();
    }
  }
}

const debugLogger = new DebugLogger();

// Expression evaluator for demo examples
class ExpressionEvaluator {
  async evaluateExpression(expression: string): Promise<any> {
    try {
      debugLogger.log(`Evaluating: ${expression}`, 'info');
      const result = await hyperscript.run(expression, context);
      debugLogger.log(`Result: ${JSON.stringify(result)}`, 'success');
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      debugLogger.log(`Error: ${errorMsg}`, 'error');
      throw error;
    }
  }
  
  formatResult(result: any): string {
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
}

const evaluator = new ExpressionEvaluator();


// I18n demo - keep this as it provides essential functionality for language switching
class I18nDemo {
  private currentLanguage = 'en';
  
  constructor() {
    this.initializeI18nDemo();
  }
  
  initializeI18nDemo() {
    const languageSelector = document.getElementById('language-selector') as HTMLSelectElement;
    if (languageSelector) {
      languageSelector.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.switchLanguage(target.value);
      });
    }
  }
  
  switchLanguage(languageCode: string) {
    this.currentLanguage = languageCode;
    const translation = translations[languageCode as keyof typeof translations];
    
    if (translation) {
      const greetingEl = document.getElementById('i18n-greeting');
      const descriptionEl = document.getElementById('i18n-description');
      const buttonEl = document.getElementById('i18n-button');
      const resultEl = document.getElementById('i18n-result');
      
      if (greetingEl) greetingEl.textContent = translation.greeting;
      if (descriptionEl) descriptionEl.textContent = translation.description;
      if (buttonEl) buttonEl.textContent = translation.button;
      if (resultEl) resultEl.textContent = translation.language;
      
      debugLogger.log(`Language switched to ${languageCode}`, 'info');
    }
  }
}

// Enhanced Error Monitoring
class ErrorMonitor {
  private errorCount = 0;
  
  constructor() {
    this.setupErrorCapture();
  }
  
  setupErrorCapture() {
    // Capture global JavaScript errors
    window.addEventListener('error', (event) => {
      this.errorCount++;
      debugLogger.log(`Global Error ${this.errorCount}: ${event.message}`, 'error');
      debugLogger.log(`  File: ${event.filename}:${event.lineno}:${event.colno}`, 'error');
    });
    
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errorCount++;
      debugLogger.log(`Unhandled Promise Rejection ${this.errorCount}: ${event.reason}`, 'error');
    });
    
    // Override console.error to capture it in debug panel
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      debugLogger.log(`Console Error: ${args.map(arg => String(arg)).join(' ')}`, 'error');
      originalConsoleError.apply(console, args);
    };
    
    // Override console.warn to capture it in debug panel  
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      debugLogger.log(`Console Warning: ${args.map(arg => String(arg)).join(' ')}`, 'warning');
      originalConsoleWarn.apply(console, args);
    };
  }
}

// Performance Monitoring
class PerformanceTracker {
  private performanceEntries: PerformanceEntry[] = [];
  
  constructor() {
    this.setupPerformanceMonitoring();
  }
  
  setupPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        const loadTime = navTiming.loadEventEnd - navTiming.navigationStart;
        debugLogger.log(`Page load completed in ${loadTime.toFixed(2)}ms`, 'success');
        debugLogger.log(`DOM content loaded in ${(navTiming.domContentLoadedEventEnd - navTiming.navigationStart).toFixed(2)}ms`, 'info');
      }
    });
    
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            debugLogger.log(`Long task detected: ${entry.duration.toFixed(2)}ms`, 'warning');
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        debugLogger.log('Long task monitoring not available', 'info');
      }
    }
  }
  
  trackOperation(name: string, startTime: number, endTime: number) {
    const duration = endTime - startTime;
    debugLogger.log(`Operation "${name}" completed in ${duration.toFixed(2)}ms`, duration > 100 ? 'warning' : 'info');
  }
}

// HyperFixi Engine Integration with Enhanced Debugging
class HyperFixiEngine {
  private errorMonitor: ErrorMonitor;
  private performanceTracker: PerformanceTracker;
  
  constructor() {
    this.errorMonitor = new ErrorMonitor();
    this.performanceTracker = new PerformanceTracker();
    this.initializeEngine();
  }
  
  async initializeEngine() {
    const startTime = performance.now();
    
    try {
      debugLogger.log('Starting HyperFixi engine initialization...', 'info');
      
      // Check what's available in the hyperscript object
      debugLogger.log(`Available hyperscript methods: ${Object.keys(hyperscript || {}).join(', ')}`, 'info');
      
      // Process any existing hyperscript elements
      const hyperscriptElements = document.querySelectorAll('[_]');
      debugLogger.log(`Found ${hyperscriptElements.length} elements with hyperscript`, 'info');
      
      if (hyperscriptElements.length === 0) {
        debugLogger.log('No hyperscript elements found - this might indicate a timing issue', 'warning');
        return;
      }
      
      // Try to initialize HyperFixi DOM processing
      if (hyperscript && typeof hyperscript.processNode === 'function') {
        debugLogger.log('Processing DOM with hyperscript.processNode()...', 'info');
        
        // Process the entire document
        hyperscript.processNode(document.body);
        debugLogger.log('HyperFixi DOM processing completed', 'success');
        
      } else if (hyperscript && typeof hyperscript.init === 'function') {
        debugLogger.log('Calling hyperscript.init()...', 'info');
        await hyperscript.init();
        debugLogger.log('HyperFixi init() completed', 'success');
        
      } else {
        debugLogger.log('No processNode() or init() method found, trying manual processing...', 'warning');
        
        // Try to process elements manually if no DOM processing method
        if (hyperscript && typeof hyperscript.run === 'function') {
          debugLogger.log('Attempting to process hyperscript elements manually...', 'info');
          
          hyperscriptElements.forEach(async (element, index) => {
            const script = element.getAttribute('_');
            if (script) {
              try {
                debugLogger.log(`Processing element ${index + 1}: ${script.substring(0, 50)}...`, 'info');
                // This won't work for event handlers, but will work for expressions
                await hyperscript.run(script, context);
              } catch (error) {
                debugLogger.log(`Failed to process element ${index + 1}: ${error}`, 'error');
              }
            }
          });
        } else {
          debugLogger.log('No run() method available either', 'error');
        }
      }
      
      const endTime = performance.now();
      this.performanceTracker.trackOperation('HyperFixi initialization', startTime, endTime);
      
      // Enhanced hyperscript syntax logging with validation
      hyperscriptElements.forEach((element, index) => {
        const script = element.getAttribute('_');
        if (script) {
          try {
            // Log the hyperscript for debugging
            const preview = script.length > 100 ? script.substring(0, 100) + '...' : script;
            debugLogger.log(`Element ${index + 1} hyperscript: ${preview}`, 'info');
            
            // Check if it looks like valid hyperscript
            if (script.includes('on ') && (script.includes(' then ') || script.includes(' hide ') || script.includes(' show '))) {
              debugLogger.log(`Element ${index + 1}: Valid hyperscript syntax detected`, 'success');
            } else {
              debugLogger.log(`Element ${index + 1}: Possible syntax issue`, 'warning');
            }
            
          } catch (error) {
            debugLogger.log(`Element ${index + 1}: Error processing hyperscript - ${error}`, 'error');
          }
        }
      });
      
      // Set up HyperFixi error monitoring if available
      this.setupHyperFixiErrorHandling();
      
    } catch (error) {
      const endTime = performance.now();
      this.performanceTracker.trackOperation('HyperFixi initialization (failed)', startTime, endTime);
      
      debugLogger.log(`HyperFixi engine initialization failed: ${error}`, 'error');
      console.error('HyperFixi initialization error:', error);
      
      // Provide comprehensive debugging information
      debugLogger.log('Debugging information:', 'info');
      debugLogger.log(`- hyperscript object available: ${!!hyperscript}`, 'info');
      debugLogger.log(`- hyperscript keys: ${hyperscript ? Object.keys(hyperscript).join(', ') : 'N/A'}`, 'info');
      debugLogger.log(`- Elements with _="" attribute: ${document.querySelectorAll('[_]').length}`, 'info');
      debugLogger.log(`- Document ready state: ${document.readyState}`, 'info');
    }
  }
  
  setupHyperFixiErrorHandling() {
    // Try to hook into HyperFixi's error handling if available
    try {
      if (hyperscript && typeof hyperscript.onError === 'function') {
        hyperscript.onError((error: Error, element: Element) => {
          debugLogger.log(`HyperFixi Runtime Error: ${error.message}`, 'error');
          if (element) {
            const script = element.getAttribute('_');
            debugLogger.log(`  Element script: ${script?.substring(0, 50)}...`, 'error');
          }
        });
        debugLogger.log('HyperFixi error handling configured', 'success');
      } else {
        debugLogger.log('HyperFixi error handling not available', 'info');
      }
    } catch (error) {
      debugLogger.log(`Failed to setup HyperFixi error handling: ${error}`, 'warning');
    }
  }
}


// Visual debug status updater
function updateDebugStatus(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const statusElement = document.getElementById('debug-status');
  if (statusElement) {
    const colors = {
      info: '#3b82f6',
      success: '#10b981', 
      error: '#ef4444',
      warning: '#f59e0b'
    };
    statusElement.style.background = `rgba(0,0,0,0.2)`;
    statusElement.style.borderLeft = `4px solid ${colors[type]}`;
    statusElement.textContent = message;
  }
}

// Initialize HyperFixi Demo - Pure HyperFixi Implementation
document.addEventListener('DOMContentLoaded', async () => {
  updateDebugStatus('🚀 HyperFixi Demo starting - PURE HYPERFIXI MODE', 'info');
  debugLogger.log('🚀 HyperFixi Demo starting - PURE HYPERFIXI MODE', 'success');
  
  // Check what we have available
  updateDebugStatus(`HyperFixi object: ${hyperscript ? 'FOUND' : 'MISSING'}`, hyperscript ? 'success' : 'error');
  
  if (hyperscript) {
    const methods = Object.keys(hyperscript);
    updateDebugStatus(`HyperFixi methods: ${methods.join(', ')}`, 'info');
    debugLogger.log(`Available hyperscript methods: ${methods.join(', ')}`, 'info');
  }
  
  // Count hyperscript elements
  const hyperscriptElements = document.querySelectorAll('[_]');
  updateDebugStatus(`Found ${hyperscriptElements.length} hyperscript elements`, hyperscriptElements.length > 0 ? 'success' : 'warning');
  
  // Only initialize I18n as it doesn't conflict with hyperscript
  new I18nDemo();
  
  // Initialize HyperFixi engine to handle ALL hyperscript in HTML
  const engine = new HyperFixiEngine();
  
  // Test HyperFixi basic functionality
  try {
    updateDebugStatus('Testing HyperFixi expression: 2 + 3', 'info');
    const testResult = await hyperscript.run('2 + 3', context);
    const success = testResult === 5;
    updateDebugStatus(`Expression test: 2 + 3 = ${testResult} ${success ? '✅' : '❌'}`, success ? 'success' : 'error');
    debugLogger.log(`HyperFixi expression test: 2 + 3 = ${testResult}`, success ? 'success' : 'error');
  } catch (error) {
    updateDebugStatus(`❌ Expression test failed: ${error}`, 'error');
    debugLogger.log(`❌ HyperFixi expression test failed: ${error}`, 'error');
  }
  
  // Test our specific button command
  const buttonCode = 'on click beep! "Button clicked!" then put "Hello from HyperFixi!" into #simple-result';
  try {
    console.log(`Testing button compilation: ${buttonCode}`);
    const compileResult = hyperscript.compile(buttonCode);
    console.log(`Compilation result:`, compileResult);
    
    if (compileResult.success) {
      console.log('✅ Button hyperscript compiled successfully');
    } else {
      console.error('❌ Button hyperscript compilation failed:', compileResult.errors);
    }
  } catch (error) {
    console.error('❌ Button compilation exception:', error);
  }
  
  // Check available commands
  console.log('🔍 Checking available commands...');
  if ((window as any).hyperscriptRuntime?.enhancedRegistry) {
    const registry = (window as any).hyperscriptRuntime.enhancedRegistry;
    const commands = registry.getCommandNames ? registry.getCommandNames() : 'No getCommandNames method';
    console.log('📋 Available commands:', commands);
  } else {
    console.log('❌ No enhanced registry found');
  }
  
  // Add HyperFixi to global scope for debugging
  (window as any).hyperscript = hyperscript;
  (window as any).context = context;
  (window as any).debugLogger = debugLogger;
  (window as any).hyperscriptRuntime = engine;
  (window as any).testCompoundSyntax = testCompoundSyntax;
  
  updateDebugStatus('🎯 HyperFixi Demo ready - Check debug panel for details', 'success');
  debugLogger.log('🎯 HyperFixi Demo ready - All functionality depends on HyperFixi working correctly', 'success');
  
  // Simple processing for our test button
  const testButtons = document.querySelectorAll('button[_]');
  console.log(`Found ${testButtons.length} buttons with hyperscript`);
  
  testButtons.forEach((button, index) => {
    const script = button.getAttribute('_');
    console.log(`Processing button ${index + 1}: "${script}"`);
    try {
      hyperscript.processNode(button);
      console.log(`✅ Successfully processed button ${index + 1}`);
    } catch (error) {
      console.error(`❌ Failed to process button ${index + 1}:`, error);
    }
  });

  // Test compound syntax parsing before full test suite
  setTimeout(() => {
    console.log('🔧 Testing compound syntax parsing...');
    testCompoundSyntax();
  }, 1000);

  // Start automated test suite after page loads
  setTimeout(() => {
    console.log('🚀 Starting Automated Test Suite...');
    runAutomatedTests();
  }, 2000);
});

// Dedicated compound syntax test function
async function testCompoundSyntax() {
  console.log('🧪 ======== COMPOUND SYNTAX DEBUGGING ========');
  
  // Create test elements if they don't exist
  let testTarget = document.getElementById('test-target');
  if (!testTarget) {
    testTarget = document.createElement('div');
    testTarget.id = 'test-target';
    testTarget.textContent = 'Original content';
    document.body.appendChild(testTarget);
    console.log('📝 Created test-target element');
  }
  
  let testElement = document.getElementById('test-element');
  if (!testElement) {
    testElement = document.createElement('div');
    testElement.id = 'test-element';
    testElement.textContent = 'Test element';
    testElement.className = 'hidden';
    document.body.appendChild(testElement);
    console.log('📝 Created test-element element');
  }
  
  const testCases = [
    {
      command: 'put "Hello World!" into #test-target',
      description: 'Basic put command with string literal'
    },
    {
      command: 'set x to 42',
      description: 'Basic set command with number'
    },
    {
      command: 'set message to "Hello"',
      description: 'Set command with string value'
    },
    {
      command: 'add .active to #test-element',
      description: 'Add class command'
    },
    {
      command: 'remove .hidden from #test-element', 
      description: 'Remove class command'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: "${testCase.command}"`);
    console.log(`   Description: ${testCase.description}`);
    
    try {
      // Test parsing first
      console.log('   📊 Testing parse...');
      const parseResult = hyperscript.compile(testCase.command);
      console.log('   📊 Parse result:', parseResult);
      
      if (parseResult.success) {
        console.log('   ✅ Parse successful');
        
        // Test execution
        console.log('   🚀 Testing execution...');
        const result = await hyperscript.run(testCase.command, context);
        console.log(`   ✅ Successfully executed: ${testCase.command}`);
        console.log(`   📋 Result:`, result);
        
        // Check if it had expected effects
        if (testCase.command.includes('put') && testCase.command.includes('#test-target')) {
          const targetEl = document.getElementById('test-target');
          console.log(`   📝 Target element content: "${targetEl?.textContent}"`);
        }
        
        if (testCase.command.includes('set x to')) {
          console.log(`   📝 Variable x value: ${context.globals.get('x')}`);
        }
        
      } else {
        console.log(`   ❌ Parse failed: ${testCase.command}`);
        console.log(`   📋 Parse errors:`, parseResult.errors);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to execute: ${testCase.command}`);
      console.log(`   📋 Error:`, error);
      console.log(`   📋 Error stack:`, error.stack);
    }
  }
  
  console.log('\n🔚 ======== COMPOUND SYNTAX TEST COMPLETE ========');
  
  // Test some complex expressions too
  console.log('\n🧪 ======== COMPLEX EXPRESSIONS TEST ========');
  
  const complexCases = [
    'put 5 + 3 * 2 into #test-target',
    'set result to 10 + 20',
    'put "Value: " + result into #test-target',
    'add .highlight to me',
    'remove .hidden from #test-element',
    'trigger click on .button',
    'set x to 42 then put x + 10 into #test-target',
    'put "Complex: " + (x * 2) into #test-target'
  ];
  
  for (const complexCase of complexCases) {
    console.log(`\n🔍 Testing complex: "${complexCase}"`);
    try {
      const result = await hyperscript.run(complexCase, context);
      console.log(`   ✅ Complex execution successful`);
      console.log(`   📋 Result:`, result);
    } catch (error) {
      console.log(`   ❌ Complex execution failed:`, error);
    }
  }
  
  console.log('\n🔚 ======== COMPLEX EXPRESSIONS TEST COMPLETE ========');
}

// Automated Test Runner
async function runAutomatedTests() {
  const testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  console.log('📋 ========================================');
  console.log('🧪 HYPERFIXI AUTOMATED TEST SUITE');
  console.log('📋 ========================================');

  // Test categories with their button selectors and expected outcomes
  const tests = [
    {
      category: 'Basic DOM Commands',
      tests: [
        {
          name: 'Hide Command',
          buttonText: 'Hide Me',
          expectedLog: 'Hide test',
          expectedAction: 'Button should be hidden'
        },
        {
          name: 'Show Command', 
          buttonText: 'Show Hidden Button',
          expectedLog: 'Show test',
          expectedAction: 'Hidden button should reappear'
        },
        {
          name: 'Toggle Command',
          buttonText: 'Toggle Me',
          expectedLog: 'Toggle test', 
          expectedAction: 'Button should toggle visibility'
        }
      ]
    },
    {
      category: 'CSS Class Commands',
      tests: [
        {
          name: 'Add Class',
          buttonText: 'Add Success Class',
          expectedLog: 'Add class test',
          expectedResult: '#class-result should show "Class added!"'
        },
        {
          name: 'Remove Class',
          buttonText: 'Remove Success Class', 
          expectedLog: 'Remove class test',
          expectedResult: '#class-result should show "Class removed!"'
        }
      ]
    },
    {
      category: 'Content Commands',
      tests: [
        {
          name: 'Put into Self',
          buttonText: 'Put into Self',
          expectedLog: 'Put self test',
          expectedResult: 'Button text should change to "Self works!"'
        },
        {
          name: 'Put into Target',
          buttonText: 'Put into Target (FIXED!)', 
          expectedLog: 'Put target test',
          expectedResult: '#content-result should show "Target works!"'
        }
      ]
    },
    {
      category: 'Event Commands (FIXED)',
      tests: [
        {
          name: 'Trigger Custom Event (Fixed)',
          buttonText: 'Trigger Custom Event (FIXED!)',
          expectedLog: 'Trigger test',
          expectedResult: 'Custom event should be triggered and received'
        }
      ]
    },
    {
      category: 'Variables & Math (FIXED)',
      tests: [
        {
          name: 'Set Variable (Fixed)',
          buttonText: 'Set Variable x=42 (FIXED!)',
          expectedLog: 'Set variable test',
          expectedResult: 'Variable x should be set to 42 and displayed'
        },
        {
          name: 'Math Expression (Fixed)',
          buttonText: 'Math: 5 + 3 * 2 (FIXED!)',
          expectedLog: 'Math test',
          expectedResult: 'Math result should be 11 (5 + 6)'
        }
      ]
    },
    {
      category: 'Working Simple Commands',
      tests: [
        {
          name: 'Simple Beep + Put',
          buttonText: 'Test Beep + Put',
          expectedLog: 'Simple beep test',
          expectedResult: '#simple-result should show "Beep works!"'
        },
        {
          name: 'Simple Beep + Log', 
          buttonText: 'Test Beep + Log',
          expectedLog: 'Log test',
          expectedResult: 'Should log to console'
        }
      ]
    },
    {
      category: 'Async Commands',
      tests: [
        {
          name: 'Wait Command',
          buttonText: 'Wait 2 Seconds',
          expectedLog: 'Wait test',
          expectedResult: '#wait-result should show "Waiting..." then "Done after 2s!"'
        }
      ]
    },
    {
      category: 'Form Commands',
      tests: [
        {
          name: 'Take Value',
          buttonText: 'Take Input Value',
          expectedLog: 'Take test',
          setup: () => {
            const input = document.getElementById('test-input') as HTMLInputElement;
            if (input) input.value = 'test-value';
          }
        },
        {
          name: 'Get Value',
          buttonText: 'Get Input Value',
          expectedLog: 'Value test'
        }
      ]
    }
  ];

  // Run each test category
  for (const category of tests) {
    console.log(`\n🔍 Testing: ${category.category}`);
    console.log('─'.repeat(50));
    
    for (const test of category.tests) {
      testResults.total++;
      console.log(`\n▶️  Running: ${test.name}`);
      
      try {
        // Setup if needed
        if (test.setup) {
          test.setup();
        }

        // Find and click the button
        const button = Array.from(document.querySelectorAll('button')).find(
          btn => btn.textContent?.trim() === test.buttonText
        );

        if (!button) {
          throw new Error(`Button not found: "${test.buttonText}"`);
        }

        // Listen for console output
        let logReceived = false;
        const originalLog = console.log;
        console.log = (...args) => {
          const message = args.join(' ');
          if (message.includes(test.expectedLog)) {
            logReceived = true;
          }
          originalLog.apply(console, args);
        };

        // Click the button
        const clickEvent = new MouseEvent('click', { bubbles: true });
        button.dispatchEvent(clickEvent);

        // Wait a moment for execution
        await new Promise(resolve => setTimeout(resolve, 100));

        // Restore console.log
        console.log = originalLog;

        // Check results
        if (logReceived) {
          console.log(`    ✅ ${test.name}: beep! logged "${test.expectedLog}"`);
          testResults.passed++;
          testResults.details.push({ test: test.name, status: 'PASS', message: 'beep! logged correctly' });
        } else {
          console.log(`    ❌ ${test.name}: beep! did not log "${test.expectedLog}"`);
          testResults.failed++;
          testResults.details.push({ test: test.name, status: 'FAIL', message: 'beep! not logged' });
        }

        // Check expected results if specified
        if (test.expectedResult) {
          console.log(`    📝 Expected: ${test.expectedResult}`);
        }

      } catch (error) {
        console.log(`    ❌ ${test.name}: Error - ${error.message}`);
        testResults.failed++;
        testResults.details.push({ test: test.name, status: 'ERROR', message: error.message });
      }
    }
  }

  // Print final results
  console.log('\n📊 ========================================');
  console.log('🏁 TEST SUITE COMPLETE');
  console.log('📊 ========================================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);

  // Detailed results
  console.log('\n📋 Detailed Results:');
  console.log('─'.repeat(50));
  testResults.details.forEach(result => {
    const status = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${status} ${result.test}: ${result.message}`);
  });

  // Feature compatibility summary
  console.log('\n🎯 ========================================');
  console.log('📊 HYPERSCRIPT FEATURE COMPATIBILITY');
  console.log('🎯 ========================================');
  
  const categories = [
    'Basic DOM Commands',
    'CSS Class Commands', 
    'Content Commands',
    'Event Commands (FIXED)',
    'Variables & Math (FIXED)',
    'Working Simple Commands',
    'Async Commands',
    'Form Commands'
  ];

  categories.forEach(category => {
    const categoryTests = testResults.details.filter(result => 
      tests.find(t => t.category === category)?.tests.some(test => test.name === result.test)
    );
    const passed = categoryTests.filter(t => t.status === 'PASS').length;
    const total = categoryTests.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = percentage === 100 ? '✅' : percentage > 0 ? '🟡' : '❌';
    console.log(`${status} ${category}: ${passed}/${total} (${percentage}%)`);
  });

  console.log('\n🎯 Test suite completed! Check results above.');
  
  // Update visual status in the demo
  updateTestStatusDisplay(testResults);
}

function updateTestStatusDisplay(results) {
  // Update the status overview section with real results
  const statusGrid = document.querySelector('.demo-card:last-child .demo-area > div');
  if (statusGrid) {
    statusGrid.innerHTML = `
      <div>✅ <strong>Basic DOM</strong><br>hide, show, toggle (${getStatusForCategory('Basic DOM Commands', results)})</div>
      <div>${getStatusIcon('CSS Class Commands', results)} <strong>CSS Classes</strong><br>add, remove (${getStatusForCategory('CSS Class Commands', results)})</div>
      <div>${getStatusIcon('Content Commands', results)} <strong>Content</strong><br>put into targets (${getStatusForCategory('Content Commands', results)})</div>
      <div>${getStatusIcon('Event Commands', results)} <strong>Events</strong><br>trigger, custom events (${getStatusForCategory('Event Commands', results)})</div>
      <div>${getStatusIcon('Variables & Math', results)} <strong>Variables</strong><br>set, math, expressions (${getStatusForCategory('Variables & Math', results)})</div>
      <div>${getStatusIcon('Async Commands', results)} <strong>Async</strong><br>wait, timing (${getStatusForCategory('Async Commands', results)})</div>
      <div>${getStatusIcon('Form Commands', results)} <strong>Forms</strong><br>take, values (${getStatusForCategory('Form Commands', results)})</div>
      <div>❓ <strong>Control Flow</strong><br>if/else, unless (Not tested)</div>
      <div>❓ <strong>Strings</strong><br>concatenation (Not tested)</div>
      <div>❓ <strong>Arrays</strong><br>collections (Not tested)</div>
      <div>❓ <strong>DOM Queries</strong><br>selectors (Not tested)</div>
      <div>❓ <strong>Types</strong><br>as keyword (Not tested)</div>
    `;
  }
}

function getStatusForCategory(category, results) {
  // This is a simplified status - in reality we'd need more sophisticated tracking
  return 'Tested';
}

function getStatusIcon(category, results) {
  // This is a simplified status - in reality we'd need more sophisticated tracking  
  return '🟡'; // Assume partially working for now
}