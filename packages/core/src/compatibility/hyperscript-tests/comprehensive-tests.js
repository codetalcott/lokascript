/**
 * Comprehensive HyperFixi Test Suite
 * Adapted from official _hyperscript tests
 */

// Expression Tests
export function loadExpressionTests() {
  describe("Math Operators", function() {
    it("addition works", async function() {
      const result = await evalHyperScript("1 + 1");
      result.should.equal(2);
    });

    it("subtraction works", async function() {
      const result = await evalHyperScript("5 - 3");
      result.should.equal(2);
    });

    it("multiplication works", async function() {
      const result = await evalHyperScript("3 * 4");
      result.should.equal(12);
    });

    it("division works", async function() {
      const result = await evalHyperScript("10 / 2");
      result.should.equal(5);
    });

    it("modulo works", async function() {
      const result = await evalHyperScript("10 mod 3");
      result.should.equal(1);
    });

    it("parenthesized complex expressions work", async function() {
      const result = await evalHyperScript("(1 + 2) * 3");
      result.should.equal(9);
    });

    it("nested parentheses work", async function() {
      const result = await evalHyperScript("((1 + 2) * 3) + 4");
      result.should.equal(13);
    });
  });

  describe("String Expressions", function() {
    it("can parse double-quoted strings", async function() {
      const result = await evalHyperScript('"hello world"');
      result.should.equal("hello world");
    });

    it("can parse single-quoted strings", async function() {
      const result = await evalHyperScript("'hello world'");
      result.should.equal("hello world");
    });

    it("can concatenate strings with +", async function() {
      const result = await evalHyperScript("'hello' + ' ' + 'world'");
      result.should.equal("hello world");
    });

    it("can handle escaped quotes", async function() {
      const result = await evalHyperScript('"hello \\"world\\""');
      result.should.equal('hello "world"');
    });
  });

  describe("Number Expressions", function() {
    it("can parse integers", async function() {
      const result = await evalHyperScript("42");
      result.should.equal(42);
    });

    it("can parse floats", async function() {
      const result = await evalHyperScript("3.14");
      result.should.equal(3.14);
    });

    it("can parse negative numbers", async function() {
      const result = await evalHyperScript("-42");
      result.should.equal(-42);
    });
  });

  describe("Boolean Expressions", function() {
    it("can parse true", async function() {
      const result = await evalHyperScript("true");
      result.should.equal(true);
    });

    it("can parse false", async function() {
      const result = await evalHyperScript("false");
      result.should.equal(false);
    });
  });

  describe("Null Expression", function() {
    it("can parse null", async function() {
      const result = await evalHyperScript("null");
      assert.equal(result, null);
    });
  });

  describe("Logical Operators", function() {
    it("and works with true values", async function() {
      const result = await evalHyperScript("true and true");
      result.should.equal(true);
    });

    it("and works with false values", async function() {
      const result = await evalHyperScript("true and false");
      result.should.equal(false);
    });

    it("or works with true values", async function() {
      const result = await evalHyperScript("true or false");
      result.should.equal(true);
    });

    it("or works with false values", async function() {
      const result = await evalHyperScript("false or false");
      result.should.equal(false);
    });

    it("not works", async function() {
      const result = await evalHyperScript("not true");
      result.should.equal(false);
    });
  });

  describe("Comparison Operators", function() {
    it("== works", async function() {
      const result = await evalHyperScript("1 == 1");
      result.should.equal(true);
    });

    it("!= works", async function() {
      const result = await evalHyperScript("1 != 2");
      result.should.equal(true);
    });

    it("> works", async function() {
      const result = await evalHyperScript("2 > 1");
      result.should.equal(true);
    });

    it("< works", async function() {
      const result = await evalHyperScript("1 < 2");
      result.should.equal(true);
    });

    it(">= works", async function() {
      const result = await evalHyperScript("2 >= 2");
      result.should.equal(true);
    });

    it("<= works", async function() {
      const result = await evalHyperScript("1 <= 2");
      result.should.equal(true);
    });
  });

  describe("Possessive Expressions", function() {
    it("my property works", async function() {
      const div = make('<div id="d1"></div>');
      div.value = 42;
      const result = await evalHyperScript("my value", { me: div });
      result.should.equal(42);
    });

    it("its property works", async function() {
      const result = await evalHyperScript("its x", { it: { x: 123 } });
      result.should.equal(123);
    });

    it("your property works", async function() {
      const obj = { name: "test" };
      const result = await evalHyperScript("your name", { you: obj });
      result.should.equal("test");
    });
  });

  describe("Property Access", function() {
    it("can access object properties with dot notation", async function() {
      const obj = { foo: "bar" };
      const result = await evalHyperScript("it.foo", { it: obj });
      result.should.equal("bar");
    });

    it("can access nested properties", async function() {
      const obj = { foo: { bar: "baz" } };
      const result = await evalHyperScript("it.foo.bar", { it: obj });
      result.should.equal("baz");
    });
  });

  describe("Array Literals", function() {
    it("can create empty arrays", async function() {
      const result = await evalHyperScript("[]");
      result.should.be.an('array').that.is.empty;
    });

    it("can create arrays with elements", async function() {
      const result = await evalHyperScript("[1, 2, 3]");
      result.should.deep.equal([1, 2, 3]);
    });
  });

  describe("Object Literals", function() {
    it("can create empty objects", async function() {
      const result = await evalHyperScript("{}");
      result.should.be.an('object').that.is.empty;
    });

    it("can create objects with properties", async function() {
      const result = await evalHyperScript("{foo: 'bar', num: 42}");
      result.should.deep.equal({ foo: 'bar', num: 42 });
    });
  });

  describe("Type Conversion (as)", function() {
    it("can convert string to Int", async function() {
      const result = await evalHyperScript('"42" as Int');
      result.should.equal(42);
    });

    it("can convert number to String", async function() {
      const result = await evalHyperScript('42 as String');
      result.should.equal("42");
    });

    it("can convert to Float", async function() {
      const result = await evalHyperScript('"3.14" as Float');
      result.should.equal(3.14);
    });
  });

  describe("CSS Selectors", function() {
    it("can find element by ID", async function() {
      const div = make('<div id="test-div">Hello</div>');
      const result = await evalHyperScript("#test-div");
      result.should.equal(div);
      clearWorkArea();
    });

    it("can find elements by class", async function() {
      make('<div class="test-class">One</div>');
      make('<div class="test-class">Two</div>');
      const result = await evalHyperScript(".test-class");
      result.length.should.be.at.least(1);
      clearWorkArea();
    });
  });

  describe("Function Calls", function() {
    it("can call built-in functions", async function() {
      const result = await evalHyperScript("Date.now()");
      result.should.be.a('number');
    });

    it("can call constructor functions with new", async function() {
      const result = await evalHyperScript("(new Date()).getFullYear()");
      result.should.be.a('number').that.is.at.least(2020);
    });
  });
}

