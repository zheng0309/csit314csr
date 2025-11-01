#!/bin/bash

# CSR Volunteer Hub - Cross-Platform Setup Script
# Works on macOS, Linux, and Windows (with Git Bash/WSL)

set -e

echo "🌟 CSR Volunteer Hub Setup Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first:"
    echo "   - Windows/macOS: https://www.docker.com/products/docker-desktop"
    echo "   - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Desktop or Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Parse args: support --external-db mode which *does not* create a local DB .env
USE_EXTERNAL_DB=false
for arg in "$@"; do
    case $arg in
        --external-db) USE_EXTERNAL_DB=true ;;
    esac
done

# Create environment files if they don't exist (only when not using external DB)
if [ "$USE_EXTERNAL_DB" = false ]; then
    if [ ! -f .env ]; then
        echo "📝 Creating .env file..."
        cat > .env << EOF
DB_HOST=db
DB_PORT=5432
DB_USER=csruser
DB_PASS=csrpass
DB_NAME=csrdb
SECRET_KEY=supersecretkey-$(openssl rand -hex 16 2>/dev/null || echo "fallback-key")
FLASK_ENV=development
EOF
        echo "✅ Backend .env file created"
    else
        echo "✅ Backend .env file already exists"
    fi
else
    if [ ! -f .env ]; then
        echo "⚠️  External DB mode: .env not created. Ensure you have a private .env with DB_HOST/DB_* and SECRET_KEY set before continuing."
        echo "   Example: DB_HOST=your-host.example.com"
        echo "Exiting to avoid creating a local DB .env. Re-run without --external-db to create local test env."
        exit 1
    else
        echo "✅ .env found (external DB mode)"
    fi
fi

# Create frontend environment file (always safe to create/update)
if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend/.env file..."
    mkdir -p frontend
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

echo ""
echo "🚀 Starting the application..."
echo "This may take a few minutes on first run..."

# Use docker compose (newer) or docker-compose (legacy)
# Use docker compose (newer) or docker-compose (legacy)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Choose compose file based on external-db flag
if [ "$USE_EXTERNAL_DB" = true ]; then
    COMPOSE_FILE="docker-compose.external-db.yml"
    echo "ℹ️  Using external DB compose file: $COMPOSE_FILE"
else
    COMPOSE_FILE="docker-compose.yml"
fi

# Build and start services
$COMPOSE_CMD -f "$COMPOSE_FILE" down -v 2>/dev/null || true
$COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache
$COMPOSE_CMD -f "$COMPOSE_FILE" up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "📱 Access your application:"
    echo "   Frontend (React):     http://localhost:3000"
    echo "   Backend API (Flask):  http://localhost:5000"
    if [ "$USE_EXTERNAL_DB" = false ]; then
        echo "   pgAdmin (Database UI): http://localhost:5050"
        echo "   Database (PostgreSQL): localhost:5432"
    else
        echo "   Note: running in external DB mode; database host comes from your .env (DB_HOST)"
    fi
    echo ""
    echo "🔑 pgAdmin Login:"
    echo "   Email:    admin@csr.com"
    echo "   Password: admin123"
    echo ""
    echo "🔧 Useful commands:"
    echo "   View logs:     $COMPOSE_CMD logs -f"
    echo "   Stop services: $COMPOSE_CMD down"
    echo "   Restart:       $COMPOSE_CMD restart"
    echo ""
    echo "📚 The system includes:"
    echo "   - 202 users (Admins, Platform Managers, PINs, CSR Reps)"
    echo "   - 100 detailed volunteer requests with real locations"
    echo "   - 10 request categories (Groceries, Healthcare, Tech Support, etc.)"
    echo "   - 60 completed match history records"
    echo "   - Complete REST API with enhanced endpoints"
    echo "   - Responsive React frontend with Material-UI"
    echo "   - pgAdmin for database management"
    echo ""
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   $COMPOSE_CMD logs"
fi
