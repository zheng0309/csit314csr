from flask import Blueprint, jsonify, request, session
from app.database import db
from app.models import User, PinRequest, MatchHistory, CSRShortlist
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
# 🔐 Login (PIN, PM, Admin, CSR)
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

    # ✅ Normalize role values from DB (handles different casing/labels from seed)
    role_map = {
        "pin": "pin", "PIN": "pin",
        "csr_rep": "csr_rep", "CSR Rep": "csr_rep", "CSR": "csr_rep",
        "platform_manager": "platform_manager", "Platform Manager": "platform_manager", "PM": "platform_manager",
        "admin": "admin", "Admin": "admin"
    }
    normalized_role = role_map.get(user.role, None)

    # ✅ Allow PIN, Platform Manager, Admin, and CSR users
    if normalized_role not in ["pin", "platform_manager", "admin", "csr_rep"]:
        return jsonify({"error": f"User role '{user.role}' is not recognized"}), 403

    # ✅ Store session data
    session['user'] = {
        "users_id": user.users_id,
        "name": user.name,
        "email": user.email,
        "role": normalized_role
    }

    return jsonify({
        "message": f"Login successful as {user.role}",
        "user": {
            "users_id": user.users_id,
            "name": user.name,
            "email": user.email,
            "role": normalized_role
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
@main.route('/api/csr/accepted/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_accepted_requests(csr_id):
    matches = MatchHistory.query.filter_by(csr_id=csr_id).filter(
        MatchHistory.match_status != 'completed'
    ).all()

    data = []
    for m in matches:
        req = PinRequest.query.get(m.request_id)
        if req:
            data.append({
                "match_id": m.match_history_id,
                "request_id": m.request_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "matched_at": m.matched_at.isoformat() if m.matched_at else None
            })

    return jsonify(data), 200

# ---------------------------------
# 📦Completed requests (For CSR)
# ---------------------------------
@main.route('/api/csr/completed/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_completed_requests(csr_id):
    matches = MatchHistory.query.filter_by(csr_id=csr_id, match_status="completed").all()

    data = []
    for m in matches:
        req = PinRequest.query.get(m.request_id)
        if req:
            data.append({
                "match_id": m.match_history_id,
                "request_id": m.request_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "completed_at": req.completed_at.isoformat() if req.completed_at else None
            })

    return jsonify(data), 200


# ---------------------------------
# ⭐ Shortlisted requests (For CSR)
# ---------------------------------
@main.route('/api/csr/shortlist/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_shortlisted_requests(csr_id):
    shortlist_items = CSRShortlist.query.filter_by(csr_id=csr_id).all()

    data = []
    for s in shortlist_items:
        req = PinRequest.query.get(s.request_id)
        if req:
            data.append({
                "shortlist_id": s.csr_shortlist_id,
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "category": req.category.name if req.category else None,
                "shortlisted_at": s.shortlisted_at.isoformat() if s.shortlisted_at else None
            })

    return jsonify(data), 200


# ---------------------------------
# 📦Accepted requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/accepted', methods=['GET'])
@cross_origin()
def get_accepted_requests_global():
    matches = MatchHistory.query.filter(MatchHistory.match_status != 'completed').all()

    data = []
    for m in matches:
        req = PinRequest.query.get(m.request_id)
        if req:
            data.append({
                "match_id": m.match_history_id,
                "request_id": m.request_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "matched_at": m.matched_at.isoformat() if m.matched_at else None
            })

    return jsonify(data), 200


# ---------------------------------
# 📦Completed requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/completed', methods=['GET'])
@cross_origin()
def get_completed_requests_global():
    matches = MatchHistory.query.filter_by(match_status="completed").all()

    data = []
    for m in matches:
        req = PinRequest.query.get(m.request_id)
        if req:
            data.append({
                "match_id": m.match_history_id,
                "request_id": m.request_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "completed_at": req.completed_at.isoformat() if req.completed_at else None
            })

    return jsonify(data), 200


# ---------------------------------
# ⭐ Shortlisted requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/shortlist', methods=['GET'])
@cross_origin()
def get_shortlisted_requests_global():
    shortlist_items = CSRShortlist.query.all()

    data = []
    for s in shortlist_items:
        req = PinRequest.query.get(s.request_id)
        if req:
            data.append({
                "shortlist_id": s.csr_shortlist_id,
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "status": req.status,
                "urgency": req.urgency,
                "location": req.location,
                "category": req.category.name if req.category else None,
                "shortlisted_at": s.shortlisted_at.isoformat() if s.shortlisted_at else None
            })

    return jsonify(data), 200


# ---------------------------------
# 🤝 Actions: accept, shortlist, update, remove, complete
# ---------------------------------
@main.route('/api/requests/<int:req_id>/accept', methods=['POST'])
@cross_origin()
def accept_request_action(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400

    req = PinRequest.query.get(req_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404

    # Create or update match
    existing = MatchHistory.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    if not existing:
        existing = MatchHistory(csr_id=csr_id, request_id=req_id, match_status='pending')
        db.session.add(existing)

    req.status = 'matched'
    db.session.commit()

    return jsonify({"message": "accepted", "match_id": existing.match_history_id}), 200


@main.route('/api/requests/<int:req_id>/shortlist', methods=['POST'])
@cross_origin()
def shortlist_request_action(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400

    req = PinRequest.query.get(req_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404

    exists = CSRShortlist.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    if not exists:
        exists = CSRShortlist(csr_id=csr_id, request_id=req_id)
        db.session.add(exists)
        db.session.commit()

    return jsonify({"message": "shortlisted", "shortlist_id": exists.csr_shortlist_id}), 200


@main.route('/api/requests/<int:req_id>/shortlist', methods=['DELETE'])
@cross_origin()
def remove_shortlist_request_action(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400

    item = CSRShortlist.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()

    return jsonify({"message": "removed"}), 200


@main.route('/api/csr/accepted/<int:req_id>', methods=['PATCH'])
@cross_origin()
def update_accepted_status(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    status = data.get('status')
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400
    if status not in ['in_progress', 'blocked', 'completed', 'pending']:
        return jsonify({"error": "invalid status"}), 400

    match = MatchHistory.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    if not match:
        return jsonify({"error": "match not found"}), 404

    match.match_status = 'completed' if status == 'completed' else status
    db.session.commit()

    return jsonify({"message": "updated"}), 200


@main.route('/api/csr/accepted/<int:req_id>/remove', methods=['POST'])
@cross_origin()
def remove_self_from_request(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400

    match = MatchHistory.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    if match:
        db.session.delete(match)
        db.session.commit()

    return jsonify({"message": "removed"}), 200


@main.route('/api/csr/accepted/<int:req_id>/complete', methods=['POST'])
@cross_origin()
def complete_request_action(req_id):
    data = request.get_json(silent=True) or {}
    csr_id = data.get('csr_id') or (session.get('user', {}).get('users_id') if session.get('user') else None)
    note = data.get('note')
    if not csr_id:
        return jsonify({"error": "csr_id is required"}), 400

    match = MatchHistory.query.filter_by(csr_id=csr_id, request_id=req_id).first()
    req = PinRequest.query.get(req_id)
    if not match or not req:
        return jsonify({"error": "not found"}), 404

    match.match_status = 'completed'
    req.status = 'completed'
    req.completed_at = req.completed_at or db.func.now()
    if note:
        req.completion_note = note
    db.session.commit()

    return jsonify({"message": "completed"}), 200

    return jsonify(data), 200