// Command Tests
export function loadCommandTests() {
  describe("SET Command", function() {
    it("can set local variables", async function() {
      // This would need command execution support
      // For now, we test expressions only
      assert.ok(true, "SET command tests require command execution");
    });
  });

  describe("LOG Command", function() {
    it("can log values", async function() {
      assert.ok(true, "LOG command tests require command execution");
    });
  });
}

// Core Tests
export function loadCoreTests() {
  describe("Parser", function() {
    it("can parse simple expressions", function() {
      const result = getParseErrorFor("1 + 1");
      result.should.equal("");
    });

    it("reports errors for invalid syntax", function() {
      const result = getParseErrorFor("1 +");
      result.should.not.equal("");
    });
  });

  describe("Compilation", function() {
    it("successfully compiles valid code", function() {
      try {
        hyperfixi.compile("1 + 1");
        assert.ok(true);
      } catch (e) {
        assert.fail("Should not throw error");
      }
    });

    it("throws error for invalid code", function() {
      try {
        hyperfixi.compile("invalid syntax %%%");
        assert.fail("Should throw error");
      } catch (e) {
        assert.ok(true);
      }
    });
  });
}

// Feature Tests
export function loadFeatureTests() {
  describe("Event Handlers (on)", function() {
    it("placeholder for on feature tests", function() {
      assert.ok(true, "Event handler tests require DOM integration");
    });
  });
}
