from typing_extensions import TypedDict, Annotated

class State(TypedDict, total=False):
    question: str
    user_role: str
    user_id: str
    mongo_query: str
    result: str
    answer: str

class QueryOutput(TypedDict):
    """The LLM must return a string containing a Python-dict-style query."""
    mongo_query: Annotated[str, ..., "A valid Python dict string describing the Mongo query"]
