"""
Simpler mutation-killing tests for content-based filtering
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from bson import ObjectId


@patch('app.recommender.content_based.model')
def test_get_embedding_empty_returns_zeros(mock_model):
    """Test empty string returns zero vector"""
    from app.recommender.content_based import get_embedding, VECTOR_SIZE
    
    result = get_embedding("")
    assert len(result) == VECTOR_SIZE
    assert all(v == 0.0 for v in result)


@patch('app.recommender.content_based.db')
def test_build_event_genome_joins_fields(mock_db):
    """Test event genome includes all fields"""
    from app.recommender.content_based import build_event_genome
    
    event = {
        "title": "Test",
        "description": "Desc",
        "categoryTags": ["tag1"]
    }
    result = build_event_genome(event)
    assert "Test" in result
    assert "Desc" in result
    assert "tag1" in result
