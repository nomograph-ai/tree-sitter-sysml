# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- SmartHome corpus (3 files) to external coverage suite
- `fetch-corpora.sh` now fetches Training and Examples corpora from GitHub (no longer requires local fixtures)
- 192 corpus tests (up from 125), covering all major SysML v2 construct types
- Comprehensive test coverage for definitions: use_case, interface, allocation, analysis, case, verification, occurrence, individual, item, connection (with end redefinitions)
- Comprehensive test coverage for usages: use_case, interface, allocation, analysis, case, verification, occurrence, individual, enumeration, event_occurrence, event, timeslice, reference, concern, variant, objective
- Control flow tests: if_then, else, while_loop, send (to/via), terminate
- Expression tests: parenthesized, range, cast
- Statement tests: dependency, comment (with/without target), include, redefines (standalone :>>)
- State behavior tests: exit_statement
- Tree-sitter org scaffolding: `bindings/c/`, `CMakeLists.txt`, `Makefile`, `setup.py`
- Node.js binding test (`bindings/node/binding_test.js`)
- Python binding scaffolding (`bindings/python/tree_sitter_sysml/binding.c`, `__init__.pyi`, `tests/`)
- ESLint configuration (`eslint.config.mjs` with `eslint-config-treesitter`)
- `go.sum` and `Cargo.lock` generated for reproducible builds
- `examples/` directory with curated SysML v2 files (vehicle, requirements, state-machine)
- `end` usage now accepts `occurrence` keyword for causation connection patterns
- `message_statement` now supports `abstract` modifier and usage declaration branches
- `first_statement` for `first X then Y` control flow (added to all member lists)
- Parse coverage documentation (`docs/parse-coverage.md`)

### Changed

- External coverage: 387/393 (98.4%) across 8 corpora including SmartHome (tested 2026-03-10)
- `test-corpus.sh` now uses fetched corpora paths instead of local fixtures; uses `tree-sitter` directly instead of `npx tree-sitter`
- `test-corpus.sh` prints grand total summary when running `all` corpora

### Fixed

- `test-corpus.sh` broken pipe in `test_file()` was masking parse failures on large files (switched `echo | grep` to herestring)
- CI workflow aligned with tree-sitter-python conventions (action versions, step ordering, macos-latest)
- `Cargo.toml` categories updated to include `parser-implementations`
- `pyproject.toml` updated: `setuptools>=62.4.0`, `requires-python>=3.10`, `tree-sitter~=0.24`, `cp310`
- `package.json` updated with GitHub repo URL, eslint/prebuildify devDeps, proper scripts
- `grammar.js` reformatted to single quotes per tree-sitter ESLint conventions
- `succession_statement` now requires explicit `succession` keyword (bare `first X then Y` uses `first_statement`)
- `start` removed as keyword from `control_node` to resolve GLR ambiguity
- `bind_statement` tree structure updated to expose both feature chains

### Fixed

- `CausationConnections.sysml` — `end theCauses [*] occurrence theCause` pattern
- `Flows.sysml` — `abstract message messages : Message[0..*]` pattern
- `3a-Function-based Behavior-1.sysml` — `first start then continue` pattern

## [0.1.0] - 2026-02-13

### Added

- SysML v2 textual notation grammar for tree-sitter
- 100% OMG training file coverage (100/100 files)
- 99.6% external corpus coverage (274/275 files)
- Language bindings: C, Rust, Go, Python, Node.js, Swift
- Query files: highlights, tags, folds, indents, locals
- Negative test framework (8 tests)
- External corpus validation scripts
- GitLab CI and GitHub Actions workflows

### Known Limitations

- Grammar may over-accept invalid syntax in some contexts (empirical, not spec-derived)
- Context-sensitive body members not enforced (all member types allowed in all body contexts)
- Expression precedence uses flat left-association (no operator hierarchy)
- Two external files unsupported: one uses non-standard UML syntax, one uses implicit brace-less action bodies
