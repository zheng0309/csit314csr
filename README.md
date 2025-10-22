CSIT314 Group Project — CSR Volunteer Matching System

Technology Stack: Python (Flask), PostgreSQL, Docker, SQLAlchemy, Flask-Migrate, GitHub Actions (CI/CD)

This repository contains the Corporate Social Responsibility (CSR) Volunteer Matching System developed for CSIT314 – Software Development Methodologies.
The system connects Corporate Volunteers (CSR Representatives) with Persons-in-Need (PINs) and demonstrates Agile, TDD, and CI/CD practices.

Project Overview

Main Features

Multi-role support (Admin, CSR Representative, PIN)

Manage and track volunteer requests

Search and shortlist opportunities

Auto-generate sample data (100+ records)

Integrated PostgreSQL via Docker

pgAdmin web interface for database management

Continuous Integration via GitHub Actions

Folder Structure
csit314-csr-flask/
│
├── app/                      # Flask application package
│   ├── __init__.py           # App factory (creates Flask app)
│   ├── models.py             # ORM models (User, PinRequest)
│   ├── routes.py             # API routes / endpoints
│   ├── seed_data.py          # Script to seed 100+ test records
│   ├── templates/            # (Optional) HTML templates
│   └── static/               # (Optional) CSS / JS files
│
├── migrations/               # Database migrations (Flask-Migrate)
├── Dockerfile                # Flask app Docker image
├── docker-compose.yml        # Runs Flask, PostgreSQL, and pgAdmin
├── entrypoint.sh             # Waits for DB, applies migrations, seeds data
├── requirements.txt          # Python dependencies
├── .env                      # Environment variables (not committed)
├── .env.example              # Template environment file for teammates
├── .gitignore                # Ignore secrets, caches, and DB data
├── .gitattributes            # Normalize line endings across OSes
└── README.md                 # This file

Setup Instructions
Option 1 – Run with Docker (Recommended)
Step 1. Clone the repository
git clone https://github.com/<your-username>/csit314-csr-flask.git
cd csit314-csr-flask

Step 2. Create and configure the environment file
cp .env.example .env


Edit .env and verify the following values:

DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey
FLASK_ENV=development

Step 3. Build and start the containers
docker compose up --build

Step 4. python3 -m seed_data.py to seed test data

This will:

Build the Flask image

Start the PostgreSQL and pgAdmin containers

Wait for the database to become ready

Apply database migrations


Run the Flask app on port 5000

Step 4. Access the application

Flask API: http://localhost:5000/

pgAdmin (database UI): http://localhost:5050/

pgAdmin login credentials:

Email: admin@csr.com
Password: admin123


To connect pgAdmin to your database:

Host: db

Port: 5432

Username: csruser

Password: csrpass

API Endpoints
URL	Description
/	Health check endpoint
/requests	View sample volunteer requests
Stopping the Application

To stop all containers:

docker compose down


To remove all volumes and rebuild fresh:

docker compose down -v
docker compose up --build

Continuous Integration (CI/CD)

This project uses GitHub Actions to automatically:

Build and test the Flask app

Validate PostgreSQL connectivity

Build the Docker image

Workflow file: .github/workflows/ci.yml

Every push or pull request to the main branch triggers the CI pipeline.
You can view the results under the Actions tab in GitHub.

Development Notes

Run migrations manually (if needed):

docker compose exec web flask db upgrade


Seed data manually:

docker compose exec web python -m app.seed_data

..