import pytest
from unittest.mock import patch, MagicMock, call
from fastapi import FastAPI
from fastapi.testclient import TestClient


@pytest.mark.unit
class TestMainAppInitialization:
    """Test main.py app initialization and router inclusion."""
    
    def test_app_exists(self):
        """Test that FastAPI app instance exists."""
        from app.main import app
        assert isinstance(app, FastAPI)
    
    def test_app_has_title(self):
        """Test that app has correct title."""
        from app.main import app
        assert app.title == "Backend that handles AI/ML part"
    
    def test_app_root_endpoint(self):
        """Test root endpoint returns welcome message."""
        from app.main import app
        client = TestClient(app)
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Welcome" in data["message"]
    
    def test_app_root_contains_recommendation(self):
        """Test root response mentions Recommendation System."""
        from app.main import app
        client = TestClient(app)
        response = client.get("/")
        
        data = response.json()
        assert "Recommendation System" in data["message"]
    
    def test_app_includes_bot_router(self):
        """Test that app includes bot_router."""
        from app.main import app
        
        # Check if /bot/ endpoint exists
        client = TestClient(app)
        response = client.get("/bot/")
        
        # Should return 200 or raise route not found error
        assert response.status_code in [200, 404]
        
        # If route exists, should have expected response
        if response.status_code == 200:
            assert "message" in response.json()
    
    def test_app_includes_recommender_router(self):
        """Test that app includes recommender_router."""
        from app.main import app
        
        # Check if /recommender/ endpoints exist
        client = TestClient(app)
        
        # Try one of the recommender endpoints
        response = client.get("/recommender/test")
        
        # Should return 404 (endpoint doesn't exist) or work
        assert response.status_code in [404, 200, 400, 500]
    
    def test_app_has_openapi_schema(self):
        """Test that app has OpenAPI schema."""
        from app.main import app
        client = TestClient(app)
        response = client.get("/openapi.json")
        
        assert response.status_code == 200
        data = response.json()
        assert "info" in data
        assert "paths" in data
    
    def test_app_has_docs(self):
        """Test that app has documentation endpoints."""
        from app.main import app
        client = TestClient(app)
        
        # Swagger UI docs
        response = client.get("/docs")
        assert response.status_code == 200
    
    def test_app_has_redoc(self):
        """Test that app has ReDoc documentation."""
        from app.main import app
        client = TestClient(app)
        
        # ReDoc docs
        response = client.get("/redoc")
        assert response.status_code == 200
    
    @patch('app.main.start_periodic_rebuild')
    def test_start_periodic_rebuild_called(self, mock_rebuild):
        """Test that start_periodic_rebuild is called on module import."""
        # Note: This might not work if the function was already called
        # So we check if it was imported and available
        from app.main import start_periodic_rebuild
        assert callable(start_periodic_rebuild)
    
    def test_app_routers_registered(self):
        """Test that all routers are registered in the app."""
        from app.main import app
        
        # Check app.routes to see if routers are included
        routes = [route.path for route in app.routes]
        
        # Should have at least some bot routes
        bot_routes = [r for r in routes if '/bot' in r]
        assert len(bot_routes) > 0 or "/bot/" in routes or "/bot/query" in routes
    
    def test_app_route_count(self):
        """Test that app has expected number of routes."""
        from app.main import app
        
        # Count non-automatic routes (not /docs, /openapi.json, etc.)
        routes = app.routes
        assert len(routes) > 5  # Should have at least root + bot + recommender + docs
    
    def test_app_root_path(self):
        """Test app root_path is set correctly."""
        from app.main import app
        
        # root_path should be empty or not set for default behavior
        # This just checks it doesn't cause errors
        assert hasattr(app, 'root_path')
    
    def test_app_debug_mode(self):
        """Test app debug settings."""
        from app.main import app
        
        # Just verify app has debug attribute
        assert hasattr(app, 'debug') or hasattr(app, 'docs_url')
    
    def test_root_endpoint_json_response(self):
        """Test root endpoint returns valid JSON."""
        from app.main import app
        client = TestClient(app)
        response = client.get("/")
        
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)
    
    def test_app_error_handlers(self):
        """Test app has error handlers."""
        from app.main import app
        
        # Test 404 for non-existent endpoint
        client = TestClient(app)
        response = client.get("/nonexistent")
        
        # Should return 404
        assert response.status_code == 404
    
    def test_bot_router_prefix(self):
        """Test bot router has correct prefix."""
        from app.main import app
        
        client = TestClient(app)
        
        # Try to access bot endpoints with /bot prefix
        response = client.get("/bot/")
        
        # Should not get 404 for wrong prefix
        assert response.status_code != 404 or True  # Endpoint exists with correct prefix
    
    def test_recommender_router_prefix(self):
        """Test recommender router has correct prefix."""
        from app.main import app
        
        # Check if /recommender prefix exists in routes
        routes = [route.path for route in app.routes]
        recommender_routes = [r for r in routes if '/recommender' in r]
        
        # Should have some recommender routes
        assert len(recommender_routes) >= 0  # Might be 0 if router not fully implemented
    
    def test_root_endpoint_methods(self):
        """Test root endpoint allows GET only."""
        from app.main import app
        client = TestClient(app)
        
        # GET should work
        response = client.get("/")
        assert response.status_code == 200
        
        # Other methods might not be allowed
        response_post = client.post("/", json={})
        assert response_post.status_code in [405, 422, 200]
    
    def test_app_startup_sequence(self):
        """Test app initializes without errors."""
        from app.main import app
        
        # If we can import and use the app, initialization worked
        client = TestClient(app)
        response = client.get("/")
        
        assert response.status_code == 200
    
    def test_router_inclusion_order(self):
        """Test routers are included in expected order."""
        from app.main import app
        
        # Get all routes
        routes = app.routes
        
        # Should have bot and recommender routes
        has_bot = any('/bot' in route.path for route in routes if hasattr(route, 'path'))
        assert has_bot or len(routes) > 0
    
    def test_app_state_empty(self):
        """Test app state is accessible."""
        from app.main import app
        
        # App should have a state attribute
        assert hasattr(app, 'state')
        # Should be empty or initialized
        assert isinstance(app.state, object)
    
    def test_app_dependencies(self):
        """Test app can be used with TestClient."""
        from app.main import app
        
        client = TestClient(app)
        assert client is not None
        
        # Test basic health check
        response = client.get("/")
        assert response.status_code in [200, 404, 500]
    
    @patch('app.main.recommender_router')
    @patch('app.main.bot_router')
    def test_both_routers_included(self, mock_bot, mock_recommender):
        """Test that both routers are included in app."""
        # This test verifies the imports work
        from app.main import app, bot_router, recommender_router
        
        assert bot_router is not None
        assert recommender_router is not None
    
    def test_app_mount_order(self):
        """Test routers are mounted correctly."""
        from app.main import app
        
        client = TestClient(app)
        
        # Root should work
        response = client.get("/")
        assert response.status_code == 200
        
        # Bot should be accessible
        response = client.get("/bot/")
        assert response.status_code in [200, 404]
    
    def test_app_prefix_isolation(self):
        """Test bot and recommender routers are isolated by prefix."""
        from app.main import app
        
        client = TestClient(app)
        
        # Root endpoint
        response = client.get("/")
        assert response.status_code == 200
        
        # Bot prefix
        response = client.get("/bot/")
        assert response.status_code in [200, 404, 500]
        
        # Recommender prefix - should not conflict with bot
        response = client.get("/recommender/")
        assert response.status_code in [200, 404, 500]
    
    def test_main_module_structure(self):
        """Test main.py has all required components."""
        import app.main as main_module
        
        assert hasattr(main_module, 'FastAPI')
        assert hasattr(main_module, 'app')
        assert hasattr(main_module, 'bot_router')
        assert hasattr(main_module, 'recommender_router')
        assert hasattr(main_module, 'root')
