#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$ROOT/../BlackWaterLeaf-restore-2026-09-29.tar.gz}"
mkdir -p "$(dirname "$OUT")"

# Export only source, assets, migrations, tests and safe documentation.
# Never include Git history, dependencies, build output, env files or runtime secrets.
tar -czf "$OUT" \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='./dist' \
  --exclude='./mobile-natur/node_modules' \
  --exclude='./mobile-natur/dist' \
  --exclude='./mobile-natur/.expo' \
  --exclude='./.env' \
  --exclude='./.env.*' \
  --exclude='./runtime.env' \
  --exclude='./**/runtime.env' \
  --exclude='./**/*.pem' \
  --exclude='./**/*.key' \
  --exclude='./**/*secret*' \
  -C "$ROOT" .

sha256sum "$OUT" > "$OUT.sha256"
printf 'Created: %s\nChecksum: %s\n' "$OUT" "$OUT.sha256"
