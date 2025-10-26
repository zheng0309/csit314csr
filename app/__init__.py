import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv  
from app.database import init_db, db
from app.models import *
from app.routes import main 

def create_app():
    #  Load .env variables before config
    load_dotenv()

    app = Flask(__name__)

    #  PostgreSQL connection using .env values
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql://{os.getenv('DB_USER', 'csruser')}:"
        f"{os.getenv('DB_PASS', 'csrpass')}@"
        f"{os.getenv('DB_HOST', 'db')}:"
        f"{os.getenv('DB_PORT', 5432)}/"
        f"{os.getenv('DB_NAME', 'csrdb')}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey')

    #  Enable CORS for frontend
    CORS(app)

    #  Initialize the database
    init_db(app)

    # Register blueprints
    from app.routes import main
    app.register_blueprint(main)

    return app
