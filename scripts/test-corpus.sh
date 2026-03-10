#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORPORA_DIR="$PROJECT_ROOT/.test-corpora"
FIXTURES_DIR="$PROJECT_ROOT/../open-mcp-sysml/tests/fixtures/sysml-v2/sysml/src"

usage() {
  cat <<EOF
Usage: $(basename "$0") <corpus> [--json] [--errors-only]

Test a corpus against tree-sitter-sysml parser.

Corpora:
  training    OMG Training files (local fixtures)
  examples    OMG Examples files (local fixtures)
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
  output=$(npx tree-sitter parse "$file" 2>&1)
  if echo "$output" | grep -qi error; then
    echo "$output" > "$LAST_ERROR_FILE"
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
      echo "$FIXTURES_DIR/training"
      ;;
    examples)
      echo "$FIXTURES_DIR/examples"
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
    case "$corpus" in
      training|examples)
        echo "Corpus '$corpus' not found at $path" >&2
        echo "Check that fixtures exist at expected location" >&2
        ;;
      gfse|advent|validation|library|sysmod|smarthome)
        echo "Corpus '$corpus' not found at $path" >&2
        echo "Run: ./scripts/fetch-corpora.sh $corpus" >&2
        ;;
    esac
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
    
    for c in "${all_corpora[@]}"; do
      if check_corpus_exists "$c" 2>/dev/null; then
        if [[ "$json_output" == "true" ]]; then
          results+=("$(run_corpus_test "$c" "$json_output" "$errors_only")")
        else
          run_corpus_test "$c" "$json_output" "$errors_only"
          echo ""
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
    fi
  else
    run_corpus_test "$corpus" "$json_output" "$errors_only"
  fi
}

main "$@"
