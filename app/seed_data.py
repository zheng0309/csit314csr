# app/seed_data.py
from app import create_app, db
from app.models import User, PinRequest

app = create_app()

with app.app_context():
    db.create_all()

    if not User.query.first():
        # Add sample CSR users
        for i in range(5):
            user = User(name=f"CSR User {i+1}", role="CSR Rep", email=f"csr{i+1}@mail.com", password="csrpass")
            db.session.add(user)

        # Add sample PIN users
        for i in range(3):
            pin_user = User(name=f"PIN User {i+1}", role="PIN", email=f"pin{i+1}@mail.com", password="pinpass")
            db.session.add(pin_user)

        # Add sample requests
        for i in range(10):
            req = PinRequest(title=f"Request {i+1}", description="Sample help request", status="Open")
            db.session.add(req)

        db.session.commit()
        print("✅ Seeded test data.")
    else:
        print("⚠️ Data already exists.")
