from datetime import datetime
from app import db

# -------------------------------------------------------------------
# USER TABLE
# -------------------------------------------------------------------
class User(db.Model):
    __tablename__ = 'users'

    users_id = db.Column(db.Integer, primary_key=True)  # PK
    username = db.Column(db.String(50), unique=True, nullable=False)  # username e.g. pin001, csr001
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # admin, platform_manager, csr_rep, pin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    pin_requests = db.relationship('PinRequest', backref='pin_user', lazy=True)
    reports = db.relationship('Report', backref='manager', lazy=True)
    shortlists = db.relationship('CSRShortlist', backref='csr_user', lazy=True)
    matches = db.relationship('MatchHistory', backref='csr_match', lazy=True)

    def __repr__(self):
        return f"<User {self.user_id} ({self.role})>"


# -------------------------------------------------------------------
# CATEGORY TABLE
# -------------------------------------------------------------------
class Category(db.Model):
    __tablename__ = 'categories'

    categories_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))

    pin_requests = db.relationship('PinRequest', backref='category', lazy=True)

    def __repr__(self):
        return f"<Category {self.name}>"


# -------------------------------------------------------------------
# PIN REQUEST TABLE
# -------------------------------------------------------------------
class PinRequest(db.Model):
    __tablename__ = 'pin_requests'

    pin_requests_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.users_id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.categories_id'))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='open')  # open, matched, closed
    urgency = db.Column(db.String(20), default='medium')  # low, medium, high
    completion_note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    # Relationships
    shortlists = db.relationship('CSRShortlist', backref='request', lazy=True)
    matches = db.relationship('MatchHistory', backref='request', lazy=True)

    def __repr__(self):
        return f"<Request {self.title} ({self.status})>"


# -------------------------------------------------------------------
# CSR SHORTLIST TABLE
# -------------------------------------------------------------------
class CSRShortlist(db.Model):
    __tablename__ = 'csr_shortlist'

    csr_shortlist_id = db.Column(db.Integer, primary_key=True)
    csr_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    request_id = db.Column(db.Integer, db.ForeignKey('pin_requests.pin_requests_id'))
    shortlisted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Shortlist CSR:{self.csr_id} Req:{self.request_id}>"


# -------------------------------------------------------------------
# MATCH HISTORY TABLE
# -------------------------------------------------------------------
class MatchHistory(db.Model):
    __tablename__ = 'match_history'

    match_history_id = db.Column(db.Integer, primary_key=True)
    csr_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    request_id = db.Column(db.Integer, db.ForeignKey('pin_requests.pin_requests_id'))
    matched_at = db.Column(db.DateTime, default=datetime.utcnow)
    match_status = db.Column(db.String(20), default='pending')  # pending, completed, cancelled

    def __repr__(self):
        return f"<Match Req:{self.request_id} CSR:{self.csr_id} ({self.match_status})>"


# -------------------------------------------------------------------
# REPORT TABLE
# -------------------------------------------------------------------
class Report(db.Model):
    __tablename__ = 'reports'

    reports_id = db.Column(db.Integer, primary_key=True)
    manager_id = db.Column(db.Integer, db.ForeignKey('users.users_id'))
    report_type = db.Column(db.String(50))  # weekly, monthly, custom
    content = db.Column(db.Text)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Report {self.report_type} by Manager:{self.manager_id}>"
