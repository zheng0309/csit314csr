from faker import Faker
from app import create_app, db
from app.models import User, PinRequest

fake = Faker()

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        users = [User(name=fake.name(), role=fake.random_element(["CSR", "PIN"])) for _ in range(50)]
        requests = [
            PinRequest(
                title=fake.sentence(nb_words=5),
                description=fake.text(max_nb_chars=200),
                status=fake.random_element(["Pending", "Approved", "Completed"])
            )
            for _ in range(100)
        ]

        db.session.add_all(users + requests)
        db.session.commit()
        print("✅ Seeded 50 users and 100 requests.")

if __name__ == "__main__":
    seed()
