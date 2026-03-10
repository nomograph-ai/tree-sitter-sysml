#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

echo "Cloning GfSE/SysML-v2-Models..."
git clone --depth 1 --quiet https://github.com/GfSE/SysML-v2-Models.git "$tmpdir"

total=0
pass=0
fail_files=()

for f in "$tmpdir"/models/**/*.sysml "$tmpdir"/models/**/**/*.sysml; do
  [[ -f "$f" ]] || continue
  ((total++))
  if npx tree-sitter parse "$f" 2>&1 | grep -qi error; then
    fail_files+=("${f#$tmpdir/}")
  else
    ((pass++))
  fi
done

echo ""
echo "=== GfSE/SysML-v2-Models Coverage ==="
echo "Passed: $pass/$total"

if [[ ${#fail_files[@]} -gt 0 ]]; then
  echo ""
  echo "Failed files:"
  for f in "${fail_files[@]}"; do
    echo "  - $f"
  done
fi

if [[ $pass -eq $total ]]; then
  echo ""
  echo "All external models parse successfully!"
  exit 0
else
  echo ""
  echo "Some models failed to parse (informational - not blocking)"
  exit 0
fi
