# app/seed_data.py
from faker import Faker
from .database import db
from .models import User, PinRequest
from app import create_app
import random

def seed():
    app = create_app()
    with app.app_context():
        if User.query.count() > 0:
            print("Database already seeded.")
            return
        fake = Faker()
        pins = []
        for i in range(100):
            u = User(username=f"pin{i}", role="pin")
            db.session.add(u)
            pins.append(u)
        for i in range(50):
            csr = User(username=f"csr{i}", role="csr", company=fake.company())
            db.session.add(csr)
        db.session.commit()
        for pin in pins:
            for _ in range(2):
                r = PinRequest(
                    title=fake.sentence(nb_words=6),
                    description=fake.paragraph(nb_sentences=2),
                    pin_id=pin.id,
                    views=random.randint(0, 50),
                    shortlisted_count=random.randint(0, 10),
                )
                db.session.add(r)
        db.session.commit()
        print("Seed complete: 100 PINs, 50 CSRs, 200 requests")

if __name__ == "__main__":
    seed()
