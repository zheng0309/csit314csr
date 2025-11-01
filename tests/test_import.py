def test_app_import():
    """Simple smoke test: ensure the Flask app factory can be imported and called."""
    from app import create_app

    app = create_app()
    assert app is not None
