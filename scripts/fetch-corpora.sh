#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORPORA_DIR="$PROJECT_ROOT/.test-corpora"

usage() {
  cat <<EOF
Usage: $(basename "$0") [command] [corpus...]

Fetch external test corpora for grammar validation.

Commands:
  fetch [corpus...]   Download specified corpora (default: all)
  clean [corpus...]   Remove specified corpora (default: all)
  status              Show which corpora are available
  help                Show this help

Corpora:
  gfse        GfSE/SysML-v2-Models (GitHub)
  advent      sensmetry/advent-of-sysml-v2 (GitHub)
  validation  OMG SysML v2 validation files (GitHub)
  library     OMG SysML v2 standard library (GitHub)
  sysmod      MBSE4U/sysmod-sysmlv2 (GitHub)
  smarthome   sensmetry/smart-home-hub-example (GitHub)
  all         All external corpora

Note: 'training' and 'examples' are local fixtures, not fetched.

Examples:
  $(basename "$0")              # Fetch all
  $(basename "$0") fetch gfse   # Fetch only GfSE
  $(basename "$0") clean        # Remove all fetched corpora
  $(basename "$0") status       # Show what's available
EOF
  exit 0
}

fetch_gfse() {
  local target="$CORPORA_DIR/gfse"
  if [[ -d "$target" ]]; then
    echo "gfse: Already exists, skipping (use 'clean gfse' first to re-fetch)"
    return 0
  fi
  
  echo "gfse: Cloning GfSE/SysML-v2-Models..."
  mkdir -p "$CORPORA_DIR"
  git clone --depth 1 --quiet https://github.com/GfSE/SysML-v2-Models.git "$target"
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "gfse: Fetched $count .sysml files"
}

fetch_advent() {
  local target="$CORPORA_DIR/advent"
  if [[ -d "$target" ]]; then
    echo "advent: Already exists, skipping (use 'clean advent' first to re-fetch)"
    return 0
  fi
  
  echo "advent: Cloning sensmetry/advent-of-sysml-v2..."
  mkdir -p "$CORPORA_DIR"
  git clone --depth 1 --quiet https://github.com/sensmetry/advent-of-sysml-v2.git "$target"
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "advent: Fetched $count .sysml files"
}

fetch_validation() {
  local target="$CORPORA_DIR/validation"
  if [[ -d "$target" ]]; then
    echo "validation: Already exists, skipping (use 'clean validation' first to re-fetch)"
    return 0
  fi

  echo "validation: Cloning SysML-v2-Release (sparse: sysml/src/validation)..."
  mkdir -p "$CORPORA_DIR"
  git clone --no-checkout --depth 1 --filter=blob:none --quiet \
    https://github.com/Systems-Modeling/SysML-v2-Release.git "$target"
  (cd "$target" && git sparse-checkout set sysml/src/validation && git checkout --quiet)
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "validation: Fetched $count .sysml files"
}

fetch_library() {
  local target="$CORPORA_DIR/library"
  if [[ -d "$target" ]]; then
    echo "library: Already exists, skipping (use 'clean library' first to re-fetch)"
    return 0
  fi

  echo "library: Cloning SysML-v2-Release (sparse: sysml.library)..."
  mkdir -p "$CORPORA_DIR"
  git clone --no-checkout --depth 1 --filter=blob:none --quiet \
    https://github.com/Systems-Modeling/SysML-v2-Release.git "$target"
  (cd "$target" && git sparse-checkout set sysml.library && git checkout --quiet)
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "library: Fetched $count .sysml files"
}

fetch_sysmod() {
  local target="$CORPORA_DIR/sysmod"
  if [[ -d "$target" ]]; then
    echo "sysmod: Already exists, skipping (use 'clean sysmod' first to re-fetch)"
    return 0
  fi

  echo "sysmod: Cloning MBSE4U/sysmod-sysmlv2..."
  mkdir -p "$CORPORA_DIR"
  git clone --depth 1 --quiet https://github.com/MBSE4U/sysmod-sysmlv2.git "$target"
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "sysmod: Fetched $count .sysml files"
}

fetch_smarthome() {
  local target="$CORPORA_DIR/smarthome"
  if [[ -d "$target" ]]; then
    echo "smarthome: Already exists, skipping (use 'clean smarthome' first to re-fetch)"
    return 0
  fi

  echo "smarthome: Cloning sensmetry/smart-home-hub-example..."
  mkdir -p "$CORPORA_DIR"
  git clone --depth 1 --quiet https://github.com/sensmetry/smart-home-hub-example.git "$target"
  local count
  count=$(find "$target" -name "*.sysml" | wc -l | tr -d ' ')
  echo "smarthome: Fetched $count .sysml files"
}

