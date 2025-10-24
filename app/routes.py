from flask import Blueprint, jsonify
from .models import PinRequest
from .models import Category 

#sample API routes
bp = Blueprint("main", __name__, url_prefix="/api")

@bp.get("/")
def index():
    return jsonify({"message": "CSR Volunteer Matching API is running"})

@bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    data = [
        {
            'categories_id': c.categories_id,   # ✅ MATCH MODEL
            'name': c.name,
            'description': c.description
        } for c in categories
    ]
    return jsonify(data)
