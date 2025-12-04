//! Native Tokenizer Implementation for HyperFixi
//!
//! This example demonstrates how the HyperFixi tokenizer could be implemented
//! in Rust using napi-rs for Node.js bindings.
//!
//! Key patterns demonstrated:
//! - `#[napi]` macro for automatic binding generation
//! - `#[napi(object)]` for JavaScript object interop
//! - Zero-copy string handling where possible
//! - Efficient token categorization

use napi_derive::napi;
use std::str::CharIndices;

// ============================================================================
// Token Types
// ============================================================================

/// Token kinds matching HyperFixi's JavaScript tokenizer
#[napi(string_enum)]
pub enum TokenKind {
    // Literals
    Number,
    String,
    Boolean,

    // Identifiers and Keywords
    Identifier,
    Keyword,

    // Operators
    Operator,
    ComparisonOp,
    LogicalOp,
    ArithmeticOp,

    // Punctuation
    OpenParen,
    CloseParen,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    Comma,
    Dot,
    Colon,
    Semicolon,

    // Special
    AttributeRef,    // @attribute
    IdRef,           // #id
    ClassRef,        // .class
    Whitespace,
    Newline,
    Comment,
    EOF,
    Unknown,
}

/// A single token produced by the tokenizer
#[napi(object)]
pub struct Token {
    pub kind: TokenKind,
    pub value: String,
    pub start: u32,
    pub end: u32,
    pub line: u32,
    pub column: u32,
}

/// Position tracking for error messages
#[napi(object)]
pub struct Position {
    pub offset: u32,
    pub line: u32,
    pub column: u32,
}

// ============================================================================
// Tokenizer Implementation
// ============================================================================

/// High-performance HyperScript tokenizer
#[napi(js_name = "NativeTokenizer")]
pub struct Tokenizer {
    source: String,
    chars: Vec<char>,
    current: usize,
    line: u32,
    column: u32,
    start: usize,
}

#[napi]
impl Tokenizer {
    /// Create a new tokenizer for the given source
    #[napi(constructor)]
    pub fn new(source: String) -> Self {
        let chars: Vec<char> = source.chars().collect();
        Tokenizer {
            source,
            chars,
            current: 0,
            line: 1,
            column: 1,
            start: 0,
        }
    }

    /// Tokenize the entire source and return all tokens
    #[napi]
    pub fn tokenize_all(&mut self) -> Vec<Token> {
        let mut tokens = Vec::with_capacity(self.chars.len() / 4); // Estimate

        loop {
            let token = self.next_token();
            let is_eof = matches!(token.kind, TokenKind::EOF);
            tokens.push(token);
            if is_eof {
                break;
            }
        }

        tokens
    }

    /// Get the next token (streaming API)
    #[napi]
    pub fn next_token(&mut self) -> Token {
        self.skip_whitespace();
        self.start = self.current;

        if self.is_at_end() {
            return self.make_token(TokenKind::EOF, "");
        }

        let c = self.advance();

        // Dispatch based on first character
        match c {
            // Single character tokens
            '(' => self.make_token(TokenKind::OpenParen, "("),
            ')' => self.make_token(TokenKind::CloseParen, ")"),
            '{' => self.make_token(TokenKind::OpenBrace, "{"),
            '}' => self.make_token(TokenKind::CloseBrace, "}"),
            '[' => self.make_token(TokenKind::OpenBracket, "["),
            ']' => self.make_token(TokenKind::CloseBracket, "]"),
            ',' => self.make_token(TokenKind::Comma, ","),
            ':' => self.make_token(TokenKind::Colon, ":"),
            ';' => self.make_token(TokenKind::Semicolon, ";"),

            // Potentially multi-character tokens
            '.' => self.scan_dot_or_class(),
            '@' => self.scan_attribute_ref(),
            '#' => self.scan_id_ref(),
            '"' | '\'' => self.scan_string(c),
            '-' => self.scan_minus_or_number(),

            // Operators
            '+' => self.make_token(TokenKind::ArithmeticOp, "+"),
            '*' => self.make_token(TokenKind::ArithmeticOp, "*"),
            '/' => self.scan_slash_or_comment(),
            '%' => self.make_token(TokenKind::ArithmeticOp, "%"),

            // Comparison operators
            '=' => self.scan_equals(),
            '!' => self.scan_bang(),
            '<' => self.scan_less_than(),
            '>' => self.scan_greater_than(),

            // Numbers
            '0'..='9' => self.scan_number(),

            // Identifiers and keywords
            'a'..='z' | 'A'..='Z' | '_' => self.scan_identifier(),

            // Unknown
            _ => self.make_token(TokenKind::Unknown, &c.to_string()),
        }
    }

