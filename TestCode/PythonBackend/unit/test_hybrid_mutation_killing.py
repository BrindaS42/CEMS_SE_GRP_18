"""
Comprehensive mutation-killing tests for hybrid recommender
"""
import pytest
from unittest.mock import Mock, patch
from bson import ObjectId


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_top_k_multiplier(mock_db, mock_content, mock_collab, mock_demo):
    """Test that top_k*2 is used for sub-recommenders - kills multiplier mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    mock_content.return_value = []
    mock_collab.return_value = []
    mock_demo.return_value = []
    mock_db.event.find.return_value = []
    
    # Test with top_k=5
    recommend_hybrid("profile123", top_k=5)
    
    # Verify top_k*2 = 10 was used
    mock_content.assert_called_once_with("profile123", 10)
    mock_collab.assert_called_once_with("profile123", 10)
    mock_demo.assert_called_once_with("profile123", 10)
    
    # Test with top_k=3
    mock_content.reset_mock()
    mock_collab.reset_mock()
    mock_demo.reset_mock()
    
    recommend_hybrid("profile123", top_k=3)
    
    mock_content.assert_called_once_with("profile123", 6)
    mock_collab.assert_called_once_with("profile123", 6)
    mock_demo.assert_called_once_with("profile123", 6)


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_weights_exact(mock_db, mock_content, mock_collab, mock_demo):
    """Test exact weight values - kills numeric mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event_id = str(ObjectId())
    
    # Content returns one event with score 0.5
    mock_content.return_value = [{"event": {"_id": event_id}, "score": 0.5}]
    mock_collab.return_value = []
    mock_demo.return_value = []
    
    mock_db.event.find.return_value = [{ "_id": ObjectId(event_id), "title": "Test"}]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Content weight is 0.6
    # Score = 0.6 * (1 - 0.5) = 0.6 * 0.5 = 0.3
    assert len(result) > 0
    assert result[0]["score"] == 0.3


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_weight_keys_exact(mock_db, mock_content, mock_collab, mock_demo):
    """Test exact weight dictionary keys - kills string mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event1 = str(ObjectId())
    event2 = str(ObjectId())
    event3 = str(ObjectId())
    
    # Each recommender returns different event
    mock_content.return_value = [{"event": {"_id": event1}, "score": 0.0}]
    mock_collab.return_value = [event2]
    mock_demo.return_value = [event3]
    
    mock_db.event.find.return_value = [
        {"_id": ObjectId(event1), "title": "E1"},
        {"_id": ObjectId(event2), "title": "E2"},
        {"_id": ObjectId(event3), "title": "E3"},
    ]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Verify weights are applied correctly
    # event1: 0.6 * (1 - 0.0) = 0.6
    # event2: 0.3
    # event3: 0.1
    scores = {item["event"]["_id"]: item["score"] for item in result}
    
    assert scores[event1] == 0.6  # content weight
    assert scores[event2] == 0.3  # collab weight
    assert scores[event3] == 0.1  # demo weight


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_score_accumulation(mock_db, mock_content, mock_collab, mock_demo):
    """Test that scores accumulate for same event - kills get default mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event_id = str(ObjectId())
    
    # Same event from all three recommenders
    mock_content.return_value = [{"event": {"_id": event_id}, "score": 0.0}]
    mock_collab.return_value = [event_id]
    mock_demo.return_value = [event_id]
    
    mock_db.event.find.return_value = [{"_id": ObjectId(event_id), "title": "Test"}]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Total score should be sum of all weights
    # 0.6 * (1 - 0.0) + 0.3 + 0.1 = 0.6 + 0.3 + 0.1 = 1.0
    assert len(result) > 0
    assert abs(result[0]["score"] - 1.0) < 0.001


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_sort_descending(mock_db, mock_content, mock_collab, mock_demo):
    """Test results sorted descending - kills sort direction mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event1 = str(ObjectId())
    event2 = str(ObjectId())
    event3 = str(ObjectId())
    
    # Different scores
    mock_content.return_value = [
        {"event": {"_id": event1}, "score": 0.0},  # Will get 0.6
        {"event": {"_id": event2}, "score": 0.5},  # Will get 0.3
    ]
    mock_collab.return_value = [event3]  # Will get 0.3
    mock_demo.return_value = []
    
    mock_db.event.find.return_value = [
        {"_id": ObjectId(event1), "title": "E1"},
        {"_id": ObjectId(event2), "title": "E2"},
        {"_id": ObjectId(event3), "title": "E3"},
    ]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Should be sorted descending by score
    # event1 (0.6) should be first
    assert result[0]["event"]["_id"] == event1
    
    # Scores should be in descending order
    scores = [item["score"] for item in result]
    assert scores == sorted(scores, reverse=True)


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_top_k_slice(mock_db, mock_content, mock_collab, mock_demo):
    """Test that top_k slice is applied after sorting - kills slice mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    # Generate many events
    events = [str(ObjectId()) for _ in range(10)]
    
    mock_content.return_value = [
        {"event": {"_id": eid}, "score": 0.0} for eid in events
    ]
    mock_collab.return_value = []
    mock_demo.return_value = []
    
    mock_db.event.find.return_value = [
        {"_id": ObjectId(eid), "title": f"E{i}"} for i, eid in enumerate(events)
    ]
    
    # Test with top_k=3
    result = recommend_hybrid("profile123", top_k=3)
    assert len(result) == 3
    
    # Test with top_k=5
    result = recommend_hybrid("profile123", top_k=5)
    assert len(result) == 5


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_mongo_query_field(mock_db, mock_content, mock_collab, mock_demo):
    """Test MongoDB query uses $_in operator - kills operator mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event1 = str(ObjectId())
    event2 = str(ObjectId())
    
    mock_content.return_value = [{"event": {"_id": event1}, "score": 0.0}]
    mock_collab.return_value = [event2]
    mock_demo.return_value = []
    
    find_calls = []
    def find_spy(*args, **kwargs):
        find_calls.append((args, kwargs))
        return [
            {"_id": ObjectId(event1), "title": "E1"},
            {"_id": ObjectId(event2), "title": "E2"},
        ]
    
    mock_db.event.find = find_spy
    
    recommend_hybrid("profile123", top_k=10)
    
    # Verify query uses $_id and $in
    assert len(find_calls) > 0
    query = find_calls[0][0][0]
    assert "_id" in query
    assert "$in" in query["_id"]


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_content_score_calculation(mock_db, mock_content, mock_collab, mock_demo):
    """Test content score formula is 1 - score - kills arithmetic mutations"""
    from app.recommender.hybrid import recommend_hybrid
    
    event_id = str(ObjectId())
    
    # Content with score 0.7
    mock_content.return_value = [{"event": {"_id": event_id}, "score": 0.7}]
    mock_collab.return_value = []
    mock_demo.return_value = []
    
    mock_db.event.find.return_value = [{"_id": ObjectId(event_id), "title": "Test"}]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Formula: weight * (1 - score) = 0.6 * (1 - 0.7) = 0.6 * 0.3 = 0.18
    assert len(result) > 0
    assert abs(result[0]["score"] - 0.18) < 0.001  # Float comparison


@patch('app.recommender.hybrid.recommend_demographic')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.db')
def test_recommend_hybrid_deduplication(mock_db, mock_content, mock_collab, mock_demo):
    """Test that events are deduplicated across recommenders"""
    from app.recommender.hybrid import recommend_hybrid
    
    event1 = str(ObjectId())
    event2 = str(ObjectId())
    
    # event1 appears in all three
    mock_content.return_value = [
        {"event": {"_id": event1}, "score": 0.0},
        {"event": {"_id": event2}, "score": 0.0},
    ]
    mock_collab.return_value = [event1]
    mock_demo.return_value = [event1]
    
    mock_db.event.find.return_value = [
        {"_id": ObjectId(event1), "title": "E1"},
        {"_id": ObjectId(event2), "title": "E2"},
    ]
    
    result = recommend_hybrid("profile123", top_k=10)
    
    # Should only have 2 unique events
    event_ids = [item["event"]["_id"] for item in result]
    assert len(event_ids) == len(set(event_ids))  # No duplicates
    assert len(event_ids) == 2
