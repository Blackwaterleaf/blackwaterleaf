#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
pnpm check
pnpm test
pnpm build

log_file="/tmp/bwl-production-health.log"
rm -f "$log_file"
NODE_ENV=production PORT=3100 node dist/index.js >"$log_file" 2>&1 &
pid=$!
cleanup() {
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3100/healthz > /tmp/bwl-health-response.json; then
    cat /tmp/bwl-health-response.json
    exit 0
  fi
  sleep 1
done

cat "$log_file" >&2
exit 1
