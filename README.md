# 🧩 CSIT314 Group Project — CSR Volunteer Matching System  
**Technology Stack:** Python (Flask) · PostgreSQL · Docker · SQLAlchemy · Flask-Migrate

This repository contains the **Corporate Social Responsibility (CSR) Volunteer Matching System** developed for **CSIT314 – Software Development Methodologies**.  
The system connects **Corporate Volunteers (CSR Reps)** with **Persons-in-Need (PINs)** and demonstrates Agile, TDD, and CI/CD principles.

---

## 📘 Project Overview

**Main Features**
- Multi-role support (Admin, CSR Rep, PIN)
- Manage and track volunteer requests
- Search and shortlist opportunities
- Generate sample data (~100 records per entity)
- Built-in PostgreSQL integration via Docker
- Ready for CI/CD (GitHub Actions)

---

## 🗂️ Folder Structure
csit314-csr-flask/
│
├── app/ # Flask application package
│ ├── init.py # App factory (creates Flask app)
│ ├── database.py # Database + migrations setup
│ ├── models.py # ORM models (User, PinRequest)
│ ├── routes.py # API routes / endpoints
│ ├── seed_data.py # Generates 100+ test records
│ ├── templates/ # (Optional) HTML templates
│ └── static/ # (Optional) CSS / JS files
│
├── migrations/ # Created by Flask-Migrate
├── Dockerfile # Flask app image definition
├── docker-compose.yml # Runs Flask + PostgreSQL
├── entrypoint.sh # Waits for DB, runs migrations, seeds data
├── requirements.txt # Python dependencies
├── .env # Local environment variables (not committed)
├── .env.example # Template env file for teammates
├── .gitignore # Ignore secrets, caches, DB data
├── .gitattributes # Normalize line endings across OSes
└── README.md # This file


---

## ⚙️ Setup Instructions

### 🐳 Option 1 – Run with Docker (Recommended)

#### 1️⃣ Clone the repository
```bash
git clone https://github.com/👉<your-username>/csit314-csr-flask.git
cd csit314-csr-flask

2️⃣ Copy the environment file
cp .env.example .env


Edit .env if needed:

DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey

3️⃣ Build and start the containers
docker-compose up --build


This will:

Build the Flask image

Start PostgreSQL

Wait for DB readiness

Apply migrations

Generate 100+ test records

Run Gunicorn at port 5000

4️⃣ Access the app

Open your browser:

http://localhost:5000/


Endpoints

URL	Description
/	Health check
/requests	View sample volunteer requests
5️⃣ Stop the app
docker-compose down
