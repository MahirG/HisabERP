#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="$BACKUP_DIR/hisab-erp-$STAMP.dump"
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" > "$FILE"
sha256sum "$FILE" > "$FILE.sha256"
echo "Backup written to $FILE"
