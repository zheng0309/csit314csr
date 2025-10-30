from flask import Blueprint, jsonify, request, session
from app.database import db
from app.models import User, PinRequest
from flask_cors import cross_origin

main = Blueprint('main', __name__)

# ---------------------------------
# 🩺 Health Check
# ---------------------------------
@main.route('/')
@cross_origin()
def health_check():
    return jsonify({"message": "CSR Volunteer System is running"}), 200


# ---------------------------------
# 🔐 Login (CSR + PIN)
# ---------------------------------
@main.route('/api/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=data['email'], password=data['password']).first()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # ✅ Allow both CSR and PIN users
    if user.role not in ["pin", "csr_rep"]:
        return jsonify({"error": f"User role '{user.role}' is not recognized"}), 403

    # ✅ Store session data
    session['user'] = {
        "users_id": user.users_id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }

    return jsonify({
        "message": f"Login successful as {user.role}",
        "user": {
            "users_id": user.users_id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


# ---------------------------------
# 🚪 Logout Endpoint
# ---------------------------------
@main.route('/api/logout', methods=['POST'])
@cross_origin()
def logout():
    session.pop('user', None)
    return jsonify({"message": "Logout successful"}), 200


# ---------------------------------
# 📋 Get All Requests
# ---------------------------------
@main.route('/requests', methods=['GET'])
@cross_origin()
def get_requests():
    requests = PinRequest.query.all()
    results = [
        {
            "id": req.pin_requests_id,
            "title": req.title,
            "description": req.description,
            "status": req.status,
        }
        for req in requests
    ]
    return jsonify(results), 200


# ---------------------------------
# 👥 Get All Users
# ---------------------------------
@main.route('/users', methods=['GET'])
@cross_origin()
def get_users():
    users = User.query.all()
    results = [
        {
            "users_id": u.users_id,
            "name": u.name,
            "role": u.role,
            "email": u.email,
        }
        for u in users
    ]
    return jsonify(results), 200


# ---------------------------------
# 🆕 Create New Help Request
# ---------------------------------
@main.route('/api/help-requests', methods=['POST'])
@cross_origin()
def create_help_request():
    data = request.get_json()

    if not data or not data.get('title') or not data.get('description') or not data.get('user_id'):
        return jsonify({"error": "Title, description, and user_id are required"}), 400

    new_request = PinRequest(
        title=data['title'],
        description=data['description'],
        user_id=data['user_id'],
        category_id=data.get('category_id'),
        urgency=data.get('urgency', 'medium'),      # Urgency is set to "medium", but there will be a dropdown box for PIN to choose other
        location=data.get('location'),
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
# 📦 Get Help Requests by PIN ID to see "status"
# ---------------------------------
@main.route('/api/help_requests/<int:user_id>', methods=['GET'])
@cross_origin()
def get_help_requests_by_user(user_id):
    help_requests = PinRequest.query.filter_by(user_id=user_id).all()

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
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "completed_at": req.completed_at.isoformat() if req.completed_at else None
        })
    return jsonify(data), 200


# ---------------------------------
# 📦 Get All Open Help Requests (For CSR)
# ---------------------------------
@main.route('/api/help_requests/open', methods=['GET'])
@cross_origin()
def get_open_help_requests():
    # Query all open help requests
    open_requests = PinRequest.query.filter_by(status='open').all()

    if not open_requests:
        return jsonify({"message": "No open help requests found."}), 404

    data = []
    for req in open_requests:
        data.append({
            "id": req.pin_requests_id,
            "title": req.title,
            "description": req.description,
            "category": req.category.name if req.category else None,
            "requester_name": req.pin_user.name if req.pin_user else None,
            "location": req.location,
            "urgency": req.urgency,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else None
        })

    return jsonify(data), 200

# ---------------------------------
# 📦Accepted requests (For CSR)
# ---------------------------------
@main.route("/api/requests/<int:request_id>/accept", methods=["POST"])
@cross_origin()
def accept_request(request_id):
    data = request.get_json()
    user_id = data.get("user_id")

    req = PinRequest.query.get(request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    
    # update status & assign CSR
    req.status = "accepted"
    req.csr_id = user_id  

    db.session.commit()

    return jsonify({
        "message": "Request accepted",
        "request": {
            "id": req.pin_requests_id,
            "title": req.title,
            "status": req.status,
            "csr_id": req.csr_id
        }
    }), 200

