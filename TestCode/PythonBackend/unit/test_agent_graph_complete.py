"""
Exhaustive mutation-killing tests for agent graph
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock, MagicMock


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
@patch('app.agent.graph.generate_mongo_query')
@patch('app.agent.graph.run_mongo_query')
@patch('app.agent.graph.generate_answer')
async def test_chat_agent_builder_initialization(mock_answer, mock_run, mock_gen, mock_graph_class):
    """Test StateGraph is initialized with State"""
    from app.agent.graph import chat_agent, State
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={"answer": "test"})
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    await chat_agent("test", "student", "123")
    
    # Verify StateGraph was called with State class
    mock_graph_class.assert_called_once_with(State)


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_node_names_exact(mock_graph_class):
    """Test exact node names"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    add_node_calls = []
    def track_add_node(name, func):
        add_node_calls.append(name)
    mock_builder.add_node = track_add_node
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={"answer": "test"})
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    await chat_agent("test", "student", "123")
    
    # Verify exact node names
    assert "generate_mongo_query" in add_node_calls
    assert "run_mongo_query" in add_node_calls
    assert "generate_answer" in add_node_calls


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_entry_point_exact(mock_graph_class):
    """Test entry point is exactly generate_mongo_query"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    set_entry_calls = []
    def track_entry(name):
        set_entry_calls.append(name)
    mock_builder.set_entry_point = track_entry
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={"answer": "test"})
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    await chat_agent("test", "student", "123")
    
    assert set_entry_calls[0] == "generate_mongo_query"


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_edges_exact(mock_graph_class):
    """Test exact edge connections"""
    from app.agent.graph import chat_agent, END
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    edge_calls = []
    def track_edge(from_node, to_node):
        edge_calls.append((from_node, to_node))
    mock_builder.add_edge = track_edge
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={"answer": "test"})
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    await chat_agent("test", "student", "123")
    
    # Verify exact edges
    assert ("generate_mongo_query", "run_mongo_query") in edge_calls
    assert ("run_mongo_query", "generate_answer") in edge_calls
    assert ("generate_answer", END) in edge_calls


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_state_keys_exact(mock_graph_class):
    """Test exact state keys passed"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    invoke_calls = []
    async def track_invoke(state):
        invoke_calls.append(state)
        return {"answer": "test"}
    mock_graph.ainvoke = track_invoke
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    await chat_agent("my question", "admin", "user456")
    
    assert len(invoke_calls) > 0
    state = invoke_calls[0]
    assert state["question"] == "my question"
    assert state["user_role"] == "admin"
    assert state["user_id"] == "user456"


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_none_user_id_handling(mock_graph_class):
    """Test None user_id converts to None not empty string"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    invoke_calls = []
    async def track_invoke(state):
        invoke_calls.append(state)
        return {"answer": "test"}
    mock_graph.ainvoke = track_invoke
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    # Test with None
    await chat_agent("test", "student", None)
    assert invoke_calls[0]["user_id"] is None
    
    # Test with empty string
    invoke_calls.clear()
    await chat_agent("test", "student", "")
    assert invoke_calls[0]["user_id"] is None


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_answer_key_exact(mock_graph_class):
    """Test answer key is exactly 'answer'"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={"answer": "my response"})
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    result = await chat_agent("test", "student", "123")
    
    assert result == "my response"


@pytest.mark.asyncio
@patch('app.agent.graph.StateGraph')
async def test_chat_agent_default_answer_exact(mock_graph_class):
    """Test default answer is exact string"""
    from app.agent.graph import chat_agent
    
    mock_builder = Mock()
    mock_builder.add_node = Mock()
    mock_builder.set_entry_point = Mock()
    mock_builder.add_edge = Mock()
    mock_graph = AsyncMock()
    mock_graph.ainvoke = AsyncMock(return_value={})  # No answer key
    mock_builder.compile = Mock(return_value=mock_graph)
    mock_graph_class.return_value = mock_builder
    
    result = await chat_agent("test", "student", "123")
    
    assert result == "No answer generated."
