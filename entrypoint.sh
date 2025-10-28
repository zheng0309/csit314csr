#!/usr/bin/env sh
set -e

echo "⏳ Waiting for database..."
# Optional: rely on compose healthcheck instead if you prefer
sleep 2

echo "🧱 Ensuring schema with SQLAlchemy (db.create_all)..."
python - <<'PY'
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
    print("✅ Tables ensured with db.create_all()")
PY

echo "Starting Flask app..."
exec gunicorn -b 0.0.0.0:5000 "app:create_app()"


#exec gunicorn -b 0.0.0.0:5000 "app:create_app()" --timeout 120
