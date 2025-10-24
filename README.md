# CSIT314 CSR Assistance Platform

This project provides a Community Support Request (CSR) system where Public Individuals in Need (PINs) can request help and Customer Support Representatives (CSRs) can respond to assist them. The system uses Flask (Python) for backend, React for frontend, and PostgreSQL as the database, all containerized with Docker.

##  Setup Instructions

### Run with Docker (Recommended)

1. Clone the repository
   git clone https://github.com/<your-username>/csit314-csr-flask.git
   cd csit314-csr-flask

2. Configure environment variables  
   Copy the template file and edit if needed  
   cp .env.example .env

   Verify these values:
   DB_HOST=db  
   DB_PORT=5432  
   DB_USER=postgres  
   DB_PASS=postgres  
   DB_NAME=csrdb  
   SECRET_KEY=supersecretkey  
   FLASK_ENV=development

3. Build and start all containers  
   docker-compose up -d --build

   This will:
   - Build the Flask backend
   - Start PostgreSQL and pgAdmin
   - Wait until the database is healthy
   - Run Flask at http://localhost:5070
   - Expose pgAdmin at http://localhost:5050

   pgAdmin login:
   Email: admin@csr.com  
   Password: admin123

   Database connection inside pgAdmin:
   Host: db  
   Port: 5432  
   Username: postgres  
   Password: postgres  
   Database: csrdb

## Restoring the Team Seed Data

The shared test dataset is stored in:
   /db/seed_data.sql

To import after containers are running:
   docker exec -i db psql -U postgres -d csrdb < db/seed_data.sql

This will:
   - Create all 6 tables (users, categories, pin_requests, match_history, etc.)
   - Insert all test data (users, PIN requests, and matches)
   - Apply all foreign key relationships

To confirm the data:
   docker exec -it db psql -U postgres -d csrdb
   \dt
   SELECT COUNT(*) FROM pin_requests;

## Backing Up Your Data

Before stopping or rebuilding containers, create a backup:
   docker exec -t db pg_dump -U postgres csrdb > backup_$(date +%F).sql

To restore from a backup:
   docker exec -i db psql -U postgres -d csrdb < backup_YYYY-MM-DD.sql

## Stopping and Restarting

Stop containers (data remains safe):
   docker-compose down

Restart later:
   docker-compose up -d

⚠️ Never use -v unless you intend to delete the database:
   docker-compose down -v

## 🔍 Useful Development Commands

Run migrations:
   docker-compose exec web flask db upgrade

Reseed database manually:
   docker exec -i db psql -U postgres -d csrdb < db/seed_data.sql

View running containers:
   docker ps

Access Flask logs:
   docker-compose logs -f web

Open PostgreSQL shell:
   docker exec -it db psql -U postgres -d csrdb


- Docker volume "postgres_data" keeps all data persistent between rebuilds.
- seed_data.sql includes 200+ users, 100 PIN requests, and all relationships.
- Every teammate can clone, seed, and use the same database easily.
- No binary database files are committed—only the portable .sql dump.


