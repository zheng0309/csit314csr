# 🧪 Comprehensive Database Setup Test Guide

## What's New - Comprehensive Data

Your CSR system now uses the rich `seed_db.sql` file instead of simple Python seed data:

### 📊 **Database Contents**
- **202 Users**: Admins, Platform Managers, PINs (Persons in Need), CSR Representatives
- **100 PIN Requests**: Detailed volunteer requests with real Singapore locations
- **10 Categories**: Groceries, Healthcare, Tech Support, Transportation, etc.
- **60 Match History**: Completed volunteer matches with CSR representatives
- **Shortlist System**: CSR representatives can shortlist requests

### 🔍 **Enhanced API Endpoints**
- `/` - Health check with version info
- `/requests` - Enhanced requests with user, category, location, urgency
- `/users` - All users with roles and creation dates
- `/categories` - All volunteer request categories
- `/matches` - Match history between CSRs and requests
- `/stats` - Comprehensive statistics dashboard

## 🚀 **Testing Steps**

### 1. Start the System
```bash
# Stop any existing containers
docker compose down -v

# Start with comprehensive data
./setup.sh  # macOS/Linux
# OR
setup.bat   # Windows
```

### 2. Verify Database Population
Visit pgAdmin: http://localhost:5050
- Email: `admin@csr.com`
- Password: `admin123`

Connect to database:
- Host: `db`
- Port: `5432`
- Username: `csruser`
- Password: `csrpass`
- Database: `csrdb`

### 3. Check Tables
You should see these tables populated:
- `users` (202 records)
- `pin_requests` (100 records)
- `categories` (10 records)
- `match_history` (60 records)
- `csr_shortlist` (empty, ready for use)
- `reports` (empty, ready for use)

### 4. Test API Endpoints
```bash
# Health check
curl http://localhost:5000/

# Get all requests (enhanced with location, urgency, category)
curl http://localhost:5000/requests

# Get all users (202 users with different roles)
curl http://localhost:5000/users

# Get categories
curl http://localhost:5000/categories

# Get match history
curl http://localhost:5000/matches

# Get statistics
curl http://localhost:5000/stats
```

### 5. Test Frontend
Visit: http://localhost:3000

**Dashboard should show:**
- Total Requests: 100
- Total Users: 202
- Active Requests: ~30 (varies by status)
- Completion Rate: 60% (60 completed matches)

**Volunteer Requests page should show:**
- 100 detailed requests with real Singapore locations
- Different urgency levels (low, medium, high)
- Various categories (Groceries, Healthcare, etc.)
- Realistic descriptions

**Users page should show:**
- 202 users with different roles
- Admins, Platform Managers, PINs, CSR Reps
- Real names and email addresses

## 🎯 **Sample Data Examples**

### User Types:
- **Admin**: System Admin (`admin1@helpme.sg`)
- **Platform Manager**: Platform Manager (`manager1@helpme.sg`)
- **PINs**: Persons in Need (e.g., `weiming.tan@helpme.sg`)
- **CSR Reps**: Corporate volunteers (e.g., `weilun.chong@helpme.sg`)

### Request Categories:
1. Groceries & Errands
2. Home Maintenance
3. Technical Support
4. Healthcare Assistance
5. Education & Tutoring
6. Transportation Help
7. Pet Care
8. Financial Guidance
9. Meal Preparation
10. Companionship & Check-ins

### Sample Requests:
- "Help with grocery shopping at NTUC" (Tampines St 81)
- "Assistance with blood test visit" (Bedok North Rd)
- "Math tutoring for Primary 5" (Serangoon Ave 2)
- "Dog walking help" (Bukit Panjang Ring Rd)

## 🔧 **Troubleshooting**

### If seed data doesn't load:
```bash
# Check if seed_db.sql exists
ls -la seed_db.sql

# Manual database reset
docker compose down -v
docker compose up --build -d

# Check logs
docker compose logs web
```

### If API returns errors:
```bash
# Check Flask logs
docker compose logs web -f

# Test database connection
docker compose exec web python -c "from app.models import User; print(User.query.count())"
```

## ✅ **Success Indicators**

Your system is working correctly if:
- pgAdmin shows all 5 tables with data
- API `/stats` endpoint returns correct counts
- Frontend dashboard shows 202 users, 100 requests
- Volunteer requests show real Singapore locations
- Users page shows different role types
- No error messages in Docker logs

This comprehensive setup provides a realistic demo environment with authentic Singapore volunteer scenarios!
