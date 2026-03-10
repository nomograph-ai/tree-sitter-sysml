#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

expected=$(grep -oE 'Corpus Tests \| [0-9]+/[0-9]+' AGENTS.md | grep -oE '[0-9]+' | head -1)
actual=$(npx tree-sitter test 2>&1 | grep -c '✓' || echo 0)

if [[ "$actual" -eq "$expected" ]]; then
  echo "Test count OK: $actual/$expected"
  exit 0
else
  echo "MISMATCH: actual=$actual expected=$expected"
  echo "Update AGENTS.md with correct count after adding/removing tests"
  exit 1
fi
