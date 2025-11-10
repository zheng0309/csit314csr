import pytest
import os
import json

def test_api_health_check():
    """Test the health check endpoint."""
    # Set required environment variables for testing
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'csruser')
    os.environ.setdefault('DB_PASS', 'csrpass')
    os.environ.setdefault('DB_NAME', 'csrdb')
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    
    from app import create_app
    
    app = create_app()
    
    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert 'message' in data
        assert 'CSR Volunteer System is running' in data['message']
        assert data['status'] == 'healthy'
        assert data['version'] == '2.0'

def test_api_endpoints_structure():
    """Test that API endpoints return proper JSON structure."""
    os.environ.setdefault('DB_HOST', 'localhost')
    os.environ.setdefault('DB_PORT', '5432')
    os.environ.setdefault('DB_USER', 'csruser')
    os.environ.setdefault('DB_PASS', 'csrpass')
    os.environ.setdefault('DB_NAME', 'csrdb')
    os.environ.setdefault('SECRET_KEY', 'testing-secret')
    
    from app import create_app
    
    app = create_app()
    
    with app.test_client() as client:
        # Test requests endpoint
        response = client.get('/requests')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        # Test users endpoint
        response = client.get('/users')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        # Test categories endpoint
        response = client.get('/categories')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        # Test stats endpoint
        response = client.get('/stats')
        assert response.status_code == 200
        assert response.content_type == 'application/json'
        
        data = json.loads(response.data)
        assert 'total_users' in data
        assert 'total_requests' in data
        assert 'users_by_role' in data
        assert 'requests_by_status' in data
