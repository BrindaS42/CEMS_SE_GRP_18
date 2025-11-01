from fastapi import APIRouter, HTTPException, Request
from app.agent.graph import chat_agent

router = APIRouter(prefix="/bot", tags=["bot"])

@router.get("/")
async def check():
    return {"message": "CEMS Mongo Chat Bot is alive"}

@router.post("/query")
async def query_bot(request: Request):
    payload = await request.json()
    question = payload.get("question")
    user_role = payload.get("user_role")
    user_id = payload.get("user_id")
    if not question:
        raise HTTPException(status_code=400, detail="Missing 'question' in request body.")
    try:
        answer = await chat_agent(question, user_role, user_id)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
