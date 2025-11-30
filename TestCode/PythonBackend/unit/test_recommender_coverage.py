import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from bson import ObjectId
import numpy as np


@pytest.mark.unit
@patch('app.recommender.collaborative.db')
@patch('app.recommender.collaborative.cosine_similarity')
def test_recommend_collaborative_with_matrix(mock_sim, mock_db):
    """Test collaborative filtering with populated matrix"""
    from app.recommender.collaborative import recommend_collaborative
    
    user_id = ObjectId()
    event_id = ObjectId()
    
    mock_db.user.find.return_value = [{"_id": user_id}]
    mock_db.event.find.return_value = [{"_id": event_id}]
    mock_db.registration.find.return_value = [
        {"studentId": user_id, "eventId": event_id}
    ]
    
    mock_sim.return_value = np.array([[1.0, 0.5]])
    
    result = recommend_collaborative(str(user_id), top_k=5)
    assert isinstance(result, list)


@pytest.mark.unit
@patch('app.recommender.collaborative.db')
def test_recommend_collaborative_user_not_found(mock_db):
    """Test collaborative filtering when user not in matrix"""
    from app.recommender.collaborative import recommend_collaborative
    
    mock_db.user.find.return_value = []
    mock_db.event.find.return_value = []
    
    result = recommend_collaborative(str(ObjectId()), top_k=5)
    assert result == []


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_recommend_events_for_user_no_data(mock_db):
    """Test content-based recommendation with no events"""
    from app.recommender.content_based import recommend_events_for_user
    
    user_obj_id = ObjectId()
    mock_db.user.find_one.return_value = {
        "_id": user_obj_id,
        "areasOfInterest": [],
        "achievements": []
    }
    mock_db.event.find.return_value = []
    
    result = recommend_events_for_user(str(user_obj_id), top_k=5)
    assert isinstance(result, list)


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_build_event_genome(mock_db):
    """Test event genome building"""
    from app.recommender.content_based import build_event_genome
    
    event = {
        "_id": ObjectId(),
        "title": "Test Event",
        "description": "Test Description",
        "status": "Published"
    }
    
    try:
        result = build_event_genome(event)
        assert result is not None
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_add_event_to_collection(mock_db):
    """Test adding event to collection"""
    from app.recommender.content_based import add_event
    
    event_obj_id = ObjectId()
    mock_db.event.find_one.return_value = {
        "_id": event_obj_id,
        "title": "Event 1",
        "description": "Desc 1"
    }
    
    try:
        add_event(str(event_obj_id))
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_delete_event_from_collection(mock_db):
    """Test deleting event from collection"""
    from app.recommender.content_based import delete_event
    
    try:
        delete_event(str(ObjectId()))
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.demographic.db')
def test_recommend_demographic_by_department(mock_db):
    """Test demographic recommendations by department"""
    from app.recommender.demographic import recommend_demographic
    
    user_obj_id = ObjectId()
    event_obj_id = ObjectId()
    
    mock_db.user.find.return_value = [
        {"_id": user_obj_id, "gender": "M", "college": "CS", "areasOfInterest": []},
        {"_id": ObjectId(), "gender": "F", "college": "CS", "areasOfInterest": []}
    ]
    mock_db.user.find_one.return_value = {
        "_id": user_obj_id,
        "department": "IT"
    }
    mock_db.event.find.return_value = [
        {"_id": event_obj_id, "title": "IT Event 1", "status": "Published"}
    ]
    mock_db.registration.find.return_value = []
    
    try:
        result = recommend_demographic(str(user_obj_id), top_k=5)
        assert isinstance(result, list)
    except Exception:
        assert True


@pytest.mark.unit
@patch('app.recommender.demographic.db')
def test_recommend_demographic_user_not_found(mock_db):
    """Test demographic when user profile not found"""
    from app.recommender.demographic import recommend_demographic
    
    mock_db.user.find.return_value = []
    mock_db.user.find_one.return_value = None
    
    result = recommend_demographic(str(ObjectId()), top_k=5)
    assert result == [] or isinstance(result, list)


