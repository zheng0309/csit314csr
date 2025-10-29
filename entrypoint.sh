#!/bin/sh
set -e

echo "🔍 Waiting for PostgreSQL to start..."
# Wait for PostgreSQL to be ready
until pg_isready -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-csruser}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "🔄 Running database migrations..."
flask db upgrade || (flask db init && flask db migrate -m "Initial migration" && flask db upgrade)

echo "🌱 Seeding data..."
python -m app.seed_data

echo "🚀 Starting Flask application..."
exec gunicorn -b 0.0.0.0:5000 "app:create_app()" --workers 4 --timeout 120 --keep-alive 2 --max-requests 1000
