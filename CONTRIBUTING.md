# Contributing to tree-sitter-sysml

Thank you for your interest in contributing! This document provides guidelines for contributing to the SysML v2 tree-sitter grammar.

## Development Setup

```bash
git clone https://gitlab.com/nomograph/tree-sitter-sysml.git
cd tree-sitter-sysml
npm install
npx tree-sitter generate
npx tree-sitter test
```

## How to Contribute

### Reporting Issues

- Check existing issues first
- Include a minimal SysML example that demonstrates the problem
- Specify whether it's a parse failure (ERROR node) or incorrect AST structure

### Adding New Constructs

1. **Find a failing example** from the official training files or create one
2. **Add the construct** to `grammar.js`
3. **Generate the parser**: `npx tree-sitter generate`
4. **Add a corpus test** to `test/corpus/`
5. **Run tests**: `npx tree-sitter test`
6. **Update highlights** if needed: `queries/highlights.scm`

### Improving Queries

The `queries/` directory contains:

| File | Purpose |
|------|---------|
| `highlights.scm` | Syntax highlighting |
| `tags.scm` | Code navigation (symbols) |
| `locals.scm` | Scope-aware highlighting |
| `folds.scm` | Code folding regions |
| `indents.scm` | Auto-indentation |

## Grammar Design Principles

### 1. Empirical First, Spec-Aligned Later

This grammar was built by iterating against official training files, not derived from the KEBNF specification. This means:

- **We may over-accept**: Some invalid syntax might parse successfully
- **We may under-specify**: AST structure may not match the metamodel exactly
- **Contributions that improve spec alignment are welcome**

### 2. Prefer Flat Over Deep

When in doubt, prefer flatter AST structures that are easier to query:

```javascript
// Preferred: flat
part_definition: $ => seq('part', 'def', $.identification, $.definition_body)

// Avoid: deeply nested
part_definition: $ => seq($.part_keyword, $.def_keyword, $.part_declaration)
```

### 3. Use Descriptive Rule Names

Rule names should be self-documenting:

```javascript
// Good
requirement_definition
usage_body
relationship_part

// Avoid
req_def
body
rel
```

## Test Corpus Format

Tests use tree-sitter's corpus format:

```
================================================================================
Test Name
================================================================================

source code here

--------------------------------------------------------------------------------

(expected_ast
  (node_type
    (child_node)))
```

### Example

```
================================================================================
Part Definition with Attribute
================================================================================

part def Vehicle {
    attribute mass : Real;
}

--------------------------------------------------------------------------------

(source_file
  (part_definition
    (identification
      (name
        (identifier)))
    (structural_body
      (attribute_usage
        (usage_declaration
          (identification
            (name
              (identifier)))
          (typing_part
            (qualified_name
              (name
                (identifier)))))
        (usage_body)))))
```

## Specification Mapping

We track how our grammar rules relate to the official KEBNF specification.

### Official Sources

- **KEBNF**: `github.com/Systems-Modeling/SysML-v2-Release/tree/master/bnf`
- **Xtext**: `github.com/Systems-Modeling/SysML-v2-Pilot-Implementation`

### Known Deviations

| Our Rule | Spec Rule | Deviation |
|----------|-----------|-----------|
| `_usage_member` | Context-specific bodies | We allow all member types in all contexts |
| `relationship_part` | Multiple relationship types | Collapsed for simplicity |
| `_expression` | Many expression variants | Simplified expression handling |

### Contributing Spec Alignment

If you improve spec alignment:

1. Reference the specific KEBNF rule
2. Note what was changed
3. Add tests for both valid and invalid syntax if possible

## Negative Tests

We need tests that verify invalid syntax is rejected. If you can identify syntax that should fail but currently parses, please contribute:

1. Create a file in `test/invalid/` (proposed convention)
2. Document what makes it invalid
3. Open an issue or PR

## Code Style

- No comments unless explaining non-obvious behavior
- Use existing patterns in `grammar.js`
- Run `npx tree-sitter generate` without errors
- All tests must pass

## Questions?

Open an issue for:
- Grammar questions
- Spec interpretation questions
- Feature requests

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
