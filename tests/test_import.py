def test_create_app_imports():
    """Smoke test: ensure the Flask app factory imports and creates an app instance."""
    from app import create_app

    app = create_app()
    assert app is not None
