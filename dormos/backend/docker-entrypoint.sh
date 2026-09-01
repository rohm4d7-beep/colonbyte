#!/bin/sh
set -e

echo "==> Applying database migrations..."
until npx prisma migrate deploy; do
  echo "Database not ready yet, retrying in 3 seconds..."
  sleep 3
done

echo "==> Checking if database already has data..."
if node -e '
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.count()
  .then((c) => { console.log("Existing users:", c); process.exit(c > 0 ? 0 : 1); })
  .catch((e) => { console.error(e); process.exit(0); })
  .finally(() => p.$disconnect());
'
then
  echo "==> Database already seeded, skipping seed."
else
  echo "==> Empty database, seeding demo data..."
  npx prisma db seed
fi

echo "==> Starting DormOS API..."
exec node dist/src/main.js
