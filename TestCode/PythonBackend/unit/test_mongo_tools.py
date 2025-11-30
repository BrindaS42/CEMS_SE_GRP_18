import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from app.tools.mongo_tools import (
    _convert_object_ids,
    _make_search_flexible,
    _fix_ids,
    generate_mongo_query,
    run_mongo_query,
    generate_answer,
)
from app.agent.types import State
from bson import ObjectId


@pytest.mark.unit
class TestConvertObjectIds:
    """Test _convert_object_ids function."""
    
    def test_convert_single_object_id(self):
        """Test converting a single ObjectId to string."""
        obj_id = ObjectId()
        result = _convert_object_ids(obj_id)
        assert isinstance(result, str)
        assert result == str(obj_id)
    
    def test_convert_dict_with_object_id(self):
        """Test converting dict containing ObjectId."""
        obj_id = ObjectId()
        obj = {"_id": obj_id, "name": "test"}
        result = _convert_object_ids(obj)
        assert result["_id"] == str(obj_id)
        assert result["name"] == "test"
    
    def test_convert_nested_dict_with_object_id(self):
        """Test converting nested dict with ObjectId."""
        obj_id = ObjectId()
        obj = {"user": {"_id": obj_id, "name": "test"}}
        result = _convert_object_ids(obj)
        assert result["user"]["_id"] == str(obj_id)
        assert result["user"]["name"] == "test"
    
    def test_convert_list_with_object_id(self):
        """Test converting list containing ObjectId."""
        obj_id1 = ObjectId()
        obj_id2 = ObjectId()
        obj = [{"_id": obj_id1}, {"_id": obj_id2}]
        result = _convert_object_ids(obj)
        assert result[0]["_id"] == str(obj_id1)
        assert result[1]["_id"] == str(obj_id2)
    
    def test_convert_list_of_object_ids(self):
        """Test converting list of ObjectIds."""
        obj_id1 = ObjectId()
        obj_id2 = ObjectId()
        result = _convert_object_ids([obj_id1, obj_id2])
        assert result[0] == str(obj_id1)
        assert result[1] == str(obj_id2)
    
    def test_convert_string_unchanged(self):
        """Test that strings are unchanged."""
        result = _convert_object_ids("test_string")
        assert result == "test_string"
    
    def test_convert_number_unchanged(self):
        """Test that numbers are unchanged."""
        result = _convert_object_ids(42)
        assert result == 42
    
    def test_convert_empty_dict(self):
        """Test converting empty dict."""
        result = _convert_object_ids({})
        assert result == {}
    
    def test_convert_empty_list(self):
        """Test converting empty list."""
        result = _convert_object_ids([])
        assert result == []


@pytest.mark.unit
class TestMakeSearchFlexible:
    """Test _make_search_flexible function."""
    
    def test_make_title_flexible(self):
        """Test making title field case-insensitive."""
        query = {"title": "Test Event"}
        _make_search_flexible(query)
        assert "$regex" in query["title"]
        assert "$options" in query["title"]
        assert query["title"]["$options"] == "i"
    
    def test_make_team_name_flexible(self):
        """Test making teamName field case-insensitive."""
        query = {"teamName": "Test Team"}
        _make_search_flexible(query)
        assert "$regex" in query["teamName"]
        assert "$options" in query["teamName"]
    
    def test_make_name_flexible(self):
        """Test making name field case-insensitive."""
        query = {"name": "Test Name"}
        _make_search_flexible(query)
        assert "$regex" in query["name"]
        assert "$options" in query["name"]
    
    def test_make_email_flexible(self):
        """Test making email field case-insensitive."""
        query = {"email": "test@example.com"}
        _make_search_flexible(query)
        assert "$regex" in query["email"]
        assert "$options" in query["email"]
    
    def test_make_description_flexible(self):
        """Test making description field case-insensitive."""
        query = {"description": "Test Description"}
        _make_search_flexible(query)
        assert "$regex" in query["description"]
        assert "$options" in query["description"]
    
    def test_skip_operator_fields(self):
        """Test that operator fields ($regex, $gt, etc.) are skipped."""
        query = {"title": {"$regex": "test"}}
        _make_search_flexible(query)
        assert query["title"]["$regex"] == "test"
    
    def test_nested_dict_flexible(self):
        """Test making nested dict fields flexible."""
        query = {"user": {"name": "Test"}}
        _make_search_flexible(query)
        assert "$regex" in query["user"]["name"]
    
    def test_list_of_dicts_flexible(self):
        """Test making fields in list of dicts flexible."""
        query = [{"title": "Test"}, {"name": "User"}]
        _make_search_flexible(query)
        assert "$regex" in query[0]["title"]
        assert "$regex" in query[1]["name"]
    
    def test_non_string_fields_unchanged(self):
        """Test that non-string values are not modified."""
        query = {"title": 123}
        _make_search_flexible(query)
        assert query["title"] == 123
    
    def test_other_fields_unchanged(self):
        """Test that other fields remain unchanged."""
        query = {"other_field": "value"}
        _make_search_flexible(query)
        assert query["other_field"] == "value"


