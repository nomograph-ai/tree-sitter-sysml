# Negative Test Suite

Tests that verify invalid syntax is rejected.

## Categories

### `syntactic/` - Pure Syntax Errors

These should fail NOW. If any pass, the grammar is broken.

### `structural/` - Context Violations

These SHOULD fail but currently PASS due to TD-1 (monolithic `_usage_member`).
They document the over-acceptance and become regression tests once
context sensitivity is implemented.

## Running

```bash
./test/invalid/run_tests.sh
```

## Adding Tests

1. Create `.sysml` file with invalid syntax
2. Add comment explaining why it's invalid
3. Note if it's expected to pass currently (structural) or fail (syntactic)
