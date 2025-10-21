from flask import Blueprint, jsonify
from .models import PinRequest

bp = Blueprint("main", __name__, url_prefix="/api")

@bp.get("/")
def index():
    return jsonify({"message": "CSR Volunteer Matching API is running"})

@bp.get("/requests")
def get_requests():
    requests = PinRequest.query.all()
    data = [
        {
            "id": r.request_id,
            "title": r.title,
            "status": r.status,
            "urgency": r.urgency,
        }
        for r in requests
    ]
    return jsonify(data)
