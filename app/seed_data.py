# app/seed_data.py
from app import create_app, db
from app.models import User, PinRequest

app = create_app()

with app.app_context():
    db.create_all()

    if not User.query.first():
        for i in range(10):
            user = User(name=f"User {i+1}", role="CSR Rep", email=f"user{i+1}@mail.com")
            db.session.add(user)

        for i in range(100):
            req = PinRequest(title=f"Request {i+1}", description="Sample request")
            db.session.add(req)

        db.session.commit()
        print(" Seeded test data.")
    else:
        print(" Data already exists.")