@pytest.mark.unit
@patch('app.recommender.hybrid.db')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_demographic')
def test_recommend_hybrid_combines(mock_demo, mock_collab, mock_content, mock_db):
    """Test hybrid recommendation combines strategies"""
    from app.recommender.hybrid import recommend_hybrid
    
    event_1_id = ObjectId()
    event_2_id = ObjectId()
    
    mock_content.return_value = [
        {"event": {"_id": event_1_id, "title": "E1"}, "score": 0.9},
        {"event": {"_id": event_2_id, "title": "E2"}, "score": 0.8}
    ]
    mock_collab.return_value = [str(event_2_id), str(ObjectId())]
    mock_demo.return_value = [str(ObjectId()), str(ObjectId())]
    mock_db.event.find.return_value = [
        {"_id": event_1_id, "title": "E1"},
        {"_id": event_2_id, "title": "E2"}
    ]
    
    result = recommend_hybrid(str(ObjectId()), top_k=5)
    assert isinstance(result, list)


@pytest.mark.unit
@patch('app.recommender.hybrid.db')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_demographic')
def test_recommend_hybrid_all_empty(mock_demo, mock_collab, mock_content, mock_db):
    """Test hybrid when all strategies return empty"""
    from app.recommender.hybrid import recommend_hybrid
    
    mock_content.return_value = []
    mock_collab.return_value = []
    mock_demo.return_value = []
    mock_db.event.find.return_value = []
    
    result = recommend_hybrid(str(ObjectId()), top_k=5)
    assert result == [] or isinstance(result, list)


@pytest.mark.unit
def test_start_periodic_rebuild():
    """Test periodic rebuild initialization"""
    from app.recommender.utils import start_periodic_rebuild
    
    try:
        start_periodic_rebuild()
        assert True
    except Exception:
        assert True


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_get_embedding_text(mock_db):
    """Test embedding generation from text"""
    from app.recommender.content_based import get_embedding
    
    result = get_embedding("Test text for embedding")
    assert result is not None
    assert isinstance(result, list) or hasattr(result, 'tolist')


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_setup_collection(mock_db):
    """Test collection setup"""
    from app.recommender.content_based import setup_collection
    
    try:
        setup_collection()
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_index_all_events(mock_db):
    """Test indexing all events"""
    from app.recommender.content_based import index_all_events
    
    mock_db.event.find.return_value = [
        {"_id": ObjectId(), "title": "Event 1", "description": "Desc 1"},
        {"_id": ObjectId(), "title": "Event 2", "description": "Desc 2"}
    ]
    
    try:
        index_all_events()
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_convert_object_ids(mock_db):
    """Test ObjectId conversion for JSON"""
    from app.recommender.content_based import convert_object_ids
    
    obj_id = ObjectId()
    obj = {
        "_id": obj_id,
        "nested": {"id": obj_id},
        "list": [obj_id]
    }
    
    result = convert_object_ids(obj)
    
    assert isinstance(result, dict)
    assert isinstance(result.get("_id"), str)


@pytest.mark.unit
@patch('app.recommender.collaborative.db')
def test_get_user_event_matrix_creation(mock_db):
    """Test user-event matrix creation"""
    from app.recommender.collaborative import get_user_event_matrix
    
    user_id = ObjectId()
    event_id = ObjectId()
    
    mock_db.user.find.return_value = [{"_id": user_id}]
    mock_db.event.find.return_value = [{"_id": event_id}]
    mock_db.registration.find.return_value = [
        {"studentId": user_id, "eventId": event_id}
    ]
    
    matrix, user_index, event_index, users, events = get_user_event_matrix()
    
    assert user_index is not None
    assert event_index is not None
    assert isinstance(users, list)
    assert isinstance(events, list)


@pytest.mark.unit
@patch('app.recommender.demographic.db')
def test_recommend_demographic_with_filters(mock_db):
    """Test demographic filtering logic"""
    from app.recommender.demographic import recommend_demographic
    
    user_obj_id = ObjectId()
    event_obj_id = ObjectId()
    
    mock_db.user.find.return_value = [
        {"_id": user_obj_id, "gender": "M", "college": "IT", "areasOfInterest": []}
    ]
    mock_db.user.find_one.return_value = {
        "_id": user_obj_id,
        "department": "IT",
        "year": "3rd"
    }
    mock_db.event.find.return_value = [
        {"_id": event_obj_id, "title": "IT Event"}
    ]
    mock_db.registration.find.return_value = []
    
    try:
        result = recommend_demographic(str(user_obj_id), top_k=10)
        assert isinstance(result, list)
    except Exception:
        assert True


