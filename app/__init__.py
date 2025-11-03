import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv  
from app.database import init_db, db
from app.models import *
from app.routes import main 
from sqlalchemy import inspect
from sqlalchemy import text 

def create_app():
    #  Load .env variables before config
    load_dotenv()

    app = Flask(__name__)
    # Single CORS configuration for the whole app (dev: Vite on 5173)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173"]}}, supports_credentials=True)

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

    # Route-specific CORS no longer needed; covered by global CORS above

    #  Initialize the database
    init_db(app)

    # ✅ Create tables and columns BEFORE registering routes
    with app.app_context():
        db.create_all()
        
        # Ensure feedback table exists (create if it doesn't)
        try:
            from app.models import Feedback
            inspector = inspect(db.engine)
            if 'feedback' not in inspector.get_table_names():
                Feedback.__table__.create(db.engine, checkfirst=True)
                print("✅ Feedback table created")
        except Exception as e:
            print(f"⚠️  Note: {str(e)}")
        
        # CRITICAL: Add new columns to pin_requests BEFORE any routes/queries
        try:
            inspector = inspect(db.engine)
            
            # Check if pin_requests table exists
            if 'pin_requests' in inspector.get_table_names():
                columns = [col['name'] for col in inspector.get_columns('pin_requests')]
                
                # Add preferred_time if it doesn't exist
                if 'preferred_time' not in columns:
                    try:
                        with db.engine.begin() as conn:
                            conn.execute(text("ALTER TABLE pin_requests ADD COLUMN preferred_time VARCHAR(255)"))
                        print("✅ Added preferred_time column to pin_requests")
                    except Exception as e:
                        error_str = str(e).lower()
                        if 'already exists' in error_str or 'duplicate' in error_str or 'column' in error_str:
                            print("✅ preferred_time column already exists")
                        else:
                            print(f"⚠️  Could not add preferred_time: {str(e)}")
                
                # Add special_requirements if it doesn't exist
                if 'special_requirements' not in columns:
                    try:
                        with db.engine.begin() as conn:
                            conn.execute(text("ALTER TABLE pin_requests ADD COLUMN special_requirements TEXT"))
                        print("✅ Added special_requirements column to pin_requests")
                    except Exception as e:
                        error_str = str(e).lower()
                        if 'already exists' in error_str or 'duplicate' in error_str or 'column' in error_str:
                            print("✅ special_requirements column already exists")
                        else:
                            print(f"⚠️  Could not add special_requirements: {str(e)}")
        except Exception as e:
            print(f"⚠️  Note: Could not add columns to pin_requests: {str(e)}")
            import traceback
            traceback.print_exc()

    # Register blueprints AFTER database setup
    from app.routes import main
    app.register_blueprint(main)

    print(f"✅ Connected to database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    return app