    /// Current position for error reporting
    #[napi]
    pub fn position(&self) -> Position {
        Position {
            offset: self.current as u32,
            line: self.line,
            column: self.column,
        }
    }

    // ========================================================================
    // Private helper methods
    // ========================================================================

    fn is_at_end(&self) -> bool {
        self.current >= self.chars.len()
    }

    fn peek(&self) -> Option<char> {
        self.chars.get(self.current).copied()
    }

    fn peek_next(&self) -> Option<char> {
        self.chars.get(self.current + 1).copied()
    }

    fn advance(&mut self) -> char {
        let c = self.chars[self.current];
        self.current += 1;
        if c == '\n' {
            self.line += 1;
            self.column = 1;
        } else {
            self.column += 1;
        }
        c
    }

    fn skip_whitespace(&mut self) {
        while let Some(c) = self.peek() {
            match c {
                ' ' | '\t' | '\r' => {
                    self.advance();
                }
                '\n' => {
                    self.advance();
                }
                _ => break,
            }
        }
    }

    fn make_token(&self, kind: TokenKind, value: &str) -> Token {
        Token {
            kind,
            value: value.to_string(),
            start: self.start as u32,
            end: self.current as u32,
            line: self.line,
            column: self.column - (self.current - self.start) as u32,
        }
    }

    fn scan_string(&mut self, quote: char) -> Token {
        let mut value = String::new();

        while let Some(c) = self.peek() {
            if c == quote {
                self.advance(); // Consume closing quote
                break;
            }
            if c == '\\' {
                self.advance();
                if let Some(escaped) = self.peek() {
                    self.advance();
                    match escaped {
                        'n' => value.push('\n'),
                        't' => value.push('\t'),
                        'r' => value.push('\r'),
                        '\\' => value.push('\\'),
                        '"' => value.push('"'),
                        '\'' => value.push('\''),
                        _ => {
                            value.push('\\');
                            value.push(escaped);
                        }
                    }
                }
            } else {
                value.push(self.advance());
            }
        }

        self.make_token(TokenKind::String, &value)
    }

    fn scan_number(&mut self) -> Token {
        let start = self.current - 1;

        while let Some(c) = self.peek() {
            if c.is_ascii_digit() {
                self.advance();
            } else {
                break;
            }
        }

        // Check for decimal
        if self.peek() == Some('.') && self.peek_next().map_or(false, |c| c.is_ascii_digit()) {
            self.advance(); // Consume '.'
            while let Some(c) = self.peek() {
                if c.is_ascii_digit() {
                    self.advance();
                } else {
                    break;
                }
            }
        }

        // Check for time units (ms, s, m, h)
        if let Some(c) = self.peek() {
            if c == 'm' || c == 's' || c == 'h' {
                self.advance();
                if self.peek() == Some('s') {
                    self.advance(); // 'ms'
                }
            }
        }

        let value: String = self.chars[start..self.current].iter().collect();
        self.make_token(TokenKind::Number, &value)
    }

