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

    # ✅ Validate required fields
    if not data or not data.get('title') or not data.get('description') or not data.get('user_id'):
        return jsonify({"error": "Title, description, and user_id are required"}), 400

    # ✅ Create new help request
    new_request = PinRequest(
        title=data['title'],
        description=data['description'],
        user_id=data['user_id'],                 
        category_id=data.get('category_id'),     # Optional
        urgency=data.get('urgency', 'medium'),   
        location=data.get('location'),           # Optional
        status='open'                            
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "message": "Help request created successfully",
        "request": {
            "id": new_request.pin_requests_id,
            "title": new_request.title,
            "description": new_request.description,
            "urgency": new_request.urgency,
            "status": new_request.status,
            "user_id": new_request.user_id,
            "created_at": new_request.created_at
        }
    }), 201



# ---------------------------------
# Get all help requests by PIN ID
# ---------------------------------
@main.route('/api/help_requests/<int:user_id>', methods=['GET'])
def get_help_requests_by_user(user_id):
    help_requests = HelpRequest.query.filter_by(pin_id=pin_id).all()

    if not help_requests:
        return jsonify({"message": "No help requests found for this user."}), 404

    data = []
    for req in help_requests:
        data.append({
            "id": req.pin_requests_id,
            "title": req.title,
            "description": req.description,
            "category": req.category.name if req.category else None,
            "location": req.location,
            "status": req.status,
            "urgency": req.urgency,
            "completion_note": req.completion_note,
            "created_at": req.created_at,
            "completed_at": req.completed_at
        })
    return jsonify(data), 200
