#!/usr/bin/env bash
set -euo pipefail

test -s README.md
test -s AGENTS.md
test -s docs/PRODUCT.md
test -s docs/MVP.md
test -s docs/ARCHITECTURE.md
test -s docs/ROADMAP.md
test -s docs/STATE_MODEL.md
test -s docs/API_CONTRACTS.md
test -s docs/TESTING.md
test -s docs/spec/runtime-semantics.md

if rg -n "T[O]DO|T[B]D|F[I]XME|P[L]ACEHOLDER" README.md AGENTS.md docs CHANGELOG.md; then
  exit 1
fi

git diff --check

whitespace_failed=0
while IFS= read -r -d '' file; do
  case "$file" in
    *.css|*.html|*.js|*.json|*.md|*.sh|*.ts|*.tsx|*.yaml|*.yml)
      if grep -n '[[:blank:]]$' "$file"; then
        whitespace_failed=1
      fi
      ;;
  esac
done < <(git ls-files -z --cached --others --exclude-standard)

if [ "$whitespace_failed" -ne 0 ]; then
  exit 1
fi
