import pytest
import os
import json
import sys

def test_api_health_check():
    """Test the health check endpoint."""
    # Set required environment variables for testing
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'csruser')
    os.environ.setdefault('DB_PASS', 'csrpass')
    os.environ.setdefault('DB_NAME', 'csrdb')
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    
    try:
        from app import create_app
        app = create_app()
        
        with app.test_client() as client:
            response = client.get('/')
            assert response.status_code == 200
            
            data = json.loads(response.data)
            assert 'message' in data
            assert 'CSR Volunteer System is running' in data['message']
    except Exception as e:
        if "connection" in str(e).lower() or "database" in str(e).lower():
            pytest.skip(f"Database connection not available: {e}")
        else:
            raise

def test_api_endpoints_exist():
    """Test that main API endpoints exist and return appropriate responses."""
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'csruser')
    os.environ.setdefault('DB_PASS', 'csrpass')
    os.environ.setdefault('DB_NAME', 'csrdb')
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    
    try:
        from app import create_app
        app = create_app()
        
        with app.test_client() as client:
            # Test health check - this should always work
            response = client.get('/')
            assert response.status_code == 200
            assert response.content_type == 'application/json'
            
            # Test other endpoints - they may return 500 if DB is not available
            # but they should at least exist (not 404)
            endpoints_to_test = ['/requests', '/users', '/api/categories']
            
            for endpoint in endpoints_to_test:
                response = client.get(endpoint)
                # Endpoint should exist (not 404), even if it fails due to DB issues
                assert response.status_code != 404, f"Endpoint {endpoint} not found (404)"
                # Should return JSON content type
                assert 'application/json' in response.content_type
    except Exception as e:
        if "connection" in str(e).lower() or "database" in str(e).lower():
            pytest.skip(f"Database connection not available: {e}")
        else:
            raise
