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



## ⚙️ Quick Setup Instructions

### **🚀 One-Command Setup (Recommended)**

**For macOS/Linux:**
```bash
git clone https://github.com/zheng0309/csit314csr.git
cd csit314csr
./setup.sh
```

**For Windows:**
```cmd
git clone https://github.com/zheng0309/csit314csr.git
cd csit314csr
setup.bat
```

The setup script will automatically:
- ✅ Check Docker installation
- ✅ Create environment files
- ✅ Build and start all services
- ✅ Initialize database with comprehensive seed data
- ✅ Provide access URLs and credentials

### **📱 Access Your Application**
| Service                 | URL                                            | Description         |
| ----------------------- | ---------------------------------------------- | ------------------- |
| **Frontend (React)**    | [http://localhost:3000](http://localhost:3000) | User interface      |
| **Backend API (Flask)** | [http://localhost:5000](http://localhost:5000) | REST API            |
| **pgAdmin (Database UI)** | [http://localhost:5050](http://localhost:5050) | Database management |
| **Database (PostgreSQL)** | localhost:5432 | Database server     |

### **🔑 pgAdmin Login Credentials**
- **Email:** `admin@csr.com`
- **Password:** `admin123`

### **🗄️ Database Connection in pgAdmin**
Once logged into pgAdmin, add a new server with these details:
- **Host:** `db` (or `localhost` if connecting from outside Docker)
- **Port:** `5432`
- **Username:** `csruser`
- **Password:** `csrpass`
- **Database:** `csrdb`

### **🔧 Manual Setup (Alternative)**

If you prefer manual setup:

#### Step 1. Clone and navigate
```bash
git clone https://github.com/zheng0309/csit314csr.git
cd csit314csr
```

#### Step 2. Create environment files
```bash
# Backend environment
cat > .env << EOF
DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey
FLASK_ENV=development
EOF

# Frontend environment
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
```

#### Step 3. Start with Docker Compose
```bash
docker compose up --build -d
```



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

### Continuous Deployment (CD)

After CI succeeds on `main`, the repository publishes a Docker image to GitHub Container Registry (GHCR).
- Image name: `ghcr.io/<your-github-username>/csit314csr`
- Tags published: `latest` and the commit SHA (e.g. `ghcr.io/<user>/csit314csr:<sha>`)

The publish step is configured to run only for pushes to `main`. To view published images, go to your GitHub profile or repository Packages tab (or visit `https://github.com/<your-github-username>?tab=packages`).

If your organization restricts `GITHUB_TOKEN` package write access, configure a Personal Access Token (PAT) with `write:packages` scope and set it as a repository secret, then update the workflow login step accordingly.


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
REACT_APP_API_URL=http://localhost:5000

---

## 🛠️ Troubleshooting

### Common Issues

**🐳 Docker Issues:**
- **"Docker not found"**: Install Docker Desktop from https://docker.com
- **Port conflicts**: Change ports in `docker-compose.yml` if needed
- **Permission errors**: Run `docker` commands with `sudo` on Linux

**🌐 Connection Issues:**
- **Frontend can't reach backend**: Check if backend is running on port 5000
- **Database connection failed**: Wait 30 seconds after startup for PostgreSQL
- **CORS errors**: Backend has CORS enabled for `localhost:3000`

**🔧 Development Issues:**
- **Hot reload not working**: Ensure volumes are mounted correctly
- **Environment variables**: Check `.env` files exist and have correct values
- **Dependencies**: Run `docker compose build --no-cache` to rebuild

### Platform-Specific Notes

**Windows:**
- Use Git Bash or PowerShell for best compatibility
- Docker Desktop must be running
- WSL2 backend recommended for better performance

**macOS:**
- Docker Desktop requires macOS 10.15+
- Apple Silicon (M1/M2) users: Images build for ARM64 automatically
- Intel Macs: Standard x86_64 images

**Linux:**
- Install Docker Engine + Docker Compose separately
- Add user to docker group: `sudo usermod -aG docker $USER`
- Restart shell after group change

### Getting Help

**View Logs:**
```bash
docker compose logs -f          # All services
docker compose logs -f web      # Backend only
docker compose logs -f frontend # Frontend only
```

**Reset Everything:**
```bash
docker compose down -v
docker system prune -f
./setup.sh  # or setup.bat on Windows
```

**Manual Database Reset:**
```bash
docker compose exec web flask db downgrade
docker compose exec web flask db upgrade
docker compose exec web python -m app.seed_data
```

