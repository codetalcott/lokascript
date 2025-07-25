
// HyperFixi Enhanced Expressions Demo Bundle
// This is a simplified demo version for testing purposes

// Mock context for demo
const createMockContext = () => ({
    me: null,
    you: null,
    it: null,
    locals: new Map(),
    globals: new Map(),
    result: null,
    meta: {
        startTime: Date.now(),
        commandStack: [],
        debugMode: true
    }
});

// Enhanced Not Expression (Simplified for Demo)
class DemoNotExpression {
    constructor() {
        this.name = 'not';
        this.category = 'logical';
    }
    
    async evaluate(context, value) {
        // JavaScript truthiness evaluation
        const truthiness = this.evaluateTruthiness(value);
        return {
            success: true,
            value: !truthiness,
            type: 'boolean'
        };
    }
    
    evaluateTruthiness(value) {
        // JavaScript falsy values: false, 0, -0, 0n, "", null, undefined, NaN
        if (value === false) return false;
        if (value === 0 || Object.is(value, -0)) return false;
        if (value === 0n) return false;
        if (value === '') return false;
        if (value === null) return false;
        if (value === undefined) return false;
        if (typeof value === 'number' && isNaN(value)) return false;
        
        // Arrays and objects are always truthy in JavaScript
        return true;
    }
}

// Enhanced Some Expression (Simplified for Demo)
class DemoSomeExpression {
    constructor() {
        this.name = 'some';
        this.category = 'logical';
    }
    
    async evaluate(context, value) {
        const exists = await this.evaluateExistence(value, context);
        return {
            success: true,
            value: exists,
            type: 'boolean'
        };
    }
    
    async evaluateExistence(value, context) {
        // Handle null and undefined
        if (value === null || value === undefined) return false;
        
        // Handle arrays
        if (Array.isArray(value)) return value.length > 0;
        
        // Handle empty string
        if (value === '') return false;
        
        // Handle DOM selectors
        if (typeof value === 'string' && this.isDOMSelector(value)) {
            return this.evaluateDOMSelector(value);
        }
        
        // All other values exist
        return true;
    }
    
    isDOMSelector(value) {
        // Check for CSS selectors or HTML element names
        if (value.startsWith('.') || value.startsWith('#')) return true;
        if (value.startsWith('<') && value.endsWith('/>')) return true;
        
        const htmlElements = ['div', 'span', 'button', 'input', 'a', 'p', 'h1', 'h2', 'h3', 'img'];
        return htmlElements.includes(value.toLowerCase());
    }
    
    evaluateDOMSelector(selector) {
        try {
            let cssSelector = selector;
            
            // Convert hyperscript selector to CSS
            if (selector.startsWith('<') && selector.endsWith('/>')) {
                cssSelector = selector.slice(1, selector.length - 2);
            }
            
            const elements = document.querySelectorAll(cssSelector);
            return elements.length > 0;
        } catch {
            return false;
        }
    }
}

// Enhanced Possessive Expression (Simplified for Demo)  
class DemoPossessiveExpression {
    constructor() {
        this.name = 'possessive';
        this.category = 'object';
    }
    
    async evaluate(context, object, property) {
        const value = await this.accessProperty(object, property);
        return {
            success: true,
            value,
            type: this.inferValueType(value)
        };
    }
    
    async accessProperty(object, property) {
        if (object === null || object === undefined) return null;
        
        // Handle attribute access (@property)
        if (property.startsWith('@')) {
            const attrName = property.slice(1);
            return object.getAttribute ? object.getAttribute(attrName) : null;
        }
        
        // Handle style property access (*property)
        if (property.startsWith('*')) {
            const styleProp = property.slice(1);
            if (object.style) {
                return object.style[styleProp] || getComputedStyle(object)[styleProp] || null;
            }
            return null;
        }
        
        // Handle bracket notation ([@property])
        if (property.startsWith('[@') && property.endsWith(']')) {
            const attrName = property.slice(2, -1);
            return object.getAttribute ? object.getAttribute(attrName) : null;
        }
        
        // Regular property access
        return object[property] ?? null;
    }
    
    inferValueType(value) {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'string') return 'string';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Element) return 'element';
        if (typeof value === 'function') return 'function';
        return 'object';
    }
}

// Enhanced As Expression (Simplified for Demo)
class DemoAsExpression {
    constructor() {
        this.name = 'as';
        this.category = 'conversion';
    }
    
    async evaluate(context, value, targetType) {
        const convertedValue = this.convertValue(value, targetType);
        return {
            success: true,
            value: convertedValue,
            type: this.inferValueType(convertedValue)
        };
    }
    
    convertValue(value, targetType) {
        const type = targetType.toLowerCase();
        
        switch (type) {
            case 'string':
                return this.convertToString(value);
            case 'int':
            case 'integer':
                return this.convertToInteger(value);
            case 'number':
            case 'float':
                return this.convertToNumber(value);
            case 'boolean':
            case 'bool':
                return this.convertToBoolean(value);
            case 'array':
                return this.convertToArray(value);
            case 'json':
                return this.convertToJSON(value);
            default:
                if (type.startsWith('fixed')) {
                    return this.convertToFixed(value, targetType);
                }
                return value;
        }
    }
    
    convertToString(value) {
        if (value === null || value === undefined) return null;
        return String(value);
    }
    
    convertToNumber(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        }
        if (typeof value === 'boolean') return value ? 1 : 0;
        return null;
    }
    
    convertToInteger(value) {
        const num = this.convertToNumber(value);
        return num === null ? null : Math.trunc(num);
    }
    
    convertToBoolean(value) {
        if (value === null || value === undefined) return false;
        return Boolean(value);
    }
    
    convertToArray(value) {
        if (value === null || value === undefined) return [];
        if (Array.isArray(value)) return value;
        return [value];
    }
    
    convertToJSON(value) {
        try {
            return JSON.stringify(value);
        } catch {
            return null;
        }
    }
    
    convertToFixed(value, targetType) {
        const num = this.convertToNumber(value);
        if (num === null) return null;
        
        const match = targetType.match(/fixed:?(\d+)?/i);
        const precision = match && match[1] ? parseInt(match[1]) : 2;
        return num.toFixed(precision);
    }
    
    inferValueType(value) {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'boolean') return 'boolean';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'string') return 'string';
        if (Array.isArray(value)) return 'array';
        return 'object';
    }
}

// Export for demo
window.HyperFixiDemo = {
    NotExpression: DemoNotExpression,
    SomeExpression: DemoSomeExpression,
    PossessiveExpression: DemoPossessiveExpression,
    AsExpression: DemoAsExpression,
    createMockContext
};

console.log('🚀 HyperFixi Enhanced Expressions Demo Loaded!');
