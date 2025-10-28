from app.database import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(50))

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
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    status = db.Column(db.String(20))


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
