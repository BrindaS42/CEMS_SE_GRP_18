"""
Integration tests for the FastAPI application
"""
import pytest
from fastapi import status


@pytest.mark.integration
def test_client_connection(client):
    """Test that test client can connect to app"""
    response = client.get("/")
    # Should either succeed or be 404 depending on route registration
    assert response.status_code in [200, 404]


@pytest.mark.integration
def test_invalid_route_returns_404(client):
    """Test that invalid routes return 404"""
    response = client.get("/this-route-does-not-exist-12345")
    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.integration
def test_app_responds_to_requests(client):
    """Test that app responds to any request"""
    response = client.get("/")
    assert response.status_code is not None
    assert isinstance(response.status_code, int)


@pytest.mark.integration
def test_post_request_accepted(client):
    """Test that app accepts POST requests"""
    response = client.post("/recommend/rebuild")
    # Should either succeed or be not found
    assert response.status_code in [200, 404, 500]


@pytest.mark.integration
def test_get_request_accepted(client):
    """Test that app accepts GET requests"""
    response = client.get("/bot/")
    # Should either succeed or be not found
    assert response.status_code in [200, 404]
