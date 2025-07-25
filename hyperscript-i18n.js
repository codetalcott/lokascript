// hyperscript-i18n.js - Internationalization plugin for hyperscript

class HyperscriptI18n {
  constructor(locale = 'en') {
    this.locale = locale;
    this.dictionaries = {
      es: {
        // Commands
        'en': 'on',
        'decir': 'tell', 
        'tomar': 'take',
        'poner': 'put',
        'establecer': 'set',
        'si': 'if',
        'repetir': 'repeat',
        'para': 'for',
        'esperar': 'wait',
        'enviar': 'send',
        'disparar': 'trigger',
        'lanzar': 'throw',
        'registrar': 'log',
        'llamar': 'call',
        'obtener': 'get',
        'buscar': 'fetch',
        'ir': 'go',
        'agregar': 'add',
        'quitar': 'remove',
        'alternar': 'toggle',
        'ocultar': 'hide',
        'mostrar': 'show',
        'hacer': 'make',
        
        // Events
        'clic': 'click',
        'cambio': 'change',
        'ratón_encima': 'mouseover',
        'ratón_fuera': 'mouseout',
        
        // Modifiers
        'a': 'to',
        'de': 'from',
        'en': 'into',
        'antes': 'before',
        'después': 'after',
        'con': 'with',
        
        // Control flow
        'entonces': 'then',
        'sino': 'else',
        'cuando': 'when',
        'fin': 'end',
        'retornar': 'return',
        
        // Logical
        'y': 'and',
        'o': 'or',
        'no': 'not',
        'es': 'is',
        'existe': 'exists',
        
        // Temporal
        'segundos': 'seconds',
        'milisegundos': 'milliseconds',
        'minutos': 'minutes',
        
        // Values
        'verdadero': 'true',
        'falso': 'false',
        'nulo': 'null',
        'yo': 'me',
        'elemento': 'element'
      },
      
      ko: {
        // Korean translations
        '클릭': 'click',
        '대기': 'wait',
        '초': 'seconds',
        '만약': 'if',
        '아니면': 'else',
        '그리고': 'and',
        '또는': 'or',
        '참': 'true',
        '거짓': 'false'
      },
      
      zh: {
        // Simplified Chinese
        '点击': 'click',
        '等待': 'wait',
        '秒': 'seconds',
        '如果': 'if',
        '否则': 'else',
        '和': 'and',
        '或': 'or',
        '真': 'true',
        '假': 'false'
      }
    };
  }
  
  translate(source) {
    const dictionary = this.dictionaries[this.locale];
    if (!dictionary) return source;
    
    // Create regex pattern from dictionary keys
    const pattern = new RegExp(
      '\\b(' + Object.keys(dictionary).join('|') + ')\\b',
      'gi'
    );
    
    return source.replace(pattern, (match) => {
      return dictionary[match.toLowerCase()] || match;
    });
  }
  
  // Plugin installation method for hyperscript
  install(_hyperscript) {
    const original_processNode = _hyperscript.internals.runtime.processNode;
    const translator = this;
    
    _hyperscript.internals.runtime.processNode = function(node) {
      // Intercept and translate attribute values
      const attributes = _hyperscript.config.attributes.split(',').map(s => s.trim());
      
      attributes.forEach(attr => {
        if (node.hasAttribute(attr)) {
          const original = node.getAttribute(attr);
          const translated = translator.translate(original);
          if (original !== translated) {
            node.setAttribute(attr + '-original', original);
            node.setAttribute(attr, translated);
          }
        }
      });
      
      return original_processNode.call(this, node);
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HyperscriptI18n;
}
