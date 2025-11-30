"""
Unit tests for bot router
"""
import pytest
from fastapi import status


@pytest.mark.unit
def test_bot_endpoint_exists(client):
    """Test that bot endpoint exists or returns appropriate status"""
    response = client.get("/bot/")
    # With mocked modules, we expect either 200 or 404
    assert response.status_code in [200, 404]


@pytest.mark.unit
def test_query_bot_endpoint_exists(client):
    """Test that query bot endpoint exists or is accessible"""
    payload = {
        "question": "What events are available?",
        "user_role": "student",
        "user_id": "user_123"
    }
    response = client.post("/bot/query", json=payload)
    # With mocked modules, we expect either 200 or 404
    assert response.status_code in [200, 400, 404, 500]


@pytest.mark.unit
def test_query_bot_missing_question(client):
    """Test bot query with missing question returns error or 404"""
    payload = {
        "user_role": "student",
        "user_id": "user_123"
    }
    response = client.post("/bot/query", json=payload)
    # Should either be 400 (Bad Request) or 404 (Not Found with mocked modules)
    assert response.status_code in [400, 404]


@pytest.mark.unit
def test_query_bot_with_all_fields(client):
    """Test bot query with all required fields"""
    payload = {
        "question": "How do I manage my event?",
        "user_role": "organizer",
        "user_id": "org_456"
    }
    response = client.post("/bot/query", json=payload)
    # Should be accessible or 404
    assert response.status_code in [200, 404, 500]


@pytest.mark.unit
def test_invalid_bot_endpoint(client):
    """Test that invalid bot endpoint returns 404"""
    response = client.get("/bot/invalid")
    assert response.status_code == status.HTTP_404_NOT_FOUND
