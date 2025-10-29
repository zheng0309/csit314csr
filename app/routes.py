from flask import Blueprint, jsonify, request
from app.database import db
from app.models import User, PinRequest, Category, MatchHistory, CsrShortlist
from sqlalchemy.orm import joinedload

# Create a Flask Blueprint
main = Blueprint('main', __name__)

# Health check endpoint
@main.route('/')
def health_check():
    return jsonify({
        "message": "CSR Volunteer System is running",
        "status": "healthy",
        "version": "2.0"
    }), 200

# Get all volunteer requests with enhanced data
@main.route('/requests')
def get_requests():
    try:
        requests = PinRequest.query.options(
            joinedload(PinRequest.user),
            joinedload(PinRequest.category)
        ).all()
        
        results = []
        for req in requests:
            result = {
                "id": req.id,  # Uses the legacy property
                "title": req.title,
                "description": req.description,
                "status": req.status or "open",
                "location": req.location,
                "urgency": req.urgency,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "completed_at": req.completed_at.isoformat() if req.completed_at else None,
                "completion_note": req.completion_note,
                "user": {
                    "id": req.user.id,
                    "name": req.user.name,
                    "role": req.user.role
                } if req.user else None,
                "category": {
                    "id": req.category.categories_id,
                    "name": req.category.name,
                    "description": req.category.description
                } if req.category else None
            }
            results.append(result)
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all users with enhanced data
@main.route('/users')
def get_users():
    try:
        users = User.query.all()
        results = []
        for user in users:
            result = {
                "id": user.id,  # Uses the legacy property
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
            results.append(result)
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all categories
@main.route('/categories')
def get_categories():
    try:
        categories = Category.query.all()
        results = [
            {
                "id": cat.categories_id,
                "name": cat.name,
                "description": cat.description
            }
            for cat in categories
        ]
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get match history
@main.route('/matches')
def get_matches():
    try:
        matches = MatchHistory.query.options(
            joinedload(MatchHistory.csr),
            joinedload(MatchHistory.request)
        ).all()
        
        results = []
        for match in matches:
            result = {
                "id": match.match_history_id,
                "matched_at": match.matched_at.isoformat() if match.matched_at else None,
                "status": match.match_status,
                "csr": {
                    "id": match.csr.id,
                    "name": match.csr.name,
                    "email": match.csr.email
                } if match.csr else None,
                "request": {
                    "id": match.request.id,
                    "title": match.request.title,
                    "status": match.request.status
                } if match.request else None
            }
            results.append(result)
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get statistics
@main.route('/stats')
def get_stats():
    try:
        stats = {
            "total_users": User.query.count(),
            "total_requests": PinRequest.query.count(),
            "total_categories": Category.query.count(),
            "total_matches": MatchHistory.query.count(),
            "users_by_role": {
                "admin": User.query.filter_by(role='admin').count(),
                "platform_manager": User.query.filter_by(role='platform_manager').count(),
                "csr_rep": User.query.filter_by(role='csr_rep').count(),
                "pin": User.query.filter_by(role='pin').count()
            },
            "requests_by_status": {
                "open": PinRequest.query.filter_by(status='open').count(),
                "matched": PinRequest.query.filter_by(status='matched').count(),
                "closed": PinRequest.query.filter_by(status='closed').count()
            }
        }
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
