#!/bin/sh
echo " Waiting for PostgreSQL to start..."
sleep 5

echo " Running migrations..."
flask db upgrade || flask db init && flask db migrate && flask db upgrade

echo " Seeding data..."
python -m app.seed_data

echo "Starting Flask app..."
exec gunicorn -b 0.0.0.0:5000 "app:create_app()"


#exec gunicorn -b 0.0.0.0:5000 "app:create_app()" --timeout 120
