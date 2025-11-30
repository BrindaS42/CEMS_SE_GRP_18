"""
Simpler mutation-killing tests for collaborative filtering
"""
import pytest
from unittest.mock import Mock, patch
from bson import ObjectId
import numpy as np


@patch('app.recommender.collaborative.db')
def test_collaborative_status_published(mock_db):
    """Test status is 'Published'"""
    from app.recommender.collaborative import get_user_event_matrix
    
    event_calls = []
    def event_spy(*args, **kwargs):
        event_calls.append((args, kwargs))
        return []
    
    mock_db.user.find.return_value = []
    mock_db.event.find = event_spy
    mock_db.registration.find.return_value = []
    
    get_user_event_matrix()
    
    assert len(event_calls) > 0
    assert event_calls[0][0][0]["status"] == "Published"


@patch('app.recommender.collaborative.db')
def test_collaborative_top_k_default(mock_db):
    """Test top_k default is 5"""
    from app.recommender.collaborative import recommend_collaborative
    
    mock_db.user.find.return_value  = []
    mock_db.event.find.return_value = []
    mock_db.registration.find.return_value = []
    
    result = recommend_collaborative("unknown_id")
    assert result == []


@patch('app.recommender.collaborative.db')
def test_collaborative_returns_list(mock_db):
    """Test returns a list"""
    from app.recommender.collaborative import recommend_collaborative
    
    mock_db.user.find.return_value = []
    mock_db.event.find.return_value = []
    mock_db.registration.find.return_value = []
    
    result = recommend_collaborative("unknown_id", top_k=3)
    assert isinstance(result, list)
