<<<<<<< HEAD
import importlib


def test_create_app_imports():
    """Smoke test: ensure the Flask app factory imports without errors."""
    app_mod = importlib.import_module('app')
    create_app = getattr(app_mod, 'create_app', None)
    assert create_app is not None
=======
def test_app_import():
    """Simple smoke test: ensure the Flask app factory can be imported and called."""
    from app import create_app

>>>>>>> b4f56f0239a8e19d03839d1a1db697856994eae9
    app = create_app()
    assert app is not None