@pytest.mark.unit
class TestFixIds:
    """Test _fix_ids function."""
    
    def test_fix_id_field(self):
        """Test fixing _id field to ObjectId."""
        obj_id = ObjectId()
        query = {"_id": str(obj_id)}
        _fix_ids(query)
        assert isinstance(query["_id"], ObjectId)
        assert query["_id"] == obj_id
    
    def test_fix_event_id_field(self):
        """Test fixing eventId field to ObjectId."""
        obj_id = ObjectId()
        query = {"eventId": str(obj_id)}
        _fix_ids(query)
        assert isinstance(query["eventId"], ObjectId)
    
    def test_fix_event_id_underscore_field(self):
        """Test fixing event_id field to ObjectId."""
        obj_id = ObjectId()
        query = {"event_id": str(obj_id)}
        _fix_ids(query)
        assert isinstance(query["event_id"], ObjectId)
    
    def test_fix_student_id_field(self):
        """Test fixing studentId field to ObjectId."""
        obj_id = ObjectId()
        query = {"studentId": str(obj_id)}
        _fix_ids(query)
        assert isinstance(query["studentId"], ObjectId)
    
    def test_fix_user_id_field(self):
        """Test fixing user_id field to ObjectId."""
        obj_id = ObjectId()
        query = {"user_id": str(obj_id)}
        _fix_ids(query)
        assert isinstance(query["user_id"], ObjectId)
    
    def test_fix_nested_ids(self):
        """Test fixing nested ObjectIds."""
        obj_id = ObjectId()
        query = {"user": {"_id": str(obj_id)}}
        _fix_ids(query)
        assert isinstance(query["user"]["_id"], ObjectId)
    
    def test_fix_ids_in_list(self):
        """Test fixing ObjectIds in list."""
        obj_id = ObjectId()
        query = [{"_id": str(obj_id)}]
        _fix_ids(query)
        assert isinstance(query[0]["_id"], ObjectId)
    
    def test_invalid_id_ignored(self):
        """Test that invalid ObjectId strings are ignored."""
        query = {"_id": "invalid_id"}
        _fix_ids(query)
        assert query["_id"] == "invalid_id"
    
    def test_non_string_ids_unchanged(self):
        """Test that non-string IDs are unchanged."""
        obj_id = ObjectId()
        query = {"_id": obj_id}
        _fix_ids(query)
        assert query["_id"] == obj_id


@pytest.mark.unit
@pytest.mark.asyncio
class TestGenerateMongoQuery:
    """Test generate_mongo_query function."""
    
    @patch('app.tools.mongo_tools.llm')
    @patch('app.tools.mongo_tools.query_prompt_template')
    async def test_generate_mongo_query_success(self, mock_template, mock_llm):
        """Test successful mongo query generation."""
        mock_template.format_messages.return_value = "formatted prompt"
        mock_response = MagicMock()
        mock_response.content = "{'collection': {}}"
        mock_llm.invoke.return_value = mock_response
        
        state: State = {
            "question": "Find all events",
            "user_role": "admin",
            "user_id": "123",
        }
        result = await generate_mongo_query(state)
        
        assert "mongo_query" in result
        assert result["mongo_query"] == "{'collection': {}}"
    
    @patch('app.tools.mongo_tools.llm')
    @patch('app.tools.mongo_tools.query_prompt_template')
    async def test_generate_mongo_query_strips_whitespace(self, mock_template, mock_llm):
        """Test that response content is stripped."""
        mock_template.format_messages.return_value = "prompt"
        mock_response = MagicMock()
        mock_response.content = "  {'collection': {}}  \n"
        mock_llm.invoke.return_value = mock_response
        
        state: State = {
            "question": "Find all",
            "user_role": "user",
            "user_id": "456",
        }
        result = await generate_mongo_query(state)
        
        assert result["mongo_query"] == "{'collection': {}}"
    
    @patch('app.tools.mongo_tools.llm')
    @patch('app.tools.mongo_tools.query_prompt_template')
    async def test_generate_mongo_query_error_handling(self, mock_template, mock_llm):
        """Test error handling in query generation."""
        mock_template.format_messages.side_effect = Exception("Template error")
        mock_llm.invoke.side_effect = Exception("LLM error")
        
        state: State = {
            "question": "Find all",
            "user_role": "user",
            "user_id": None,
        }
        result = await generate_mongo_query(state)
        
        assert "mongo_query" in result
        assert "ERROR_GENERATING_QUERY" in result["mongo_query"]


