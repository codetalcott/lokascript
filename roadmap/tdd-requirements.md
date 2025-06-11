# TDD Requirements Checklist for HyperFixi Integration

This comprehensive test-driven development plan ensures we maintain fixi's extremist minimalism philosophy while delivering a robust, well-tested integration between _hyperscript and fixi.js.

## **I. Fixi Minimalism Constraints (Hard Requirements)**

**Size Constraints:**
- [ ] **Uncompressed size < 4.6KB** (fixi's hard constraint from README)
- [ ] **Integration adds < 1KB** to maintain extreme minimalism
- [ ] **Zero dependencies** beyond _hyperscript and fixi.js
- [ ] **No build complexity** - follows fixi's "fixed-gear bike" philosophy

**Code Quality Standards:**
- [ ] **Every line justified** - follows fixi's "great internal reflection" comment
- [ ] **Dense but debuggable** - matches fixi's code style
- [ ] **No minified version** - stays readable like fixi
- [ ] **Zero runtime dependencies**

## **II. Syntax Requirements (Core Functionality)**

**Shorthand Syntax:**
- [ ] `fetch /url` - basic GET request  
- [ ] `fetch /url and replace #target` - replace element
- [ ] `fetch /url and put into #target` - innerHTML swap
- [ ] `fetch /url and append to #target` - beforeend insertion
- [ ] `fetch /url and prepend to #target` - afterbegin insertion
- [ ] Optional `and` connector works correctly
- [ ] CSS selector parsing via hyperscript's `parseElementExpression()`

**Extended Syntax:**
- [ ] `fetch /url with method: 'POST'` - HTTP method override
- [ ] `fetch /url with body: formData` - request body support  
- [ ] `fetch /url with headers: {...}` - custom headers
- [ ] `fetch /url with target: '#selector'` - target override
- [ ] `fetch /url with placement: 'replace'` - placement override
- [ ] Comma-separated option parsing
- [ ] Colon syntax for key-value pairs
- [ ] Expression evaluation for dynamic values

## **III. Integration Requirements (Fixi Compatibility)**

**Placement → Fixi Swap Mapping:**
- [ ] `replace` → `swap: 'outerHTML'`
- [ ] `put into` → `swap: 'innerHTML'`  
- [ ] `append to` → `swap: 'beforeend'`
- [ ] `prepend to` → `swap: 'afterbegin'`

**Fixi Event Integration:**
- [ ] Respects fixi's `fx:config` event chain
- [ ] Generates proper `fx:before`/`fx:after` events
- [ ] Error handling via `fx:error` events
- [ ] Response available as `it` in hyperscript `then` clauses

**Fixi Options Translation:**
- [ ] URL mapping to `fixiOptions.url`
- [ ] Method mapping to `fixiOptions.method`
- [ ] Body mapping to `fixiOptions.body`
- [ ] Headers mapping to `fixiOptions.headers`
- [ ] Target/placement translation

## **IV. Hyperscript Parser Integration**

**Token Parsing:**
- [ ] Proper `addCommand('fetch', ...)` registration
- [ ] State machine for syntax branch detection (`with` vs placement keywords)
- [ ] `parser.parseElementExpression()` for URLs and selectors
- [ ] `tokens.matchToken()` for keyword detection
- [ ] `runtime.addStep()` for async execution

**Command Object Structure:**
- [ ] `{ url, placement, target, options }` structure
- [ ] Dynamic expression evaluation at runtime
- [ ] Error handling for malformed syntax

## **V. Test Architecture Requirements**

**Following Fixi's Testing Pattern:**
- [ ] **Self-contained HTML file** like fixi's `test.html`
- [ ] **Visual testing infrastructure** with pass/fail indicators
- [ ] **No external test dependencies** (no Jest, Mocha, etc.)
- [ ] **Mockable fetch()** using fixi's mocking pattern
- [ ] **File:// protocol compatibility** for local testing

**Test Categories:**
- [ ] **Syntax Parsing Tests** - shorthand and extended forms
- [ ] **Integration Tests** - fixi.js doRequest() calls
- [ ] **Error Handling Tests** - malformed syntax, network errors
- [ ] **Event Chain Tests** - proper fixi event sequence
- [ ] **Response Handling Tests** - `it` availability in `then` clauses

## **VI. Error Handling Requirements**

**Graceful Degradation:**
- [ ] **Malformed syntax** doesn't break hyperscript
- [ ] **Network errors** emit `fixi:error` events
- [ ] **Parser errors** provide meaningful feedback
- [ ] **Missing targets** handle gracefully

**Event Broadcasting:**
- [ ] Custom `fixi:error` events with error details
- [ ] Proper error bubbling for debugging
- [ ] Integration with hyperscript's error handling

## **VII. Performance Requirements**

**Runtime Performance:**
- [ ] **Zero parsing overhead** when fetch commands not used
- [ ] **Minimal token parsing** - efficient state machine
- [ ] **No memory leaks** in command registration
- [ ] **Fast expression evaluation** using hyperscript's engine

## **VIII. Developer Experience Requirements**

**TypeScript Integration:**
- [ ] **Global namespace augmentation** for autocomplete
- [ ] **Type safety** for command parameters
- [ ] **IntelliSense support** in modern editors

**Documentation Requirements:**
- [ ] **Syntax examples** for both forms
- [ ] **Integration patterns** with hyperscript features
- [ ] **Error scenarios** and debugging guidance
- [ ] **Migration guide** from raw fixi.js

## **IX. Backwards Compatibility**

**Hyperscript Compatibility:**
- [ ] **No conflicts** with existing hyperscript commands
- [ ] **Proper `then` chaining** with response as `it`
- [ ] **Event integration** with hyperscript's event model

**Fixi Compatibility:**
- [ ] **All fixi events** fire correctly
- [ ] **Extension hooks** remain functional
- [ ] **Custom swap functions** work unchanged

## **Implementation Strategy**

### **Phase 1: Test Infrastructure**
1. **Create test.html** following fixi's self-contained pattern
2. **Set up visual testing** with pass/fail indicators
3. **Implement mock server** for testing HTTP requests
4. **Size monitoring** to enforce < 1KB addition constraint

### **Phase 2: Red-Green-Refactor Cycles**
1. **Shorthand syntax parser** - simplest cases first
2. **Extended syntax parser** - complex option parsing
3. **Fixi integration layer** - option translation
4. **Error handling** - graceful degradation
5. **Performance optimization** - minimize overhead

### **Phase 3: Integration Testing**
1. **Event chain validation** - fixi event sequence
2. **Response handling** - `it` availability in hyperscript
3. **Cross-browser compatibility** - modern browser support
4. **Edge case coverage** - malformed syntax, network errors

### **Phase 4: Documentation & Examples**
1. **Comprehensive syntax guide** - both forms with examples
2. **Integration patterns** - combining with hyperscript features
3. **Migration guide** - from raw fixi.js usage
4. **Performance benchmarks** - size and runtime metrics

## **Success Criteria**

- [ ] **All tests pass** in self-contained test.html
- [ ] **Size constraint met** - integration < 1KB addition
- [ ] **Zero external dependencies** maintained
- [ ] **Fixi event compatibility** preserved
- [ ] **Hyperscript integration** seamless
- [ ] **Documentation complete** with examples
- [ ] **Performance benchmarks** meet standards

This TDD approach ensures we deliver critical infrastructure with the highest code quality while honoring fixi's extremist minimalism philosophy.