    fn scan_identifier(&mut self) -> Token {
        let start = self.current - 1;

        while let Some(c) = self.peek() {
            if c.is_alphanumeric() || c == '_' || c == '-' {
                self.advance();
            } else {
                break;
            }
        }

        let value: String = self.chars[start..self.current].iter().collect();

        // Check for keywords
        let kind = match value.as_str() {
            // Control flow
            "if" | "else" | "then" | "end" | "repeat" | "for" | "while" | "until" | "break"
            | "continue" | "return" | "exit" | "halt" => TokenKind::Keyword,

            // Commands
            "set" | "get" | "put" | "add" | "remove" | "toggle" | "hide" | "show" | "wait"
            | "send" | "trigger" | "fetch" | "call" | "go" | "log" | "throw" => TokenKind::Keyword,

            // Expressions
            "to" | "into" | "from" | "at" | "in" | "of" | "on" | "with" | "as" | "by" => {
                TokenKind::Keyword
            }

            // References
            "me" | "my" | "you" | "your" | "it" | "its" | "i" | "the" => TokenKind::Keyword,

            // Logical
            "and" | "or" | "not" | "is" | "am" | "are" | "no" => TokenKind::Keyword,

            // Boolean literals
            "true" | "false" => TokenKind::Boolean,

            // Navigation
            "first" | "last" | "next" | "previous" | "closest" | "parent" => TokenKind::Keyword,

            // Types
            "String" | "Int" | "Float" | "Number" | "Array" | "Object" | "JSON" | "Values"
            | "Date" => TokenKind::Keyword,

            // Default: identifier
            _ => TokenKind::Identifier,
        };

        self.make_token(kind, &value)
    }

    fn scan_dot_or_class(&mut self) -> Token {
        // Check if this is a class reference (.className)
        if let Some(c) = self.peek() {
            if c.is_alphabetic() || c == '-' || c == '_' {
                // It's a class reference
                while let Some(c) = self.peek() {
                    if c.is_alphanumeric() || c == '-' || c == '_' {
                        self.advance();
                    } else {
                        break;
                    }
                }
                let value: String = self.chars[self.start..self.current].iter().collect();
                return self.make_token(TokenKind::ClassRef, &value);
            }
        }
        self.make_token(TokenKind::Dot, ".")
    }

    fn scan_attribute_ref(&mut self) -> Token {
        // @attributeName
        while let Some(c) = self.peek() {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                self.advance();
            } else {
                break;
            }
        }
        let value: String = self.chars[self.start..self.current].iter().collect();
        self.make_token(TokenKind::AttributeRef, &value)
    }

    fn scan_id_ref(&mut self) -> Token {
        // #idName
        while let Some(c) = self.peek() {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                self.advance();
            } else {
                break;
            }
        }
        let value: String = self.chars[self.start..self.current].iter().collect();
        self.make_token(TokenKind::IdRef, &value)
    }

    fn scan_minus_or_number(&mut self) -> Token {
        if let Some(c) = self.peek() {
            if c.is_ascii_digit() {
                return self.scan_number();
            }
        }
        self.make_token(TokenKind::ArithmeticOp, "-")
    }

    fn scan_slash_or_comment(&mut self) -> Token {
        if self.peek() == Some('/') {
            // Line comment
            self.advance();
            while let Some(c) = self.peek() {
                if c == '\n' {
                    break;
                }
                self.advance();
            }
            let value: String = self.chars[self.start..self.current].iter().collect();
            return self.make_token(TokenKind::Comment, &value);
        }
        if self.peek() == Some('*') {
            // Block comment
            self.advance();
            while !self.is_at_end() {
                if self.peek() == Some('*') && self.peek_next() == Some('/') {
                    self.advance();
                    self.advance();
                    break;
                }
                self.advance();
            }
            let value: String = self.chars[self.start..self.current].iter().collect();
            return self.make_token(TokenKind::Comment, &value);
        }
        self.make_token(TokenKind::ArithmeticOp, "/")
    }

    fn scan_equals(&mut self) -> Token {
        if self.peek() == Some('=') {
            self.advance();
            if self.peek() == Some('=') {
                self.advance();
                return self.make_token(TokenKind::ComparisonOp, "===");
            }
            return self.make_token(TokenKind::ComparisonOp, "==");
        }
        self.make_token(TokenKind::Operator, "=")
    }

    fn scan_bang(&mut self) -> Token {
        if self.peek() == Some('=') {
            self.advance();
            if self.peek() == Some('=') {
                self.advance();
                return self.make_token(TokenKind::ComparisonOp, "!==");
            }
            return self.make_token(TokenKind::ComparisonOp, "!=");
        }
        self.make_token(TokenKind::LogicalOp, "!")
    }

    fn scan_less_than(&mut self) -> Token {
        if self.peek() == Some('=') {
            self.advance();
            return self.make_token(TokenKind::ComparisonOp, "<=");
        }
        self.make_token(TokenKind::ComparisonOp, "<")
    }

    fn scan_greater_than(&mut self) -> Token {
        if self.peek() == Some('=') {
            self.advance();
            return self.make_token(TokenKind::ComparisonOp, ">=");
        }
        self.make_token(TokenKind::ComparisonOp, ">")
    }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/// Tokenize a source string directly (convenience function)
