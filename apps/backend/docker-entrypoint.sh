#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  node dist/database/migrate.js
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding demo data..."
  node dist/database/seed.js || echo "Seed skipped or failed (non-fatal)."
fi

echo "Starting Lawyered backend..."
exec node dist/main.js
