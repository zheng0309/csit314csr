from flask import Blueprint, jsonify
from app.database import db
from app.models import User, PinRequest

# Create a Flask Blueprint
main = Blueprint('main', __name__)

# Health check endpoint (simple)
@main.route('/')
def health_check():
    return jsonify({"message": "CSR Volunteer System is running"}), 200


# Example endpoint: View all volunteer requests
@main.route('/requests')
def get_requests():
    requests = PinRequest.query.all()
    results = [
        {
            "id": req.id,
            "title": req.title,
            "description": req.description,
            "status": req.status,
        }
        for req in requests
    ]
    return jsonify(results), 200


# Example endpoint: View all users (optional)
@main.route('/users')
def get_users():
    users = User.query.all()
    results = [
        {
            "id": u.id,
            "name": u.name,
            "role": u.role,
            "email": u.email,
        }
        for u in users
    ]
    return jsonify(results), 200
