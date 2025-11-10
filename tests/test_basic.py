import pytest
import os

def test_flask_app_creation():
    """Test that Flask app can be created without database connection."""
    # Set minimal environment variables
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'test')
    os.environ.setdefault('DB_PASS', 'test')
    os.environ.setdefault('DB_NAME', 'test')
    
    try:
        from app import create_app
        app = create_app()
        assert app is not None
        assert app.name == 'app'
    except Exception as e:
        # If database connection fails, that's OK for this test
        # We just want to make sure the app factory works
        if "connection" in str(e).lower() or "database" in str(e).lower():
            pytest.skip(f"Database connection not available: {e}")
        else:
            raise

def test_routes_blueprint_registration():
    """Test that routes blueprint is properly registered."""
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'test')
    os.environ.setdefault('DB_PASS', 'test')
    os.environ.setdefault('DB_NAME', 'test')
    
    try:
        from app import create_app
        app = create_app()
        
        # Check that blueprints are registered
        blueprint_names = [bp.name for bp in app.blueprints.values()]
        assert 'main' in blueprint_names
        
    except Exception as e:
        if "connection" in str(e).lower() or "database" in str(e).lower():
            pytest.skip(f"Database connection not available: {e}")
        else:
            raise
