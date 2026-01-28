#!/bin/sh
set -e

# Resolve any failed migrations (one-time fix for P3009)
npx prisma migrate resolve --applied 20250101000000_init 2>/dev/null || true

# Run database migrations
npx prisma migrate deploy

# Start the application
exec node server.js
