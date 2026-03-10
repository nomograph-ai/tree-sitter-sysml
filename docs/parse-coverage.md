# Parse Coverage Report

Last updated: 2026-03-10

## Summary

**387 / 393 files parse without errors (98.4%)**

This grammar was developed empirically against real SysML v2 files from multiple
sources. It uses an over-accepting strategy: the grammar accepts all valid SysML v2
syntax encountered in the wild, and may also accept some invalid syntax. This
trade-off is documented in the [limitations](#known-limitations) section.

## Corpus Results

| Corpus | Source | Files | Pass Rate |
|--------|--------|-------|-----------|
| Training | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/training/` | 100 | 100% |
| Examples | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/examples/` | 95 | 98.9% (94/95) |
| GfSE | [GfSE/SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) | 36 | 97.2% (35/36) |
| Advent | [sensmetry/advent-of-sysml-v2](https://github.com/sensmetry/advent-of-sysml-v2) | 44 | 100% |
| Validation | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/validation/` | 56 | 100% |
| Library | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml.library/` | 58 | 93.1% (54/58) |
| SYSMOD | [MBSE4U/sysmod-sysmlv2](https://github.com/MBSE4U/sysmod-sysmlv2-models) | 1 | 100% |
| SmartHome | [sensmetry/smart-home-hub-example](https://github.com/sensmetry/smart-home-hub-example) | 3 | 100% |
| **Total** | | **393** | **98.4% (387/393)** |

> **Note:** These results reflect upstream corpora fetched on 2026-03-10. Pass rates
> may change as upstream repositories are updated. The CI coverage job re-runs this
> suite on every push to `main` and updates the coverage badge automatically.

## Unparseable Files

### Regressions (4 files)

These files fail due to grammar gaps exposed by the OMG 2026-02 release or
constructs not previously encountered in the corpus.

| File | Corpus | Error | Root Cause |
|------|--------|-------|------------|
| `Simple Tests/ConnectionTest.sysml` | Examples | `ERROR [22, 2]` | Named binding syntax (`binding ab bind a = b;`) |
| `Geometry/ShapeItems.sysml` | Library | `ERROR [431, 10]` | Multiplicity on binding keyword (`binding [1] bind [0..*] ...`) |
| `Quantities and Units/ISQSpaceTime.sysml` | Library | `ERROR [323, 59]` | Index expression followed by unit bracket (`num#(1) [mRef...]`) |
| `Systems Library/SysML.sysml` | Library | `ERROR [13, 3]` | Chained specialization with `subsets` after multiplicity in metadata defs |

**ConnectionTest.sysml** — Added in the OMG 2026-02 release. The anonymous
`bind a = b;` form parses correctly, but the named form `binding ab bind a = b;`
uses the `binding` keyword as a named usage declaration.

**ShapeItems.sysml** — Uses `binding [1] bind [0..*] base.edges = [0..*] be;`
which places multiplicity constraints on the binding itself. The grammar's
`bind_statement` does not accept multiplicity on the `binding` keyword.

**ISQSpaceTime.sysml** — Uses `num#(1) [mRef.mRefs#(1)]` where an index
expression is followed by a bracket expression. The parser cannot distinguish
this from multiplicity syntax.

**SysML.sysml** — Contains metadata definitions with complex member chains like
`derived ref item receiverArgument : Expression[0..1] subsets Metadata::metadataItems;`
where `subsets` follows a multiplicity constraint. The grammar does not handle
this chained specialization pattern in metadata definition bodies.

### Intentionally Unsupported (2 files)

### 1. `EIT_System_Use_Cases.sysml` (GfSE)

**Status:** Intentionally unsupported — not SysML v2 syntax

**Source:** `GfSE/SysML-v2-Models/SE_Models/EIT_System_Use_Cases.sysml`

This file uses UML use case diagram constructs that are not part of the SysML v2
textual notation:

```sysml
// These are UML constructs, not SysML v2:
actor Doctor;
usecase ApplyElectrodeBelt;

association ApplyElectrodeBeltAssoc {
    memberEnd actor: Doctor;
    memberEnd usecase: ApplyElectrodeBelt;
}

boundary EITSystemBoundary {
    include ApplyElectrodeBelt;
}
```

| Construct | SysML v2 Equivalent | Why Unsupported |
|-----------|---------------------|-----------------|
| `actor X;` (standalone) | `part def X;` or `actor :>> X;` inside a use case | `actor` is a keyword in SysML v2, but only valid as a use case participant, not as a standalone declaration |
| `usecase X;` | `use case X;` (two words) | SysML v2 uses `use case` (two words); `usecase` (one word) is not valid |
| `memberEnd actor: X;` | Not applicable | `memberEnd` is a UML metaclass property, not a SysML v2 textual keyword |
| `boundary { include X; }` | `package` or `part` with nested use cases | `boundary` is a UML use case diagram concept, not part of SysML v2 textual syntax |

**Decision:** This file appears to be authored for a UML tool that accepts
SysML-like syntax extensions. Since these constructs are outside the SysML v2
specification, supporting them would compromise the grammar's accuracy. The file
is excluded from coverage targets.

### 2. `Actions.sysml` (Standard Library)

**Status:** Known limitation — implicit (brace-less) action bodies

**Source:** `SysML-v2-Release/sysml.library/Systems Library/Actions.sysml`

**Error location:** Lines 522–529

This file uses implicit action bodies where the action's single statement appears
on the next line without enclosing braces:

```sysml
// Standard library pattern — implicit action body (no braces):
private action initialization
    assign index := 1;
then private action whileLoop
    while index <= size(seq) {
        assign var := seq#(index);
        then perform body;
        then assign index := index + 1;
    }
```

Compare with the braced form that the grammar does support:

```sysml
// Equivalent with explicit braces — this parses correctly:
private action initialization {
    assign index := 1;
}
then private action whileLoop {
    while index <= size(seq) {
        assign var := seq#(index);
        then perform body;
        then assign index := index + 1;
    }
}
```

**Why this is hard to support:**

The implicit body pattern requires the parser to determine where one action
declaration ends and the next begins without an explicit delimiter. In the example
above, `assign index := 1;` is the body of `initialization`, and `then private
action whileLoop` starts a new peer declaration.

In a tree-sitter grammar (LR-based), supporting this requires `action_body` to
accept a bare statement without braces as an alternative to `{ ... }`. This
creates massive ambiguity:

1. After parsing `private action initialization`, the parser cannot tell whether
   the next token starts the action's body or a sibling member.
2. The `then` keyword on line 524 could be: (a) a succession prefix on a sibling
   action, or (b) a `then` inside the implicit body.
3. Every action declaration in the grammar would need to handle this ambiguity,
   creating exponential state growth in the LR parse table.

The SysML v2 Xtext reference parser handles this using a PEG-like strategy
(ordered choice with backtracking) that tree-sitter's GLR parser cannot replicate
without an external scanner.

**Decision:** Supporting implicit action bodies would risk regressions across the
entire action grammar. This pattern only appears in the standard library definition
files (which define the semantics of the language itself), not in user-authored
models. The file is excluded from coverage targets.

**Workaround:** The standard library files define abstract base types that are
referenced by name in user models. The parse error in this file does not prevent
parsing of user models that reference `ForLoopAction` or other library types.

## Known Limitations

These are grammar-wide trade-offs, not specific file failures.

### Over-acceptance (Context-Insensitive Members)

The grammar allows any member type inside any body context. For example, a
`control_node` (which is only valid inside action bodies) will parse without
error inside a `part` body. This is a deliberate trade-off:

- **Pro:** Simpler grammar, fewer conflicts, resilient to spec evolution
- **Con:** Some invalid SysML v2 files will parse without error
- **Scope:** Affects semantic validity, not syntactic structure

A spec-compliant grammar would need context-sensitive body rules (separate member
lists for structural vs. behavioral contexts). This is tracked as technical debt
(TD-1) but deferred as low priority since editors and linters should handle
semantic validation.

### Expression Precedence

Operator precedence for SysML v2 expressions is approximated, not precisely
specified. Complex nested expressions (especially mixing arithmetic, comparison,
and logical operators) may produce unexpected parse trees. The grammar uses
`prec.left` for most binary operators, which matches common mathematical
convention but may differ from the SysML v2 specification in edge cases.

### Keyword-as-Identifier Ambiguity

SysML v2 allows some keywords to be used as identifiers in certain contexts.
The grammar handles the most common cases:

| Keyword | Can be used as identifier? | Grammar handling |
|---------|---------------------------|-----------------|
| `id` | Yes (identification keyword) | Aliased in `name` rule |
| `start` | Yes (snapshot/occurrence name) | Not a keyword (removed from `control_node`) |
| `first` | No | Always parsed as succession/statement keyword |
| Other domain keywords | Varies | Quoted names (`'keyword'`) always work |

## Reproducing These Results

```bash
# Fetch external test corpora (requires internet)
bash scripts/fetch-corpora.sh

# Run against all corpora
bash scripts/test-corpus.sh all --errors-only

# Run unit tests
npx tree-sitter test
```
