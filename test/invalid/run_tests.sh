#!/bin/bash
# Negative tests - these should ALL produce parse errors

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

PASS=0
FAIL=0
TOTAL=0

echo "Running negative tests..."
echo ""

for f in test/invalid/**/*.sysml; do
  [[ -f "$f" ]] || continue
  ((TOTAL++))
  # Check for ERROR or MISSING nodes (both indicate parse problems)
  if npx tree-sitter parse "$f" 2>&1 | grep -qE "(ERROR|MISSING)"; then
    echo "✓ $f (correctly rejected)"
    ((PASS++))
  else
    echo "✗ $f (incorrectly accepted - SHOULD FAIL)"
    ((FAIL++))
  fi
done

echo ""
echo "Negative tests: $PASS/$TOTAL rejected, $FAIL incorrectly accepted"

if [[ $TOTAL -eq 0 ]]; then
  echo "No test files found!"
  exit 1
fi

exit $FAIL
