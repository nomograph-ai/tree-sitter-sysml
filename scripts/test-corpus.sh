#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORPORA_DIR="$PROJECT_ROOT/.test-corpora"
# Training and examples are now fetched via fetch-corpora.sh (no longer local fixtures)

usage() {
  cat <<EOF
Usage: $(basename "$0") <corpus> [--json] [--errors-only]

Test a corpus against tree-sitter-sysml parser.

Corpora:
  training    OMG Training files (requires fetch-corpora.sh)
  examples    OMG Examples files (requires fetch-corpora.sh)
  gfse        GfSE/SysML-v2-Models (requires fetch-corpora.sh)
  advent      sensmetry/advent-of-sysml-v2 (requires fetch-corpora.sh)
  validation  OMG SysML v2 validation files (requires fetch-corpora.sh)
  library     OMG SysML v2 standard library (requires fetch-corpora.sh)
  sysmod      MBSE4U/sysmod-sysmlv2 (requires fetch-corpora.sh)
  smarthome   sensmetry/smart-home-hub-example (requires fetch-corpora.sh)
  all         Run all available corpora

Options:
  --json         Output results as JSON
  --errors-only  Only show files with parse errors
  --help         Show this help

Examples:
  $(basename "$0") training
  $(basename "$0") gfse --json
  $(basename "$0") all --errors-only
EOF
  exit 0
}

find_sysml_files() {
  local dir="$1"
  find "$dir" -name "*.sysml" -type f 2>/dev/null | sort
}

test_file() {
  local file="$1"
  local output
  output=$(tree-sitter parse "$file" 2>&1)
  if grep -qi error <<< "$output"; then
    printf '%s\n' "$output" > "$LAST_ERROR_FILE"
    return 1
  fi
  return 0
}

get_error_snippet() {
  if [[ -f "$LAST_ERROR_FILE" ]]; then
    grep -i error "$LAST_ERROR_FILE" | head -3
  fi
}

LAST_ERROR_FILE=$(mktemp)
trap 'rm -f "$LAST_ERROR_FILE"' EXIT

get_corpus_path() {
  local corpus="$1"
  case "$corpus" in
    training)
      echo "$CORPORA_DIR/training/sysml/src/training"
      ;;
    examples)
      echo "$CORPORA_DIR/examples/sysml/src/examples"
      ;;
    gfse)
      echo "$CORPORA_DIR/gfse/models"
      ;;
    advent)
      echo "$CORPORA_DIR/advent"
      ;;
    validation)
      echo "$CORPORA_DIR/validation/sysml/src/validation"
      ;;
    library)
      echo "$CORPORA_DIR/library/sysml.library"
      ;;
    sysmod)
      echo "$CORPORA_DIR/sysmod"
      ;;
    smarthome)
      echo "$CORPORA_DIR/smarthome"
      ;;
    *)
      echo ""
      ;;
  esac
}

check_corpus_exists() {
  local corpus="$1"
  local path
  path=$(get_corpus_path "$corpus")
  
  if [[ -z "$path" ]]; then
    echo "Unknown corpus: $corpus" >&2
    return 1
  fi
  
  if [[ ! -d "$path" ]]; then
    echo "Corpus '$corpus' not found at $path" >&2
    echo "Run: ./scripts/fetch-corpora.sh $corpus" >&2
    return 1
  fi
  return 0
}

