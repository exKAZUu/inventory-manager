#!/usr/bin/env bash
set -euo pipefail

# Railway 環境では /data/inventory.db を /data/backup-YYYYMMDD.db にコピーする。
# 使い方: railway run bash scripts/backup.sh
SRC="${DATABASE_FILE:-/data/inventory.db}"
DST_DIR="$(dirname "$SRC")"
STAMP="$(date +%Y%m%d-%H%M%S)"
DST="$DST_DIR/backup-$STAMP.db"

if [ ! -f "$SRC" ]; then
  echo "DB not found: $SRC" >&2
  exit 1
fi

cp "$SRC" "$DST"
echo "Backed up to: $DST"
