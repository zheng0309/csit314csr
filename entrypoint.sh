#!/bin/sh
# entrypoint.sh for Flask + SQLite
set -e

echo "Applying migrations..."
# If migrations folder doesn't exist, `flask db init` will be run automatically by migrate commands below when needed
flask db upgrade || (flask db init && flask db migrate && flask db upgrade)

echo "Seeding test data..."
python -m app.seed_data

echo "Starting Flask app..."
exec "$@"
