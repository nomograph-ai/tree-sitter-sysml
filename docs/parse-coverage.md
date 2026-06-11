# Parse Coverage Report

Last updated: 2026-06-11

## Summary

**424 / 424 files parse without errors (100%)**

This grammar was developed empirically against real SysML v2 files from multiple
sources. It uses an over-accepting strategy: the grammar accepts all valid SysML v2
syntax encountered in the wild, and may also accept some invalid syntax. This
trade-off is documented in the [limitations](#known-limitations) section.

## Corpus Results

| Corpus | Source | Files | Pass Rate |
|--------|--------|-------|-----------|
| Training | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/training/` | 100 | 100% |
| Examples | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/examples/` | 95 | 100% |
| GfSE | [GfSE/SysML-v2-Models](https://github.com/GfSE/SysML-v2-Models) | 36 | 100% |
| Advent | [sensmetry/advent-of-sysml-v2](https://github.com/sensmetry/advent-of-sysml-v2) | 44 | 100% |
| Validation | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml/src/validation/` | 56 | 100% |
| Library | [OMG SysML v2 Release](https://github.com/Systems-Modeling/SysML-v2-Release) `sysml.library/` | 58 | 100% |
| SYSMOD | [MBSE4U/sysmod-sysmlv2](https://github.com/MBSE4U/sysmod-sysmlv2-models) | 3 | 100% |
| SmartHome | [sensmetry/smart-home-hub-example](https://github.com/sensmetry/smart-home-hub-example) | 3 | 100% |
| Apollo 11 | [airbus/apollo-11-sysml-v2](https://github.com/airbus/apollo-11-sysml-v2) | 28 | 100% |
| CDF RDL | [ESA CDF Reference Data Library](https://sysand.com/projects/esa/cdf-reference-data-library/) (Sysand, ESA-PL-permissive-2.4) | 1 | 100% |
| **Total** | | **424** | **100% (424/424)** |

> **Note:** These results reflect upstream corpora fetched on 2026-06-11 (tested
> with tree-sitter 0.24.7). Pass rates may change as upstream repositories are
> updated. The CI coverage job re-runs this suite on every push to `main` and
> updates the coverage badge automatically.
>
> The previous snapshot (2026-03-10) measured 415/421 (98.5%) across nine corpora.
> All six then-failing files now pass with the constructs still present in the
> files (verified per-file), so the recovery is grammar-side improvement landed on
> `main` since that snapshot. SYSMOD grew from 1 to 3 files upstream, and the ESA
> CDF Reference Data Library corpus was added (suggested in issue #1).

## Previously Unparseable Files (all passing as of 2026-06-11)

The 2026-03-10 snapshot recorded six failing files. All six now parse, with the
difficult constructs verified still present in the upstream files -- the recovery
came from grammar improvements, not upstream edits:

| File | Corpus | Formerly-failing construct | Status |
|------|--------|---------------------------|--------|
| `Simple Tests/ConnectionTest.sysml` | Examples | named binding (`binding ab bind a = b;`) | PASS |
| `Geometry/ShapeItems.sysml` | Library | multiplicity on binding (`binding [1] bind [0..*] ...`) | PASS |
| `Quantities and Units/ISQSpaceTime.sysml` | Library | index expression + unit bracket (`num#(1) [mRef...]`) | PASS |
| `Systems Library/SysML.sysml` | Library | chained specialization after multiplicity in metadata defs | PASS |
| `EIT_System_Use_Cases.sysml` | GfSE | UML-style use case constructs | PASS |
| `Systems Library/Actions.sysml` | Library | implicit (brace-less) action bodies | PASS |

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
