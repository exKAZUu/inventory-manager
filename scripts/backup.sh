#!/usr/bin/env bash
# Railway 上で `railway run bash scripts/backup.sh` のように実行。
# DATABASE_PATH (例: /data/inventory.sqlite3) を同ディレクトリにスナップショット。
set -euo pipefail
SRC="${DATABASE_PATH:-/data/inventory.sqlite3}"
DIR="$(dirname "$SRC")"
TS="$(date +%Y%m%d-%H%M%S)"
DEST="$DIR/backup-$TS.sqlite3"
cp -- "$SRC" "$DEST"
echo "Backed up $SRC -> $DEST"