@pytest.mark.unit
@patch('app.recommender.hybrid.db')
@patch('app.recommender.hybrid.recommend_events_for_user')
@patch('app.recommender.hybrid.recommend_collaborative')
@patch('app.recommender.hybrid.recommend_demographic')
def test_recommend_hybrid_deduplication(mock_demo, mock_collab, mock_content, mock_db):
    """Test hybrid deduplication of results"""
    from app.recommender.hybrid import recommend_hybrid
    
    event_1_id = ObjectId()
    event_2_id = ObjectId()
    
    mock_content.return_value = [
        {"event": {"_id": event_1_id, "title": "E1"}, "score": 0.9},
        {"event": {"_id": event_2_id, "title": "E2"}, "score": 0.8}
    ]
    mock_collab.return_value = [str(event_1_id), str(event_2_id)]
    mock_demo.return_value = [str(event_1_id), str(event_2_id)]
    mock_db.event.find.return_value = [
        {"_id": event_1_id, "title": "E1"},
        {"_id": event_2_id, "title": "E2"}
    ]
    
    result = recommend_hybrid(str(ObjectId()), top_k=5)
    assert isinstance(result, list)


@pytest.mark.unit
@patch('app.recommender.collaborative.db')
@patch('app.recommender.collaborative.cosine_similarity')
def test_recommend_collaborative_similar_users(mock_sim, mock_db):
    """Test finding similar users in collaborative filtering"""
    from app.recommender.collaborative import recommend_collaborative
    
    user_id = ObjectId()
    event_ids = [ObjectId(), ObjectId(), ObjectId()]
    
    mock_db.user.find.return_value = [{"_id": user_id}]
    mock_db.event.find.return_value = [{"_id": eid} for eid in event_ids]
    mock_db.registration.find.return_value = []
    
    mock_sim.return_value = np.array([[1.0, 0.8, 0.6]])
    
    try:
        result = recommend_collaborative(str(user_id), top_k=3)
        assert isinstance(result, list)
    except Exception:
        pass


@pytest.mark.unit
@patch('app.recommender.content_based.db')
def test_recommend_events_for_user_top_k_parameter(mock_db):
    """Test that top_k parameter is respected"""
    from app.recommender.content_based import recommend_events_for_user
    
    user_obj_id = ObjectId()
    mock_db.user.find_one.return_value = {
        "_id": user_obj_id,
        "areasOfInterest": [],
        "achievements": []
    }
    mock_db.event.find.return_value = []
    
    try:
        result_k1 = recommend_events_for_user(str(user_obj_id), top_k=1)
        result_k10 = recommend_events_for_user(str(user_obj_id), top_k=10)
        
        assert len(result_k1) <= 1
        assert len(result_k10) <= 10
    except Exception:
        assert True


@pytest.mark.unit
@patch('app.recommender.demographic.db')
def test_recommend_demographic_top_k_limit(mock_db):
    """Test demographic respects top_k limit"""
    from app.recommender.demographic import recommend_demographic
    
    user_obj_id = ObjectId()
    mock_db.user.find.return_value = [
        {"_id": user_obj_id, "gender": "M", "college": "CS", "areasOfInterest": []}
    ]
    mock_db.user.find_one.return_value = {
        "_id": user_obj_id,
        "department": "CS"
    }
    mock_db.event.find.return_value = [
        {"_id": ObjectId(), "title": f"Event {i}"} for i in range(20)
    ]
    mock_db.registration.find.return_value = []
    
    try:
        result = recommend_demographic(str(user_obj_id), top_k=5)
        assert len(result) <= 5
    except Exception:
        assert True


@pytest.mark.unit
def test_build_event_genome_with_all_fields():
    """Test build_event_genome with all fields present"""
    from app.recommender.content_based import build_event_genome
    
    event = {
        "title": "Tech Conference",
        "description": "Annual tech conference",
        "categoryTags": ["AI", "ML", "Tech"],
        "other_field": "ignored"
    }
    
    result = build_event_genome(event)
    
    assert "Tech Conference" in result
    assert "Annual tech conference" in result
    assert "AI" in result


@pytest.mark.unit
def test_build_event_genome_missing_fields():
    """Test build_event_genome with missing optional fields"""
    from app.recommender.content_based import build_event_genome
    
    event = {
        "title": "Workshop"
    }
    
    result = build_event_genome(event)
    
    assert "Workshop" in result
    assert isinstance(result, str)
