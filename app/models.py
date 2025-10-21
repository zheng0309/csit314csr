from datetime import datetime
from .database import db

class User(db.Model):
    __tablename__ = "users"
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False)  # admin, manager, csr, pin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.email}>"

class Category(db.Model):
    __tablename__ = "categories"
    category_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.Text)

class PinRequest(db.Model):
    __tablename__ = "pin_requests"
    request_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.category_id"), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default="open")    # open, matched, closed
    urgency = db.Column(db.String(10), default="medium") # low, medium, high
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    user = db.relationship("User")
    category = db.relationship("Category")

class MatchHistory(db.Model):
    __tablename__ = "match_history"
    match_id = db.Column(db.Integer, primary_key=True)
    csr_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    request_id = db.Column(db.Integer, db.ForeignKey("pin_requests.request_id"), nullable=False)
    matched_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_status = db.Column(db.String(20), default="pending")  # completed, cancelled, pending

class Report(db.Model):
    __tablename__ = "reports"
    report_id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=False)
    report_type = db.Column(db.String(50))
    content = db.Column(db.Text)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
