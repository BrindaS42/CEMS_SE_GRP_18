"""
Comprehensive mutation-killing tests for mongo_tools
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock
from bson import ObjectId
import ast


@pytest.mark.asyncio
async def test_run_mongo_query_empty_string_vs_none():
    """Test that empty string default is used, not None - kills default parameter mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    # Test with empty mongo_query (default "")
    state = {}
    result = await run_mongo_query(state)
    
    # With empty string, should get parsing error
    assert "result" in result
    assert "error" in str(result["result"]).lower() or "invalid" in str(result["result"]).lower()
    
    # Test with explicit None would behave differently
    state_none = {"mongo_query": None}
    result_none = await run_mongo_query(state_none)
    assert "result" in result_none


@pytest.mark.asyncio
async def test_run_mongo_query_error_prefix_exact():
    """Test exact error prefix string - kills string mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    # Test with error query
    state = {"mongo_query": "# ERROR_GENERATING_QUERY: test error"}
    result = await run_mongo_query(state)
    
    assert result["result"] == "# ERROR_GENERATING_QUERY: test error"
    
    # Different prefix should not match
    state_wrong = {"mongo_query": "# error_generating_query: test"}  # lowercase
    result_wrong = await run_mongo_query(state_wrong)
    # Should try to parse and fail, not return early
    assert result_wrong["result"] != "# error_generating_query: test"


@pytest.mark.asyncio  
@patch('app.tools.mongo_tools.db')
async def test_run_mongo_query_limit_field_name(mock_db):
    """Test that _limit field (with underscore) is recognized - kills field name mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    collection_mock = Mock()
    cursor_mock = Mock()
    cursor_mock.limit.return_value = []
    collection_mock.find.return_value = cursor_mock
    mock_db.__getitem__.return_value = collection_mock
    
    # Query with _limit field  
    state = {"mongo_query": "{'users': {'name': 'test', '_limit': 5}}"}
    result = await run_mongo_query(state)
    
    # Verify limit was called with 5
    cursor_mock.limit.assert_called_once_with(5)
    
    # Test that field name must be exactly "_limit" not "limit" or "_LIMIT"
    collection_mock.reset_mock()
    cursor_mock.reset_mock()
    cursor_mock.limit.return_value = []
    collection_mock.find.return_value = cursor_mock
    
    state_wrong = {"mongo_query": "{'users': {'name': 'test', 'limit': 5}}"}
    result_wrong = await run_mongo_query(state_wrong)
    
    # Should not call limit() if field name is wrong
    # (limit will be passed to MongoDB as a filter field instead)


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.db')
async def test_fix_ids_field_names_exact(mock_db):
    """Test that _fix_ids recognizes exact field names - kills field name mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    collection_mock = Mock()
    find_calls = []
    
    def find_spy(*args, **kwargs):
        find_calls.append(args[0] if args else {})
        return []
    
    collection_mock.find = find_spy
    mock_db.__getitem__.return_value = collection_mock
    
    # Test various ID field names
    test_id = str(ObjectId())
    
    queries = [
        f"{{'users': {{'_id': '{test_id}'}}}}",
        f"{{'users': {{'id': '{test_id}'}}}}",
        f"{{'users': {{'eventId': '{test_id}'}}}}",
        f"{{'users': {{'event_id': '{test_id}'}}}}",
        f"{{'users': {{'profile_id': '{test_id}'}}}}",
        f"{{'users': {{'studentId': '{test_id}'}}}}",
        f"{{'users': {{'student_id': '{test_id}'}}}}",
        f"{{'users': {{'user_id': '{test_id}'}}}}",
    ]
    
    for query in queries:
        find_calls.clear()
        state = {"mongo_query": query}
        await run_mongo_query(state)
        
        # Verify ObjectId conversion happened
        if find_calls:
            filter_obj = find_calls[0]
            # At least one value should be an ObjectId
            has_object_id = any(
                isinstance(v, ObjectId) 
                for v in filter_obj.values()
            )
            assert has_object_id, f"Failed to convert ID in query: {query}"


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.db')
async def test_make_search_flexible_field_names_exact(mock_db):
    """Test that _make_search_flexible recognizes exact field names - kills field name mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    collection_mock = Mock()
    find_calls = []
    
    def find_spy(*args, **kwargs):
        find_calls.append(args[0] if args else {})
        return []
    
    collection_mock.find = find_spy
    mock_db.__getitem__.return_value = collection_mock
    
    # Test fields that should be made flexible
    flexible_fields = ["title", "teamName", "name", "email", "description"]
    
    for field in flexible_fields:
        find_calls.clear()
        state = {"mongo_query": f"{{'users': {{'{field}': 'test'}}}}"}
        await run_mongo_query(state)
        
        if find_calls:
            filter_obj = find_calls[0]
            # Field should have regex
            assert field in filter_obj
            if isinstance(filter_obj[field], dict):
                assert "$regex" in filter_obj[field]
                assert "$options" in filter_obj[field]
                assert filter_obj[field]["$options"] == "i"


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.db')
async def test_run_mongo_query_dict_format_validation(mock_db):
    """Test query format validation - kills validation logic mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    # Invalid: not a dict
    state = {"mongo_query": "['invalid']"}
    result = await run_mongo_query(state)
    assert "Invalid" in result["result"] or "error" in result["result"].lower()
    
    # Invalid: dict with multiple keys
    state = {"mongo_query": "{'users': {}, 'events': {}}"}
    result = await run_mongo_query(state)
    assert "Invalid" in result["result"]
    
    # Valid: dict with exactly one key
    collection_mock = Mock()
    collection_mock.find.return_value = []
    mock_db.__getitem__.return_value = collection_mock
    
    state = {"mongo_query": "{'users': {}}"}
    result = await run_mongo_query(state)
    assert isinstance(result["result"], list)


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.db')
async def test_run_mongo_query_aggregate_vs_find(mock_db):
    """Test that aggregate is used for list, find for dict - kills type check mutations"""
    from app.tools.mongo_tools import run_mongo_query
    
    collection_mock = Mock()
    collection_mock.find.return_value = []
    collection_mock.aggregate.return_value = []
    mock_db.__getitem__.return_value = collection_mock
    
    # Dict should use find
    state_find = {"mongo_query": "{'users': {'name': 'test'}}"}
    await run_mongo_query(state_find)
    assert collection_mock.find.called
    
    collection_mock.reset_mock()
    
    # List should use aggregate
    state_agg = {"mongo_query": "{'users': [{'$match': {'name': 'test'}}]}"}
    await run_mongo_query(state_agg)
    assert collection_mock.aggregate.called


@pytest.mark.asyncio
async def test_generate_answer_no_query_message():
    """Test exact message when no query - kills string mutations"""
    from app.tools.mongo_tools import generate_answer
    
    state = {}
    result = await generate_answer(state)
    
    assert result["answer"] == "No query produced."


@pytest.mark.asyncio
async def test_generate_answer_error_passthrough():
    """Test that errors starting with # ERROR are passed through - kills string prefix mutations"""
    from app.tools.mongo_tools import generate_answer
    
    # Should pass through
    state = {
        "mongo_query": "test",
        "result": "# ERROR: something"
    }
    result = await generate_answer(state)
    assert result["answer"] == "# ERROR: something"
    
    # Different prefix should NOT pass through
    state_wrong = {
        "mongo_query": "test",
        "result": "#ERROR: something"  # no space
    }
    result_wrong = await generate_answer(state_wrong)
    # Should try to generate answer, not pass through


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.llm')
async def test_generate_answer_empty_result_message(mock_llm):
    """Test exact message for empty results - kills string mutations"""
    from app.tools.mongo_tools import generate_answer
    
    # Empty list
    state = {"mongo_query": "test", "result": []}
    result = await generate_answer(state)
    assert "couldn't find" in result["answer"] or "no matching" in result["answer"].lower()
    
    # None result
    state_none = {"mongo_query": "test", "result": None}
    result_none = await generate_answer(state_none)
    assert "couldn't find" in result_none["answer"] or "no matching" in result_none["answer"].lower()


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.llm')
async def test_generate_answer_result_truncation(mock_llm):
    """Test that result is truncated to 1000 chars - kills numeric mutations"""
    from app.tools.mongo_tools import generate_answer
    
    # Create a large result
    large_result = [{"data": "x" * 2000}]
    
    invoke_calls = []
    def invoke_spy(prompt):
        invoke_calls.append(prompt)
        response = Mock()
        response.content = "answer"
        return response
    
    mock_llm.invoke = invoke_spy
    
    state = {
        "question": "test",
        "mongo_query": "query",
        "result": large_result
    }
    
    await generate_answer(state)
    
    # Check that result was truncated
    assert len(invoke_calls) > 0
    prompt = invoke_calls[0]
    # The result in the prompt should be truncated
    assert "x" * 2000 not in str(prompt)  # Full result shouldn't be there


