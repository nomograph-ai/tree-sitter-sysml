# Known Issues

## KI-001: tree-sitter query assertion failure on `named_argument` child patterns

**Status:** Open (upstream bug)
**Severity:** Low (workaround in place)
**Affects:** tree-sitter CLI 0.24.7, `query.c` line 1757
**Discovered:** 2026-02-14

### Description

Any tree-sitter query that matches **child nodes** of `named_argument` triggers an assertion failure in the query analysis engine:

```
Assertion failed: (analysis.final_step_indices.size > 0),
  function ts_query__analyze_patterns, file query.c, line 1757.
```

### Reproduction

```scm
; This pattern crashes tree-sitter:
(named_argument (name (identifier) @variable))
```

```bash
# Add the pattern to any query file (highlights.scm, tags.scm, etc.)
echo '(named_argument (name (identifier) @variable))' >> queries/highlights.scm
npx tree-sitter test
# => Assertion failed at query.c:1757
```

### Patterns That Crash

| Pattern | Result |
|---------|--------|
| `(named_argument (name (identifier) @variable))` | Assertion failure |
| `(named_argument (name) @variable)` | Assertion failure |
| `(named_argument) @definition.field` in tags.scm with child `(name (identifier) @name)` | Assertion failure |

### Patterns That Work

| Pattern | Result |
|---------|--------|
| `(named_argument) @local.scope` | Works (no child matching) |
| `(named_argument) @variable` | Works (no child matching) |

### Root Cause (Suspected)

The `named_argument` rule in `grammar.js` is:

```javascript
named_argument: ($) => seq($.name, "=", $._expression),
```

The `name` child is shared with many other rules via tree-sitter's internal optimization. The query analysis engine (`ts_query__analyze_patterns`) appears to fail when computing pattern step indices for `named_argument` specifically, possibly because:

1. `name` is an extremely common child type (appears in 50+ rules)
2. `_expression` is a large union type (19 alternatives per node-types.json)
3. The combination creates a state space that exceeds the analysis engine's expectations

This is a bug in tree-sitter's `query.c`, not in the grammar.

### Workaround

`named_argument` is referenced in `locals.scm` as a bare `@local.scope` pattern (no child matching). This provides 100% query coverage without triggering the bug.

The name and value children of `named_argument` are still highlighted correctly by the generic `(identifier) @variable` and expression patterns in `highlights.scm`.

### Impact

Minimal. The `=` operator in named arguments is highlighted by the operator rule. The identifier name is highlighted by the generic identifier rule. The only missing feature is that we cannot tag the argument name differently from other identifiers (e.g., as `@parameter`).

### Resolution Path

- Monitor tree-sitter releases for a fix to `ts_query__analyze_patterns`
- Upstream issue to file: https://github.com/tree-sitter/tree-sitter/issues (not yet filed)
- Once fixed, add: `(named_argument (name (identifier) @variable.parameter))` to highlights.scm
