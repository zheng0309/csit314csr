from app.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    users_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    pin_requests = db.relationship('PinRequest', backref='user', lazy=True)
    csr_matches = db.relationship('MatchHistory', backref='csr', lazy=True)
    reports = db.relationship('Report', backref='manager', lazy=True)

    # Legacy property for backward compatibility
    @property
    def id(self):
        return self.users_id

class Category(db.Model):
    __tablename__ = 'categories'
    
    categories_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))

    # Relationships
    pin_requests = db.relationship('PinRequest', backref='category', lazy=True)

class PinRequest(db.Model):
    __tablename__ = 'pin_requests'
    
    pin_requests_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.users_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.categories_id'))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20))
    urgency = db.Column(db.String(20))
    completion_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    # Relationships
    match_history = db.relationship('MatchHistory', backref='request', lazy=True)
    csr_shortlist = db.relationship('CsrShortlist', backref='request', lazy=True)

    # Legacy property for backward compatibility
    @property
    def id(self):
        return self.pin_requests_id

class MatchHistory(db.Model):
    __tablename__ = 'match_history'
    
    match_history_id = db.Column(db.Integer, primary_key=True)
    csr_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    request_id = db.Column(db.Integer, db.ForeignKey('pin_requests.pin_requests_id'))
    matched_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_status = db.Column(db.String(20))

class CsrShortlist(db.Model):
    __tablename__ = 'csr_shortlist'
    
    csr_shortlist_id = db.Column(db.Integer, primary_key=True)
    csr_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    request_id = db.Column(db.Integer, db.ForeignKey('pin_requests.pin_requests_id'))
    shortlisted_at = db.Column(db.DateTime, default=datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedback'

    feedback_id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('pin_requests.pin_requests_id'))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    anonymous = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Legacy property for compatibility
    @property
    def id(self):
        return self.feedback_id

# Provide backward-compatible alias: some modules import CSRShortlist (all-caps 'CSR')
# while the class here is named `CsrShortlist`. Export the expected name.
CSRShortlist = CsrShortlist
class Report(db.Model):
    __tablename__ = 'reports'
    
    reports_id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    report_type = db.Column(db.String(50))
    content = db.Column(db.Text)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

