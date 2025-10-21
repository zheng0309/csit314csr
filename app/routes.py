from flask import Blueprint, jsonify
from app.models import User, PinRequest

main = Blueprint("main", __name__)

@main.route("/")
def index():
    return jsonify({"message": "CSR Volunteer System is running"})

@main.route("/requests")
def get_requests():
    requests = PinRequest.query.all()
    data = [{"id": r.id, "title": r.title, "status": r.status} for r in requests]
    return jsonify(data)

@main.route("/users")
def get_users():
    users = User.query.all()
    data = [{"id": u.id, "name": u.name, "role": u.role} for u in users]
    return jsonify(data)
