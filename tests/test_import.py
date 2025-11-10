import pytest
import os

def test_create_app_imports():
    """Smoke test: ensure the Flask app factory imports and creates an app instance."""
    # Set required environment variables for testing
    os.environ.setdefault('DB_HOST', 'postgres')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'csruser')
    os.environ.setdefault('DB_PASS', 'csrpass')
    os.environ.setdefault('DB_NAME', 'csrdb')
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    
    from app import create_app
    
    app = create_app()
    assert app is not None
    assert app.config['TESTING'] is False  # Default config

def test_models_import():
    """Test that all models can be imported without errors."""
    from app.models import User, PinRequest, Category, MatchHistory, CsrShortlist, Report
    
    # Test that classes are properly defined
    assert User.__tablename__ == 'users'
    assert PinRequest.__tablename__ == 'pin_requests'
    assert Category.__tablename__ == 'categories'
    assert MatchHistory.__tablename__ == 'match_history'
    assert CsrShortlist.__tablename__ == 'csr_shortlist'
    assert Report.__tablename__ == 'reports'

def test_routes_import():
    """Test that routes can be imported without errors."""
    from app.routes import main
    
    assert main is not None
    assert main.name == 'main'

def test_database_import():
    """Test that database module imports correctly."""
    from app.database import db, migrate, init_db
    
    assert db is not None
    assert migrate is not None
    assert init_db is not None
