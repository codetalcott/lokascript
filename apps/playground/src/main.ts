import { hyperscript } from '../../../packages/core/src/index.ts';

// Initialize HyperFixi and set up the demo environment
const context = hyperscript.createContext();

// Add sample data to the context for demos
context.variables?.set('items', [1, 2, 2, 3, 4, 5]);
context.variables?.set('name', 'john doe');
context.variables?.set('users', [
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

// Navigation system for demo categories
class NavigationManager {
  private currentCategory = 'expressions';
  
  constructor() {
    this.initializeNavigation();
  }
  
  initializeNavigation() {
    // Global function for navigation (called by hyperscript in HTML)
    (window as any).showCategory = (categoryId: string) => {
      this.showCategory(categoryId);
    };
  }
  
  showCategory(categoryId: string) {
    // Hide all categories
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => cat.classList.remove('active'));
    
    // Show selected category
    const targetCategory = document.getElementById(categoryId);
    if (targetCategory) {
      targetCategory.classList.add('active');
      this.currentCategory = categoryId;
      debugLogger.log(`Switched to ${categoryId} category`, 'info');
    }
    
    // Update navigation buttons
    const navButtons = document.querySelectorAll('.nav-button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Find and activate the correct button
    const activeButton = Array.from(navButtons).find(btn => 
      btn.getAttribute('onclick')?.includes(categoryId) ||
      btn.textContent?.toLowerCase().includes(categoryId.replace('-', ' '))
    );
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
}

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
      
      // Check if hyperscript object has required methods
      if (!hyperscript || typeof hyperscript.init !== 'function') {
        throw new Error('HyperFixi hyperscript object is not properly initialized');
      }
      
      // Initialize HyperFixi to process all hyperscript in the DOM
      await hyperscript.init();
      
      const endTime = performance.now();
      this.performanceTracker.trackOperation('HyperFixi initialization', startTime, endTime);
      
      debugLogger.log('HyperFixi engine initialized successfully', 'success');
      
      // Process any existing hyperscript elements
      const hyperscriptElements = document.querySelectorAll('[_]');
      debugLogger.log(`Found ${hyperscriptElements.length} elements with hyperscript`, 'info');
      
      // Enhanced hyperscript syntax logging with validation
      hyperscriptElements.forEach((element, index) => {
        const script = element.getAttribute('_');
        if (script) {
          try {
            // Log the hyperscript for debugging
            const preview = script.length > 100 ? script.substring(0, 100) + '...' : script;
            debugLogger.log(`Element ${index + 1} hyperscript: ${preview}`, 'info');
            
            // Basic syntax validation
            if (script.includes('on ') && script.includes(' do')) {
              // Old-style hyperscript syntax detected
              debugLogger.log(`Element ${index + 1}: Legacy hyperscript syntax detected`, 'warning');
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
      
      // Provide helpful debugging information
      debugLogger.log('Debugging information:', 'info');
      debugLogger.log(`- hyperscript object available: ${!!hyperscript}`, 'info');
      debugLogger.log(`- hyperscript.init function: ${typeof hyperscript?.init}`, 'info');
      debugLogger.log(`- Elements with _="" attribute: ${document.querySelectorAll('[_]').length}`, 'info');
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

// Initialize HyperFixi Demo
document.addEventListener('DOMContentLoaded', async () => {
  debugLogger.log('🚀 HyperFixi Demo starting initialization', 'success');
  
  // Initialize core demo components that don't conflict with hyperscript
  new NavigationManager();
  new I18nDemo();
  
  // Initialize HyperFixi engine to handle all hyperscript in HTML
  const engine = new HyperFixiEngine();
  
  // Show welcome message
  debugLogger.log('HyperFixi Demo ready - all hyperscript will be handled by HyperFixi engine', 'success');
  
  // Add HyperFixi to global scope for debugging
  (window as any).hyperscript = hyperscript;
  (window as any).context = context;
  (window as any).debugLogger = debugLogger;
  
  console.log('🎯 HyperFixi Demo Environment Ready');
  console.log('Available globals: hyperscript, context, debugLogger');
  console.log('All DOM interactions handled by HyperFixi hyperscript engine');
  console.log('Try: hyperscript.run("5 + 3 * 2", context)');
});