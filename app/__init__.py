# app/__init__.py
import os
from flask import Flask
from .database import db, migrate
from .routes import bp as main_bp

def create_app():
    app = Flask(__name__)

    # SQLite configuration
    db_path = os.environ.get("DB_PATH", "data.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret")

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(main_bp)

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
