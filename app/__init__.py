import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
migrate = Migrate()
# Single shared SQLAlchemy instance
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # ✅ Load environment variable safely (default if missing)
    database_uri = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/csrdb")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # ✅ Initialize SQLAlchemy with Flask app
    db.init_app(app)
    migrate.init_app(app, db)

    # Import models & routes AFTER db.init_app
    from app import models, routes
    app.register_blueprint(routes.bp)

    # ✅ Create tables automatically
    with app.app_context():
        db.create_all()

    print(f"✅ Connected to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    return app