run_corpus_test() {
  local corpus="$1"
  local json_output="$2"
  local errors_only="$3"
  
  if ! check_corpus_exists "$corpus"; then
    return 1
  fi
  
  local corpus_path
  corpus_path=$(get_corpus_path "$corpus")
  
  local total=0
  local pass=0
  local fail_files=()
  local fail_errors=()
  
  while IFS= read -r file; do
    [[ -z "$file" ]] && continue
    ((total++))
    
    if test_file "$file"; then
      ((pass++))
      if [[ "$json_output" == "false" && "$errors_only" == "false" ]]; then
        echo "  PASS: ${file#$corpus_path/}"
      fi
    else
      local rel_path="${file#$corpus_path/}"
      fail_files+=("$rel_path")
      fail_errors+=("$(get_error_snippet "$file")")
      if [[ "$json_output" == "false" ]]; then
        echo "  FAIL: $rel_path"
      fi
    fi
  done < <(find_sysml_files "$corpus_path")
  
  if [[ "$json_output" == "true" ]]; then
    local fail_json="["
    for i in "${!fail_files[@]}"; do
      [[ $i -gt 0 ]] && fail_json+=","
      local escaped_error
      escaped_error=$(echo "${fail_errors[$i]}" | head -1 | sed 's/"/\\"/g' | tr -d '\n')
      fail_json+="{\"file\":\"${fail_files[$i]}\",\"error\":\"$escaped_error\"}"
    done
    fail_json+="]"
    
    cat <<EOF
{
  "corpus": "$corpus",
  "total": $total,
  "passed": $pass,
  "failed": $((total - pass)),
  "pass_rate": $(echo "scale=2; $pass * 100 / $total" | bc),
  "failures": $fail_json
}
EOF
  else
    echo ""
    echo "=== $corpus Coverage ==="
    echo "Passed: $pass/$total ($(echo "scale=1; $pass * 100 / $total" | bc)%)"
    
    if [[ ${#fail_files[@]} -gt 0 ]]; then
      echo ""
      echo "Failed files (${#fail_files[@]}):"
      for i in "${!fail_files[@]}"; do
        echo "  - ${fail_files[$i]}"
        if [[ -n "${fail_errors[$i]}" ]]; then
          echo "    ${fail_errors[$i]}" | head -1
        fi
      done
    fi
  fi
  
  return 0
}

main() {
  local corpus=""
  local json_output="false"
  local errors_only="false"
  
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --json)
        json_output="true"
        shift
        ;;
      --errors-only)
        errors_only="true"
        shift
        ;;
      --help|-h)
        usage
        ;;
      *)
        if [[ -z "$corpus" ]]; then
          corpus="$1"
        else
          echo "Unknown argument: $1" >&2
          exit 1
        fi
        shift
        ;;
    esac
  done
  
  if [[ -z "$corpus" ]]; then
    usage
  fi
  
  cd "$PROJECT_ROOT"
  
  if [[ "$corpus" == "all" ]]; then
    local all_corpora=(training examples gfse advent validation library sysmod smarthome)
    local results=()
    local grand_total=0
    local grand_pass=0
    
    for c in "${all_corpora[@]}"; do
      if check_corpus_exists "$c" 2>/dev/null; then
        if [[ "$json_output" == "true" ]]; then
          results+=("$(run_corpus_test "$c" "$json_output" "$errors_only")")
        else
          # Capture output to parse totals while still printing it
          local output
          output=$(run_corpus_test "$c" "$json_output" "$errors_only")
          echo "$output"
          echo ""
          # Extract passed/total from "Passed: N/M" line
          local line
          line=$(echo "$output" | grep -oE 'Passed: [0-9]+/[0-9]+' || true)
          if [[ -n "$line" ]]; then
            local p t
            p=$(echo "$line" | grep -oE '[0-9]+' | head -1)
            t=$(echo "$line" | grep -oE '[0-9]+' | tail -1)
            grand_pass=$((grand_pass + p))
            grand_total=$((grand_total + t))
          fi
        fi
      else
        if [[ "$json_output" == "false" ]]; then
          echo "Skipping $c (not available)"
          echo ""
        fi
      fi
    done
    
    if [[ "$json_output" == "true" ]]; then
      echo "["
      local first=true
      for r in "${results[@]}"; do
        [[ "$first" == "false" ]] && echo ","
        echo "$r"
        first=false
      done
      echo "]"
    elif [[ "$grand_total" -gt 0 ]]; then
      local grand_pct
      grand_pct=$(echo "scale=1; $grand_pass * 100 / $grand_total" | bc)
      echo "=== Total Coverage ==="
      echo "Parse coverage: ${grand_pct}%"
      echo "Passed: $grand_pass/$grand_total"
    fi
  else
    run_corpus_test "$corpus" "$json_output" "$errors_only"
  fi
}

main "$@"
