from flask import Blueprint, jsonify, request, session
from app.database import db
from app.models import User, PinRequest, MatchHistory, CSRShortlist, Feedback, Category
from flask_cors import cross_origin
from datetime import datetime, timedelta
from sqlalchemy.exc import OperationalError, ProgrammingError
from sqlalchemy import inspect, text, func, cast, Date
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError

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
# 👤 Admin: Users list and stats
# ---------------------------------
@main.route('/api/admin/users', methods=['GET'])
@cross_origin()
def admin_get_users():
    try:
        users = User.query.all()
        # Normalize role labels to canonical values for frontend
        role_map = {
            "pin": "pin", "PIN": "pin",
            "csr_rep": "csr_rep", "CSR Rep": "csr_rep", "CSR": "csr_rep",
            "platform_manager": "platform_manager", "Platform Manager": "platform_manager", "PM": "platform_manager",
            "admin": "admin", "Admin": "admin"
        }
        results = []
        for u in users:
            normalized_role = role_map.get(u.role, u.role)
            results.append({
                "users_id": u.users_id,
                "name": u.name,
                "role": normalized_role,
                "email": u.email,
                "created_at": getattr(u, 'created_at', None)
            })
        return jsonify(results), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to fetch users: {str(e)}"}), 500


@main.route('/api/admin/user-stats', methods=['GET'])
@cross_origin()
def admin_user_stats():
    try:
        # Count by roles with normalization handled via SQL OR Python fallback
        # Simple approach: fetch counts by raw values that might exist
        total_all = User.query.count()
        count_admin = User.query.filter(func.lower(User.role).in_(['admin'])).count()
        count_pin = User.query.filter(func.lower(User.role).in_(['pin'])).count()
        count_csr = User.query.filter(func.lower(User.role).in_(['csr_rep', 'csr', 'csr rep'])).count()
        count_pm = User.query.filter(func.lower(User.role).in_(['platform_manager', 'platform manager', 'pm'])).count()

        return jsonify({
            "total": total_all,
            "total_excluding_admin": total_all - count_admin,
            "pin": count_pin,
            "csr_rep": count_csr,
            "platform_manager": count_pm,
            "admin": count_admin
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to fetch user stats: {str(e)}"}), 500

# ---------------------------------
@main.route('/api/admin/users', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_create_user():
    try:
        data = request.get_json() or {}
        required = ['name', 'email', 'role', 'password']
        if any(not data.get(k) for k in required):
            return jsonify({"error": "name, email, role, password are required"}), 400

        # Normalize role
        role_map = {
            "pin": "pin", "PIN": "pin",
            "csr_rep": "csr_rep", "CSR Rep": "csr_rep", "CSR": "csr_rep",
            "platform_manager": "platform_manager", "Platform Manager": "platform_manager", "PM": "platform_manager",
            "admin": "admin", "Admin": "admin"
        }
        normalized_role = role_map.get(data.get('role'), data.get('role'))

        # Check email unique
        exists = User.query.filter((User.email == data['email'])).first()
        if exists:
            return jsonify({"error": "User with same email already exists"}), 409

        # Generate username automatically based on next users_id
        next_id = (db.session.query(func.max(User.users_id)).scalar() or 0) + 1
        generated_username = str(next_id)

        user = User(
            username=generated_username,
            name=data['name'],
            email=data['email'],
            role=normalized_role,
            password=data['password']
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({
            "users_id": user.users_id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create user: {str(e)}"}), 500


@main.route('/api/admin/users/<int:user_id>', methods=['PATCH'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_update_user(user_id):
    try:
        data = request.get_json() or {}
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Username is auto-generated; ignore changes to username
        if 'name' in data and data['name']:
            user.name = data['name']
        if 'email' in data and data['email']:
            user.email = data['email']
        if 'role' in data and data['role']:
            role_map = {
                "pin": "pin", "PIN": "pin",
                "csr_rep": "csr_rep", "CSR Rep": "csr_rep", "CSR": "csr_rep",
                "platform_manager": "platform_manager", "Platform Manager": "platform_manager", "PM": "platform_manager",
                "admin": "admin", "Admin": "admin"
            }
            user.role = role_map.get(data['role'], data['role'])
        if 'password' in data and data['password']:
            user.password = data['password']

        db.session.commit()
        return jsonify({"message": "updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update user: {str(e)}"}), 500


@main.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_delete_user(user_id):
    """Simple, deterministic delete: remove related records then delete user.
    Safeguards: cannot delete the only remaining admin.
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Prevent deleting the last remaining admin
        if (user.role or '').lower() == 'admin':
            admin_count = User.query.filter(func.lower(User.role) == 'admin').count()
            if admin_count <= 1:
                return jsonify({"error": "Cannot delete the only remaining administrator account."}), 400

        # Always remove dependent records first to avoid integrity errors
        # 1) Collect this user's request IDs
        req_ids = [rid for (rid,) in db.session.query(PinRequest.pin_requests_id).filter_by(user_id=user_id).all()]
        if req_ids:
            # 2) Delete dependencies that reference those requests
            MatchHistory.query.filter(MatchHistory.request_id.in_(req_ids)).delete(synchronize_session=False)
            CSRShortlist.query.filter(CSRShortlist.request_id.in_(req_ids)).delete(synchronize_session=False)
            db.session.flush()
            # 3) Now delete the requests
            PinRequest.query.filter(PinRequest.pin_requests_id.in_(req_ids)).delete(synchronize_session=False)
        # 4) Also remove records where this user is the CSR (not the requester)
        MatchHistory.query.filter_by(csr_id=user_id).delete(synchronize_session=False)
        CSRShortlist.query.filter_by(csr_id=user_id).delete(synchronize_session=False)
        db.session.flush()

        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "deleted"}), 200
    except IntegrityError as ie:
        db.session.rollback()
        return jsonify({"error": "Delete blocked by database constraints", "details": str(ie)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete user: {str(e)}"}), 500


@main.route('/api/admin/users/<int:user_id>/reset-password', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_reset_password(user_id):
    try:
        data = request.get_json() or {}
        new_password = data.get('newPassword') or data.get('password')
        if not new_password:
            return jsonify({"error": "newPassword is required"}), 400
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.password = new_password
        db.session.commit()
        return jsonify({"message": "password reset"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to reset password: {str(e)}"}), 500


# Alias endpoint to avoid method conflicts in some environments
@main.route('/api/admin/users/create', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_create_user_alias():
    return admin_create_user()

# Alias for DELETE when environments block DELETE (use POST)
@main.route('/api/admin/users/<int:user_id>/delete', methods=['POST'])
@cross_origin(origins=["http://localhost:5173"], supports_credentials=True)
def admin_delete_user_alias(user_id):
    return admin_delete_user(user_id)

# 🔎 Get Single Request By ID
# ---------------------------------
@main.route('/api/requests/<int:req_id>', methods=['GET'])
@cross_origin()
def get_request_by_id(req_id):
    try:
        req = PinRequest.query.get(req_id)
        if not req:
            return jsonify({"error": "Request not found"}), 404

        # Safely get feedback
        feedback_data = None
        try:
            inspector = inspect(db.engine)
            if 'feedback' in inspector.get_table_names():
                feedback = Feedback.query.filter_by(request_id=req_id).first()
                if feedback:
                    feedback_data = {
                        "rating": feedback.rating,
                        "comment": feedback.comment,
                        "anonymous": feedback.anonymous,
                        "submitted_at": feedback.submitted_at.isoformat() if feedback.submitted_at else None
                    }
        except Exception:
            db.session.rollback()

        # Safely get preferred_time and special_requirements using raw SQL
        preferred_time = None
        special_requirements = None
        try:
            result = db.session.execute(
                text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                {"id": req.pin_requests_id}
            ).first()
            if result:
                preferred_time = result[0] if result[0] else None
                special_requirements = result[1] if result[1] else None
        except (OperationalError, ProgrammingError):
            # Columns don't exist yet - this is OK
            pass
        except Exception:
            pass
        
        data = {
            "id": req.pin_requests_id,
            "title": req.title,
            "description": req.description,
            "category": req.category.name if req.category else None,
            "location": req.location,
            "urgency": req.urgency,
            "status": req.status,
            "requester_name": req.pin_user.name if req.pin_user else None,
            "user_id": req.user_id,
            "created_at": req.created_at.isoformat() if req.created_at else None,
            "completed_at": req.completed_at.isoformat() if req.completed_at else None,
            "completion_note": req.completion_note,
            "preferred_time": preferred_time,
            "preferredTime": preferred_time,
            "special_requirements": special_requirements,
            "specialRequirements": special_requirements,
            "feedback_rating": feedback_data["rating"] if feedback_data else None,
            "feedback_comment": feedback_data["comment"] if feedback_data else None,
            "feedback_anonymous": feedback_data["anonymous"] if feedback_data else None,
            "feedback_submitted_at": feedback_data["submitted_at"] if feedback_data else None,
        }

        return jsonify(data), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in get_request_by_id: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch request: {str(e)}"}), 500

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
    
    # Update preferred_time and special_requirements using raw SQL (will fail gracefully if columns don't exist)
    pref_time = data.get('preferred_time') or data.get('preferredTime')
    spec_req = data.get('special_requirements') or data.get('specialRequirements')
    
    if pref_time:
        try:
            db.session.execute(
                text("UPDATE pin_requests SET preferred_time = :val WHERE pin_requests_id = :id"),
                {"val": pref_time, "id": new_request.pin_requests_id}
            )
            db.session.commit()
        except (OperationalError, ProgrammingError):
            db.session.rollback()
            # Columns don't exist yet, skip
            pass
        except Exception as e:
            db.session.rollback()
            print(f"Note: Could not set preferred_time: {str(e)}")
    
    if spec_req:
        try:
            db.session.execute(
                text("UPDATE pin_requests SET special_requirements = :val WHERE pin_requests_id = :id"),
                {"val": spec_req, "id": new_request.pin_requests_id}
            )
            db.session.commit()
        except (OperationalError, ProgrammingError):
            db.session.rollback()
            # Columns don't exist yet, skip
            pass
        except Exception as e:
            db.session.rollback()
            print(f"Note: Could not set special_requirements: {str(e)}")

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
# ✏️ Update Help Request (PATCH)
# ---------------------------------
@main.route('/api/help-requests/<int:request_id>', methods=['PATCH'])
@cross_origin()
def update_help_request(request_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Use filter_by with primary key to be more explicit
        req = PinRequest.query.filter_by(pin_requests_id=request_id).first()
        if not req:
            return jsonify({"error": f"Request not found with id: {request_id}"}), 404
        
        # Update fields if provided
        if 'title' in data:
            req.title = data['title']
        if 'description' in data:
            req.description = data['description']
        if 'urgency' in data:
            req.urgency = data['urgency']
        if 'location' in data:
            req.location = data['location']
        if 'category_id' in data:
            req.category_id = data['category_id'] if data['category_id'] else None
        if 'status' in data:
            req.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            "message": "Request updated successfully",
            "request": {
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "urgency": req.urgency,
                "status": req.status,
                "location": req.location,
                "user_id": req.user_id,
                "category": req.category.name if req.category else None,
                "updated_at": req.created_at.isoformat() if req.created_at else None
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to update request: {str(e)}"}), 500


# ---------------------------------
# 🗑️ Delete Help Request (DELETE)
# ---------------------------------
@main.route('/api/help-requests/<int:request_id>', methods=['DELETE'])
@cross_origin()
def delete_help_request(request_id):
    try:
        # Use filter_by with primary key to be more explicit
        req = PinRequest.query.filter_by(pin_requests_id=request_id).first()
        
        if not req:
            return jsonify({"error": f"Request not found with id: {request_id}"}), 404
        
        db.session.delete(req)
        db.session.commit()
        
        return jsonify({"message": "Request deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete request: {str(e)}"}), 500


# ---------------------------------
# 📝 Submit Feedback for Request (POST)
# ---------------------------------
@main.route('/api/help-requests/<int:request_id>/feedback', methods=['POST'])
@cross_origin()
def submit_feedback(request_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No feedback data provided"}), 400
        
        req = PinRequest.query.filter_by(pin_requests_id=request_id).first()
        if not req:
            return jsonify({"error": "Request not found"}), 404
        
        # Validate rating
        rating = data.get('rating', 0)
        if not rating or rating < 1 or rating > 5:
            return jsonify({"error": "Rating must be between 1 and 5"}), 400
        
        comment = data.get('comment', '')
        anonymous = data.get('anonymous', False)
        
        # Ensure feedback table exists
        try:
            inspector = inspect(db.engine)
            if 'feedback' not in inspector.get_table_names():
                from app.models import Feedback
                Feedback.__table__.create(db.engine, checkfirst=True)
                db.session.commit()
        except Exception as e:
            # If table creation fails, try to continue anyway
            print(f"Warning: Could not verify/create feedback table: {str(e)}")
            db.session.rollback()
        
        # Check if feedback already exists for this request
        try:
            existing_feedback = Feedback.query.filter_by(request_id=request_id).first()
        except Exception as e:
            # If query fails, table might not exist - create it and try again
            print(f"Warning: Feedback query failed, creating table: {str(e)}")
            db.session.rollback()
            try:
                from app.models import Feedback
                Feedback.__table__.create(db.engine, checkfirst=True)
                db.session.commit()
                existing_feedback = Feedback.query.filter_by(request_id=request_id).first()
            except Exception as e2:
                db.session.rollback()
                return jsonify({"error": f"Database error: {str(e2)}"}), 500
        
        if existing_feedback:
            # Update existing feedback
            existing_feedback.rating = rating
            existing_feedback.comment = comment
            existing_feedback.anonymous = anonymous
            existing_feedback.submitted_at = datetime.utcnow()
        else:
            # Create new feedback
            new_feedback = Feedback(
                request_id=request_id,
                rating=rating,
                comment=comment,
                anonymous=anonymous
            )
            db.session.add(new_feedback)
        
        db.session.commit()
        
        return jsonify({
            "message": "Feedback submitted successfully",
            "feedback": {
                "request_id": request_id,
                "rating": rating,
                "comment": comment,
                "anonymous": anonymous
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_feedback: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to submit feedback: {str(e)}"}), 500


# ---------------------------------
# 📦 Get Help Requests by PIN ID to see "status"
# ---------------------------------
@main.route('/api/help_requests/<int:user_id>', methods=['GET'])
@cross_origin()
def get_help_requests_by_user(user_id):
    try:
        # Check if feedback table exists
        inspector = inspect(db.engine)
        feedback_table_exists = 'feedback' in inspector.get_table_names()
        
        help_requests = PinRequest.query.filter_by(user_id=user_id).all()

        data = []
        for req in help_requests:
            # Safely access category
            category_name = None
            try:
                category_name = req.category.name if req.category else None
            except Exception:
                db.session.rollback()
                category_name = None
            
            # Safely access feedback only if table exists
            feedback_data = None
            if feedback_table_exists:
                try:
                    feedback = Feedback.query.filter_by(request_id=req.pin_requests_id).first()
                    if feedback:
                        feedback_data = {
                            "rating": feedback.rating,
                            "comment": feedback.comment,
                            "anonymous": feedback.anonymous,
                            "submitted_at": feedback.submitted_at.isoformat() if feedback.submitted_at else None
                        }
                except Exception as e:
                    db.session.rollback()
                    print(f"Warning: Could not access feedback for request {req.pin_requests_id}: {str(e)}")
                    feedback_data = None

            # Safely get preferred_time and special_requirements using raw SQL query
            # These columns are not in the model definition to avoid SQLAlchemy query errors
            preferred_time = None
            special_requirements = None
            try:
                # Try to query the columns directly - if they don't exist, exception will be caught
                result = db.session.execute(
                    text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                    {"id": req.pin_requests_id}
                ).first()
                if result:
                    preferred_time = result[0] if result[0] else None
                    special_requirements = result[1] if result[1] else None
            except (OperationalError, ProgrammingError) as e:
                # Columns don't exist yet - this is OK
                preferred_time = None
                special_requirements = None
            except Exception:
                # Other errors - just use None
                preferred_time = None
                special_requirements = None

            # Find assigned CSR (match not completed)
            assigned_to = None
            csr_email = None
            csr_username = None
            try:
                match = MatchHistory.query.filter(
                    MatchHistory.request_id == req.pin_requests_id,
                    MatchHistory.match_status != 'completed'
                ).first()
                if match:
                    csr_user = User.query.get(match.csr_id)
                    if csr_user:
                        assigned_to = csr_user.name or csr_user.username
                        csr_email = csr_user.email
                        csr_username = csr_user.username
            except Exception:
                db.session.rollback()
                assigned_to = None

            data.append({
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "category": category_name,
                "location": req.location,
                "status": req.status,
                "urgency": req.urgency,
                "completion_note": req.completion_note,
                "preferred_time": preferred_time,
                "preferredTime": preferred_time,  # Also provide camelCase for frontend
                "special_requirements": special_requirements,
                "specialRequirements": special_requirements,  # Also provide camelCase for frontend
                "assigned_to": assigned_to,
                "csr_email": csr_email,
                "csr_username": csr_username,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "completed_at": req.completed_at.isoformat() if req.completed_at else None,
                "feedback_rating": feedback_data["rating"] if feedback_data else None,
                "feedback_comment": feedback_data["comment"] if feedback_data else None,
                "feedback_anonymous": feedback_data["anonymous"] if feedback_data else None,
                "feedback_submitted_at": feedback_data["submitted_at"] if feedback_data else None
            })
        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_help_requests_by_user: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch requests: {str(e)}"}), 500


# ---------------------------------
# 📦 Get All Open Help Requests (For CSR)
# ---------------------------------
@main.route('/api/help_requests/open', methods=['GET'])
@cross_origin()
def get_open_help_requests():
    try:
        # Query all open help requests with eager loading of category
        open_requests = PinRequest.query.options(joinedload(PinRequest.category_rel)).filter_by(status='open').all()

        data = []
        for req in open_requests:
            # Safely get preferred_time and special_requirements using raw SQL
            preferred_time = None
            special_requirements = None
            try:
                result = db.session.execute(
                    text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                    {"id": req.pin_requests_id}
                ).first()
                if result:
                    preferred_time = result[0] if result[0] else None
                    special_requirements = result[1] if result[1] else None
            except (OperationalError, ProgrammingError):
                # Columns don't exist yet - this is OK
                pass
            except Exception:
                pass
            
            # Safely access category
            category_name = None
            try:
                category_name = req.category.name if req.category else None
            except Exception:
                db.session.rollback()
                category_name = None
            
            # Safely access requester name
            requester_name = None
            try:
                requester_name = req.pin_user.name if req.pin_user else None
            except Exception:
                db.session.rollback()
                requester_name = None
            
            data.append({
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "category": category_name,
                "requester_name": requester_name,
                "location": req.location,
                "urgency": req.urgency,
                "status": req.status,
                "preferred_time": preferred_time,
                "preferredTime": preferred_time,
                "special_requirements": special_requirements,
                "specialRequirements": special_requirements,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_open_help_requests: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch open requests: {str(e)}"}), 500

# ---------------------------------
# 📦Accepted requests (For CSR)
# ---------------------------------
@main.route('/api/csr/accepted/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_accepted_requests(csr_id):
    try:
        matches = MatchHistory.query.filter_by(csr_id=csr_id).filter(
            MatchHistory.match_status != 'completed'
        ).all()

        data = []
        for m in matches:
            req = PinRequest.query.get(m.request_id)
            if req:
                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "match_id": m.match_history_id,
                    "request_id": m.request_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "matched_at": m.matched_at.isoformat() if m.matched_at else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_accepted_requests: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch accepted requests: {str(e)}"}), 500

# ---------------------------------
# 📦Completed requests (For CSR)
# ---------------------------------
@main.route('/api/csr/completed/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_completed_requests(csr_id):
    try:
        matches = MatchHistory.query.filter_by(csr_id=csr_id, match_status="completed").all()

        data = []
        for m in matches:
            req = PinRequest.query.get(m.request_id)
            if req:
                # Safely access feedback using direct query
                feedback_data = None
                try:
                    # Check if feedback table exists before querying
                    inspector = inspect(db.engine)
                    if 'feedback' in inspector.get_table_names():
                        feedback = Feedback.query.filter_by(request_id=req.pin_requests_id).first()
                        if feedback:
                            feedback_data = {
                                "rating": feedback.rating,
                                "comment": feedback.comment,
                                "anonymous": feedback.anonymous,
                                "submitted_at": feedback.submitted_at.isoformat() if feedback.submitted_at else None
                            }
                except Exception:
                    db.session.rollback()
                    feedback_data = None

                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "match_id": m.match_history_id,
                    "request_id": m.request_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "completed_at": req.completed_at.isoformat() if req.completed_at else None,
                    "feedback_rating": feedback_data["rating"] if feedback_data else None,
                    "feedback_comment": feedback_data["comment"] if feedback_data else None,
                    "feedback_anonymous": feedback_data["anonymous"] if feedback_data else None,
                    "feedback_submitted_at": feedback_data["submitted_at"] if feedback_data else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_completed_requests: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch completed requests: {str(e)}"}), 500


# ---------------------------------
# ⭐ Shortlisted requests (For CSR)
# ---------------------------------
@main.route('/api/csr/shortlist/<int:csr_id>', methods=['GET'])
@cross_origin()
def get_shortlisted_requests(csr_id):
    try:
        shortlist_items = CSRShortlist.query.filter_by(csr_id=csr_id).all()

        data = []
        for s in shortlist_items:
            req = PinRequest.query.get(s.request_id)
            if req:
                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "shortlist_id": s.csr_shortlist_id,
                    "id": req.pin_requests_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "shortlisted_at": s.shortlisted_at.isoformat() if s.shortlisted_at else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_shortlisted_requests: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch shortlisted requests: {str(e)}"}), 500


# ---------------------------------
# 📦Accepted requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/accepted', methods=['GET'])
@cross_origin()
def get_accepted_requests_global():
    try:
        matches = MatchHistory.query.filter(MatchHistory.match_status != 'completed').all()

        data = []
        for m in matches:
            req = PinRequest.query.get(m.request_id)
            if req:
                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "match_id": m.match_history_id,
                    "request_id": m.request_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "matched_at": m.matched_at.isoformat() if m.matched_at else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_accepted_requests_global: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch accepted requests: {str(e)}"}), 500


# ---------------------------------
# 📦Completed requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/completed', methods=['GET'])
@cross_origin()
def get_completed_requests_global():
    try:
        matches = MatchHistory.query.filter_by(match_status="completed").all()

        data = []
        for m in matches:
            req = PinRequest.query.get(m.request_id)
            if req:
                # Safely access feedback using direct query
                feedback_data = None
                try:
                    # Check if feedback table exists before querying
                    inspector = inspect(db.engine)
                    if 'feedback' in inspector.get_table_names():
                        feedback = Feedback.query.filter_by(request_id=req.pin_requests_id).first()
                        if feedback:
                            feedback_data = {
                                "rating": feedback.rating,
                                "comment": feedback.comment,
                                "anonymous": feedback.anonymous,
                                "submitted_at": feedback.submitted_at.isoformat() if feedback.submitted_at else None
                            }
                except Exception:
                    db.session.rollback()
                    feedback_data = None

                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "match_id": m.match_history_id,
                    "request_id": m.request_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "completed_at": req.completed_at.isoformat() if req.completed_at else None,
                    "feedback_rating": feedback_data["rating"] if feedback_data else None,
                    "feedback_comment": feedback_data["comment"] if feedback_data else None,
                    "feedback_anonymous": feedback_data["anonymous"] if feedback_data else None,
                    "feedback_submitted_at": feedback_data["submitted_at"] if feedback_data else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_completed_requests_global: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch completed requests: {str(e)}"}), 500


# ---------------------------------
# ⭐ Shortlisted requests (Global fallback)
# ---------------------------------
@main.route('/api/csr/shortlist', methods=['GET'])
@cross_origin()
def get_shortlisted_requests_global():
    try:
        shortlist_items = CSRShortlist.query.all()

        data = []
        for s in shortlist_items:
            req = PinRequest.query.get(s.request_id)
            if req:
                # Safely get preferred_time and special_requirements using raw SQL
                preferred_time = None
                special_requirements = None
                try:
                    result = db.session.execute(
                        text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                        {"id": req.pin_requests_id}
                    ).first()
                    if result:
                        preferred_time = result[0] if result[0] else None
                        special_requirements = result[1] if result[1] else None
                except (OperationalError, ProgrammingError):
                    # Columns don't exist yet - this is OK
                    pass
                except Exception:
                    pass
                
                # Safely access category
                category_name = None
                try:
                    category_name = req.category.name if req.category else None
                except Exception:
                    db.session.rollback()
                    category_name = None
                
                data.append({
                    "shortlist_id": s.csr_shortlist_id,
                    "id": req.pin_requests_id,
                    "title": req.title,
                    "description": req.description,
                    "status": req.status,
                    "urgency": req.urgency,
                    "location": req.location,
                    "category": category_name,
                    "preferred_time": preferred_time,
                    "preferredTime": preferred_time,
                    "special_requirements": special_requirements,
                    "specialRequirements": special_requirements,
                    "shortlisted_at": s.shortlisted_at.isoformat() if s.shortlisted_at else None
                })

        return jsonify(data), 200
    except Exception as e:
        print(f"Error in get_shortlisted_requests_global: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch shortlisted requests: {str(e)}"}), 500


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

# ---------------------------------
# Get Categories
# ---------------------------------
@main.route('/api/categories', methods=['GET'])
@cross_origin()
def get_categories():
    try:
        categories = Category.query.all()
        result = [
            {
                "id": c.categories_id,
                "name": c.name,
                "description": c.description
            }
            for c in categories
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch categories: {str(e)}"}), 500

# ---------------------------------
# 🛠️ Platform Manager Endpoints
# ---------------------------------

# Get all categories for PM dashboard
@main.route('/api/pm/categories', methods=['GET'])
@cross_origin()
def get_pm_categories():
    try:
        categories = Category.query.all()
        result = []
        for cat in categories:
            # Count usage (how many requests use this category)
            usage_count = PinRequest.query.filter_by(category_id=cat.categories_id).count()
            result.append({
                "id": cat.categories_id,
                "name": cat.name,
                "description": cat.description or "",
                "usageCount": usage_count,
                "active": True  # Categories are active by default
            })
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in get_pm_categories: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch categories: {str(e)}"}), 500


# Create new category
@main.route('/api/pm/categories', methods=['POST'])
@cross_origin()
def create_pm_category():
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Category name is required"}), 400
        
        new_category = Category(
            name=data['name'],
            description=data.get('description', '')
        )
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({
            "id": new_category.categories_id,
            "name": new_category.name,
            "description": new_category.description or "",
            "usageCount": 0,
            "active": True
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in create_pm_category: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to create category: {str(e)}"}), 500


# Update category
@main.route('/api/pm/categories/<int:cat_id>', methods=['PATCH'])
@cross_origin()
def update_pm_category(cat_id):
    try:
        data = request.get_json()
        category = Category.query.get(cat_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404
        
        if data.get('name'):
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        
        db.session.commit()
        
        usage_count = PinRequest.query.filter_by(category_id=category.categories_id).count()
        return jsonify({
            "id": category.categories_id,
            "name": category.name,
            "description": category.description or "",
            "usageCount": usage_count,
            "active": True
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_pm_category: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to update category: {str(e)}"}), 500


# Delete category
@main.route('/api/pm/categories/<int:cat_id>', methods=['DELETE'])
@cross_origin()
def delete_pm_category(cat_id):
    try:
        category = Category.query.get(cat_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404
        
        # Check if category is in use
        usage_count = PinRequest.query.filter_by(category_id=cat_id).count()
        if usage_count > 0:
            return jsonify({"error": f"Cannot delete category: it is used by {usage_count} request(s)"}), 400
        
        db.session.delete(category)
        db.session.commit()
        
        return jsonify({"message": "Category deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in delete_pm_category: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to delete category: {str(e)}"}), 500


# Get all requests for PM dashboard
@main.route('/api/pm/requests', methods=['GET'])
@cross_origin()
def get_pm_requests():
    try:
        requests = PinRequest.query.all()
        result = []
        for req in requests:
            # Safely get preferred_time and special_requirements
            preferred_time = None
            special_requirements = None
            try:
                sql_result = db.session.execute(
                    text("SELECT preferred_time, special_requirements FROM pin_requests WHERE pin_requests_id = :id"),
                    {"id": req.pin_requests_id}
                ).first()
                if sql_result:
                    preferred_time = sql_result[0] if sql_result[0] else None
                    special_requirements = sql_result[1] if sql_result[1] else None
            except (OperationalError, ProgrammingError):
                pass
            except Exception:
                pass
            
            # Get category name
            category_name = None
            try:
                category_name = req.category.name if req.category else None
            except Exception:
                db.session.rollback()
                category_name = None
            
            # Get requester name
            requester_name = None
            try:
                requester_name = req.pin_user.name if req.pin_user else None
            except Exception:
                db.session.rollback()
                requester_name = None
            
            # Get assigned CSR (from match_history)
            assigned_to = None
            try:
                match = MatchHistory.query.filter_by(request_id=req.pin_requests_id, match_status='pending').first()
                if match and match.csr_match:
                    assigned_to = match.csr_match.name
            except Exception:
                db.session.rollback()
                assigned_to = None
            
            result.append({
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description,
                "category": category_name or "Uncategorized",
                "status": req.status,
                "urgency": req.urgency,
                "urgent": req.urgency == 'high',
                "assignedTo": assigned_to,
                "location": req.location,
                "preferredTime": preferred_time,
                "specialRequirements": special_requirements,
                "createdAt": req.created_at.isoformat() if req.created_at else None,
                "completedAt": req.completed_at.isoformat() if req.completed_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in get_pm_requests: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch requests: {str(e)}"}), 500


# Update request status (for PM)
@main.route('/api/pm/requests/<int:req_id>/status', methods=['POST'])
@cross_origin()
def update_pm_request_status(req_id):
    try:
        data = request.get_json()
        if not data or not data.get('status'):
            return jsonify({"error": "Status is required"}), 400
        
        req = PinRequest.query.get(req_id)
        if not req:
            return jsonify({"error": "Request not found"}), 404
        
        status = data['status']
        req.status = status
        
        if status == 'completed' and not req.completed_at:
            req.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({"message": f"Request status updated to {status}"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in update_pm_request_status: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to update request status: {str(e)}"}), 500


# Get analytics data for PM dashboard
@main.route('/api/pm/analytics', methods=['GET'])
@cross_origin()
def get_pm_analytics():
    try:
        # Get date ranges
        now = datetime.utcnow()
        today = now.date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        # Calculate week start (this calendar week - last 7 days, but ensure it's within current month)
        # We'll use the start of current month as the minimum to ensure monthly >= weekly
        week_start_raw = today - timedelta(days=6)
        month_start = today.replace(day=1)
        # Use the later of (week_start_raw) or (month_start) to ensure weekly is within current month
        week_start = max(week_start_raw, month_start)
        week_start_dt = datetime.combine(week_start, datetime.min.time())
        
        # Calculate month start (first day of current month)
        month_start_dt = datetime.combine(month_start, datetime.min.time())
        
        # Daily analytics (today only)
        daily_created = PinRequest.query.filter(
            PinRequest.created_at >= today_start,
            PinRequest.created_at <= today_end
        ).count()
        daily_closed = PinRequest.query.filter(
            PinRequest.completed_at >= today_start,
            PinRequest.completed_at <= today_end,
            PinRequest.status == 'completed'
        ).count()
        
        # Weekly analytics (last 7 days, but only within current month to ensure monthly >= weekly)
        weekly_created = PinRequest.query.filter(
            PinRequest.created_at >= week_start_dt
        ).count()
        weekly_closed = PinRequest.query.filter(
            PinRequest.completed_at >= week_start_dt,
            PinRequest.status == 'completed'
        ).count()
        
        # Monthly analytics (this month from first day to today)
        monthly_created = PinRequest.query.filter(
            PinRequest.created_at >= month_start_dt
        ).count()
        monthly_closed = PinRequest.query.filter(
            PinRequest.completed_at >= month_start_dt,
            PinRequest.status == 'completed'
        ).count()
        
        # Format date ranges for display
        daily_range = f"{today.strftime('%b %d')}"
        weekly_range = f"{week_start.strftime('%b %d')} - {today.strftime('%b %d')}"
        monthly_range = f"{month_start.strftime('%b %d')} - {today.strftime('%b %d')}"
        
        return jsonify({
            "daily": {
                "created": daily_created,
                "closed": daily_closed,
                "dateRange": daily_range
            },
            "weekly": {
                "created": weekly_created,
                "closed": weekly_closed,
                "dateRange": weekly_range
            },
            "monthly": {
                "created": monthly_created,
                "closed": monthly_closed,
                "dateRange": monthly_range
            }
        }), 200
    except Exception as e:
        print(f"Error in get_pm_analytics: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch analytics: {str(e)}"}), 500


# Get detailed analytics requests for tooltips
@main.route('/api/pm/analytics/<period>/<type>', methods=['GET'])
@cross_origin()
def get_analytics_requests(period, type):
    """
    period: 'daily', 'weekly', 'monthly'
    type: 'created' or 'closed'
    Returns list of requests for hover tooltip
    """
    try:
        now = datetime.utcnow()
        today = now.date()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())
        
        # Calculate date ranges based on period
        month_start = today.replace(day=1)
        
        if period == 'daily':
            start_date = today_start
            end_date = today_end
        elif period == 'weekly':
            # Weekly: last 7 days, but only within current month
            week_start_raw = today - timedelta(days=6)
            week_start = max(week_start_raw, month_start)
            start_date = datetime.combine(week_start, datetime.min.time())
            end_date = now
        elif period == 'monthly':
            start_date = datetime.combine(month_start, datetime.min.time())
            end_date = now
        else:
            return jsonify({"error": "Invalid period"}), 400
        
        # Query requests based on type
        if type == 'created':
            requests = PinRequest.query.filter(
                PinRequest.created_at >= start_date,
                PinRequest.created_at <= end_date
            ).all()
        elif type == 'closed':
            requests = PinRequest.query.filter(
                PinRequest.completed_at >= start_date,
                PinRequest.completed_at <= end_date,
                PinRequest.status == 'completed'
            ).all()
        else:
            return jsonify({"error": "Invalid type"}), 400
        
        # Format response
        result = []
        for req in requests:
            # Safely get category name
            category_name = None
            try:
                category_name = req.category.name if req.category else None
            except Exception:
                db.session.rollback()
                category_name = None
            
            # Safely get requester name
            requester_name = None
            try:
                requester_name = req.pin_user.name if req.pin_user else None
            except Exception:
                db.session.rollback()
                requester_name = None
            
            result.append({
                "id": req.pin_requests_id,
                "title": req.title,
                "description": req.description or "",
                "category": category_name or "Uncategorized",
                "status": req.status,
                "urgency": req.urgency,
                "requester": requester_name or "Unknown",
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "completed_at": req.completed_at.isoformat() if req.completed_at else None
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in get_analytics_requests: {str(e)}")
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch analytics requests: {str(e)}"}), 500
