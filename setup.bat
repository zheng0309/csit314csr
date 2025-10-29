@echo off
REM CSR Volunteer Hub - Windows Setup Script

echo 🌟 CSR Volunteer Hub Setup Script
echo =================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first:
    echo    https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not available. Please install Docker Desktop.
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker-compose
) else (
    set COMPOSE_CMD=docker compose
)

echo ✅ Docker and Docker Compose are available

REM Create environment files if they don't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo DB_HOST=db
        echo DB_PORT=5432
        echo DB_USER=csruser
        echo DB_PASS=csrpass
        echo DB_NAME=csrdb
        echo SECRET_KEY=supersecretkey-windows
        echo FLASK_ENV=development
    ) > .env
    echo ✅ Backend .env file created
) else (
    echo ✅ Backend .env file already exists
)

REM Create frontend environment file
if not exist frontend\.env (
    echo 📝 Creating frontend/.env file...
    if not exist frontend mkdir frontend
    (
        echo REACT_APP_API_URL=http://localhost:5000
    ) > frontend\.env
    echo ✅ Frontend .env file created
) else (
    echo ✅ Frontend .env file already exists
)

echo.
echo 🚀 Starting the application...
echo This may take a few minutes on first run...

REM Build and start services
%COMPOSE_CMD% down -v >nul 2>&1
%COMPOSE_CMD% build --no-cache
%COMPOSE_CMD% up -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📱 Access your application:
echo    Frontend (React):     http://localhost:3000
echo    Backend API (Flask):  http://localhost:5000
echo    pgAdmin (Database UI): http://localhost:5050
echo    Database (PostgreSQL): localhost:5432
echo.
echo 🔑 pgAdmin Login:
echo    Email:    admin@csr.com
echo    Password: admin123
echo.
echo 🔧 Useful commands:
echo    View logs:     %COMPOSE_CMD% logs -f
echo    Stop services: %COMPOSE_CMD% down
echo    Restart:       %COMPOSE_CMD% restart
echo.
echo 📚 The system includes:
echo    - 202 users (Admins, Platform Managers, PINs, CSR Reps)
echo    - 100 detailed volunteer requests with real locations
echo    - 10 request categories (Groceries, Healthcare, Tech Support, etc.)
echo    - 60 completed match history records
echo    - Complete REST API with enhanced endpoints
echo    - Responsive React frontend with Material-UI
echo    - pgAdmin for database management
echo.
pause
