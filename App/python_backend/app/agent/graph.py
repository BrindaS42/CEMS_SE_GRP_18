from langgraph.graph import StateGraph, END
from app.agent.types import State
from app.tools.mongo_tools import generate_mongo_query, run_mongo_query, generate_answer

async def chat_agent(question: str, user_role: str, user_id: str) -> str:
    builder = StateGraph(State)

    builder.add_node("generate_mongo_query", generate_mongo_query)
    builder.add_node("run_mongo_query", run_mongo_query)
    builder.add_node("generate_answer", generate_answer)

    builder.set_entry_point("generate_mongo_query")
    builder.add_edge("generate_mongo_query", "run_mongo_query")
    builder.add_edge("run_mongo_query", "generate_answer")
    builder.add_edge("generate_answer", END)

    graph = builder.compile()

    result = await graph.ainvoke({"question": question, "user_role": user_role, "user_id": user_id if user_id else None})
    return result.get("answer", "No answer generated.")
