// hyperscript-i18n-lsp.js - Language Server Protocol support for internationalized hyperscript

class HyperscriptI18nLSP {
  constructor(locale = 'en') {
    this.locale = locale;
    this.reverseDict = {};
    
    // Build reverse dictionary for autocomplete
    Object.entries(HyperscriptI18n.dictionaries[locale] || {}).forEach(([native, english]) => {
      this.reverseDict[english] = native;
    });
  }
  
  // Provide completions in the user's language
  getCompletions(context) {
    const { line, character } = context;
    const currentWord = this.getCurrentWord(line, character);
    
    // Get all possible completions
    const englishKeywords = [
      'on', 'click', 'toggle', 'wait', 'seconds', 'if', 'then', 'else',
      'add', 'remove', 'set', 'to', 'from', 'call', 'log', 'true', 'false'
    ];
    
    const completions = englishKeywords
      .filter(kw => kw.startsWith(currentWord) || (this.reverseDict[kw] || '').startsWith(currentWord))
      .map(kw => ({
        label: this.reverseDict[kw] || kw,
        detail: `hyperscript: ${kw}`,
        insertText: this.reverseDict[kw] || kw,
        documentation: this.getDocumentation(kw)
      }));
    
    return completions;
  }
  
  // Get hover information
  getHover(context) {
    const word = this.getWordAt(context);
    const englishEquivalent = HyperscriptI18n.dictionaries[this.locale]?.[word];
    
    if (englishEquivalent) {
      return {
        contents: {
          kind: 'markdown',
          value: `**${word}** → \`${englishEquivalent}\`\n\n${this.getDocumentation(englishEquivalent)}`
        }
      };
    }
    
    return null;
  }
  
  // Validate hyperscript code
  getDiagnostics(document) {
    const diagnostics = [];
    const lines = document.split('\n');
    const translator = new HyperscriptI18n(this.locale);
    
    lines.forEach((line, lineIndex) => {
      // Simple validation: check for unknown keywords
      const words = line.match(/\b\w+\b/g) || [];
      
      words.forEach(word => {
        const isKnownKeyword = HyperscriptI18n.dictionaries[this.locale]?.[word.toLowerCase()];
        const isEnglishKeyword = this.isEnglishKeyword(word);
        
        if (!isKnownKeyword && !isEnglishKeyword && this.looksLikeKeyword(word)) {
          diagnostics.push({
            range: {
              start: { line: lineIndex, character: line.indexOf(word) },
              end: { line: lineIndex, character: line.indexOf(word) + word.length }
            },
            message: `Unknown keyword: "${word}"`,
            severity: 2 // Warning
          });
        }
      });
    });
    
    return diagnostics;
  }
  
  // Helper methods
  getCurrentWord(line, position) {
    const beforeCursor = line.substring(0, position);
    const match = beforeCursor.match(/\b(\w+)$/);
    return match ? match[1] : '';
  }
  
  getWordAt(context) {
    // Implementation would extract word at cursor position
    return '';
  }
  
  isEnglishKeyword(word) {
    const keywords = ['on', 'click', 'toggle', 'wait', 'if', 'then', 'else'];
    return keywords.includes(word.toLowerCase());
  }
  
  looksLikeKeyword(word) {
    // Simple heuristic: lowercase words at start of line or after whitespace
    return /^[a-z]+$/.test(word);
  }
  
  getDocumentation(keyword) {
    const docs = {
      'on': 'Defines an event handler. Usage: `on <event> <action>`',
      'click': 'Mouse click event',
      'toggle': 'Toggles a class or attribute. Usage: `toggle .<class> [on <element>]`',
      'wait': 'Pauses execution. Usage: `wait <number> <unit>`',
      'if': 'Conditional execution. Usage: `if <condition> then <action> [else <action>] end`',
      'set': 'Sets a value. Usage: `set <target> to <value>`',
      'add': 'Adds a class or value. Usage: `add .<class> to <element>`',
      'remove': 'Removes a class or value. Usage: `remove .<class> from <element>`'
    };
    
    return docs[keyword] || `Hyperscript keyword: ${keyword}`;
  }
}

// VSCode extension integration example
class HyperscriptI18nExtension {
  activate(context) {
    const config = vscode.workspace.getConfiguration('hyperscript');
    const locale = config.get('locale', 'en');
    const lsp = new HyperscriptI18nLSP(locale);
    
    // Register completion provider
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', pattern: '**/*.html' },
        {
          provideCompletionItems(document, position) {
            const line = document.lineAt(position).text;
            return lsp.getCompletions({
              line: line,
              character: position.character
            });
          }
        }
      )
    );
    
    // Register hover provider
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(
        { scheme: 'file', pattern: '**/*.html' },
        {
          provideHover(document, position) {
            return lsp.getHover({
              document: document.getText(),
              position: position
            });
          }
        }
      )
    );
    
    // Register diagnostic provider
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('hyperscript');
    context.subscriptions.push(diagnosticCollection);
    
    // Update diagnostics on document change
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId === 'html') {
        const diagnostics = lsp.getDiagnostics(event.document.getText());
        diagnosticCollection.set(event.document.uri, diagnostics);
      }
    });
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HyperscriptI18nLSP, HyperscriptI18nExtension };
}
