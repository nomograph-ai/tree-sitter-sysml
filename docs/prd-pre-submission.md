# PRD: Pre-Submission Cleanup for tree-sitter-sysml

## Goal

Bring the repository to a publishable state suitable for sharing with the
tree-sitter community and eventual submission to the tree-sitter GitHub
organization.

## Current State

| Metric | Value |
|--------|-------|
| Corpus Tests | 192/192 passing |
| External Coverage | 387/393 (98.4%) |
| ESLint | Clean |
| Scaffolding | Complete (all bindings, CI, examples) |

## Work Items

### 1. Remove Internal Development Artifacts

**Priority:** Blocking

- [ ] Delete `memory/` directory (AI session notes)
- [ ] Delete `AGENTS.md` (AI development instructions)
- [ ] Add `memory/` and `AGENTS.md` to `.gitignore`

### 2. Update README.md

**Priority:** Blocking

- [ ] Update corpus test count: 151 → 192
- [ ] Verify all section content is accurate

### 3. Update CHANGELOG.md

**Priority:** Blocking

Update `[Unreleased]` section to include:

- [ ] 41 new corpus tests (10 definitions, 16 usages, 6 control flow, 3 expressions, 5 statements, 1 state)
- [ ] Tree-sitter org scaffolding (bindings/c, CMakeLists.txt, Makefile, setup.py, eslint, examples/)
- [ ] CI alignment with tree-sitter-python
- [ ] Cargo.toml categories update
- [ ] pyproject.toml version bumps (setuptools, requires-python, tree-sitter, cibuildwheel)
- [ ] ESLint integration (single quotes, unused var fixes)
- [ ] go.sum and Cargo.lock generation

### 4. Fix CONTRIBUTING.md

**Priority:** Blocking

- [ ] Fix incorrect `(definition_body` → `(structural_body)` in example
- [ ] Add `locals.scm` to queries table

### 5. Fix coverage.yml

**Priority:** Important

- [ ] Update `actions/checkout@v5` → `@v4` for consistency with ci.yml

### 6. Update tags.scm

**Priority:** Important

- [ ] Add `case_definition` → `@definition.class`
- [ ] Add `case_usage` → `@definition.field`
- [ ] Verify all definition/usage types in grammar have tags entries

### 7. Validate Queries

**Priority:** Important

- [ ] Run query validation against corpus test files
- [ ] Verify highlights.scm covers all keywords in grammar.js
- [ ] Check for any query patterns referencing non-existent node types
- [ ] Ensure folds.scm and indents.scm cover `definition_body` if applicable

### 8. Expand Negative Tests

**Priority:** Important

Current: 8 negative tests. Target: 15+.

Candidate areas:
- [ ] Wrong keyword combinations (e.g., `part part def`)
- [ ] Missing semicolons in various contexts
- [ ] Invalid nesting (e.g., `package` inside `attribute`)
- [ ] Bad expression syntax
- [ ] Unclosed braces/brackets
- [ ] Invalid multiplicity syntax
- [ ] Duplicate modifiers

### 9. Expand Examples

**Priority:** Nice-to-have

Current: 3 files (vehicle, requirements, state-machine).

- [ ] Add requirements-with-verification example
- [ ] Add use-case example
- [ ] Add analysis/trade-study example

### 10. Scripts Cleanup

**Priority:** Low

- [ ] Review `check-test-count.sh` — keep if useful for CI
- [ ] Review `validate-external.sh` — keep if useful for contributors
- [ ] Review `validate-training.js` — keep if useful for contributors
- [ ] Ensure all scripts have correct paths after memory/ removal

## Acceptance Criteria

1. `npx tree-sitter test` — all tests pass
2. `npx eslint grammar.js` — clean
3. No internal development artifacts in the repository
4. README.md, CHANGELOG.md, CONTRIBUTING.md accurate and up-to-date
5. All queries validate without errors
6. At least 15 negative tests
7. At least 5 example files
8. CI workflows use consistent action versions

## Non-Goals

- PyPI badge (add after publishing)
- Discord/Matrix badges (add after org acceptance)
- Grammar changes (grammar work is complete)
- Spec alignment improvements (post-release)
