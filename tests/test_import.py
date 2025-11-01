import importlib


def test_create_app_imports():
    """Smoke test: ensure the Flask app factory imports without errors."""
    app_mod = importlib.import_module('app')
    create_app = getattr(app_mod, 'create_app', None)
    assert create_app is not None
    app = create_app()
    assert app is not None