clean_corpus() {
  local corpus="$1"
  local target="$CORPORA_DIR/$corpus"
  
  if [[ -d "$target" ]]; then
    echo "$corpus: Removing..."
    rm -rf "$target"
    echo "$corpus: Removed"
  else
    echo "$corpus: Not present"
  fi
}

clean_all() {
  if [[ -d "$CORPORA_DIR" ]]; then
    echo "Removing all corpora at $CORPORA_DIR..."
    rm -rf "$CORPORA_DIR"
    echo "Done"
  else
    echo "No corpora directory exists"
  fi
}

show_status() {
  echo "=== Corpus Status ==="
  echo ""
  echo "Local (fixtures):"
  local fixtures_dir="$PROJECT_ROOT/../open-mcp-sysml/tests/fixtures/sysml-v2/sysml/src"
  
  if [[ -d "$fixtures_dir/training" ]]; then
    local count
    count=$(find "$fixtures_dir/training" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  training: $count files"
  else
    echo "  training: NOT FOUND"
  fi
  
  if [[ -d "$fixtures_dir/examples" ]]; then
    local count
    count=$(find "$fixtures_dir/examples" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  examples: $count files"
  else
    echo "  examples: NOT FOUND"
  fi
  
  echo ""
  echo "External (fetched):"
  
  if [[ -d "$CORPORA_DIR/gfse" ]]; then
    local count
    count=$(find "$CORPORA_DIR/gfse" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  gfse: $count files"
  else
    echo "  gfse: not fetched (run: ./scripts/fetch-corpora.sh gfse)"
  fi
  
  if [[ -d "$CORPORA_DIR/advent" ]]; then
    local count
    count=$(find "$CORPORA_DIR/advent" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  advent: $count files"
  else
    echo "  advent: not fetched (run: ./scripts/fetch-corpora.sh advent)"
  fi

  if [[ -d "$CORPORA_DIR/validation" ]]; then
    local count
    count=$(find "$CORPORA_DIR/validation" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  validation: $count files"
  else
    echo "  validation: not fetched (run: ./scripts/fetch-corpora.sh validation)"
  fi

  if [[ -d "$CORPORA_DIR/library" ]]; then
    local count
    count=$(find "$CORPORA_DIR/library" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  library: $count files"
  else
    echo "  library: not fetched (run: ./scripts/fetch-corpora.sh library)"
  fi

  if [[ -d "$CORPORA_DIR/sysmod" ]]; then
    local count
    count=$(find "$CORPORA_DIR/sysmod" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  sysmod: $count files"
  else
    echo "  sysmod: not fetched (run: ./scripts/fetch-corpora.sh sysmod)"
  fi

  if [[ -d "$CORPORA_DIR/smarthome" ]]; then
    local count
    count=$(find "$CORPORA_DIR/smarthome" -name "*.sysml" 2>/dev/null | wc -l | tr -d ' ')
    echo "  smarthome: $count files"
  else
    echo "  smarthome: not fetched (run: ./scripts/fetch-corpora.sh smarthome)"
  fi
}

main() {
  local command="fetch"
  local corpora=()
  
  while [[ $# -gt 0 ]]; do
    case "$1" in
      fetch|clean|status|help)
        command="$1"
        shift
        ;;
      --help|-h)
        usage
        ;;
      gfse|advent|validation|library|sysmod|smarthome|all)
        corpora+=("$1")
        shift
        ;;
      *)
        echo "Unknown argument: $1" >&2
        echo "Run '$(basename "$0") help' for usage" >&2
        exit 1
        ;;
    esac
  done
  
  case "$command" in
    help)
      usage
      ;;
    status)
      show_status
      ;;
    clean)
      if [[ ${#corpora[@]} -eq 0 ]] || [[ " ${corpora[*]} " =~ " all " ]]; then
        clean_all
      else
        for c in "${corpora[@]}"; do
          clean_corpus "$c"
        done
      fi
      ;;
    fetch)
      if [[ ${#corpora[@]} -eq 0 ]] || [[ " ${corpora[*]} " =~ " all " ]]; then
        fetch_gfse
        fetch_advent
        fetch_validation
        fetch_library
        fetch_sysmod
        fetch_smarthome
      else
        for c in "${corpora[@]}"; do
          case "$c" in
            gfse) fetch_gfse ;;
            advent) fetch_advent ;;
            validation) fetch_validation ;;
            library) fetch_library ;;
            sysmod) fetch_sysmod ;;
            smarthome) fetch_smarthome ;;
          esac
        done
      fi
      ;;
  esac
}

main "$@"