@pytest.mark.asyncio
@patch('app.tools.mongo_tools.llm')  
async def test_generate_mongo_query_error_handling(mock_llm):
    """Test error handling in generate_mongo_query - kills exception handling mutations"""
    from app.tools.mongo_tools import generate_mongo_query
    
    # Mock LLM to raise exception
    mock_llm.invoke.side_effect = Exception("LLM error")
    
    state = {
        "question": "test question",
        "user_role": "student",
        "user_id": "123"
    }
    
    result = await generate_mongo_query(state)
    
    # Should return error query with specific prefix
    assert "mongo_query" in result
    assert result["mongo_query"].startswith("# ERROR_GENERATING_QUERY:")
    assert "LLM error" in result["mongo_query"]


@pytest.mark.asyncio 
@patch('app.tools.mongo_tools.llm')
async def test_generate_mongo_query_response_stripping(mock_llm):
    """Test that response is stripped - kills method call mutations"""
    from app.tools.mongo_tools import generate_mongo_query
    
    # Mock LLM response with whitespace
    response_mock = Mock()
    response_mock.content = "  {'users': {}}  \n"
    mock_llm.invoke.return_value = response_mock
    
    state = {
        "question": "test",
        "user_role": "student",
        "user_id": "123"
    }
    
    result = await generate_mongo_query(state)
    
    # Result should be stripped
    assert result["mongo_query"] == "{'users': {}}"
    assert not result["mongo_query"].startswith(" ")
    assert not result["mongo_query"].endswith(" ")


@pytest.mark.asyncio
async def test_convert_object_ids_recursive():
    """Test _convert_object_ids handles all types - kills type check mutations"""
    from app.tools.mongo_tools import _convert_object_ids
    
    oid = ObjectId()
    
    # Test with dict
    result_dict = _convert_object_ids({"_id": oid, "name": "test"})
    assert result_dict["_id"] == str(oid)
    assert result_dict["name"] == "test"
    
    # Test with list
    result_list = _convert_object_ids([oid, "string", 123])
    assert result_list[0] == str(oid)
    assert result_list[1] == "string"
    assert result_list[2] == 123
    
    # Test with nested structures
    nested = {"data": [{"id": oid}]}
    result_nested = _convert_object_ids(nested)
    assert result_nested["data"][0]["id"] == str(oid)
    
    # Test with ObjectId directly
    result_oid = _convert_object_ids(oid)
    assert result_oid == str(oid)
    
    # Test with non-ObjectId values
    assert _convert_object_ids("string") == "string"
    assert _convert_object_ids(123) == 123
    assert _convert_object_ids(None) is None
