import ast
from bson import ObjectId
from typing import Dict, Any
from app.agent.types import State, QueryOutput
from app.agent.prompts import query_prompt_template
from app.config.mongo import db
from app.config.llm import llm 
import traceback

def _convert_object_ids(obj):
    """Recursively convert ObjectIds to str for JSON-safe output."""
    if isinstance(obj, list):
        return [_convert_object_ids(i) for i in obj]
    if isinstance(obj, dict):
        return {k: _convert_object_ids(v) for k, v in obj.items()}
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj
        
def _make_search_flexible(o):
    """Recursively convert simple string matches on key fields to case-insensitive regex."""
    if isinstance(o, dict):
        for k, v in list(o.items()):
            if k in ("title", "teamName", "name", "email", "description") and isinstance(v, str):
                if not v.startswith("$") and not isinstance(o.get(k), dict):
                    o[k] = {"$regex": v, "$options": "i"}
            else:
                _make_search_flexible(v)
    elif isinstance(o, list):
        for i in o:
            _make_search_flexible(i)

def _fix_ids(o):
    if isinstance(o, dict):
        for k, v in list(o.items()):
            if k in ("_id", "id", "eventId", "event_id", "profile_id", "studentId", "student_id", "user_id") and isinstance(v, str):
                try:
                    o[k] = ObjectId(v)
                except Exception:
                    pass
            else:
                _fix_ids(v)
    elif isinstance(o, list):
        for i in o:
            _fix_ids(i)

async def generate_mongo_query(state: State) -> State:
    """Ask LLM to generate a mongo_query string."""
    try:
        prompt = query_prompt_template.format_messages(input=state["question"], user_role=state["user_role"], user_id=state["user_id"])
        
        response = llm.invoke(prompt)        
        mongo_query = response.content.strip()
        return {**state, "mongo_query": mongo_query}
    except Exception as e:
        traceback.print_exc()
        return {**state, "mongo_query": f"# ERROR_GENERATING_QUERY: {str(e)}"}

async def run_mongo_query(state: State) -> State:
    """
    Parse the LLM string, run the query (find OR aggregate),
    and store the result as a JSON-serializable list.
    """
    try:
        raw = state.get("mongo_query", "")
        if raw.startswith("# ERROR_GENERATING_QUERY"):
            return {**state, "result": raw}

        parsed = ast.literal_eval(raw)
        if not isinstance(parsed, dict) or len(parsed.keys()) != 1:
            return {**state, "result": "Invalid query format. Expected: {'collection': ...}"}

        collection_name = list(parsed.keys())[0]
        query_data = parsed[collection_name]
        print(f"Mongo Collection: {collection_name}")
        print(f"Mongo Query: {query_data}")



        docs = []

        if isinstance(query_data, dict):
            filter_query = query_data
            
            _make_search_flexible(filter_query)
            print(f"Flexible Find Query: {filter_query}")
            
            _fix_ids(filter_query)

            limit = None
            if isinstance(filter_query, dict) and "_limit" in filter_query:
                limit = int(filter_query.pop("_limit"))

            cursor = db[collection_name].find(filter_query)
            if limit:
                cursor = cursor.limit(limit)
            docs = list(cursor)

        elif isinstance(query_data, list):
            pipeline = query_data
            
            _fix_ids(pipeline)
            print(f"Aggregate Pipeline: {pipeline}")

            cursor = db[collection_name].aggregate(pipeline)
            docs = list(cursor)

        else:
            return {**state, "result": "Invalid query data. Expected a dict or list."}
        
        docs_safe = _convert_object_ids(docs)
        print(f"Mongo Docs Retrieved: {docs_safe[:2]}... (total {len(docs_safe)})")
        return {**state, "result": docs_safe}
        
    except Exception as e:
        traceback.print_exc()
        return {**state, "result": f"Mongo execution error: {str(e)}"}

async def generate_answer(state: State) -> State:
    """Use LLM to convert query + result into a friendly answer."""
    try:
        if "mongo_query" not in state:
            return {**state, "answer": "No query produced."}
        
        result = state.get("result")
        
        if isinstance(result, str) and (result.startswith("# ERROR")):
            return {**state, "answer": result}
        
        if not result or (isinstance(result, list) and len(result) == 0):
             return {**state, "answer": "I searched the database but couldn't find any matching data for that query."}
        
        

        prompt_text = (
            f"User Question: {state.get('question')}\n\n"
            f"Mongo Query: {state.get('mongo_query')}\n\n"
            f"Mongo Result: {result}\n\n"
            "Instructions:\n"
            "1. Answer the user clearly based ONLY on the Mongo Result provided.\n"
            "2. If the result is a list of documents, analyze the entire structure (including nested fields like 'timeline' or 'config').\n"
            "3. Summarize key details relevant to the question.\n"
            "4. If the retrieved data does not answer the specific question, state 'No relevant data found'."
        )
        response = llm.invoke(prompt_text)
        answer = getattr(response, "content", None) or str(response)
        print(f"Final Answer: {answer}")
        return {**state, "answer": answer.strip()}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {**state, "answer": f"Failed to generate answer: {str(e)}"}