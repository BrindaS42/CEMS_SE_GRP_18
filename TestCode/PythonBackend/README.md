# Python Backend Unit Tests with Pytest

This directory contains comprehensive unit and integration tests for the Python backend using pytest.

## Directory Structure

```
tests/
├── conftest.py                 # Shared pytest fixtures
├── unit/                       # Unit tests
│   ├── test_main.py           # Tests for main app
│   ├── test_recommender_router.py
│   └── test_bot_router.py
└── integration/               # Integration tests
    └── test_app_integration.py
```

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

The following testing dependencies are required:
- `pytest` - Testing framework
- `pytest-asyncio` - For async test support
- `pytest-cov` - For code coverage reports
- `httpx` - For test client

### 2. Configuration

The `pytest.ini` file contains the pytest configuration with:
- Test discovery patterns
- Coverage settings
- Custom markers (unit, integration, slow)
- Async mode configuration

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Only Unit Tests
```bash
pytest -m unit
```

### Run Only Integration Tests
```bash
pytest -m integration
```

### Run with Verbose Output
```bash
pytest -v
```

### Run with Coverage Report
```bash
pytest --cov=app --cov-report=html
```

This generates an HTML coverage report in `htmlcov/index.html`

### Run Specific Test File
```bash
pytest tests/unit/test_main.py
```

### Run Specific Test Function
```bash
pytest tests/unit/test_main.py::test_root_endpoint
```

### Run Tests Excluding Slow Tests
```bash
pytest -m "not slow"
```

### Run with Different Verbosity Levels
```bash
pytest -v          # Verbose
pytest -vv         # Very verbose
pytest -q          # Quiet
```

## Test Structure

### Unit Tests
Located in `tests/unit/`, these test individual components in isolation using mocks:
- `test_main.py` - Tests main app initialization and root endpoint
- `test_recommender_router.py` - Tests recommendation endpoints with mocked services
- `test_bot_router.py` - Tests bot endpoints with mocked chat agent

### Integration Tests
Located in `tests/integration/`, these test multiple components together:
- `test_app_integration.py` - Tests app startup and endpoint availability

## Fixtures

Common fixtures available in `conftest.py`:

- **`client`** - FastAPI TestClient for making requests
- **`mock_db`** - Mock database connection
- **`sample_event_data`** - Sample event data for testing
- **`sample_user_data`** - Sample user data for testing

## Adding New Tests

### Example Unit Test
```python
@pytest.mark.unit
def test_new_feature(client):
    """Test description"""
    response = client.get("/endpoint")
    assert response.status_code == 200
    assert response.json() == {"expected": "response"}
```

### Example with Mocking
```python
from unittest.mock import patch

@pytest.mark.unit
def test_with_mock(client):
    """Test with mocked service"""
    with patch('module.function') as mock_func:
        mock_func.return_value = {"mocked": "value"}
        response = client.get("/endpoint")
        assert response.status_code == 200
```

### Example Async Test
```python
@pytest.mark.asyncio
@pytest.mark.unit
async def test_async_function(client):
    """Test async function"""
    response = client.post("/async-endpoint", json={"data": "test"})
    assert response.status_code == 200
```

## Coverage Report

After running tests with coverage:
```bash
pytest --cov=app --cov-report=html
```

Open `htmlcov/index.html` in a browser to view detailed coverage information.

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: pytest --cov=app --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.xml
```

## Debugging Tests

### Print Debug Information
```python
import pytest

@pytest.mark.unit
def test_with_debug(client, capsys):
    """Test with debug output"""
    print("Debug message")
    response = client.get("/endpoint")
    assert response.status_code == 200
    # Captured output visible with pytest -s
```

### Run with Print Statements Visible
```bash
pytest -s
```

### Run with Python Debugger
```bash
pytest --pdb
```

## Best Practices

1. **Use Markers** - Tag tests appropriately with `@pytest.mark.unit` or `@pytest.mark.integration`
2. **Use Fixtures** - Leverage conftest.py fixtures for common setup
3. **Mock External Services** - Use `unittest.mock` to isolate units under test
4. **Clear Names** - Use descriptive test names that explain what is being tested
5. **Keep Tests Independent** - Tests should not depend on each other's state
6. **Test Happy Paths and Edge Cases** - Include both success and error scenarios

## Troubleshooting

### Tests Not Found
Ensure test files follow the pattern `test_*.py` and test functions start with `test_`

### Async Tests Failing
Make sure `pytest-asyncio` is installed and you're using `@pytest.mark.asyncio`

### Import Errors
Ensure `app/` directory has an `__init__.py` file (it should be auto-created)

## Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
- [Unittest.mock Documentation](https://docs.python.org/3/library/unittest.mock.html)
