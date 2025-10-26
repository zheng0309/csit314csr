print("routes.py loaded")   # <-- add this at the top

from flask import Blueprint, jsonify, request
from app.database import db
from app.models import User, PinRequest

main = Blueprint('main', __name__)


from flask import Blueprint, jsonify, request
from app.database import db
from app.models import User, PinRequest


main = Blueprint('main', __name__)

@main.route('/')
def health_check():
    return jsonify({"message": "CSR Volunteer System is running"}), 200

# -------------------------------
# 🧾 PIN Login Endpoint
# -------------------------------
@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=data['email'], password=data['password']).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if user.role != "PIN":
        return jsonify({"error": "Only PIN users can log in here"}), 403

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200

# List all requests
@main.route('/requests')
def get_requests():
    requests = PinRequest.query.all()
    results = [
        {
            "id": req.request_id,
            "title": req.title,
            "description": req.description,
            "status": req.status,
        }
        for req in requests
    ]
    return jsonify(results), 200

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

# -------------------------------
# Create a New Help Request
# -------------------------------
@main.route('/api/help-requests', methods=['POST'])
def create_help_request():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({"error": "Title and description are required"}), 400

    # Create new help request
    new_request = PinRequest(
        title=data['title'],
        description=data['description'],
        category=data.get('category'),
        priority=data.get('priority'),
        status="Open",
        pin_id=data.get('pin_id') 
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "message": "Help request created successfully",
        "id": new_request.request_id
    }), 201


