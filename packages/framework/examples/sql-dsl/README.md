# Simple SQL DSL Example

This example demonstrates that `@lokascript/framework` is **truly generic** and works for non-hyperscript DSLs.

## What This Proves

✅ **No CSS selectors** - Uses table names and column names
✅ **No DOM events** - SQL has no events
✅ **No JavaScript syntax** - Pure SQL semantics
✅ **Different roles** - `columns`, `source`, `condition` (not `patient`, `destination`)
✅ **Works in multiple languages** - English and Spanish

## The SQL DSL

```typescript
// English
select name from users
select name from users where age > 18

// Spanish
seleccionar nombre de usuarios
seleccionar nombre de usuarios donde edad > 18
```

Both parse to the same semantic structure and compile to standard SQL.

## Key Components

1. **Command Schema**: Defines `select` with roles (columns, source, condition)
2. **Tokenizers**: Simple whitespace-based tokenizers (no CSS, no events)
3. **Language Profiles**: SVO word order, role markers (from, where / de, donde)
4. **Code Generator**: Converts semantic AST → SQL string

## Running

```bash
cd packages/framework/examples/sql-dsl
npx tsx simple-sql.ts
```

## Output

```
English parsed: { action: 'select', roles: { columns: 'name', source: 'users' } }
Spanish parsed: { action: 'select', roles: { columns: 'nombre', source: 'usuarios' } }
Generated SQL: SELECT name FROM users
Validation: { valid: true }
Supported languages: ['en', 'es']
```

This proves the framework is **domain-agnostic** and works for any DSL!
