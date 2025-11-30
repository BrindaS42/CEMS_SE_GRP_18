"""Tests to improve code coverage for uncovered lines"""
import pytest
from unittest.mock import patch, MagicMock
from bson import ObjectId


class TestContentBasedConverter:
    """Tests for convert_object_ids function"""
    
    @pytest.mark.unit
    def test_convert_object_ids_with_list(self):
        """Test convert_object_ids with list"""
        from app.recommender.content_based import convert_object_ids
        
        obj_id = ObjectId()
        input_data = [obj_id, "string"]
        result = convert_object_ids(input_data)
        
        assert isinstance(result, list)
        assert result[0] == str(obj_id)
        assert result[1] == "string"
    
    @pytest.mark.unit
    def test_convert_object_ids_with_dict(self):
        """Test convert_object_ids with dict"""
        from app.recommender.content_based import convert_object_ids
        
        obj_id = ObjectId()
        input_data = {"_id": obj_id, "name": "test"}
        result = convert_object_ids(input_data)
        
        assert isinstance(result, dict)
        assert result["_id"] == str(obj_id)
        assert result["name"] == "test"
    
    @pytest.mark.unit
    def test_convert_object_ids_nested(self):
        """Test convert_object_ids with nested structures"""
        from app.recommender.content_based import convert_object_ids
        
        obj_id = ObjectId()
        input_data = {
            "_id": obj_id,
            "nested": {
                "id": obj_id,
                "items": [obj_id, "string"]
            }
        }
        result = convert_object_ids(input_data)
        
        assert result["_id"] == str(obj_id)
        assert result["nested"]["id"] == str(obj_id)
        assert result["nested"]["items"][0] == str(obj_id)
    
    @pytest.mark.unit
    def test_convert_object_ids_with_primitives(self):
        """Test convert_object_ids with primitive types"""
        from app.recommender.content_based import convert_object_ids
        
        input_data = 42
        result = convert_object_ids(input_data)
        assert result == 42
        
        input_data = "string"
        result = convert_object_ids(input_data)
        assert result == "string"


class TestContentBasedRecommender:
    """Tests for content-based recommender functions"""
    
    @pytest.mark.unit
    @patch('app.recommender.content_based.db')
    @patch('app.recommender.content_based.qdrant_client')
    def test_recommend_events_for_user_no_results(self, mock_qdrant, mock_db):
        """Test recommend_events_for_user with no search results"""
        from app.recommender.content_based import recommend_events_for_user
        
        user_id = ObjectId()
        mock_db.user.find_one.return_value = {
            "_id": user_id,
            "areasOfInterest": ["tech"],
            "achievements": []
        }
        mock_qdrant.search.return_value = []
        
        result = recommend_events_for_user(str(user_id), top_k=5)
        assert isinstance(result, list)
        assert len(result) == 0


class TestCollaborativeRecommender:
    """Tests for collaborative filtering"""
    
    @pytest.mark.unit
    @patch('app.recommender.collaborative.db')
    def test_recommend_collaborative_empty_data(self, mock_db):
        """Test recommend_collaborative when no users found"""
        from app.recommender.collaborative import recommend_collaborative
        
        mock_db.user.find.return_value = []
        mock_db.event.find.return_value = []
        
        result = recommend_collaborative("123")
        assert result == []
