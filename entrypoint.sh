#!/bin/sh
set -e

echo "🧱 Running migrations..."
flask db upgrade || (flask db init && flask db migrate && flask db upgrade)

echo "🚀 Starting Flask app..."
exec gunicorn --timeout 300 -b 0.0.0.0:5000 "app:create_app()"
