from datetime import datetime
import random
from faker import Faker
from .database import db
from .models import User, Category, PinRequest
from . import create_app

fake = Faker()

def seed_data():
    print("🌱 Seeding database...")

    # --- Categories ---
    if Category.query.count() == 0:
        categories = ["Food", "Education", "Healthcare", "Transport"]
        for name in categories:
            db.session.add(Category(name=name, description=f"{name} related assistance"))
        db.session.commit()
        print("✅ Categories added.")
    else:
        print("⚠️ Categories already exist.")

    # --- Users ---
    if User.query.count() == 0:
        for _ in range(20):
            db.session.add(
                User(
                    name=fake.name(),
                    email=fake.unique.email(),
                    password_hash="hashed-password",
                    role=random.choice(["pin", "csr", "manager", "admin"]),
                )
            )
        db.session.commit()
        print("✅ Users added.")
    else:
        print("⚠️ Users already exist.")

    # --- Requests ---
    if PinRequest.query.count() == 0:
        users = User.query.all()
        cats = Category.query.all()
        for _ in range(100):
            db.session.add(
                PinRequest(
                    user_id=random.choice(users).user_id,
                    category_id=random.choice(cats).category_id,
                    title=fake.sentence(),
                    description=fake.text(),
                    location=fake.city(),
                    urgency=random.choice(["low", "medium", "high"]),
                    created_at=datetime.utcnow(),
                )
            )
        db.session.commit()
        print("✅ 100 PinRequests added.")
    else:
        print("⚠️ PinRequests already exist.")

    print("🎉 Seeding complete.")
    
def main():
    app = create_app()
    with app.app_context():
        seed_data()

if __name__ == "__main__":
    main()