@pytest.mark.unit
@pytest.mark.asyncio
class TestRunMongoQuery:
    """Test run_mongo_query function."""
    
    @patch('app.tools.mongo_tools.db')
    async def test_run_mongo_query_simple_find(self, mock_db):
        """Test running simple find query."""
        mock_collection = MagicMock()
        mock_collection.find.return_value = [{"_id": ObjectId(), "name": "test"}]
        mock_db.__getitem__.return_value = mock_collection
        
        state: State = {
            "mongo_query": "{'events': {'title': 'test'}}",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert isinstance(result["result"], list)
    
    @patch('app.tools.mongo_tools.db')
    async def test_run_mongo_query_with_limit(self, mock_db):
        """Test running query with _limit parameter."""
        mock_collection = MagicMock()
        mock_cursor = MagicMock()
        mock_cursor.limit.return_value = [{"name": "test"}]
        mock_collection.find.return_value = mock_cursor
        mock_db.__getitem__.return_value = mock_collection
        
        state: State = {
            "mongo_query": "{'events': {'title': 'test', '_limit': 5}}",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
    
    @patch('app.tools.mongo_tools.db')
    async def test_run_mongo_query_aggregate(self, mock_db):
        """Test running aggregate query."""
        mock_collection = MagicMock()
        mock_collection.aggregate.return_value = [{"_id": None, "count": 5}]
        mock_db.__getitem__.return_value = mock_collection
        
        state: State = {
            "mongo_query": "{'events': [{'$group': {'_id': None, 'count': {'$sum': 1}}}]}",
            "question": "Count events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert isinstance(result["result"], list)
    
    @pytest.mark.asyncio
    async def test_run_mongo_query_error_query_format(self):
        """Test error handling for invalid query format."""
        state: State = {
            "mongo_query": "invalid json",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert isinstance(result["result"], str)
    
    @pytest.mark.asyncio
    async def test_run_mongo_query_error_generating_query(self):
        """Test handling of ERROR_GENERATING_QUERY result."""
        state: State = {
            "mongo_query": "# ERROR_GENERATING_QUERY: Template error",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert "ERROR_GENERATING_QUERY" in result["result"]
    
    @pytest.mark.asyncio
    async def test_run_mongo_query_invalid_format_single_key(self):
        """Test error handling for queries not matching dict format."""
        state: State = {
            "mongo_query": "{'key1': {}, 'key2': {}}",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert "Invalid query format" in result["result"]
    
    @pytest.mark.asyncio
    async def test_run_mongo_query_invalid_data_type(self):
        """Test error handling for invalid query data type."""
        state: State = {
            "mongo_query": "{'events': 'invalid'}",
            "question": "Find events",
            "user_role": "user",
            "user_id": "123",
        }
        result = await run_mongo_query(state)
        
        assert "result" in result
        assert "Invalid query data" in result["result"]


@pytest.mark.unit
@pytest.mark.asyncio
class TestGenerateAnswer:
    """Test generate_answer function."""
    
    @patch('app.tools.mongo_tools.llm')
    async def test_generate_answer_with_results(self, mock_llm):
        """Test generating answer from query results."""
        mock_response = MagicMock()
        mock_response.content = "The search found 3 events."
        mock_llm.invoke.return_value = mock_response
        
        state: State = {
            "question": "Find all events",
            "mongo_query": "{'events': {}}",
            "result": [{"title": "Event 1"}, {"title": "Event 2"}],
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert result["answer"] == "The search found 3 events."
    
    @patch('app.tools.mongo_tools.llm')
    async def test_generate_answer_with_string_content(self, mock_llm):
        """Test that string response content is handled."""
        mock_response = "Direct string response"
        mock_llm.invoke.return_value = mock_response
        
        state: State = {
            "question": "Find events",
            "mongo_query": "{'events': {}}",
            "result": [{"title": "Event"}],
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
    
    @pytest.mark.asyncio
    async def test_generate_answer_empty_results(self):
        """Test generating answer when no results found."""
        state: State = {
            "question": "Find events",
            "mongo_query": "{'events': {}}",
            "result": [],
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert "couldn't find" in result["answer"]
    
    @pytest.mark.asyncio
    async def test_generate_answer_none_results(self):
        """Test generating answer when result is None."""
        state: State = {
            "question": "Find events",
            "mongo_query": "{'events': {}}",
            "result": None,
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert "couldn't find" in result["answer"]
    
    @pytest.mark.asyncio
    async def test_generate_answer_error_result(self):
        """Test handling error result from mongo query."""
        state: State = {
            "question": "Find events",
            "mongo_query": "{'events': {}}",
            "result": "# ERROR: Connection failed",
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert "# ERROR" in result["answer"]
    
    @pytest.mark.asyncio
    async def test_generate_answer_missing_mongo_query(self):
        """Test handling missing mongo_query in state."""
        state: State = {
            "question": "Find events",
            "result": [{"title": "Event"}],
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert "No query produced" in result["answer"]
    
    @patch('app.tools.mongo_tools.llm')
    async def test_generate_answer_exception_handling(self, mock_llm):
        """Test exception handling during answer generation."""
        mock_llm.invoke.side_effect = Exception("LLM error")
        
        state: State = {
            "question": "Find events",
            "mongo_query": "{'events': {}}",
            "result": [{"title": "Event"}],
            "user_role": "user",
            "user_id": "123",
        }
        result = await generate_answer(state)
        
        assert "answer" in result
        assert "Failed to generate answer" in result["answer"]
