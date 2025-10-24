# 🏢 CSIT314 Group Project — CSR Volunteer Matching System

## 🌐 Full-Stack Corporate Social Responsibility Platform

### **Technology Stack**
- **Frontend:** React (Node.js, npm, Vite)
- **Backend:** Python (Flask, SQLAlchemy, Flask-Migrate)
- **Database:** PostgreSQL (via Docker)
- **CI/CD:** GitHub Actions
- **Containerization:** Docker & Docker Compose

---

## 📘 Project Overview

This repository contains the **Corporate Social Responsibility (CSR) Volunteer Matching System** developed for **CSIT314 – Software Development Methodologies**.

The system connects **Corporate Volunteers (CSR Representatives)** with **Persons-in-Need (PINs)** and demonstrates **Agile**, **Test-Driven Development (TDD)**, and **Continuous Integration/Continuous Deployment (CI/CD)** practices.

---

## 🚀 Main Features

### 🧩 Core System
- Multi-role support (**Admin**, **CSR Representative**, **PIN**)
- Manage and track volunteer requests
- Search and shortlist volunteer opportunities
- Auto-generate 100+ sample data records
- Integrated PostgreSQL with **pgAdmin** web UI
- RESTful API built with Flask
- Continuous Integration with **GitHub Actions**

### 💻 Frontend Additions
- Built with **React + Vite**
- Responsive and modern UI (using TailwindCSS)
- Interacts with Flask backend via REST API
- Environment-based configuration for API URL
- Production build handled via `npm run build`
- Included in Docker Compose for one-command startup

---

## 🗂️ Folder Structure
csit314-csr/
│
├── app/ # Flask backend
│ ├── init.py # App factory
│ ├── models.py # ORM models (User, PinRequest)
│ ├── routes.py # API endpoints
│ ├── seed_data.py # Script to seed test data
│ ├── templates/ # Optional HTML templates
│ └── static/ # Optional static files
│
├── frontend/ # React frontend
│ ├── src/
│ │ ├── components/ # UI components
│ │ ├── pages/ # Views / pages
│ │ ├── services/ # API integration
│ │ └── App.jsx
│ ├── package.json # npm dependencies
│ ├── vite.config.js # Vite configuration
│ └── .env.example # Frontend API URL template
│
├── migrations/ # Database migrations
├── docker-compose.yml # Runs Flask, PostgreSQL, pgAdmin, and Frontend
├── Dockerfile # Backend Dockerfile
├── Dockerfile.frontend # (optional) Frontend Dockerfile
├── entrypoint.sh # Startup script for backend
├── requirements.txt # Python dependencies
├── .env # Environment variables
├── .env.example # Template environment file
└── README.md # This file



## ⚙️ Setup Instructions

### **Option 1 – Run with Docker (Recommended)**

#### Step 1. Clone the repository

git clone https://github.com/zheng0309/csit314csr.git

cd csit314csr

## Step 2. Create environment file

cp .env.example .env

## Edit .env and verify values such as:

DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey
FLASK_ENV=development

#### Step 3. Build and start the containers

docker compose up --build


#### Step 4. Access the application
| Service                 | URL                                            | Description         |
| ----------------------- | ---------------------------------------------- | ------------------- |
| **Frontend (React)**    | [http://localhost:5173](http://localhost:3000) | User interface      |
| **Flask API (Backend)** | [http://localhost:5000](http://localhost:5000) | REST API            |
| **pgAdmin**             | [http://localhost:5050](http://localhost:5050) | Database management |


## pgAdmin login credentials:
Email: admin@csr.com
Password: admin123

## Database connection details:
Host: db
Port: 5432
Username: csruser
Password: csrpass

## Option 2 – Run Locally (Development Mode) **

## Backend: 
# From project root
cd app
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
flask db upgrade
python -m app.seed_data
flask run

Runs at: http://localhost:5000

## Frontend: 
cd frontend
npm install
npm start
Runs at: http://localhost:3000

## To build production: 
npm run build



## 🧪 Continuous Integration (CI/CD)

This project uses GitHub Actions to automatically:

Lint and test the Flask backend

Validate PostgreSQL connectivity

Build Docker images for backend and frontend

Run API integration tests

Workflow file: .github/workflows/ci.yml

Each push or pull request to the main branch triggers the CI pipeline.
View results under the Actions tab in GitHub.


## 🛠️ Development Commands

Run database migrations manually:

docker compose exec web flask db upgrade


 ## Seed data manually:

docker compose exec web python -m app.seed_data


## Rebuild from scratch:

docker compose down -v
docker compose up --build


## Frontend scripts:

npm run dev      # Run dev server
npm run build    # Build for production
npm run preview  # Preview production build

## 🔧 Environment Variables
Backend .env
DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey
FLASK_ENV=development

Frontend .env
VITE_API_URL=http://localhost:5000

