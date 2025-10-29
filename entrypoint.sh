#!/bin/sh
set -e

echo "🔍 Waiting for PostgreSQL to start..."
# Wait for PostgreSQL to be ready
until pg_isready -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-csruser}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

echo "🔄 Setting up database schema..."
if [ -f /app/seed_db.sql ]; then
    echo "📄 Using comprehensive SQL dump for database setup..."
    # Check if database has existing tables
    TABLE_COUNT=$(PGPASSWORD=${DB_PASS:-csrpass} psql -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-csruser} -d ${DB_NAME:-csrdb} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';" 2>/dev/null || echo "0")
    
    if [ "$TABLE_COUNT" -eq "0" ]; then
        echo "🌱 Database is empty, loading comprehensive seed data..."
        PGPASSWORD=${DB_PASS:-csrpass} psql -h ${DB_HOST:-db} -p ${DB_PORT:-5432} -U ${DB_USER:-csruser} -d ${DB_NAME:-csrdb} -f /app/seed_db.sql
        echo "✅ Database populated with comprehensive seed data (202 users, 100 requests, 10 categories, 60 matches)"
    else
        echo "📊 Database already contains $TABLE_COUNT tables, skipping seed data"
    fi
    
    # Initialize Flask migrations after data is loaded
    flask db init 2>/dev/null || echo "Migration folder already exists"
    flask db stamp head 2>/dev/null || echo "Could not stamp database"
else
    echo "⚠️ seed_db.sql not found, using Flask migrations and Python seed script"
    flask db upgrade || (flask db init && flask db migrate -m "Initial migration" && flask db upgrade)
    python -m app.seed_data
fi

echo "🚀 Starting Flask application..."
exec gunicorn -b 0.0.0.0:5000 "app:create_app()" --workers 4 --timeout 120 --keep-alive 2 --max-requests 1000
