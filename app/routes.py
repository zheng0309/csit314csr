# app/routes.py
from flask import Blueprint, jsonify
from app.models import User, PinRequest

main = Blueprint("main", __name__)

@main.route("/")
def index():
    return jsonify({"message": "CSR Volunteer System is running"})

@main.route("/requests")
def get_requests():
    data = [
        {"id": r.id, "title": r.title, "status": r.status}
        for r in PinRequest.query.limit(10).all()
    ]
    return jsonify(data)
