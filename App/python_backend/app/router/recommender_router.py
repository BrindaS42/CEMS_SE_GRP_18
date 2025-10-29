from fastapi import APIRouter
from app.recommender.content_based import (
    index_all_events, add_event, delete_event, recommend_events_for_user
)
from app.recommender.hybrid import recommend_hybrid
from app.recommender.content_based import convert_object_ids

router = APIRouter(prefix="/recommend", tags=["Recommendation"])

@router.post("/rebuild")
def rebuild_index():
    index_all_events()
    return {"status": "ok"}

@router.post("/add/{event_id}")
def add(event_id: str):
    add_event(event_id)
    return {"added": event_id}

@router.delete("/delete/{event_id}")
def delete(event_id: str):
    delete_event(event_id)
    return {"deleted": event_id}

@router.get("/user/{profile_id}")
def get_recommendations(profile_id: str, top_k: int = 5):
    events = recommend_events_for_user(profile_id, top_k)
    return {"recommendations": events}

@router.get("/hybrid/{profile_id}")
def hybrid_recommend(profile_id: str, top_k: int = 5):
    results = recommend_hybrid(profile_id, top_k)
    return {"recommendations": convert_object_ids(results)}