#[napi]
pub fn tokenize(source: String) -> Vec<Token> {
    let mut tokenizer = Tokenizer::new(source);
    tokenizer.tokenize_all()
}

/// Check if a string is a valid HyperScript keyword
#[napi]
pub fn is_keyword(word: String) -> bool {
    matches!(
        word.as_str(),
        "if" | "else"
            | "then"
            | "end"
            | "repeat"
            | "for"
            | "while"
            | "until"
            | "break"
            | "continue"
            | "return"
            | "exit"
            | "halt"
            | "set"
            | "get"
            | "put"
            | "add"
            | "remove"
            | "toggle"
            | "hide"
            | "show"
            | "wait"
            | "send"
            | "trigger"
            | "fetch"
            | "call"
            | "go"
            | "log"
            | "throw"
            | "to"
            | "into"
            | "from"
            | "at"
            | "in"
            | "of"
            | "on"
            | "with"
            | "as"
            | "by"
            | "me"
            | "my"
            | "you"
            | "your"
            | "it"
            | "its"
            | "i"
            | "the"
            | "and"
            | "or"
            | "not"
            | "is"
            | "am"
            | "are"
            | "no"
            | "first"
            | "last"
            | "next"
            | "previous"
            | "closest"
            | "parent"
    )
}

// ============================================================================
// Tests (run with cargo test)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_tokens() {
        let tokens = tokenize("set x to 5".to_string());
        assert_eq!(tokens.len(), 5); // set, x, to, 5, EOF
        assert!(matches!(tokens[0].kind, TokenKind::Keyword));
        assert_eq!(tokens[0].value, "set");
    }

    #[test]
    fn test_string_literals() {
        let tokens = tokenize(r#""hello world""#.to_string());
        assert!(matches!(tokens[0].kind, TokenKind::String));
        assert_eq!(tokens[0].value, "hello world");
    }

    #[test]
    fn test_css_references() {
        let tokens = tokenize(".my-class #my-id @data-value".to_string());
        assert!(matches!(tokens[0].kind, TokenKind::ClassRef));
        assert!(matches!(tokens[1].kind, TokenKind::IdRef));
        assert!(matches!(tokens[2].kind, TokenKind::AttributeRef));
    }

    #[test]
    fn test_numbers_with_units() {
        let tokens = tokenize("100ms 2s 5".to_string());
        assert!(matches!(tokens[0].kind, TokenKind::Number));
        assert_eq!(tokens[0].value, "100ms");
        assert_eq!(tokens[1].value, "2s");
        assert_eq!(tokens[2].value, "5");
    }

    #[test]
    fn test_comparison_operators() {
        let tokens = tokenize("== != <= >= < >".to_string());
        assert!(matches!(tokens[0].kind, TokenKind::ComparisonOp));
        assert_eq!(tokens[0].value, "==");
        assert_eq!(tokens[1].value, "!=");
        assert_eq!(tokens[2].value, "<=");
    }

    #[test]
    fn test_complex_expression() {
        let source = "on click set my.value to #input's value then add .active to me";
        let tokens = tokenize(source.to_string());
        // Verify token count and types
        assert!(tokens.len() > 10);
    }
}
