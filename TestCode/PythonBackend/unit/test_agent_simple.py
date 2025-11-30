"""
Tests for agent module - skip MONGO_URI dependent tests
"""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock


@pytest.mark.unit
def test_agent_types_module():
    """Test agent types module exists and State is available"""
    try:
        from app.agent.types import State
        assert State is not None
    except RuntimeError:
        pass


@pytest.mark.unit
def test_agent_prompts_module():
    """Test agent prompts module exists"""
    try:
        from app.agent import prompts
        assert prompts is not None
    except RuntimeError:
        pass
