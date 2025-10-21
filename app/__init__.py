import os
from flask import Flask
from flask_cors import CORS
from .database import db, migrate
from .routes import bp as main_bp

def create_app():
    """Flask application factory."""
    app = Flask(__name__)

    # Prefer Postgres from env; fallback to SQLite for dev
    POSTGRES_USER = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_DB = os.getenv("POSTGRES_DB")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "db")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

    if all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST]):
        app.config["SQLALCHEMY_DATABASE_URI"] = (
            f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}"
            f"@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
        )
    else:
        db_path = os.getenv("DB_PATH", "data.db")
        app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    app.register_blueprint(main_bp)

    @app.get("/health")
    def health():
        return {"status": "ok", "database": str(db.engine.url)}

    return app
